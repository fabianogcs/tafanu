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
      pathname.startsWith("/nova-senha");

    if (isApiAuthRoute || isUploadRoute || isSearchRoute || isSensitivePage) {
      // 🚀 CIRURGIA CORRIGIDA: Lemos o IP sanitizado pela infraestrutura da Vercel, sem irritar o TypeScript
      const forwardedFor = req.headers.get("x-forwarded-for");
      const ip =
        req.headers.get("x-real-ip") ??
        (forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1");

      // 🚀 A MÁGICA DE TRIPLA CAMADA BLINDADA: Só pune severamente tentativas de envio (POST)
      const isPostRequest = req.method === "POST";

      const activeRatelimit = isUploadRoute
        ? uploadRatelimit
        : (isSensitivePage || isApiAuthRoute) && isPostRequest
          ? authRatelimit // ⬅️ O limite de 5 por minuto só esmaga envios de formulários/senhas
          : generalRatelimit; // Carregar páginas (GET) ou checar sessão continua livre com 100 por minuto

      // 🛡️ TRAVA DO TYPESCRIPT: Se por algum motivo de rede o segurança estiver vazio, deixa o usuário passar para o site não cair.
      if (!activeRatelimit) {
        return NextResponse.next();
      }

      const { success } = await activeRatelimit.limit(ip);

      if (!success) {
        if (isApiAuthRoute || isUploadRoute) {
          return new NextResponse(
            JSON.stringify({
              error: isUploadRoute
                ? "Limite de envios de arquivos excedido. Aguarde 1 minuto."
                : "Limite de tentativas excedido. Aguarde 1 minuto.",
            }),
            { status: 429, headers: { "Content-Type": "application/json" } },
          );
        }

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
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/webhook") ||
    pathname.startsWith("/api/uploadthing") ||
    pathname.startsWith("/_next") ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js";

  // 🚀 VACINA DO LOOP: Se um usuário logado cair no /login, respeita o destino dele!
  if (isLoggedIn && pathname.startsWith("/login")) {
    const callback = nextUrl.searchParams.get("callbackUrl");
    const intent = nextUrl.searchParams.get("intent");

    // Se ele queria ir pro checkout, manda pro checkout
    if (callback) {
      return NextResponse.redirect(new URL(callback, nextUrl));
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
      pathname.startsWith("/dashboard/perfil")
    ) {
      return NextResponse.next();
    }

    if (
      pathname.startsWith("/dashboard/editar") ||
      pathname.startsWith("/dashboard/novo") ||
      pathname.startsWith("/dashboard/funil")
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
