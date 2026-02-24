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

    // 1. Verificamos se é uma notificação de Assinatura (PreApproval)
    if (
      body.type === "subscription_preapproval" ||
      body.entity === "preapproval"
    ) {
      const preApprovalId = body.data?.id || body.id;

      if (!preApprovalId)
        return new NextResponse("ID não encontrado", { status: 400 });

      // 2. Buscamos os detalhes reais da assinatura no Mercado Pago
      const preApproval = new PreApproval(client);
      const subscription = await preApproval.get({ id: preApprovalId });

      const userId = subscription.external_reference;
      const status = subscription.status; // 'authorized' é o que queremos

      console.log(
        `[Webhook MP] Assinatura ${preApprovalId} - Status: ${status} - Usuário: ${userId}`,
      );

      // 3. Se a assinatura estiver ativa/autorizada
      if (status === "authorized") {
        // Calculamos a expiração baseada no plano
        const now = new Date();
        let expiresAt = new Date();

        const frequency = subscription.auto_recurring?.frequency;
        const type = subscription.auto_recurring?.frequency_type;

        if (type === "months") {
          if (frequency === 1) {
            // Mensal: 7 dias de teste + 30 dias de ciclo
            expiresAt.setDate(now.getDate() + 37);
          } else if (frequency === 3) {
            // Trimestral
            expiresAt.setDate(now.getDate() + 90);
          }
        } else if (type === "years") {
          // Anual
          expiresAt.setFullYear(now.getFullYear() + 1);
        }

        // 4. ATUALIZAMOS O USUÁRIO NO BANCO
        await db.user.update({
          where: { id: userId },
          data: {
            role: "ASSINANTE",
            expiresAt: expiresAt,
            // Guardamos o ID da assinatura para facilitar o cancelamento depois
          },
        });

        console.log(
          `✅ Usuário ${userId} promovido a ASSINANTE até ${expiresAt.toLocaleDateString()}`,
        );
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[Webhook MP] Erro Crítico:", error);
    return new NextResponse("Erro Interno", { status: 500 });
  }
}
