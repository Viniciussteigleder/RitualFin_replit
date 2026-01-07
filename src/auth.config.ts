import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnLogin = nextUrl.pathname.startsWith("/login");
      
      // Allow legacy API routes to pass through (handled by express if rewrites fail, but for Next.js app)
      // Actually legacy routes are on port 5001 usually, but if ported:
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      } else if (isLoggedIn && isOnLogin) {
        return Response.redirect(new URL("/dashboard", nextUrl));
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
