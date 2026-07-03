import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CommissionStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // 🛡️ A PORTA DE AÇO DUPLA (Blindada)
  const authHeader = request.headers.get("authorization");
  const envSecret = process.env.CRON_SECRET;

  if (!envSecret || authHeader !== `Bearer ${envSecret}`) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  try {
    const hoje = new Date();
    let totalLiberadas = 0;
    let loteDeAtualizacao = 0;

    // 🚀 CTO FIX: Loop atômico em lotes direto no motor SQL do PostgreSQL.
    // Não gasta memória da Vercel e garante que 100% das comissões do dia sejam liberadas,
    // seja em escala de 100 ou 100.000 afiliados, sem travar a tabela (SKIP LOCKED)!
    do {
      const result = await db.$executeRaw`
        UPDATE "Commission"
        SET status = 'AVAILABLE'::"CommissionStatus"
        WHERE id IN (
          SELECT id FROM "Commission"
          WHERE status = 'PENDING'::"CommissionStatus"
          AND "releaseDate" <= ${hoje}
          LIMIT 1000
          FOR UPDATE SKIP LOCKED
        )
      `;

      loteDeAtualizacao = Number(result);
      totalLiberadas += loteDeAtualizacao;
    } while (loteDeAtualizacao === 1000);

    console.log(
      `✅ [Cron Comissões] Fila do dia zerada: ${totalLiberadas} comissões liberadas.`,
    );
    return NextResponse.json({ success: true, liberadas: totalLiberadas });
  } catch (error) {
    console.error("[Cron Comissões] Erro crítico na virada de saldo:", error);
    return new NextResponse("Erro interno no cron de comissões", {
      status: 500,
    });
  }
}
