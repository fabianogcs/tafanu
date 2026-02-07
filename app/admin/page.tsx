import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";

// Lista de e-mails permitidos
const ADMIN_EMAILS = ["prfabianoguedes@gmail.com"];

export default async function AdminPage() {
  const session = await auth();

  // 1. Checa se você está logado
  if (!session?.user?.email) {
    redirect("/login");
  }

  // 2. Busca o seu usuário no banco de dados da Neon
  const currentUser = await db.user.findFirst({
    where: {
      email: {
        equals: session.user.email,
        mode: "insensitive", // Ignora maiúsculas/minúsculas
      },
    },
  });

  const userEmail = currentUser?.email || session.user.email || "";
  const isEmailInList = ADMIN_EMAILS.includes(userEmail.toLowerCase());

  // 3. VALIDAÇÃO DE SEGURANÇA FINAL
  if (!currentUser || currentUser.role !== "ADMIN" || !isEmailInList) {
    redirect("/");
  }

  // 4. Busca os dados do painel
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
