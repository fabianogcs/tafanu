import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      hasPassword: boolean; // <--- Adicionamos aqui
      phone?: string | null;
      document?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    hasPassword?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    hasPassword?: boolean; // <--- Adicionamos aqui
    phone?: string | null;
    document?: string | null;
  }
}
