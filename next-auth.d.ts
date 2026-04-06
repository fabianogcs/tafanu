import { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  // 1. Define o que aparece em session.user
  interface Session {
    user: {
      id: string;
      role?: string;
      phone?: string | null;
      document?: string | null; // ✅ Adicionado: Agora o TS conhece o documento
      hasPassword?: boolean;
      // 🛡️ expiresAt REMOVIDO: Ele não mora mais no Usuário
    } & DefaultSession["user"];
  }

  // 2. Define o que o objeto user tem nos callbacks (authorize, etc)
  interface User {
    role?: string;
    phone?: string | null;
    document?: string | null; // ✅ Adicionado
  }
}

declare module "next-auth/jwt" {
  // 3. Define o que o objeto token tem dentro do callback jwt
  interface JWT extends DefaultJWT {
    id?: string;
    role?: string;
    phone?: string | null;
    document?: string | null; // ✅ Adicionado
    hasPassword?: boolean;
    // 🛡️ expiresAt REMOVIDO
  }
}
