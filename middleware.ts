import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/habits/:path*",
    "/budget/:path*",
    "/goals/:path*",
    "/settings/:path*",
    "/upgrade/:path*",
    "/stats/:path*",
    "/classement/:path*",
    "/bilan/:path*",
    "/api/habits/:path*",
    "/api/budget/:path*",
    "/api/goals/:path*",
    "/api/income/:path*",
    "/api/user/:path*",
    "/api/ai/:path*",
    "/api/bridge/:path*",
    "/api/stripe/checkout/:path*",
    "/api/stripe/portal/:path*",
    "/api/stripe/cancel/:path*",
    "/api/leaderboard/:path*",
  ],
};
