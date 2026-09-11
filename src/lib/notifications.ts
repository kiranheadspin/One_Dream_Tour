import "server-only";
import { Resend } from "resend";
import { env, isDemoMode } from "@/lib/env";
import type { Lead } from "@/lib/types";

export interface NotificationProvider {
  sendLeadSubmission(lead: Lead): Promise<void>;
}

const noOpProvider: NotificationProvider = { async sendLeadSubmission() {} };

const emailProvider: NotificationProvider = {
  async sendLeadSubmission(lead) {
    if (!env.RESEND_API_KEY || !env.NOTIFICATION_FROM_EMAIL || !env.ADMIN_NOTIFICATION_EMAIL) {
      throw new Error("Resend notifications are not configured.");
    }
    const resend = new Resend(env.RESEND_API_KEY);
    const from = `One Dream Cup <${env.NOTIFICATION_FROM_EMAIL}>`;
    const acknowledgement = resend.emails.send({
      from,
      to: [lead.email],
      replyTo: env.NOTIFICATION_REPLY_TO_EMAIL || env.ADMIN_NOTIFICATION_EMAIL,
      subject: `We received your One Dream Cup enquiry — ${lead.reference}`,
      text: `Hello ${lead.displayName},\n\nWe received your One Dream Cup enquiry for ${lead.company}. Your reference is ${lead.reference}. Our operations team will contact you about eligibility, availability and next steps.\n\nNo slot or payment has been confirmed at this stage.`,
      tags: [{ name: "message_type", value: "lead_acknowledgement" }],
    }, { idempotencyKey: `lead-${lead.id}-acknowledgement` });
    const adminAlert = resend.emails.send({
      from,
      to: [env.ADMIN_NOTIFICATION_EMAIL],
      replyTo: lead.email,
      subject: `New One Dream Cup enquiry — ${lead.reference}`,
      text: [
        "A new website enquiry was received.",
        "",
        `Reference: ${lead.reference}`,
        `Name: ${lead.displayName}`,
        `Organization: ${lead.company}`,
        `City: ${lead.city}`,
        `Email: ${lead.email}`,
        `Phone: ${lead.phone}`,
        "",
        "Open the admin CRM to review and assign the enquiry.",
      ].join("\n"),
      tags: [{ name: "message_type", value: "lead_admin_alert" }],
    }, { idempotencyKey: `lead-${lead.id}-admin-alert` });
    const results = await Promise.allSettled([acknowledgement, adminAlert]);
    const failed = results.some((result) => result.status === "rejected" || Boolean(result.value.error));
    if (failed) throw new Error("Resend rejected one or more lead notifications.");
  },
};

export const notifications = isDemoMode ? noOpProvider : emailProvider;
