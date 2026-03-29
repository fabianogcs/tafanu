import { db } from "@/lib/db";
import { PlanType, Role } from "@prisma/client";
import { MercadoPagoConfig, PreApproval } from "mercadopago";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { generateCommission } from "@/app/actions";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

// 🛡️ FUNÇÃO DE SEGURANÇA: Validação defensiva (Ajuste 2)
interface MPWebhookBody {
  data?: { id?: string | number };
  id?: string | number;
  type?: string;
  entity?: string;
}

// 🛡️ FUNÇÃO DE SEGURANÇA: Validação defensiva (Ajuste 2)
function validateSignature(request: Request, body: MPWebhookBody) {
  const signature = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id");
  const secret = process.env.MP_WEBHOOK_SECRET;

  // 🔸 Ajuste 2: Verifica se a assinatura existe e se tem o formato esperado
  if (
    !signature ||
    !secret ||
    !requestId ||
    !signature.includes("ts=") ||
    !signature.includes("v1=")
  ) {
    return false;
  }

  try {
    const parts = Object.fromEntries(
      signature.split(",").map((p) => p.split("=")),
    );

    const ts = parts["ts"];
    const v1 = parts["v1"];

    const manifest = `id:${body.data?.id || body.id};request-id:${requestId};ts:${ts};`;
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(manifest);
    const checkV1 = hmac.digest("hex");

    return v1 === checkV1;
  } catch (e) {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MPWebhookBody;

    // 1. [SEGURANÇA] Bloqueia acessos sem assinatura válida
    if (!validateSignature(request, body)) {
      console.warn("🚨 [Webhook MP] Tentativa inválida de acesso bloqueada.");
      return new NextResponse("Assinatura Inválida", { status: 401 });
    }

    console.log(`[Webhook MP] Evento recebido: ${body.type || body.entity}`);

    if (
      body.type === "subscription_preapproval" ||
      body.entity === "preapproval"
    ) {
      const resourceId = body.data?.id || body.id;

      // 🔸 Ajuste 3: Hardening no resourceId (evita crash se vier vazio)
      if (!resourceId) {
        return new NextResponse("Resource ID ausente", { status: 400 });
      }

      // 2. [BUSCA REAL NA API]
      const preApproval = new PreApproval(client);
      const subscription = await preApproval.get({ id: String(resourceId) });

      if (!subscription) {
        console.error(
          `[Webhook MP] Assinatura ${resourceId} não encontrada na API.`,
        );
        return new NextResponse("Assinatura não encontrada", { status: 404 });
      }

      const userId = subscription.external_reference;
      const status = subscription.status;

      // 🔸 Ajuste 4: Log de elite para debug futuro
      console.log(
        `📡 [Webhook MP] status=${status} user=${userId} sub=${subscription.id}`,
      );

      if (!userId)
        return new NextResponse("External Reference ausente", { status: 400 });

      // 3. [BUSCA USUÁRIO]
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { id: true, mpSubscriptionId: true, expiresAt: true },
      });

      if (!user)
        return new NextResponse("Usuário não existe no banco", { status: 404 });

      if (!user.mpSubscriptionId && status !== "authorized") {
        console.log(
          `⚠️ [Webhook MP] Ignorando ${status} para o usuário ${userId}. Assinatura já encerrada no banco.`,
        );
        return new NextResponse("Já processado ou cancelado manualmente", {
          status: 200,
        });
      }

      // 🔴 RE-ADICIONANDO: IDEMPOTÊNCIA (Proteção contra duplicação do MP)
      if (
        user.mpSubscriptionId === subscription.id &&
        user.expiresAt &&
        subscription.next_payment_date &&
        new Date(user.expiresAt) >= new Date(subscription.next_payment_date)
      ) {
        console.log(
          `[Webhook MP] Ignorando duplicata para o usuário ${userId}`,
        );
        return new NextResponse("Já processado", { status: 200 });
      }

      // --- CENÁRIO A: PAGAMENTO APROVADO ---
      if (status === "authorized") {
        const expiresAt = subscription.next_payment_date
          ? new Date(subscription.next_payment_date)
          : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);

        let planType: PlanType = "monthly";
        const frequency = subscription.auto_recurring?.frequency;

        if (frequency === 3) planType = "quarterly";
        else if (frequency === 12) planType = "yearly";
        const transactionAmount =
          subscription.auto_recurring?.transaction_amount ?? 0;

        await db.user.update({
          where: { id: userId },
          data: {
            role: "ASSINANTE" as Role,
            expiresAt: expiresAt,
            mpSubscriptionId: subscription.id,
            lastPrice: subscription.auto_recurring?.transaction_amount ?? 0,
            planType: planType,
          },
        });
        if (transactionAmount > 0) {
          const descricaoPlano =
            planType === "monthly"
              ? "Mensal"
              : planType === "quarterly"
                ? "Trimestral"
                : "Anual";
          await generateCommission(
            userId,
            transactionAmount,
            `Assinatura ${descricaoPlano} - Cliente ID: ${userId}`,
          );
        }

        revalidatePath("/", "layout");
        console.log(
          `✅ Sucesso: ${userId} PRO (${planType}) até ${expiresAt.toLocaleDateString()}`,
        );
      }
      // --- CENÁRIO B: CANCELADO OU REJEITADO ---
      else if (
        status === "cancelled" ||
        status === "paused" ||
        status === "rejected"
      ) {
        console.log(
          `ℹ️ [Webhook MP] Assinatura cancelada/pausada para ${userId}. Mantendo acesso até expirar.`,
        );

        await db.user.update({
          where: { id: userId },
          data: {
            mpSubscriptionId: null, // Apenas removemos o vínculo de cobrança
          },
        });

        revalidatePath("/", "layout");
      } else {
        console.log(
          `ℹ️ [Webhook MP] Status ignorado (nenhuma ação tomada): ${status}`,
        );
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[Webhook MP] Erro Crítico:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
