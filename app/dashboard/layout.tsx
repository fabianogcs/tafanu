import { db } from "@/lib/db";
import { auth } from "@/auth";
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
  Briefcase,
  Target,
} from "lucide-react";
import { logoutUser } from "@/app/actions";
import { Role } from "@prisma/client";
import SessionRefresher from "@/components/SessionRefresher";

import FloatingSupportButton from "@/components/FloatingSupportButton"; // 🚀 NOVO IMPORT

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
      affiliate: { select: { phone: true, name: true } }, // 🚀 AQUI ELE PUXA O PARCEIRO!
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
    // 🚀 CIRURGIA: Alinhando o fantasma com a nossa regra de 10 DIAS de Tolerância!
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
    // 🚀 CIRURGIA 2: Mantém o menu "Minha Vitrine" aparecendo na barra lateral durante os 10 dias!
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

  // 🚀 LÓGICA DO SUPORTE (Quem é o Gerente?)
  const defaultTafanuPhone = "5514991406618";
  let supportPhone = defaultTafanuPhone;
  let supportName = "Suporte Tafanu";

  if (user.affiliate?.phone) {
    supportPhone = user.affiliate.phone.replace(/\D/g, "");
    if (!supportPhone.startsWith("55")) supportPhone = `55${supportPhone}`;
    supportName = `Seu Gerente: ${user.affiliate.name?.split(" ")[0] || "Parceiro"}`;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 relative pb-16 md:pb-0">
      <SessionRefresher />

      <aside className="w-full md:w-64 bg-[#0F172A] text-white flex flex-col md:fixed md:h-full z-20 shadow-2xl">
        <div className="p-6 md:p-8 border-b border-white/5">
          <div>
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">
              {isAdmin
                ? "Admin Master"
                : isAfiliado
                  ? "Parceiro Oficial"
                  : isPro
                    ? "Membro Premium"
                    : "Visitante"}
            </p>
            {/* 🚀 COMPONENTE LIMPO: Nome fixo e elegante */}
            <h2 className="text-xl font-black uppercase tracking-tighter truncate">
              {displayName}
            </h2>
          </div>
          {isLocked && (
            <div className="mt-2 flex items-center gap-2 text-red-400 animate-pulse">
              <Lock size={14} />
              <span className="text-[10px] font-bold uppercase">
                Validar Perfil
              </span>
            </div>
          )}
        </div>

        <nav className="flex flex-row md:flex-col p-2 md:p-4 gap-1 md:gap-2 overflow-x-auto scrollbar-hide">
          {isLocked ? (
            <div className="flex flex-col gap-4 w-full">
              <Link
                href="/dashboard/perfil"
                className="flex items-center gap-3 px-4 py-4 bg-white text-[#0F172A] rounded-2xl shadow-lg font-black animate-pulse border-2 border-emerald-500"
              >
                <User size={20} className="text-emerald-500" />
                <span className="text-sm uppercase tracking-wide">
                  Validar Dados
                </span>
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white rounded-2xl transition-all"
              >
                <Home size={20} />{" "}
                <span className="text-sm font-semibold">Início</span>
              </Link>

              <Link
                href="/dashboard/favoritos"
                className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white rounded-2xl transition-all"
              >
                <Heart size={20} />{" "}
                <span className="text-sm font-semibold">Favoritos</span>
              </Link>

              {/* 🚀 MOVIDO PARA CIMA: Agora visitantes e PROs veem este botão */}
              <Link
                href="/dashboard/perfil"
                className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white rounded-2xl transition-all"
              >
                <User size={20} />
                <span className="text-sm font-semibold">Meus Dados</span>
              </Link>

              {isPro && (
                <>
                  <div className="my-2 border-t border-white/5 mx-4 hidden md:block opacity-50"></div>

                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all font-semibold"
                  >
                    <Store size={20} className="text-emerald-400" />
                    <span className="text-sm">
                      {isAssinante ? "Minha Vitrine" : "Meus Negócios"}
                    </span>
                  </Link>

                  {/* ... Links do Funil Admin ... */}

                  {(isAdmin || isAfiliado) && (
                    <>
                      <Link
                        href="/dashboard/funil"
                        className="flex items-center gap-3 px-4 py-3 text-emerald-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all font-semibold"
                      >
                        <Target size={20} />
                        <span className="text-sm">Funil de Vendas</span>
                      </Link>
                    </>
                  )}

                  {isAfiliado && (
                    <Link
                      href="/dashboard/parceiro"
                      className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all font-semibold"
                    >
                      <Briefcase size={20} />
                      <span className="text-sm">Painel Parceiro</span>
                    </Link>
                  )}
                </>
              )}
            </>
          )}
        </nav>

        <div className="hidden md:block p-6 mt-auto border-t border-white/5">
          <form action={logoutUser}>
            <button className="flex items-center justify-center gap-2 w-full py-4 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all font-bold text-xs uppercase tracking-widest">
              <LogOut size={16} /> Sair
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 w-full min-h-screen bg-gray-50">
        <div className="w-full">{children}</div>
      </main>

      {/* 🚀 O BOTÃO FLUTUANTE INJETADO NO MOLDE GERAL (Apenas para Assinantes) */}
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
