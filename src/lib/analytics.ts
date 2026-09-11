export type AnalyticsEvent =
  | "landing_viewed" | "city_viewed" | "register_clicked" | "whatsapp_clicked"
  | "enquiry_started" | "enquiry_submitted" | "captain_invited"
  | "registration_started" | "registration_completed" | "payment_started"
  | "payment_completed" | "payment_failed" | "marketing_consent_accepted"
  | "marketing_consent_withdrawn";

export interface AnalyticsProvider {
  track(event: AnalyticsEvent, properties?: Record<string, string | number | boolean | undefined>): void;
}

declare global { interface Window { dataLayer?: Array<Record<string, unknown>>; } }

export const analytics: AnalyticsProvider = {
  track(event, properties = {}) {
    if (typeof window === "undefined") return;
    window.dataLayer?.push({ event: `odc_${event}`, ...properties });
  },
};
