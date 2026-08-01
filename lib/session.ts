import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_SESSION_COOKIE = "admin_session";

// Derived from SESSION_SECRET (not ADMIN_PASSWORD) so a compromised session
// cookie can be invalidated by rotating SESSION_SECRET alone, without also
// having to change the login password.
export function createSessionToken(): string {
  return createHmac("sha256", process.env.SESSION_SECRET!).update("admin").digest("hex");
}

export function isValidSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const expected = createSessionToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
