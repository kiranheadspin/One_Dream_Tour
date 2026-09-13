import { z } from "zod";
import { LEAD_STAGES, TOURNAMENT } from "@/lib/constants";

const optionalText = z.string().trim().max(1000).optional().or(z.literal(""));

export const leadSchema = z.object({
  captainName: z.string().trim().min(2).max(100),
  displayName: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{8,16}$/, "Enter a valid phone number"),
  whatsapp: z.string().trim().regex(/^[+\d][\d\s-]{8,16}$/, "Enter a valid WhatsApp number"),
  email: z.email().max(180),
  company: z.string().trim().min(2).max(160),
  relationship: z.string().trim().min(2).max(120),
  city: z.enum(TOURNAMENT.cities),
  teamSize: z.string().trim().min(1).max(40),
  preferredMonth: z.string().trim().min(1).max(40),
  companyApproval: z.string().trim().min(1).max(80),
  source: z.string().trim().min(1).max(100),
  campaign: optionalText,
  utmSource: z.string().trim().max(200).optional().or(z.literal("")),
  utmMedium: z.string().trim().max(200).optional().or(z.literal("")),
  utmCampaign: z.string().trim().max(200).optional().or(z.literal("")),
  utmTerm: z.string().trim().max(200).optional().or(z.literal("")),
  utmContent: z.string().trim().max(200).optional().or(z.literal("")),
  referralCode: z.string().trim().max(100).optional().or(z.literal("")),
  landingPage: z.string().trim().max(500).optional().or(z.literal("")),
  referrer: z.string().trim().max(500).optional().or(z.literal("")),
  futureInterests: z.array(z.string().trim().max(80)).max(8),
  message: optionalText,
  operationalConsent: z.literal(true, { message: "Operational consent is required" }),
  marketingConsent: z.boolean(),
  website: z.string().max(0).optional().or(z.literal("")),
});

export type LeadInput = z.infer<typeof leadSchema>;

export const shortLeadSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.email("Enter a valid email address").max(180),
  city: z.enum(TOURNAMENT.cities),
  phone: z.string().trim().regex(/^\+[1-9]\d{7,14}$/, "Enter a valid phone number with country code"),
  organization: z.string().trim().min(2, "Enter your organization").max(160),
  corporateConsent: z.boolean().refine((confirmed) => confirmed, "Confirm that this is a pure corporate team"),
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ShortLeadInput = z.infer<typeof shortLeadSchema>;

export const leadUpdateSchema = z.object({
  stage: z.enum(LEAD_STAGES).optional(),
  assignedTo: z.string().trim().max(100).optional(),
  nextFollowUp: z.iso.datetime().optional().or(z.literal("")),
});

export const captainInvitationSchema = z.object({
  teamName: z.string().trim().min(2, "Enter a team name").max(120),
});

export const playerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(180),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{8,16}$/),
  employeeId: z.string().trim().min(1).max(80),
  epfoNumber: z.string().trim().max(80),
});
