import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";

// 1. LISTA DE OURO (E-mails que mandam em tudo)
const ADMIN_EMAILS = ["prfabianoguedes@gmail.com"];

export default async function AdminPage() {
  const session = await auth();

  // 2. CHECA SE ESTÁ LOGADO
  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/admin");
  }

  const emailSessao = session.user.email.toLowerCase();

  // 3. BUSCA O USUÁRIO ATUAL NO BANCO
  const currentUser = await db.user.findFirst({
    where: {
      email: {
        equals: emailSessao,
        mode: "insensitive",
      },
    },
  });

  // 4. VALIDAÇÃO DE ADMIN (E-mail ou Role)
  const isEmailAutorizado = ADMIN_EMAILS.includes(emailSessao);
  const isAdminNoBanco = currentUser?.role === "ADMIN";

  if (!isEmailAutorizado && !isAdminNoBanco) {
    console.log(`Acesso negado para: ${emailSessao}`);
    redirect("/");
  }

  // 5. BUSCA OS DADOS (Usuários e Denúncias)
  // ⬅️ MUDANÇA AQUI: Pedimos pro banco trazer os dados do afiliado (O "Pai" da conta)
  const usersData = await db.user.findMany({
    include: {
      businesses: true,
      affiliate: {
        select: { name: true, referralCode: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // ⬅️ MUDANÇA AQUI: Formatamos a etiqueta bonitinha "Nome (CÓDIGO)" pro seu painel
  const users = usersData.map((u: any) => ({
    ...u,
    referredBy: u.affiliate
      ? `${u.affiliate.name} (${u.affiliate.referralCode})`
      : null,
  }));

  const reports = await db.report.findMany({
    orderBy: { createdAt: "desc" },
    include: { business: { select: { name: true, slug: true } } },
  });

  // 6. CÁLCULO DE RECEITA DINÂMICA (Soma real de lastPrice)
  const agora = new Date();
  const receitaTotal = users.reduce((acc, user) => {
    // Só conta na receita se: for assinante, não estiver vencido e NÃO estiver banido
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

  // 7. PREPARA OS DADOS PARA O COMPONENTE VISUAL
  const adminData = {
    users: users,
    reports: reports as any[],
    receita: receitaTotal,
  };

  return <AdminDashboard data={adminData} />;
}
