import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// 🚀 AQUI: Criamos espaços na memória para DOIS Leões de Chácara
let generalRatelimit: Ratelimit | null = null;
let uploadRatelimit: Ratelimit | null = null;
let authRatelimit: Ratelimit | null = null;

if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  generalRatelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    prefix: "ratelimit_general",
  });

  uploadRatelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    prefix: "ratelimit_upload",
  });

  authRatelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    prefix: "ratelimit_strict_auth",
  });
}

// 🚀 O MOTOR OFICIAL DO NEXTAUTH V5 PARA O MIDDLEWARE
const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const pathname = nextUrl.pathname;

  // =====================================================================
  // 🛡️ O LEÃO DE CHÁCARA: RATE LIMITING DE DUPLA CAMADA
  // =====================================================================
  if (generalRatelimit && uploadRatelimit && authRatelimit) {
    const isApiAuthRoute = pathname.startsWith("/api/auth");
    const isUploadRoute = pathname.startsWith("/api/uploadthing");
    const isSearchRoute = pathname.startsWith("/busca");
    const isSensitivePage =
      pathname.startsWith("/login") ||
      pathname.startsWith("/esqueci-senha") ||
      pathname.startsWith("/nova-senha") ||
      pathname.startsWith("/api/cron");

    if (isApiAuthRoute || isUploadRoute || isSearchRoute || isSensitivePage) {
      // 🚀 HACKER FIX 1: req.ip é validado nativamente pela Vercel.
      // Usamos (req as any) só para o TypeScript parar de chorar, já que o Auth.js esqueceu de tipar isso.
      const ip = (req as any).ip ?? req.headers.get("x-real-ip") ?? "127.0.0.1";

      // 🚀 A MÁGICA DE TRIPLA CAMADA BLINDADA: Só pune severamente tentativas de envio (POST)
      const isPostRequest = req.method === "POST";
      const isCreationRoute = pathname.startsWith("/dashboard/novo");

      const activeRatelimit = isUploadRoute
        ? uploadRatelimit
        : (isSensitivePage || isApiAuthRoute || isCreationRoute) &&
            isPostRequest
          ? authRatelimit
          : generalRatelimit;

      if (!activeRatelimit) {
        return NextResponse.next();
      }

      const { success } = await activeRatelimit.limit(ip);

      if (!success) {
        // 🚀 HACKER FIX 2: Identificamos se é uma Server Action para não quebrar a tela do usuário com Redirects invisíveis.
        const isServerAction = req.headers.get("next-action");

        if (isApiAuthRoute || isUploadRoute || isServerAction) {
          return new NextResponse(
            JSON.stringify({
              error:
                "Limite de tentativas excedido. Por favor, aguarde 1 minuto para evitar sobrecarga no sistema.",
            }),
            { status: 429, headers: { "Content-Type": "application/json" } },
          );
        }

        // Se for navegação de página comum, manda pro login ou busca
        const fallbackUrl = isSearchRoute ? "/busca" : "/login";
        return NextResponse.redirect(
          new URL(`${fallbackUrl}?error=RateLimited`, nextUrl),
        );
      }
    }
  }

  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

  if (
    isMaintenanceMode &&
    !pathname.startsWith("/manutencao") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    pathname !== "/favicon.ico" &&
    pathname !== "/sw.js" &&
    pathname !== "/manifest.json"
  ) {
    return NextResponse.redirect(new URL("/manutencao", nextUrl));
  }

  const user = req.auth?.user as { role?: string } | undefined;
  const userRole = user?.role;

  // 🛡️ PROTEÇÃO DOS CRONS: O Vercel Cron usa Bearer Token, não sessão de usuário.
  // A trava de segurança real (CRON_SECRET) já está dentro da própria rota da API.
  if (pathname.startsWith("/api/cron")) {
    return NextResponse.next();
  }

  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin");
  const isCheckoutRoute = pathname.startsWith("/checkout");

  const isPublicRoute =
    pathname === "/" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/manutencao") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/esqueci-senha") ||
    pathname.startsWith("/nova-senha") ||
    pathname.startsWith("/verificar-email") ||
    pathname.startsWith("/sobre") ||
    pathname.startsWith("/termos") ||
    pathname.startsWith("/privacidade") ||
    pathname.startsWith("/busca") ||
    pathname.startsWith("/site") ||
    pathname.startsWith("/anunciar") ||
    pathname.startsWith("/pedido") || // 🚀 CIRURGIA: Libera a tela de rastreio ao vivo para o cliente!
    pathname.startsWith("/meus-pedidos") || // 🚀 CIRURGIA: Libera o histórico de pedidos!
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/webhook") ||
    pathname.startsWith("/api/uploadthing") ||
    pathname.startsWith("/_next") ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js";

  if (isLoggedIn && pathname.startsWith("/login")) {
    const callback = nextUrl.searchParams.get("callbackUrl");
    const intent = nextUrl.searchParams.get("intent");

    if (callback) {
      // 🛡️ ANTI-OPEN-REDIRECT: Só redireciona para caminhos relativos ou domínio oficial
      const isRelative = callback.startsWith("/") && !callback.startsWith("//");
      const isOfficial =
        callback.startsWith("https://tafanu.com.br") ||
        callback.startsWith("http://localhost:3000");

      const safeCallback = isRelative || isOfficial ? callback : "/dashboard";
      return NextResponse.redirect(new URL(safeCallback, nextUrl));
    }
    if (intent === "assinante") {
      return NextResponse.redirect(new URL("/checkout", nextUrl));
    }

    // Se não tinha destino claro, manda pro painel
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (isLoggedIn && (pathname.startsWith("/anunciar") || isCheckoutRoute)) {
    if (userRole === "ADMIN" || userRole === "AFILIADO") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  if (!isLoggedIn && isCheckoutRoute) {
    return NextResponse.redirect(
      new URL("/login?callbackUrl=/checkout&intent=assinante", nextUrl),
    );
  }

  if (isPublicRoute && !isDashboardRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isDashboardRoute) {
    const isAdmin = userRole === "ADMIN";
    const isAfiliado = userRole === "AFILIADO";
    const isAssinante = userRole === "ASSINANTE";

    const emailSessao = req.auth?.user?.email?.toLowerCase();
    const donoEmail = process.env.ADMIN_EMAIL?.toLowerCase() || "";
    const isDono = emailSessao === donoEmail;

    const isPro = isAssinante || isAfiliado || isAdmin || isDono;

    if (
      pathname === "/dashboard" ||
      pathname.startsWith("/dashboard/favoritos") ||
      pathname.startsWith("/dashboard/parceiro") ||
      pathname.startsWith("/dashboard/perfil") ||
      pathname.startsWith("/dashboard/funil") ||
      pathname.startsWith("/dashboard/pedidos") // 🚀 CIRURGIA: Libera a catraca do middleware! O Banco fará a escolta.
    ) {
      return NextResponse.next();
    }

    if (
      pathname.startsWith("/dashboard/editar") ||
      pathname.startsWith("/dashboard/novo")
    ) {
      if (!isPro) {
        return NextResponse.redirect(new URL("/checkout", nextUrl));
      }
      return NextResponse.next();
    }

    if (!isPro) {
      return NextResponse.redirect(new URL("/checkout", nextUrl));
    }
  }

  if (isAdminRoute) {
    const emailSessao = req.auth?.user?.email?.toLowerCase();
    const donoEmail = process.env.ADMIN_EMAIL?.toLowerCase() || "";

    if (userRole !== "ADMIN" && emailSessao !== donoEmail) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|robots.txt|sitemap.xml|workbox-.*|.*\\.(?:png|jpg|jpeg|svg|gif|ico|webp|avif)).*)",
  ],
};
