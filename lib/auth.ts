import { cookies } from "next/headers";

export const AUTH_COOKIE = "kg_auth";
/** Separate cookie for the private Mathew & Naa section */
export const MN_AUTH_COOKIE = "mn_auth";
const AUTH_VALUE = "ok";

export async function isAuthenticated(): Promise<boolean> {
  const c = await cookies();
  return c.get(AUTH_COOKIE)?.value === AUTH_VALUE;
}

export async function isMnAuthenticated(): Promise<boolean> {
  const c = await cookies();
  return c.get(MN_AUTH_COOKIE)?.value === AUTH_VALUE;
}

export function normalize(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, "");
}
