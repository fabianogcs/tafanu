import { signIn } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  const domain =
    process.env.NODE_ENV === "production"
      ? "https://tafanu.com.br"
      : "http://localhost:3000";

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Ordena o NextAuth a autenticar o cliente via Borda
    await signIn("magic-login", {
      token,
      redirect: false,
    });

    // 🚀 TELETRANSPORTE CONCLUÍDO: Manda logado direto pro seu checkout!
    return NextResponse.redirect(new URL(`${domain}/checkout`, request.url));
  } catch (error) {
    // Fallback de segurança: se falhar, manda pro checkout onde o fluxo padrão assume
    return NextResponse.redirect(new URL(`${domain}/checkout`, request.url));
  }
}
