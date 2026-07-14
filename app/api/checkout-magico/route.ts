import { NextResponse } from "next/server";
import { sendCheckoutEmail } from "@/app/actions";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// 🛡️ O ESCUDO ANTI-BOTS (Proteção do seu bolso no Resend)
const actionRedis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Permite no máximo 2 tentativas de envio de e-mail por IP a cada 1 hora.
const checkoutRatelimit = actionRedis
  ? new Ratelimit({
      redis: actionRedis,
      limiter: Ratelimit.slidingWindow(2, "1 h"),
      prefix: "rl_checkout_magic",
    })
  : null;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("uid");

    if (!userId) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // 🚀 BLINDAGEM 1: Extrair o IP do usuário para bloquear abusos
    const ip =
      request.headers.get("x-vercel-forwarded-for") ??
      request.headers.get("x-forwarded-for") ??
      "127.0.0.1";

    if (checkoutRatelimit) {
      const { success } = await checkoutRatelimit.limit(`checkout:${ip}`);
      if (!success) {
        console.warn(
          `🚨 [Ataque Bloqueado] Múltiplas requisições de e-mail do IP: ${ip}`,
        );
        // Se for um ataque de flood, manda o hacker pacificamente pra Home sem gastar e-mail.
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // 🚀 O DISPARO SILENCIOSO EM BACKGROUND
    const disparo = await sendCheckoutEmail(userId);

    if (disparo.error) {
      console.error("Erro no Link Mágico (E-mail):", disparo.error);
      return NextResponse.redirect(new URL("/", request.url));
    }

    // 🛡️ O DRIBLE: Redireciona o aplicativo para a tela de aviso de e-mail.
    return NextResponse.redirect(new URL("/aviso-email", request.url));
  } catch (error) {
    console.error("Erro Fatal na Rota Mágica:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
