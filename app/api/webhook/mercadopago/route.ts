import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { MercadoPagoConfig, PreApproval } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, type, data } = body;

    // 1. O Mercado Pago envia vários tipos de avisos.
    // Nós queremos focar quando uma assinatura (preapproval) é criada ou atualizada.
    if (type === "preapproval" || action.includes("subscription")) {
      const preApproval = new PreApproval(client);

      // Procuramos os detalhes dessa assinatura no Mercado Pago
      const subscriptionDetails = await preApproval.get({ id: data.id });

      // 2. Lembra-se do external_reference? É aqui que o recuperamos!
      const userId = subscriptionDetails.external_reference;
      const status = subscriptionDetails.status;

      if (userId && status === "authorized") {
        const trintaDias = new Date();
        trintaDias.setDate(trintaDias.getDate() + 30);

        // 3. ATUALIZAÇÃO NO BANCO DE DADOS
        await db.user.update({
          where: { id: userId },
          data: {
            role: "ASSINANTE",
            expiresAt: trintaDias, // Dá 30 dias de acesso
          },
        });

        console.log(`✅ Usuário ${userId} ativado com sucesso!`);
      }
    }

    // O Mercado Pago exige que respondamos 200 (OK) rapidamente
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Erro no Webhook do Mercado Pago:", error);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }
}
