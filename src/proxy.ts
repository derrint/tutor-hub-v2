import { auth } from "@/auth";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";

import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

function isPublicPath(pathname: string): boolean {
  if (pathname === "/signin" || pathname.startsWith("/signin/")) {
    return true;
  }
  return false;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname === "/signup" || pathname.startsWith("/signup/")) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  if (req.auth && isPublicPath(pathname)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!req.auth && !isPublicPath(pathname)) {
    const signInUrl = new URL("/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api/|_next|_vercel|.*\\..*).*)"],
};
