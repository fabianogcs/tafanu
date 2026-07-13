import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// 🚀 AQUI: Criamos espaços na memória para DOIS Leões de Chácara
let generalRatelimit: Ratelimit | null = null;
let uploadRatelimit: Ratelimit | null = null;
let authRatelimit: Ratelimit | null = null;
let searchRatelimit: Ratelimit | null = null;

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
  // 🚀 NOVO LEÃO DE CHÁCARA PARA A BUSCA
  searchRatelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(300, "1 m"), // 300 por minuto! (Amigável para prefetches do Next.js)
    prefix: "ratelimit_search",
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

  // 🚀 CFO & UX FIX: RASTREAMENTO CIRÚRGICO DE AFILIADOS NA BORDA!
  // Capta a indicação antes mesmo do navegador desenhar a tela, com 0% de chance de falha.
  const refCode = nextUrl.searchParams.get("ref");
  if (refCode) {
    const cleanCode = refCode.trim().toLowerCase();
    // Prepara a resposta (deixando o tráfego seguir normalmente)
    const response = NextResponse.next();

    // 🛡️ Grava o cookie na hora! Duração: 7 dias (604800 segundos)
    response.cookies.set("tafanu_ref", cleanCode, {
      maxAge: 604800,
      httpOnly: true, // Bloqueia leitura por scripts maliciosos na tela
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Vital para links vindos de redes sociais
      path: "/",
    });

    // Remove o ?ref= da URL na barra do navegador do cliente para ficar limpo e elegante!
    const cleanUrl = new URL(nextUrl.pathname, nextUrl.origin);

    // 🚀 A MÁGICA: Redireciona imediatamente para a mesma tela, sem o "ref",
    // mas com o cookie enfiado goela abaixo no navegador. É instantâneo!
    const redirectResponse = NextResponse.redirect(cleanUrl);

    // Copiamos o cookie recém-criado para o redirecionamento
    redirectResponse.cookies.set("tafanu_ref", cleanCode, {
      maxAge: 604800,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return redirectResponse;
  }
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

      // 🚀 A MÁGICA: Aplicamos o Leão mais leve (searchRatelimit) na rota de Busca!
      const activeRatelimit = isUploadRoute
        ? uploadRatelimit
        : isSearchRoute
          ? searchRatelimit // 🚀 Atribui a regra de 300/minuto
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

  // 🛡️ WHITE HAT & CTO FIX: Proteção dos Crons na Borda!
  if (pathname.startsWith("/api/cron")) {
    // 1. Aplica rate limit para impedir flood de requisições gastando Vercel Serverless
    if (generalRatelimit) {
      const ip = (req as any).ip ?? req.headers.get("x-real-ip") ?? "127.0.0.1";
      const { success } = await generalRatelimit.limit(`cron_${ip}`);
      if (!success)
        return new NextResponse("Rate Limit Exceeded", { status: 429 });
    }

    // 2. Trava na borda: Se não tiver o header Authorization com o segredo da Vercel, nem aciona o backend!
    const authHeader = req.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized Edge", { status: 401 });
    }
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
      // 🛡️ WHITE HAT FIX: Análise rigorosa do Hostname contra Phishing (Open Redirect)
      let safeCallback = "/dashboard";
      const isRelative =
        callback.startsWith("/") &&
        !callback.startsWith("//") &&
        !callback.startsWith("/\\");

      let isOfficialDomain = false;
      try {
        const parsedUrl = new URL(callback);
        isOfficialDomain =
          parsedUrl.hostname === "tafanu.com.br" ||
          parsedUrl.hostname.endsWith(".tafanu.com.br") ||
          (process.env.NODE_ENV === "development" &&
            parsedUrl.hostname === "localhost");
      } catch (e) {
        isOfficialDomain = false;
      }

      if (isRelative || isOfficialDomain) {
        safeCallback = callback;
      }
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

    // 🚀 BLINDAGEM ANTI-LOOP FANTASMA:
    // Adicionamos as rotas "/editar" e "/novo" na lista de liberação da borda (Edge).
    // A segurança e a checagem de pagamento/recorrência serão feitas em tempo real no servidor (Node.js)
    // pelas Server Actions e pelas páginas, eliminando o atraso de sincronização de cookies do navegador!
    if (
      pathname === "/dashboard" ||
      pathname.startsWith("/dashboard/favoritos") ||
      pathname.startsWith("/dashboard/parceiro") ||
      pathname.startsWith("/dashboard/perfil") ||
      pathname.startsWith("/dashboard/funil") ||
      pathname.startsWith("/dashboard/editar") ||
      pathname.startsWith("/dashboard/novo")
    ) {
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
