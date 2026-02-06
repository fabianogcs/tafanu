import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";

// Inicializa o NextAuth só com a config leve (sem bcrypt/prisma)
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;
  const pathname = nextUrl.pathname;

  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/login" ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  if (
    !isLoggedIn &&
    (pathname.startsWith("/dashboard") || pathname.startsWith("/admin"))
  ) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // @ts-ignore
  if (pathname.startsWith("/admin") && user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|public).*)"],
};
