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

  const adminEmailEnv =
    process.env.ADMIN_EMAIL?.toLowerCase() || "prfabianoguedes@gmail.com";
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
          businesses: true,
          referrals: { select: { id: true } },
          // 🚀 AJUSTE: 'id' incluído para o front-end gerenciar a troca de parceiro
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

  const users = usersData.map((u) => ({
    ...u,
    referredBy: u.affiliate
      ? `${u.affiliate.name} (${u.affiliate.referralCode})`
      : null,
    referralCount: u.referrals.length,
  }));

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

  // 2. Cálculo de Faturamento Bruto (Soma todas as lojas ativas de todos os usuários)
  const faturamentoBruto = users.reduce((total, u) => {
    if (u.isBanned || u.email?.toLowerCase() === adminEmail) return total;

    const valorDoUsuario = u.businesses
      .filter((b) => b.isActive && b.expiresAt && new Date(b.expiresAt) > agora)
      .reduce((subtotal, biz) => {
        if (biz.planType === "yearly") return subtotal + 358.8;
        if (biz.planType === "quarterly") return subtotal + 104.7;
        return subtotal + 39.9; // Mensal
      }, 0);

    return total + valorDoUsuario;
  }, 0);

  // 3. Soma de comissões usando tipagem do Prisma
  const totalComissoesDevidas = allCommissions
    .filter((c) => c.status === CommissionStatus.AVAILABLE)
    .reduce((acc, c) => acc + c.amount, 0);

  const totalComissoesPagas = allCommissions
    .filter((c) => c.status === CommissionStatus.PAID)
    .reduce((acc, c) => acc + c.amount, 0);

  // 4. Consolidação das métricas
  const faturamentoLiquido =
    faturamentoBruto - totalComissoesDevidas - totalComissoesPagas;
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
