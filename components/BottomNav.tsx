"use client";

import { Home, Search, Heart, User, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role || "VISITANTE";
  const isLoggedIn = !!session?.user;

  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard"))
    return null;

  const isActive = (path: string) => pathname === path;

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-[80] w-full bg-white/95 backdrop-blur-2xl border-t border-slate-200 flex justify-around items-center px-4 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] transition-all"
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom), 10px)",
        paddingTop: "10px",
        minHeight: "64px",
      }}
    >
      <Link
        href="/"
        className="flex flex-col items-center justify-center flex-1 py-1 group"
      >
        <Home
          size={20}
          className={`mb-1 transition-all duration-300 ${isActive("/") ? "text-tafanu-action scale-110 drop-shadow-[0_0_8px_rgba(0,168,107,0.3)]" : "text-slate-400 group-hover:text-slate-600"}`}
        />
        <span
          className={`text-[10px] font-extrabold tracking-wider uppercase transition-colors ${isActive("/") ? "text-tafanu-action" : "text-slate-400"}`}
        >
          Início
        </span>
      </Link>

      <Link
        href="/busca"
        className="flex flex-col items-center justify-center flex-1 py-1 group"
      >
        <Search
          size={20}
          className={`mb-1 transition-all duration-300 ${isActive("/busca") ? "text-tafanu-action scale-110 drop-shadow-[0_0_8px_rgba(0,168,107,0.3)]" : "text-slate-400 group-hover:text-slate-600"}`}
        />
        <span
          className={`text-[10px] font-extrabold tracking-wider uppercase transition-colors ${isActive("/busca") ? "text-tafanu-action" : "text-slate-400"}`}
        >
          Explorar
        </span>
      </Link>

      <Link
        href={isLoggedIn ? "/dashboard/favoritos" : "/login"}
        className="flex flex-col items-center justify-center flex-1 py-1 group"
      >
        <Heart
          size={20}
          className={`mb-1 transition-all duration-300 ${isActive("/dashboard/favoritos") ? "text-rose-500 scale-110 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)] fill-rose-500/10" : "text-slate-400 group-hover:text-slate-600"}`}
        />
        <span
          className={`text-[10px] font-extrabold tracking-wider uppercase transition-colors ${isActive("/dashboard/favoritos") ? "text-rose-500" : "text-slate-400"}`}
        >
          Salvos
        </span>
      </Link>

      {role === "ASSINANTE" || role === "AFILIADO" ? (
        <Link
          href="/dashboard"
          className="flex flex-col items-center justify-center flex-1 py-1 group relative"
        >
          <div className="bg-tafanu-action text-white p-2 rounded-xl shadow-[0_4px_15px_rgba(0,168,107,0.3)] mb-0.5 group-hover:scale-105 transition-transform">
            <LayoutDashboard size={18} />
          </div>
          <span className="text-[10px] font-extrabold tracking-wider uppercase text-tafanu-action">
            Painel
          </span>
        </Link>
      ) : (
        <Link
          href={isLoggedIn ? "/dashboard/perfil" : "/login"}
          className="flex flex-col items-center justify-center flex-1 py-1 group"
        >
          <User
            size={20}
            className={`mb-1 transition-all duration-300 ${isActive("/dashboard/perfil") || isActive("/login") ? "text-tafanu-action scale-110 drop-shadow-[0_0_8px_rgba(0,168,107,0.3)]" : "text-slate-400 group-hover:text-slate-600"}`}
          />
          <span
            className={`text-[10px] font-extrabold tracking-wider uppercase transition-colors ${isActive("/dashboard/perfil") || isActive("/login") ? "text-tafanu-action" : "text-slate-400"}`}
          >
            {isLoggedIn ? "Perfil" : "Entrar"}
          </span>
        </Link>
      )}
    </div>
  );
}
