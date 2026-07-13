import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import Credentials from "next-auth/providers/credentials";
import authConfig from "./auth.config";
import { compare } from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // 1. Tiramos o "as any" aqui (O PrismaAdapter agora será reconhecido)
  adapter: PrismaAdapter(db),
  trustHost: true,
  session: { strategy: "jwt" },
  // Removemos o spread global ...authConfig daqui
  providers: [
    ...authConfig.providers, // Trazemos o Google do auth.config.ts
    {
      id: "magic-login",
      name: "Magic Login",
      type: "credentials",
      credentials: { token: { type: "text" } },
      async authorize(credentials) {
        if (!credentials?.token) return null;

        // Verifica se o token existe, se o usuário está ativo e se não expirou
        const tokenValido = await db.checkoutToken.findUnique({
          where: { id: credentials.token as string },
          include: { user: true },
        });

        if (!tokenValido || new Date() > tokenValido.expiresAt) {
          return null; // Forjado ou vencido? Corta na alfândega!
        }

        const user = tokenValido.user;

        // CONSUMO ATÔMICO: Destrói o token após o primeiro uso (Impede reutilização do link)
        await db.checkoutToken.delete({ where: { id: tokenValido.id } });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    },
    Credentials({
      name: "Credentials",
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        // 🚀 TRAVA CRÍTICA DA AUDITORIA: Bloqueia na raiz da API!
        if (user.isBanned) return null;

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
    // 🛡️ ADICIONE ESTE BLOCO AQUI (LOGO NO INÍCIO DOS CALLBACKS):
    async signIn({ user, account }) {
      // Se for login por credenciais, o dbUser já foi checado na Action,
      // mas para Google/Outros, precisamos checar o banco aqui:
      if (account?.provider !== "credentials") {
        const dbUser = await db.user.findUnique({
          where: { email: user.email as string },
          select: { isBanned: true },
        });

        if (dbUser?.isBanned) return false; // Bloqueia o login na hora
      }
      return true;
    },
    // ... seu código do jwt
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) return { ...token, ...session };

      if (user) {
        token.id = user.id as string;
        // 🚀 BISTURI 1: O Google não apita mais aqui!
        // Removemos a linha "token.role = user.role" propositalmente.
        // O cargo agora será buscado exclusivamente do banco de dados abaixo.
      } else if (!token.id && token.sub) {
        token.id = token.sub;
      }

      if (token.id && process.env.NEXT_RUNTIME !== "edge") {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: {
              role: true,
              password: true,
              isBanned: true, // 🚀 BISTURI 2: Trazemos o status de banimento na leitura
            },
          });

          if (dbUser) {
            // 🚀 BISTURI 3: A Bomba Eletromagnética (Crachá Fantasma - Banimento)
            if (dbUser.isBanned) {
              token.exp = 0;
              return token;
            }

            // 🚀 BISTURI 4: O Exorcista de Sessões (Trava de Senha Alterada)
            // Pega os 10 primeiros caracteres do hash da senha atual no banco (se existir)
            const currentPassFragment = dbUser.password
              ? dbUser.password.slice(0, 10)
              : "";

            // Se o token já tem um fragmento gravado, e ele for DIFERENTE do banco agora,
            // significa que a senha foi trocada. Derruba a sessão instantaneamente!
            if (
              token.passFragment !== undefined &&
              token.passFragment !== currentPassFragment
            ) {
              token.exp = 0;
              return token;
            }

            // Salva o fragmento atual no token para as próximas checagens (não expõe a senha real)
            token.passFragment = currentPassFragment;

            // O cargo verdadeiro e soberano vindo do Banco de Dados
            token.role = dbUser.role;
            token.hasPassword = !!dbUser.password;
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
        session.user.hasPassword = token.hasPassword as boolean;

        // 🛡️ AQUI: session.user.expiresAt, phone e document REMOVIDOS para proteção LGPD
      }
      return session;
    },
  },

  events: {
    // 🚀 NOVO: GRAVADOR DE ÚLTIMO LOGIN
    // Roda silenciosamente em segundo plano toda vez que alguém loga com sucesso
    async signIn({ user }) {
      if (user.id) {
        try {
          await db.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          });
        } catch (error) {
          console.error("Erro ao registrar lastLogin:", error);
        }
      }
    },

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
