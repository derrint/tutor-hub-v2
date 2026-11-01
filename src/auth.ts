import { isEmailInvitedForSignIn } from "@/lib/auth/sign-in-gate";
import { loadUserByEmail } from "@/lib/auth/load-user-by-email";
import {
  ACTIVE_TUTOR_COOKIE_NAME,
} from "@/lib/tutor-context/constants";
import { cookies } from "next/headers";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  callbacks: {
    async signIn({ profile }) {
      const invited = await isEmailInvitedForSignIn(profile?.email);
      if (invited) {
        return true;
      }
      return "/signin?error=AccessDenied";
    },
    async jwt({ token, profile }) {
      const email =
        profile?.email?.trim().toLowerCase() ??
        token.email?.trim().toLowerCase();
      if (!email) {
        return token;
      }

      const user = await loadUserByEmail(email);
      if (!user) {
        return token;
      }

      token.email = user.email;
      token.userId = user.id;
      token.role = user.role;
      token.tutorId = user.tutorId;
      return token;
    },
    session({ session, token }) {
      if (
        session.user &&
        typeof token.userId === "string" &&
        (token.role === "TEACHER" || token.role === "ADMIN")
      ) {
        session.user.id = token.userId;
        session.user.role = token.role;
        session.user.tutorId =
          typeof token.tutorId === "string" ? token.tutorId : null;
      }
      return session;
    },
    redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },
  events: {
    async signIn({ user }) {
      const email = user.email?.trim().toLowerCase();
      if (!email) return;

      const dbUser = await loadUserByEmail(email);
      if (dbUser?.role !== "ADMIN") return;

      const cookieStore = await cookies();
      cookieStore.delete(ACTIVE_TUTOR_COOKIE_NAME);
    },
  },
});
