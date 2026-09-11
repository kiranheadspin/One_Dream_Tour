import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { AuditEntry, DemoDatabase, Lead, PaymentRecord, Player } from "@/lib/types";
import type { LeadInput } from "@/lib/validation";
import type { LeadStage } from "@/lib/constants";

const dataDir = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "one-dream-cup-demo.json");
const seededAt = "2026-08-02T09:30:00.000Z";

const sampleLeadRows = [
  ["ODC-260801", "Arjun Rao", "Arjun", "Acme Technologies", "Bangalore", "Registration invited", "Website"],
  ["ODC-260802", "Meera Nair", "Meera", "Northstar Systems", "Chennai", "Registered", "Referral"],
  ["ODC-260803", "Vikram Shah", "Vikram", "BluePeak Labs", "Pune", "Payment pending", "LinkedIn"],
  ["ODC-260804", "Sana Khan", "Sana", "Cloudline India", "Hyderabad", "Registration invited", "WhatsApp"],
  ["ODC-260805", "Nitin Bose", "Nitin", "Orbit Commerce", "Bangalore", "Registered", "Past participant"],
  ["ODC-260806", "Priya Iyer", "Priya", "Vertex Consulting", "Chennai", "Qualified", "Company HR"],
  ["ODC-260807", "Rohan Kulkarni", "Rohan", "Cedarwave Digital", "Pune", "Slot reserved", "Website"],
  ["ODC-260808", "Ayesha Mirza", "Ayesha", "Nimbus Healthcare", "Hyderabad", "Payment pending", "Referral"],
] as const;

function sampleLeads(): Lead[] {
  return sampleLeadRows.map(([reference, captainName, displayName, company, city, stage, source], index) => ({
    id: `demo-lead-${index + 1}`,
    reference,
    captainName,
    displayName,
    phone: `+91 90000 0010${index}`,
    whatsapp: `+91 90000 0010${index}`,
    email: `${displayName.toLowerCase().replaceAll(" ", ".")}@example.com`,
    company,
    relationship: "Employee and team captain",
    city,
    teamSize: "12–15 players",
    preferredMonth: index % 2 ? "October 2026" : "November 2026",
    companyApproval: index === 5 ? "In progress" : "Approved",
    source,
    campaign: index === 2 ? "LinkedIn corporate cricket" : undefined,
    futureInterests: ["Corporate sports events"],
    message: "Interested in representing our company in the city league.",
    stage,
    marketingConsent: index % 2 === 0,
    operationalConsent: true,
    assignedTo: index > 0 ? "Kiran" : undefined,
    nextFollowUp: index < 4 ? `2026-08-0${index + 4}T05:30:00.000Z` : undefined,
    createdAt: `2026-08-${String(index + 1).padStart(2, "0")}T09:30:00.000Z`,
    updatedAt: `2026-08-${String(index + 1).padStart(2, "0")}T09:30:00.000Z`,
  }));
}

function player(id: string, name: string, email: string, phone: string, employeeId: string, shirtSize: string, isCaptain = false): Player {
  return { id, name, email, phone, employeeId, shirtSize, isCaptain, status: "Complete" };
}

