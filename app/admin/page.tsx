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
    redirect("/login?callbackUrl=/admin"); // Se não tá logado, manda pro login e pede pra voltar pra cá
  }

  const emailSessao = session.user.email.toLowerCase();

  // 3. BUSCA NO BANCO
  const currentUser = await db.user.findFirst({
    where: {
      email: {
        equals: emailSessao,
        mode: "insensitive",
      },
    },
  });

  // 4. VALIDAÇÃO DUPLA (Lista de E-mails OU Role no Banco)
  const isEmailAutorizado = ADMIN_EMAILS.includes(emailSessao);
  const isAdminNoBanco = currentUser?.role === "ADMIN";

  // Se o e-mail está na lista, mas no banco não está como ADMIN,
  // vamos forçar a entrada (e você pode corrigir o role lá dentro do painel)
  if (!isEmailAutorizado && !isAdminNoBanco) {
    console.log(`Acesso negado para: ${emailSessao}`);
    redirect("/");
  }

  // 5. BUSCA OS DADOS (Mesma lógica anterior)
  const users = await db.user.findMany({
    include: { businesses: true },
    orderBy: { createdAt: "desc" },
  });

  const reports = await db.report.findMany({
    orderBy: { createdAt: "desc" },
    include: { business: { select: { name: true, slug: true } } },
  });

  const assinantesReais = users.filter((u) => u.role === "ASSINANTE");

  const adminData = {
    users,
    reports,
    receita: assinantesReais.length * 29.9,
  };

  return <AdminDashboard data={adminData} />;
}
