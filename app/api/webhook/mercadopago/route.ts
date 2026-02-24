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

      // 2. Buscamos os detalhes reais da assinatura
      const preApproval = new PreApproval(client);
      const subscription = await preApproval.get({ id: resourceId });

      const userId = subscription.external_reference;
      const status = subscription.status;

      // 🏆 O PULO DO GATO: Pegamos o ID de dentro da resposta da API
      // Esse id SEMPRE começa com 'pre_'
      const realSubscriptionId = subscription.id;

      console.log(
        `[Webhook MP] Assinatura ${realSubscriptionId} - Status: ${status} - Usuário: ${userId}`,
      );

      // 3. Se a assinatura estiver autorizada
      if (status === "authorized") {
        const now = new Date();
        let expiresAt = new Date();

        const frequency = subscription.auto_recurring?.frequency;
        const type = subscription.auto_recurring?.frequency_type;

        // Lógica de expiração ajustada para os seus 3 planos
        if (type === "months") {
          if (frequency === 1) {
            expiresAt.setDate(now.getDate() + 37); // Mensal (com margem de teste)
          } else if (frequency === 3) {
            expiresAt.setDate(now.getDate() + 95); // Trimestral
          } else if (frequency === 12) {
            expiresAt.setFullYear(now.getFullYear() + 1); // Anual (12 meses)
          }
        } else if (type === "years") {
          expiresAt.setFullYear(now.getFullYear() + 1); // Anual
        }

        // 4. ATUALIZAMOS O USUÁRIO NO BANCO
        await db.user.update({
          where: { id: userId },
          data: {
            role: "ASSINANTE",
            expiresAt: expiresAt,
            mpSubscriptionId: realSubscriptionId, // 👈 AGORA SALVAMOS O 'pre_...' REAL
          },
        });

        console.log(
          `✅ Usuário ${userId} promovido com ID: ${realSubscriptionId}`,
        );
      }

      // Se o status for 'cancelled', podemos aproveitar e já tirar o acesso aqui também
      if (status === "cancelled" || status === "paused") {
        await db.user.update({
          where: { id: userId },
          data: { role: "VISITANTE" },
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
