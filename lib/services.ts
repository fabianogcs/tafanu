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
  businessId: string,
) {
  try {
    // 1. Busca o cliente E valida se o afiliado existe e NÃO está banido no banco
    const customer = await db.user.findUnique({
      where: { id: userId },
      select: {
        affiliateId: true,
        affiliate: {
          select: { id: true, isBanned: true },
        },
      },
    });

    if (
      !customer?.affiliateId ||
      !customer.affiliate ||
      customer.affiliate.isBanned
    ) {
      console.warn(
        `⚠️ [RevShare] Comissão abortada: Afiliado inexistente ou banido para o usuário ${userId}`,
      );
      return { success: false };
    }

    // 🛡️ TRAVA ANTI-FRAUDE: Se o afiliado tentar comprar com o próprio link, bloqueia!
    if (customer.affiliateId === userId) {
      console.warn(
        `🚨 [Fraude] Bloqueada tentativa de auto-compra do usuário/afiliado: ${userId}`,
      );
      return { success: false, error: "Auto-compra não permitida." };
    }

    // 🚀 LÓGICA DE CAIXA COM TETO DE MARGEM (CFO BLINDADO)
    const comissoesBase = {
      monthly: 10.0,
      quarterly: 30.0,
      yearly: 120.0,
    };

    const comissaoIdeal = comissoesBase[planType] || 10.0;

    // 🛡️ TRAVA FINOPS: A comissão NUNCA pode ultrapassar 50% do valor real pago pelo cliente!
    // Se o cliente usou cupom e pagou R$ 5,00, a comissão será cortada para R$ 2,50 no máximo.
    const MAX_REVSHARE_PERCENTAGE = 0.5;
    const amount = Number(
      Math.min(comissaoIdeal, orderAmount * MAX_REVSHARE_PERCENTAGE).toFixed(2),
    );

    if (amount <= 0) {
      console.warn(
        `⚠️ [RevShare] Valor da transação (R$ ${orderAmount}) insuficiente para gerar comissão.`,
      );
      return { success: false, error: "Valor insuficiente para comissão." };
    }

    // Define a data de liberação (7 dias de garantia)
    const releaseDate = new Date();
    releaseDate.setDate(releaseDate.getDate() + 7);

    // 🚀 CIRURGIA DE IDEMPOTÊNCIA: Gravamos direto no banco.
    // Se o recibo (mpPaymentId) já existir, o banco bloqueia sem Race Condition!
    await db.commission.create({
      data: {
        affiliateId: customer.affiliateId,
        userId: userId,
        businessId: businessId,
        amount: amount,
        orderAmount: orderAmount,
        status: CommissionStatus.PENDING,
        description: description,
        releaseDate: releaseDate,
        mpPaymentId: String(mpPaymentId),
      },
    });

    console.log(
      `✅ Comissão (RevShare) de R$ ${amount} gerada para o afiliado ${customer.affiliateId}`,
    );
    return { success: true };
  } catch (error: any) {
    // 🛡️ WHITE HAT FIX: Se o banco recusar por código único (P2002), é idempotência operando perfeitamente!
    if (error?.code === "P2002") {
      console.log(
        `[RevShare] Comissão para o recibo ${mpPaymentId} já foi gerada por outra thread. OK.`,
      );
      return {
        success: true,
        message: "Comissão já registrada (Idempotência).",
      };
    }
    console.error("Erro crítico ao gerar comissão:", error);
    return { success: false, error: "Falha ao registrar comissão no banco." };
  }
}
