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
              // 🛡️ AQUI: expiresAt REMOVIDO cirurgicamente
            },
          });

          if (dbUser) {
            token.role = dbUser.role;
            token.phone = dbUser.phone;
            token.document = dbUser.document;
            token.hasPassword = !!dbUser.password;
            // 🛡️ AQUI: token.expiresAt REMOVIDO
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

        session.user.phone = token.phone as string;
        session.user.hasPassword = token.hasPassword as boolean;
        session.user.document = token.document as string;

        // 🛡️ AQUI: session.user.expiresAt REMOVIDO
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
  },
});
