import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimit: Ratelimit | null = null;
if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
  });
}

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const pathname = nextUrl.pathname;

  // =====================================================================
  // 🛡️ O LEÃO DE CHÁCARA: RATE LIMITING REFORÇADO E AMPLIADO
  // =====================================================================
  if (ratelimit) {
    // O Webhook do MP já tem HMAC, não precisa de Upstash.
    const isApiAuthRoute = pathname.startsWith("/api/auth");
    const isUploadRoute = pathname.startsWith("/api/uploadthing"); // 🚀 NOVO ESCUDO AQUI
    const isSearchRoute = pathname.startsWith("/busca");
    const isSensitivePage =
      pathname.startsWith("/login") ||
      pathname.startsWith("/esqueci-senha") ||
      pathname.startsWith("/nova-senha");

    // Abrangemos o escudo para proteger rotas de custo (Upload e Busca) e senhas (Brute Force)
    if (isApiAuthRoute || isUploadRoute || isSearchRoute || isSensitivePage) { // 🚀 UPLOAD ADICIONADO NO IF
      const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
      const { success } = await ratelimit.limit(ip);

    if (!success) {
        // Se bater o limite nas APIs JSON (UploadThing ou Auth)
        if (isApiAuthRoute || isUploadRoute) {
          return new NextResponse(
            JSON.stringify({ error: "Limite de tentativas excedido. Aguarde 1 minuto." }),
            { status: 429, headers: { "Content-Type": "application/json" } },
          );
        }
        
        // Se bater o limite nas páginas visuais, manda pra uma URL com parâmetro de erro para o frontend exibir o Toast
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
    pathname.startsWith("/api/webhook") || // 🚀 Webhook permanece público aqui para o Next.js não pedir login
    pathname.startsWith("/api/uploadthing") ||
    pathname.startsWith("/_next") ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    isCheckoutRoute;

  if (isLoggedIn && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  if (isLoggedIn && (pathname.startsWith("/anunciar") || isCheckoutRoute)) {
    if (userRole === "ADMIN" || userRole === "AFILIADO") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
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

    // 1. Regra de Negócio: Quem é considerado "PRO"?
    const isPro = isAssinante || isAfiliado || isAdmin || isDono;

    // 2. Rotas liberadas para TODOS (inclusive Visitantes logados)
    if (
      pathname === "/dashboard" || // A tela inicial do dash pode ser livre
      pathname.startsWith("/dashboard/favoritos") || // Todo mundo pode salvar lojas
      pathname.startsWith("/dashboard/parceiro") || // A página para se tornar afiliado
      pathname.startsWith("/dashboard/perfil") // 🚀 LIBERADO: Visitantes podem editar dados e quebra o loop do assinante
    ) {
      return NextResponse.next();
    }

    // 3. Rotas Protegidas (Exclusivas para PRO)
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

    // Fallback: se for uma sub-rota do dashboard não mapeada acima e não for PRO
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
