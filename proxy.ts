import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// 🛡️ INICIALIZAÇÃO DO RATE LIMIT (Só liga se as chaves existirem no .env)
let ratelimit: Ratelimit | null = null;
if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  // Permite 30 requisições por minuto por IP (Seguro e não atrapalha usuários reais)
  ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
  });
}

const { auth } = NextAuth(authConfig);

// 🚀 Transformamos a função em 'async' para poder "esperar" a verificação do Upstash
export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const pathname = nextUrl.pathname;

  // =====================================================================
  // 🛡️ O LEÃO DE CHÁCARA: RATE LIMITING (Proteção Anti-DDoS e Força Bruta)
  // =====================================================================
  if (
    ratelimit &&
    (pathname.startsWith("/api/webhook") || pathname.startsWith("/api/auth"))
  ) {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      // Em vez da tela branca, joga o usuário de volta pro login com um erro!
      return NextResponse.redirect(
        new URL("/login?error=AccessDenied", nextUrl),
      );
    }
  }

  // =====================================================================
  // 🚧 TRAVA GERAL DE MANUTENÇÃO (A PRIMEIRA COISA A SER CHECADA)
  // =====================================================================
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

  // ... (A PARTIR DAQUI O SEU CÓDIGO CONTINUA EXATAMENTE IGUAL)

  // Se a manutenção estiver LIGADA, e a pessoa NÃO estiver na página de manutenção,
  // e NÃO for uma rota do sistema (api, arquivos do next), redireciona ela!
  if (
    isMaintenanceMode &&
    !pathname.startsWith("/manutencao") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    pathname !== "/favicon.ico" &&
    pathname !== "/sw.js" && // 🚀 DEIXA O SERVICE WORKER PASSAR
    pathname !== "/manifest.json" // 🚀 DEIXA O MANIFESTO PASSAR
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
    pathname.startsWith("/manutencao") || // 🚀 O FIM DO LOOP INFINITO: Manutenção agora é pública!
    pathname.startsWith("/login") ||
    pathname.startsWith("/esqueci-senha") ||
    pathname.startsWith("/nova-senha") ||
    pathname.startsWith("/verificar-email") ||
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
    const donoEmail = process.env.ADMIN_EMAIL?.toLowerCase() || "";
    const isDono = emailSessao === donoEmail;

    // 🚀 O SEGREDO: Delegamos a segurança real para as páginas (Server Components)
    if (
      pathname === "/dashboard" ||
      pathname.startsWith("/dashboard/editar") ||
      pathname.startsWith("/dashboard/perfil") ||
      pathname.startsWith("/dashboard/novo") ||
      pathname.startsWith("/dashboard/funil") // 🚀 FUNIL ADICIONADO AQUI NA LISTA VIP!
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
    const donoEmail = process.env.ADMIN_EMAIL?.toLowerCase() || "";

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
