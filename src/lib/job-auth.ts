import { createHash, timingSafeEqual } from "node:crypto";

// Job endpoints take `Authorization: Bearer <CRON_SECRET>`, the header Vercel Cron sends.
// Hashing first makes the comparison constant-time whatever the length of the header.
export function isAuthorizedJob(request: Request, secret: string | undefined): boolean {
  if (secret === undefined) return false;
  const header = request.headers.get("authorization") ?? "";
  return timingSafeEqual(digest(header), digest(`Bearer ${secret}`));
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}
