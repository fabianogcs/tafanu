import { auth } from "./auth"; // 👈 VOLTAMOS A IMPORTAR DAQUI
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;
  const pathname = nextUrl.pathname;

  // 1. Caminhos que NUNCA devem ser bloqueados (Públicos e arquivos)
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/login" ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // 2. Se NÃO está logado e tenta entrar no Dashboard ou Admin -> Login
  if (
    !isLoggedIn &&
    (pathname.startsWith("/dashboard") || pathname.startsWith("/admin"))
  ) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // 3. Proteção básica de ADMIN
  // @ts-ignore
  if (pathname.startsWith("/admin") && user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // 4. Se está logado e tenta ir para o login, manda para o home ou dashboard
  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|public).*)"],
};
