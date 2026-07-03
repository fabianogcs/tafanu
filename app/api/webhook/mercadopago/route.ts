import { db } from "@/lib/db";
import { PlanType, Role, CommissionStatus } from "@prisma/client";
import { MercadoPagoConfig, PreApproval, Payment } from "mercadopago";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { generateCommission } from "@/lib/services";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

interface MPWebhookBody {
  data?: { id?: string | number };
  id?: string | number;
  type?: string;
  entity?: string;
  action?: string;
}

// 🛡️ MÁGICA 1: Validação Híbrida (Lê URL e Body para nunca falhar a assinatura)
function validateSignature(request: Request, body: MPWebhookBody, url: URL) {
  const signature = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id");
  const secret = process.env.MP_WEBHOOK_SECRET;

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

    const now = Math.floor(Date.now() / 1000);
    // Janela de 5 minutos contra Replay Attacks
    if (Math.abs(now - Number(ts)) > 300) {
      return false;
    }

    // 🚀 O SEGREDO DO MERCADO PAGO: Se o id vier na URL, usamos ele!
    const dataId =
      url.searchParams.get("data.id") ||
      url.searchParams.get("id") ||
      body.data?.id ||
      body.id;

    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(manifest);
    const checkV1 = hmac.digest("hex");

    // 🚀 HACKER FIX: Comparação em Tempo Constante (Constant-Time) contra Timing Attacks.
    // Criamos buffers seguros. A checagem de tamanho inicial impede que o método timingSafeEqual quebre o servidor caso os tamanhos sejam diferentes.
    const v1Buffer = Buffer.from(v1 || "");
    const checkV1Buffer = Buffer.from(checkV1);

    if (v1Buffer.length !== checkV1Buffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(v1Buffer, checkV1Buffer);
  } catch (e) {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    // 🛡️ MÁGICA 2: Leitura segura contra Ping do MP e payloads vazios
    const rawText = await request.text();
    const body = rawText ? (JSON.parse(rawText) as MPWebhookBody) : {};
    const url = new URL(request.url);

    // 1. [SEGURANÇA PRIMÁRIA] Bloqueia acessos falsos ou hackers ANTES de tocar no banco!
    if (!validateSignature(request, body, url)) {
      console.warn(
        "🚨 [Webhook MP] Tentativa inválida de acesso bloqueada ou Ping de Configuração.",
      );
      return new NextResponse("Assinatura Inválida ou Ping", { status: 401 });
    }

    // 2. [LEITURA DE IDEMPOTÊNCIA] Apenas verifica se já processamos (sem queimar o evento)
    const eventId = body?.id?.toString();
    if (eventId) {
      const alreadyProcessed = await db.processedWebhook.findUnique({
        where: { id: eventId },
      });
      if (alreadyProcessed) {
        console.log(
          `[Webhook MP] Evento ${eventId} já foi processado. Ignorando duplicata.`,
        );
        return new NextResponse("OK", { status: 200 });
      }
    }

    console.log(
      `[Webhook MP] Evento recebido: ${body.type || body.entity || body.action}`,
    );

    if (
      body.type === "subscription_preapproval" ||
      body.entity === "preapproval"
    ) {
      const resourceId =
        url.searchParams.get("data.id") || body.data?.id || body.id;

      if (!resourceId) {
        return new NextResponse("Resource ID ausente", { status: 400 });
      }

      // 2. [BUSCA REAL NA API] Impede spoofing de payload
      const preApproval = new PreApproval(client);
      const subscription = await preApproval.get({ id: String(resourceId) });

      if (!subscription) {
        return new NextResponse("Assinatura não encontrada", { status: 404 });
      }

      const externalReference = subscription.external_reference;
      const status = subscription.status;

      if (!externalReference) {
        return new NextResponse("External Reference ausente", { status: 400 });
      }

      // Separa o userId e o businessId
      const [userId, businessId] = externalReference.split("___");

      console.log(
        `📡 [Webhook MP] status=${status} user=${userId} business=${businessId} sub=${subscription.id}`,
      );

      if (!userId || !businessId) {
        return new NextResponse("Referência malformada", { status: 400 });
      }

      const business = await db.business.findUnique({
        where: { id: businessId },
        select: {
          id: true,
          mpSubscriptionId: true,
          expiresAt: true,
          userId: true,
        },
      });

      if (!business) {
        return new NextResponse("Negócio não existe no banco", { status: 404 });
      }

      if (business.userId !== userId) {
        console.error(
          `[Webhook MP] Fraude detectada: Negócio ${businessId} não pertence ao usuário ${userId}`,
        );
        return new NextResponse("Incompatibilidade de propriedade", {
          status: 400,
        });
      }

      if (!business.mpSubscriptionId && status !== "authorized") {
        return new NextResponse("Já processado ou cancelado manualmente", {
          status: 200,
        });
      }

      // 🔴 IDEMPOTÊNCIA (Protege contra webhooks duplicados)
      if (
        business.mpSubscriptionId === subscription.id &&
        business.expiresAt &&
        subscription.next_payment_date &&
        new Date(business.expiresAt) >= new Date(subscription.next_payment_date)
      ) {
        return new NextResponse("Já processado", { status: 200 });
      }

      // --- CENÁRIO A: PAGAMENTO APROVADO ---
      if (status === "authorized") {
        let expiresAt = new Date();
        if (subscription.next_payment_date) {
          expiresAt = new Date(subscription.next_payment_date);
        } else {
          // 🚀 HACKER FIX: Adiciona 1 mês civil exato, respeitando anos bissextos e meses curtos
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        }

        let planType: PlanType = "monthly";
        const frequency = subscription.auto_recurring?.frequency;

        if (frequency === 3) planType = "quarterly";
        else if (frequency === 12) planType = "yearly";
        const transactionAmount =
          subscription.auto_recurring?.transaction_amount ?? 0;

        await db.$transaction([
          db.business.update({
            where: { id: businessId },
            data: {
              isActive: true,
              expiresAt: expiresAt,
              mpSubscriptionId: subscription.id,
              planType: planType,
              subscriptionStatus: "active",
            },
          }),
          db.user.update({
            where: { id: userId },
            data: {
              role: "ASSINANTE" as Role,
              lastPrice: transactionAmount,
            },
          }),
        ]);

        // 🚀 CFO FIX: revalidatePath removido! O Webhook roda nos bastidores.
        // Limpar o cache global do site a cada PIX pago causaria um pico monstruoso de CPU na Vercel.
        console.log(
          `✅ Sucesso: Negócio ${businessId} PRO (${planType}) até ${expiresAt.toLocaleDateString()}`,
        );
      }
      // --- CENÁRIO B: CANCELADO OU PAUSADO ---
      else if (
        status === "cancelled" ||
        status === "paused" ||
        status === "rejected"
      ) {
        await db.business.update({
          where: { id: businessId },
          data: {
            subscriptionStatus: status,
          },
        });

        // 🛡️ MÁGICA 3: Usando o businessId exato e lidando com a tipagem String?
        await db.commission.updateMany({
          where: {
            userId: userId,
            businessId: { equals: businessId }, // 🚀 HACKER FIX: Garante que o Prisma não surte com nulls no banco
            status: CommissionStatus.PENDING,
          },
          data: { status: CommissionStatus.CANCELLED },
        });
      }
    }
    // ==============================================================================
    // 🚀 O RECIBO OFICIAL E GERAÇÃO DE COMISSÃO
    // ==============================================================================
    if (
      body.type === "payment" ||
      body.action === "payment.updated" ||
      body.action === "payment.created"
    ) {
      const paymentId =
        url.searchParams.get("data.id") || body.data?.id || body.id;

      if (!paymentId) {
        return new NextResponse("Payment ID ausente", { status: 400 });
      }

      const paymentClient = new Payment(client);
      const payment = await paymentClient.get({ id: String(paymentId) });

      if (payment.status === "approved" && payment.external_reference) {
        const [userId, businessId] = payment.external_reference.split("___");

        if (userId && businessId) {
          const comissaoJaExiste = await db.commission.findUnique({
            where: {
              mpPaymentId: String(paymentId),
            },
          });

          if (comissaoJaExiste) {
            return new NextResponse("Pagamento já gerou comissão", {
              status: 200,
            });
          }

          const business = await db.business.findUnique({
            where: { id: businessId },
            select: { planType: true },
          });

          if (business && business.planType) {
            const transactionAmount = payment.transaction_amount ?? 0;
            const dataAtual = new Date();
            const mesAno = `${dataAtual.getMonth() + 1}/${dataAtual.getFullYear()}`;

            const planType = business.planType;
            const descricaoPlano =
              planType === "monthly"
                ? "Mensal"
                : planType === "quarterly"
                  ? "Trimestral"
                  : "Anual";

            // Gera comissão para o afiliado garantindo 0 falhas
            const commissionResult = await generateCommission(
              userId, // ID de quem comprou (o sistema rastreia o parceiro por ele)
              transactionAmount,
              `Assinatura ${descricaoPlano} (${mesAno}) - Loja: ${businessId} - Recibo MP: ${paymentId}`,
              planType,
              String(paymentId),
              businessId,
            );

            if (commissionResult.error) {
              console.log(
                `⚠️ [Webhook MP] Aviso na comissão: ${commissionResult.error}`,
              );
              return new NextResponse("Processado com aviso", { status: 200 });
            }

            console.log(
              `💰 [Webhook MP] Pagamento aprovado e comissão gerada: Loja ${businessId}`,
            );
          }
        }
      }
    }
    // 🚀 HACKER & CFO FIX: O carimbo só é gravado AGORA, após o pagamento/assinatura dar 100% certo!
    if (eventId) {
      await db.processedWebhook
        .create({ data: { id: eventId } })
        .catch(() => {});
    }
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[Webhook MP] Erro Crítico:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
