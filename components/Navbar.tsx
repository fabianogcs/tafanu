"use client";

import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { logoutUser } from "@/app/actions";
import {
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Heart,
  Sparkles,
  ChevronRight,
  Home,
  ShieldCheck,
  Layers,
  UserPlus,
} from "lucide-react";

export default function Navbar({
  isLoggedIn,
  userRole,
}: {
  isLoggedIn: boolean;
  userRole: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const handleFullLogout = async () => {
    setIsOpen(false);

    // O signOut sozinho já é capaz de limpar a sessão.
    // Vamos forçar ele a limpar tudo e recarregar a página.
    await signOut({
      redirect: true,
      callbackUrl: "/", // Manda para a home, que limpa o estado do React
    });
  };

  // --- BLOQUEIO DE ROLAGEM (Fix do bug mobile) ---
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // --- HIERARQUIA BLINDADA (Aqui matamos o bug de acesso) ---
  // Só é Admin ou Assinante se ESTIVER LOGADO.
  // Se não checar o isLoggedIn, o sistema pode se confundir com roles residuais.
  const isAdmin = isLoggedIn && userRole === "ADMIN";
  const isSubscriber = isLoggedIn && userRole === "ASSINANTE";
  const isVisitor = isLoggedIn && !isSubscriber && !isAdmin;
  const isGuest = !isLoggedIn;

  return (
    <nav className="bg-tafanu-blue shadow-2xl sticky top-0 z-50 border-b border-white/10 w-full">
      <div className="w-full px-6 md:px-10">
        <div className="flex justify-between items-center h-20 md:h-24">
          {/* --- LOGO --- */}
          <div className="flex-shrink-0">
            <Link href="/" className="group" onClick={() => setIsOpen(false)}>
              <span className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic group-hover:text-tafanu-action transition-colors duration-300">
                Tafanu
              </span>
            </Link>
          </div>

          {/* --- DESKTOP NAV --- */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <nav className="flex items-center gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/5">
              <Link
                href="/"
                className="px-5 py-2.5 text-white/70 hover:text-white font-bold text-[11px] uppercase tracking-widest transition-all hover:bg-white/5 rounded-xl"
              >
                Início
              </Link>

              {/* Só aparece se o cara for VISITANTE LOGADO */}
              {isVisitor && (
                <Link
                  href="/dashboard/favoritos"
                  className="flex items-center gap-2 px-5 py-2.5 text-white/70 hover:text-white font-bold text-[11px] uppercase tracking-widest transition-all hover:bg-white/5 rounded-xl"
                >
                  <Heart size={14} className="text-rose-400" /> Favoritos
                </Link>
              )}

              {/* Só aparece para ASSINANTE real */}
              {isSubscriber && (
                <>
                  <Link
                    href="/dashboard/favoritos"
                    className="px-5 py-2.5 text-white/70 hover:text-white font-bold text-[11px] uppercase tracking-widest transition-all hover:bg-white/5 rounded-xl"
                  >
                    Favoritos
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-5 py-2.5 text-white/70 hover:text-white font-bold text-[11px] uppercase tracking-widest transition-all hover:bg-white/5 rounded-xl"
                  >
                    <LayoutDashboard size={14} className="text-tafanu-action" />{" "}
                    Gerenciar
                  </Link>
                </>
              )}

              {/* Só aparece para VOCÊ (Admin) */}
              {isAdmin && (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-5 py-2.5 text-white/70 hover:text-white font-bold text-[11px] uppercase tracking-widest transition-all hover:bg-white/5 rounded-xl"
                  >
                    <Layers size={14} className="text-tafanu-action" /> Meus
                    Posts
                  </Link>
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-5 py-2.5 text-amber-400 font-black text-[11px] uppercase tracking-widest bg-amber-400/10 rounded-xl border border-amber-400/20 shadow-sm shadow-amber-400/10"
                  >
                    <ShieldCheck size={14} /> Painel Mestre
                  </Link>
                </>
              )}
            </nav>

            <div className="flex items-center gap-4">
              {isGuest ? (
                <>
                  <Link
                    href="/login"
                    className="text-white/70 hover:text-white font-black text-[11px] uppercase tracking-widest transition-all"
                  >
                    Entrar ou Criar Conta
                  </Link>
                  <Link
                    href="/anunciar"
                    className="flex items-center gap-2 bg-tafanu-action text-tafanu-blue px-7 py-4 rounded-2xl font-black text-[11px] uppercase tracking-wider hover:scale-105 transition-all shadow-lg shadow-tafanu-action/30"
                  >
                    <Sparkles size={16} /> Anunciar
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Visitante logado mas não assinante ainda vê o botão de Anunciar */}
                  {isVisitor && (
                    <Link
                      href="/anunciar"
                      className="flex items-center gap-2 bg-tafanu-action text-tafanu-blue px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-wider hover:scale-105 transition-all mr-2 shadow-lg"
                    >
                      Anunciar
                    </Link>
                  )}
                  <button
                    onClick={handleFullLogout} // ✅ Cola isto aqui
                    className="p-3 text-white/30 hover:text-red-400 transition-all rounded-xl hover:bg-red-500/10 active:scale-95"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* BOTÃO MOBILE */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white p-2 bg-white/5 rounded-xl border border-white/10 relative z-[70]"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MENU MOBILE --- */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] md:hidden overflow-hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-[300px] bg-tafanu-blue z-[65] shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full p-8 pt-28">
          <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
            <MobileLink
              href="/"
              icon={<Home size={20} className="text-tafanu-action" />}
              label="Início"
              onClick={() => setIsOpen(false)}
            />

            {isVisitor && (
              <MobileLink
                href="/dashboard/favoritos"
                icon={<Heart size={20} className="text-rose-400" />}
                label="Meus Favoritos"
                onClick={() => setIsOpen(false)}
              />
            )}

            {isSubscriber && (
              <>
                <MobileLink
                  href="/dashboard/favoritos"
                  icon={<Heart size={20} className="text-rose-400" />}
                  label="Meus Favoritos"
                  onClick={() => setIsOpen(false)}
                />
                <MobileLink
                  href="/dashboard"
                  icon={
                    <LayoutDashboard size={20} className="text-tafanu-action" />
                  }
                  label="Gerenciar Negócio"
                  onClick={() => setIsOpen(false)}
                />
              </>
            )}

            {isAdmin && (
              <>
                <MobileLink
                  href="/dashboard"
                  icon={<Layers size={20} className="text-tafanu-action" />}
                  label="Meus Posts"
                  onClick={() => setIsOpen(false)}
                />
                <MobileLink
                  href="/admin"
                  icon={<ShieldCheck size={20} className="text-amber-400" />}
                  label="Painel Mestre"
                  onClick={() => setIsOpen(false)}
                />
              </>
            )}

            {isGuest && (
              <MobileLink
                href="/login"
                icon={<UserPlus size={20} className="text-white/50" />}
                label="Entrar ou Criar Conta"
                onClick={() => setIsOpen(false)}
              />
            )}
          </div>

          <div className="mt-auto space-y-4 pt-6 border-t border-white/5">
            {(isGuest || isVisitor) && (
              <Link
                href="/anunciar"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-tafanu-action text-tafanu-blue font-black p-5 rounded-2xl shadow-lg border-2 border-tafanu-action uppercase text-[11px] tracking-widest italic transition-all active:scale-95"
              >
                <Sparkles size={18} /> Anunciar Agora
              </Link>
            )}

            {isLoggedIn && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleFullLogout(); // ✅ Troca por este nome aqui
                }}
                className="flex items-center gap-3 w-full text-white/40 hover:text-red-400 font-bold p-3 text-[11px] uppercase tracking-widest transition-colors"
              >
                <LogOut size={18} /> Sair da Conta
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function MobileLink({ href, icon, label, onClick }: any) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center justify-between w-full text-white bg-white/5 p-4 rounded-2xl font-bold border border-white/5 hover:bg-white/10 transition-all"
    >
      <span className="flex items-center gap-3">
        {icon} <span className="truncate">{label}</span>
      </span>
      <ChevronRight size={18} className="text-white/20 shrink-0" />
    </Link>
  );
}
