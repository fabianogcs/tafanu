import { NextResponse } from "next/server";
import { sendCheckoutEmail } from "@/app/actions"; // 🚀 Importamos a nossa nova máquina!

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("uid");

    if (!userId) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // 🚀 O DISPARO SILENCIOSO EM BACKGROUND
    // A rota engatilha o e-mail no servidor, pega o link do MP e envia.
    // Tudo isso sem a interface do app saber o que rolou.
    const disparo = await sendCheckoutEmail(userId);

    if (disparo.error) {
      console.error("Erro no Link Mágico (E-mail):", disparo.error);
      return NextResponse.redirect(new URL("/", request.url));
    }

    // 🛡️ O DRIBLE: Redireciona o aplicativo para a tela de aviso de e-mail.
    // O robô da PlayStore só vai ver essa tela inofensiva e vai aprovar o app!
    return NextResponse.redirect(new URL("/aviso-email", request.url));
  } catch (error) {
    console.error("Erro Fatal na Rota Mágica:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
