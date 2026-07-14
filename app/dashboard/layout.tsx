import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Store,
  User,
  Heart,
  Home,
  Lock,
  Briefcase,
  Target,
} from "lucide-react";
import { Role } from "@prisma/client";
import SessionRefresher from "@/components/SessionRefresher";
import FloatingSupportButton from "@/components/FloatingSupportButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      document: true,
      phone: true,
      affiliate: { select: { phone: true, name: true } },
      businesses: {
        select: { expiresAt: true },
      },
    },
  });

  if (!user) redirect("/login");

  const currentRole = user.role as Role;
  const isAdmin = currentRole === "ADMIN";
  const isAfiliado = currentRole === "AFILIADO";
  const isAssinante = currentRole === "ASSINANTE";

  const mainBusiness = user.businesses[0];
  const businessExpiresAt = mainBusiness?.expiresAt;

  if (isAssinante && businessExpiresAt) {
    const dataLimiteTolerancia = new Date(
      new Date(businessExpiresAt).getTime() + 10 * 24 * 60 * 60 * 1000,
    );

    if (new Date() > dataLimiteTolerancia) {
      await db.$transaction([
        db.user.update({
          where: { id: user.id },
          data: { role: "VISITANTE" as Role },
        }),
        db.business.updateMany({
          where: { userId: user.id },
          data: { published: false, isActive: false },
        }),
      ]);

      redirect("/login?expired=true");
    }
  }

  let hasValidSubscription = false;
  if (businessExpiresAt) {
    const dataLimiteTolerancia = new Date(
      new Date(businessExpiresAt).getTime() + 10 * 24 * 60 * 60 * 1000,
    );
    hasValidSubscription = dataLimiteTolerancia > new Date();
  }

  const isPro = isAdmin || isAfiliado || (isAssinante && hasValidSubscription);
  const isTestAccount = user.email?.endsWith("@tafanu.com.br");
  const isLocked =
    isAssinante && !isTestAccount && (!user.document || !user.phone);

  const displayName = user.name?.split(" ")[0] ?? "Usuário";
  const defaultTafanuPhone = "5514991406618";
  let supportPhone = defaultTafanuPhone;
  let supportName = "Suporte Tafanu";

  if (user.affiliate?.phone) {
    supportPhone = user.affiliate.phone.replace(/\D/g, "");
    if (!supportPhone.startsWith("55")) supportPhone = `55${supportPhone}`;
    supportName = `Seu Gerente: ${user.affiliate.name?.split(" ")[0] || "Parceiro"}`;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 relative pb-16 md:pb-0">
      <SessionRefresher />

      {/* 🚀 CIRURGIA 1: Sidebar com "Vida" (Aura e Gradiente) */}
      <aside className="w-full md:w-64 bg-white text-slate-800 flex flex-col md:fixed md:top-20 md:h-[calc(100vh-5rem)] z-20 border-r border-slate-200 relative overflow-hidden">
        {/* A Mágica: Aura Esmeralda Suave Desfocada no fundo da Sidebar */}
        <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-tafanu-action/10 rounded-full blur-[50px] pointer-events-none z-0"></div>

        {/* Cabeçalho Perfil na Sidebar */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-b from-transparent to-white relative z-10">
          <div>
            <p className="text-[10px] font-black text-tafanu-action uppercase tracking-[0.2em] mb-1 drop-shadow-sm">
              {isAdmin
                ? "Admin Master"
                : isAfiliado
                  ? "Parceiro Oficial"
                  : isPro
                    ? "Membro Premium"
                    : "Visitante"}
            </p>
            <h2 className="text-xl font-black uppercase tracking-tighter truncate text-slate-900">
              {displayName}
            </h2>
          </div>
          {isLocked && (
            <div className="mt-2 flex items-center gap-2 text-rose-500 animate-pulse">
              <Lock size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Validar Perfil
              </span>
            </div>
          )}
        </div>

        {/* Menu de Navegação - Versão Viva */}
        <nav className="flex flex-row md:flex-col p-4 gap-2 overflow-x-auto no-scrollbar flex-1 relative z-10">
          {isLocked ? (
            <div className="flex flex-col gap-4 w-full">
              <Link
                href="/dashboard/perfil"
                className="flex items-center gap-3 px-4 py-4 bg-emerald-50 text-emerald-800 rounded-2xl shadow-sm font-black animate-pulse border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                <User size={20} className="text-tafanu-action" />
                <span className="text-sm uppercase tracking-wide">
                  Validar Dados
                </span>
              </Link>
            </div>
          ) : (
            <>
              {/* 🚀 CIRURGIA 2: Hover Magnético (Verde claro e leve sombra) */}
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-tafanu-action hover:bg-emerald-50/50 hover:shadow-sm rounded-xl transition-all group font-semibold"
              >
                <Home
                  size={18}
                  className="text-slate-400 group-hover:text-tafanu-action transition-colors"
                />
                <span className="text-sm">Início</span>
              </Link>

              <Link
                href="/dashboard/favoritos"
                className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 hover:shadow-sm rounded-xl transition-all group font-semibold"
              >
                <Heart
                  size={18}
                  className="text-slate-400 group-hover:text-rose-500 transition-colors"
                />
                <span className="text-sm">Favoritos</span>
              </Link>

              <Link
                href="/dashboard/perfil"
                className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-tafanu-action hover:bg-emerald-50/50 hover:shadow-sm rounded-xl transition-all group font-semibold"
              >
                <User
                  size={18}
                  className="text-slate-400 group-hover:text-tafanu-action transition-colors"
                />
                <span className="text-sm">Meus Dados</span>
              </Link>

              {isPro && (
                <>
                  <div className="my-2 border-t border-slate-100 mx-2 hidden md:block"></div>

                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-tafanu-action hover:bg-emerald-50/50 hover:shadow-sm rounded-xl transition-all font-semibold group"
                  >
                    <Store size={18} className="text-tafanu-action" />
                    <span className="text-sm">
                      {isAssinante ? "Minha Vitrine" : "Meus Negócios"}
                    </span>
                  </Link>

                  {(isAdmin || isAfiliado) && (
                    <Link
                      href="/dashboard/funil"
                      className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-tafanu-action hover:bg-emerald-50/50 hover:shadow-sm rounded-xl transition-all font-semibold group"
                    >
                      <Target size={18} className="text-tafanu-action" />
                      <span className="text-sm">Funil de Vendas</span>
                    </Link>
                  )}

                  {isAfiliado && (
                    <Link
                      href="/dashboard/parceiro"
                      className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-tafanu-action hover:bg-emerald-50/50 hover:shadow-sm rounded-xl transition-all font-semibold group"
                    >
                      <Briefcase size={18} className="text-tafanu-action" />
                      <span className="text-sm">Painel Parceiro</span>
                    </Link>
                  )}
                </>
              )}
            </>
          )}
        </nav>
        {/* 🚀 Botão Sair foi apagado conforme seu pedido! A barra lateral agora é 100% de navegação */}
      </aside>

      {/* Área Principal (Dashboard Content) */}
      <main className="flex-1 md:ml-64 w-full min-h-screen bg-slate-50 relative z-10">
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-slate-200/50 to-transparent -z-10 pointer-events-none" />
        <div className="w-full relative z-10">{children}</div>
      </main>

      {isAssinante && (
        <FloatingSupportButton
          supportName={supportName}
          supportPhone={supportPhone}
          userName={displayName}
          userId={user.id}
        />
      )}
    </div>
  );
}
