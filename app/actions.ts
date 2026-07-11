"use server";
import { z } from "zod";
import { businessSchema, userProfileSchema } from "@/lib/schemas";
import { UTApi } from "uploadthing/server";
import { db } from "@/lib/db";
import { EventType, Role, LayoutType, PlanType, Prisma } from "@prisma/client";
import { hash, compare } from "bcryptjs";
import { cookies } from "next/headers";
import { revalidatePath, unstable_cache } from "next/cache";
import { auth, signIn, signOut } from "@/auth";
import { Resend } from "resend";
import crypto from "crypto";
import { MercadoPagoConfig, PreApproval } from "mercadopago"; // 👈 NOVO IMPORT AQUI
import { normalizeText, isCpfOrCnpjValid } from "@/lib/normalize";
import { CommissionStatus } from "@prisma/client";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

// 🛡️ Rate limiters internos das Actions (proteção independente do middleware)
const actionRedis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const loginRatelimit = actionRedis
  ? new Ratelimit({
      redis: actionRedis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      prefix: "rl_action_login",
    })
  : null;

const registerRatelimit = actionRedis
  ? new Ratelimit({
      redis: actionRedis,
      limiter: Ratelimit.slidingWindow(3, "1 h"),
      prefix: "rl_action_register",
    })
  : null;

const resetRatelimit = actionRedis
  ? new Ratelimit({
      redis: actionRedis,
      limiter: Ratelimit.slidingWindow(3, "1 h"),
      prefix: "rl_action_reset",
    })
  : null;
// 🛡️ RATE LIMIT PARA AÇÕES AUTENTICADAS (Criação e Edição de Lojas)
const storeActionRatelimit = actionRedis
  ? new Ratelimit({
      redis: actionRedis,
      limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 ações por minuto
      prefix: "rl_action_store",
    })
  : null;
// 🚀 NOVO LEÃO DE CHÁCARA: Impede que robôs inundem os lojistas com pedidos
const orderRatelimit = actionRedis
  ? new Ratelimit({
      redis: actionRedis,
      limiter: Ratelimit.slidingWindow(3, "1 m"), // Máximo 3 pedidos por minuto por cliente
      prefix: "rl_action_order",
    })
  : null;
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

const utapi = new UTApi();
const resend = new Resend(process.env.RESEND_API_KEY);

// ==============================================================================
// 1. HELPERS INTERNOS (Proteção e Utilidades)
// ==============================================================================

// 🚀 BLINDAGEM ANTI-PHISHING (Redes Sociais)
// Extrai apenas o nome de usuário (mesmo que o hacker mande um link falso) e injeta o domínio oficial.
function buildSafeSocialLink(
  url: string,
  platform: "instagram" | "facebook" | "tiktok",
) {
  if (!url || url.trim() === "") return "";

  // Pega só o que vem depois da última barra.
  // Ex: https://hacker.com/golpe -> vira "golpe"
  let handle = url.split("/").filter(Boolean).pop() || "";

  // Remove arrobas e espaços
  handle = handle.replace(/@/g, "").trim();

  if (!handle) return "";

  if (platform === "instagram") return `https://instagram.com/${handle}`;
  if (platform === "facebook") return `https://facebook.com/${handle}`;
  if (platform === "tiktok") return `https://tiktok.com/@${handle}`;

  return "";
}

async function requireAdmin() {
  const user = await getSafeUser();

  // 1. Garante para o TypeScript que o usuário existe e não é nulo
  if (!user) return null;

  // 2. Agora o TypeScript permite ler user.role e user.email sem o "?"
  const adminEmails = (process.env.ADMIN_EMAIL || "")
    .toLowerCase()
    .split(",")
    .map((e) => e.trim());
  if (
    user.role !== "ADMIN" &&
    (!user.email || !adminEmails.includes(user.email.toLowerCase()))
  ) {
    return null;
  }

  // 3. Tipagem validada: é 100% seguro retornar o ID
  return user.id;
}

// --- FUNÇÃO CORRIGIDA PARA O NOVO DOMÍNIO ---
function getKeyFromUrl(url: string | null): string | null {
  if (!url) return null;

  try {
    // O segredo agora é buscar pelo padrão "/f/" que existe em todos os links deles
    if (url.includes("/f/")) {
      const parts = url.split("/f/");
      // Pega o que vem depois do /f/ e garante que está limpo
      if (parts.length > 1) {
        return decodeURIComponent(parts[1]).split("?")[0];
      }
    }

    return null;
  } catch (e) {
    return null;
  }
}

// --- FUNÇÃO DE DELETAR (ATUALIZADA) ---
async function deleteFilesFromUploadThing(fileUrls: string[]) {
  const keysToDelete = fileUrls
    .map((url) => getKeyFromUrl(url)) // Usa a nova função extratora
    .filter((key): key is string => !!key); // Remove nulos

  if (keysToDelete.length > 0) {
    try {
      console.log("🔥 Deletando chaves:", keysToDelete);
      await utapi.deleteFiles(keysToDelete);
    } catch (error) {
      console.error("Erro ao deletar arquivos do UploadThing:", error);
    }
  }
}

async function getCoordinates(address: string, city: string, state: string) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  // Se faltar algum dado essencial, já cancela
  if (!apiKey || !address || !city || !state) {
    console.log(
      "❌ getCoordinates: Faltando chave de API ou dados de endereço.",
    );
    return { lat: null, lng: null };
  }

  const fullAddress = `${address}, ${city} - ${state}, Brasil`;

  // 🚀 O TIMEOUT ID AGORA FICA ACESSÍVEL EM TODO O ESCOPO
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`,
      { signal: controller.signal },
    );

    clearTimeout(timeoutId); // Limpa o cronômetro da memória se a requisição deu certo
    const data = await response.json();

    console.log(`📡 Resposta do Google para "${fullAddress}":`, data.status);

    if (data.status === "OK") {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat: Number(lat), lng: Number(lng) };
    }

    console.log(
      "❌ Erro do Google:",
      data.error_message || "Endereço não encontrado",
    );
    return { lat: null, lng: null };
  } catch (error) {
    clearTimeout(timeoutId); // 🚀 A VACINA SÊNIOR: Garante a limpeza do cronômetro da memória MESMO se houver erro ou rejeição!
    console.error("❌ Erro fatal no getCoordinates:", error);
    return { lat: null, lng: null };
  }
}

async function getSafeUser() {
  const session = await auth();

  if (!session?.user?.id) return null;

  return await db.user.findUnique({
    where: { id: session.user.id },
    // 🛡️ Removemos o expiresAt daqui porque ele "mudou de endereço"
    // Agora ele mora dentro da tabela de Negócios (Business)
    select: {
      id: true,
      role: true,
      email: true,
    },
  });
}

// ==============================================================================
// 2. AUTENTICAÇÃO (Login, Registro e Google)
// ==============================================================================

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const rawDocument = formData.get("document") as string;

  // 🚀 O ESCUDO ANTI-CPU EXHAUSTION (Proteção contra senhas/textos gigantes)
  if (
    name?.length > 100 ||
    email?.length > 100 ||
    password?.length > 100 ||
    rawDocument?.length > 30
  ) {
    return { error: "Dados excedem o limite máximo de caracteres permitido." };
  }

  // 🛡️ RATE LIMIT INTERNO: 3 registros por hora por IP
  if (registerRatelimit) {
    const headersList = await headers();
    const ip =
      headersList.get("x-vercel-forwarded-for") ??
      headersList.get("x-forwarded-for") ??
      "127.0.0.1";
    const { success } = await registerRatelimit.limit(`register:${ip}`);
    if (!success) {
      return {
        error: "Limite de cadastros atingido. Tente novamente em 1 hora.",
      };
    }
  }

  // --- 🛡️ TRAVA DE E-MAIL INVÁLIDO E DOMÍNIO RESERVADO ---
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email || !emailRegex.test(email)) {
    return {
      error: "Por favor, insira um e-mail válido (ex: nome@dominio.com).",
    };
  }

  // 🚀 BLINDAGEM DO HACKER: Ninguém pode criar conta pública fingindo ser funcionário!
  if (email.toLowerCase().endsWith("@tafanu.com.br")) {
    return {
      error: "Domínio de e-mail reservado para uso interno da equipe.",
    };
  }

  // 1. MEMÓRIA DE AFILIADO: Pega do formulário OU do cookie padronizado "tafanu_ref"
  const cookieStore = await cookies();
  const formAffiliateCode = formData.get("affiliateCode") as string;
  const cookieAffiliateCode = cookieStore.get("tafanu_ref")?.value;

  const affiliateCode = (formAffiliateCode || cookieAffiliateCode)
    ?.toLowerCase()
    .trim();

  // Role é sempre VISITANTE. Nunca aceite do formulário.
  const role = "VISITANTE";

  if (!name || !email || !password) {
    return { error: "Preencha todos os campos obrigatórios." };
  }

  try {
    // 2. VALIDAÇÃO DE DUPLICIDADE (sem vazar se o e-mail existe)
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      // 🛡️ ANTI-ENUMERAÇÃO: mesma mensagem de sucesso para não revelar se o e-mail existe
      return { success: true };
    }

    // 3. VALIDAÇÃO UNIVERSAL DE DOCUMENTO (NOVO CNPJ E CPF)
    let cleanDocument = null;
    if (rawDocument) {
      cleanDocument = rawDocument.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      if (!isCpfOrCnpjValid(cleanDocument))
        return { error: "CPF ou CNPJ inválido." };

      // 🛡️ LISTA NEGRA DEFINITIVA: Confere se esse CPF já pertence a um usuário banido
      const cpfBanido = await db.user.findFirst({
        where: { document: cleanDocument, isBanned: true },
      });
      if (cpfBanido) {
        return {
          error:
            "Este documento possui restrições administrativas de uso na plataforma.",
        };
      }
    }

    const hashedPassword = await hash(password, 10);

    // 4. 🚀 VÍNCULO COM O PARCEIRO (Busca Inteligente)
    let affiliateId = null;
    if (affiliateCode) {
      const partner = await db.user.findFirst({
        where: {
          referralCode: { equals: affiliateCode, mode: "insensitive" },
        },
        select: { id: true },
      });
      if (partner) affiliateId = partner.id;
    }

    // 5. CRIAÇÃO NO BANCO DE DADOS
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as Role,
        document: cleanDocument,
        affiliateId,
      },
    });

    if (affiliateId) {
      await db.referralLog.create({
        data: {
          affiliateId: affiliateId,
          referredId: user.id,
        },
      });
    }

    // 5.5 📧 ENVIO DE E-MAIL DE VERIFICAÇÃO (Sua lógica do Resend mantida)
    const verificationToken = await generateVerificationToken(email);
    // 🚀 BLINDAGEM DO DOMÍNIO: Se for produção, usa o oficial. Se não, local.
    const domain =
      process.env.NODE_ENV === "production"
        ? "https://tafanu.com.br"
        : "http://localhost:3000";
    const confirmLink = `${domain}/verificar-email?token=${verificationToken.token}`;

    try {
      await resend.emails.send({
        from: "Tafanu <sistema@tafanu.com.br>",
        to: email,
        subject: "Ative sua conta no Tafanu",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h2 style="color: #0f172a;">Bem-vindo ao Tafanu, ${name}!</h2>
            <p>Falta pouco para você começar a explorar e favoritar os melhores locais e serviços.</p>
            <p>Clique no botão abaixo para confirmar seu e-mail e liberar todas as funções do site:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmLink}" style="background-color: #0070f3; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">CONFIRMAR MEU E-MAIL</a>
            </div>
            <p style="font-size: 12px; color: #666;">Este link expira em 24 horas.</p>
          </div>
        `,
      });
    } catch (e) {
      console.error("Erro ao enviar e-mail de verificação:", e);
    }

    // 6. 🧹 LIMPEZA: Remove o cookie após o sucesso
    if (cookieStore.has("tafanu_ref")) {
      cookieStore.delete("tafanu_ref");
    }

    return { success: true };
  } catch (error: any) {
    console.error("Erro no cadastro:", error);
    // 🚀 INTERCEPTADOR DE CLONES: Avisa se o CPF ou WhatsApp já existe no banco
    if (error?.code === "P2002") {
      return {
        error: "Este CPF/CNPJ ou WhatsApp já está em uso por outra conta.",
      };
    }
    return { error: "Erro ao criar conta. Tente novamente mais tarde." };
  }
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const callbackUrl = formData.get("callbackUrl") as string;

  // 🚀 O ESCUDO ANTI-CPU EXHAUSTION
  if (email?.length > 100 || password?.length > 100) {
    return { error: "E-mail ou senha inválidos." };
  }

  // 🛡️ RATE LIMIT INTERNO: Protege a Action mesmo quando chamada diretamente
  if (loginRatelimit) {
    const headersList = await headers();
    const ip =
      headersList.get("x-vercel-forwarded-for") ??
      headersList.get("x-forwarded-for") ??
      "127.0.0.1";
    const { success } = await loginRatelimit.limit(`login:${ip}`);
    if (!success) {
      return {
        error:
          "Muitas tentativas de login. Aguarde 15 minutos e tente novamente.",
      };
    }
  }

  // 1. Busca o usuário no banco
  let dbUser = await db.user.findUnique({ where: { email } });

  // 🛡️ TRAVA DE SEGURANÇA: Bloqueio imediato de usuários banidos
  if (dbUser?.isBanned) {
    return {
      error:
        "Esta conta foi suspensa permanentemente por violação dos termos de uso.",
    };
  }

  // 2. VERIFICA SE USUÁRIO EXISTE
  if (!dbUser || !dbUser.password) {
    return { error: "E-mail ou senha inválidos." };
  }

  // 3. VERIFICA SENHA
  const isPasswordCorrect = await compare(password, dbUser.password);
  if (!isPasswordCorrect) {
    return { error: "E-mail ou senha inválidos." };
  }

  // 4. VERIFICA E-MAIL
  if (!dbUser.emailVerified) {
    return {
      error: "E-mail não verificado.",
      notVerified: true,
      email: dbUser.email,
    };
  }

  // 🚀 O BLOCO 5 (Lógica de Expiração/Corte de 48h) FOI REMOVIDO DAQUI!
  // Agora o Webhook e o Cron Job são os únicos responsáveis por cortar acessos.

  try {
    let destino = callbackUrl || "/";

    // 🛡️ TRAVA ANTI-OPEN REDIRECT: Impede redirecionamentos maliciosos (Phishing) para sites externos
    if (callbackUrl) {
      const isRelative =
        callbackUrl.startsWith("/") && !callbackUrl.startsWith("//");
      const isOfficialDomain =
        callbackUrl.startsWith("https://tafanu.com.br") ||
        callbackUrl.startsWith("http://localhost:3000");

      if (!isRelative && !isOfficialDomain) {
        destino = "/"; // Link suspeito externo é limpo e resetado para a Home com segurança
      }
    }

    if (!callbackUrl || destino === "/") {
      if (dbUser?.role === ("ADMIN" as Role)) destino = "/admin";
      else if (dbUser?.role === ("ASSINANTE" as Role)) destino = "/dashboard";
    }

    await signIn("credentials", {
      email,
      password,
      redirectTo: destino,
    });

    return { success: true };
  } catch (error: any) {
    if (error.message?.includes("NEXT_REDIRECT")) throw error;
    return { error: "E-mail ou senha inválidos." };
  }
}

export async function logoutUser() {
  await signOut({ redirectTo: "/login" });
}

export async function googleLogin(redirectTo: string) {
  await signIn("google", {
    redirectTo,
    authorization: {
      params: {
        prompt: "select_account",
        access_type: "offline",
        response_type: "code",
      },
    },
  });
}

// ==============================================================================
// 3. PERFIL DO USUÁRIO & UPGRADE
// ==============================================================================

export async function updateUserProfile(formData: FormData) {
  const sessionUser = await getSafeUser();
  if (!sessionUser) return { error: "Não autorizado." };
  const userId = sessionUser.id;

  // 🛡️ TRAVA WHITE HAT: Se o usuário estiver banido, ele é bloqueado na raiz e não altera o CPF!
  const checkBan = await db.user.findUnique({
    where: { id: userId },
    select: { isBanned: true },
  });
  if (checkBan?.isBanned)
    return {
      error: "Sua conta possui restrições e não pode alterar dados cadastrais.",
    };

  // 🚀 ESCUDO ANTI-DDoS: Impede ataques de força bruta no banco de dados via atualização de perfil
  if (storeActionRatelimit) {
    const { success } = await storeActionRatelimit.limit(
      `profile_update_${userId}`,
    );
    if (!success) {
      return { error: "Muitas atualizações simultâneas. Aguarde um minuto." };
    }
  }

  // 1. PEGA O CÓDIGO DO AFILIADO QUE VEM DO FORMULÁRIO (ProfileForm)
  const affiliateCode = formData.get("affiliateCode") as string; // ⬅️ NOVO

  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = userProfileSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    const firstMessage = Object.values(fieldErrors).flat()[0];
    return { error: firstMessage || "Erro de validação" };
  }

  const validatedData = validatedFields.data;

  try {
    const dbUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true, affiliateId: true, document: true }, // 🚀 Lemos o CPF do banco!
    });

    if (!dbUser) return { error: "Usuário não encontrado." };

    // 🚀 O ESCUDO ANTI-EVASÃO: O CPF original do banco é sagrado e imutável.
    let finalDocument = dbUser.document;

    // Só permite salvar um documento novo SE o banco estiver vazio E a pessoa enviou um.
    if (!dbUser.document && validatedData.document) {
      const tempDoc = validatedData.document
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase();
      if (isCpfOrCnpjValid(tempDoc)) {
        finalDocument = tempDoc;
      } else {
        return { error: "CPF ou CNPJ inválido." };
      }
    }

    const updateData: any = {
      name: validatedData.name,
      phone: validatedData.phone.replace(/\D/g, ""), // Zod já garante que não é vazio
      document: finalDocument, // 🚀 Salva o imutável ou o novo validado. Nunca apaga!
    };

    // 2. LÓGICA DE VÍNCULO DE AFILIADO (SÓ ACONTECE UMA VEZ)
    // Se o usuário ainda não tem um "pai" (affiliateId) e enviou um código
    if (!dbUser.affiliateId && affiliateCode) {
      // ⬅️ NOVO
      const partner = await db.user.findUnique({
        where: { referralCode: affiliateCode.toLowerCase() },
        select: { id: true },
      });

      if (partner) {
        updateData.affiliateId = partner.id; // ⬅️ Vincula o usuário ao parceiro
      }
    }

    if (validatedData.newPassword) {
      const currentPassword = formData.get("currentPassword") as string;
      if (dbUser.password) {
        if (!currentPassword) {
          return { error: "Informe a senha atual para criar uma nova." };
        }
        // 🚀 TRAVA ANTI-CPU EXHAUSTION
        if (currentPassword.length > 100)
          return { error: "Senha atual inválida." };

        const isPasswordCorrect = await compare(
          currentPassword,
          dbUser.password,
        );
        if (!isPasswordCorrect) {
          return { error: "Senha atual incorreta." };
        }
      }
      updateData.password = await hash(validatedData.newPassword, 10);
    }

    await db.user.update({
      where: { id: userId },
      data: updateData,
    });

    revalidatePath("/dashboard/perfil");
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao atualizar perfil:", error);
    // 🚀 INTERCEPTADOR DE CLONES (P2002):
    if (error?.code === "P2002") {
      const target = error.meta?.target || "";
      if (typeof target === "string" || Array.isArray(target)) {
        if (target.includes("document"))
          return { error: "Este CPF/CNPJ já pertence a outra conta." };
        if (target.includes("phone"))
          return { error: "Este WhatsApp já pertence a outra conta." };
      }
      return { error: "Dados de segurança já estão em uso por outra conta." };
    }
    return { error: "Não foi possível salvar as alterações." };
  }
}

