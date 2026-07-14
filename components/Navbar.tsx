"use client";

import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
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
  Smartphone,
  Download,
  Briefcase,
} from "lucide-react";
import { useSession } from "next-auth/react";
import LoginModal from "@/components/LoginModal";

export default function Navbar({
  isLoggedIn,
  userRole,
}: {
  isLoggedIn: boolean;
  userRole: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handlePrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const checkPrompt = () => {
      if ((window as any).deferredPrompt)
        setDeferredPrompt((window as any).deferredPrompt);
    };
    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("pwa-ready", checkPrompt);
    checkPrompt();
    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("pwa-ready", checkPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setDeferredPrompt(null);
    } else {
      alert(
        "Para instalar: use o menu do navegador e escolha 'Instalar' ou 'Adicionar à tela inicial'.",
      );
    }
  };

  const handleFullLogout = async () => {
    setIsOpen(false);
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const { data: session } = useSession();
  const currentRole = session?.user?.role || userRole;
  const isCurrentlyLoggedIn = !!session || isLoggedIn;
  const isAdmin = isCurrentlyLoggedIn && currentRole === "ADMIN";
  const isAfiliado = isCurrentlyLoggedIn && currentRole === "AFILIADO";
  const isSubscriber = isCurrentlyLoggedIn && currentRole === "ASSINANTE";
  const isVisitor =
    isCurrentlyLoggedIn && !isSubscriber && !isAdmin && !isAfiliado;
  const isGuest = !isCurrentlyLoggedIn;

  return (
    <>
      <nav className="bg-white/90 backdrop-blur-xl sticky top-0 z-[80] border-b border-slate-200 w-full transition-all duration-300">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* LOGO EMPACOTADA */}
            <div className="flex-shrink-0">
              <Link
                href="/"
                className="flex items-center gap-2.5 group"
                onClick={() => setIsOpen(false)}
              >
                <div className="w-9 h-9 md:w-11 md:h-11 bg-white rounded-full flex items-center justify-center p-1 shadow-[0_2px_15px_rgba(0,0,0,0.08)] border border-slate-100 group-hover:scale-105 transition-transform duration-500">
                  <img
                    src="/logo.png"
                    alt="Tafanu Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter uppercase italic group-hover:text-tafanu-action transition-colors duration-500">
                  Tafanu
                </span>
              </Link>
            </div>

            {/* 🚀 CIRURGIA DESKTOP: Organizado em um único bloco, sem margens gigantes */}
            <div className="hidden md:flex items-center gap-2">
              {/* 1. INÍCIO */}
              <DesktopNavLink href="/">Início</DesktopNavLink>

              {/* 2. ENTRAR (OU DASHBOARD/SAIR SE ESTIVER LOGADO) */}
              {isGuest ? (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-tafanu-action font-bold text-xs uppercase tracking-widest transition-colors rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 shadow-sm"
                >
                  Entrar
                </Link>
              ) : (
                <>
                  {isVisitor && (
                    <DesktopNavLink href="/dashboard/favoritos">
                      <Heart size={14} className="text-rose-500" /> Favoritos
                    </DesktopNavLink>
                  )}
                  {isSubscriber && (
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-tafanu-action font-bold text-xs uppercase tracking-widest transition-all bg-emerald-50 rounded-xl border border-emerald-200 hover:bg-emerald-100 shadow-sm"
                    >
                      <LayoutDashboard size={14} /> Gerenciar
                    </Link>
                  )}
                  {isAdmin && (
                    <>
                      <DesktopNavLink href="/dashboard">
                        <Layers size={14} /> Dashboard
                      </DesktopNavLink>
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-amber-600 font-bold text-xs uppercase tracking-widest bg-amber-50 rounded-xl border border-amber-200 hover:bg-amber-100 shadow-sm"
                      >
                        <ShieldCheck size={14} /> Painel Mestre
                      </Link>
                    </>
                  )}
                  {isAfiliado && (
                    <>
                      <DesktopNavLink href="/dashboard">
                        <Layers size={14} /> Dashboard
                      </DesktopNavLink>
                      <Link
                        href="/dashboard/parceiro"
                        className="flex items-center gap-2 px-4 py-2 text-emerald-600 font-bold text-xs uppercase tracking-widest bg-emerald-50 rounded-xl border border-emerald-200 hover:bg-emerald-100 shadow-sm"
                      >
                        <Briefcase size={14} /> Parceiro
                      </Link>
                    </>
                  )}

                  {/* BOTÃO SAIR (Substitui o Entrar) */}
                  <button
                    onClick={handleFullLogout}
                    className="p-2.5 text-slate-500 hover:text-red-500 transition-all rounded-xl hover:bg-red-50 active:scale-95 group border border-slate-200 hover:border-red-200 shadow-sm bg-white"
                    title="Sair da conta"
                  >
                    <LogOut
                      size={16}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </button>
                </>
              )}

              {/* 3. BAIXAR APP */}
              {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="px-4 py-2 text-tafanu-action font-bold text-xs uppercase tracking-wider hover:bg-emerald-50 rounded-xl transition-all border border-emerald-200 shadow-sm bg-white animate-pulse"
                >
                  Baixar App
                </button>
              )}

              {/* 4. VITRINE EM 5 MIN (Apenas para Visitantes e Convidados) */}
              {(isGuest || isVisitor) && (
                <button
                  onClick={() =>
                    isGuest
                      ? setIsLoginModalOpen(true)
                      : (window.location.href = "/anunciar")
                  }
                  className="flex items-center gap-2 bg-tafanu-action text-white px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-wider hover:bg-[#00c27a] hover:scale-105 transition-all shadow-[0_5px_15px_rgba(0,168,107,0.3)] whitespace-nowrap ml-1"
                >
                  <Sparkles size={14} /> Vitrine em 5 min
                </button>
              )}
            </div>

            {/* TOPO MOBILE */}
            <div className="md:hidden flex items-center gap-2.5">
              {(isGuest || isVisitor) && (
                <button
                  onClick={() =>
                    isGuest
                      ? setIsLoginModalOpen(true)
                      : (window.location.href = "/anunciar")
                  }
                  className="flex items-center gap-1.5 bg-tafanu-action text-white px-3.5 py-2 rounded-full font-black text-[11px] uppercase tracking-wider shadow-[0_3px_10px_rgba(0,168,107,0.3)] active:scale-95 transition-all"
                >
                  <Sparkles size={12} />
                  <span>+ Vitrine</span>
                </button>
              )}
              <button
                aria-label="Abrir menu principal"
                onClick={() => setIsOpen(true)}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 active:scale-95 transition-all shadow-sm"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] md:hidden animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* DRAWER MOBILE LUMINOSO (Mantido intacto conforme pedido) */}
      <div
        className={`fixed inset-y-0 right-0 w-[290px] bg-white z-[100] shadow-[-20px_0_50px_rgba(0,0,0,0.15)] transform transition-transform duration-300 ease-out md:hidden flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-end p-4 border-b border-slate-100">
          <button
            onClick={() => setIsOpen(false)}
            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 active:scale-95 transition-all shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 no-scrollbar bg-slate-50">
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="group flex items-center justify-between w-full bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-800 mb-6 active:scale-95 transition-all text-left shadow-sm"
            >
              <span className="flex items-center gap-3">
                <div className="bg-white text-tafanu-action p-2 rounded-xl shadow-sm border border-emerald-100">
                  <Smartphone size={18} />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[9px] uppercase font-bold text-emerald-600 tracking-widest mb-1">
                    Guia de Bolso
                  </span>
                  <span className="text-xs font-black">Baixar App Oficial</span>
                </div>
              </span>
              <Download
                size={16}
                className="text-tafanu-action animate-bounce"
              />
            </button>
          )}

          <div className="space-y-1.5">
            <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Navegação
            </div>
            <MobileLink
              href="/"
              icon={<Home size={18} />}
              label="Início"
              onClick={() => setIsOpen(false)}
            />
            {isVisitor && (
              <MobileLink
                href="/dashboard/favoritos"
                icon={<Heart size={18} />}
                label="Meus Favoritos"
                color="text-rose-500"
                onClick={() => setIsOpen(false)}
              />
            )}
            {isSubscriber && (
              <>
                <MobileLink
                  href="/dashboard/favoritos"
                  icon={<Heart size={18} />}
                  label="Meus Favoritos"
                  color="text-rose-500"
                  onClick={() => setIsOpen(false)}
                />
                <MobileLink
                  href="/dashboard"
                  icon={<LayoutDashboard size={18} />}
                  label="Gerenciar Negócio"
                  onClick={() => setIsOpen(false)}
                />
              </>
            )}
            {isAdmin && (
              <>
                <MobileLink
                  href="/dashboard"
                  icon={<Layers size={18} />}
                  label="Meus Posts"
                  onClick={() => setIsOpen(false)}
                />
                <MobileLink
                  href="/admin"
                  icon={<ShieldCheck size={18} />}
                  label="Painel Mestre"
                  color="text-amber-500"
                  onClick={() => setIsOpen(false)}
                />
              </>
            )}
            {isAfiliado && (
              <>
                <MobileLink
                  href="/dashboard"
                  icon={<Layers size={18} />}
                  label="Dashboard"
                  onClick={() => setIsOpen(false)}
                />
                <MobileLink
                  href="/dashboard/parceiro"
                  icon={<Briefcase size={18} />}
                  label="Painel Parceiro"
                  color="text-emerald-500"
                  onClick={() => setIsOpen(false)}
                />
              </>
            )}
            {isGuest && (
              <MobileLink
                href="/login"
                icon={<UserPlus size={18} />}
                label="Entrar / Criar Conta"
                onClick={() => setIsOpen(false)}
              />
            )}
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 bg-white">
          {(isGuest || isVisitor) && (
            <button
              onClick={() => {
                setIsOpen(false);
                isGuest
                  ? setIsLoginModalOpen(true)
                  : (window.location.href = "/anunciar");
              }}
              className="flex items-center justify-center gap-2 w-full bg-tafanu-action text-white font-black p-4 rounded-xl shadow-[0_5px_15px_rgba(0,168,107,0.3)] active:scale-[0.98] transition-all uppercase text-xs tracking-wider"
            >
              <Sparkles size={16} /> Criar Vitrine
            </button>
          )}
          {isLoggedIn && (
            <button
              onClick={() => {
                setIsOpen(false);
                handleFullLogout();
              }}
              className="flex items-center justify-center gap-2 w-full text-red-500 hover:text-red-600 font-bold p-3.5 text-xs uppercase tracking-widest transition-colors rounded-xl bg-red-50 hover:bg-red-100 mt-2 border border-red-100 shadow-sm"
            >
              <LogOut size={16} /> Sair da Conta
            </button>
          )}
        </div>
      </div>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}

function DesktopNavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-colors rounded-xl bg-white border border-slate-200 hover:bg-slate-50 shadow-sm"
    >
      {children}
    </Link>
  );
}

function MobileLink({
  href,
  icon,
  label,
  onClick,
  color = "text-tafanu-action",
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center justify-between w-full text-slate-600 hover:text-slate-900 p-4 rounded-xl font-bold bg-white hover:bg-slate-100 transition-all group active:scale-95 shadow-sm border border-slate-100"
    >
      <span className="flex items-center gap-3.5">
        <span
          className={`${color} bg-slate-50 shadow-inner border border-slate-100 p-2.5 rounded-lg transition-transform group-hover:scale-110`}
        >
          {icon}
        </span>
        <span className="text-sm tracking-wide">{label}</span>
      </span>
      <ChevronRight
        size={16}
        className="text-slate-300 group-hover:translate-x-1 transition-transform"
      />
    </Link>
  );
}
