import { NextResponse } from "next/server";

/** Fallback when Auth.js serves `/api/auth/error` instead of `pages.error`. */
export function GET(request: Request) {
  const url = new URL(request.url);
  const raw = url.searchParams.get("error") ?? "unknown";
  const code = raw.split("/")[0];
  const signIn = new URL("/signin", url.origin);
  signIn.searchParams.set("error", code);
  return NextResponse.redirect(signIn);
}
