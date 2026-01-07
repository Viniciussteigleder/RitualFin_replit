import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/signup");
      
      if (!isAuthPage) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      } else if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL("/", nextUrl));
      }
      return true;
    },
    session({ session, user, token }) {
       // Add userId to session
       if (session.user) {
         session.user.id = user?.id || token?.sub as string;
       }
       return session;
    }
  },
  providers: [], // Providers configured in auth.ts
} satisfies NextAuthConfig;
