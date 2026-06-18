// lib/services.ts
import { db } from "@/lib/db";
import { CommissionStatus } from "@prisma/client";

// 🛡️ ESTE ARQUIVO NÃO TEM "use server".
// Ele é invisível e inacessível para os navegadores de quem visita o site.

export async function generateCommission(
  userId: string,
  orderAmount: number,
  description: string,
  planType: "monthly" | "quarterly" | "yearly" = "monthly",
  mpPaymentId: string,
) {
  try {
    // 1. Verifica se quem comprou tem um afiliado vinculado
    const customer = await db.user.findUnique({
      where: { id: userId },
      select: { affiliateId: true },
    });

    if (!customer?.affiliateId) return { success: false };

    // 🚀 LÓGICA DE CAIXA
    const comissoes = {
      monthly: 10.0,
      quarterly: 30.0,
      yearly: 120.0,
    };

    const amount = comissoes[planType] || 10.0;

    // Define a data de liberação (7 dias de garantia)
    const releaseDate = new Date();
    releaseDate.setDate(releaseDate.getDate() + 7);

    // 🛡️ A BARRAGEM ANTI-DUPLICATA
    const jaExiste = await db.commission.findFirst({
      where: {
        userId: userId,
        description: description,
        status: { not: "CANCELLED" },
      },
    });

    if (jaExiste) return { success: true, message: "Comissão já registrada." };

    // Salva a comissão como PENDENTE no banco
    await db.commission.create({
      data: {
        affiliateId: customer.affiliateId,
        userId: userId,
        amount: amount,
        orderAmount: orderAmount,
        status: CommissionStatus.PENDING,
        description: description,
        releaseDate: releaseDate,
        mpPaymentId: mpPaymentId,
      },
    });

    console.log(
      `✅ Comissão (RevShare) de R$ ${amount} gerada para o afiliado ${customer.affiliateId}`,
    );
    return { success: true };
  } catch (error) {
    console.error("Erro ao gerar comissão:", error);
    return { error: "Falha ao registrar comissão no banco." };
  }
}
