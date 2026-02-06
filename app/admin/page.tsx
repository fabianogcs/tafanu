import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";

const ADMIN_EMAILS = ["prfabianoguedes@gmail.com"];

export default async function AdminPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) redirect("/login");

  // 1. BUSCAMOS O USUÁRIO (Essa linha é essencial!)
  const currentUser = await db.user.findUnique({ where: { id: userId } });

  // 2. EXTRAÍMOS O EMAIL PARA UMA CONSTANTE
  const userEmail = currentUser?.email;

  // 3. FAZEMOS A VALIDAÇÃO DE SEGURANÇA
  if (
    !currentUser ||
    currentUser.role !== "ADMIN" ||
    !userEmail ||
    !ADMIN_EMAILS.includes(userEmail)
  ) {
    redirect("/");
  }

  // Busca usuários incluindo a data de validade
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
// force deploy
