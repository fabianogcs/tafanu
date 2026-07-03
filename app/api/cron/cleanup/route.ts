import { NextResponse } from "next/server";
import { runSystemGhostCleanup } from "@/app/actions";

// 🚀 PROTEÇÃO ANTI-TIMEOUT: Garante que a Vercel dê tempo suficiente (60s) para a faxina rodar
export const maxDuration = 60;

export async function GET(request: Request) {
  // 🛡️ A PORTA DE AÇO DUPLA: Verifica se a chave existe no servidor E se a senha confere
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json(
      { error: "Acesso Não Autorizado" },
      { status: 401 },
    );
  }

  // Se tem a chave, roda a faxina!
  const result = await runSystemGhostCleanup();

  // 🛡️ CTO FIX: Desestruturação explícita (Type Casting).
  // Isso silencia o compilador da Vercel e evita o "Type error: Property 'message' does not exist".
  const { error, message } = result as { error?: string; message?: string };

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: message });
}
