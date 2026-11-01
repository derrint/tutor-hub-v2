import { headers } from "next/headers";

/** Set on every matched request in `src/proxy.ts` for server layout routing. */
export async function getRequestPathname(): Promise<string> {
  return (await headers()).get("x-pathname") ?? "";
}
