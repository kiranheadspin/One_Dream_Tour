import type { LeadStage } from "@/lib/constants";

export type City = "Bangalore" | "Chennai" | "Hyderabad" | "Pune";

export interface Lead {
  id: string;
  reference: string;
  captainName: string;
  displayName: string;
  phone: string;
  whatsapp: string;
  email: string;
  company: string;
  relationship: string;
  city: City;
  teamSize: string;
  preferredMonth: string;
  companyApproval: string;
  source: string;
  campaign?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referralCode?: string;
  landingPage?: string;
  referrer?: string;
  futureInterests: string[];
  message?: string;
  stage: LeadStage;
  captainProvisioned?: boolean;
  marketingConsent: boolean;
  operationalConsent: boolean;
  assignedTo?: string;
  nextFollowUp?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Player {
  id: string;
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  shirtSize: string;
  isCaptain: boolean;
  status: "Complete" | "Missing details";
}

export interface Team {
  id: string;
  leadId?: string;
  enquiryReference?: string;
  name: string;
  company: string;
  city: City;
  captainName: string;
  captainEmail: string;
  registrationStatus: "Draft" | "Payment pending" | "Registered";
  rulesAcceptedAt?: string;
  paymentStatus: "Not started" | "Pending" | "Paid" | "Failed" | "Refunded";
  players: Player[];
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  teamId: string;
  orderId: string;
  provider?: "razorpay" | "manual_upi";
  providerPaymentId?: string;
  amountPaise: number;
  status: "created" | "authorized" | "submitted" | "paid" | "failed" | "rejected" | "partially_refunded" | "refunded";
  idempotencyKey: string;
  submittedAt?: string;
  confirmedAt?: string;
  confirmedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaptainPaymentView {
  id: string;
  reference: string;
  transactionReference?: string;
  amountPaise: number;
  provider: string;
  status: PaymentRecord["status"];
  submittedAt?: string;
  updatedAt: string;
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface ConsentRecord {
  id: string;
  leadId: string;
  purpose: "operations" | "marketing";
  granted: boolean;
  policyVersion: string;
  source: string;
  createdAt: string;
}

export interface DemoDatabase {
  leads: Lead[];
  teams: Team[];
  payments: PaymentRecord[];
  audit: AuditEntry[];
  consents: ConsentRecord[];
  processedWebhookIds: string[];
}
