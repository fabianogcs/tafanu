import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("uid");

    if (!userId) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Gera um token aleatório e criptograficamente seguro por software (UUID)
    const tokenAleatorio = crypto.randomUUID();
    const quinzeMinutosNoFuturo = new Date(Date.now() + 15 * 60 * 1000);

    // Registra ou atualiza o passe livre do usuário no banco
    await db.checkoutToken.upsert({
      where: { userId },
      update: {
        id: tokenAleatorio,
        createdAt: new Date(),
        expiresAt: quinzeMinutosNoFuturo,
      },
      create: {
        id: tokenAleatorio,
        userId,
        expiresAt: quinzeMinutosNoFuturo,
      },
    });

    const domain =
      process.env.NODE_ENV === "production"
        ? "https://tafanu.com.br"
        : "http://localhost:3000";

    // Envia o navegador nativo do celular para a rota de auto-login
    return NextResponse.redirect(
      new URL(
        `${domain}/api/auth/callback/magic-login?token=${tokenAleatorio}`,
        request.url,
      ),
    );
  } catch (error) {
    console.error("Erro no Link Mágico:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
