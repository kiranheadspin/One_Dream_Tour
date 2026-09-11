import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/validation";
import { createLead } from "@/lib/leads";
import { checkRateLimit, getClientAddress, hashPrivateValue } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const clientAddress = getClientAddress(request.headers);
  try {
    const rate = await checkRateLimit(`lead:${clientAddress}`);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many enquiries. Please wait before trying again." },
        { status: 429, headers: { "retry-after": String(rate.retryAfterSeconds), "cache-control": "no-store" } },
      );
    }
  } catch {
    return NextResponse.json({ error: "Registration is temporarily unavailable. Please try again shortly." }, { status: 503, headers: { "retry-after": "60" } });
  }

  let raw: unknown;
  try { raw = await request.json(); }
  catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Please check the highlighted enquiry details.", fields: parsed.error.flatten().fieldErrors }, { status: 422 });
  if (parsed.data.website) return NextResponse.json({ reference: "ODC-RECEIVED" }, { status: 202 });

  try {
    const { lead, duplicate } = await createLead(parsed.data, {
      ipHash: hashPrivateValue("consent-ip", clientAddress),
      userAgentHash: hashPrivateValue("consent-user-agent", request.headers.get("user-agent") ?? "unknown"),
    });
    return NextResponse.json(
      { reference: lead.reference, duplicate },
      { status: duplicate ? 200 : 201, headers: { "cache-control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "The enquiry could not be saved. Please contact us on WhatsApp if this continues." }, { status: 500 });
  }
}
