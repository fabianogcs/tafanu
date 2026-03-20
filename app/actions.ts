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
  if (user?.role !== "ADMIN" && user?.email !== "prfabianoguedes@gmail.com")
    return null;
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
    select: { id: true, role: true, expiresAt: true, email: true },
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

  // --- 🛡️ TRAVA DE E-MAIL INVÁLIDO (Ex: fabiano@a) ---
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email || !emailRegex.test(email)) {
    return {
      error: "Por favor, insira um e-mail válido (ex: nome@dominio.com).",
    };
  }
  // --------------------------------------------------

  // 1. MEMÓRIA DE AFILIADO: Tenta pegar o código do formulário OU do cookie
  const cookieStore = await cookies();
  const formAffiliateCode = formData.get("affiliateCode") as string;
  const cookieAffiliateCode = cookieStore.get("tafanu_ref")?.value;

  const affiliateCode = formAffiliateCode || cookieAffiliateCode;

  // Define a função do usuário (Admin se for seu e-mail, senão Visitante)
  let role = (formData.get("role") as string) || "VISITANTE";
  if (email.toLowerCase() === "prfabianoguedes@gmail.com") role = "ADMIN";

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

    // 4. VÍNCULO COM O PARCEIRO (AFILIADO)
    let affiliateId = null;
    if (affiliateCode) {
      const partner = await db.user.findUnique({
        where: { referralCode: affiliateCode.toLowerCase().trim() },
        select: { id: true },
      });
      // Se o código for válido, guardamos o ID do parceiro
      if (partner) affiliateId = partner.id;
    }

    // 5. CRIAÇÃO NO BANCO DE DADOS
    // Nota: Removi o "emailVerified: new Date()" para o usuário começar como NÃO verificado
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

    // 5.5 ENVIO DE E-MAIL DE VERIFICAÇÃO (MÁGICA DO RESEND)
    const verificationToken = await generateVerificationToken(email);
    const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const confirmLink = `${domain}/verificar-email?token=${verificationToken.token}`;

    try {
      await resend.emails.send({
        from: "Tafanu <onboarding@resend.dev>", // Certifique-se que este e-mail está configurado no Resend
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
            <p style="font-size: 12px; color: #666;">Este link expira em 24 horas. Se você não solicitou este cadastro, ignore este e-mail.</p>
          </div>
        `,
      });
    } catch (e) {
      console.error("Erro ao enviar e-mail de verificação:", e);
      // Não travamos o cadastro se o e-mail falhar, mas o usuário precisará pedir reenvio depois.
    }
    // 6. LIMPEZA: Remove o cookie de indicação após o cadastro com sucesso
    // para não dar comissão dupla se ele cadastrar o irmão no mesmo PC depois.
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

  // 1. CAPTURA O DESTINO QUE VEM DA TELA (Original mantido)
  const callbackUrl = formData.get("callbackUrl") as string;

  let dbUser = await db.user.findUnique({ where: { email } });

  // 2. VERIFICA SE USUÁRIO EXISTE (Segurança básica)
  if (!dbUser || !dbUser.password) {
    return { error: "E-mail ou senha inválidos." };
  }

  // 3. VERIFICA SENHA E TRAVA E-MAIL NÃO VERIFICADO
  const isPasswordCorrect = await compare(password, dbUser.password);
  if (!isPasswordCorrect) {
    return { error: "E-mail ou senha inválidos." };
  }

  // 👇 O PULO DO GATO: Se a senha tá certa, mas não verificou o e-mail, barramos aqui.
  if (!dbUser.emailVerified) {
    return {
      error: "E-mail não verificado.",
      notVerified: true,
      email: dbUser.email,
    };
  }

  // 4. LÓGICA DE EXPIRAÇÃO (Sua lógica original mantida abaixo)
  if (
    dbUser.role === ("ASSINANTE" as Role) &&
    dbUser.expiresAt &&
    new Date(dbUser.expiresAt) < new Date()
  ) {
    await db.user.update({
      where: { id: dbUser.id },
      data: { role: "VISITANTE" as Role },
    });
  }

  try {
    // 5. DEFINE O DESTINO (Original mantido)
    let destino = callbackUrl || "/";

    if (!callbackUrl) {
      if (dbUser?.role === ("ADMIN" as Role)) destino = "/admin";
      else if (dbUser?.role === ("ASSINANTE" as Role)) destino = "/dashboard";
    }

    // 6. REALIZA O LOGIN DE FATO
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

export async function upgradeUserToAssinante() {
  const user = await getSafeUser();
  if (!user) return { error: "Não autorizado." };

  try {
    await db.user.update({
      where: { id: user.id },
      data: { role: "ASSINANTE" as Role },
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Erro no upgrade." };
  }
}

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

// 🏗️ CRIAÇÃO DE NEGÓCIO (Limpo e Seguro)
export async function createBusiness(payload: any) {
  const session = await getSafeUser();
  if (!session) return { error: "Não autorizado." };

  const validatedFields = businessSchema.safeParse(payload);
  if (!validatedFields.success) return { error: "Dados inválidos." };

  const validatedData = validatedFields.data;

  const coords = await getCoordinates(
    validatedData.address || "",
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
          theme: validatedData.theme,
          layout: validatedData.layout as LayoutType,
          category: validatedData.category,
          subcategory: payload.subcategory || [],
          description: validatedData.description,
          whatsapp: (validatedData.whatsapp || "").replace(/\D/g, ""),
          phone: (validatedData.phone || "").replace(/\D/g, ""),
          address: validatedData.address,
          // 🛡️ Normalização para a busca "Vila Tu" funcionar
          city: normalizeText(validatedData.city || ""),
          neighborhood: normalizeText(payload.neighborhood || ""),
          state: validatedData.state,
          latitude: coords.lat,
          longitude: coords.lng,
          imageUrl: payload.imageUrl || "",
          gallery: payload.gallery || [],
          features: payload.features || [],
          // 🚀 O PULO DO GATO: Salva as palavras-chave do usuário + o Nome do Negócio 100% sem acentos
          keywords: Array.from(
            new Set([
              ...(payload.keywords || []).map((k: string) => normalizeText(k)),
              normalizeText(validatedData.name),
              normalizeText(validatedData.category),
              ...(payload.subcategory || []).map((s: string) =>
                normalizeText(s),
              ),
              // 👇 ESSA É A LINHA NOVA QUE RESOLVE TUDO 👇
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

    if (!old || old.userId !== user.id) return { error: "Negado." };

    const validatedFields = businessSchema.safeParse(payload);
    if (!validatedFields.success) return { error: "Verifique os dados." };

    const validatedData = validatedFields.data;

    // 💰 ECONOMIA: SÓ CHAMA O GOOGLE SE O ENDEREÇO MUDOU
    let lat = old.latitude;
    let lng = old.longitude;
    const addressChanged =
      old.address !== validatedData.address ||
      old.city !== validatedData.city ||
      old.state !== validatedData.state;

    if (addressChanged) {
      const newCoords = await getCoordinates(
        validatedData.address || "",
        validatedData.city || "",
        validatedData.state || "",
      );
      lat = newCoords.lat;
      lng = newCoords.lng;
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
        category: validatedData.category,
        subcategory: payload.subcategory || [],
        theme: validatedData.theme,
        layout: validatedData.layout as LayoutType,
        whatsapp: (validatedData.whatsapp || "").replace(/\D/g, ""),
        phone: (validatedData.phone || "").replace(/\D/g, ""),
        address: validatedData.address,
        cep: payload.cep || "", // 🚀 TAVA FALTANDO
        city: normalizeText(validatedData.city || ""),
        neighborhood: normalizeText(payload.neighborhood || ""),
        state: validatedData.state, // 🚀 TAVA FALTANDO
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
    const b = await db.business.findUnique({
      where: { slug },
      select: {
        id: true,
        userId: true,
        imageUrl: true,
        gallery: true,
      },
    });

    if (!b || b.userId !== userId) return { error: "Negado." };

    await db.$transaction([
      db.businessHour.deleteMany({ where: { businessId: b.id } }),
      db.favorite.deleteMany({ where: { businessId: b.id } }),
      db.report.deleteMany({ where: { businessId: b.id } }),
      db.business.delete({ where: { id: b.id } }),
    ]);

    // --- COLETA TUDO QUE PRECISA SER DELETADO ---
    const filesToDelete: string[] = [];
    if (b.imageUrl) filesToDelete.push(b.imageUrl);
    if (b.gallery && b.gallery.length > 0) {
      filesToDelete.push(...b.gallery);
    }

    // Manda deletar tudo de uma vez
    if (filesToDelete.length > 0) {
      await deleteFilesFromUploadThing(filesToDelete);
    }

    revalidatePath("/dashboard");
    revalidatePath("/busca");
    revalidatePath(`/site/${slug}`);

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir:", error);
    return { error: "Erro ao excluir. Tente novamente." };
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

    console.log(`[Analytics] +1 visualização real para a loja: ${businessId}`);
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

export async function adminAddDaysToUser(
  userId: string,
  monthsToAdd: number = 1,
) {
  if (!(await requireAdmin())) return { error: "Acesso negado." };
  try {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return { error: "Não encontrado." };
    const now = new Date();
    const base =
      user.expiresAt && new Date(user.expiresAt) > now
        ? new Date(user.expiresAt)
        : now;
    const newDate = new Date(base);
    newDate.setMonth(newDate.getMonth() + monthsToAdd);
    await db.user.update({
      where: { id: userId },
      data: { role: "ASSINANTE" as Role, expiresAt: newDate },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { error: "Erro adicionar tempo." };
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
export async function cancelSubscriptionAction() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return { error: "Não autorizado." };

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { mpSubscriptionId: true },
    });

    // 1. Avisa o Mercado Pago para cancelar a recorrência
    if (user?.mpSubscriptionId) {
      const preApproval = new PreApproval(client);
      await preApproval.update({
        id: user.mpSubscriptionId,
        body: { status: "cancelled" },
      });
    }

    // 2. ATUALIZAÇÃO GENTIL NO BANCO (Deixa ele usar até o fim)
    await db.user.update({
      where: { id: userId },
      data: {
        mpSubscriptionId: null, // Limpa apenas a gaveta de cobrança
      },
    });

    revalidatePath("/dashboard/perfil");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Erro ao cancelar:", error);
    return { error: "Erro ao processar o cancelamento." };
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
        user: {
          OR: [
            { role: "ADMIN" as Role },
            { role: "ASSINANTE" as Role, expiresAt: { gt: new Date() } },
          ],
        },
      },
    });

    if (totalBusinesses === 0) return [];

    // 3. MATEMÁTICA DO PULO ALEATÓRIO (OFFSET O(1))
    // Calcula um número aleatório para "pular", garantindo que sobrem 12 itens
    const skipAmount = Math.max(
      0,
      Math.floor(Math.random() * (totalBusinesses - 12)),
    );

    // 4. BUSCA APENAS 12 NEGÓCIOS, DIRETO DO BANCO!
    const randomBusinesses = await db.business.findMany({
      where: {
        isActive: true,
        published: true,
        user: {
          OR: [
            { role: "ADMIN" as Role },
            { role: "ASSINANTE" as Role, expiresAt: { gt: new Date() } },
          ],
        },
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
      .sort(() => Math.random() - 0.5); // Embaralha só os 12 na tela (Super leve)
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
    const hoje = new Date();

    const partner = await db.user.findUnique({
      where: { id: userId },
      select: { referralCode: true, createdAt: true, lastPayoutDate: true },
    });

    const allReferrals = await db.user.findMany({
      where: { affiliateId: userId },
      select: {
        id: true,
        name: true,
        role: true,
        email: true,
        phone: true,
        createdAt: true,
        expiresAt: true,
        lastPrice: true,
        businesses: { select: { slug: true, name: true }, take: 1 },
      },
    });

    // 1. DATA DE CORTE DO CICLO
    // Ex: Se o afiliado foi criado dia 05/01, e hoje é 20/02. O ciclo atual começou 05/02.
    const dataCriacaoParceiro = partner?.createdAt
      ? new Date(partner.createdAt)
      : new Date();
    const diaFechamento = dataCriacaoParceiro.getDate();

    let inicioCicloAtual = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      diaFechamento,
    );
    if (hoje < inicioCicloAtual) {
      inicioCicloAtual.setMonth(inicioCicloAtual.getMonth() - 1); // Volta pro mês passado se o dia do fechamento ainda não chegou
    }

    // --- SEPARAÇÃO DAS GAVETAS ---

    const ativos = allReferrals.filter((u) => {
      if (!u.expiresAt || !u.createdAt) return false;
      const dataCriacaoCliente = new Date(u.createdAt);

      // REGRA DO TESTE GRÁTIS: Só conta se já passou de 7 dias (cobrança real ocorreu)
      const diasDeCasa =
        (hoje.getTime() - dataCriacaoCliente.getTime()) / (1000 * 60 * 60 * 24);
      const isCobrado = diasDeCasa > 7;

      const isAtivo = u.expiresAt > hoje;

      // TRAVA DO CICLO E HIGH TICKET:
      // Conta se o cliente renovou/pagou DENTRO do ciclo atual.
      // Se ele já foi pago pelo Admin (lastPayoutDate), ignora.
      let pagoNesteCiclo = false;
      if (
        partner?.lastPayoutDate &&
        partner.lastPayoutDate >= inicioCicloAtual
      ) {
        pagoNesteCiclo = true;
      }

      return (
        u.role === ("ASSINANTE" as Role) &&
        isCobrado &&
        isAtivo &&
        !pagoNesteCiclo
      );
    });

    const emTeste = allReferrals.filter((u) => {
      if (!u.createdAt || !u.expiresAt) return false;
      const diasDeCasa =
        (hoje.getTime() - new Date(u.createdAt).getTime()) /
        (1000 * 60 * 60 * 24);
      return u.role === "ASSINANTE" && diasDeCasa <= 7 && u.expiresAt > hoje;
    });

    const inativos = allReferrals.filter((u) => {
      const expirado = !u.expiresAt || u.expiresAt <= hoje;
      return (
        u.role === ("VISITANTE" as Role) ||
        (u.role === ("ASSINANTE" as Role) && expirado)
      );
    });

    // --- MATEMÁTICA PRO MAX (TAXAS E HIGH TICKET) ---
    // Clientes High Ticket não influenciam na regra de % da mensalidade de 29.90,
    // mas geram 30% na veia.

    let baseMensal = 0; // Contagem só da galera de 29,90
    let lucroEstimado = 0;

    ativos.forEach((u) => {
      const valorPago = Number(u.lastPrice) || 29.9;

      if (valorPago > 30) {
        // HIGH TICKET (Trimestral/Anual): 30% direto, não conta na base mensal de taxa
        lucroEstimado += valorPago * 0.3;
      } else {
        baseMensal += 1; // Soma na meta
      }
    });

    // Calcula a taxa baseada em quem paga R$ 29,90
    let taxaAtual = 15;
    if (baseMensal >= 20) taxaAtual = 30;
    else if (baseMensal >= 10) taxaAtual = 20;

    // Aplica a taxa na galera do mensal e soma ao High Ticket
    lucroEstimado += baseMensal * 29.9 * (taxaAtual / 100);

    // O potencial futuro calcula os de 7 dias considerando a taxa base atual
    // (aqui assumimos que eles vão assinar o mensal)
    const potencialFuturo = emTeste.length * 29.9 * (taxaAtual / 100);

    return {
      success: true,
      referralCode: partner?.referralCode,
      createdAt: partner?.createdAt,
      stats: {
        taxaAtual,
        ganhoEstimado: lucroEstimado,
        potencialFuturo,
        vendasConfirmadas: ativos.length, // Mostra o total para dar moral, mesmo se for High Ticket
        progressoMeta: Math.min((baseMensal / 20) * 100, 100), // Barra de progresso baseada só no plano de 29.90
      },
      ativos,
      emTeste,
      inativos,
    };
  } catch (error) {
    console.error("Erro na Server Action getAffiliateStats:", error);
    return { error: "Erro interno no servidor ao processar estatísticas." };
  }
}
// 1. Busca a lista de parceiros e quanto eles têm para receber
export async function getAffiliatePayouts() {
  const sessionUser = await getSafeUser();
  if (!sessionUser || sessionUser.role !== "ADMIN")
    return { error: "Não autorizado." };

  try {
    const hoje = new Date();

    // Busca todos os parceiros
    const partners = await db.user.findMany({
      where: { role: "AFILIADO" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        lastPayoutDate: true,
        referrals: {
          where: {
            role: "ASSINANTE" as Role,
            expiresAt: { gt: hoje },
          },
          select: { id: true, createdAt: true, lastPrice: true },
        },
      },
    });

    const payoutData = partners.map((p) => {
      // 1. DATA DE CORTE DO PARCEIRO
      const dataCriacaoParceiro = p.createdAt
        ? new Date(p.createdAt)
        : new Date();
      const diaFechamento = dataCriacaoParceiro.getDate();

      let inicioCicloAtual = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        diaFechamento,
      );
      if (hoje < inicioCicloAtual) {
        inicioCicloAtual.setMonth(inicioCicloAtual.getMonth() - 1);
      }

      // 2. FILTRA OS ATIVOS DESTE CICLO (Passaram dos 7 dias E não foram pagos)
      const ativosNesteCiclo = p.referrals.filter((u) => {
        const diasDeCasa =
          (hoje.getTime() - new Date(u.createdAt).getTime()) /
          (1000 * 60 * 60 * 24);
        const isCobrado = diasDeCasa > 7;

        let pagoNesteCiclo = false;
        if (p.lastPayoutDate && p.lastPayoutDate >= inicioCicloAtual) {
          pagoNesteCiclo = true;
        }

        return isCobrado && !pagoNesteCiclo;
      });

      // 3. MATEMÁTICA PRO MAX (Admin)
      let baseMensal = 0;
      let valorDevido = 0;

      ativosNesteCiclo.forEach((u) => {
        const valorPago = Number(u.lastPrice) || 29.9;
        if (valorPago > 30) {
          valorDevido += valorPago * 0.3; // High Ticket: 30% na lata
        } else {
          baseMensal += 1;
        }
      });

      let taxa = 0.15;
      if (baseMensal >= 20) taxa = 0.3;
      else if (baseMensal >= 10) taxa = 0.2;

      valorDevido += baseMensal * 29.9 * taxa;

      return {
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        ativos: ativosNesteCiclo.length, // Total real para mostrar na dashboard
        taxa: taxa * 100, // Mostra a taxa base alcançada
        valorDevido: valorDevido, // O PIX exato que você deve mandar
        ultimoPagamento: p.lastPayoutDate,
      };
    });

    return { success: true, payouts: payoutData };
  } catch (error) {
    console.error("Erro em getAffiliatePayouts:", error);
    return { error: "Erro ao calcular pagamentos." };
  }
}

// 2. Registra o pagamento e "Zera" o saldo do parceiro
export async function markAffiliateAsPaid(affiliateId: string) {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Não autorizado." };

  try {
    await db.user.update({
      where: { id: affiliateId },
      data: { lastPayoutDate: new Date() },
    });

    // ⬅️ ESSENCIAL: Faz o AdminDashboard e o AffiliateDashboard atualizarem os valores na hora
    revalidatePath("/admin");
    revalidatePath("/dashboard/parceiro");

    return { success: true, message: "Pagamento registrado e saldo resetado!" };
  } catch (error) {
    return { error: "Erro ao registrar pagamento." };
  }
}

export async function createSubscription(
  userId: string,
  userEmail: string,
  planType: "monthly" | "quarterly" | "yearly" = "monthly",
) {
  const dbUser = await db.user.findUnique({ where: { id: userId } });

  if (dbUser?.isBanned) {
    return { error: "Sua conta possui restrições." };
  }

  const hasUsedTrial = !!dbUser?.expiresAt;

  // 🛡️ Mudança para PreApproval: Isso gera o checkout direto para o usuário
  const subscriptionClient = new PreApproval(client);

  const planConfigs = {
    monthly: {
      amount: 29.9,
      reason: "Assinatura Tafanu PRO - Mensal",
      trialDays: hasUsedTrial ? 0 : 7,
    },
    quarterly: {
      amount: 74.7,
      reason: "Assinatura Tafanu PRO - Trimestral",
      trialDays: 0,
    },
    yearly: {
      amount: 238.8,
      reason: "Assinatura Tafanu PRO - Anual",
      trialDays: 0,
    },
  };

  const config = planConfigs[planType];

  try {
    const body = {
      reason: config.reason,
      payer_email: userEmail, // ⬅️ Agora no lugar certo
      auto_recurring: {
        frequency:
          planType === "quarterly" ? 3 : planType === "yearly" ? 12 : 1,
        frequency_type: "months",
        transaction_amount: config.amount,
        currency_id: "BRL",
        // Só adiciona trial se for o caso
        ...(config.trialDays > 0 && {
          free_trial: {
            frequency: config.trialDays,
            frequency_type: "days",
          },
        }),
      },

      back_url: "https://tafanu.vercel.app/dashboard",
      external_reference: userId,
      payment_methods_allowed: {
        payment_types: [{ id: "credit_card" }],
        payment_methods: [],
      },
    };

    const response = await subscriptionClient.create({ body });

    // O init_point aqui é o que abre o checkout pronto para o usuário
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
// 🔨 BANIR USUÁRIO, CANCELAR PAGAMENTO E DERRUBAR ANÚNCIOS
export async function banUserAction(userId: string) {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Acesso negado." };

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { mpSubscriptionId: true, role: true },
    });

    if (!user) return { error: "Usuário não encontrado." };

    // 1. Se ele tiver assinatura ativa, cancelamos no Mercado Pago agora!
    if (user.mpSubscriptionId) {
      try {
        const preApproval = new PreApproval(client);
        await preApproval.update({
          id: user.mpSubscriptionId,
          body: { status: "cancelled" },
        });
      } catch (mpError) {
        console.error("Erro ao cancelar no MP:", mpError);
      }
    }

    // 2. Aplicamos o Banimento no Banco de Dados
    await db.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        role: "VISITANTE" as Role, // Rebaixa na hora
        mpSubscriptionId: null,
        expiresAt: null,
      },
    });

    // 3. Derruba os anúncios do usuário!
    await db.business.updateMany({
      where: { userId: userId },
      data: {
        isActive: false,
        published: false,
      },
    });

    revalidatePath("/");
    revalidatePath("/busca");
    revalidatePath("/admin");

    return {
      success: true,
      message: "Usuário banido e anúncios removidos do ar.",
    };
  } catch (error) {
    return { error: "Erro ao processar banimento." };
  }
}

// 🔓 DESBANIR USUÁRIO E RESTAURAR ANÚNCIOS
export async function unbanUserAction(userId: string) {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Acesso negado." };

  try {
    // 1. Tira o banimento da conta
    await db.user.update({
      where: { id: userId },
      data: { isBanned: false },
    });

    // 2. Traz os anúncios de volta à vida!
    await db.business.updateMany({
      where: { userId: userId },
      data: {
        isActive: true,
        published: true,
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
    return { error: "Erro ao desbanir usuário." };
  }
}
// ⏱️ ADICIONAR DIAS EXATOS (TESTE GRÁTIS)
export async function adminAddExactDaysToUser(
  userId: string,
  daysToAdd: number,
) {
  const adminId = await requireAdmin();
  if (!adminId) return { error: "Acesso negado." };

  try {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return { error: "Não encontrado." };

    const now = new Date();
    // Se ele já tem tempo, soma a partir do tempo dele. Se tá vencido, soma a partir de hoje.
    const base =
      user.expiresAt && new Date(user.expiresAt) > now
        ? new Date(user.expiresAt)
        : now;

    const newDate = new Date(base);
    newDate.setDate(newDate.getDate() + daysToAdd); // Soma os dias precisos

    await db.user.update({
      where: { id: userId },
      data: { role: "ASSINANTE" as Role, expiresAt: newDate },
    });

    revalidatePath("/admin");
    return {
      success: true,
      message: `${daysToAdd} dias adicionados com sucesso!`,
    };
  } catch (error) {
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
  userId: string,
  content: string,
  parentId?: string,
) {
  try {
    const newComment = await db.comment.create({
      data: {
        content,
        businessId,
        userId,
        parentId: parentId || null,
      },
    });

    // Revalidar a página do negócio para mostrar o novo comentário imediatamente
    // Como não sabemos o slug aqui, o ideal é revalidar tudo ou passar o slug
    // Se quiser ser específico, passe o slug como parâmetro. Vou revalidar o path genérico.
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
  const ADMIN_EMAILS = ["prfabianoguedes@gmail.com"]; // Seu e-mail de poder

  if (!emailSessao || !ADMIN_EMAILS.includes(emailSessao)) {
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
