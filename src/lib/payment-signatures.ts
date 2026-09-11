import { createHmac, timingSafeEqual } from "node:crypto";

export function hmacSha256(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyHmacSha256(payload: string, signature: string, secret: string) {
  const left = Buffer.from(hmacSha256(payload, secret));
  const right = Buffer.from(signature);
  return left.length === right.length && timingSafeEqual(left, right);
}