function sampleTeams(): DemoDatabase["teams"] {
  return [
    {
      id: "demo-team-1", leadId: "demo-lead-2", enquiryReference: "ODC-260802", name: "Northstar Strikers", company: "Northstar Systems", city: "Chennai",
      captainName: "Meera Nair", captainEmail: "meera@example.com", registrationStatus: "Payment pending", paymentStatus: "Not started",
      players: [
        player("demo-player-1", "Meera Nair", "meera@example.com", "+91 90000 00101", "NS-0142", "M", true),
        player("demo-player-2", "Rahul Menon", "rahul.menon@example.com", "+91 90000 00201", "NS-0189", "L"),
      ], updatedAt: seededAt,
    },
    {
      id: "demo-team-2", leadId: "demo-lead-1", enquiryReference: "ODC-260801", name: "Acme Blazers", company: "Acme Technologies", city: "Bangalore",
      captainName: "Arjun Rao", captainEmail: "arjun@example.com", registrationStatus: "Draft", paymentStatus: "Not started",
      players: [
        player("demo-player-3", "Arjun Rao", "arjun@example.com", "+91 90000 00100", "AT-2041", "L", true),
        player("demo-player-4", "Devika Shetty", "devika.shetty@example.com", "+91 90000 00200", "AT-2088", "M"),
        player("demo-player-5", "Karthik Jain", "karthik.jain@example.com", "+91 90000 00300", "AT-2114", "XL"),
      ], updatedAt: "2026-08-02T08:45:00.000Z",
    },
    {
      id: "demo-team-3", leadId: "demo-lead-3", enquiryReference: "ODC-260803", name: "BluePeak Chargers", company: "BluePeak Labs", city: "Pune",
      captainName: "Vikram Shah", captainEmail: "vikram@example.com", registrationStatus: "Payment pending", paymentStatus: "Pending",
      players: [
        player("demo-player-6", "Vikram Shah", "vikram@example.com", "+91 90000 00102", "BP-0317", "M", true),
        player("demo-player-7", "Neha Patil", "neha.patil@example.com", "+91 90000 00202", "BP-0344", "S"),
        player("demo-player-8", "Sameer Joshi", "sameer.joshi@example.com", "+91 90000 00302", "BP-0381", "L"),
        player("demo-player-9", "Ishaan Deshmukh", "ishaan.d@example.com", "+91 90000 00402", "BP-0402", "XL"),
      ], updatedAt: "2026-08-03T11:20:00.000Z",
    },
    {
      id: "demo-team-4", leadId: "demo-lead-4", enquiryReference: "ODC-260804", name: "Cloudline Hawks", company: "Cloudline India", city: "Hyderabad",
      captainName: "Sana Khan", captainEmail: "sana@example.com", registrationStatus: "Draft", paymentStatus: "Not started",
      players: [
        player("demo-player-10", "Sana Khan", "sana@example.com", "+91 90000 00103", "CL-1108", "M", true),
        player("demo-player-11", "Aditya Reddy", "aditya.reddy@example.com", "+91 90000 00203", "CL-1146", "L"),
      ], updatedAt: "2026-08-04T07:10:00.000Z",
    },
    {
      id: "demo-team-5", leadId: "demo-lead-5", enquiryReference: "ODC-260805", name: "Orbit Titans", company: "Orbit Commerce", city: "Bangalore",
      captainName: "Nitin Bose", captainEmail: "nitin@example.com", registrationStatus: "Registered", paymentStatus: "Paid",
      players: [
        player("demo-player-12", "Nitin Bose", "nitin@example.com", "+91 90000 00104", "OC-0711", "XL", true),
        player("demo-player-13", "Tanvi Rao", "tanvi.rao@example.com", "+91 90000 00204", "OC-0748", "M"),
        player("demo-player-14", "Manish Gupta", "manish.gupta@example.com", "+91 90000 00304", "OC-0792", "L"),
      ], updatedAt: "2026-08-05T13:40:00.000Z",
    },
    {
      id: "demo-team-6", leadId: "demo-lead-7", enquiryReference: "ODC-260807", name: "Cedarwave Kings", company: "Cedarwave Digital", city: "Pune",
      captainName: "Rohan Kulkarni", captainEmail: "rohan@example.com", registrationStatus: "Draft", paymentStatus: "Not started",
      players: [player("demo-player-15", "Rohan Kulkarni", "rohan@example.com", "+91 90000 00106", "CD-1510", "L", true)],
      updatedAt: "2026-08-07T10:15:00.000Z",
    },
    {
      id: "demo-team-7", leadId: "demo-lead-8", enquiryReference: "ODC-260808", name: "Nimbus Royals", company: "Nimbus Healthcare", city: "Hyderabad",
      captainName: "Ayesha Mirza", captainEmail: "ayesha@example.com", registrationStatus: "Payment pending", paymentStatus: "Failed",
      players: [
        player("demo-player-16", "Ayesha Mirza", "ayesha@example.com", "+91 90000 00107", "NH-0912", "S", true),
        player("demo-player-17", "Farhan Ali", "farhan.ali@example.com", "+91 90000 00207", "NH-0937", "M"),
        player("demo-player-18", "Lavanya Rao", "lavanya.rao@example.com", "+91 90000 00307", "NH-0965", "M"),
      ], updatedAt: "2026-08-08T12:05:00.000Z",
    },
  ];
}

function seed(): DemoDatabase {
  return {
    leads: sampleLeads(),
    teams: sampleTeams(),
    payments: [],
    audit: [],
    consents: [],
    processedWebhookIds: [],
  };
}

