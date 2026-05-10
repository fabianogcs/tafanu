import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import FunilBoard from "@/components/FunilBoard";
import CriarLeadForm from "@/components/CriarLeadForm";

export default async function FunilPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  // 1. TELA DE DIAGNÓSTICO: Se o cargo estiver errado, ele avisa na tela em vez de chutar!
  if (currentUser?.role !== "ADMIN" && currentUser?.role !== "AFILIADO") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center border-2 border-rose-100">
          <h1 className="text-xl font-black text-rose-600 mb-2 uppercase">
            Acesso Negado
          </h1>
          <p className="text-gray-500 font-bold">
            O sistema acha que você é:{" "}
            <span className="text-slate-900">
              {currentUser?.role || "Desconhecido"}
            </span>
          </p>
          <p className="text-xs text-gray-400 mt-4">
            Apenas Administradores ou Afiliados podem ver esta página.
          </p>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser.role === "ADMIN";

  try {
    // 2. BUSCA ISOLADA: Separei as buscas para o Prisma não ter como se confundir
    let leads = [];

    if (isAdmin) {
      leads = await db.business.findMany({
        where: {
          user: {
            email: { endsWith: "@tafanu.com.br" },
            affiliateId: null, // Admin vê os órfãos
          },
        },
        include: {
          user: {
            select: { name: true, phone: true, email: true, lastLogin: true },
          },
        },
        orderBy: { expiresAt: "asc" },
      });
    } else {
      leads = await db.business.findMany({
        where: {
          user: {
            email: { endsWith: "@tafanu.com.br" },
            affiliateId: session.user.id, // Afiliado vê os dele
          },
        },
        include: {
          user: {
            select: { name: true, phone: true, email: true, lastLogin: true },
          },
        },
        orderBy: { expiresAt: "asc" },
      });
    }

    return (
      <div className="p-6 md:p-8 min-h-screen bg-gray-50">
        <h1 className="text-2xl font-black text-[#0F172A] mb-1 uppercase">
          Funil de Vendas
        </h1>
        <p className="text-sm font-semibold text-gray-400 mb-8">
          Painel de acompanhamento e prospecção de parceiros.
        </p>

        {isAdmin && <CriarLeadForm />}

        <FunilBoard leads={leads} />
      </div>
    );
  } catch (error: any) {
    // 3. SE O BANCO FALHAR, ELE MOSTRA O ERRO GIGANTE NA TELA
    return (
      <div className="p-8 text-center mt-20">
        <h1 className="text-2xl font-black text-red-500 uppercase">
          Ocorreu um erro no Banco de Dados
        </h1>
        <code className="bg-red-50 text-red-700 p-4 rounded-xl mt-4 block text-xs text-left max-w-2xl mx-auto">
          {error.message || "Erro desconhecido"}
        </code>
      </div>
    );
  }
}
