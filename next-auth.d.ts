import { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  // Isso define o que aparece em session.user
  interface Session {
    user: {
      id: string;
      role: string;
      phone?: string | null;
      hasPassword?: boolean;
      expiresAt?: Date | null;
    } & DefaultSession["user"];
  }

  // Isso define o que o objeto user tem nos callbacks (authorize, etc)
  interface User {
    role?: string;
    phone?: string | null;
  }
}

declare module "next-auth/jwt" {
  // Isso define o que o objeto token tem dentro do callback jwt
  interface JWT extends DefaultJWT {
    id?: string;
    role?: string;
    phone?: string | null;
    hasPassword?: boolean;
    expiresAt?: Date | null;
  }
}
