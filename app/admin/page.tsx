import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";
import { CommissionStatus } from "@prisma/client";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/admin");
  }

  const emailSessao = session.user.email.toLowerCase();

  // 🚀 BUSCA A VERDADE ABSOLUTA DIRETO NO BANCO
  const usuarioNoBanco = await db.user.findUnique({
    where: { email: emailSessao },
    select: { role: true },
  });

  const adminEmailEnv = process.env.ADMIN_EMAIL?.toLowerCase() || "";
  const isEmailAutorizado = emailSessao === adminEmailEnv;
  const isAdminNoBanco = usuarioNoBanco?.role === "ADMIN";

  if (!isEmailAutorizado && !isAdminNoBanco) {
    redirect("/");
  }

  const agora = new Date();
  const adminEmail = adminEmailEnv;

  const [usersData, reports, flaggedComments, allCommissions] =
    await Promise.all([
      db.user.findMany({
        include: {
          businesses: {
            include: {
              _count: { select: { favorites: true } },
            },
          },
          referrals: { select: { id: true } },
          affiliate: { select: { id: true, name: true, referralCode: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.report.findMany({
        orderBy: { createdAt: "desc" },
        include: { business: { select: { name: true, slug: true } } },
      }),
      db.comment.findMany({
        where: { isFlagged: true },
        include: {
          user: { select: { name: true, image: true } },
          business: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.commission.findMany({
        where: {
          status: { in: [CommissionStatus.AVAILABLE, CommissionStatus.PAID] },
          amount: { gt: 0 },
        },
      }),
    ]);

  // 🛡️ CIRURGIA DE SEGURANÇA E PERFORMANCE: Prepara os dados para a Tabela
  const users = usersData.map((u) => {
    const { password, ...userWithoutPassword } = u;

    // 🚀 Soma o desempenho total de todas as lojas deste assinante
    let totalViews = 0;
    let totalLeads = 0;
    let totalFavs = 0;

    u.businesses?.forEach((b: any) => {
      totalViews += b.views || 0;
      totalLeads += (b.whatsapp_clicks || 0) + (b.phone_clicks || 0);
      totalFavs += b._count?.favorites || 0;
    });

    return {
      ...userWithoutPassword,
      referredBy: u.affiliate
        ? `${u.affiliate.name} (${u.affiliate.referralCode})`
        : null,
      referralCount: u.referrals?.length || 0,
      totalViews,
      totalLeads,
      totalFavs,
    };
  });

  const businessOwnerMap = new Map<string, string>();
  users.forEach((u) => {
    u.businesses.forEach((b) => {
      businessOwnerMap.set(b.id, u.id);
    });
  });

  // 🚀 NOVA LÓGICA DE MÉTRICAS (ROBUSTA)

  // 1. Lista de usuários pagantes (que têm ao menos 1 negócio ativo)
  const pagantesList = users.filter((u) => {
    if (u.isBanned || u.email?.toLowerCase() === adminEmail) return false;
    return u.businesses.some(
      (b) => b.isActive && b.expiresAt && new Date(b.expiresAt) > agora,
    );
  });

  // 🎯 2. Cálculo de Faturamento (Bruto e Líquido Real)
  let faturamentoBruto = 0;
  let faturamentoLiquido = 0;

  users.forEach((u) => {
    if (u.isBanned || u.email?.toLowerCase() === adminEmail) return;

    const temAfiliado = !!(u.affiliateId || u.affiliate);

    u.businesses.forEach((biz) => {
      // Analisa apenas lojas ativas
      if (biz.isActive && biz.expiresAt && new Date(biz.expiresAt) > agora) {
        let valorPlano = 39.9;
        let comissaoPlano = 10.0;

        if (biz.planType === "yearly") {
          valorPlano = 358.8;
          comissaoPlano = 120.0;
        } else if (biz.planType === "quarterly") {
          valorPlano = 104.7;
          comissaoPlano = 30.0;
        }

        faturamentoBruto += valorPlano;

        // 🛡️ CIRURGIA AQUI: Subtrai o valor EXATO da comissão combinada
        if (temAfiliado) {
          faturamentoLiquido += valorPlano - comissaoPlano;
        } else {
          faturamentoLiquido += valorPlano;
        }
      }
    });
  });

  // 3. Mantemos o cálculo apenas para exibir no Card de "Comissões a Pagar" no Dashboard
  const totalComissoesDevidas = allCommissions
    .filter((c) => c.status === CommissionStatus.AVAILABLE)
    .reduce((acc, c) => acc + c.amount, 0);

  const totalPagantes = pagantesList.length;

  const adminData = {
    users,
    reports,
    flaggedComments,
    businessOwnerMap: Object.fromEntries(businessOwnerMap),
    metricas: {
      faturamentoBruto,
      faturamentoLiquido,
      totalComissoesDevidas,
      totalPagantes,
    },
  };

  return (
    <AdminDashboard data={adminData} adminEmail={process.env.ADMIN_EMAIL} />
  );
}
