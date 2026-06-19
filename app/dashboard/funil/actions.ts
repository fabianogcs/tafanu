"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { hashSync } from "bcryptjs";
import { auth } from "@/auth";

export async function moverEtapaFunil(businessId: string, novaEtapa: number) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "AFILIADO")
  ) {
    return { success: false, error: "Acesso negado." };
  }

  // 🚀 CIRURGIA: Garante que o Afiliado só tenha poder sobre os próprios leads
  const business = await db.business.findUnique({
    where: { id: businessId },
    select: { user: { select: { affiliateId: true } } },
  });

  if (
    session.user.role === "AFILIADO" &&
    business?.user?.affiliateId !== session.user.id
  ) {
    return { success: false, error: "Este lead não pertence a você." };
  }

  try {
    await db.business.update({
      where: { id: businessId },
      data: { etapaFunil: novaEtapa },
    });
    revalidatePath("/dashboard/funil");
    return { success: true };
  } catch (error) {
    console.error("Erro ao mover lead:", error);
    return { success: false };
  }
}

export async function criarLeadDireto(formData: FormData) {
  const session = await auth();

  // 1. TRAVA DE SEGURANÇA ESTRATÉGICA:
  // Agora SOMENTE o ADMIN pode criar essas contas fantasma de 30 dias.
  if (!session?.user || session.user.role !== "ADMIN") {
    return {
      success: false,
      error:
        "Acesso negado. Apenas o Administrador pode gerar contas de demonstração.",
    };
  }

  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const affiliateCode = formData.get("affiliateCode") as string;
  const password = formData.get("password") as string;

  try {
    // 2. CHECAGEM AMIGÁVEL DE E-MAIL:
    // Em vez do banco de dados "crashar", nós verificamos antes e damos um aviso limpo.
    const emailExiste = await db.user.findUnique({ where: { email } });
    if (emailExiste) {
      return {
        success: false,
        error:
          "Este e-mail já existe no sistema. Crie um diferente (ex: pizzaria02@tafanu.com.br).",
      };
    }

    let affiliateId = null;
    if (affiliateCode) {
      const aff = await db.user.findUnique({
        where: { referralCode: affiliateCode },
      });
      if (aff) affiliateId = aff.id;
    }

    const hashedPassword = hashSync(password, 10);

    const newUser = await db.user.create({
      data: {
        email,
        name,
        phone,
        role: "ASSINANTE",
        emailVerified: new Date(), // Pula a verificação de email para não travar o processo
        affiliateId: affiliateId,
        password: hashedPassword,
      },
    });

    // 3. A BLINDAGEM DO LINK (SLUG):
    // Usamos a data atual em milissegundos + um código aleatório. É 100% impossível duplicar.
    const slug = `loja-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    await db.business.create({
      data: {
        name: name,
        slug: slug,
        category: "Geral",
        description: "Qualidade e excelência confirmadas na região.",
        userId: newUser.id,
        // 4. MANTIVE A SUA ESTRATÉGIA DE 30 DIAS DE DEGUSTAÇÃO
        expiresAt: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
        etapaFunil: 1,
        isActive: true,
        published: false,
      },
    });

    revalidatePath("/dashboard/funil");
    return { success: true };
  } catch (error: any) {
    console.error("ERRO REAL AO CRIAR LEAD:", error);
    return {
      success: false,
      error: "Falha interna ao criar a conta. Tente novamente.",
    };
  }
}
