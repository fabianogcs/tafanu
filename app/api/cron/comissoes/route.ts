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

    const atualizacao = await db.commission.updateMany({
      where: {
        status: CommissionStatus.PENDING,
        releaseDate: { lte: hoje },
      },
      data: {
        status: CommissionStatus.AVAILABLE,
      },
    });

    // 🛡️ CORREÇÃO 2: Log do resultado
    console.log(`[Cron Comissões] ${atualizacao.count} comissões liberadas.`);
    return NextResponse.json({ success: true, liberadas: atualizacao.count });
  } catch (error) {
    // 🛡️ CORREÇÃO 2: Log do erro real
    console.error("[Cron Comissões] Erro:", error);
    return new NextResponse("Erro", { status: 500 });
  }
}
