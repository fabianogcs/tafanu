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
      {/* 🚀 CIRURGIA UX/UI: Altura reduzida para h-14 (mobile) e h-16 (desktop) */}
      <nav className="bg-white/90 backdrop-blur-xl sticky top-0 z-[80] border-b border-slate-200 w-full transition-all duration-300">
        {/* 🚀 UX FIX: Alinhamento sincronizado milimetricamente com a Hero (1500px) */}
        <div className="w-full max-w-[1500px] mx-auto px-6 lg:px-12 xl:px-16">
          <div className="flex justify-between items-center h-14 md:h-16">
            {/* LOGO COM DESTAQUE E PRESENÇA DE MARCA (UX/UI Premium) */}
            <div className="flex-shrink-0">
              <Link
                href="/"
                className="flex items-center gap-2.5 group"
                onClick={() => setIsOpen(false)}
              >
                <div className="w-10 h-10 md:w-11 md:h-11 bg-white rounded-full flex items-center justify-center p-1 shadow-md border border-slate-100 group-hover:scale-105 transition-transform duration-500">
                  <img
                    src="/logo.png"
                    alt="Tafanu Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter uppercase italic group-hover:text-tafanu-action transition-colors duration-500">
                  Tafanu
                </span>
              </Link>
            </div>

            {/* DESKTOP: Botões refinados com padding menor e tipografia levemente mais compacta */}
            <div className="hidden md:flex items-center gap-1.5">
              {/* 1. INÍCIO */}
              <DesktopNavLink href="/">Início</DesktopNavLink>

              {/* 2. ENTRAR (OU DASHBOARD/SAIR SE ESTIVER LOGADO) */}
              {isGuest ? (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-slate-600 hover:text-tafanu-action font-bold text-[11px] uppercase tracking-widest transition-colors rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 shadow-2xs"
                >
                  Entrar
                </Link>
              ) : (
                <>
                  {isVisitor && (
                    <DesktopNavLink href="/dashboard/favoritos">
                      <Heart size={13} className="text-rose-500" /> Favoritos
                    </DesktopNavLink>
                  )}
                  {isSubscriber && (
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-tafanu-action font-bold text-[11px] uppercase tracking-widest transition-all bg-emerald-50 rounded-lg border border-emerald-200 hover:bg-emerald-100 shadow-2xs"
                    >
                      <LayoutDashboard size={13} /> Gerenciar
                    </Link>
                  )}
                  {isAdmin && (
                    <>
                      <DesktopNavLink href="/dashboard">
                        <Layers size={13} /> Dashboard
                      </DesktopNavLink>
                      <Link
                        href="/admin"
                        className="flex items-center gap-1.5 px-3.5 py-1.5 text-amber-600 font-bold text-[11px] uppercase tracking-widest bg-amber-50 rounded-lg border border-amber-200 hover:bg-amber-100 shadow-2xs"
                      >
                        <ShieldCheck size={13} /> Painel Mestre
                      </Link>
                    </>
                  )}
                  {isAfiliado && (
                    <>
                      <DesktopNavLink href="/dashboard">
                        <Layers size={13} /> Dashboard
                      </DesktopNavLink>
                      <Link
                        href="/dashboard/parceiro"
                        className="flex items-center gap-1.5 px-3.5 py-1.5 text-emerald-600 font-bold text-[11px] uppercase tracking-widest bg-emerald-50 rounded-lg border border-emerald-200 hover:bg-emerald-100 shadow-2xs"
                      >
                        <Briefcase size={13} /> Parceiro
                      </Link>
                    </>
                  )}

                  {/* BOTÃO SAIR */}
                  <button
                    onClick={handleFullLogout}
                    className="p-2 text-slate-400 hover:text-red-500 transition-all rounded-lg hover:bg-red-50 active:scale-95 group border border-slate-200 hover:border-red-200 shadow-2xs bg-white cursor-pointer"
                    title="Sair da conta"
                  >
                    <LogOut
                      size={14}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </button>
                </>
              )}

              {/* 3. BAIXAR APP */}
              {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="px-3.5 py-1.5 text-tafanu-action font-bold text-[11px] uppercase tracking-wider hover:bg-emerald-50 rounded-lg transition-all border border-emerald-200 shadow-2xs bg-white animate-pulse cursor-pointer"
                >
                  Baixar App
                </button>
              )}

              {/* 4. VITRINE EM 5 MIN (DESKTOP) Refinado e Delicado */}
              {(isGuest || isVisitor) && (
                <button
                  onClick={() => (window.location.href = "/anunciar")}
                  className="flex items-center gap-1.5 bg-tafanu-action text-white px-4 py-1.5 rounded-full font-black text-[11px] uppercase tracking-wider hover:bg-[#00c27a] hover:scale-105 transition-all shadow-[0_3px_10px_rgba(0,168,107,0.25)] whitespace-nowrap ml-1 cursor-pointer"
                >
                  <Sparkles size={13} /> Vitrine em 5 min
                </button>
              )}
            </div>

            {/* TOPO MOBILE LIMPO */}
            <div className="md:hidden flex items-center">
              <button
                aria-label="Abrir menu principal"
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 active:scale-95 transition-all shadow-2xs cursor-pointer"
              >
                <Menu size={20} />
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

      {/* DRAWER MOBILE REFInADO */}
      <div
        className={`fixed inset-y-0 right-0 w-[280px] bg-white z-[100] shadow-[-20px_0_50px_rgba(0,0,0,0.15)] transform transition-transform duration-300 ease-out md:hidden flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-end p-3.5 border-b border-slate-100">
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 active:scale-95 transition-all shadow-2xs cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 no-scrollbar bg-slate-50">
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="group flex items-center justify-between w-full bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-emerald-800 mb-5 active:scale-95 transition-all text-left shadow-2xs cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <div className="bg-white text-tafanu-action p-1.5 rounded-lg shadow-2xs border border-emerald-100">
                  <Smartphone size={16} />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[9px] uppercase font-bold text-emerald-600 tracking-widest mb-1">
                    Guia de Bolso
                  </span>
                  <span className="text-xs font-black">Baixar App Oficial</span>
                </div>
              </span>
              <Download
                size={15}
                className="text-tafanu-action animate-bounce"
              />
            </button>
          )}

          <div className="space-y-1">
            <div className="px-3 pb-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
              Navegação
            </div>
            <MobileLink
              href="/"
              icon={<Home size={16} />}
              label="Início"
              onClick={() => setIsOpen(false)}
            />
            {isVisitor && (
              <MobileLink
                href="/dashboard/favoritos"
                icon={<Heart size={16} />}
                label="Meus Favoritos"
                color="text-rose-500"
                onClick={() => setIsOpen(false)}
              />
            )}
            {isSubscriber && (
              <>
                <MobileLink
                  href="/dashboard/favoritos"
                  icon={<Heart size={16} />}
                  label="Meus Favoritos"
                  color="text-rose-500"
                  onClick={() => setIsOpen(false)}
                />
                <MobileLink
                  href="/dashboard"
                  icon={<LayoutDashboard size={16} />}
                  label="Gerenciar Negócio"
                  onClick={() => setIsOpen(false)}
                />
              </>
            )}
            {isAdmin && (
              <>
                <MobileLink
                  href="/dashboard"
                  icon={<Layers size={16} />}
                  label="Meus Posts"
                  onClick={() => setIsOpen(false)}
                />
                <MobileLink
                  href="/admin"
                  icon={<ShieldCheck size={16} />}
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
                  icon={<Layers size={16} />}
                  label="Dashboard"
                  onClick={() => setIsOpen(false)}
                />
                <MobileLink
                  href="/dashboard/parceiro"
                  icon={<Briefcase size={16} />}
                  label="Painel Parceiro"
                  color="text-emerald-500"
                  onClick={() => setIsOpen(false)}
                />
              </>
            )}
            {isGuest && (
              <MobileLink
                href="/login"
                icon={<UserPlus size={16} />}
                label="Entrar / Criar Conta"
                onClick={() => setIsOpen(false)}
              />
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-white">
          {(isGuest || isVisitor) && (
            <button
              onClick={() => {
                setIsOpen(false);
                window.location.href = "/anunciar";
              }}
              className="flex items-center justify-center gap-1.5 w-full bg-tafanu-action text-white font-black p-3.5 rounded-xl shadow-[0_4px_12px_rgba(0,168,107,0.25)] active:scale-[0.98] transition-all uppercase text-[11px] tracking-wider cursor-pointer"
            >
              <Sparkles size={15} /> Criar Vitrine
            </button>
          )}
          {isLoggedIn && (
            <button
              onClick={() => {
                setIsOpen(false);
                handleFullLogout();
              }}
              className="flex items-center justify-center gap-1.5 w-full text-red-500 hover:text-red-600 font-bold p-3 text-[11px] uppercase tracking-widest transition-colors rounded-xl bg-red-50 hover:bg-red-100 mt-2 border border-red-100 shadow-2xs cursor-pointer"
            >
              <LogOut size={15} /> Sair da Conta
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
      className="flex items-center gap-1.5 px-3.5 py-1.5 text-slate-600 hover:text-slate-900 font-bold text-[11px] uppercase tracking-widest transition-colors rounded-lg bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs"
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
      className="flex items-center justify-between w-full text-slate-600 hover:text-slate-900 p-3.5 rounded-xl font-bold bg-white hover:bg-slate-100 transition-all group active:scale-95 shadow-2xs border border-slate-100"
    >
      <span className="flex items-center gap-3">
        <span
          className={`${color} bg-slate-50 shadow-inner border border-slate-100 p-2 rounded-lg transition-transform group-hover:scale-110`}
        >
          {icon}
        </span>
        <span className="text-[13px] tracking-wide">{label}</span>
      </span>
      <ChevronRight
        size={15}
        className="text-slate-300 group-hover:translate-x-1 transition-transform"
      />
    </Link>
  );
}
