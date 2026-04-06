import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/admin");
  }

  const emailSessao = session.user.email.toLowerCase();
  const isEmailAutorizado =
    emailSessao === process.env.ADMIN_EMAIL?.toLowerCase();
  const isAdminNoBanco = session.user.role === "ADMIN";

  if (!isEmailAutorizado && !isAdminNoBanco) {
    redirect("/");
  }

  const agora = new Date();
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase() || "";

  const [usersData, reports, flaggedComments, allCommissions] =
    await Promise.all([
      db.user.findMany({
        include: {
          businesses: true,
          referrals: { select: { id: true } },
          affiliate: { select: { name: true, referralCode: true } },
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
          status: { in: ["AVAILABLE", "PAID"] },
          amount: { gt: 0 },
        },
      }),
    ]);

  // ✅ Mapeia usuários com metadados
  const users = usersData.map((u) => ({
    ...u,
    referredBy: u.affiliate
      ? `${u.affiliate.name} (${u.affiliate.referralCode})`
      : null,
    referralCount: u.referrals.length,
  }));

  // ✅ Corrige O(n²): monta Map de businessId → dono
  const businessOwnerMap = new Map<string, string>();
  users.forEach((u) => {
    u.businesses.forEach((b) => {
      businessOwnerMap.set(b.id, u.id);
    });
  });

  // 🚀 ATUALIZAÇÃO: Cálculo de Faturamento e Pagantes baseado na NOVA estrutura
  let faturamentoBruto = 0;

  const pagantes = users.filter((u) => {
    // Ignora banidos ou o próprio admin
    if (u.isBanned || u.email?.toLowerCase() === adminEmail) return false;

    // Filtra apenas os negócios que estão ativos e no prazo
    const negociosAtivos = u.businesses.filter(
      (b) => b.isActive && b.expiresAt && new Date(b.expiresAt) > agora,
    );

    // Se o usuário tem negócios ativos, ele é um pagante
    if (negociosAtivos.length > 0) {
      // Soma o valor de cada negócio ativo baseado no planType
      negociosAtivos.forEach((negocio) => {
        if (negocio.planType === "yearly") faturamentoBruto += 238.8;
        else if (negocio.planType === "quarterly") faturamentoBruto += 74.7;
        else faturamentoBruto += 29.9; // Mensal é o padrão
      });
      return true; // Mantém o usuário na lista de pagantes
    }

    return false;
  });

  // ✅ Comissões devidas — fonte confiável (só afiliados)
  const totalComissoesDevidas = allCommissions
    .filter((c) => c.status === "AVAILABLE")
    .reduce((acc, c) => acc + c.amount, 0);

  const totalComissoesPagas = allCommissions
    .filter((c) => c.status === "PAID")
    .reduce((acc, c) => acc + c.amount, 0);

  // ✅ Lucro líquido = bruto − comissões devidas − comissões já pagas
  const faturamentoLiquido =
    faturamentoBruto - totalComissoesDevidas - totalComissoesPagas;

  const totalPagantes = pagantes.length;

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
