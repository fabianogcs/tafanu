"use server";
import { z } from "zod";
import { businessSchema, userProfileSchema } from "@/lib/schemas";
import { UTApi } from "uploadthing/server";
import { db } from "@/lib/db";
import { EventType, Role, LayoutType, PlanType } from "@prisma/client";
import { hash, compare } from "bcryptjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { cpf } from "cpf-cnpj-validator";
import { auth, signIn, signOut } from "@/auth";
import { Resend } from "resend";
import crypto from "crypto";
import { MercadoPagoConfig, PreApproval } from "mercadopago"; // 👈 NOVO IMPORT AQUI
import { normalizeText } from "@/lib/normalize"; // 👈 NOVO IMPORT
import { CommissionStatus } from "@prisma/client";

type BusinessInput = z.infer<typeof businessSchema>;
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

const utapi = new UTApi();
const resend = new Resend(process.env.RESEND_API_KEY);

// ==============================================================================
// 1. HELPERS INTERNOS (Proteção e Utilidades)
// ==============================================================================
function safeParseArray(data: any) {
  if (typeof data !== "string") return [];
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function cleanSocialLink(url: string) {
  if (!url) return "";
  return url
    .replace(
      /https?:\/\/(www\.)?(instagram\.com|tiktok\.com|facebook\.com)\//,
      "",
    )
    .replace(/@/, "")
    .replace(/\/$/, "");
}

async function requireAdmin() {
  const user = await getSafeUser();

  // 1. Garante para o TypeScript que o usuário existe e não é nulo
  if (!user) return null;

  // 2. Agora o TypeScript permite ler user.role e user.email sem o "?"
  if (user.role !== "ADMIN" && user.email !== process.env.ADMIN_EMAIL) {
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
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    // Se faltar algum dado essencial, já cancela
    if (!apiKey || !address || !city || !state) {
      console.log(
        "❌ getCoordinates: Faltando chave de API ou dados de endereço.",
      );
      return { lat: null, lng: null };
    }

    // 🚀 O PULO DO GATO: Monta o endereço completo pro Google não se perder!
    const fullAddress = `${address}, ${city} - ${state}, Brasil`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`,
      { signal: controller.signal },
    );

    clearTimeout(timeout);
    const data = await response.json();

    // 🕵️ Deixando um espião aqui para a gente ver o que o Google respondeu
    console.log(`📡 Resposta do Google para "${fullAddress}":`, data.status);

    if (data.status === "OK") {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat: Number(lat), lng: Number(lng) };
    }

    // Se o status não for OK (ex: REQUEST_DENIED ou ZERO_RESULTS), ele avisa o porquê
    console.log(
      "❌ Erro do Google:",
      data.error_message || "Endereço não encontrado",
    );
    return { lat: null, lng: null };
  } catch (error) {
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

  // --- 🛡️ TRAVA DE E-MAIL INVÁLIDO ---
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email || !emailRegex.test(email)) {
    return {
      error: "Por favor, insira um e-mail válido (ex: nome@dominio.com).",
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
    // 2. VALIDAÇÃO DE DUPLICIDADE
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) return { error: "Este e-mail já está cadastrado." };

    // 3. VALIDAÇÃO DE DOCUMENTO (CPF)
    let cleanDocument = null;
    if (rawDocument) {
      cleanDocument = rawDocument.replace(/\D/g, "");
      if (!cpf.isValid(cleanDocument)) return { error: "CPF inválido." };

      const existingCPF = await db.user.findUnique({
        where: { document: cleanDocument },
      });
      if (existingCPF)
        return { error: "Este CPF já está sendo usado por outra conta." };
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
    const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const confirmLink = `${domain}/verificar-email?token=${verificationToken.token}`;

    try {
      await resend.emails.send({
        from: "Tafanu <onboarding@resend.dev>",
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
  } catch (error) {
    console.error("Erro no cadastro:", error);
    return { error: "Erro ao criar conta. Tente novamente mais tarde." };
  }
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const callbackUrl = formData.get("callbackUrl") as string;

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

  // 5. LÓGICA DE EXPIRAÇÃO (Assinatura por Negócio)
  if (dbUser.role === "ASSINANTE") {
    const negociosDoUsuario = await db.business.findMany({
      where: { userId: dbUser.id, isActive: true },
      select: { id: true, expiresAt: true },
    });

    let temAlgumNegocioAtivo = false;
    const dataAtual = new Date();

    for (const negocio of negociosDoUsuario) {
      if (negocio.expiresAt) {
        const dataExpiracao = new Date(negocio.expiresAt);
        const dataComCarencia = new Date(
          dataExpiracao.getTime() + 48 * 60 * 60 * 1000,
        );

        if (dataComCarencia < dataAtual) {
          await db.business.update({
            where: { id: negocio.id },
            data: { isActive: false },
          });
        } else {
          temAlgumNegocioAtivo = true;
        }
      } else {
        temAlgumNegocioAtivo = true;
      }
    }

    if (!temAlgumNegocioAtivo) {
      await db.user.update({
        where: { id: dbUser.id },
        data: { role: "VISITANTE" as Role },
      });
    }
  }

  try {
    let destino = callbackUrl || "/";

    if (!callbackUrl) {
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
      select: { id: true, password: true, affiliateId: true }, // ⬅️ Adicionado affiliateId aqui
    });

    if (!dbUser) return { error: "Usuário não encontrado." };

    const updateData: any = {
      name: validatedData.name,
      phone: validatedData.phone.replace(/\D/g, ""),
      document: validatedData.document.replace(/\D/g, ""),
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
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
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

// 🚀 MELHORIA: Busca categorias de forma leve e SEM esquecer ninguém
export async function getFilterMetadata() {
  const data = await db.business.findMany({
    where: {
      isActive: true,
      published: true,
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

  // 🚀 PARTE 1: VALIDAÇÃO DE REGRAS DE NEGÓCIO (ROLES)
  const userRole = session.role; // Pegando o cargo do usuário da sessão

  // 1. Bloqueio para Visitantes
  if (userRole === "VISITANTE") {
    return {
      error: "Visitantes não podem criar lojas. Assine um plano para começar!",
    };
  }

  // 2. Bloqueio de limite para Assinantes
  if (userRole === "ASSINANTE") {
    // Contamos quantos negócios este usuário já possui no banco
    const businessCount = await db.business.count({
      where: { userId: session.id },
    });

    if (businessCount >= 1) {
      return {
        error:
          "Assinantes podem ter apenas 1 loja ativa. Torne-se um Parceiro para criar lojas ilimitadas!",
      };
    }
  }

  // Se for ADMIN ou AFILIADO, o código ignora os IFs acima e segue normalmente...

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
          name: validatedData.name,
          slug: validatedData.slug.toLowerCase().trim(),
          // ... (todos os outros campos que você já mapeou)
          theme: validatedData.theme,
          layout: validatedData.layout as LayoutType, // 🛡️ Blindado igual fizemos na edição!
          category: validatedData.category,
          subcategory: payload.subcategory || [],
          description: validatedData.description,
          whatsapp: (validatedData.whatsapp || "").replace(/\D/g, ""),
          phone: (validatedData.phone || "").replace(/\D/g, ""),
          address: validatedData.address,
          number: validatedData.number || "",
          complement: validatedData.complement || "",
          cep: payload.cep || "",
          city: normalizeText(validatedData.city || ""),
          neighborhood: normalizeText(payload.neighborhood || ""),
          state:
            !validatedData.address && !validatedData.city
              ? ""
              : validatedData.state,
          latitude: coords.lat,
          longitude: coords.lng,
          imageUrl: payload.imageUrl || "",
          gallery: payload.gallery || [],
          features: payload.features || [],
          keywords: Array.from(
            new Set([
              ...(payload.keywords || []).map((k: string) => normalizeText(k)),
              normalizeText(validatedData.name),
              normalizeText(validatedData.category),
              ...(payload.subcategory || []).map((s: string) =>
                normalizeText(s),
              ),
              ...(payload.subcategory || []).flatMap((s: string) =>
                normalizeText(s).split(" "),
              ),
            ]),
          ).filter(Boolean),
          instagram: cleanSocialLink(validatedData.instagram || ""),
          facebook: cleanSocialLink(validatedData.facebook || ""),
          tiktok: cleanSocialLink(validatedData.tiktok || ""),
          shopee: validatedData.shopee?.trim() || "",
          mercadoLivre: validatedData.mercadoLivre?.trim() || "",
          shein: validatedData.shein?.trim() || "",
          ifood: validatedData.ifood?.trim() || "",
          website: payload.website || "",
          published: payload.published !== undefined ? payload.published : true,
          urban_tag: payload.urban_tag || "",
          luxe_quote: payload.luxe_quote || "",
          showroom_collection: payload.showroom_collection || "",
          comercial_badge: payload.comercial_badge || "",
          faqs: payload.faqs || [],
        },
      });

      if (payload.hours?.length > 0) {
        await tx.businessHour.createMany({
          data: payload.hours.map((h: any) => ({
            businessId: business.id,
            dayOfWeek: h.dayOfWeek,
            openTime: h.openTime || "09:00",
            closeTime: h.closeTime || "18:00",
            isClosed: !!h.isClosed,
          })),
        });
      }
    });

    revalidatePath("/busca");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Erro no create:", error);
    return { error: "Erro ao criar anúncio." };
  }
}

// 🔄 EDIÇÃO DE NEGÓCIO (Com economia de API e Redes Sociais completas)
export async function updateFullBusiness(slug: string, payload: any) {
  const user = await getSafeUser();
  if (!user) return { error: "Não autorizado." };

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
        gallery: true,
      },
    });
    // 🚀 CORREÇÃO SÊNIOR 1: A Chave Mestra do Admin!
    if (!old) return { error: "Negócio não encontrado." };
    if (old.userId !== user.id && user.role !== "ADMIN")
      return { error: "Acesso Negado." };

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
    // ✂️ CIRURGIA: Faxina do UploadThing
    const linksParaDeletar = [];

    // Se a logo antiga existe e mudou, vai para o lixo
    if (old.imageUrl && old.imageUrl !== payload.imageUrl) {
      linksParaDeletar.push(old.imageUrl);
    }

    // Se fotos da galeria antiga não estão na nova, vão para o lixo
    const galeriaAntiga = (old.gallery as string[]) || [];
    galeriaAntiga.forEach((url) => {
      if (!payload.gallery?.includes(url)) {
        linksParaDeletar.push(url);
      }
    });

    if (linksParaDeletar.length > 0) {
      await deleteFilesFromUploadThing(linksParaDeletar);
    }
    // ---------------------------------
    await db.business.update({
      where: { id: old.id },
      data: {
        name: validatedData.name,
        slug: validatedData.slug.toLowerCase().trim(),
        description: validatedData.description,
        address: validatedData.address,
        category: validatedData.category,
        subcategory: payload.subcategory || [],
        theme: validatedData.theme,
        layout: validatedData.layout as LayoutType, // 🛡️ Tipagem segura do Prisma
        whatsapp: (validatedData.whatsapp || "").replace(/\D/g, ""),
        phone: (validatedData.phone || "").replace(/\D/g, ""),
        number: validatedData.number || "",
        complement: validatedData.complement || "",
        cep: validatedData.cep || payload.cep || "",
        city: normalizeText(validatedData.city || ""),
        neighborhood: normalizeText(payload.neighborhood || ""),
        state:
          !validatedData.address && !validatedData.city
            ? ""
            : validatedData.state,
        latitude: lat,
        longitude: lng,
        keywords: Array.from(
          new Set([
            ...(payload.keywords || []).map((k: string) => normalizeText(k)),
            normalizeText(validatedData.name),
            normalizeText(validatedData.category),
            ...(payload.subcategory || []).map((s: string) => normalizeText(s)),
            ...(payload.subcategory || []).flatMap((s: string) =>
              normalizeText(s).split(" "),
            ),
          ]),
        ).filter(Boolean),
        instagram: cleanSocialLink(validatedData.instagram || ""),
        facebook: cleanSocialLink(validatedData.facebook || ""),
        tiktok: cleanSocialLink(validatedData.tiktok || ""),

        // 🚀 AQUI ESTÃO OS DESAPARECIDOS!
        imageUrl: payload.imageUrl || "", // Garante que a logo salva
        website: payload.website || "", // O Seu Site de volta!
        features: payload.features || [], // Os seus Destaques de volta!
        published: payload.published, // O botão Online/Pausado de volta!
        urban_tag: payload.urban_tag || "",
        luxe_quote: payload.luxe_quote || "",
        showroom_collection: payload.showroom_collection || "",
        comercial_badge: payload.comercial_badge || "",

        shopee: validatedData.shopee?.trim() || "",
        mercadoLivre: validatedData.mercadoLivre?.trim() || "",
        shein: validatedData.shein?.trim() || "",
        ifood: validatedData.ifood?.trim() || "",
        gallery: payload.gallery || [],
        faqs: payload.faqs || [],
      },
    });

    // 🚀 CORREÇÃO SÊNIOR 2: Atualizando os horários de funcionamento!
    if (payload.hours) {
      // Primeiro, apagamos os horários velhos dessa loja
      await db.businessHour.deleteMany({
        where: { businessId: old.id },
      });

      // Depois, criamos os novos se eles existirem
      if (payload.hours.length > 0) {
        await db.businessHour.createMany({
          data: payload.hours.map((h: any) => ({
            businessId: old.id,
            dayOfWeek: h.dayOfWeek,
            openTime: h.openTime || "09:00",
            closeTime: h.closeTime || "18:00",
            isClosed: !!h.isClosed,
          })),
        });
      }
    }

    revalidatePath("/busca");
    revalidatePath("/dashboard");
    revalidatePath(`/site/${slug}`);

    // Se o link mudou, revalida o novo também
    if (validatedData.slug !== slug) {
      revalidatePath(`/site/${validatedData.slug}`);
    }

    return { success: true, newSlug: validatedData.slug };
  } catch (error) {
    console.error("Erro no update:", error);
    return { error: "Erro ao salvar." };
  }
}

// ==============================================================================
// 7. ATUALIZAÇÃO ESPECÍFICA DE MÍDIA (VÍDEO E GALERIA)
// ==============================================================================

export async function updateBusinessMedia(slug: string, gallery: string[]) {
  const user = await getSafeUser();
  if (!user) return { error: "Não autorizado." };

  try {
    // 1. Busca o negócio atual para saber o que ele já tinha
    const business = await db.business.findUnique({
      where: { slug },
      select: { id: true, userId: true, gallery: true },
    });

    if (!business || business.userId !== user.id) {
      return { error: "Negócio não encontrado ou permissão negada." };
    }

    // 2. Lógica de Faxina (Deleta fotos removidas do UploadThing)
    const filesToDelete: string[] = [];

    // Compara as galerias: se a foto estava na antiga e não está na nova, deleta.
    const oldGallery = business.gallery || [];
    oldGallery.forEach((url) => {
      if (!gallery.includes(url)) {
        filesToDelete.push(url);
      }
    });

    // Executa a deleção no servidor do UploadThing
    if (filesToDelete.length > 0) {
      await deleteFilesFromUploadThing(filesToDelete);
    }

    // 3. Atualiza o banco de dados
    await db.business.update({
      where: { id: business.id },
      data: {
        gallery: gallery,
      },
    });

    // 4. Limpa o cache para as mudanças aparecerem no site
    revalidatePath(`/site/${slug}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar mídia:", error);
    return { error: "Erro interno ao salvar as mídias." };
  }
}

export async function updateBusinessHours(slug: string, hours: any[]) {
  const user = await getSafeUser();
  if (!user) return { error: "Não autorizado." };
  const userId = user.id;
  try {
    const b = await db.business.findUnique({
      where: { slug },
      select: { id: true, userId: true },
    });
    if (!b || b.userId !== userId) return { error: "Negado." };
    await db.businessHour.deleteMany({ where: { businessId: b.id } });
    await db.businessHour.createMany({
      data: hours.map((h) => ({ businessId: b.id, ...h })),
    });
    revalidatePath(`/site/${slug}`);
    return { success: true };
  } catch (error) {
    return { error: "Erro horários." };
  }
}

export async function deleteBusiness(slug: string) {
  const user = await getSafeUser();
  if (!user) return { error: "Não autorizado." };
  const userId = user.id;

  try {
    // 1. Buscamos a loja e contamos quantas o usuário tem no total
    const userWithBusinesses = await db.user.findUnique({
      where: { id: userId },
      include: {
        businesses: {
          select: { id: true, slug: true },
        },
      },
    });

    const b = userWithBusinesses?.businesses.find((item) => item.slug === slug);
    if (!b) return { error: "Negado ou loja não encontrada." };

    const totalBusinesses = userWithBusinesses?.businesses.length || 0;
    const isPowerUser = user.role === "ADMIN" || user.role === "AFILIADO";

    // --- DECISÃO CIRÚRGICA ---

    // Se for Assinante e for a ÚNICA loja dele, entramos no modo RESET
    if (user.role === "ASSINANTE" && totalBusinesses <= 1) {
      // 🚀 MODO RESET: Limpamos os dados, mas mantemos o registro e o tempo (expiresAt)
      await db.$transaction([
        // Removemos dados vinculados
        db.businessHour.deleteMany({ where: { businessId: b.id } }),
        db.favorite.deleteMany({ where: { businessId: b.id } }),
        db.report.deleteMany({ where: { businessId: b.id } }),
        // Adicione aqui outros deletes como db.product.deleteMany se houver

        // Resetamos o registro principal para o estado inicial
        db.business.update({
          where: { id: b.id },
          data: {
            name: "Minha Nova Vitrine",
            slug: `reiniciar-${Math.random().toString(36).substring(7)}`, // Novo slug para evitar conflito
            description: "",
            imageUrl: "",
            gallery: [],
            keywords: [],
            category: "",
            subcategory: [],
            published: false, // Ocultamos até ele editar de novo
            whatsapp: "",
            phone: "",
            instagram: "",
            facebook: "",
            tiktok: "",
            // O campo 'userId' e campos de tempo (como expiresAt) NÃO são tocados aqui
          },
        }),
      ]);

      // Coleta arquivos para apagar do storage e não deixar lixo
      await cleanStorageFiles(slug);

      revalidatePath("/dashboard");
      return {
        success: true,
        message:
          "Sua vitrine foi resetada. Como você é assinante, sua loja base permanece ativa para nova edição.",
      };
    }

    // 🗑️ MODO EXCLUSÃO TOTAL: Se for Admin/Afiliado ou se o assinante tiver mais de uma (segurança extra)
    await db.$transaction([
      db.businessHour.deleteMany({ where: { businessId: b.id } }),
      db.favorite.deleteMany({ where: { businessId: b.id } }),
      db.report.deleteMany({ where: { businessId: b.id } }),
      db.business.delete({ where: { id: b.id } }),
    ]);

    await cleanStorageFiles(slug);

    revalidatePath("/dashboard");
    revalidatePath("/busca");
    revalidatePath(`/site/${slug}`);

    return { success: true, message: "Loja excluída com sucesso." };
  } catch (error) {
    console.error("Erro ao processar exclusão:", error);
    return { error: "Erro ao excluir. Tente novamente." };
  }
}

// --- 1. O MOTOR DA FAXINA (Lógica pura, sem checar quem chamou) ---
async function executeCoreCleanup() {
  const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  try {
    const ghosts = await db.business.findMany({
      where: {
        user: { role: "VISITANTE" },
        OR: [
          { expiresAt: null, createdAt: { lt: trintaDiasAtras } },
          { expiresAt: { lt: trintaDiasAtras } },
        ],
      },
      select: { id: true, imageUrl: true, gallery: true },
    });

    if (ghosts.length === 0) return { success: true, message: "Banco limpo." };

    const linksParaDeletar: string[] = [];
    ghosts.forEach((business) => {
      if (business.imageUrl) linksParaDeletar.push(business.imageUrl);
      if (business.gallery && Array.isArray(business.gallery)) {
        linksParaDeletar.push(...(business.gallery as string[]));
      }
    });

    if (linksParaDeletar.length > 0) {
      await deleteFilesFromUploadThing(linksParaDeletar);
    }

    const idsToDelete = ghosts.map((b) => b.id);
    const deleted = await db.business.deleteMany({
      where: { id: { in: idsToDelete } },
    });

    return {
      success: true,
      message: `Faxina: ${deleted.count} lojas e ${linksParaDeletar.length} imagens removidas.`,
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
  // A proteção não fica aqui, fica na Rota da API que o robô vai chamar
  return await executeCoreCleanup();
}

// Função auxiliar para não repetir código de deletar arquivos
async function cleanStorageFiles(slug: string) {
  const business = await db.business.findUnique({
    where: { slug },
    select: { imageUrl: true, gallery: true },
  });
  if (!business) return;

  const filesToDelete: string[] = [];
  if (business.imageUrl) filesToDelete.push(business.imageUrl);
  if (business.gallery && business.gallery.length > 0) {
    filesToDelete.push(...(business.gallery as string[]));
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

    // Se não tem carimbo, soma +1 no banco de dados
    await db.business.update({
      where: { id: businessId },
      data: { views: { increment: 1 } },
    });

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
    if (existing) await db.favorite.delete({ where: { id: existing.id } });
    else await db.favorite.create({ data: { userId, businessId } });

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
  try {
    const b = await db.business.findUnique({
      where: { slug: businessSlug },
      select: { id: true },
    });
    if (!b) return { error: "Perfil não encontrado." };
    await db.report.create({
      data: {
        businessId: b.id,
        reason,
        details: details || "",
        status: "PENDING",
      },
    });
    return { success: true };
  } catch (error) {
    return { error: "Erro reportar." };
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

  if (!email) {
    return { error: "E-mail obrigatório." };
  }

  const existingUser = await db.user.findUnique({ where: { email } });

  // Por segurança, se o usuário não existe, não damos erro, apenas fingimos que enviamos.
  if (!existingUser) {
    return { success: true };
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
  const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetLink = `${domain}/nova-senha?token=${token}`;

  try {
    await resend.emails.send({
      from: "Tafanu <onboarding@resend.dev>", // Ou seu e-mail verificado no Resend
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
  if (!token) return { error: "Token inválido ou ausente." };

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

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
export async function getHomeBusinesses(userId?: string) {
  try {
    // 1. BUSCA O STATUS DE VERIFICAÇÃO DO USUÁRIO LOGADO
    let isVerified = false;
    if (userId) {
      const u = await db.user.findUnique({
        where: { id: userId },
        select: { emailVerified: true },
      });
      isVerified = !!u?.emailVerified;
    }

    // 2. CONTA QUANTOS NEGÓCIOS VÁLIDOS EXISTEM
    const totalBusinesses = await db.business.count({
      where: {
        isActive: true,
        published: true,
        // 🚀 AJUSTE AQUI: Afiliados ganham imunidade vitalícia junto com Admins
        OR: [
          { user: { role: "ADMIN" as Role } },
          { user: { role: "AFILIADO" as Role } }, // VIP do Parceiro Oficial
          {
            user: { role: "ASSINANTE" as Role },
            expiresAt: { gt: new Date() },
          },
        ],
      },
    });

    if (totalBusinesses === 0) return [];

    // 3. MATEMÁTICA DO PULO ALEATÓRIO (OFFSET O(1))
    const skipAmount = Math.max(
      0,
      Math.floor(Math.random() * (totalBusinesses - 12)),
    );

    // 4. BUSCA APENAS 12 NEGÓCIOS, DIRETO DO BANCO!
    const randomBusinesses = await db.business.findMany({
      where: {
        isActive: true,
        published: true,
        // 🚀 AJUSTE AQUI TAMBÉM: Igual ao passo 2
        OR: [
          { user: { role: "ADMIN" as Role } },
          { user: { role: "AFILIADO" as Role } },
          {
            user: { role: "ASSINANTE" as Role },
            expiresAt: { gt: new Date() },
          },
        ],
      },
      take: 12,
      skip: skipAmount,
      include: {
        hours: true,
        favorites: userId ? { where: { userId } } : false,
        _count: {
          select: { favorites: true },
        },
      },
    });

    // 5. FORMATA PARA O FRONTEND
    return randomBusinesses
      .map((b) => ({
        ...b,
        isFavorited: userId ? b.favorites.length > 0 : false,
        favoritesCount: b._count.favorites,
        userLoggedInVerified: isVerified,
      }))
      .sort(() => Math.random() - 0.5);
  } catch (error) {
    console.error("Erro ao buscar aleatórios:", error);
    return [];
  }
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
        gallery: true,
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
      if (b.gallery && Array.isArray(b.gallery)) {
        b.gallery.forEach((img) => add(img));
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

    // 4. Lista arquivos no UploadThing (Pegando os primeiros 500)
    const utFiles = await utapi.listFiles({ limit: 500 });
    const filesToDelete: string[] = [];

    // 5. Compara
    utFiles.files.forEach((file) => {
      // Se a chave do arquivo no servidor NÃO está na nossa lista de válidos
      if (!validKeys.has(file.key)) {
        filesToDelete.push(file.key);
      }
    });

    console.log(`🗑️ Lixo identificado: ${filesToDelete.length} arquivos.`);

    // 6. Deleta apenas se tiver lixo
    if (filesToDelete.length > 0) {
      // IMPORTANTE: Deletar em lotes se for muito grande
      await utapi.deleteFiles(filesToDelete);
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
    const categories = await db.business.groupBy({
      by: ["category"],
      where: {
        published: true,
        isActive: true,
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

export async function generateCommission(
  userId: string,
  orderAmount: number,
  description: string,
) {
  try {
    // 1. Verifica se quem comprou tem um afiliado vinculado
    const customer = await db.user.findUnique({
      where: { id: userId },
      select: { affiliateId: true },
    });

    if (!customer?.affiliateId)
      return { success: false, message: "Usuário não tem afiliado." };

    // 2. Calcula os 20% exatos
    const commissionAmount = Number((orderAmount * 0.2).toFixed(2));

    // 3. Define a data de liberação (Ex: 7 dias de garantia para evitar estorno)
    const releaseDate = new Date();
    releaseDate.setDate(releaseDate.getDate() + 7);

    // 4. Salva a comissão como PENDENTE no banco de dados
    await db.commission.create({
      data: {
        affiliateId: customer.affiliateId,
        userId: userId,
        amount: commissionAmount,
        orderAmount: orderAmount,
        status: CommissionStatus.PENDING, // 🛡️ Usa o Enum oficial que você já importou lá no topo!
        description: description,
        releaseDate: releaseDate,
      },
    });

    console.log(
      `✅ Comissão de R$ ${commissionAmount} gerada para o afiliado ${customer.affiliateId}`,
    );
    return { success: true };
  } catch (error) {
    console.error("Erro ao gerar comissão:", error);
    return { error: "Falha ao registrar comissão no banco." };
  }
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
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
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
    // 1. Puxa os dados do Afiliado e seus clientes diretos (via affiliateId)
    const affiliate = await db.user.findUnique({
      where: { id: sessionUser.id },
      include: {
        referrals: {
          where: {
            // 🚀 TRAVA SÊNIOR: Não traz o próprio afiliado na lista de clientes
            NOT: { id: sessionUser.id },
          },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
            role: true, // 🚀 MANTÉM O CARGO (ASSINANTE/VISITANTE)
            // ❌ REMOVIDOS DAQUI: expiresAt, planType, mpSubscriptionId
            businesses: {
              select: {
                slug: true,
                isActive: true,
                planType: true, // 🚀 AGORA VEM DO NEGÓCIO
                expiresAt: true, // 🚀 AGORA VEM DO NEGÓCIO
                mpSubscriptionId: true, // 🚀 AGORA VEM DO NEGÓCIO
                createdAt: true,
              },
              // Não podemos mais usar o orderBy na raiz do cliente com base no expiresAt,
              // então trazemos todos os negócios ou apenas o primeiro para exibir.
            },
          },
          orderBy: { createdAt: "desc" }, // Mudamos a ordenação para os clientes mais recentes
        },
        commissions: {
          // Vendas automáticas do Mercado Pago
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!affiliate) return { error: "Parceiro não encontrado." };

    return {
      success: true,
      affiliate: {
        name: affiliate.name,
        referralCode: affiliate.referralCode,
      },
      clients: affiliate.referrals,
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
    const hoje = new Date();

    const partners = await db.user.findMany({
      where: { role: "AFILIADO" as Role }, // 🛡️ Garantindo o Enum do Prisma
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        commissions: {
          where: {
            OR: [
              { status: CommissionStatus.AVAILABLE }, // 🛡️ Usa o Enum oficial
              { status: CommissionStatus.PENDING, releaseDate: { lte: hoje } }, // 🛡️ Usa o Enum oficial
            ],
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
        };
      })
      .filter((p) => p.valorDevido > 0); // Só mostra quem tem dinheiro pra receber

    return { success: true, payouts: payoutData };
  } catch (error) {
    return { error: "Erro ao calcular pagamentos." };
  }
}
// 2. Registra o pagamento e "Zera" o saldo do parceiro
export async function markAffiliateAsPaid(affiliateId: string) {
  const adminId = await requireAdmin(); // Supondo que essa seja sua função de auth
  if (!adminId) return { error: "Não autorizado." };

  try {
    // 🚀 AGORA SIM O PRISMA VAI ENTENDER!
    const atualizacao = await db.commission.updateMany({
      where: {
        affiliateId: affiliateId,
        status: CommissionStatus.AVAILABLE, // Usando o Enum oficial
      },
      data: {
        status: CommissionStatus.PAID, // Usando o Enum oficial
      },
    });

    if (atualizacao.count === 0) {
      return {
        error:
          "Erro: Nenhuma comissão com status AVAILABLE encontrada no Prisma.",
      };
    }

    // Atualiza a data do último pagamento no usuário
    await db.user.update({
      where: { id: affiliateId },
      data: { lastPayoutDate: new Date() },
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard/parceiro");

    return {
      success: true,
      message: `Sucesso! ${atualizacao.count} comissão(ões) movida(s) para o Extrato.`,
    };
  } catch (error) {
    console.error("Erro crítico ao registrar pagamento:", error);
    return { error: "Erro interno no banco de dados." };
  }
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
    // Tenta pegar a primeira loja que o usuário já tenha
    const firstBusiness = dbUser?.businesses[0];

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
    const targetBusiness = dbUser?.businesses.find(
      (b) => b.id === finalBusinessId,
    );
    if (!targetBusiness) {
      return { error: "Negócio não encontrado ou não pertence a você." };
    }
  }

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
      back_url: "https://tafanu.vercel.app/checkout/sucesso",

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

  const biz = await db.business.findFirst({
    where: { userId: session.user.id },
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

    // 2. Traz os anúncios de volta e limpa o status de cancelamento
    await db.business.updateMany({
      where: { userId: userId },
      data: {
        isActive: true,
        published: true,
        subscriptionStatus: "cancelled", // ✅ Consertado!
      },
    });

    revalidatePath("/");
    revalidatePath("/busca");
    revalidatePath("/admin");

    return {
      success: true,
      message: "Usuário desbanido e anúncios reativados!",
    };
  } catch (error) {
    console.error("Erro ao desbanir:", error);
    return { error: "Erro ao desbanir usuário." };
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

    // 2. Atualiza o negócio com a nova data
    await db.business.update({
      where: { id: businessId },
      data: {
        expiresAt: newDate,
        isActive: true, // Garante que a vitrine volte ao ar, se estivesse caída
        subscriptionStatus: "active",
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
  try {
    // 1. Busca o usuário
    const user = await db.user.findUnique({
      where: { email },
      select: { name: true, emailVerified: true },
    });

    if (!user) return { error: "Usuário não encontrado." };
    if (user.emailVerified) return { error: "Este e-mail já está verificado." };

    // 2. Gera um novo token (usando a função que já criamos)
    const verificationToken = await generateVerificationToken(email);

    const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const confirmLink = `${domain}/verificar-email?token=${verificationToken.token}`;

    // 3. Dispara o e-mail
    await resend.emails.send({
      from: "Tafanu <onboarding@resend.dev>",
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
  try {
    // 🛡️ Segurança: Pega o ID direto da sessão autenticada do servidor
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Não autorizado." };
    }

    // Define o userId com base em quem está logado
    const userId = session.user.id;

    const newComment = await db.comment.create({
      data: {
        content,
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
  // 1. Validação de Segurança (Garante que só você, o Admin, faça isso)
  const session = await auth();
  const emailSessao = session?.user?.email?.toLowerCase();
  if (!emailSessao || emailSessao !== process.env.ADMIN_EMAIL) {
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