export async function checkProfileStatus() {
  const user = await getSafeUser();
  if (!user) return { isComplete: false };
  if (user.role === "VISITANTE" || user.role === "ADMIN") {
    return { isComplete: true };
  }
  const fullUser = await db.user.findUnique({
    where: { id: user.id },
    select: { document: true, phone: true },
  });
  return {
    isComplete: !!(fullUser?.document && fullUser?.phone),
  };
}

// ==============================================================================
// 4. GESTÃO DE NEGÓCIOS (CRUD)
// ==============================================================================

export async function getFilterMetadata() {
  // 🚀 ADICIONA A REGRA DA CARÊNCIA: O que venceu há menos de 48h ainda aparece!
  const limiteCarencia = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const data = await db.business.findMany({
    where: {
      isActive: true,
      published: true,
      OR: [{ expiresAt: { gte: limiteCarencia } }, { expiresAt: null }],
    },
    select: {
      category: true,
      subcategory: true,
    },
  });

  const map: Record<string, string[]> = {};

  data.forEach((item) => {
    if (!map[item.category]) map[item.category] = [];

    item.subcategory?.forEach((sub) => {
      if (!map[item.category].includes(sub)) {
        map[item.category].push(sub);
      }
    });
  });

  return map;
}

export async function createBusiness(payload: any) {
  const session = await getSafeUser();
  if (!session) return { error: "Não autorizado." };
  // 🛡️ TRAVA ANTI-RACE CONDITION E ANTI-SPAM
  if (storeActionRatelimit) {
    const { success } = await storeActionRatelimit.limit(`store_${session.id}`);
    if (!success) {
      console.warn(
        `🚨 [Ataque Bloqueado] Usuário ${session.id} floodando API.`,
      );
      return { error: "Muitas ações simultâneas. Aguarde um minuto." };
    }
  }

  // 🚀 PARTE 1: VALIDAÇÃO DE REGRAS DE NEGÓCIO (ROLES)
  const userRole = session.role; // Pegando o cargo do usuário da sessão

  // 1. Bloqueio para Visitantes
  if (userRole === "VISITANTE") {
    return {
      error: "Visitantes não podem criar lojas. Assine um plano para começar!",
    };
  }

  // 2. Bloqueio de limite para Assinantes E Afiliados
  if (userRole === "ASSINANTE" || userRole === "AFILIADO") {
    // Contamos quantos negócios este usuário já possui no banco
    const businessCount = await db.business.count({
      where: { userId: session.id },
    });

    if (businessCount >= 1) {
      if (userRole === "AFILIADO") {
        return {
          error:
            "Parceiros têm direito a apenas 1 vitrine gratuita de portfólio. Para novos clientes, eles devem criar suas próprias contas.",
        };
      } else {
        return {
          error:
            "Sua conta já possui uma vitrine ativa. Para cadastrar um novo negócio, crie uma nova conta.",
        };
      }
    }
  }

  // Se for ADMIN, o código ignora os IFs acima e segue normalmente (Admin pode ter infinitas)...

  // --- RESTANTE DO SEU CÓDIGO ORIGINAL ---
  const validatedFields = businessSchema.safeParse(payload);
  if (!validatedFields.success) return { error: "Dados inválidos." };

  const validatedData = validatedFields.data;

  const coords = await getCoordinates(
    `${validatedData.address}${validatedData.number ? `, ${validatedData.number}` : ""}`, // Rua + Número
    validatedData.city || "",
    validatedData.state || "",
  );

  try {
    await db.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          userId: session.id,
          // 🚀 BLINDAGEM XSS: Neutraliza scripts no título
          name: validatedData.name.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
          // 🚀 BLINDAGEM DE ROTA: Remove qualquer símbolo maluco do link (só aceita letras, números e traços)
          slug: validatedData.slug
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9-]/g, ""),
          // ... (mantenha a categoria, tema, layout iguais)
          theme: validatedData.theme,
          layout: validatedData.layout as LayoutType,
          category: validatedData.category,
          subcategory: validatedData.subcategory,
          // 🚀 BLINDAGEM XSS: Neutraliza scripts na descrição
          description: validatedData.description
            ? validatedData.description
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
            : "",
          whatsapp: (validatedData.whatsapp || "").replace(/\D/g, ""),
          phone: (validatedData.phone || "").replace(/\D/g, ""),
          address: validatedData.address,
          number: validatedData.number || "",
          complement: validatedData.complement || "",
          cep: validatedData.cep || "",
          city: normalizeText(validatedData.city || ""),
          neighborhood: normalizeText(validatedData.neighborhood || ""),
          state:
            !validatedData.address && !validatedData.city
              ? ""
              : validatedData.state,
          latitude: coords.lat,
          longitude: coords.lng,
          imageUrl: validatedData.imageUrl || "",
          coverImage: validatedData.coverImage || "",
          mediaFeed: validatedData.mediaFeed as any,
          gallery: (validatedData.mediaFeed || [])
            .filter((m: any) => m && m.type === "image" && m.url)
            .map((m: any) => m.url)
            .slice(0, 30),
          videos: (validatedData.mediaFeed || [])
            .filter((m: any) => m && m.type === "video" && m.url)
            .map((m: any) => m.url)
            .slice(0, 5),
          features: validatedData.features,
          keywords: Array.from(
            new Set([
              ...(validatedData.keywords || []).map((k: string) =>
                normalizeText(k),
              ),
              normalizeText(validatedData.name),
              normalizeText(validatedData.category),
              ...(validatedData.subcategory || []).map((s: string) =>
                normalizeText(s),
              ),
              ...(validatedData.subcategory || []).flatMap((s: string) =>
                normalizeText(s).split(" "),
              ),
            ]),
          ).filter(Boolean),
          instagram: buildSafeSocialLink(
            validatedData.instagram || "",
            "instagram",
          ),
          facebook: buildSafeSocialLink(
            validatedData.facebook || "",
            "facebook",
          ),
          tiktok: buildSafeSocialLink(validatedData.tiktok || "", "tiktok"),
          website: validatedData.website || "",

          // 🚀 O CAVALO DE TRÓIA ENTRA AQUI NO BANCO
          isExternalLink: validatedData.isExternalLink || false,
          actionLink: validatedData.actionLink || "",
          published: validatedData.published ?? false,
          hasDelivery: validatedData.hasDelivery || false,
          deliveryFeeNegotiable: validatedData.deliveryFeeNegotiable || false,
          deliveryFee: validatedData.deliveryFee || 0,
          deliveryRadius: validatedData.deliveryRadius || 0, // 🚀 SALVA O RAIO NO BANCO
          menuMode: validatedData.menuMode || "PDF",
          agendaConfig: payload.agendaConfig || null,
          urban_tag: validatedData.urban_tag || "",
          luxe_quote: validatedData.luxe_quote || "",
          showroom_collection: validatedData.showroom_collection || "",
          comercial_badge: validatedData.comercial_badge || "",
          faqs: validatedData.faqs as any,
        },
      });

      if (validatedData.hours && validatedData.hours.length > 0) {
        await tx.businessHour.createMany({
          data: validatedData.hours.map((h: any) => ({
            businessId: business.id,
            dayOfWeek: h.dayOfWeek,
            openTime: h.openTime || "09:00",
            closeTime: h.closeTime || "18:00",
            isClosed: !!h.isClosed,
          })),
        });
      }

      if (validatedData.products && validatedData.products.length > 0) {
        await tx.product.createMany({
          data: validatedData.products.map((p: any) => ({
            businessId: business.id,
            name: String(p.name)
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .trim()
              .substring(0, 60),
            description: p.description
              ? String(p.description)
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .trim()
                  .substring(0, 250)
              : "",
            price: Math.abs(Number(p.price) || 0),
            oldPrice: p.oldPrice ? Math.abs(Number(p.oldPrice)) : null,
            imageUrl: p.imageUrl || "",
            isActive: p.isActive ?? true,
            extras: Array.isArray(p.extras)
              ? p.extras.map((extra: any) => ({
                  name: String(extra.name || "")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .trim()
                    .substring(0, 40),
                  price: Math.abs(Number(extra.price) || 0),
                }))
              : [],
          })),
        });
      }
    });

    revalidatePath("/busca");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Erro no create:", error);

    // 🚀 O INTERCEPTADOR DE ERROS DO PRISMA:
    // P2002 é o código oficial do Prisma para "Unique constraint failed"
    if (error?.code === "P2002" && error?.meta?.target?.includes("slug")) {
      return { error: "Erro de slug: Este link já está em uso na plataforma." };
    }

    return { error: "Erro ao criar anúncio." };
  }
}

// 🔄 EDIÇÃO DE NEGÓCIO (Com economia de API e Redes Sociais completas)
export async function updateFullBusiness(slug: string, payload: any) {
  const user = await getSafeUser();
  if (!user) return { error: "Não autorizado." };
  // 🛡️ TRAVA ANTI-SPAM E PROTEÇÃO DA API DO GOOGLE MAPS
  if (storeActionRatelimit) {
    const { success } = await storeActionRatelimit.limit(`store_${user.id}`);
    if (!success) {
      return {
        error:
          "Você está salvando muito rápido. Aguarde um minuto para não sobrecarregar o sistema.",
      };
    }
  }
  try {
    const old = await db.business.findUnique({
      where: { slug },
      select: {
        id: true,
        userId: true,
        address: true,
        city: true,
        state: true,
        latitude: true,
        longitude: true,
        imageUrl: true,
        coverImage: true,
        catalogPdf: true,
        gallery: true,
        products: { select: { imageUrl: true } }, // 🚀 ESCUDO ANTI-VAZAMENTO: Mapeia as fotos antigas!
        user: { select: { affiliateId: true } },
      },
    });
    if (!old) return { error: "Negócio não encontrado." };

    const isOwner = old.userId === user.id;
    const isAdmin = user.role === "ADMIN";
    const isSponsor =
      user.role === "AFILIADO" && old.user.affiliateId === user.id;

    if (!isOwner && !isAdmin && !isSponsor) return { error: "Acesso Negado." };

    const validatedFields = businessSchema.safeParse(payload);
    if (!validatedFields.success) return { error: "Verifique os dados." };

    const validatedData = validatedFields.data;

    // 💰 ECONOMIA E PREVENÇÃO DE ERRO NO MAPA
    let lat = old.latitude;
    let lng = old.longitude;
    const addressChanged =
      old.address !== validatedData.address ||
      old.city !== validatedData.city ||
      old.state !== validatedData.state;

    if (addressChanged) {
      // 🚀 NOVA REGRA: Se a RUA estiver vazia, zera o mapa e pula o Google
      if (!validatedData.address || validatedData.address.trim() === "") {
        lat = null;
        lng = null;
      } else {
        const newCoords = await getCoordinates(
          validatedData.address || "",
          validatedData.city || "",
          validatedData.state || "",
        );

        if (newCoords.lat && newCoords.lng) {
          lat = newCoords.lat;
          lng = newCoords.lng;
        } else {
          return {
            error:
              "Não conseguimos localizar este endereço no mapa. Verifique se os dados estão corretos.",
          };
        }
      }
    }
    // ✂️ CIRURGIA: Faxina do UploadThing (Agora lendo 100% da aduana do Zod)
    const linksParaDeletar: string[] = [];

    if (old.imageUrl && old.imageUrl !== validatedData.imageUrl) {
      linksParaDeletar.push(old.imageUrl);
    }
    if (old.coverImage && old.coverImage !== validatedData.coverImage) {
      linksParaDeletar.push(old.coverImage);
    }
    if (old.catalogPdf && old.catalogPdf !== validatedData.catalogPdf) {
      linksParaDeletar.push(old.catalogPdf);
    }

    const galeriaAntiga = (old.gallery as string[]) || [];
    const novaGaleriaUrls = (validatedData.mediaFeed || [])
      .filter((m: any) => m && m.type === "image" && m.url)
      .map((m: any) => m.url);

    galeriaAntiga.forEach((url) => {
      if (!novaGaleriaUrls.includes(url)) {
        linksParaDeletar.push(url);
      }
    });

    // 🚀 O ESCUDO ANTI-FDoS (Financial DoS): Limpa as fotos dos lanches removidos!
    const fotosProdutosAntigos =
      old.products?.map((p: any) => p.imageUrl).filter(Boolean) || [];
    const fotosProdutosNovos = (validatedData.products || [])
      .map((p: any) => p.imageUrl)
      .filter(Boolean);

    fotosProdutosAntigos.forEach((url: string) => {
      if (!fotosProdutosNovos.includes(url)) {
        linksParaDeletar.push(url); // Acha a foto orfã e manda pra guilhotina
      }
    });

    // 🛡️ ENVELOPE DE SEGURANÇA ATÔMICA: Tudo salva junto ou nada salva!
    await db.$transaction(async (tx) => {
      await tx.business.update({
        where: { id: old.id },
        data: {
          // 🚀 BLINDAGEM XSS E SLUG
          name: validatedData.name.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
          slug: validatedData.slug
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9-]/g, ""),
          description: validatedData.description
            ? validatedData.description
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
            : "",
          address: validatedData.address,
          category: validatedData.category,
          subcategory: validatedData.subcategory,
          theme: validatedData.theme,
          layout: validatedData.layout as LayoutType,
          whatsapp: (validatedData.whatsapp || "").replace(/\D/g, ""),
          phone: (validatedData.phone || "").replace(/\D/g, ""),
          number: validatedData.number || "",
          complement: validatedData.complement || "",
          cep: validatedData.cep || "",
          city: normalizeText(validatedData.city || ""),
          neighborhood: normalizeText(validatedData.neighborhood || ""),
          state:
            !validatedData.address && !validatedData.city
              ? ""
              : validatedData.state,
          latitude: lat,
          longitude: lng,
          keywords: Array.from(
            new Set([
              ...(validatedData.keywords || []).map((k: string) =>
                normalizeText(k),
              ),
              normalizeText(validatedData.name),
              normalizeText(validatedData.category),
              ...(validatedData.subcategory || []).map((s: string) =>
                normalizeText(s),
              ),
              ...(validatedData.subcategory || []).flatMap((s: string) =>
                normalizeText(s).split(" "),
              ),
            ]),
          ).filter(Boolean),
          instagram: buildSafeSocialLink(
            validatedData.instagram || "",
            "instagram",
          ),
          facebook: buildSafeSocialLink(
            validatedData.facebook || "",
            "facebook",
          ),
          tiktok: buildSafeSocialLink(validatedData.tiktok || "", "tiktok"),
          imageUrl: validatedData.imageUrl || "",
          coverImage: validatedData.coverImage || "",
          catalogPdf: validatedData.catalogPdf || null,
          website: validatedData.website || "",
          features: validatedData.features,
          published: validatedData.published,
          hasDelivery: validatedData.hasDelivery || false,
          deliveryFeeNegotiable: validatedData.deliveryFeeNegotiable || false,
          deliveryFee: validatedData.deliveryFee || 0,
          deliveryRadius: validatedData.deliveryRadius || 0,
          menuMode: validatedData.menuMode || "PDF",
          agendaConfig: payload.agendaConfig || null,
          urban_tag: validatedData.urban_tag || "",
          luxe_quote: validatedData.luxe_quote || "",
          showroom_collection: validatedData.showroom_collection || "",
          comercial_badge: validatedData.comercial_badge || "",

          // 🚀 O CAVALO DE TRÓIA + FAXINA VELHA
          isExternalLink: validatedData.isExternalLink || false,
          actionLink: validatedData.actionLink || "",
          shopee: "",
          mercadoLivre: "",
          shein: "",
          ifood: "",

          mediaFeed: validatedData.mediaFeed as any,
          gallery: (validatedData.mediaFeed || [])
            .filter((m: any) => m && m.type === "image" && m.url)
            .map((m: any) => m.url)
            .slice(0, 30),
          videos: (validatedData.mediaFeed || [])
            .filter((m: any) => m && m.type === "video" && m.url)
            .map((m: any) => m.url)
            .slice(0, 5),
          faqs: validatedData.faqs as any,
        },
      });

      if (validatedData.hours) {
        await tx.businessHour.deleteMany({ where: { businessId: old.id } });
        if (validatedData.hours.length > 0) {
          await tx.businessHour.createMany({
            data: validatedData.hours.map((h: any) => ({
              businessId: old.id,
              dayOfWeek: h.dayOfWeek,
              openTime: h.openTime || "09:00",
              closeTime: h.closeTime || "18:00",
              isClosed: !!h.isClosed,
            })),
          });
        }
      }

      if (validatedData.products) {
        await tx.product.deleteMany({ where: { businessId: old.id } });

        if (validatedData.products.length > 0) {
          await tx.product.createMany({
            data: validatedData.products.map((p: any) => ({
              businessId: old.id,
              name: String(p.name)
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .trim()
                .substring(0, 60),
              description: p.description
                ? String(p.description)
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .trim()
                    .substring(0, 250)
                : "",
              price: Math.abs(Number(p.price) || 0),
              oldPrice: p.oldPrice ? Math.abs(Number(p.oldPrice)) : null,
              imageUrl: p.imageUrl || "",
              isActive: p.isActive ?? true,
              extras: Array.isArray(p.extras)
                ? p.extras.map((extra: any) => ({
                    name: String(extra.name || "")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;")
                      .trim()
                      .substring(0, 40),
                    price: Math.abs(Number(extra.price) || 0),
                  }))
                : [],
            })),
          });
        }
      }
    });

    // ✅ SUCESSO NO BANCO! Agora fazemos a faxina no bucket em segundo plano (Fire-and-forget)
    if (linksParaDeletar.length > 0) {
      deleteFilesFromUploadThing(linksParaDeletar).catch((err) =>
        console.error("Erro ao limpar UploadThing após sucesso no DB:", err),
      );
    }

    // 🚀 A MARRETA DO CACHE: Adicionamos "layout" e mapeamos a tela de edição
    revalidatePath("/busca", "page");
    revalidatePath("/dashboard", "layout");
    revalidatePath(`/site/${slug}`, "page");
    revalidatePath(`/dashboard/editar/${slug}`, "page");

    // Se o link mudou, revalida as rotas novas também
    if (validatedData.slug !== slug) {
      revalidatePath(`/site/${validatedData.slug}`, "page");
      revalidatePath(`/dashboard/editar/${validatedData.slug}`, "page");
    }

    return { success: true, newSlug: validatedData.slug };
  } catch (error: any) {
    console.error("Erro no update:", error);

    // 🚀 O INTERCEPTADOR DE ERROS NA EDIÇÃO:
    if (error?.code === "P2002" && error?.meta?.target?.includes("slug")) {
      return { error: "Erro de slug: Este link já está em uso na plataforma." };
    }

    return { error: "Erro ao salvar." };
  }
}

