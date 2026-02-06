import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { compare } from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
      profile(profile) {
        const isAdmin = profile.email === "prfabianoguedes@gmail.com";
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: isAdmin ? "ADMIN" : "VISITANTE",
        };
      },
    }),

    Credentials({
      name: "Credentials",
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

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
          hasPassword: true,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }

      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      // Se já tivermos os dados no token, não precisamos buscar de novo no Edge
      if (token.sub) {
        // 🛑 A CURA DO ERRO ESTÁ AQUI:
        // Se estivermos no ambiente "Edge" (Middleware), retornamos o token sem tocar no banco.
        if (process.env.NEXT_RUNTIME === "edge") return token;

        try {
          // Importação dinâmica para ambiente Node
          const { db } = await import("@/lib/db");

          const dbUser = await db.user.findUnique({
            where: { id: token.sub },
            select: { role: true, phone: true, document: true, password: true },
          });

          if (dbUser) {
            token.role = dbUser.role || "VISITANTE";
            token.phone = dbUser.phone;
            token.document = dbUser.document;
            // @ts-ignore
            token.hasPassword = !!dbUser.password;
          }
        } catch (error) {
          // Silenciosamente ignora erros de conexão no JWT para não travar o app
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;

        // Passamos os dados extras para o front
        // @ts-ignore
        session.user.phone = token.phone;
        // @ts-ignore
        session.user.document = token.document;
        // @ts-ignore
        session.user.hasPassword = token.hasPassword; // Agora isso vai funcionar!
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      const cookieStore = await cookies();
      cookieStore.delete("userId");
      cookieStore.delete("userRole");

      if (user.id) {
        cookieStore.set("userId", user.id, {
          httpOnly: true,
          maxAge: 604800,
          path: "/",
        });
      }
      // @ts-ignore
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
