import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";

const ADMIN_EMAILS = ["prfabianoguedes@gmail.com"];

export default async function AdminPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) redirect("/login");

  const currentUser = await db.user.findUnique({ where: { id: userId } });

  if (
    !currentUser ||
    currentUser.role !== "ADMIN" ||
    !ADMIN_EMAILS.includes(currentUser.email)
  ) {
    redirect("/");
  }

  // Busca usuários incluindo a data de validade (expiresAt)
  const users = await db.user.findMany({
    include: { businesses: true },
    orderBy: { createdAt: "desc" },
  });

  const reports = await db.report.findMany({
    orderBy: { createdAt: "desc" },
    include: { business: { select: { name: true, slug: true } } },
  });

  // Cálculos Rápidos para o servidor
  const assinantesReais = users.filter((u) => u.role === "ASSINANTE");

  const adminData = {
    users,
    reports,
    // Cálculo de MRR (Receita Mensal Recorrente Estimada)
    receita: assinantesReais.length * 29.9,
  };

  return <AdminDashboard data={adminData} />;
}
