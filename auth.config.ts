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
        const isAdmin =
          profile.email?.toLowerCase() ===
          process.env.ADMIN_EMAIL?.toLowerCase();
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
