// middleware.ts — NextAuth v4: use withAuth (not Auth.js v5 `auth()` wrapper)
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) {
      return NextResponse.next();
    }

    if (token && pathname.startsWith("/auth/")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/auth/login",
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) {
          return true;
        }
        if (pathname.startsWith("/api/auth/")) return true;
        const publicPaths = [
          "/auth/login",
          "/auth/signup",
          "/auth/forgot-password",
          "/",
        ];
        if (publicPaths.some((path) => pathname === path)) return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