// ==============================================================================
// 7. ATUALIZAÇÃO ESPECÍFICA DE MÍDIA (VÍDEO E GALERIA)
// ==============================================================================
export async function updateBusinessMedia(slug: string, gallery: string[]) {
  if (!slug || slug.length > 60) return { error: "Link inválido." };
  if (gallery?.length > 30) return { error: "Limite de mídias excedido." };
  const user = await getSafeUser();
  if (!user) return { error: "Não autorizado." };
  if (storeActionRatelimit) {
    const { success } = await storeActionRatelimit.limit(`store_${user.id}`);
    if (!success) return { error: "Muitas ações. Aguarde um minuto." };
  }
  try {
    // 1. Busca o negócio atual e traz o mediaFeed junto
    const business = await db.business.findUnique({
      where: { slug },
      select: {
        id: true,
        userId: true,
        gallery: true,
        mediaFeed: true,
        user: { select: { affiliateId: true } }, // 🚀 A Chave Mestra do Parceiro
      },
    });

    const isOwner = business?.userId === user.id;
    const isAdmin = user.role === "ADMIN";
    const isSponsor =
      user.role === "AFILIADO" && business?.user.affiliateId === user.id;

    if (!business || (!isOwner && !isAdmin && !isSponsor)) {
      return { error: "Negócio não encontrado ou permissão negada." };
    }

    // 2. Lógica de Faxina (Deleta fotos removidas do UploadThing)
    const filesToDelete: string[] = [];
    const oldGallery = (business.gallery as string[]) || [];

    oldGallery.forEach((url) => {
      if (!gallery.includes(url)) {
        filesToDelete.push(url);
      }
    });

    if (filesToDelete.length > 0) {
      await deleteFilesFromUploadThing(filesToDelete);
    }

    // 🚀 3. MÁGICA DO MEDIAFEED: Filtra os vídeos (Embeds) existentes
    const currentVideos = Array.isArray(business.mediaFeed)
      ? business.mediaFeed.filter((m: any) => m && m.type === "video")
      : [];

    // 🚀 ESCUDO ANTI-XSS: Só aceita as strings que começam com "http" (barra URLs maliciosas)
    const validGalleryUrls = gallery.filter(
      (url) => typeof url === "string" && url.startsWith("http"),
    );

    // Mapeia as novas fotos validadas
    const newImages = validGalleryUrls.map((url) => ({ type: "image", url }));

    // Une fotos novas e vídeos antigos
    const newMediaFeed = [...newImages, ...currentVideos];

    // 4. Atualiza o banco de dados com a tipagem forçada e segura do Prisma
    await db.business.update({
      where: { id: business.id },
      data: {
        gallery: gallery,
        mediaFeed: newMediaFeed as unknown as Prisma.InputJsonValue[],
      },
    });

    // 5. Limpa o cache para as mudanças aparecerem no site
    revalidatePath(`/site/${slug}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar mídia:", error);
    return { error: "Erro interno ao salvar as mídias." };
  }
}

export async function updateBusinessHours(slug: string, hours: any[]) {
  if (!slug || slug.length > 60) return { error: "Link inválido." };
  if (hours?.length > 7) return { error: "Limite de horários excedido." };
  const user = await getSafeUser();
  if (!user) return { error: "Não autorizado." };
  if (storeActionRatelimit) {
    const { success } = await storeActionRatelimit.limit(`store_${user.id}`);
    if (!success) return { error: "Muitas ações. Aguarde um minuto." };
  }
  const userId = user.id;
  try {
    const b = await db.business.findUnique({
      where: { slug },
      select: {
        id: true,
        userId: true,
        user: { select: { affiliateId: true } }, // 🚀 A Chave Mestra do Parceiro
      },
    });

    const isOwner = b?.userId === user.id;
    const isAdmin = user.role === "ADMIN";
    const isSponsor =
      user.role === "AFILIADO" && b?.user.affiliateId === user.id;

    if (!b || (!isOwner && !isAdmin && !isSponsor)) return { error: "Negado." };

    await db.businessHour.deleteMany({ where: { businessId: b.id } });
    await db.businessHour.createMany({
      data: hours.slice(0, 7).map((h) => ({
        businessId: b.id,
        dayOfWeek: Number(h.dayOfWeek),
        openTime:
          typeof h.openTime === "string" ? h.openTime.slice(0, 5) : "09:00",
        closeTime:
          typeof h.closeTime === "string" ? h.closeTime.slice(0, 5) : "18:00",
        isClosed: !!h.isClosed,
      })),
    });
    revalidatePath(`/site/${slug}`);
    return { success: true };
  } catch (error) {
    return { error: "Erro horários." };
  }
}

// --- A BOMBA ATÔMICA INTELIGENTE (Exclui ou Arquiva para proteger o Financeiro) ---
export async function deleteBusiness(slug: string) {
  if (!slug || slug.length > 60) return { error: "Link inválido." };
  const user = await getSafeUser();
  if (!user) return { error: "Não autorizado." };

  try {
    const business = await db.business.findUnique({
      where: { slug },
      select: {
        id: true,
        userId: true,
        mpSubscriptionId: true,
        _count: { select: { orders: true } }, // 🚀 AUDITORIA: Verifica se a loja tem vendas
      },
    });

    if (!business) return { error: "Loja não encontrada." };

    // Só o dono ou Admin podem apagar
    if (business.userId !== user.id && user.role !== "ADMIN") {
      return { error: "Acesso Negado." };
    }

    // 🚀 BLINDAGEM FINANCEIRA: Cancela a cobrança no MP antes de apagar a loja!
    if (business.mpSubscriptionId) {
      try {
        const preApproval = new PreApproval(client);
        await preApproval.update({
          id: business.mpSubscriptionId,
          body: { status: "cancelled" },
        });
        console.log(
          `[Segurança] Assinatura ${business.mpSubscriptionId} cancelada no MP.`,
        );
      } catch (mpErr) {
        console.error(
          "Falha ao cancelar assinatura no banco central, mas prosseguindo com exclusão:",
          mpErr,
        );
      }
    }

    // A faxina das imagens no UploadThing TEM que ser feita ANTES de apagar no banco!
    await cleanStorageFiles(slug);

    // 🚀 O TRIBUNAL DE EXCLUSÃO (Soft Delete vs Hard Delete)
    if (business._count.orders > 0) {
      // SOFT DELETE: A loja tem vendas. Não podemos quebrar o histórico financeiro.
      await db.business.update({
        where: { id: business.id },
        data: {
          isActive: false,
          published: false,
          imageUrl: null,
          coverImage: null,
          catalogPdf: null,
          gallery: [],
          mediaFeed: [],
          // Libera o link original adicionando um prefixo de lixo + timestamp
          slug: `deleted-${Date.now()}-${business.id.substring(0, 6)}`,
          subscriptionStatus: "cancelled",
        },
      });
    } else {
      // HARD DELETE: A loja é virgem de vendas. Aniquilação total liberada.
      await db.business.delete({ where: { id: business.id } });
    }

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    revalidatePath("/busca");
    revalidatePath(`/site/${slug}`);

    return {
      success: true,
      message: "Loja excluída permanentemente com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao processar exclusão:", error);
    return { error: "Erro interno ao excluir. Tente novamente." };
  }
}

// --- A VASSOURA (Reseta os dados, mas salva o link e assinatura) ---
export async function resetBusiness(slug: string) {
  if (!slug || slug.length > 60) return { error: "Link inválido." };
  const user = await getSafeUser();
  if (!user) return { error: "Não autorizado." };

  try {
    const business = await db.business.findUnique({
      where: { slug },
      select: {
        id: true,
        userId: true,
        user: { select: { affiliateId: true } }, // 🚀 A Chave Mestra do Parceiro
      },
    });

    if (!business) return { error: "Loja não encontrada." };

    const isOwner = business.userId === user.id;
    const isAdmin = user.role === "ADMIN";
    const isSponsor =
      user.role === "AFILIADO" && business.user.affiliateId === user.id;

    if (!isOwner && !isAdmin && !isSponsor) {
      return { error: "Acesso Negado." };
    } // Apaga as fotos antigas do servidor!

    // Apaga as fotos antigas do servidor!
    await cleanStorageFiles(slug);

    await db.$transaction([
      db.businessHour.deleteMany({ where: { businessId: business.id } }),
      db.product.deleteMany({ where: { businessId: business.id } }), // 🚀 Zera o cardápio
      db.favorite.deleteMany({ where: { businessId: business.id } }),
      db.report.deleteMany({ where: { businessId: business.id } }),
      db.business.update({
        where: { id: business.id },
        data: {
          description: "",
          imageUrl: "",
          coverImage: "",
          gallery: [],
          videos: [],
          mediaFeed: [],
          features: [],
          faqs: [],
          keywords: [],
          category: "Geral",
          subcategory: [],
          published: false,
          whatsapp: "",
          phone: "",
          instagram: "",
          facebook: "",
          tiktok: "",
          website: "",
          isExternalLink: false,
          actionLink: "",
          deliveryFeeNegotiable: false, // 🚀 A VASSOURA TAMBÉM LIMPA ISSO AGORA
          shopee: "",
          mercadoLivre: "",
          shein: "",
          ifood: "",
          urban_tag: "",
          luxe_quote: "",
          showroom_collection: "",
          comercial_badge: "",
          etapaFunil: 1,
        },
      }),
    ]);

    revalidatePath("/dashboard");
    revalidatePath(`/site/${slug}`);
    return { success: true, message: "Sua vitrine foi limpa com sucesso!" };
  } catch (error) {
    console.error("Erro ao resetar:", error);
    return { error: "Erro interno ao resetar. Tente novamente." };
  }
}

// --- 1. O MOTOR DA FAXINA (Atualizado: 10 Dias Tolerância + 30 Dias Exclusão) ---
async function executeCoreCleanup() {
  // ⏳ Tempo 1: O Rebaixamento (10 dias após o vencimento)
  const limiteRebaixamento = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

  // 🗑️ Tempo 2: A Exclusão Física (30 dias após o vencimento)
  const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // 🍔 Tempo 3: O Lixo do Carrinho (12 horas)
  const dozeHorasAtras = new Date(Date.now() - 12 * 60 * 60 * 1000);

  try {
    // 🚀 CIRURGIA 5: MÁQUINA DE VENDAS E RETENÇÃO (Disparos Automáticos)
    const duasHorasAtras = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const trintaMinutosAtras = new Date(Date.now() - 30 * 60 * 1000);

    // 5.A: Recuperação de Assinatura (Lojistas que pararam no checkout)
    const lojistasAbandonados = await db.business.findMany({
      where: {
        subscriptionStatus: "inactive",
        createdAt: { lt: duasHorasAtras },
        recoveryEmailSent: false,
      },
      select: {
        id: true,
        name: true,
        user: { select: { email: true, name: true } },
      },
      take: 20,
    });

    for (const loja of lojistasAbandonados) {
      if (loja.user?.email) {
        try {
          await resend.emails.send({
            from: "Equipe Tafanu <sistema@tafanu.com.br>",
            to: loja.user.email,
            subject: "Sua vitrine está quase pronta!",
            html: `<p>Olá ${loja.user.name}, notamos que você começou a configurar a página <b>${loja.name}</b> no Tafanu, mas não finalizou a ativação.</p><p>Não deixe seus clientes esperando! Ative sua vitrine agora e comece a receber pedidos e solicitações de orçamento na sua região.</p><a href="https://tafanu.com.br/dashboard" style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Finalizar Ativação</a>`,
          });
          await db.business.update({
            where: { id: loja.id },
            data: { recoveryEmailSent: true },
          });
        } catch (e) {
          console.error("Erro email rec:", e);
        }
      }
    }

    // 5.B: Alerta de Pedido/Orçamento Ignorado
    const pedidosIgnorados = await db.order.findMany({
      where: {
        status: "PENDING",
        createdAt: { lt: trintaMinutosAtras },
        alertEmailSent: false,
      },
      select: {
        id: true,
        orderNumber: true,
        business: { select: { name: true, user: { select: { email: true } } } },
      },
      take: 20,
    });

    for (const pedido of pedidosIgnorados) {
      if (pedido.business?.user?.email) {
        try {
          await resend.emails.send({
            from: "Tafanu Alertas <sistema@tafanu.com.br>",
            to: pedido.business.user.email,
            subject: `🚨 ALERTA: Pedido/Orçamento aguardando resposta!`,
            html: `<p>Atenção! Você tem um pedido ou contato (<b>#${pedido.orderNumber}</b>) aguardando resposta há mais de 30 minutos na sua vitrine <b>${pedido.business.name}</b>.</p><p>Acesse seu painel agora para aceitar a solicitação antes que o cliente vá para a concorrência.</p><a href="https://tafanu.com.br/dashboard/pedidos" style="background-color: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Ver Solicitação Agora</a>`,
          });
          await db.order.update({
            where: { id: pedido.id },
            data: { alertEmailSent: true },
          });
        } catch (e) {
          console.error("Erro alerta pedido:", e);
        }
      }
    }

    // 🚀 CIRURGIA 0 (Gestão de Pedidos): Limpa carrinhos abandonados (MANTIDO)
    const pedidosDeletados = await db.order.deleteMany({
      where: {
        status: "PENDING",
        createdAt: { lt: dozeHorasAtras },
      },
    });
    if (pedidosDeletados.count > 0) {
      console.log(
        `🍔 [Faxina] ${pedidosDeletados.count} pedidos/orçamentos abandonados foram varridos.`,
      );
    }

    // 🚀 CIRURGIA 1 (CFO/Vendas): O Rebaixamento Tolerante (10 Dias)
    // Deixa o cara acessar o painel por 10 dias para facilitar a renovação
    const usuariosVencidos = await db.user.findMany({
      where: {
        role: "ASSINANTE",
        businesses: {
          some: {}, // Garante que ele tem pelo menos uma loja
          every: {
            expiresAt: { lt: limiteRebaixamento }, // O Pulo do Gato: 10 dias!
          },
        },
      },
      select: { id: true },
    });

    // Se achou clientes que esgotaram os 10 dias, rebaixa para Visitante
    if (usuariosVencidos.length > 0) {
      const idsParaRebaixar = usuariosVencidos.map((u) => u.id);
      await db.user.updateMany({
        where: { id: { in: idsParaRebaixar } },
        data: { role: "VISITANTE" },
      });
      console.log(
        `📉 [Faxina] ${idsParaRebaixar.length} usuários rebaixados (Esgotaram os 10 dias).`,
      );
    }

    // 🚀 CIRURGIA 2: O Soft Delete Financeiro (Protege o Histórico de Vendas)
    const ghosts = await db.business.findMany({
      where: {
        user: { role: "VISITANTE" },
        // 🚀 O pulo do gato: Só processa quem ainda está ativo, para o Cron Job não ficar limpando o mesmo zumbi todo dia
        isActive: true,
        OR: [
          { expiresAt: null, createdAt: { lt: trintaDiasAtras } },
          { expiresAt: { lt: trintaDiasAtras } },
        ],
      },
      take: 30, // Lotes pequenos para não estourar tempo da Vercel
      select: {
        id: true,
        imageUrl: true,
        gallery: true,
        mediaFeed: true,
        products: { select: { imageUrl: true } },
        _count: { select: { orders: true } }, // 🚀 AUDITORIA: Descobre se a loja tem vendas registradas
      },
    });

    if (ghosts.length === 0) {
      return {
        success: true,
        message: "Banco limpo. Ninguém na fila de exclusão hoje.",
      };
    }

    // 1. Coleta o lixo pesado do Storage (UploadThing)
    const linksParaDeletar: string[] = [];
    const lojasParaDeletarFisicamente: string[] = [];
    const lojasParaSoftDelete: string[] = [];

    ghosts.forEach((business) => {
      // Coleta imagens da loja
      if (business.imageUrl) linksParaDeletar.push(business.imageUrl);
      if (business.gallery && Array.isArray(business.gallery)) {
        linksParaDeletar.push(...(business.gallery as string[]));
      }
      if (business.mediaFeed && Array.isArray(business.mediaFeed)) {
        business.mediaFeed.forEach((item: any) => {
          if (item && item.type === "image" && item.url)
            linksParaDeletar.push(item.url);
        });
      }
      // Coleta imagens dos produtos
      if (business.products && business.products.length > 0) {
        business.products.forEach((p) => {
          if (p.imageUrl) linksParaDeletar.push(p.imageUrl);
        });
      }

      // 2. O TRIBUNAL: Vive como fantasma ou morre para sempre?
      if (business._count.orders > 0) {
        lojasParaSoftDelete.push(business.id); // Tem vendas, não pode apagar!
      } else {
        lojasParaDeletarFisicamente.push(business.id); // Não tem vendas, pode aniquilar.
      }
    });

    // 3. Esvazia a lixeira da UploadThing
    if (linksParaDeletar.length > 0) {
      await deleteFilesFromUploadThing(linksParaDeletar);
    }

    // 4. Executa o Soft Delete (Esconde a loja e apaga as fotos do banco para não dar erro 404)
    if (lojasParaSoftDelete.length > 0) {
      await db.business.updateMany({
        where: { id: { in: lojasParaSoftDelete } },
        data: {
          isActive: false,
          published: false,
          imageUrl: null,
          coverImage: null,
          catalogPdf: null,
          gallery: [],
          mediaFeed: [],
        },
      });
    }

    // 5. Executa a exclusão permanente das lojas inúteis
    let deletedCount = 0;
    if (lojasParaDeletarFisicamente.length > 0) {
      const deleted = await db.business.deleteMany({
        where: { id: { in: lojasParaDeletarFisicamente } },
      });
      deletedCount = deleted.count;
    }

    return {
      success: true,
      message: `Faxina Executada: ${deletedCount} lojas destruídas, ${lojasParaSoftDelete.length} arquivadas (Soft Delete), ${linksParaDeletar.length} imagens apagadas.`,
    };
  } catch (error) {
    console.error("Erro Crítico na Faxina:", error);
    return { error: "Erro interno ao executar a limpeza." };
  }
}

