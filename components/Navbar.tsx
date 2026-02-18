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
} from "lucide-react";

export default function Navbar({
  isLoggedIn,
  userRole,
}: {
  isLoggedIn: boolean;
  userRole: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);

  // --- LÓGICA MANTIDA (PWA) ---
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

  // --- LÓGICA MANTIDA (Scroll Lock) ---
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const isAdmin = isLoggedIn && userRole === "ADMIN";
  const isSubscriber = isLoggedIn && userRole === "ASSINANTE";
  const isVisitor = isLoggedIn && !isSubscriber && !isAdmin;
  const isGuest = !isLoggedIn;

  return (
    <nav className="bg-tafanu-blue sticky top-0 z-50 border-b border-white/10 w-full transition-all duration-300">
      <div className="w-full px-6 lg:px-12">
        <div className="flex justify-between items-center h-20 md:h-24">
          {/* --- LOGO --- */}
          <div className="flex-shrink-0">
            <Link href="/" className="group" onClick={() => setIsOpen(false)}>
              <span className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic group-hover:text-tafanu-action transition-all duration-500">
                Tafanu
              </span>
            </Link>
          </div>

          {/* --- DESKTOP NAV --- */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-2 bg-white/5 px-2 py-1.5 rounded-2xl border border-white/10 shadow-inner">
              {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="px-4 py-2 text-tafanu-action font-black text-[10px] uppercase tracking-tighter hover:bg-tafanu-action/20 rounded-xl transition-all border border-tafanu-action/30 animate-pulse"
                >
                  Baixar App
                </button>
              )}
              <Link
                href="/"
                className="px-5 py-2 text-white/70 hover:text-white font-bold text-[11px] uppercase tracking-widest transition-all hover:bg-white/10 rounded-xl"
              >
                Início
              </Link>
              {isVisitor && (
                <Link
                  href="/dashboard/favoritos"
                  className="flex items-center gap-2 px-5 py-2 text-white/70 hover:text-white font-bold text-[11px] uppercase tracking-widest transition-all hover:bg-rose-500/10 rounded-xl"
                >
                  <Heart size={14} className="text-rose-400 fill-rose-400/20" />{" "}
                  Favoritos
                </Link>
              )}
              {isSubscriber && (
                <>
                  <Link
                    href="/dashboard/favoritos"
                    className="px-5 py-2 text-white/70 hover:text-white font-bold text-[11px] uppercase tracking-widest hover:bg-white/10 rounded-xl transition-all"
                  >
                    Favoritos
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-5 py-2 text-white/70 hover:text-white font-bold text-[11px] uppercase tracking-widest transition-all bg-tafanu-action/10 border border-tafanu-action/20 rounded-xl"
                  >
                    <LayoutDashboard size={14} className="text-tafanu-action" />{" "}
                    Gerenciar
                  </Link>
                </>
              )}
              {isAdmin && (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-5 py-2 text-white/70 hover:text-white font-bold text-[11px] uppercase tracking-widest transition-all hover:bg-white/10 rounded-xl"
                  >
                    <Layers size={14} className="text-tafanu-action" /> Posts
                  </Link>
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-5 py-2 text-amber-400 font-black text-[11px] uppercase tracking-widest bg-amber-400/10 rounded-xl border border-amber-400/20"
                  >
                    <ShieldCheck size={14} /> Painel Mestre
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 border-l border-white/10 pl-6">
              {isGuest ? (
                <>
                  <Link
                    href="/login"
                    className="text-white/60 hover:text-white font-bold text-[11px] uppercase tracking-widest transition-all"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/anunciar"
                    className="flex items-center gap-2 bg-gradient-to-r from-tafanu-action to-emerald-400 text-tafanu-blue px-7 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-wider hover:scale-105 transition-all shadow-xl shadow-tafanu-action/20 border-t border-white/20"
                  >
                    <Sparkles size={16} /> Anunciar
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  {isVisitor && (
                    <Link
                      href="/anunciar"
                      className="bg-tafanu-action/10 text-tafanu-action border border-tafanu-action/30 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-tafanu-action/20 transition-all"
                    >
                      Anunciar
                    </Link>
                  )}
                  <button
                    onClick={handleFullLogout}
                    className="p-3 text-white/20 hover:text-red-400 transition-all rounded-xl hover:bg-red-500/10 active:scale-95 group"
                  >
                    <LogOut
                      size={20}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* --- BOTÃO MOBILE --- */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-3 rounded-2xl border transition-all duration-300 ${isOpen ? "bg-red-500/20 border-red-500/40 text-red-400" : "bg-white/10 border-white/20 text-white"} relative z-[70] shadow-lg`}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- OVERLAY: ESCURECE O SITE INTEIRO (Para focar no menu) --- */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/95 z-[60] md:hidden animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* --- GAVETA MOBILE: FUNDO TOTALMENTE SÓLIDO (Mudei para um azul bem escuro sólido) --- */}
      <div
        className={`fixed top-0 right-0 h-full w-[310px] bg-[#0A0F1E] z-[65] shadow-[-10px_0_30px_rgba(0,0,0,0.5)] transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) md:hidden ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full p-6 pt-24">
          {/* Botão de Instalação Mobile */}
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="group flex items-center justify-between w-full bg-tafanu-action p-5 rounded-2xl font-black text-tafanu-blue mb-8 shadow-xl active:scale-95 transition-all"
            >
              <span className="flex items-center gap-4 relative z-10">
                <Smartphone size={22} />
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[10px] uppercase opacity-70">
                    App Oficial
                  </span>
                  <span className="text-sm">Instalar Tafanu</span>
                </div>
              </span>
              <Download size={20} className="animate-bounce" />
            </button>
          )}

          {/* Links Mobile com fundos definidos para contraste */}
          <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar pr-2">
            <MobileLink
              href="/"
              icon={<Home size={20} />}
              label="Início"
              onClick={() => setIsOpen(false)}
            />

            {isVisitor && (
              <MobileLink
                href="/dashboard/favoritos"
                icon={<Heart size={20} />}
                label="Meus Favoritos"
                color="text-rose-400"
                onClick={() => setIsOpen(false)}
              />
            )}

            {isSubscriber && (
              <>
                <MobileLink
                  href="/dashboard/favoritos"
                  icon={<Heart size={20} />}
                  label="Meus Favoritos"
                  color="text-rose-400"
                  onClick={() => setIsOpen(false)}
                />
                <MobileLink
                  href="/dashboard"
                  icon={<LayoutDashboard size={20} />}
                  label="Gerenciar Negócio"
                  onClick={() => setIsOpen(false)}
                />
              </>
            )}

            {isAdmin && (
              <>
                <MobileLink
                  href="/dashboard"
                  icon={<Layers size={20} />}
                  label="Meus Posts"
                  onClick={() => setIsOpen(false)}
                />
                <MobileLink
                  href="/admin"
                  icon={<ShieldCheck size={20} />}
                  label="Painel Mestre"
                  color="text-amber-400"
                  onClick={() => setIsOpen(false)}
                />
              </>
            )}

            {isGuest && (
              <MobileLink
                href="/login"
                icon={<UserPlus size={20} />}
                label="Entrar ou Criar Conta"
                onClick={() => setIsOpen(false)}
              />
            )}
          </div>

          <div className="mt-auto pt-6 border-t border-white/10 space-y-4">
            {(isGuest || isVisitor) && (
              <Link
                href="/anunciar"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-3 w-full bg-white/5 text-tafanu-action font-black p-5 rounded-2xl border border-tafanu-action/30 transition-all uppercase text-[11px] tracking-widest"
              >
                <Sparkles size={18} /> Quero Anunciar
              </Link>
            )}

            {isLoggedIn && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleFullLogout();
                }}
                className="flex items-center justify-center gap-3 w-full text-red-400 font-bold p-4 text-[11px] uppercase tracking-widest transition-colors"
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

function MobileLink({
  href,
  icon,
  label,
  onClick,
  color = "text-tafanu-action",
}: any) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center justify-between w-full text-white bg-white/[0.05] p-5 rounded-2xl font-bold border border-white/5 hover:bg-white/[0.1] transition-all group active:scale-[0.98]"
    >
      <span className="flex items-center gap-4">
        <span className={`${color} transition-transform`}>{icon}</span>
        <span className="text-base tracking-tight">{label}</span>
      </span>
      <ChevronRight size={18} className="text-white/20" />
    </Link>
  );
}
