import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  session: { strategy: "jwt" },
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
    async session({ session, token }) {
       if (session.user && token.sub) {
         session.user.id = token.sub;
       }
       return session;
    },
    async jwt({ token, user }) {
        if (user) {
            token.sub = user.id;
        }
        return token;
    }
  },
  providers: [], // Providers configured in auth.ts
} satisfies NextAuthConfig;
