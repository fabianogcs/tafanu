import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import Credentials from "next-auth/providers/credentials";
import authConfig from "./auth.config";
import { compareSync } from "bcrypt-ts"; // 👈 NOVA BIBLIOTECA COMPATÍVEL!

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db) as any,
  trustHost: true,
  session: { strategy: "jwt" },
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Credentials",
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        // Agora usamos o compareSync da bcrypt-ts que não trava o Edge!
        const isValid = compareSync(
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
  // ... mantenha seus callbacks e events exatamente como estão agora ...
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) return { ...token, ...session };

      // 1. Garantia: Se for o primeiro login, user existe.
      // Se não, usamos o sub (que é o ID padrão que o NextAuth guarda)
      if (user) {
        token.id = user.id;
        token.role = user.role;
      } else if (!token.id && token.sub) {
        token.id = token.sub; // 👈 ISSO AQUI SALVA O ID NAS NAVEGAÇÕES
      }

      // 🛑 RECUPERANDO DADOS EXTRAS DO BANCO
      if (token.id && process.env.NEXT_RUNTIME !== "edge") {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            // 👇 AQUI A MÁGICA: Adicionamos o expiresAt na busca!
            select: {
              role: true,
              phone: true,
              document: true,
              password: true,
              expiresAt: true,
            },
          });

          if (dbUser) {
            token.role = dbUser.role;
            token.phone = dbUser.phone;
            token.document = dbUser.document;
            token.hasPassword = !!dbUser.password;
            // 👇 Salvamos a data no token
            token.expiresAt = dbUser.expiresAt;
          }
        } catch (e) {
          /* ignore */
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        // Agora o token.id terá valor sempre!
        session.user.id = (token.id || token.sub) as string;
        session.user.role = token.role as string;
        // @ts-ignore
        session.user.phone = token.phone;
        // @ts-ignore
        session.user.hasPassword = token.hasPassword;
        // 👇 FINALMENTE: Repassamos a data para a Sessão (Frontend)
        // @ts-ignore
        session.user.expiresAt = token.expiresAt;
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
    // 🛑 ADICIONANDO O LOGOUT PARA LIMPAR COOKIES
    async signOut() {
      const cookieStore = await cookies();
      cookieStore.delete("userId");
      cookieStore.delete("userRole");
    },
  },
});