// --- 2. O BOTÃO DO ADMIN (Usa no Front-end) ---
export async function runGhostCleanup() {
  const user = await getSafeUser();
  if (!user || user.role !== "ADMIN") return { error: "Acesso Negado." };

  return await executeCoreCleanup();
}

// --- 3. O ROBÔ DA VERCEL (Usa no Cron Job) ---
export async function runSystemGhostCleanup() {
  // 🛡️ CTO FIX: A porta agora tem duas fechaduras seguras.
  // Lemos os cabeçalhos para ver se é o robô da Vercel com a senha oficial.
  const headersList = await headers();
  const authHeader = headersList.get("authorization");
  const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;

  // Verificamos se é o dono do sistema (Admin) logado.
  const adminId = await requireAdmin();

  // Se não for o robô E também não for o Admin, bloqueia o hacker!
  if (!isCron && !adminId) {
    console.warn(
      "🚨 [Segurança] Tentativa não autorizada de disparar a Faxina do Banco.",
    );
    return { error: "Acesso restrito à infraestrutura." };
  }

  return await executeCoreCleanup();
}

// Função auxiliar para não repetir código de deletar arquivos
async function cleanStorageFiles(slug: string) {
  const business = await db.business.findUnique({
    where: { slug },
    select: {
      imageUrl: true,
      coverImage: true,
      catalogPdf: true, // 🚀 AVISAMOS SOBRE O PDF AQUI
      gallery: true,
      mediaFeed: true,
      products: { select: { imageUrl: true } }, // 🚀 PUXA AS FOTOS DOS LANCHES
    },
  });
  if (!business) return;

  const filesToDelete: string[] = [];
  if (business.imageUrl) filesToDelete.push(business.imageUrl);
  if (business.coverImage) filesToDelete.push(business.coverImage);
  if (business.catalogPdf) filesToDelete.push(business.catalogPdf); // 🚀 APAGA O PDF AQUI
  if (business.gallery && business.gallery.length > 0) {
    filesToDelete.push(...(business.gallery as string[]));
  }

  // 🚀 AJUSTE 2: Lemos o mediaFeed e pegamos as URLs das imagens para deletar
  if (business.mediaFeed && Array.isArray(business.mediaFeed)) {
    business.mediaFeed.forEach((item: any) => {
      if (item && item.type === "image" && item.url) {
        filesToDelete.push(item.url);
      }
    });
  }

  // 🚀 LIXO DO CARDÁPIO: Pega as fotos dos produtos pra jogar fora
  if (business.products && business.products.length > 0) {
    business.products.forEach((p) => {
      if (p.imageUrl) filesToDelete.push(p.imageUrl);
    });
  }

  if (filesToDelete.length > 0) {
    await deleteFilesFromUploadThing(filesToDelete);
  }
}

export async function incrementViews(businessId: string) {
  try {
    const cookieStore = await cookies();
    const cookieName = `viewed_${businessId}`;
    const hasViewed = cookieStore.get(cookieName);

    // 🛡️ TRAVA ANTI-SPAM: Se já tem o carimbo, ignora e sai fora!
    if (hasViewed) {
      return { success: true, ignored: true };
    }

    // 🚀 COFRE ANTI-BOT: Confere no banco se o mesmo negócio já computou uma view no último minuto
    // Isso protege o servidor mesmo se o bot simular requisições sem cookies.
    const umMinutoAtras = new Date(Date.now() - 60 * 1000);
    const viewRecente = await db.analyticsEvent.findFirst({
      where: {
        businessId: businessId,
        eventType: "VIEW",
        createdAt: { gte: umMinutoAtras },
      },
      select: { id: true },
    });

    if (viewRecente) {
      return { success: true, ignored: true };
    }

    // 🚀 ATUALIZAÇÃO SÊNIOR: Fazemos as duas coisas ao mesmo tempo!
    await db.$transaction([
      db.business.update({
        where: { id: businessId },
        data: { views: { increment: 1 } },
      }),
      db.analyticsEvent.create({
        data: {
          eventType: "VIEW",
          businessId: businessId,
        },
      }),
    ]);

    // 🕒 CRIA O CARIMBO: Dura 30 minutos (1800 segundos)
    cookieStore.set(cookieName, "true", {
      maxAge: 1800,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao incrementar views:", error);
    return { error: "Erro ao registrar view" };
  }
}

export async function toggleFavorite(businessId: string) {
  const user = await getSafeUser();
  if (!user) return { error: "Não autorizado." };

  // 🚀 ESCUDO ANTI-FARMING (Defesa do Algoritmo): Impede cliques robóticos e manipulação de ranking
  if (storeActionRatelimit) {
    const { success } = await storeActionRatelimit.limit(`fav_${user.id}`);
    if (!success) {
      return { error: "Muitas ações rápidas. Aguarde um instante." };
    }
  }

  // 🛡️ TRAVA DE SERVIDOR: Verifica se o e-mail está confirmado no banco
  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { emailVerified: true },
  });

  if (!dbUser?.emailVerified) {
    return { error: "Verifique seu e-mail para usar esta função." };
  }

  const userId = user.id;
  try {
    const existing = await db.favorite.findUnique({
      where: { userId_businessId: { userId, businessId } },
    });
    if (existing) {
      await db.favorite.delete({ where: { id: existing.id } });
    } else {
      await db.favorite.create({ data: { userId, businessId } });

      // 🚀 EVENTO DE RANKING MANTIDO E AGORA BLINDADO
      await db.analyticsEvent.create({
        data: {
          eventType: "FAVORITE",
          businessId: businessId,
        },
      });
    }

    revalidatePath("/dashboard/favoritos");
    revalidatePath("/busca");
    return { success: true };
  } catch (error) {
    console.error("Erro ao favoritar:", error);
    return { error: "Erro ao favoritar." };
  }
}

// ==============================================================================
// 📊 SISTEMA DE ANALYTICS (SAAS) - O "Espião" de Cliques
// ==============================================================================

