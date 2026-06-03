import { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  // Define o que aparece na sessão rodando no lado do cliente
  interface Session {
    user: {
      id: string;
      role: string;
      hasPassword?: boolean;
      phone?: string | null;
      document?: string | null;
    } & DefaultSession["user"];
  }

  // Define o que é retornado nas funções authorize (Credentials) e profile (Google)
  interface User {
    role: string;
    hasPassword?: boolean;
    phone?: string | null;
    document?: string | null;
  }
}

declare module "next-auth/jwt" {
  // Define o que trafega dentro do token JWT criptografado
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
    hasPassword?: boolean;
    phone?: string | null;
    document?: string | null;
  }
}
