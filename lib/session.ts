import { createHash, timingSafeEqual } from "crypto";

export const ADMIN_SESSION_COOKIE = "admin_session";

export function createSessionToken(): string {
  return createHash("sha256").update(process.env.ADMIN_PASSWORD!).digest("hex");
}

export function isValidSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const expected = createSessionToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