export async function registerClickEvent(
  businessId: string,
  eventType: string,
) {
  // 1. TRAVA DE SEGURANÇA: Só aceita cliques nestes botões (evita lixo no banco)
  const validEvents = [
    "WHATSAPP",
    "PHONE",
    "INSTAGRAM",
    "FACEBOOK",
    "TIKTOK",
    "WEBSITE",
    "SHOPEE",
    "MERCADOLIVRE",
    "SHEIN",
    "IFOOD",
    "MAP",
  ];

  const upperEvent = eventType.toUpperCase();
  if (!validEvents.includes(upperEvent)) return { error: "Evento inválido." };

  // 2. MAPEAMENTO: Qual coluna da tabela Business vamos somar +1?
  const columnMap: Record<string, string> = {
    WHATSAPP: "whatsapp_clicks",
    PHONE: "phone_clicks",
    INSTAGRAM: "instagram_clicks",
    FACEBOOK: "facebook_clicks",
    TIKTOK: "tiktok_clicks",
    WEBSITE: "website_clicks",
    SHOPEE: "shopee_clicks",
    MERCADOLIVRE: "mercadolivre_clicks",
    SHEIN: "shein_clicks",
    IFOOD: "ifood_clicks",
    MAP: "map_clicks",
  };

  const columnToIncrement = columnMap[upperEvent];

  try {
    // 🛡️ VALIDAÇÃO IDOR: Garante que o negócio existe e está ativo antes de registrar
    const businessExists = await db.business.findFirst({
      where: { id: businessId, isActive: true, published: true },
      select: { id: true },
    });

    if (!businessExists) {
      return { success: true, ignored: true }; // Silencioso para não revelar IDs válidos
    }

    // 🛡️ TRAVA ANTI-BOT (Evita que hackers inflem os relatórios com cliques falsos)
    const cookieStore = await cookies();
    const cookieName = `click_${businessId}_${upperEvent}`;
    const hasClicked = cookieStore.get(cookieName);

    if (hasClicked) {
      return { success: true, ignored: true }; // Ignora silenciosamente para não alertar o bot
    }

    // Marca que a pessoa já clicou neste botão específico hoje (Dura 1 hora)
    cookieStore.set(cookieName, "true", {
      maxAge: 3600,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    // 🚀 COFRE ANTI-BOT: Impede que scripts limpadores de cookie inflem o banco
    const umMinutoAtras = new Date(Date.now() - 60 * 1000);
    const cliqueRecente = await db.analyticsEvent.findFirst({
      where: {
        businessId: businessId,
        eventType: upperEvent as EventType,
        createdAt: { gte: umMinutoAtras },
      },
      select: { id: true },
    });

    if (cliqueRecente) {
      return { success: true, ignored: true };
    }

    // 3. TRANSAÇÃO MÁGICA: Faz duas coisas ao mesmo tempo.
    // Se uma falhar, ele cancela a outra para não dar erro nos gráficos depois.
    await db.$transaction([
      // A) Soma +1 no número total do painel (Para a visão rápida)
      db.business.update({
        where: { id: businessId },
        data: { [columnToIncrement]: { increment: 1 } },
      }),

      // B) Cria a "Caixa Preta": Anota o clique exato com data e hora para o gráfico
      db.analyticsEvent.create({
        data: {
          eventType: upperEvent as EventType,
          businessId: businessId,
        },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error("Erro ao registrar evento de clique:", error);
    return { error: "Erro interno ao registrar clique." };
  }
}

export async function createReport(
  businessSlug: string,
  reason: string,
  details: string,
) {
  if (!businessSlug || businessSlug.length > 60)
    return { error: "Link inválido." };

  // 🚀 ESCUDO ANTI-BOMBA DE TEXTO: Impede que hackers mandem enciclopédias direto pra API
  if (reason?.length > 100 || details?.length > 500) {
    return {
      error: "Os dados da denúncia excedem o limite de caracteres permitido.",
    };
  }

  // 1. 🛡️ Segurança Primária: Exige login
  const user = await getSafeUser();
  if (!user) {
    return { error: "Você precisa estar logado para denunciar." };
  }

  try {
    // 🚀 O PASSAPORTE: Exige CPF e Telefone para denunciar
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { document: true, phone: true },
    });

    if (!dbUser?.document || !dbUser?.phone) {
      return {
        error:
          "Para evitar falsas denúncias, valide seu CPF e WhatsApp no 'Meu Perfil'.",
      };
    }

    // 2. Resolve o negócio pelo Link
    const b = await db.business.findUnique({
      where: { slug: businessSlug },
      select: { id: true },
    });
    if (!b) return { error: "Perfil não encontrado." };

    // 3. ⏳ TRAVA ANTI-FLOOD E ANTI-DUPLICIDADE
    // Impede que o mesmo usuário denuncie a MESMA loja nas últimas 24 horas
    const vinteEQuatroHorasAtras = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const denunciaRecente = await db.report.findFirst({
      where: {
        businessId: b.id,
        reportedBy: user.id, // Verifica se ESSE usuário já denunciou
        createdAt: { gte: vinteEQuatroHorasAtras },
      },
      select: { id: true },
    });

    if (denunciaRecente) {
      return {
        error:
          "Você já enviou uma denúncia para este perfil recentemente. Nossa equipe já está analisando.",
      };
    }

    // 4. Criação da Denúncia com Auditoria Completa
    await db.report.create({
      data: {
        businessId: b.id,
        reason,
        details: details || "",
        status: "PENDING",
        reportedBy: user.id, // 🚀 FUNDAMENTAL: Agora você sabe QUEM denunciou!
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao reportar:", error);
    return { error: "Erro interno. Tente novamente mais tarde." };
  }
}

export async function resolveReport(reportId: string) {
  if (!(await requireAdmin())) return { error: "Acesso negado." };
  await db.report.update({
    where: { id: reportId },
    data: { status: "RESOLVED" },
  });
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteReport(reportId: string) {
  if (!(await requireAdmin())) return { error: "Acesso negado." };
  await db.report.delete({ where: { id: reportId } });
  revalidatePath("/admin");
  return { success: true };
}

export async function toggleBusinessStatus(
  businessId: string,
  status: boolean,
) {
  if (!(await requireAdmin())) return { error: "Acesso negado." };
  await db.business.update({
    where: { id: businessId },
    data: { isActive: status },
  });
  revalidatePath("/admin");
  return { success: true };
}

export async function banBusiness(businessId: string) {
  if (!(await requireAdmin())) return { error: "Acesso negado." };
  await db.business.update({
    where: { id: businessId },
    data: { isActive: false, published: false },
  });
  revalidatePath("/admin");
  return { success: true };
}

export async function adminAddDaysToBusiness(
  businessId: string,
  monthsToAdd: number = 1,
) {
  if (!(await requireAdmin())) return { error: "Acesso negado." };

  try {
    // 1. Busca o negócio e já traz os dados do dono (user) junto
    const business = await db.business.findUnique({
      where: { id: businessId },
      include: { user: true }, // Precisamos do usuário para atualizar a Role dele
    });

    if (!business) return { error: "Negócio não encontrado." };

    const now = new Date();

    // Calcula a nova data baseada na expiração atual do NEGÓCIO
    const base =
      business.expiresAt && new Date(business.expiresAt) > now
        ? new Date(business.expiresAt)
        : now;

    const newDate = new Date(base);
    newDate.setMonth(newDate.getMonth() + monthsToAdd);

    // 2. Atualiza o negócio adicionando o tempo e garantindo que está ativo
    await db.business.update({
      where: { id: businessId },
      data: {
        expiresAt: newDate,
        isActive: true, // Garante que a vitrine volte ao ar
        subscriptionStatus: "active",
      },
    });

    // 3. Garante que o dono do negócio tenha a plaquinha de ASSINANTE
    if (business.user.role !== "ASSINANTE") {
      await db.user.update({
        where: { id: business.userId },
        data: { role: "ASSINANTE" as Role },
      });
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erro no adminAddDays:", error);
    return { error: "Erro ao adicionar tempo." };
  }
}
export async function adminActivateVisitor(userId: string, daysToAdd: number) {
  const adminId = await requireAdmin(); // Certifique-se de que isso funciona no seu código atual
  if (!adminId) return { error: "Acesso negado." };

  try {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return { error: "Usuário não encontrado." };

    const newDate = new Date();
    newDate.setDate(newDate.getDate() + daysToAdd);

    // 1. Cria a vitrine âncora com os dados obrigatórios do Schema
    await db.business.create({
      data: {
        userId: userId,
        name: "Vitrine Oculta",
        slug: `loja-${userId.substring(0, 8)}-${Date.now().toString().slice(-4)}`,
        category: "Geral",
        planType: "monthly" as PlanType, // 🛡️ Tipagem segura do TS
        subscriptionStatus: "active", // ⬅️ Nova linha vital: já nasce ativa!
        isActive: true,
        published: false,
        expiresAt: newDate,
      },
    });

    // 2. Vira a chave de Visitante para Assinante
    await db.user.update({
      where: { id: userId },
      data: { role: "ASSINANTE" as Role }, // 🛡️ Tipagem segura do TS
    });

    revalidatePath("/admin");
    return { success: true, message: "Vitrine âncora criada e ativada!" };
  } catch (error) {
    console.error("Erro ao criar vitrine âncora:", error);
    return { error: "Erro interno ao ativar visitante." };
  }
}

export async function setInitialPassword(password: string) {
  if (password?.length > 100)
    return { error: "A senha excede o limite máximo permitido." };
  const user = await getSafeUser();
  if (!user) return { error: "Não autorizado." };

  try {
    const dbUser = await db.user.findUnique({ where: { id: user.id } });
    if (dbUser?.password) {
      return { error: "Você já possui uma senha cadastrada." };
    }
    const hashedPassword = await hash(password, 10);
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    return { success: true };
  } catch (error) {
    return { error: "Erro ao definir senha." };
  }
}
// 🚀 ATUALIZAÇÃO SÊNIOR: A função não precisa mais receber parâmetros. Ela busca a assinatura sozinha!
export async function cancelSubscriptionAction() {
  const session = await getSafeUser();
  if (!session) return { error: "Não autorizado." };

  const userId = session.id;

  try {
    // 1. Localiza a loja que possui a assinatura ativa
    const business = await db.business.findFirst({
      where: {
        userId: userId,
        mpSubscriptionId: { not: null },
      },
      select: { id: true, mpSubscriptionId: true },
    });

    if (!business || !business.mpSubscriptionId) {
      return { error: "Nenhuma assinatura ativa encontrada para cancelar." };
    }

    // 2. Avisa o Mercado Pago para interromper as cobranças futuras
    const preApproval = new PreApproval(client);
    await preApproval.update({
      id: business.mpSubscriptionId,
      body: { status: "cancelled" },
    });

    // 3. Atualizamos o banco: Removemos o ID da assinatura (para parar o vínculo)
    // Mas MANTEMOS 'isActive: true' e o 'expiresAt' intacto.
    await db.business.update({
      where: { id: business.id },
      data: {
        mpSubscriptionId: null,
        subscriptionStatus: "cancelled",
      },
    });

    revalidatePath("/dashboard/perfil");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Erro ao cancelar recorrência:", error);
    return { error: "Falha ao cancelar a renovação. Tente novamente." };
  }
}
// ==============================================================================
// 5. RECUPERAÇÃO DE SENHA (ESQUECI MINHA SENHA)
// ==============================================================================

export async function sendPasswordResetEmail(formData: FormData) {
  const email = formData.get("email") as string;

  // 🚀 ESCUDO ANTI-DDoS DE BANCO DE DADOS
  if (!email || email.length > 100) {
    return { error: "E-mail obrigatório ou inválido." };
  }

  // 🛡️ RATE LIMIT INTERNO: 3 tentativas por hora por IP
  if (resetRatelimit) {
    const headersList = await headers();
    const ip =
      headersList.get("x-vercel-forwarded-for") ??
      headersList.get("x-forwarded-for") ??
      "127.0.0.1";
    const { success } = await resetRatelimit.limit(`reset:${ip}`);
    if (!success) {
      return {
        error:
          "Muitas tentativas. Aguarde 1 hora antes de solicitar novamente.",
      };
    }
  }

  const existingUser = await db.user.findUnique({ where: { email } });

  // Por segurança, se o usuário não existe, não damos erro, apenas fingimos que enviamos.
  if (!existingUser) {
    return { success: true };
  }

  // 🛡️ TRAVA ANTI-SPAM DE E-MAIL (Protege seu bolso no Resend)
  // Verifica se já enviamos um e-mail para este cara nos últimos 2 minutos
  const tokenExistente = await db.passwordResetToken.findFirst({
    where: { email },
    orderBy: { expires: "desc" },
  });

  if (tokenExistente) {
    // Como o token dura 60 min, se ele vai expirar em MAIS de 58 min, significa que foi criado há menos de 2 min.
    const tempoRestanteMs =
      new Date(tokenExistente.expires).getTime() - new Date().getTime();
    if (tempoRestanteMs > 58 * 60 * 1000) {
      return {
        error: "Aguarde alguns minutos antes de solicitar um novo e-mail.",
      };
    }
  }

  // Gera um token simples e data de expiração (1 hora)
  const token = crypto.randomUUID();
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  // Salva o token no banco (apagando anteriores desse email se houver)
  await db.passwordResetToken.deleteMany({ where: { email } });
  await db.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  // Link para a página que você escolheu manter (nova-senha)
  // 🚀 BLINDAGEM DO DOMÍNIO
  const domain =
    process.env.NODE_ENV === "production"
      ? "https://tafanu.com.br"
      : "http://localhost:3000";
  const resetLink = `${domain}/nova-senha?token=${token}`;

  try {
    await resend.emails.send({
      from: "Equipe Tafanu <sistema@tafanu.com.br>",
      to: email,
      subject: "Redefinir sua senha - Tafanu",
      html: `<p>Você solicitou a troca de senha. Clique no link abaixo para criar uma nova:</p>
             <p><a href="${resetLink}"><strong>Criar Nova Senha</strong></a></p>
             <p>Este link expira em 1 hora.</p>`,
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return { error: "Erro ao enviar e-mail." };
  }
}

export async function resetPassword(token: string | null, formData: FormData) {
  // 🚀 PROTEÇÃO ANTI-INJEÇÃO: O token precisa existir e ser um UUID válido (36 caracteres)
  if (!token || typeof token !== "string" || token.length !== 36) {
    return { error: "Link de recuperação inválido ou corrompido." };
  }

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // 🚀 ESCUDO ANTI-CPU EXHAUSTION (Bcrypt)
  if (password?.length > 100 || confirmPassword?.length > 100) {
    return { error: "A senha excede o limite máximo permitido." };
  }

  if (!password || !confirmPassword) {
    return { error: "Preencha todos os campos." };
  }

  if (password !== confirmPassword) {
    return { error: "As senhas não coincidem." };
  }

  if (password.length < 6) {
    return { error: "A senha deve ter no mínimo 6 caracteres." };
  }

  // Busca o token no banco
  const existingToken = await db.passwordResetToken.findUnique({
    where: { token },
  });

  if (!existingToken) {
    return { error: "Token inválido." };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) {
    return { error: "Este link expirou. Solicite um novo." };
  }

  const existingUser = await db.user.findUnique({
    where: { email: existingToken.email },
  });

  if (!existingUser) {
    return { error: "Usuário não encontrado." };
  }

  const hashedPassword = await hash(password, 10);

  // Atualiza a senha e apaga o token usado
  await db.user.update({
    where: { id: existingUser.id },
    data: { password: hashedPassword },
  });

  await db.passwordResetToken.delete({
    where: { id: existingToken.id },
  });

  return { success: true };
}

export async function runGarbageCollector() {
  // 1. Verifica se é ADMIN
  if (!(await requireAdmin())) return { error: "Acesso negado." };

  try {
    console.log("🚛 Iniciando verificação de integridade...");

    // 2. Busca TODAS as URLs de imagens que estão EM USO no banco
    const businesses = await db.business.findMany({
      select: {
        imageUrl: true,
        coverImage: true, // 🚀 SALVANDO A CAPA DO LIXO!
        catalogPdf: true,
        gallery: true,
        mediaFeed: true,
        products: { select: { imageUrl: true } }, // 🚀 SALVANDO AS FOTOS DOS LANCHES!
      },
    });

    // 3. Cria a lista de chaves VÁLIDAS (usando o extrator robusto)
    const validKeys = new Set<string>();

    businesses.forEach((b) => {
      const add = (url: string | null) => {
        const key = getKeyFromUrl(url);
        if (key) validKeys.add(key);
      };

      add(b.imageUrl);
      add(b.coverImage); // 🚀 AVISANDO O ROBÔ QUE A CAPA É VÁLIDA!
      add(b.catalogPdf);
      // Procura na galeria antiga
      if (b.gallery && Array.isArray(b.gallery)) {
        b.gallery.forEach((img) => add(img));
      }

      // Procura fotos no mediaFeed novo para não deletar sem querer
      if (b.mediaFeed && Array.isArray(b.mediaFeed)) {
        b.mediaFeed.forEach((item: any) => {
          if (item && item.type === "image" && item.url) {
            add(item.url);
          }
        });
      }

      // 🚀 SALVA OS PRODUTOS
      if (b.products && b.products.length > 0) {
        b.products.forEach((p) => add(p.imageUrl));
      }
    });

    console.log(`✅ Chaves ativas encontradas no Banco: ${validKeys.size}`);

    // --- TRAVA DE SEGURANÇA ---
    // Se temos negócios no banco, mas activeKeys é 0, algo deu errado na leitura.
    // ABORTAR para não apagar tudo.
    if (businesses.length > 0 && validKeys.size === 0) {
      console.error(
        "🚨 ERRO CRÍTICO: Banco não está vazio, mas nenhuma chave de imagem foi detectada. Abortando para segurança.",
      );
      return {
        error:
          "Erro de segurança: Não foi possível ler as imagens do banco. Nada foi apagado.",
      };
    }
    // ---------------------------

    // 🚀 CIRURGIA DE CUSTO: Varredura com Paginação Total para limpar todo o servidor AWS
    const filesToDelete: string[] = [];
    let hasMore = true;
    let currentOffset = 0;

    while (hasMore) {
      const utFiles = await utapi.listFiles({
        limit: 500,
        offset: currentOffset,
      });

      if (!utFiles || utFiles.files.length === 0) {
        hasMore = false;
        break;
      }

      utFiles.files.forEach((file) => {
        if (!validKeys.has(file.key)) {
          filesToDelete.push(file.key);
        }
      });

      // Atualiza para a próxima página
      if (utFiles.hasMore) {
        currentOffset += 500;
      } else {
        hasMore = false;
      }
    }

    console.log(`🗑️ Lixo identificado: ${filesToDelete.length} arquivos.`);

    // 6. Deleta em lotes para não estourar a API (Chunks de 500)
    if (filesToDelete.length > 0) {
      for (let i = 0; i < filesToDelete.length; i += 500) {
        const chunk = filesToDelete.slice(i, i + 500);
        await utapi.deleteFiles(chunk);
      }
      return {
        success: true,
        message: `Faxina concluída! ${filesToDelete.length} arquivos inúteis foram apagados.`,
      };
    }

    return {
      success: true,
      message: "O sistema está limpo! Nenhum lixo encontrado.",
    };
  } catch (error) {
    console.error("Erro na faxina:", error);
    return { error: "Erro interno ao rodar faxina." };
  }
}

export async function getActiveCategories() {
  try {
    // 🚀 ADICIONA A REGRA DAS 48H NA BARRA DE CATEGORIAS!
    const limiteCarencia = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const categories = await db.business.groupBy({
      by: ["category"],
      where: {
        published: true,
        isActive: true,
        OR: [{ expiresAt: { gte: limiteCarencia } }, { expiresAt: null }],
      },
      _count: {
        category: true,
      },
    });

    return categories
      .map((c) => c.category)
      .filter(Boolean)
      .sort();
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return [];
  }
}

// ==============================================================================
// 6. SISTEMA DE AFILIADOS (ADMIN)
// ==============================================================================

/**
 * Transforma um usuário em AFILIADO e define seu código único de indicação.
 */
export async function promoteToAffiliate(userId: string, code: string) {
  if (code?.length > 50) return { error: "Código inválido ou muito longo." };
  // 1. Verificação de segurança: apenas você (Admin) pode rodar isso
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Acesso negado." };

  try {
    // 2. Limpa o código (remove espaços e coloca em minúsculo)
    const cleanCode = code.trim().toLowerCase().replace(/\s+/g, "-");

    if (!cleanCode || cleanCode.length < 3) {
      return { error: "O código deve ter pelo menos 3 caracteres." };
    }

    // 3. Verifica se este código já existe para OUTRA pessoa
    const existingUserWithCode = await db.user.findUnique({
      where: { referralCode: cleanCode },
    });

    if (existingUserWithCode && existingUserWithCode.id !== userId) {
      return { error: "Este código já está sendo usado por outro parceiro." };
    }

    // 4. Atualiza o usuário no banco
    await db.user.update({
      where: { id: userId },
      data: {
        role: "AFILIADO" as Role,
        referralCode: cleanCode,
        affiliateSince: new Date(), // ⬅️ Adicione isso para começar a contar o "Mês 1"
      },
    });

    // 5. Limpa o cache para a mudança aparecer na hora
    revalidatePath("/admin");

    return {
      success: true,
      message: `Agora o usuário é um Afiliado com o código: ${cleanCode}`,
    };
  } catch (error) {
    console.error("Erro ao promover afiliado:", error);
    return { error: "Erro interno ao processar a promoção." };
  }
}
// ==========================================
// SEGURANÇA DE COOKIE PARA AFILIADOS
// ==========================================
export async function setAffiliateCookie(refCode: string) {
  if (!refCode || refCode.length > 50) return; // Guarda básica de tamanho
  const cookieStore = await cookies();

  // 🚀 SANITIZAÇÃO DE ELITE: Remove espaços e padroniza em minúsculas para evitar erros de digitação
  const cleanCode = refCode.trim().toLowerCase();

  // 🛡️ VALIDAÇÃO CONTRA BANCO: Só grava cookie se o afiliado existir e estiver ativo
  const affiliateExists = await db.user.findFirst({
    where: { referralCode: cleanCode, role: "AFILIADO" },
    select: { id: true },
  });

  if (!affiliateExists) return; // Código inválido — não grava nada

  // 🛡️ Grava de forma segura, com HttpOnly e duração de 7 dias
  cookieStore.set("tafanu_ref", cleanCode, {
    maxAge: 7 * 24 * 60 * 60, // 7 Dias em segundos
    httpOnly: true, // 🔒 Proíbe scripts maliciosos de lerem o cookie na tela
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // 🚀 VITAL PARA AFILIADOS: Garante que o cookie seja gravado vindo de links externos (Instagram, WhatsApp)
    path: "/",
  });
}

// ==============================================================================
// 📊 ESTATÍSTICAS DO AFILIADO (NOVO MODELO SEGURO + CRM DE VENDAS)
// ==============================================================================
export async function getAffiliateStats() {
  const sessionUser = await getSafeUser();
  if (
    !sessionUser ||
    (sessionUser.role !== "AFILIADO" && sessionUser.role !== "ADMIN")
  ) {
    return { error: "Não autorizado." };
  }

  try {
    const userId = sessionUser.id;
    const partner = await db.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });

    // 1. FINANCEIRO: Pega todas as comissões do afiliado
    const commissions = await db.commission.findMany({
      where: { affiliateId: userId },
    });

    let pendente = 0;
    let disponivel = 0;
    let pago = 0;
    const hoje = new Date();

    commissions.forEach((c) => {
      if (c.status === "PAID") {
        pago += c.amount;
      } else if (c.status === "PENDING" && c.releaseDate > hoje) {
        pendente += c.amount;
      } else if (
        c.status === "AVAILABLE" ||
        (c.status === "PENDING" && c.releaseDate <= hoje)
      ) {
        disponivel += c.amount;
      }
    });

    // 2. CRM DE VENDAS: Busca todos os usuários indicados por ele
    const indicados = await db.user.findMany({
      where: { affiliateId: userId },
      take: 500, // 🚀 TRAVA ANTI-BOMBA DE MEMÓRIA (Limita a 500 leads recentes na memória)
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        lastLogin: true,
        // 🚀 ATUALIZAÇÃO: Removidos planType/expiresAt daqui.
        // Agora pegamos as assinaturas através dos negócios do indicado:
        businesses: {
          select: {
            slug: true,
            planType: true,
            expiresAt: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 🚀 ATUALIZAÇÃO: Um cliente é ativo se ele tem a role ASSINANTE e PELO MENOS UM negócio com data válida
    const clientesAtivos = indicados.filter(
      (i) =>
        i.role === "ASSINANTE" &&
        i.businesses.some(
          (b) => b.isActive && b.expiresAt && b.expiresAt > hoje,
        ),
    ).length;

    return {
      success: true,
      referralCode: partner?.referralCode,
      stats: { pendente, disponivel, pago, vendasConfirmadas: clientesAtivos },
      indicados, // ⬅️ A lista agora leva o array 'businesses' completo com os dados do plano
    };
  } catch (error) {
    console.error("Erro no getAffiliateStats:", error);
    return { error: "Erro interno ao carregar painel." };
  }
}
// ==============================================================================
// 🌟 BUSCAR DADOS DO PAINEL DO PARCEIRO (AFILIADO)
// ==============================================================================
export async function getAffiliateDashboardData() {
  const sessionUser = await getSafeUser();
  if (!sessionUser || sessionUser.role !== "AFILIADO") {
    return { error: "Acesso negado." };
  }

  try {
    // 1. Puxa os dados financeiros do Afiliado (Comissões e Saques)
    const affiliate = await db.user.findUnique({
      where: { id: sessionUser.id },
      include: {
        commissions: {
          orderBy: { createdAt: "desc" },
          include: { business: { select: { name: true, slug: true } } },
        },
        withdrawals: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!affiliate) return { error: "Parceiro não encontrado." };

    // 2. 🚀 CIRURGIA DE DIVISÃO ATÔMICA
    const selectCampos = {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      role: true,
      lastLogin: true,
      businesses: {
        select: {
          slug: true,
          isActive: true,
          planType: true,
          expiresAt: true,
          mpSubscriptionId: true, // ⬅️ O BANCO LÊ ISSO
          subscriptionStatus: true,
          createdAt: true,
        },
      },
    };

    // Promise.all executa as duas buscas ao mesmo tempo no banco, economizando tempo
    const [assinantes, leads] = await Promise.all([
      db.user.findMany({
        where: {
          affiliateId: sessionUser.id,
          role: "ASSINANTE",
          NOT: { id: sessionUser.id },
        },
        take: 150,
        select: selectCampos,
        orderBy: { createdAt: "desc" },
      }),
      db.user.findMany({
        where: {
          affiliateId: sessionUser.id,
          role: "VISITANTE",
          NOT: { id: sessionUser.id },
        },
        take: 150,
        select: selectCampos,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Junta as duas listas originais
    const combinedClients = [...assinantes, ...leads];

    // 🛡️ DATA MASKING: A Mágica! Apaga o ID perigoso antes de mandar pro front-end
    const safeClients = combinedClients.map((client) => ({
      ...client,
      businesses: client.businesses.map((b) => {
        const isMercadoPago = !!b.mpSubscriptionId; // Cria a flag de segurança
        const { mpSubscriptionId, ...safeBusiness } = b; // Arranca o ID transacional daqui
        return { ...safeBusiness, isMercadoPago }; // Devolve a loja blindada
      }),
    }));

    return {
      success: true,
      withdrawals: affiliate.withdrawals,
      affiliate: {
        id: affiliate.id,
        name: affiliate.name,
        referralCode: affiliate.referralCode,
      },
      clients: safeClients, // 🚀 Agora enviamos a lista blindada
      commissions: affiliate.commissions,
    };
  } catch (error) {
    console.error("Erro no getAffiliateDashboardData:", error);
    return { error: "Erro ao carregar dados do parceiro." };
  }
}

// ==============================================================================
// 🔄 VINCULAR CLIENTE A UM PARCEIRO MANUALMENTE
// ==============================================================================
export async function assignUserToAffiliate(
  userId: string,
  input: string, // Mudamos para 'input' para aceitar o link completo ou só o código
) {
  if (input?.length > 255) return { error: "Link ou código muito longo." };
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Não autorizado." };

  try {
    // 🚀 Lógica para extrair o código se o Admin colar o link completo
    let finalCode = input.trim();
    if (input.includes("?ref=")) {
      finalCode = input.split("?ref=")[1].split("&")[0];
    }

    // Busca o parceiro (case-insensitive)
    const affiliate = await db.user.findFirst({
      where: {
        referralCode: {
          equals: finalCode.toLowerCase(),
          mode: "insensitive",
        },
        role: "AFILIADO",
      },
    });

    if (!affiliate) {
      return { error: `Parceiro com o código "${finalCode}" não encontrado.` };
    }

    if (userId === affiliate.id) {
      return { error: "O usuário não pode ser afiliado de si mesmo." };
    }

    // 🚀 TRANSACTION: Garante que o vínculo no User e no Log aconteçam juntos
    await db.$transaction([
      // 1. Atualiza o 'pai' do usuário na tabela User
      db.user.update({
        where: { id: userId },
        data: { affiliateId: affiliate.id },
      }),

      // 2. UPSERT: A chave para permitir trocas.
      // Se já existe um log de indicação, ele atualiza. Se não, ele cria.
      db.referralLog.upsert({
        where: { referredId: userId },
        update: { affiliateId: affiliate.id },
        create: {
          referredId: userId,
          affiliateId: affiliate.id,
        },
      }),
    ]);

    revalidatePath("/admin");
    return {
      success: true,
      message: `Cliente vinculado a ${affiliate.name} com sucesso!`,
    };
  } catch (error) {
    console.error("Erro ao vincular:", error);
    return { error: "Erro interno ao processar o vínculo." };
  }
}
// ==============================================================================
// 💸 ADMIN: VER QUEM TEM DINHEIRO PARA RECEBER
// ==============================================================================
export async function getAffiliatePayouts() {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Não autorizado." };

  try {
    const partners = await db.user.findMany({
      where: { role: "AFILIADO" as Role },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        commissions: {
          where: {
            status: CommissionStatus.AVAILABLE,
          },
          include: {
            business: { select: { name: true, slug: true } }, // 🚀 PUXA O NOME DA LOJA!
          },
        },
      },
    });

    const payoutData = partners
      .map((p) => {
        const valorDevido = p.commissions.reduce((acc, c) => acc + c.amount, 0);
        return {
          id: p.id,
          name: p.name,
          email: p.email,
          phone: p.phone,
          valorDevido: valorDevido,
          comissoesOrigem: p.commissions, // 🚀 MANDA PARA O FRONT
        };
      })
      .filter((p) => p.valorDevido > 0);

    return { success: true, payouts: payoutData };
  } catch (error) {
    return { error: "Erro ao calcular pagamentos." };
  }
}
// 2. Registra o pagamento, GERA O RECIBO OFICIAL (Withdrawal) e "Zera" o saldo
export async function markAffiliateAsPaid(affiliateId: string) {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Não autorizado." };

  try {
    // 1. Busca quais são as comissões EXATAS que estão sendo pagas agora
    const comissoesDisponiveis = await db.commission.findMany({
      where: {
        affiliateId: affiliateId,
        status: CommissionStatus.AVAILABLE,
      },
      select: { id: true, amount: true },
    });

    if (comissoesDisponiveis.length === 0) {
      return { error: "Nenhuma comissão disponível para pagar." };
    }

    // 2. Faz a matemática e junta os IDs para carimbar depois
    const valorTotalDoSaque = comissoesDisponiveis.reduce(
      (acc, c) => acc + c.amount,
      0,
    );
    const idsDasComissoes = comissoesDisponiveis.map((c) => c.id);

    // 3. Busca a chave PIX do parceiro (Usa o CPF/CNPJ ou Telefone cadastrado)
    const parceiro = await db.user.findUnique({
      where: { id: affiliateId },
      select: { document: true, phone: true, email: true },
    });

    // Fallback inteligente: se ele não preencheu o documento, usa o telefone ou e-mail
    const chavePixDoRecibo =
      parceiro?.document ||
      parceiro?.phone ||
      parceiro?.email ||
      "Chave não informada";

    // 🚀 A VACINA ANTI-SAQUE DUPLO
    await db.$transaction(async (tx) => {
      // A. Primeiro, tentamos "sequestrar" as comissões disponíveis carimbando-as como PAID
      // Se 50 cliques chegarem juntos, o banco de dados enfileira e só o 1º consegue alterar o status!
      const updateResult = await tx.commission.updateMany({
        where: {
          id: { in: idsDasComissoes },
          status: "AVAILABLE", // 🛡️ Trava absoluta: só atualiza se AINDA estiver disponível
        },
        data: { status: "PAID" },
      });

      // 🚀 B. BLINDAGEM FINANCEIRA (RACE CONDITION):
      // Garante que o banco sequestrou EXATAMENTE a quantidade de comissões que o valor PIX calculou.
      // Se outro clique rápido roubou 1 centavo dessa fila, aborta para não pagar a mais.
      if (updateResult.count !== idsDasComissoes.length) {
        throw new Error(
          "Conflito de requisição detectado. O saque foi cancelado por segurança. Tente novamente.",
        );
      }

      // C. Agora que o dinheiro está isolado de forma segura, geramos o Recibo (Withdrawal)
      const reciboDeSaque = await tx.withdrawal.create({
        data: {
          affiliateId: affiliateId,
          amount: valorTotalDoSaque,
          pixKey: chavePixDoRecibo,
          status: "APPROVED",
          paidAt: new Date(),
        },
      });

      // D. E vinculamos o ID do recibo nas comissões que acabamos de pagar
      await tx.commission.updateMany({
        where: { id: { in: idsDasComissoes } },
        data: { withdrawalId: reciboDeSaque.id },
      });

      // E. Atualiza a data do último pagamento no perfil do usuário
      await tx.user.update({
        where: { id: affiliateId },
        data: { lastPayoutDate: new Date() },
      });
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard/parceiro");

    return {
      success: true,
      message: `Sucesso! Saque de R$ ${valorTotalDoSaque.toFixed(2)} registrado e recibo gerado.`,
    };
  } catch (error) {
    console.error("Erro crítico ao registrar pagamento:", error);
    return { error: "Erro interno ao gerar o recibo de pagamento." };
  }
}
// 🚀 CONSULTA DE ELEGIBILIDADE AO TRIAL (Para o Frontend não prometer teste grátis indevido)
export async function checkTrialStatus() {
  const session = await auth();
  if (!session?.user?.id) return { eligible: false };
  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      businesses: {
        select: {
          mpSubscriptionId: true,
          subscriptionStatus: true,
          expiresAt: true,
        },
      },
    },
  });
  const hasUsedTrial = dbUser?.businesses?.some(
    (b) =>
      b.mpSubscriptionId !== null ||
      (b.subscriptionStatus !== null && b.subscriptionStatus !== "inactive") ||
      b.expiresAt !== null,
  );
  return { eligible: !hasUsedTrial };
}

export async function createSubscription(
  userId: string,
  userEmail: string,
  businessId: string,
  planType: "monthly" | "quarterly" | "yearly" = "monthly",
) {
  const session = await auth();
  if (session?.user?.id !== userId) {
    return { error: "Não autorizado." };
  }

  // 🛡️ CFO & CTO FIX: Trava anti-spam no gateway de pagamento!
  // Evita cliques duplos ou bots gerando cobranças duplicadas ou derrubando a API do Mercado Pago.
  if (storeActionRatelimit) {
    const { success } = await storeActionRatelimit.limit(`checkout_${userId}`);
    if (!success) {
      return {
        error:
          "Você já gerou um link de pagamento há poucos segundos. Aguarde um momento e tente novamente.",
      };
    }
  }

  // =========================================================================
  // 🚀 TRAVA ANTI-PAGAMENTO FANTASMA: Impede a conta de teste de assinar!
  // =========================================================================
  if (userEmail.toLowerCase().endsWith("@tafanu.com.br")) {
    return {
      error:
        "Contas de demonstração não geram pagamentos. Crie uma conta com seu e-mail pessoal e contate seu consultor para transferirmos a loja para você!",
    };
  }
  // =========================================================================

  // 1. Busca o usuário e os negócios dele para checar a regra do Trial
  const dbUser = await db.user.findUnique({
    where: { id: userId },
    include: { businesses: true },
  });

  if (dbUser?.isBanned) {
    return { error: "Sua conta possui restrições." };
  }

  // 🚀 O PULO DO GATO: Lógica inteligente para o businessId vazio
  let finalBusinessId = businessId;

  if (!finalBusinessId) {
    // 🚀 VACINA DE ALINHAMENTO: Garante que a assinatura trave na loja correta (a mais recente/ativa)
    const sortedBusinesses = dbUser?.businesses
      ? [...dbUser.businesses].sort((a, b) => {
          const dateA = a.expiresAt ? new Date(a.expiresAt).getTime() : 0;
          const dateB = b.expiresAt ? new Date(b.expiresAt).getTime() : 0;
          return dateB - dateA; // Ordena da maior expiração para a menor
        })
      : [];

    const firstBusiness = sortedBusinesses[0];

    if (firstBusiness) {
      finalBusinessId = firstBusiness.id;
    } else {
      // 🏗️ VISITANTE NOVO: Cria uma loja fantasma (Gaveta) para ancorar a assinatura!
      try {
        const novaLoja = await db.business.create({
          data: {
            userId: userId,
            name: "Minha Vitrine",
            slug: `vitrine-${userId.substring(0, 5)}-${Date.now()}`,
            category: "Geral",
            planType: planType as PlanType, // 🛡️ Já grava qual plano ele escolheu
            subscriptionStatus: "inactive", // ⬅️ Nasce inativa, esperando o Mercado Pago confirmar!
            isActive: false,
            published: false,
          },
        });
        finalBusinessId = novaLoja.id;
      } catch (e) {
        console.error("Erro ao criar Loja Gaveta:", e);
        return { error: "Erro ao preparar sua vitrine." };
      }
    }
  } else {
    // 🛡️ SEGURANÇA: Se enviou um ID, garante que a loja existe e pertence a ele
    const targetBusinessCheck = dbUser?.businesses.find(
      (b) => b.id === finalBusinessId,
    );
    if (!targetBusinessCheck) {
      return { error: "Negócio não encontrado ou não pertence a você." };
    }
  }

  // =========================================================================
  // 🚀 AQUI COMEÇA A NOVA BLINDAGEM ANTI-ZUMBI (Com Inteligência Temporal)
  // =========================================================================
  const businessToProtect = dbUser?.businesses.find(
    (b) => b.id === finalBusinessId,
  );

  if (businessToProtect) {
    const isExpired = businessToProtect.expiresAt
      ? new Date() > new Date(businessToProtect.expiresAt)
      : false;

    // Se ele já tem uma assinatura ATIVA com o MP e AINDA TEM DIAS DE SOBRA, é proibido criar outra!
    if (
      businessToProtect.mpSubscriptionId &&
      businessToProtect.subscriptionStatus === "active" &&
      !isExpired
    ) {
      return {
        error:
          "Você já possui uma assinatura ativa e a renovação é automática! Se deseja alterar o plano, cancele a assinatura atual no seu painel primeiro.",
      };
    }

    // 🚀 A VACINA ANTI-COBRANÇA DUPLA:
    // Se a conta já venceu e ele está criando uma nova assinatura manualmente,
    // nós matamos o contrato antigo no Mercado Pago para evitar que ele tente cobrar de surpresa.
    if (businessToProtect.mpSubscriptionId && isExpired) {
      try {
        console.log(
          `📡 [Checkout] Cancelando assinatura zumbi antiga: ${businessToProtect.mpSubscriptionId}`,
        );
        const preApprovalClient = new PreApproval(client);
        await preApprovalClient.update({
          id: businessToProtect.mpSubscriptionId,
          body: { status: "cancelled" },
        });
      } catch (mpCancelError) {
        // Deixamos passar silencioso para não travar a compra se a assinatura já estiver cancelada lá no MP
        console.error("⚠️ Erro ao limpar assinatura antiga:", mpCancelError);
      }
    }
  }
  // =========================================================================

  // 2. REGRA DO TRIAL (LEÃO DE CHÁCARA): A TRAVA CONTRA O TRIAL INFINITO
  // Se a loja tem um ID do MP OU já saiu do status 'inactive' OU tem data, o trial acaba.
  const hasUsedTrial = dbUser?.businesses.some(
    (b) =>
      b.mpSubscriptionId !== null ||
      (b.subscriptionStatus !== null && b.subscriptionStatus !== "inactive") ||
      b.expiresAt !== null,
  );

  const subscriptionClient = new PreApproval(client);

  const planConfigs = {
    monthly: {
      amount: 39.9, // Nova âncora mensal
      reason: "Assinatura Tafanu PRO - Mensal",
      trialDays: hasUsedTrial ? 0 : 7, // Mantemos o trial apenas aqui
    },
    quarterly: {
      amount: 104.7, // R$ 34,90 por mês
      reason: "Assinatura Tafanu PRO - Trimestral",
      trialDays: 0, // Sem trial para proteger o caixa
    },
    yearly: {
      amount: 358.8, // R$ 29,90 por mês (A oferta matadora)
      reason: "Assinatura Tafanu PRO - Anual",
      trialDays: 0, // Sem trial para proteger o caixa
    },
  };

  const config = planConfigs[planType];
  if (!config) {
    return {
      error: "Plano inválido selecionado. Atualize a página e tente novamente.",
    };
  }
  try {
    const body = {
      reason: config.reason,
      payer_email: userEmail,
      auto_recurring: {
        frequency:
          planType === "quarterly" ? 3 : planType === "yearly" ? 12 : 1,
        frequency_type: "months",
        transaction_amount: config.amount,
        currency_id: "BRL",
        ...(config.trialDays > 0 && {
          free_trial: {
            frequency: config.trialDays,
            frequency_type: "days",
          },
        }),
      },
      back_url: "https://tafanu.com.br/checkout/sucesso",

      // 🚀 AGORA SIM: Enviamos o finalBusinessId garantido para o Webhook!
      external_reference: `${userId}___${finalBusinessId}`,
    };

    const response = await subscriptionClient.create({ body });

    return { success: true, init_point: response.init_point };
  } catch (error) {
    console.error("Erro MP:", error);
    return { error: "Erro ao gerar checkout." };
  }
}

export async function getAuthSession() {
  const session = await auth(); // Usa a função auth() que você já tem importada lá no topo

  if (!session?.user?.id) return null;

  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
  };
}
export async function getBusinessExpiration() {
  const session = await auth();
  if (!session?.user?.id) return null;

  // 🚀 CIRURGIA: Obriga o Prisma a pegar a loja que tem a data, ignorando rascunhos!
  const biz = await db.business.findFirst({
    where: {
      userId: session.user.id,
      expiresAt: { not: null },
    },
    orderBy: { expiresAt: "desc" },
    select: { expiresAt: true },
  });

  return biz?.expiresAt || null;
}
// 🔨 BANIR USUÁRIO, CANCELAR PAGAMENTO E DERRUBAR ANÚNCIOS

export async function banUserAction(userId: string) {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Acesso negado." };

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        businesses: { select: { id: true, mpSubscriptionId: true } },
      },
    });

    if (!user) return { error: "Usuário não encontrado." };

    // 1. Cancelamento no Mercado Pago (Fora da Transaction para não travar o Banco)
    for (const biz of user.businesses) {
      if (biz.mpSubscriptionId) {
        try {
          const preApproval = new PreApproval(client);
          await preApproval.update({
            id: biz.mpSubscriptionId,
            body: { status: "cancelled" },
          });
        } catch (mpError) {
          console.error(`Erro MP loja ${biz.id}:`, mpError);
        }
      }
    }

    // 🚀 2, 3 e 4. TRANSAÇÃO ATÔMICA: Banir, Derrubar Lojas e APAGAR Comentários
    await db.$transaction([
      // A) Banimento do Usuário
      db.user.update({
        where: { id: userId },
        data: {
          isBanned: true,
          role: "VISITANTE" as Role,
        },
      }),

      // B) Atualização das Lojas (Sincronizado com seu Prisma)
      db.business.updateMany({
        where: { userId: userId },
        data: {
          isActive: false,
          published: false,
          mpSubscriptionId: null,
          expiresAt: null,
          subscriptionStatus: "cancelled",
        },
      }),

      // C) 🚀 FAXINA DE COMENTÁRIOS: Remove tudo que o usuário já escreveu
      db.comment.deleteMany({
        where: { userId: userId },
      }),
    ]);

    revalidatePath("/admin");
    // Se você tiver uma rota de busca ou home que mostre comentários recentes, revalide-as aqui:
    revalidatePath("/");

    return {
      success: true,
      message:
        "Usuário banido, assinaturas canceladas e histórico de comentários limpo.",
    };
  } catch (error) {
    console.error("Erro ao processar banimento:", error);
    return { error: "Erro ao processar banimento completo." };
  }
}

export async function unbanUserAction(userId: string) {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Acesso negado." };

  try {
    // 1. Tira o banimento da conta
    await db.user.update({
      where: { id: userId },
      data: { isBanned: false },
    });

    revalidatePath("/");
    revalidatePath("/busca");
    revalidatePath("/admin");

    return {
      success: true,
      message: "Usuário desbanido! Ele precisará criar uma nova assinatura.",
    };
  } catch (error) {
    console.error("Erro ao desbanir:", error);
    return { error: "Erro ao desbanir usuário." };
  }
}
// ==============================================================================
// 🛠️ ADMIN: RESET DE SENHA MANUAL
// ==============================================================================
export async function forceResetPasswordAdmin(userId: string) {
  // 1. Trava de segurança: só você (Admin) pode rodar isso
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Acesso negado." };

  try {
    // Verifica se o usuário não é você mesmo (evita travamento acidental da própria conta)
    if (userId === adminId) {
      return { error: "Você não pode resetar a própria senha por aqui." };
    }

    // 🚀 HACKER FIX: Usando a biblioteca 'crypto' oficial do Node.js (que já está importada no topo do arquivo) para gerar senhas imunes a engenharia reversa.
    const novaSenhaAleatoria = crypto.randomBytes(4).toString("hex");
    const hashedPassword = await hash(novaSenhaAleatoria, 10);

    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return {
      success: true,
      message: `Sucesso! A nova senha é: ${novaSenhaAleatoria}`,
    };
  } catch (error) {
    console.error("Erro ao resetar senha:", error);
    return { error: "Falha ao resetar a senha no banco de dados." };
  }
}
// 🚀 ATUALIZAÇÃO: Mudamos o nome e agora ela pede o 'businessId'
export async function adminAddExactDaysToBusiness(
  businessId: string,
  daysToAdd: number,
) {
  const adminId = await requireAdmin(); // Certifique-se de que isso funciona no seu código atual
  if (!adminId) return { error: "Acesso negado." };

  try {
    // 1. Busca o negócio e já traz os dados do dono (user) junto
    const business = await db.business.findUnique({
      where: { id: businessId },
      include: { user: true },
    });

    if (!business) return { error: "Negócio não encontrado." };

    const now = new Date();

    // Se o negócio já tem tempo válido, soma a partir dele. Se tá vencido, soma a partir de hoje.
    const base =
      business.expiresAt && new Date(business.expiresAt) > now
        ? new Date(business.expiresAt)
        : now;

    const newDate = new Date(base);
    newDate.setDate(newDate.getDate() + daysToAdd); // Soma os dias precisos

    // 2. Atualiza o negócio com a nova data e amarra o tipo do plano para a métrica do MRR
    await db.business.update({
      where: { id: businessId },
      data: {
        expiresAt: newDate,
        isActive: true,
        subscriptionStatus: "active",
        planType:
          daysToAdd >= 360
            ? "yearly"
            : daysToAdd >= 90
              ? "quarterly"
              : "monthly", // 🚀 Sincronização inteligente de métricas
      },
    });

    // 3. Garante que o dono continue com a tag de ASSINANTE
    if (business.user.role !== "ASSINANTE") {
      await db.user.update({
        where: { id: business.userId },
        data: { role: "ASSINANTE" as Role },
      });
    }

    revalidatePath("/admin");
    return {
      success: true,
      message: `${daysToAdd} dias adicionados ao negócio com sucesso!`,
    };
  } catch (error) {
    console.error("Erro ao adicionar dias exatos:", error);
    return { error: "Erro ao adicionar dias." };
  }
}
// --- FUNÇÃO PARA GERAR TOKEN DE VERIFICAÇÃO DE E-MAIL ---
export async function generateVerificationToken(email: string) {
  const token = crypto.randomUUID();
  const expires = new Date(new Date().getTime() + 3600 * 1000 * 24); // Expira em 24h

  // Limpa tokens antigos do mesmo e-mail para não poluir o banco
  await db.verificationToken.deleteMany({
    where: { identifier: email },
  });

  const verificationToken = await db.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return verificationToken;
}
export async function verifyEmailAction(token: string) {
  try {
    const existingToken = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!existingToken) return { error: "Link de verificação inválido." };

    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) return { error: "Este link expirou. Solicite um novo." };

    const existingUser = await db.user.findUnique({
      where: { email: existingToken.identifier },
    });

    if (!existingUser) return { error: "Usuário não encontrado." };

    // 1. MARCA O USUÁRIO COMO VERIFICADO
    await db.user.update({
      where: { id: existingUser.id },
      data: { emailVerified: new Date() },
    });

    // 2. APAGA O TOKEN (Usando o token como referência, já que ele é único)
    await db.verificationToken.delete({
      where: { token: existingToken.token }, // ⬅️ CORRIGIDO AQUI
    });

    return { success: "E-mail verificado com sucesso!" };
  } catch (error) {
    console.error("Erro na verificação:", error);
    return { error: "Erro interno ao verificar e-mail." };
  }
}
export async function resendVerificationEmail(email: string) {
  // 🚀 ESCUDO ANTI-DDoS E ANTI-CUSTOS: Protege o banco e a fatura do Resend
  if (!email || email.length > 100) return { error: "E-mail inválido." };

  if (resetRatelimit) {
    const headersList = await headers();
    const ip =
      headersList.get("x-vercel-forwarded-for") ??
      headersList.get("x-forwarded-for") ??
      "127.0.0.1";
    const { success } = await resetRatelimit.limit(`resend_mail:${ip}`);
    if (!success) {
      return {
        error:
          "Muitas tentativas. Aguarde 1 hora antes de solicitar um novo envio.",
      };
    }
  }

  try {
    // 1. Busca o usuário
    const user = await db.user.findUnique({
      where: { email },
      select: { name: true, emailVerified: true },
    });

    // 🛡️ PREVENÇÃO DE ENUMERAÇÃO (PRIVACIDADE DE DADOS)
    if (!user || user.emailVerified) {
      return { success: "Novo link enviado! Verifique sua caixa de entrada." };
    }

    // 🛡️ VACINA ANTI-SPAM RESEND: Impede disparos repetidos num intervalo de 2 minutos
    const tokenExistente = await db.verificationToken.findFirst({
      where: { identifier: email },
    });

    if (tokenExistente) {
      const tempoRestanteMs =
        new Date(tokenExistente.expires).getTime() - new Date().getTime();
      const limiteDoisMinutosMs = (24 * 60 - 2) * 60 * 1000;
      if (tempoRestanteMs > limiteDoisMinutosMs) {
        return {
          error:
            "Aguarde alguns minutos antes de solicitar um novo link de ativação.",
        };
      }
    }

    // 2. Gera um novo token
    const verificationToken = await generateVerificationToken(email);

    // 🚀 BLINDAGEM DO DOMÍNIO
    const domain =
      process.env.NODE_ENV === "production"
        ? "https://tafanu.com.br"
        : "http://localhost:3000";
    const confirmLink = `${domain}/verificar-email?token=${verificationToken.token}`;

    // 3. Dispara o e-mail
    await resend.emails.send({
      from: "Tafanu <sistema@tafanu.com.br>",
      to: email,
      subject: "Novo link de ativação - Tafanu",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Olá, ${user.name}!</h2>
          <p>Você solicitou um novo link para ativar sua conta no Tafanu.</p>
          <a href="${confirmLink}" style="background-color: #0070f3; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Ativar minha conta agora</a>
          <p style="margin-top: 20px; font-size: 12px;">Se o botão não funcionar, copie este link: ${confirmLink}</p>
        </div>
      `,
    });

    return { success: "Novo link enviado! Verifique sua caixa de entrada." };
  } catch (error) {
    return { error: "Erro ao reenviar e-mail." };
  }
}
// ==========================================
// SISTEMA DE COMENTÁRIOS (UGC)
// ==========================================

export async function addComment(
  businessId: string,
  content: string,
  parentId?: string,
) {
  // 🚀 O ESCUDO ANTI-SPAM DE MEMÓRIA (Limita a 500 letras antes de bater no banco)
  if (!content || content.trim().length === 0) {
    return { success: false, error: "O comentário não pode estar vazio." };
  }
  if (content.length > 500) {
    return {
      success: false,
      error: "Seu comentário é muito longo. O limite é de 500 caracteres.",
    };
  }

  try {
    // 1. 🛡️ Segurança: Pega o ID direto da sessão autenticada do servidor
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Não autorizado." };
    }

    const userId = session.user.id;

    // 🚀 O PASSAPORTE: Exige CPF e Telefone para comentar
    const dbUser = await db.user.findUnique({
      where: { id: userId },
      select: { document: true, phone: true },
    });

    if (!dbUser?.document || !dbUser?.phone) {
      return {
        success: false,
        error:
          "Valide seu CPF e WhatsApp no 'Meu Perfil' para liberar as avaliações.",
      };
    }

    // 2. ⏳ TRAVA ANTI-FLOOD (Bloqueio de Spam)
    // Define uma janela de 15 segundos de carência entre comentários
    const quinzeSegundosAtras = new Date(Date.now() - 15 * 1000);

    const comentarioRecente = await db.comment.findFirst({
      where: {
        userId: userId,
        createdAt: { gte: quinzeSegundosAtras },
      },
      select: { id: true }, // Traz apenas o ID para a consulta ser extremamente leve
    });

    if (comentarioRecente) {
      return {
        success: false,
        error: "Calma! Aguarde 15 segundos antes de enviar outra avaliação.",
      };
    }

    // 🚀 BLINDAGEM ANTI-XSS: Neutraliza tags HTML antes de salvar no banco de dados
    const cleanContent = content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");

    // 3. Criação do comentário se passou na barreira
    const newComment = await db.comment.create({
      data: {
        content: cleanContent,
        businessId,
        userId,
        parentId: parentId || null,
      },
    });

    revalidatePath(`/site/[slug]`, "page");
    return { success: true, comment: newComment };
  } catch (error) {
    console.error("Erro ao adicionar comentário:", error);
    return { success: false, error: "Falha ao adicionar comentário." };
  }
}

export async function deleteComment(commentId: string) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Não autorizado." };

    const userId = session.user.id;
    const userRole = session.user.role; // Pego o cargo real do banco/sessão

    const comment = await db.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) return { success: false, error: "Comentário não existe." };

    // 🛡️ REGRA DE OURO: Só apaga se for o dono DO comentário OU se for ADMIN
    const isOwner = comment.userId === userId;
    const isAdmin = userRole === "ADMIN";

    if (!isOwner && !isAdmin) {
      return {
        success: false,
        error: "Você não tem permissão para apagar isso.",
      };
    }

    await db.comment.delete({ where: { id: commentId } });

    revalidatePath("/site/[slug]", "page");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao deletar." };
  }
}

export async function flagComment(commentId: string) {
  try {
    const session = await auth(); // 🛡️ Pegamos a identidade real do servidor
    if (!session?.user)
      return { success: false, error: "Logue para denunciar." };

    const comment = await db.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment)
      return { success: false, error: "Comentário não encontrado." };

    // Atualiza o comentário como denunciado e salva quem denunciou (opcional)
    await db.comment.update({
      where: { id: commentId },
      data: {
        isFlagged: true,
        flaggedBy: session.user.id, // Auditoria: saber quem denunciou
      },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro na denúncia." };
  }
}
// 🛡️ MODERAÇÃO DE COMENTÁRIOS: Limpa a denúncia e mantém o comentário no site
export async function approveComment(commentId: string) {
  // 🛡️ CONSISTÊNCIA: usa requireAdmin() igual ao resto do código
  if (!(await requireAdmin())) {
    return { error: "Acesso negado. Apenas o Admin pode aprovar comentários." };
  }

  try {
    await db.comment.update({
      where: { id: commentId },
      data: { isFlagged: false }, // 🔓 Remove o "alerta vermelho" do comentário
    });

    return { success: true, message: "Comentário aprovado e mantido no site!" };
  } catch (error) {
    console.error("Erro ao aprovar comentário:", error);
    return { success: false, error: "Erro interno ao processar a aprovação." };
  }
}

export async function getOnlineMarketplaceMetadata() {
  try {
    const limiteCarencia = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const data = await db.business.findMany({
      where: {
        isActive: true,
        published: true,
        AND: [
          {
            OR: [{ expiresAt: { gte: limiteCarencia } }, { expiresAt: null }],
          },
          {
            OR: [
              { isExternalLink: true }, // Se usa link de fora
              { menuMode: "DIGITAL" }, // Ou se usa nossa Loja Digital Interna
              { hasDelivery: true }, // Ou se ativou Delivery
            ],
          },
        ],
      },
      select: { category: true, subcategory: true },
    });

    const map: Record<string, Set<string>> = {};

    data.forEach((item) => {
      if (!map[item.category]) {
        map[item.category] = new Set();
      }
      item.subcategory?.forEach((sub) => {
        map[item.category].add(sub);
      });
    });

    const result = Object.keys(map)
      .sort()
      .map((cat) => ({
        category: cat,
        subcategories: Array.from(map[cat]).sort(),
      }));

    return result;
  } catch (error) {
    console.error("Erro ao buscar metadados do marketplace:", error);
    return [];
  }
}
// ==============================================================================
// 🌟 OS MAIS BUSCADOS (CACHE CONGELADO)
// ==============================================================================
export const getTrendingBusinesses = unstable_cache(
  async () => {
    try {
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

      // 1. BUSCA INTELIGENTE: Pega TODOS os eventos dos últimos 7 dias
      const eventos = await db.analyticsEvent.groupBy({
        by: ["businessId", "eventType"],
        where: {
          createdAt: { gte: seteDiasAtras },
        },
        _count: { _all: true },
      });

      if (eventos.length === 0) return [];

      // 2. O ALGORITMO DE SCORE HÍBRIDO
      const scoreMap = new Map<string, number>();

      eventos.forEach((evento) => {
        const id = evento.businessId;
        const count = evento._count._all;
        let pontos = 0;

        // 🎯 PESOS DO ENGAJAMENTO (Aqui lemos o WHATSAPP e o FAVORITE)
        if (evento.eventType === "VIEW") pontos = count * 1;
        else if (evento.eventType === "WHATSAPP") pontos = count * 3;
        else if (evento.eventType === "FAVORITE") pontos = count * 5;
        else pontos = count * 1;

        scoreMap.set(id, (scoreMap.get(id) || 0) + pontos);
      });

      // 3. RANKING: Ordena do maior pro menor e corta os top 6
      const topBusinessIds = Array.from(scoreMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([id]) => id);

      if (topBusinessIds.length === 0) return [];

      const limiteCarencia = new Date(Date.now() - 48 * 60 * 60 * 1000);

      // 4. Busca os dados reais respeitando a carência
      const businesses = await db.business.findMany({
        where: {
          id: { in: topBusinessIds },
          isActive: true,
          published: true,
          OR: [{ expiresAt: { gte: limiteCarencia } }, { expiresAt: null }],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
          category: true,
          luxe_quote: true,
          neighborhood: true,
          city: true,
        },
      });

      // 5. PERFORMANCE O(1): A sacada do Map para o site voar!
      const businessMap = new Map(businesses.map((b) => [b.id, b]));

      const sortedBusinesses = topBusinessIds
        .map((id) => businessMap.get(id))
        .filter(Boolean);

      return sortedBusinesses;
    } catch (error) {
      console.error("Erro ao buscar os mais buscados:", error);
      return [];
    }
  },
  ["trending-businesses-hybrid-v1"],
  { revalidate: 3600 }, // ⏱️ 1 hora de cache (O site fica vivo e quente!)
);

// ==============================================================================
// 🔄 TRANSPLANTE DE VITRINE (PRESERVA MÉTRICAS, FOTOS E PAGAMENTOS)
// ==============================================================================
export async function transferBusinessToUser(
  slugDaVitrinePronta: string,
  idDoNovoDono: string,
) {
  // 🚀 ESCUDO ANTI-PRISMA OOM (Out Of Memory)
  if (slugDaVitrinePronta?.length > 255)
    return { error: "Link inválido ou muito longo." };

  const adminId = await requireAdmin();
  if (!adminId) return { error: "Acesso negado." };

  try {
    // 1. Busca a Vitrine Pronta (Modelo) com todos os seus tesouros (Favoritos, Cliques, Views)
    const vitrinePronta = await db.business.findUnique({
      where: { slug: slugDaVitrinePronta.trim().toLowerCase() },
    });

    if (!vitrinePronta) {
      return { error: "Vitrine pronta não encontrada. Verifique o link." };
    }
    // 2. Busca a "Loja Gaveta" do novo dono
    const novoDono = await db.user.findUnique({
      where: { id: idDoNovoDono },
      include: { businesses: true },
    });

    if (!novoDono || novoDono.businesses.length === 0) {
      return {
        error:
          "O usuário não possui uma assinatura/loja base para receber o transplante.",
      };
    }

    // 🚀 A BLINDAGEM AQUI:
    // Procura a loja que tem a assinatura do Mercado Pago. Se não achar, pega a primeira.
    const lojaGaveta =
      novoDono.businesses.find((b) => b.mpSubscriptionId) ||
      novoDono.businesses[0];

    // Se a Vitrine Pronta já for da mesma pessoa, não faz nada
    if (vitrinePronta.id === lojaGaveta.id) {
      return {
        error: "A vitrine já está vinculada a este usuário perfeitamente.",
      };
    }

    // 3. TRANSAÇÃO ATÔMICA (O TRANSPLANTE REVERSO)
    await db.$transaction(async (tx) => {
      // Passo A: Para o Prisma deixar a Gaveta assumir o Slug (que é único), precisamos colocar um "lixo" no slug antigo
      await tx.business.update({
        where: { id: vitrinePronta.id },
        // 🚀 PREVENÇÃO DE COLISÃO MATEMÁTICA: Date.now + Aleatoriedade
        data: {
          slug: `lixo-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        },
      });

      // Passo B: Copia TUDO (exceto IDs e o status de assinatura) da Vitrine Pronta para a Gaveta
      await tx.business.update({
        where: { id: lojaGaveta.id },
        data: {
          name: vitrinePronta.name,
          slug: vitrinePronta.slug, // A gaveta assume o link oficial
          description: vitrinePronta.description,
          theme: vitrinePronta.theme,
          layout: vitrinePronta.layout,
          category: vitrinePronta.category,
          subcategory: vitrinePronta.subcategory,
          keywords: vitrinePronta.keywords,

          // Contadores
          whatsapp_clicks: vitrinePronta.whatsapp_clicks,
          phone_clicks: vitrinePronta.phone_clicks,
          instagram_clicks: vitrinePronta.instagram_clicks,
          facebook_clicks: vitrinePronta.facebook_clicks,
          tiktok_clicks: vitrinePronta.tiktok_clicks,
          website_clicks: vitrinePronta.website_clicks,
          map_clicks: vitrinePronta.map_clicks,
          views: vitrinePronta.views,

          // Mídia
          imageUrl: vitrinePronta.imageUrl,
          coverImage: vitrinePronta.coverImage,
          gallery: vitrinePronta.gallery,
          videos: vitrinePronta.videos,
          mediaFeed: vitrinePronta.mediaFeed as any,

          // Tags e Endereço
          features: vitrinePronta.features,
          faqs: vitrinePronta.faqs as any,
          address: vitrinePronta.address,
          number: vitrinePronta.number,
          complement: vitrinePronta.complement,
          cep: vitrinePronta.cep,
          neighborhood: vitrinePronta.neighborhood,
          city: vitrinePronta.city,
          state: vitrinePronta.state,
          latitude: vitrinePronta.latitude,
          longitude: vitrinePronta.longitude,

          // Contatos Sociais
          whatsapp: vitrinePronta.whatsapp,
          phone: vitrinePronta.phone,
          website: vitrinePronta.website,
          instagram: vitrinePronta.instagram,
          facebook: vitrinePronta.facebook,
          tiktok: vitrinePronta.tiktok,
          shopee: vitrinePronta.shopee,
          mercadoLivre: vitrinePronta.mercadoLivre,
          shein: vitrinePronta.shein,
          ifood: vitrinePronta.ifood,

          // Flags Visuais e Configurações Híbridas
          urban_tag: vitrinePronta.urban_tag,
          luxe_quote: vitrinePronta.luxe_quote,
          comercial_badge: vitrinePronta.comercial_badge,
          showroom_collection: vitrinePronta.showroom_collection,
          hasDelivery: vitrinePronta.hasDelivery,
          menuMode: vitrinePronta.menuMode,

          deliveryFee: vitrinePronta.deliveryFee,
          deliveryRadius: vitrinePronta.deliveryRadius,
          agendaConfig: vitrinePronta.agendaConfig
            ? (vitrinePronta.agendaConfig as any)
            : null,

          // O Transplante foi um sucesso, ativamos a loja pro mundo!
          published: true,
          isActive: true,
        },
      });

      // Passo C: Redirecionar as Múltiplas Relações (Favoritos, Analytics e Horários)
      await tx.favorite.updateMany({
        where: { businessId: vitrinePronta.id },
        data: { businessId: lojaGaveta.id },
      });
      await tx.report.updateMany({
        where: { businessId: vitrinePronta.id },
        data: { businessId: lojaGaveta.id },
      });
      await tx.analyticsEvent.updateMany({
        where: { businessId: vitrinePronta.id },
        data: { businessId: lojaGaveta.id },
      });
      await tx.comment.updateMany({
        where: { businessId: vitrinePronta.id },
        data: { businessId: lojaGaveta.id },
      });

      // Passamos os produtos do cardápio para o novo dono
      await tx.product.updateMany({
        where: { businessId: vitrinePronta.id },
        data: { businessId: lojaGaveta.id },
      });

      // Apagamos os horários velhos da gaveta e passamos os horários da vitrine pronta
      await tx.businessHour.deleteMany({
        where: { businessId: lojaGaveta.id },
      });
      await tx.businessHour.updateMany({
        where: { businessId: vitrinePronta.id },
        data: { businessId: lojaGaveta.id },
      });

      // Passo D: Agora que a Gaveta sugou a alma da Vitrine Pronta, a gente desintegra o corpo original
      await tx.business.delete({ where: { id: vitrinePronta.id } });

      // 🚀 NOVO PASSO: Rebaixa o antigo dono para Visitante (Lead) se ele ficar sem lojas
      const lojasRestantes = await tx.business.count({
        where: { userId: vitrinePronta.userId },
      });
      if (lojasRestantes === 0) {
        const antigoDono = await tx.user.findUnique({
          where: { id: vitrinePronta.userId },
        });
        // Só rebaixa se ele não for Admin ou Afiliado
        if (antigoDono && antigoDono.role === "ASSINANTE") {
          await tx.user.update({
            where: { id: vitrinePronta.userId },
            data: { role: "VISITANTE" },
          });
        }
      }

      // Passo E: Garante o selo do usuário NOVO
      if (novoDono.role !== "ASSINANTE") {
        await tx.user.update({
          where: { id: idDoNovoDono },
          data: { role: "ASSINANTE" },
        });
      }
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    revalidatePath(`/site/${vitrinePronta.slug}`);
    revalidatePath("/busca");

    return {
      success: true,
      message:
        "Transplante concluído! A vitrine foi sincronizada com a assinatura.",
    };
  } catch (error) {
    console.error("Erro no Transplante de Vitrine:", error);
    return {
      error: "Erro interno: A operação precisou ser cancelada por segurança.",
    };
  }
}
// ==============================================================================
// 🛒 GESTÃO DE PEDIDOS (MOTOR iFOOD)
// ==============================================================================
export async function createOrderAction(payload: any) {
  // 🚀 ESCUDO 1: Validação Rigorosa de Tipagem (Defesa Estrutural)
  if (!payload || typeof payload !== "object")
    return { error: "Payload inválido." };

  if (typeof payload.clientName !== "string" || !payload.clientName.trim()) {
    return { error: "Nome do cliente é obrigatório e inválido." };
  }

  if (
    !Array.isArray(payload.cart) ||
    payload.cart.length === 0 ||
    payload.cart.length > 50
  ) {
    return { error: "Carrinho inválido ou excede o limite de segurança." };
  }

  // 🚀 ESCUDO 2: O PASSAPORTE DE IDENTIDADE (Login Obrigatório)
  const userSession = await getSafeUser();
  if (!userSession) {
    return {
      error: "AUTH_REQUIRED",
      message:
        "Você precisa fazer um login rápido para concluir pedidos com segurança.",
    };
  }

  // 🛡️ RATE LIMIT DE ELITE: Agora assinado por USER ID para rotas autenticadas!
  // Isso impede que vizinhos na mesma rede Wi-Fi se bloqueiem, mas destrói bots que usam proxies rotativos.
  if (orderRatelimit) {
    const { success } = await orderRatelimit.limit(
      `order_user:${userSession.id}`,
    );
    if (!success) {
      return {
        error:
          "Calma! Você já realizou pedidos recentemente. Aguarde 1 minuto para enviar outro.",
      };
    }
  }

  try {
    // 🚀 O PASSAPORTE PARTE 2: Verifica se ele tem CPF e WhatsApp validados
    const dbUser = await db.user.findUnique({ where: { id: userSession.id } });
    if (!dbUser) return { error: "Usuário não encontrado." };

    let finalDocument = dbUser.document;
    let finalPhone = dbUser.phone;

    // Se o banco estiver vazio, o front-end TEM que ter enviado no payload do carrinho
    if (!finalDocument || !finalPhone) {
      // 🚀 BLINDAGEM DE TIPAGEM: Garante que o payload é texto e impede o Null Reference Crash
      if (
        !payload.document ||
        typeof payload.document !== "string" ||
        !payload.customerPhone ||
        typeof payload.customerPhone !== "string"
      ) {
        return {
          error: "MISSING_DATA",
          message:
            "Precisamos do seu CPF e WhatsApp para segurança do lojista.",
        };
      }

      const cleanDoc = payload.document
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase();
      const cleanPhone = payload.customerPhone.replace(/\D/g, "");

      if (!isCpfOrCnpjValid(cleanDoc))
        return { error: "O CPF ou CNPJ informado é inválido." };
      if (cleanPhone.length < 10)
        return { error: "O WhatsApp informado é inválido." };

      try {
        // Tenta salvar os dados novos na conta do cliente
        await db.user.update({
          where: { id: userSession.id },
          data: { document: cleanDoc, phone: cleanPhone },
        });
        finalDocument = cleanDoc;
        finalPhone = cleanPhone;
      } catch (updateErr: any) {
        // 🛡️ AQUI O HACKER É PEGO: Se o CPF/Tel já for de outro (ou de banido), o banco rejeita!
        if (updateErr.code === "P2002") {
          return {
            error:
              "Este CPF ou WhatsApp já está vinculado a outra conta. Contas banidas não podem criar clones.",
          };
        }
        throw updateErr;
      }
    }

    // 1. Busca pela CHAVE PRIMÁRIA (ID) da Loja e PUXA A AGENDA!
    const business = await db.business.findUnique({
      where: { id: payload.businessId },
      include: {
        products: { where: { isActive: true } },
        hours: true, // 🚀 NECESSÁRIO PARA A AUDITORIA DE TEMPO
      },
    });

    if (!business) return { error: "Loja não encontrada." };

    // 🚀 O ESCUDO DO RELÓGIO (Auditoria Temporal de Servidor - Suporte a Madrugada)
    const serverDate = new Date();
    const brazilDate = new Date(
      serverDate.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }),
    );
    const currentDay = brazilDate.getDay();
    const previousDay = currentDay === 0 ? 6 : currentDay - 1; // Pega o dia de ontem para turnos que viram a noite
    const currentTime = brazilDate.getHours() * 100 + brazilDate.getMinutes();

    let isStoreOpen = false;

    // Função interna inteligente para checar turnos que cruzam a meia-noite
    const checkShift = (dayConfig: any, isPreviousDayCheck: boolean) => {
      if (
        !dayConfig ||
        dayConfig.isClosed ||
        !dayConfig.openTime ||
        !dayConfig.closeTime
      )
        return false;
      const [openH, openM] = dayConfig.openTime.split(":").map(Number);
      const [closeH, closeM] = dayConfig.closeTime.split(":").map(Number);
      const openVal = openH * 100 + openM;
      const closeVal = closeH * 100 + closeM;

      const crossesMidnight = closeVal < openVal; // Ex: Fecha às 02:00 (200) e abre às 18:00 (1800)

      if (isPreviousDayCheck) {
        // Se estamos avaliando a agenda de "ontem", só interessa se o turno virou a madrugada e se a hora atual ainda é menor que a hora de fechar.
        return crossesMidnight && currentTime < closeVal;
      } else {
        // Se estamos avaliando a agenda de "hoje"
        if (crossesMidnight) {
          return currentTime >= openVal || currentTime < closeVal;
        } else {
          return currentTime >= openVal && currentTime < closeVal;
        }
      }
    };

    const todayHours = business.hours.find((h) => h.dayOfWeek === currentDay);
    const yesterdayHours = business.hours.find(
      (h) => h.dayOfWeek === previousDay,
    );

    // A loja está aberta se o turno de HOJE estiver ativo, OU se o turno de ONTEM virou a noite e ainda não fechou.
    isStoreOpen =
      checkShift(todayHours, false) || checkShift(yesterdayHours, true);

    if (!isStoreOpen) {
      return {
        error:
          "O estabelecimento está fechado no momento. Os pedidos estão suspensos.",
      };
    }

    let totalAmount = 0;
    const finalItems = [];

    for (const cartItem of payload.cart) {
      const realProduct = business.products.find(
        (p) => p.id === cartItem.productId,
      );
      if (!realProduct) continue;

      let itemTotal = realProduct.price;
      const realExtrasList = (realProduct.extras as any[]) || [];
      const selectedRealExtras = [];

      if (cartItem.selectedExtras && cartItem.selectedExtras.length > 0) {
        // 🛡️ WHITE HAT FIX: Remove itens duplicados do array usando Set()
        // Impede injeção de "50x Bacon" no mesmo lanche para quebrar o sistema ou burlar estoque
        const uniqueExtras = Array.from(new Set(cartItem.selectedExtras));

        for (const extraName of uniqueExtras) {
          const realExtra = realExtrasList.find((e) => e.name === extraName);
          if (realExtra) {
            itemTotal += Number(realExtra.price) || 0;
            selectedRealExtras.push({
              name: realExtra.name,
              price: Number(realExtra.price) || 0,
            });
          }
        }
      }

      // 🚀 ESCUDO FINANCEIRO: Impede quantidades negativas, fracionadas ou zeradas
      if (
        typeof cartItem.quantity !== "number" ||
        cartItem.quantity <= 0 ||
        !Number.isInteger(cartItem.quantity)
      ) {
        throw new Error(
          "Tentativa de fraude detectada: Quantidade de itens inválida.",
        );
      }

      const lineTotal = itemTotal * cartItem.quantity;
      totalAmount += lineTotal;

      finalItems.push({
        productId: realProduct.id,
        productName: realProduct.name,
        quantity: cartItem.quantity,
        unitPrice: realProduct.price,
        extras: selectedRealExtras,
        lineTotal: lineTotal,
      });
    }

    if (finalItems.length === 0)
      return { error: "Nenhum item válido no pedido." };

    // 🛡️ CFO & UX FIX: Radar anti-malandragem de frete nas observações!
    let finalObservation = payload.observation
      ? String(payload.observation).substring(0, 500)
      : null;

    if (payload.deliveryType === "PICKUP" && finalObservation) {
      // Procura por palavras suspeitas que indiquem tentativa de pedir entrega na opção de retirada grátis
      const suspeitoDeFrete =
        /entreg|mandar|trazer|rua |av |avenida|bairro|condom|residen/i.test(
          finalObservation,
        );
      if (suspeitoDeFrete) {
        finalObservation = `⚠️ [ALERTA DO SISTEMA: CLIENTE ESCOLHEU RETIRADA GRÁTIS, MAS CITOU ENDEREÇO NA OBSERVAÇÃO!] - ${finalObservation}`;
      }
    }

    // 🚀 O ESCUDO FINANCEIRO: Só adiciona a taxa se não for A COMBINAR!
    if (
      payload.deliveryType === "DELIVERY" &&
      business.deliveryFee > 0 &&
      !business.deliveryFeeNegotiable
    ) {
      totalAmount += business.deliveryFee;
    }

    let attempts = 0;

    while (attempts < 3) {
      try {
        const shortOrderNumber = crypto
          .randomBytes(3)
          .toString("hex")
          .toUpperCase();

        const newOrder = await db.order.create({
          data: {
            orderNumber: shortOrderNumber,
            businessId: business.id,
            customerName: payload.clientName.substring(0, 60),
            customerPhone: finalPhone,
            customerId: userSession.id,
            items: finalItems,
            totalAmount: totalAmount,
            deliveryType: payload.deliveryType,
            address: payload.address || null,
            paymentMethod: payload.paymentMethod,
            changeFor: payload.changeFor || null,
            observation: finalObservation,

            // 🚀 TAFANU BOOKING: GRAVA O HORÁRIO NO BANCO DE DADOS
            appointmentDate: payload.appointmentDate
              ? new Date(payload.appointmentDate)
              : null,
            appointmentTime: payload.appointmentTime || null,

            status: "PENDING",
          },
        });

        // 🚀 RETORNA O ID PARA A TELA DE RASTREIO DIRETO DAQUI (O TypeScript ama isso!)
        return {
          success: true,
          orderNumber: newOrder.orderNumber,
          orderId: newOrder.id,
        };
      } catch (err: any) {
        if (err.code === "P2002") {
          attempts++;
          if (attempts >= 3)
            throw new Error(
              "Sistema sobrecarregado. Tente finalizar novamente.",
            );
        } else {
          throw err;
        }
      }
    }
  } catch (error) {
    console.error("Erro Crítico ao gerar pedido:", error);
    return { error: "Falha ao registrar o pedido no sistema." };
  }
}
// ==============================================================================
// 📦 GESTÃO DO KANBAN DE PEDIDOS (LOJISTA)
// ==============================================================================

export async function getStoreOrders(lastSyncIso?: string) {
  const user = await getSafeUser();
  if (!user) return { error: "Não autorizado." };

  try {
    const whereClause: any = { business: { userId: user.id } };

    if (lastSyncIso) {
      // 🚀 DELTA FETCH: Busca APENAS o que sofreu mudança nos últimos 15 segundos!
      whereClause.updatedAt = { gt: new Date(lastSyncIso) };
    } else {
      // Carga inicial (quando ele acabou de abrir a tela): Busca os últimos 7 dias
      whereClause.createdAt = {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      };
    }

    const orders = await db.order.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      orders,
      serverTime: new Date().toISOString(), // 🚀 Mandamos o relógio do servidor de volta!
    };
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    return { error: "Erro interno ao carregar a fila de pedidos." };
  }
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const user = await getSafeUser();
  if (!user) return { error: "Não autorizado." };

  // 🛡️ RATE LIMIT: Impede que um script mude o status de 1.000 pedidos por segundo travando o banco
  if (storeActionRatelimit) {
    const { success } = await storeActionRatelimit.limit(
      `order_status_${user.id}`,
    );
    if (!success)
      return { error: "Muitas ações rápidas. Aguarde alguns segundos." };
  }

  // 🛡️ VALIDAÇÃO DE ENTRADA: O hacker não pode enviar um status inventado
  const validStatuses = [
    "PENDING",
    "PREPARING",
    "DISPATCHED",
    "COMPLETED",
    "CANCELLED",
  ];
  if (!validStatuses.includes(newStatus)) {
    return { error: "Status inválido ou corrompido." };
  }

  try {
    // 🚀 O ESCUDO IDOR (Crucial):
    // Achamos o pedido e checamos se o dono da loja desse pedido é o cara que está logado!
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: { id: true, business: { select: { userId: true } } },
    });

    if (!order) return { error: "Pedido não encontrado." };

    if (order.business.userId !== user.id && user.role !== "ADMIN") {
      console.warn(
        `🚨 [TENTATIVA DE IDOR BLOQUEADA] User ${user.id} tentou alterar pedido de outra loja.`,
      );
      return { error: "Acesso Negado. Este pedido não pertence à sua loja." };
    }

    // 🚀 STATE MACHINE (TRAVA DE LÓGICA): Pedidos mortos não podem voltar à vida.
    // Lemos o status atual do pedido para garantir que ele não foi fechado.
    const currentOrderData = await db.order.findUnique({
      where: { id: order.id },
      select: { status: true },
    });

    if (
      currentOrderData?.status === "COMPLETED" ||
      currentOrderData?.status === "CANCELLED"
    ) {
      return {
        error:
          "Não é possível alterar o status de um pedido que já foi finalizado ou cancelado.",
      };
    }

    // Se passou pela alfândega, atualiza o status.
    await db.order.update({
      where: { id: order.id },
      data: { status: newStatus as any },
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar pedido:", error);
    return { error: "Falha ao processar a mudança de status." };
  }
}
// ==============================================================================
// 🛍️ CENTRAL DE PEDIDOS DO VISITANTE (HISTÓRICO REAL LOGADO)
// ==============================================================================
export async function getActiveOrdersByIds(orderIds: string[]) {
  // 🚀 A MARETA DO CTO: Ignoramos completamente o orderIds do frontend (localStorage).
  // Apenas a sessão oficial do servidor importa.
  const session = await getSafeUser();

  if (!session) {
    // Se não está logado, não tem pedido nenhum e ponto final.
    return { success: true, orders: [] };
  }

  const vinteEQuatroHorasAtras = new Date(Date.now() - 24 * 60 * 60 * 1000);

  try {
    const dbUser = await db.user.findUnique({
      where: { id: session.id },
      select: { phone: true, id: true },
    });

    if (!dbUser?.phone) {
      return { success: true, orders: [] }; // Se logou mas não validou telefone, não comprou
    }

    // Busca ABSOLUTA: Pega pedidos atrelados ao ID do cliente OU ao Telefone dele
    const userOrders = await db.order.findMany({
      where: {
        OR: [{ customerId: dbUser.id }, { customerPhone: dbUser.phone }],
        createdAt: { gte: vinteEQuatroHorasAtras },
        // 🚀 Removemos o bloqueio de status para que ele veja os finalizados de hoje no histórico dele
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        business: { select: { name: true, imageUrl: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, orders: userOrders };
  } catch (error) {
    console.error("Erro ao buscar histórico de pedidos:", error);
    return { error: "Falha ao buscar os pedidos em andamento." };
  }
}
// ==============================================================================
// 🚫 CANCELAMENTO DE PEDIDO PELO CLIENTE (Regra iFood)
// ==============================================================================
export async function cancelOrderByCustomer(orderId: string) {
  // 🚀 HACKER FIX: Exige o "Crachá" do usuário (Impede acesso anônimo)
  const session = await getSafeUser();
  if (!session)
    return { error: "Você precisa estar logado para cancelar um pedido." };

  try {
    // 1. Busca o pedido trazendo a identidade do dono dele
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: { status: true, orderNumber: true, customerId: true }, // 🚀 AQUI: Lemos quem comprou!
    });

    if (!order) return { error: "Pedido não encontrado." };

    // 🚀 O ESCUDO IDOR: Garante que só o verdadeiro comprador pode cancelar
    if (order.customerId !== session.id && session.role !== "ADMIN") {
      console.warn(
        `🚨 [Ataque IDOR Bloqueado] Usuário ${session.id} tentou cancelar pedido de outro.`,
      );
      return { error: "Acesso Negado. Este pedido não pertence a você." };
    }

    // 2. A TRAVA DO PREJUÍZO: Se o lojista já aceitou, o cliente não pode mais cancelar pelo botão
    if (order.status !== "PENDING") {
      return {
        error:
          "O estabelecimento já começou a preparar seu pedido. Entre em contato pelo WhatsApp para solicitar o cancelamento.",
      };
    }

    // 3. Executa o cancelamento
    await db.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    revalidatePath("/meus-pedidos");
    return {
      success: true,
      message: `Pedido #${order.orderNumber} cancelado com sucesso.`,
    };
  } catch (error) {
    console.error("Erro ao cancelar pedido pelo cliente:", error);
    return { error: "Erro interno ao tentar cancelar o pedido." };
  }
}
// ==============================================================================
// 🚨 SISTEMA DE DENÚNCIAS DE PEDIDOS (MODERAÇÃO)
// ==============================================================================
export async function reportOrderAction(
  orderId: string,
  reason: string,
  details: string,
) {
  const session = await getSafeUser();
  if (!session)
    return { error: "Você precisa estar logado para reportar um problema." };

  if (reason?.length > 100 || details?.length > 500) {
    return { error: "Os dados excedem o limite de caracteres permitido." };
  }

  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { business: true },
    });

    if (!order) return { error: "Pedido não encontrado." };

    // 🛡️ Segurança: Só o comprador ou o dono da loja podem denunciar este pedido
    const isCustomer = order.customerId === session.id;
    const isBusinessOwner = order.business.userId === session.id;
    const isAdmin = session.role === "ADMIN";

    if (!isCustomer && !isBusinessOwner && !isAdmin) {
      return { error: "Você não tem permissão para reportar este pedido." };
    }

    // ⏳ Trava Anti-Spam: Limita 1 denúncia por pessoa neste pedido
    const denunciaRecente = await db.report.findFirst({
      where: { orderId: order.id, reportedBy: session.id },
    });

    if (denunciaRecente) {
      return {
        error:
          "Você já enviou um reporte para este pedido. O Admin está analisando.",
      };
    }

    // Cria a denúncia vinculada ao pedido!
    await db.report.create({
      data: {
        businessId: order.businessId,
        orderId: order.id,
        reason,
        details: details || "",
        status: "PENDING",
        reportedBy: session.id, // O Admin vai saber se foi o lojista ou o cliente quem abriu!
      },
    });

    return {
      success: true,
      message: "Problema reportado com sucesso! A moderação foi acionada.",
    };
  } catch (error) {
    console.error("Erro ao reportar pedido:", error);
    return { error: "Erro interno. Tente novamente mais tarde." };
  }
}
// ==========================================
// 🚀 TAFANU BOOKING: RADAR DE HORÁRIOS
// ==========================================
export async function getBookedSlots(businessId: string, dateIso: string) {
  try {
    // Pega o início e o fim do dia selecionado
    const startOfDay = new Date(dateIso);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(dateIso);
    endOfDay.setHours(23, 59, 59, 999);

    const orders = await db.order.findMany({
      where: {
        businessId,
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { not: "CANCELLED" }, // 🚀 A MÁGICA: Se o pedido for CANCELLED, a vaga é liberada automaticamente!
      },
      select: { appointmentTime: true },
    });

    return orders.map((o) => o.appointmentTime).filter(Boolean) as string[];
  } catch (error) {
    console.error("Erro ao buscar vagas:", error);
    return [];
  }
}
