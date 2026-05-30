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

  // Prepara os dados para a Tabela
  const users = usersData.map((u) => {
    const { password, ...userWithoutPassword } = u;

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

  const pagantesList = users.filter((u) => {
    if (u.isBanned || u.email?.toLowerCase() === adminEmail) return false;
    return u.businesses.some(
      (b) => b.isActive && b.expiresAt && new Date(b.expiresAt) > agora,
    );
  });

  // 🎯 A MATEMÁTICA DE CEO: Cálculo do MRR (Receita Recorrente Mensal)
  let mrrBruto = 0;
  let mrrLiquido = 0;

  users.forEach((u) => {
    if (u.isBanned || u.email?.toLowerCase() === adminEmail) return;

    const temAfiliado = !!(u.affiliateId || u.affiliate);

    u.businesses.forEach((biz) => {
      if (biz.isActive && biz.expiresAt && new Date(biz.expiresAt) > agora) {
        let valorMrr = 39.9;
        let comissaoMrr = 10.0;

        // Dilui os planos maiores para achar a métrica mensal real
        if (biz.planType === "yearly") {
          valorMrr = 358.8 / 12; // R$ 29,90/mês
          comissaoMrr = 120.0 / 12; // R$ 10,00/mês
        } else if (biz.planType === "quarterly") {
          valorMrr = 104.7 / 3; // R$ 34,90/mês
          comissaoMrr = 30.0 / 3; // R$ 10,00/mês
        }

        mrrBruto += valorMrr;

        if (temAfiliado) {
          mrrLiquido += valorMrr - comissaoMrr;
        } else {
          mrrLiquido += valorMrr;
        }
      }
    });
  });

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
      mrrBruto,
      mrrLiquido,
      totalComissoesDevidas,
      totalPagantes,
    },
  };

  return (
    <AdminDashboard data={adminData} adminEmail={process.env.ADMIN_EMAIL} />
  );
}
