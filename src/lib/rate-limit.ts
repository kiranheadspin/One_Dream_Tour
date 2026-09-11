import "server-only";
import { createHmac } from "node:crypto";
import { env, isDemoMode } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function checkMemoryRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (current.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000) };
  }
  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function hashPrivateValue(namespace: string, value: string) {
  if (!env.REQUEST_HASH_SECRET) return null;
  return createHmac("sha256", env.REQUEST_HASH_SECRET).update(`${namespace}:${value}`).digest("hex");
}

export function getClientAddress(headers: Headers) {
  const forwarded = headers.get("x-vercel-forwarded-for")
    ?? headers.get("cf-connecting-ip")
    ?? headers.get("x-real-ip")
    ?? headers.get("x-forwarded-for")
    ?? "unknown";
  const address = forwarded.split(",")[0]?.trim() || "unknown";
  return address.slice(0, 128);
}

export async function checkRateLimit(key: string, limit = 5, windowMs = 15 * 60 * 1000) {
  if (isDemoMode) return checkMemoryRateLimit(key, limit, windowMs);
  const keyHash = hashPrivateValue("rate-limit", key);
  if (!keyHash) throw new Error("Rate limiting is not configured.");

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("consume_rate_limit", {
    p_key_hash: keyHash,
    p_limit: limit,
    p_window_seconds: Math.max(1, Math.ceil(windowMs / 1000)),
  });
  if (error) throw new Error("The shared rate limiter is unavailable.", { cause: error });
  const result = Array.isArray(data) ? data[0] : data;
  if (!result || typeof result.allowed !== "boolean") throw new Error("The shared rate limiter returned an invalid response.");
  return {
    allowed: result.allowed,
    retryAfterSeconds: Number(result.retry_after_seconds ?? 0),
  };
}
