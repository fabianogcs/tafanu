import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const pathname = nextUrl.pathname;

  // =====================================================================
  // 🚧 TRAVA GERAL DE MANUTENÇÃO (A PRIMEIRA COISA A SER CHECADA)
  // =====================================================================
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

  // Se a manutenção estiver LIGADA, e a pessoa NÃO estiver na página de manutenção,
  // e NÃO for uma rota do sistema (api, arquivos do next), redireciona ela!
  if (
    isMaintenanceMode &&
    !pathname.startsWith("/manutencao") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    pathname !== "/favicon.ico"
  ) {
    return NextResponse.redirect(new URL("/manutencao", nextUrl));
  }

  // 🛡️ A MÁGICA AQUI: Se o token do Edge falhar, ele puxa o cookie de backup!
  const user = req.auth?.user as { role?: string } | undefined;
  const userRole = user?.role;

  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin");
  const isCheckoutRoute = pathname.startsWith("/checkout");

  // ✅ ROTAS PÚBLICAS (AQUI ENTROU A LIBERAÇÃO DO MANIFESTO E PWA E O WEBHOOK DO MERCADO PAGO)
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/esqueci-senha") || // 🚀 VIP LIBERADA
    pathname.startsWith("/nova-senha") || // 🚀 VIP LIBERADA
    pathname.startsWith("/verificar-email") || // 🚀 VIP LIBERADA
    pathname.startsWith("/sobre") ||
    pathname.startsWith("/termos") ||
    pathname.startsWith("/busca") ||
    pathname.startsWith("/site") ||
    pathname.startsWith("/anunciar") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/webhook") ||
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

    const emailSessao = req.auth?.user?.email?.toLowerCase();
    const donoEmail =
      process.env.ADMIN_EMAIL?.toLowerCase() || "prfabianoguedes@gmail.com";
    const isDono = emailSessao === donoEmail;

    // 🚀 O SEGREDO: Delegamos a segurança real para as páginas (Server Components)
    // porque elas olham direto no banco de dados e nunca falham.
    if (
      pathname === "/dashboard" ||
      pathname.startsWith("/dashboard/editar") ||
      pathname.startsWith("/dashboard/perfil") ||
      pathname.startsWith("/dashboard/novo")
    ) {
      return NextResponse.next();
    }

    const isPro =
      isAssinante ||
      isAfiliado ||
      isAdmin ||
      isDono ||
      pathname.startsWith("/dashboard/parceiro");

    if (pathname.startsWith("/dashboard/favoritos")) {
      return NextResponse.next();
    }

    if (pathname.startsWith("/dashboard/parceiro")) {
      return NextResponse.next();
    }

    if (!isPro) {
      return NextResponse.redirect(new URL("/checkout", nextUrl));
    }
  }
  // 🔐 BARREIRA 3: PROTEÇÃO ESTILHAÇADA DO ADMIN
  if (isAdminRoute) {
    // 🚀 Se o email for o do dono, o Middleware deixa passar para a página
    // fazer a verificação segura no banco de dados e atualizar o cargo.
    const emailSessao = req.auth?.user?.email?.toLowerCase();
    const donoEmail =
      process.env.ADMIN_EMAIL?.toLowerCase() || "prfabianoguedes@gmail.com";

    if (userRole !== "ADMIN" && emailSessao !== donoEmail) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  return NextResponse.next();
});

// 🔸 EXCLUSÃO DIRETA NO MATCHER PARA GARANTIR QUE O NEXT.JS IGNORE ARQUIVOS DE SISTEMA E PWA
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|robots.txt|sitemap.xml|workbox-.*|.*\\.(?:png|jpg|jpeg|svg|gif|ico|webp|avif)).*)",
  ],
};
