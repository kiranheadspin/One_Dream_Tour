import "server-only";
import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_DEMO_MODE: z.enum(["true", "false"]),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20).optional().or(z.literal("")),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional().or(z.literal("")),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  PAYMENT_UPI_ID: z.string().trim().optional(),
  PAYMENT_UPI_PAYEE_NAME: z.string().trim().optional(),
  PAYMENT_UPI_PHONE: z.string().trim().optional(),
  REQUEST_HASH_SECRET: z.string().min(32).optional().or(z.literal("")),
  BOT_VERIFICATION_SECRET: z.string().optional(),
});

const parsed = schema.safeParse({
  ...process.env,
  NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE ?? (process.env.NODE_ENV === "production" ? "false" : "true"),
});
if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}

export const env = parsed.data;
export const isDemoMode = env.NEXT_PUBLIC_DEMO_MODE !== "false";

export const upiPaymentConfig = {
  upiId: env.PAYMENT_UPI_ID || (isDemoMode ? "demo@onedreamcup" : ""),
  payeeName: env.PAYMENT_UPI_PAYEE_NAME || "One Dream Cup",
  phone: env.PAYMENT_UPI_PHONE || (isDemoMode ? "+91 90000 00000" : ""),
  configured: Boolean(env.PAYMENT_UPI_ID && env.PAYMENT_UPI_PHONE) || isDemoMode,
  demo: isDemoMode && !env.PAYMENT_UPI_ID,
} as const;

if (!isDemoMode) {
  const missing = [
    ["NEXT_PUBLIC_SUPABASE_URL", env.NEXT_PUBLIC_SUPABASE_URL],
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY", env.NEXT_PUBLIC_SUPABASE_ANON_KEY],
    ["SUPABASE_SERVICE_ROLE_KEY", env.SUPABASE_SERVICE_ROLE_KEY],
    ["REQUEST_HASH_SECRET", env.REQUEST_HASH_SECRET],
  ].filter(([, value]) => !value).map(([name]) => name);
  if (missing.length) throw new Error(`Missing production environment variables: ${missing.join(", ")}.`);
  if (new URL(env.NEXT_PUBLIC_SITE_URL).protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_SITE_URL must use HTTPS when demo mode is disabled.");
  }
}
