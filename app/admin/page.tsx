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

  const currentUser = await db.user.findFirst({
    where: {
      email: { equals: emailSessao, mode: "insensitive" },
    },
  });

  const isEmailAutorizado =
    emailSessao === process.env.ADMIN_EMAIL?.toLowerCase();
  const isAdminNoBanco = currentUser?.role === "ADMIN";

  if (!isEmailAutorizado && !isAdminNoBanco) {
    redirect("/");
  }

  // --- BUSCA GERAL DE DADOS ---
  const [usersData, reports, flaggedComments] = await Promise.all([
    // 1. Todos os Usuários + Negócios + Contagem de Indicações
    db.user.findMany({
      include: {
        businesses: true,
        referrals: { select: { id: true } }, // Quantas pessoas ele indicou
        affiliate: { select: { name: true, referralCode: true } }, // Quem indicou ele
      },
      orderBy: { createdAt: "desc" },
    }),
    // 2. Denúncias de Negócios (Abuso, Plágio, etc)
    db.report.findMany({
      orderBy: { createdAt: "desc" },
      include: { business: { select: { name: true, slug: true } } },
    }),
    // 3. NOVO: Comentários Denunciados (Moderação)
    db.comment.findMany({
      where: { isFlagged: true },
      include: {
        user: { select: { name: true, image: true } },
        business: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // --- ORGANIZAÇÃO DOS DADOS ---
  const agora = new Date();

  const users = usersData.map((u: any) => ({
    ...u,
    referredBy: u.affiliate
      ? `${u.affiliate.name} (${u.affiliate.referralCode})`
      : null,
    referralCount: u.referrals.length,
  }));

  // Filtramos os Afiliados (quem tem código de afiliado ou indicações)
  const affiliates = users.filter((u) => u.referralCode || u.referralCount > 0);

  // Filtramos os Assinantes (quem tem negócios cadastrados)
  const subscribers = users.filter(
    (u) => u.businesses.length > 0 || u.role === "ASSINANTE",
  );

  // Cálculo de Receita (apenas assinantes ativos)
  const receitaTotal = users.reduce((acc, user) => {
    if (
      user.role === "ASSINANTE" &&
      user.expiresAt &&
      user.expiresAt > agora &&
      !user.isBanned
    ) {
      return acc + (Number(user.lastPrice) || 0);
    }
    return acc;
  }, 0);

  const adminData = {
    users: users,
    subscribers: subscribers,
    affiliates: affiliates,
    reports: reports,
    flaggedComments: flaggedComments, // Dados para a nova aba de moderação
    receita: receitaTotal,
  };

  return (
    <AdminDashboard data={adminData} adminEmail={process.env.ADMIN_EMAIL} />
  );
}
