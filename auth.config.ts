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
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        // Mantendo sua lógica de ADMIN por e-mail
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
  ],
} satisfies NextAuthConfig;
