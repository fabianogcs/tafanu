import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import Credentials from "next-auth/providers/credentials";
import authConfig from "./auth.config";
import { compareSync } from "bcrypt-ts";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // 1. Tiramos o "as any" aqui (O PrismaAdapter agora será reconhecido)
  adapter: PrismaAdapter(db),
  trustHost: true,
  session: { strategy: "jwt" },
  // Removemos o spread global ...authConfig daqui
  providers: [
    ...authConfig.providers, // Trazemos o Google do auth.config.ts
    Credentials({
      name: "Credentials",
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

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
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) return { ...token, ...session };

      if (user) {
        token.id = user.id;
        token.role = user.role;
      } else if (!token.id && token.sub) {
        token.id = token.sub;
      }

      if (token.id && process.env.NEXT_RUNTIME !== "edge") {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
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
        session.user.id = (token.id || token.sub) as string;
        session.user.role = token.role as string;

        // 2. Apagamos todos os @ts-ignore daqui para baixo:
        session.user.phone = token.phone;
        session.user.hasPassword = token.hasPassword;
        session.user.expiresAt = token.expiresAt;
      }
      return session;
    },
  },

  events: {
    async createUser({ user }) {
      try {
        const cookieStore = await cookies();
        // 🚀 Mudando para o nome padronizado
        const referredBy = cookieStore.get("tafanu_ref")?.value;

        if (referredBy && user.id) {
          const affiliate = await db.user.findFirst({
            where: {
              referralCode: { equals: referredBy, mode: "insensitive" },
            },
            select: { id: true, name: true },
          });

          if (affiliate) {
            await db.user.update({
              where: { id: user.id },
              data: { affiliateId: affiliate.id },
            });
            console.log(`✅ Google User vinculado a: ${affiliate.name}`);
          }
        }
      } catch (error) {
        console.error("Erro no vínculo Google:", error);
      }
    },

    async linkAccount({ user }) {
      if (user.id) {
        await db.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
      }
    },

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

    async signOut() {
      const cookieStore = await cookies();
      cookieStore.delete("userId");
      cookieStore.delete("userRole");
    },
  },
});
