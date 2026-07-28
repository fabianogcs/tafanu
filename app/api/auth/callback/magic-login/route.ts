import { signIn } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const callbackUrl = searchParams.get("callbackUrl") || "/checkout";

  const domain =
    process.env.NODE_ENV === "production"
      ? "https://tafanu.com.br"
      : "http://localhost:3000";

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const result = await signIn("magic-login", {
      token,
      redirect: false,
    });

    if (result?.error) {
      console.warn("🚨 [Magic Login] Falha ao validar token:", result.error);
      return NextResponse.redirect(
        new URL("/login?error=TokenInvalido", request.url),
      );
    }

    // 🚀 TELETRANSPORTE CONCLUÍDO: Manda logado para a URL de destino!
    return NextResponse.redirect(
      new URL(`${domain}${callbackUrl}`, request.url),
    );
  } catch (error) {
    // 🛡️ CORREÇÃO WHITE HAT: Se o token venceu ou falhou, avisa no login!
    console.error("❌ Erro Fatal no Magic Login:", error);
    return NextResponse.redirect(
      new URL(`${domain}/login?error=TokenExpirado`, request.url),
    );
  }
}
