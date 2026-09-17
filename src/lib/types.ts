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
  hasInteraction: boolean;
  isNew: boolean;
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
  epfoNumber: string;
  isCaptain: boolean;
}

export interface Team {
  id: string;
  leadId?: string;
  enquiryReference?: string;
  name: string;
  officialName?: string;
  company: string;
  city: City;
  captainName: string;
  captainEmail: string;
  registrationStatus: "Draft" | "Payment pending" | "Registered";
  rulesAcceptedAt?: string;
  rulesVersion?: string;
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

export type FixtureStatus = "draft" | "published" | "cancelled";

export interface ScheduleFixture {
  id: string;
  tournamentId?: string;
  venueId: string;
  venueName: string;
  venueAddress?: string;
  city: string;
  roundName: string;
  matchNumber: number;
  startsAt: string;
  endsAt: string;
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId: string;
  awayTeamName: string;
  status: FixtureStatus;
  notes?: string;
  publishedAt?: string;
  updatedAt: string;
}

export interface PublicScheduleFixture {
  id: string;
  venueName: string;
  venueAddress?: string;
  city: string;
  roundName: string;
  matchNumber: number;
  startsAt: string;
  endsAt: string;
  homeTeamName: string;
  awayTeamName: string;
  publishedAt?: string;
}

export interface TournamentAnnouncement {
  id: string;
  fixtureId?: string;
  title: string;
  body: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleVenue {
  id: string;
  tournamentCityId?: string;
  name: string;
  address?: string;
  city: string;
}

export interface ScheduleTeamOption {
  id: string;
  name: string;
  officialName?: string;
  company: string;
  city: string;
}

export interface ScheduleCityOption {
  id: string;
  city: string;
}

export interface DemoDatabase {
  leads: Lead[];
  teams: Team[];
  payments: PaymentRecord[];
  audit: AuditEntry[];
  consents: ConsentRecord[];
  fixtures: ScheduleFixture[];
  announcements: TournamentAnnouncement[];
  venues: ScheduleVenue[];
  processedWebhookIds: string[];
}
