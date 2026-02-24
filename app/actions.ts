"use server";
import { businessSchema, userProfileSchema } from "@/lib/schemas";
import { UTApi } from "uploadthing/server";
import { db } from "@/lib/db";
import { hash, compare } from "bcryptjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { cpf } from "cpf-cnpj-validator";
import { auth, signIn, signOut } from "@/auth";
import { Resend } from "resend";
import crypto from "crypto";
import { MercadoPagoConfig, PreApproval, PreApprovalPlan } from "mercadopago"; // 👈 NOVO IMPORT AQUI

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

const utapi = new UTApi();
const resend = new Resend(process.env.RESEND_API_KEY);

function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD") // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Remove os acentos
    .replace(/\s+/g, "-") // Substitui espaços por hífen
    .replace(/[^\w-]+/g, "") // Remove caracteres especiais
    .replace(/--+/g, "-"); // Remove hífens duplicados
}

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
    if (!apiKey || !address || !city || !state) return { lat: null, lng: null };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`,
      { signal: controller.signal },
    );

    clearTimeout(timeout);
    const data = await response.json();
    if (data.status === "OK") {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat: Number(lat), lng: Number(lng) };
    }
    return { lat: null, lng: null };
  } catch (error) {
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

  // 1. MEMÓRIA DE AFILIADO: Tenta pegar o código do formulário OU do cookie
  const cookieStore = await cookies();
  const affiliateCode =
    (formData.get("affiliateCode") as string) ||
    cookieStore.get("affiliate_code")?.value;

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
    await db.user.create({
      data: {
        name,
        email,
        emailVerified: new Date(),
        password: hashedPassword,
        role,
        document: cleanDocument,
        affiliateId, // Aqui o usuário fica "preso" ao parceiro para sempre
      },
    });

    // 6. LIMPEZA: Remove o cookie de indicação após o cadastro com sucesso
    if (affiliateCode) {
      cookieStore.delete("affiliate_code");
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

  // 1. CAPTURA O DESTINO QUE VEM DA TELA
  const callbackUrl = formData.get("callbackUrl") as string;

  let dbUser = await db.user.findUnique({ where: { email } });

  // (Sua lógica de expiração mantida abaixo)
  if (
    dbUser &&
    dbUser.role === "ASSINANTE" &&
    dbUser.expiresAt &&
    new Date(dbUser.expiresAt) < new Date()
  ) {
    await db.user.update({
      where: { id: dbUser.id },
      data: { role: "VISITANTE" },
    });
  }

  try {
    // 2. DEFINE O DESTINO: Prioridade para o callbackUrl (checkout)
    let destino = callbackUrl || "/";

    if (!callbackUrl) {
      if (dbUser?.role === "ADMIN") destino = "/admin";
      else if (dbUser?.role === "ASSINANTE") destino = "/dashboard";
    }

    await signIn("credentials", {
      email,
      password,
      redirectTo: destino, // O servidor agora obedece o destino correto
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
      data: { role: "ASSINANTE" },
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

export async function createBusiness(formData: FormData) {
  const session = await getSafeUser();
  if (!session) return { error: "Não autorizado." };
  const userId = session.id;

  const dbUser = await db.user.findUnique({ where: { id: userId } });
  if (dbUser?.role === "ASSINANTE" && (!dbUser.document || !dbUser.phone))
    return { error: "Complete seu perfil primeiro." };

  const rawData: any = Object.fromEntries(formData.entries());
  rawData.subcategory = formData.getAll("subcategory");
  rawData.features = formData.getAll("features");
  rawData.gallery = formData.getAll("gallery");
  rawData.keywords = formData.getAll("keywords");
  rawData.faqs = formData.get("faqs")?.toString() || "[]";
  rawData.hours = formData.get("hours")?.toString() || "[]";

  const validatedFields = businessSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    const firstMessage = Object.values(fieldErrors).flat()[0];
    return { error: firstMessage || "Verifique os dados informados." };
  }

  const validatedData = validatedFields.data;
  const slug = validatedData.slug.toLowerCase().trim();
  const existing = await db.business.findUnique({ where: { slug } });
  if (existing) return { error: "Slug já em uso." };

  const coords = await getCoordinates(
    validatedData.address || "",
    validatedData.city || "",
    validatedData.state || "",
  );
  const faqs = safeParseArray(formData.get("faqs"));
  const hours = safeParseArray(formData.get("hours"));

  try {
    await db.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          userId,
          name: validatedData.name,
          slug,
          theme: validatedData.theme,
          layout: validatedData.layout,
          category: validatedData.category,
          subcategory: formData.getAll("subcategory") as string[],
          description: validatedData.description,
          whatsapp: (validatedData.whatsapp || "").replace(/\D/g, ""),
          phone: (validatedData.phone || "").replace(/\D/g, ""),
          address: validatedData.address,
          city: validatedData.city,
          state: validatedData.state,
          latitude: coords.lat,
          longitude: coords.lng,
          imageUrl: (formData.get("imageUrl") as string) || "",
          videoUrl: (formData.get("videoUrl") as string) || null,
          heroImage: (formData.get("heroImage") as string) || null,
          gallery: formData.getAll("gallery") as string[],
          features: formData.getAll("features") as string[],
          keywords: validatedData.keywords,
          instagram: cleanSocialLink(validatedData.instagram || ""),
          facebook: cleanSocialLink(validatedData.facebook || ""),
          tiktok: cleanSocialLink(validatedData.tiktok || ""),
          faqs,
          urban_tag: (formData.get("urban_tag") as string) || null,
          luxe_quote: (formData.get("luxe_quote") as string) || null,
          comercial_badge: (formData.get("comercial_badge") as string) || null,
          showroom_collection:
            (formData.get("showroom_collection") as string) || null,
        },
      });

      if (hours && hours.length > 0) {
        await tx.businessHour.createMany({
          data: hours.map((h: any) => ({
            businessId: business.id,
            dayOfWeek: h.dayOfWeek,
            openTime: h.openTime || "09:00",
            closeTime: h.closeTime || "18:00",
            isClosed: !!h.isClosed,
          })),
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/busca");
    return { success: true };
  } catch (error) {
    console.error("ERRO NO BANCO:", error);
    return { error: "Erro ao criar anúncio." };
  }
}

export async function updateFullBusiness(slug: string, payload: any) {
  const user = await getSafeUser();
  if (!user) return { error: "Não autorizado." };
  const userId = user.id;

  try {
    // 1. BUSCA O NEGÓCIO ATUAL
    const oldBusiness = await db.business.findUnique({
      where: { slug },
      select: {
        id: true,
        userId: true,
        imageUrl: true,
        heroImage: true,
        videoUrl: true,
        gallery: true,
      },
    });

    if (!oldBusiness || oldBusiness.userId !== userId)
      return { error: "Negado." };

    // 2. VALIDA OS DADOS QUE CHEGARAM
    const validatedFields = businessSchema.safeParse(payload);

    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten().fieldErrors;
      const firstErrorMessage = Object.values(errors).flat()[0];
      return { error: firstErrorMessage || "Verifique os dados." };
    }

    const { hours: _ignoredHours, ...validatedData } = validatedFields.data;

    // 3. GERA O NOVO SLUG (LINK) BASEADO NO NOME
    const novoSlug = generateSlug(payload.name);

    // Verifica se o novo link já existe em outro lugar
    if (novoSlug !== slug) {
      const exists = await db.business.findUnique({
        where: { slug: novoSlug },
      });
      if (exists)
        return { error: "Este nome já gera um link em uso. Tente outro." };
    }

    // 4. PROCESSA AS KEYWORDS (ESTAVA FALTANDO ESSA ORDEM)
    const keywords =
      typeof payload.keywords === "string"
        ? payload.keywords
            .split(",")
            .map((k: any) => k.trim().toLowerCase())
            .filter(Boolean)
            .slice(0, 10)
        : Array.isArray(payload.keywords)
          ? payload.keywords.slice(0, 10)
          : [];

    // 5. BUSCA COORDENADAS NO MAPS
    const coords = await getCoordinates(
      validatedData.address || "",
      validatedData.city || "",
      validatedData.state || "",
    );

    // 6. LOGICA DE LIMPEZA DE IMAGENS (FAXINA)
    const filesToDelete: string[] = [];
    if (oldBusiness.imageUrl && oldBusiness.imageUrl !== payload.imageUrl)
      filesToDelete.push(oldBusiness.imageUrl);
    if (oldBusiness.heroImage && oldBusiness.heroImage !== payload.heroImage)
      filesToDelete.push(oldBusiness.heroImage);
    if (oldBusiness.videoUrl && oldBusiness.videoUrl !== payload.videoUrl)
      filesToDelete.push(oldBusiness.videoUrl);

    const oldGallery = oldBusiness.gallery || [];
    const newGallery = (payload.gallery as string[]) || [];
    oldGallery.forEach((oldUrl) => {
      if (!newGallery.includes(oldUrl)) filesToDelete.push(oldUrl);
    });

    if (filesToDelete.length > 0) {
      await deleteFilesFromUploadThing(filesToDelete);
    }

    // 7. MONTA O OBJETO FINAL PARA O BANCO
    const updateData = {
      ...validatedData,
      name: payload.name,
      slug: novoSlug,
      cep: payload.cep,
      keywords: keywords, // Agora a variável já existe acima!
      latitude: coords.lat,
      longitude: coords.lng,
      whatsapp: (payload.whatsapp || "").replace(/\D/g, ""),
      phone: (payload.phone || "").replace(/\D/g, ""),
      imageUrl: payload.imageUrl,
      heroImage: payload.heroImage,
      videoUrl: payload.videoUrl,
      gallery: payload.gallery,
      features: payload.features,
      instagram: cleanSocialLink(validatedData.instagram || ""),
      facebook: cleanSocialLink(validatedData.facebook || ""),
      tiktok: cleanSocialLink(validatedData.tiktok || ""),
      subcategory: payload.subcategory,
      urban_tag: payload.urban_tag,
      luxe_quote: payload.luxe_quote,
      comercial_badge: payload.comercial_badge,
      showroom_collection: payload.showroom_collection,
      faqs: validatedData.faqs,
    };

    // 8. ATUALIZA
    await db.business.update({
      where: { id: oldBusiness.id },
      data: updateData,
    });

    // 9. LIMPA O CACHE (Para o navegador e Google verem a mudança)
    revalidatePath("/");
    revalidatePath("/busca");
    revalidatePath("/dashboard");
    revalidatePath(`/site/${slug}`); // Link antigo
    revalidatePath(`/site/${novoSlug}`); // Link novo

    return { success: true, newSlug: novoSlug };
  } catch (error) {
    console.error("Erro no update:", error);
    return { error: "Erro ao salvar." };
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
        heroImage: true,
        videoUrl: true,
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
    if (b.heroImage) filesToDelete.push(b.heroImage);
    if (b.videoUrl) filesToDelete.push(b.videoUrl);
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

export async function incrementViews(
  businessId: string,
  userId: string | undefined, // O userId agora é opcional
) {
  // 1. REMOVEMOS o "if (!userId) return;"
  // Agora a função continua mesmo que o usuário seja deslogado.

  const cookieStore = await cookies();
  const cookieName = `viewed_${businessId}`;

  // 2. Trava por Cookie (MANTIDA)
  // Isso evita que a mesma pessoa (logada ou não) conte 50 visitas ao dar F5.
  if (cookieStore.get(cookieName)) return;

  try {
    const b = await db.business.findUnique({
      where: { id: businessId },
      select: { userId: true },
    });

    // 3. Checagem de Dono (AJUSTADA)
    // Só barramos se o usuário ESTIVER logado E for o dono da empresa.
    // Se userId for undefined (deslogado), ele passa direto por aqui.
    if (userId && b?.userId === userId) return;

    // 4. Incrementa a visita no banco
    await db.business.update({
      where: { id: businessId },
      data: { views: { increment: 1 } },
    });

    // 5. Salva o cookie no navegador do visitante (logado ou não)
    // Expira em 24h (86400 segundos)
    cookieStore.set(cookieName, "true", {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400,
      path: "/",
      httpOnly: true,
    });
  } catch (error) {
    console.error("Erro ao incrementar views:", error);
  }
}

export async function toggleFavorite(businessId: string) {
  const user = await getSafeUser();
  if (!user) return { error: "Não autorizado." };
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
    return { error: "Erro favoritar." };
  }
}

export async function incrementWhatsappClicks(businessId: string) {
  try {
    await db.business.update({
      where: { id: businessId },
      data: { whatsapp_clicks: { increment: 1 } },
    });
  } catch (error) {
    console.error(error);
  }
}

export async function incrementPhoneClicks(businessId: string) {
  try {
    await db.business.update({
      where: { id: businessId },
      data: { phone_clicks: { increment: 1 } },
    });
  } catch (error) {
    console.error(error);
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
      data: { role: "ASSINANTE", expiresAt: newDate },
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
    // 1. Busca o ID da assinatura no banco
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { mpSubscriptionId: true },
    });

    // 2. Avisa o Mercado Pago para cancelar
    if (user?.mpSubscriptionId) {
      const preApproval = new PreApproval(client);
      await preApproval.update({
        id: user.mpSubscriptionId,
        body: { status: "cancelled" },
      });
    }

    // 3. Atualiza o banco rebaixando o cara
    await db.user.update({
      where: { id: userId },
      data: {
        role: "VISITANTE",
        expiresAt: null,
        mpSubscriptionId: null, // Limpa a gaveta
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
export async function getRandomBusinesses(userId?: string) {
  try {
    const validIds = await db.business.findMany({
      where: {
        isActive: true,
        published: true,
        user: {
          OR: [
            { role: "ADMIN" },
            {
              role: "ASSINANTE",
              expiresAt: { gt: new Date() },
            },
          ],
        },
      },
      select: { id: true },
    });

    // 2. Embaralha a lista de IDs
    const shuffledIds = validIds
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value.id)
      .slice(0, 12); // Pega só os 12 primeiros sorteados

    // 3. Busca os dados completos desses 12 IDs sorteados
    if (shuffledIds.length === 0) return [];

    const randomBusinesses = await db.business.findMany({
      where: { id: { in: shuffledIds } },
      include: {
        hours: true,
        favorites: userId ? { where: { userId } } : false,
        _count: {
          select: { favorites: true },
        },
      },
    });

    // MAPEAMENTO IMPORTANTE AQUI TAMBÉM:
    return randomBusinesses
      .map((b) => ({
        ...b,
        isFavorited: userId ? b.favorites.length > 0 : false,
        favoritesCount: b._count.favorites,
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
        heroImage: true,
        videoUrl: true,
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
      add(b.heroImage);
      add(b.videoUrl);
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
// ... (mantenha todo o resto do arquivo igual)

// --- AÇÃO PARA CONTAR INSTALAÇÃO DO PWA ---
export async function incrementInstallCount(slug: string) {
  try {
    await db.business.update({
      where: { slug },
      data: { installs: { increment: 1 } },
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao contar instalação:", error);
    return { success: false };
  }
}
// Adicione no final de app/actions.ts

export async function getHomeBusinesses(userId?: string) {
  try {
    const businesses = await db.business.findMany({
      where: {
        published: true,
        isActive: true,
      },
      include: {
        // Traz apenas o favorito do usuário logado (se houver)
        favorites: userId ? { where: { userId } } : false,
        _count: {
          select: { favorites: true },
        },
      },
      orderBy: [{ views: "desc" }, { favorites: { _count: "desc" } }],
      take: 12,
    });

    // MAPEAMENTO: Transforma o array 'favorites' em um booleano 'isFavorited'
    return businesses.map((b) => ({
      ...b,
      isFavorited: userId ? b.favorites.length > 0 : false,
      favoritesCount: b._count.favorites,
    }));
  } catch (error) {
    console.error("Erro ao buscar destaques:", error);
    return [];
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
        role: "AFILIADO",
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

  // 1. Bloqueio de segurança: Só parceiros ou admins entram
  if (
    !sessionUser ||
    (sessionUser.role !== "AFILIADO" && sessionUser.role !== "ADMIN")
  ) {
    return { error: "Não autorizado." };
  }

  try {
    const userId = sessionUser.id;
    const VALOR_MENSALIDADE = 29.9;
    const hoje = new Date();

    // 2. Busca dados do parceiro (especialmente o último reset de pagamento)
    const partner = await db.user.findUnique({
      where: { id: userId },
      select: {
        referralCode: true,
        affiliateSince: true,
        createdAt: true,
        lastPayoutDate: true, // Crucial para zerar o saldo após você pagar
      },
    });

    // 3. Busca todos os indicados (referrals)
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
        businesses: { select: { slug: true, name: true }, take: 1 },
      },
    });

    // Filtro de tempo: 30 dias atrás (para separar teste de R$ 1,00 da mensalidade real)
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);

    // --- SEPARAÇÃO DAS GAVETAS (LÓGICA UNIFICADA) ---

    // GAVETA 1: ATIVOS (Gerando lucro AGORA)
    // Condição: > 30 dias de casa + Plano Ativo + Não foi pago no último reset
    // 1. ATIVOS (Quem já pagou os 29,90 e ainda não foi comissionado após o último reset)
    const ativos = allReferrals.filter((u) => {
      // 🛡️ GUARDA DE SEGURANÇA: Se não tiver data de expiração ou criação, ignora o usuário
      if (!u.expiresAt || !u.createdAt) return false;

      // Agora o TypeScript sabe que u.expiresAt e u.createdAt EXISTEM nesta linha
      const isComissionavel = u.createdAt <= trintaDiasAtras;
      const isAtivo = u.expiresAt > hoje;

      // 🔒 TRAVA DE RESET: Verifica se esse pagamento já foi "limpo" no último reset
      let jaPagoNesteCiclo = false;

      if (partner?.lastPayoutDate) {
        // Criamos a data de corte: data do último pagamento + 30 dias
        const dataCorte = new Date(
          partner.lastPayoutDate.getTime() + 30 * 24 * 60 * 60 * 1000,
        );

        // Se a expiração atual do cliente é menor que a data de corte, ele já foi pago
        jaPagoNesteCiclo = u.expiresAt < dataCorte;
      }

      return (
        u.role === "ASSINANTE" &&
        isComissionavel &&
        isAtivo &&
        !jaPagoNesteCiclo
      );
    });

    // GAVETA 2: EM TESTE (Aguardando maturação)
    // Condição: < 30 dias de casa (Pagou R$ 1,00) + Plano Ativo
    const emTeste = allReferrals.filter((u) => {
      const ehNovo = u.createdAt > trintaDiasAtras;
      const isAtivo = u.expiresAt && u.expiresAt > hoje;
      return u.role === "ASSINANTE" && ehNovo && isAtivo;
    });

    // GAVETA 3: INATIVOS (Sem lucro)
    // Condição: Visitante OU Assinante com plano vencido
    const inativos = allReferrals.filter((u) => {
      const expirado = !u.expiresAt || u.expiresAt <= hoje;
      return u.role === "VISITANTE" || (u.role === "ASSINANTE" && expirado);
    });

    // --- CÁLCULO DE TAXAS E METAS ---
    const novosPagantesEsteMes = ativos.length;

    let taxaAtual = 15; // Nível Bronze
    if (novosPagantesEsteMes >= 20)
      taxaAtual = 30; // Nível Ouro
    else if (novosPagantesEsteMes >= 10) taxaAtual = 20; // Nível Prata

    return {
      success: true,
      referralCode: partner?.referralCode,
      stats: {
        taxaAtual,
        ganhoEstimado: ativos.length * VALOR_MENSALIDADE * (taxaAtual / 100),
        potencialFuturo: emTeste.length * VALOR_MENSALIDADE * (taxaAtual / 100),
        vendasConfirmadas: novosPagantesEsteMes,
        progressoMeta: Math.min((novosPagantesEsteMes / 20) * 100, 100),
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
    const VALOR_MENSALIDADE = 29.9;
    const hoje = new Date();
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);

    // Busca todos os parceiros
    const partners = await db.user.findMany({
      where: { role: "AFILIADO" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        lastPayoutDate: true, // Data do último "Reset" que você deu
        referrals: {
          where: {
            role: "ASSINANTE",
            expiresAt: { gt: hoje },
            createdAt: { lte: trintaDiasAtras }, // 🔒 TRAVA DE SEGURANÇA: Só conta quem já pagou os 29,90
          },
          select: { id: true },
        },
      },
    });

    const payoutData = partners.map((p) => {
      // Lógica de meta idêntica à do parceiro
      const qtdAtivos = p.referrals.length;
      let taxa = 0.15;
      if (qtdAtivos >= 20) taxa = 0.3;
      else if (qtdAtivos >= 10) taxa = 0.2;

      return {
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        ativos: qtdAtivos,
        taxa: taxa * 100,
        valorDevido: qtdAtivos * VALOR_MENSALIDADE * taxa,
        ultimoPagamento: p.lastPayoutDate,
      };
    });

    return { success: true, payouts: payoutData };
  } catch (error) {
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
  // 1. Usamos PreApproval (Assinatura direta)
  const preApproval = new PreApproval(client);

  // 2. IDs que você pegou nas URLs (os moldes fixos)
  const PLAN_IDS = {
    monthly: "1d60e8a12620447fbb7cebaa10c31ab8",
    quarterly: "3b5d1ca1907b4905a976df346c78f5cf",
    yearly: "8f68660b45ae4d8fb4076b921837d349",
  };

  const planId = PLAN_IDS[planType];

  try {
    const body = {
      preapproval_plan_id: planId, // Usa o plano fixo
      payer_email: userEmail,
      back_url: "https://tafanu.vercel.app/dashboard",
      external_reference: userId, // ID do usuário para o Webhook achar depois
      reason:
        planType === "monthly"
          ? "Tafanu PRO - Mensal"
          : planType === "quarterly"
            ? "Tafanu PRO - Trimestral"
            : "Tafanu PRO - Anual",
    };

    const response = await preApproval.create({ body });

    // O init_point aqui vai levar o usuário para o checkout do plano fixo
    return { success: true, init_point: response.init_point };
  } catch (error) {
    console.error("Erro ao gerar link de assinatura:", error);
    return { error: "Não foi possível gerar o link de assinatura." };
  }
}
// app/actions.ts

export async function getAuthSession() {
  const session = await auth(); // Usa a função auth() que você já tem importada lá no topo

  if (!session?.user?.id) return null;

  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
  };
}