async function writeDatabase(database: DemoDatabase) {
  await fs.mkdir(dataDir, { recursive: true });
  const temporaryFile = `${dataFile}.${process.pid}.${randomUUID()}.tmp`;
  await fs.writeFile(temporaryFile, JSON.stringify(database, null, 2), { encoding: "utf8", mode: 0o600 });
  await fs.rename(temporaryFile, dataFile);
}

export async function readDemoDatabase(): Promise<DemoDatabase> {
  try {
    const database = JSON.parse(await fs.readFile(dataFile, "utf8")) as DemoDatabase;
    const leadsById = new Set(database.leads.map((lead) => lead.id));
    const teamsById = new Set(database.teams.map((team) => team.id));
    const missingLeads = sampleLeads().filter((lead) => !leadsById.has(lead.id));
    const missingTeams = sampleTeams().filter((team) => !teamsById.has(team.id));
    const primaryTeam = database.teams.find((team) => team.id === "demo-team-1");
    let changed = false;

    if (primaryTeam && (!primaryTeam.leadId || !primaryTeam.enquiryReference)) {
      primaryTeam.leadId = "demo-lead-2";
      primaryTeam.enquiryReference = "ODC-260802";
      changed = true;
    }
    if (missingLeads.length || missingTeams.length) {
      database.leads.push(...missingLeads);
      database.teams.push(...missingTeams);
      changed = true;
    }
    if (changed) await writeDatabase(database);
    return database;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const initial = seed();
    await writeDatabase(initial);
    return initial;
  }
}

function referenceFor(database: DemoDatabase) {
  const date = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  return `ODC-${date}-${String(database.leads.length + 1).padStart(3, "0")}`;
}

export async function createDemoLead(input: LeadInput) {
  const database = await readDemoDatabase();
  const normalizedEmail = input.email.trim().toLowerCase();
  const duplicate = database.leads.find((lead) => lead.email.toLowerCase() === normalizedEmail && lead.city === input.city);
  if (duplicate) return { lead: duplicate, duplicate: true };

  const timestamp = new Date().toISOString();
  const lead: Lead = { id: randomUUID(), reference: referenceFor(database), ...input, email: normalizedEmail, stage: "New", createdAt: timestamp, updatedAt: timestamp };
  database.leads.unshift(lead);
  database.consents.push(
    { id: randomUUID(), leadId: lead.id, purpose: "operations", granted: true, policyVersion: "2026-08-01", source: "public-enquiry-form", createdAt: timestamp },
    { id: randomUUID(), leadId: lead.id, purpose: "marketing", granted: input.marketingConsent, policyVersion: "2026-08-01", source: "public-enquiry-form", createdAt: timestamp },
  );
  database.audit.push({ id: randomUUID(), actor: "public-form", action: "lead.created", targetType: "lead", targetId: lead.id, metadata: { reference: lead.reference, city: lead.city }, createdAt: timestamp });
  await writeDatabase(database);
  return { lead, duplicate: false };
}

export async function updateDemoLead(id: string, update: { stage?: LeadStage; assignedTo?: string; nextFollowUp?: string }) {
  const database = await readDemoDatabase();
  const lead = database.leads.find((item) => item.id === id);
  if (!lead) return null;
  const previousStage = lead.stage;
  Object.assign(lead, update, { updatedAt: new Date().toISOString() });
  database.audit.push({ id: randomUUID(), actor: "demo-admin", action: "lead.updated", targetType: "lead", targetId: lead.id, metadata: { previousStage, nextStage: lead.stage }, createdAt: lead.updatedAt });
  await writeDatabase(database);
  return lead;
}

export async function addDemoPlayer(input: Omit<Player, "id" | "isCaptain" | "status">) {
  const database = await readDemoDatabase();
  const team = database.teams[0];
  const player: Player = { ...input, id: randomUUID(), isCaptain: false, status: "Complete" };
  team.players.push(player);
  team.updatedAt = new Date().toISOString();
  await writeDatabase(database);
  return player;
}

export async function acceptDemoRules() {
  const database = await readDemoDatabase();
  const team = database.teams[0];
  team.rulesAcceptedAt = new Date().toISOString();
  team.updatedAt = team.rulesAcceptedAt;
  await writeDatabase(database);
  return team;
}

