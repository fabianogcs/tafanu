import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // 🛡️ A MÁGICA AQUI: Se o token do Edge falhar, ele puxa o cookie de backup!
  const user = req.auth?.user as { role?: string } | undefined;
  const userRole = user?.role || req.cookies.get("userRole")?.value;
  const pathname = nextUrl.pathname;

  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin");
  const isCheckoutRoute = pathname.startsWith("/checkout");

  // ✅ ROTAS PÚBLICAS (AQUI ENTROU A LIBERAÇÃO DO MANIFESTO E PWA)
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/sobre") ||
    pathname.startsWith("/termos") ||
    pathname.startsWith("/busca") ||
    pathname.startsWith("/site") ||
    pathname.startsWith("/anunciar") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    isCheckoutRoute;

  // 🔁 Usuário logado tentando ir pro login volta pra home
  if (isLoggedIn && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // 🚫 NOVA BARREIRA: Admin e Afiliado não podem acessar Anunciar nem Checkout
  if (isLoggedIn && (pathname.startsWith("/anunciar") || isCheckoutRoute)) {
    if (userRole === "ADMIN" || userRole === "AFILIADO") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  if (isPublicRoute && !isDashboardRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  // 🔒 BARREIRA 1: Tudo abaixo exige Login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // 🔥 BARREIRA 2: MATRIZ DE AUTORIZAÇÃO DO DASHBOARD
  if (isDashboardRoute) {
    const isAdmin = userRole === "ADMIN";
    const isAfiliado = userRole === "AFILIADO";
    const isAssinante = userRole === "ASSINANTE";

    // No Middleware, confiamos na flag do cargo. A trava de data de validade
    // deve ser conferida dentro do Layout do Dashboard para não quebrar no Edge.
    const isPro = isAssinante || isAfiliado || isAdmin;

    // Nível A: Visitante Logado, Assinante, Afiliado e Admin
    if (pathname.startsWith("/dashboard/favoritos")) {
      return NextResponse.next();
    }

    // Nível B: Apenas Afiliado e Admin
    if (pathname.startsWith("/dashboard/parceiro")) {
      if (!isAfiliado && !isAdmin) {
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
      }
      return NextResponse.next();
    }

    // Nível C: Restante do Dashboard. Requer status PRO.
    if (!isPro) {
      return NextResponse.redirect(new URL("/checkout", nextUrl));
    }
  }

  // 🔐 BARREIRA 3: PROTEÇÃO ESTILHAÇADA DO ADMIN
  if (isAdminRoute) {
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  return NextResponse.next();
});

// 🔸 EXCLUSÃO DIRETA NO MATCHER PARA GARANTIR QUE O NEXT.JS IGNORE ARQUIVOS DE SISTEMA E PWA
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|manifest.json|sw.js|workbox-.*).*)",
  ],
};
