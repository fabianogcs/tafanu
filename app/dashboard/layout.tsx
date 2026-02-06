import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Store,
  PlusCircle,
  User,
  LogOut,
  Heart,
  Home,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { logoutUser } from "@/app/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) redirect("/login");

  // 1. Busca dados do usuário
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { name: true, role: true, document: true, phone: true },
  });

  if (!user) redirect("/login");

  const isAdmin = user.role === "ADMIN";
  const isAssinante = user.role === "ASSINANTE";

  // 2. LÓGICA DE TRAVA: Se é assinante E não tem dados, bloqueia o menu.
  const isLocked = isAssinante && (!user.document || !user.phone);

  const nameParts = user.name?.split(" ") ?? ["Usuário"];
  const displayName = nameParts[0];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* --- SIDEBAR --- */}
      <aside className="w-full md:w-64 bg-tafanu-blue text-white flex flex-col md:fixed md:h-full z-20 shadow-2xl flex-shrink-0">
        {/* Identidade do Usuário */}
        <div className="p-6 md:p-8 border-b border-white/5 md:block">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-tafanu-action uppercase tracking-[0.2em] mb-1">
                {isAdmin
                  ? "Admin Master"
                  : isAssinante
                    ? "Membro Premium"
                    : "Visitante"}
              </p>
              <h1 className="text-lg font-bold text-white leading-tight truncate w-40">
                {displayName}
              </h1>
            </div>
            {/* Ícone de bloqueio (Apenas se estiver travado) */}
            {isLocked && (
              <div className="bg-red-500/20 p-2 rounded-lg text-red-400 animate-pulse">
                <Lock size={16} />
              </div>
            )}
          </div>
        </div>

        {/* Menu de Navegação */}
        <nav className="flex flex-row md:flex-col p-2 md:p-4 gap-1 md:gap-2 overflow-x-auto md:overflow-visible scrollbar-hide">
          {/* CASO 1: CONTA TRAVADA (Assinante sem dados) */}
          {isLocked ? (
            <div className="flex flex-col gap-4 w-full mt-2">
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mx-1">
                <div className="flex items-center gap-2 text-red-400 mb-2">
                  <AlertTriangle size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Pendente
                  </span>
                </div>
                <p className="text-[10px] text-red-200/70 leading-relaxed font-medium">
                  Complete seu cadastro para desbloquear o menu.
                </p>
              </div>

              <Link
                href="/dashboard/perfil"
                className="flex items-center gap-3 px-4 py-4 bg-white text-tafanu-blue rounded-2xl shadow-lg font-black group whitespace-nowrap animate-pulse border-2 border-tafanu-action"
              >
                <User size={20} className="text-tafanu-action" />
                <span className="text-sm uppercase tracking-wide">
                  Validar Dados
                </span>
              </Link>
            </div>
          ) : (
            /* CASO 2: CONTA LIBERADA */
            <>
              {/* Botão INÍCIO (Visível para Todos) */}
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all font-semibold group whitespace-nowrap"
              >
                <Home
                  size={20}
                  className="group-hover:text-tafanu-action transition-colors"
                />
                <span className="text-sm">Início</span>
              </Link>

              {/* Botão FAVORITOS (Visível para Todos) */}
              <Link
                href="/dashboard/favoritos"
                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all font-semibold group whitespace-nowrap"
              >
                <Heart
                  size={20}
                  className="group-hover:text-tafanu-action transition-colors"
                />
                <span className="text-sm">Favoritos</span>
              </Link>

              {/* Botões EXCLUSIVOS DE ASSINANTE OU ADMIN */}
              {(isAssinante || isAdmin) && (
                <>
                  <div className="my-2 border-t border-white/5 mx-4 hidden md:block opacity-50"></div>

                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all font-semibold group whitespace-nowrap"
                  >
                    <Store
                      size={20}
                      className="group-hover:text-tafanu-action transition-colors"
                    />
                    <span className="text-sm">Meus Negócios</span>
                  </Link>

                  <Link
                    href="/dashboard/novo"
                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all font-semibold group whitespace-nowrap"
                  >
                    <PlusCircle
                      size={20}
                      className="group-hover:text-tafanu-action transition-colors"
                    />
                    <span className="text-sm">Novo Anúncio</span>
                  </Link>

                  <Link
                    href="/dashboard/perfil"
                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all font-semibold group whitespace-nowrap"
                  >
                    <User
                      size={20}
                      className="group-hover:text-tafanu-action transition-colors"
                    />
                    <span className="text-sm">Meus Dados</span>
                  </Link>
                </>
              )}
            </>
          )}
        </nav>

        {/* Botão Sair (Visível no Desktop) */}
        <div className="hidden md:block p-6 mt-auto border-t border-white/5">
          <form action={logoutUser}>
            <button className="flex items-center justify-center gap-2 w-full py-4 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all font-bold text-xs uppercase tracking-widest">
              <LogOut size={16} /> Sair da Conta
            </button>
          </form>
        </div>
      </aside>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="flex-1 md:ml-64 w-full min-h-screen bg-gray-50">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
