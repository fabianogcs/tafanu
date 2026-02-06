import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import Credentials from "next-auth/providers/credentials";
import authConfig from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  trustHost: true,
  session: { strategy: "jwt" },
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Credentials",
      // ... dentro do Credentials ...
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        // 👈 A MÁGICA ESTÁ AQUI: Importamos o bcrypt só agora!
        const { compare } = await import("bcryptjs");

        const isValid = await compare(
          credentials.password as string,
          user.password,
        );

        if (!isValid) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) return { ...token, ...session };
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      // Busca dados extras no banco (telefone, doc) apenas se não for no Edge
      if (token.sub && process.env.NEXT_RUNTIME !== "edge") {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.sub },
            select: { role: true, phone: true, document: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.phone = dbUser.phone;
            token.document = dbUser.document;
          }
        } catch (e) {
          /* ignore */
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        // @ts-ignore
        session.user.phone = token.phone;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      const cookieStore = await cookies();
      if (user.id) {
        cookieStore.set("userId", user.id, {
          httpOnly: true,
          maxAge: 604800,
          path: "/",
        });
      }
      const userRole = user.role || "VISITANTE";
      cookieStore.set("userRole", userRole, {
        httpOnly: true,
        maxAge: 604800,
        path: "/",
      });
    },
  },
});
