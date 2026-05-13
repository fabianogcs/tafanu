"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { hashSync } from "bcrypt-ts";
import { auth } from "@/auth";

export async function moverEtapaFunil(businessId: string, novaEtapa: number) {
  // 👈 ADICIONE ESTAS 4 LINHAS DE TRAVA:
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "AFILIADO")
  ) {
    return { success: false, error: "Acesso negado." };
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
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "AFILIADO")
  ) {
    return { success: false, error: "Acesso negado." };
  }

  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const affiliateCode = formData.get("affiliateCode") as string;
  const password = formData.get("password") as string;

  try {
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
        emailVerified: new Date(),
        affiliateId: affiliateId,
        password: hashedPassword,
      },
    });

    const slug =
      name.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
      "-" +
      Math.floor(Math.random() * 1000);

    await db.business.create({
      data: {
        name: name,
        slug: slug,
        category: "Geral",
        description: "Qualidade e excelência confirmadas na região.",
        userId: newUser.id,
        expiresAt: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
        etapaFunil: 1,
        isActive: true,
        published: false,
      },
    });

    revalidatePath("/dashboard/funil");
    return { success: true };
  } catch (error: any) {
    // 🚀 Se der erro de novo, o terminal do VS Code vai nos contar exatamente o que é!
    console.error("ERRO REAL AO CRIAR LEAD:", error);
    return {
      success: false,
      error:
        "Falha ao criar. Olhe o terminal do VS Code para ver o erro exato.",
    };
  }
}
