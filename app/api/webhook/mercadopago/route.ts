import { db } from "@/lib/db";
import { MercadoPagoConfig, PreApproval } from "mercadopago";
import { NextResponse } from "next/server";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[Webhook MP] Recebido:", body);

    // 1. Verificamos se é uma notificação de Assinatura
    if (
      body.type === "subscription_preapproval" ||
      body.entity === "preapproval"
    ) {
      const resourceId = body.data?.id || body.id;

      if (!resourceId)
        return new NextResponse("ID não encontrado", { status: 400 });

      // 2. Buscamos os detalhes reais da assinatura na API do Mercado Pago
      const preApproval = new PreApproval(client);
      const subscription = await preApproval.get({ id: resourceId });

      const userId = subscription.external_reference;
      const status = subscription.status;
      const realSubscriptionId = subscription.id;

      // 💰 O PULO DO GATO: Pegamos o valor real que o cliente pagou agora
      const amountPaid = subscription.auto_recurring?.transaction_amount;

      console.log(
        `[Webhook MP] Assinatura ${realSubscriptionId} - Status: ${status} - Valor: R$ ${amountPaid} - Usuário: ${userId}`,
      );

      // 3. Se a assinatura estiver autorizada/paga
      if (status === "authorized") {
        const now = new Date();
        let expiresAt = new Date();

        const frequency = subscription.auto_recurring?.frequency;
        const type = subscription.auto_recurring?.frequency_type;

        // Lógica de expiração baseada no plano escolhido
        if (type === "months") {
          if (frequency === 1) {
            expiresAt.setDate(now.getDate() + 37); // Mensal (R$ 29,90)
          } else if (frequency === 3) {
            expiresAt.setDate(now.getDate() + 95); // Trimestral (R$ 74,70)
          } else if (frequency === 12) {
            expiresAt.setFullYear(now.getFullYear() + 1); // Anual (R$ 238,80)
          }
        } else if (type === "years") {
          expiresAt.setFullYear(now.getFullYear() + 1); // Anual
        }

        // 4. ATUALIZAMOS O USUÁRIO COM O VALOR REAL DO PLANO
        await db.user.update({
          where: { id: userId },
          data: {
            role: "ASSINANTE",
            expiresAt: expiresAt,
            mpSubscriptionId: realSubscriptionId,
            lastPrice: amountPaid, // 👈 SALVA O VALOR (29.9, 74.7 ou 238.8)
          },
        });

        console.log(
          `✅ Usuário ${userId} promovido. Valor salvo: R$ ${amountPaid}`,
        );
      }

      // Se o status for cancelado ou pausado
      if (status === "cancelled" || status === "paused") {
        await db.user.update({
          where: { id: userId },
          data: {
            role: "VISITANTE",
            mpSubscriptionId: null, // Limpa para permitir nova assinatura futura
          },
        });
        console.log(`🚫 Assinatura cancelada para o usuário ${userId}`);
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[Webhook MP] Erro Crítico:", error);
    return new NextResponse("Erro Interno", { status: 500 });
  }
}
