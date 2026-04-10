import { NextResponse } from "next/server";
import { runSystemGhostCleanup } from "@/app/actions";

export async function GET(request: Request) {
  // 🛡️ A PORTA DE AÇO: Verifica se quem está batendo tem a chave secreta da Vercel
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: "Acesso Não Autorizado" },
      { status: 401 },
    );
  }

  // Se tem a chave, roda a faxina!
  const result = await runSystemGhostCleanup();

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: result.message });
}