export async function createDemoPayment(idempotencyKey: string) {
  const database = await readDemoDatabase();
  const existing = database.payments.find((payment) => payment.idempotencyKey === idempotencyKey);
  if (existing) return existing;
  const timestamp = new Date().toISOString();
  const payment: PaymentRecord = { id: randomUUID(), teamId: database.teams[0].id, orderId: `order_demo_${Date.now()}`, provider: "razorpay", amountPaise: 1_450_000, status: "created", idempotencyKey, createdAt: timestamp, updatedAt: timestamp };
  database.payments.push(payment);
  database.teams[0].paymentStatus = "Pending";
  await writeDatabase(database);
  return payment;
}

export async function completeDemoPayment(paymentId: string) {
  const database = await readDemoDatabase();
  const payment = database.payments.find((item) => item.id === paymentId);
  if (!payment) return null;
  payment.status = "paid";
  payment.providerPaymentId = `pay_demo_${Date.now()}`;
  payment.updatedAt = new Date().toISOString();
  payment.confirmedAt = payment.updatedAt;
  database.teams[0].paymentStatus = "Paid";
  database.teams[0].registrationStatus = "Registered";
  await writeDatabase(database);
  return payment;
}

export async function submitDemoUpiPayment(idempotencyKey: string, transactionReference?: string) {
  const database = await readDemoDatabase();
  const team = database.teams[0];
  const existing = database.payments.find((payment) => payment.idempotencyKey === idempotencyKey);
  if (existing) return existing;

  const active = database.payments
    .filter((payment) => payment.teamId === team.id && payment.provider === "manual_upi" && ["submitted", "paid"].includes(payment.status))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  if (active) return active;

  const timestamp = new Date().toISOString();
  const payment: PaymentRecord = {
    id: randomUUID(),
    teamId: team.id,
    orderId: `upi_demo_${Date.now()}`,
    provider: "manual_upi",
    providerPaymentId: transactionReference,
    amountPaise: 1_450_000,
    status: "submitted",
    idempotencyKey,
    submittedAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  database.payments.unshift(payment);
  team.paymentStatus = "Pending";
  team.registrationStatus = "Payment pending";
  team.updatedAt = timestamp;
  database.audit.push({
    id: randomUUID(),
    actor: "demo-captain",
    action: "payment.submitted_for_review",
    targetType: "payment",
    targetId: payment.id,
    metadata: { teamId: team.id, reference: payment.orderId },
    createdAt: timestamp,
  });
  await writeDatabase(database);
  return payment;
}

export async function confirmDemoUpiPayment(paymentId: string, actor: string) {
  const database = await readDemoDatabase();
  const payment = database.payments.find((item) => item.id === paymentId);
  if (!payment || !["submitted", "paid"].includes(payment.status)) return null;
  if (payment.status === "paid") return payment;

  const team = database.teams.find((item) => item.id === payment.teamId);
  if (!team) return null;
  const timestamp = new Date().toISOString();
  payment.status = "paid";
  payment.confirmedAt = timestamp;
  payment.confirmedBy = actor;
  payment.updatedAt = timestamp;
  team.paymentStatus = "Paid";
  team.registrationStatus = "Registered";
  team.updatedAt = timestamp;
  database.audit.push({
    id: randomUUID(),
    actor,
    action: "payment.confirmed_received",
    targetType: "payment",
    targetId: payment.id,
    metadata: { teamId: team.id, reference: payment.orderId },
    createdAt: timestamp,
  });
  await writeDatabase(database);
  return payment;
}

export async function appendAudit(entry: Omit<AuditEntry, "id" | "createdAt">) {
  const database = await readDemoDatabase();
  database.audit.push({ ...entry, id: randomUUID(), createdAt: new Date().toISOString() });
  await writeDatabase(database);
}

export async function setDemoMarketingConsent(granted: boolean) {
  const database = await readDemoDatabase();
  const lead = database.leads.find((item) => item.id === "demo-lead-2") ?? database.leads[0];
  const timestamp = new Date().toISOString();
  lead.marketingConsent = granted;
  lead.updatedAt = timestamp;
  database.consents.push({ id: randomUUID(), leadId: lead.id, purpose: "marketing", granted, policyVersion: "2026-08-01", source: "captain-preferences", createdAt: timestamp });
  database.audit.push({ id: randomUUID(), actor: "demo-captain", action: granted ? "marketing.granted" : "marketing.withdrawn", targetType: "lead", targetId: lead.id, metadata: {}, createdAt: timestamp });
  await writeDatabase(database);
  return granted;
}
