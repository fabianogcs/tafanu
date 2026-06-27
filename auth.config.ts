import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

export default {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },

      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          // 🛡️ Fallback inofensivo apenas para agradar o TypeScript e remover a linha vermelha.
          // A permissão REAL sempre será sobrescrita pelo banco de dados no auth.ts!
          role: "VISITANTE",
        };
      },
    }),
  ],
} satisfies NextAuthConfig;
