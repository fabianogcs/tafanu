import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import FunilBoard from "@/components/FunilBoard"; // Importamos seu componente
import CriarLeadForm from "@/components/CriarLeadForm";

export default async function FunilPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (currentUser?.role !== "ADMIN" && currentUser?.role !== "AFILIADO") {
    redirect("/dashboard");
  }

  const isAdmin = currentUser.role === "ADMIN";

  const leads = await db.business.findMany({
    where: {
      user: {
        email: { endsWith: "@tafanu.com.br" },
        ...(isAdmin ? { affiliateId: null } : { affiliateId: session.user.id }),
      },
    },
    include: {
      user: {
        select: { name: true, phone: true, email: true },
      },
    },
    orderBy: {
      expiresAt: "asc",
    },
  });

  return (
    <div className="p-6 md:p-8 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-black text-[#0F172A] mb-1 uppercase">
        Funil de Vendas
      </h1>
      <p className="text-sm font-semibold text-gray-400 mb-8">
        Painel de acompanhamento e prospecção de parceiros.
      </p>
      {/* ⬅️ 2. SÓ MOSTRA O FORMULÁRIO SE FOR ADMIN */}
      {isAdmin && <CriarLeadForm />}
      {/* 🚀 O COMPONENTE MÁGICO ENTRA AQUI */}
      <FunilBoard leads={leads} />
    </div>
  );
}
