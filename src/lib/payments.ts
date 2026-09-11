import "server-only";
import Razorpay from "razorpay";
import { env } from "@/lib/env";
import { verifyHmacSha256 } from "@/lib/payment-signatures";

export interface PaymentOrder { providerOrderId: string; amountPaise: number; currency: "INR"; }
export interface PaymentProvider { createOrder(input: { amountPaise: number; receipt: string; notes: Record<string,string> }): Promise<PaymentOrder>; verifyPayment(input: { orderId: string; paymentId: string; signature: string }): boolean; verifyWebhook(rawBody: string, signature: string): boolean; }

export const razorpayProvider: PaymentProvider = {
  async createOrder({ amountPaise, receipt, notes }) {
    if (!env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) throw new Error("Razorpay is not configured.");
    const client = new Razorpay({ key_id: env.NEXT_PUBLIC_RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });
    const order = await client.orders.create({ amount: amountPaise, currency: "INR", receipt, notes });
    return { providerOrderId: order.id, amountPaise: Number(order.amount), currency: "INR" };
  },
  verifyPayment({ orderId, paymentId, signature }) {
    if (!env.RAZORPAY_KEY_SECRET) return false;
    return verifyHmacSha256(`${orderId}|${paymentId}`, signature, env.RAZORPAY_KEY_SECRET);
  },
  verifyWebhook(rawBody, signature) {
    if (!env.RAZORPAY_WEBHOOK_SECRET) return false;
    return verifyHmacSha256(rawBody, signature, env.RAZORPAY_WEBHOOK_SECRET);
  },
};
