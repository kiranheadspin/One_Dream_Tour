export const TOURNAMENT = {
  name: "One Dream Cup",
  edition: "50th Special Edition",
  format: "Seven-over corporate tennis-ball cricket",
  season: "November 2026–January 2027",
  feePaise: 1_450_000,
  prizePoolPaise: 28_000_000,
  winnerPaise: 15_000_000,
  runnerUpPaise: 5_000_000,
  qualifierAwardPaise: 1_000_000,
  qualifierCount: 8,
  whatsapp: "9591011861",
  cities: ["Bangalore", "Chennai", "Hyderabad", "Pune"] as const,
} as const;

export const CITY_SCHEDULE = {
  Bangalore: { dates: "21 & 22 November 2026", startDate: "2026-11-21", endDate: "2026-11-22" },
  Chennai: { dates: "30 & 31 January 2027", startDate: "2027-01-30", endDate: "2027-01-31" },
  Hyderabad: { dates: "19 & 20 December 2026", startDate: "2026-12-19", endDate: "2026-12-20" },
  Pune: { dates: "12 & 13 December 2026", startDate: "2026-12-12", endDate: "2026-12-13" },
} as const satisfies Record<(typeof TOURNAMENT.cities)[number], { dates: string; startDate: string; endDate: string }>;

export const PAYMENT = {
  upiId: "masterstroke.in-2@okaxis",
  payeeName: "One Dream Cup",
} as const;

export const LEAD_STAGES = [
  "New",
  "Contacted",
  "Qualified",
  "Slot reserved",
  "Registration invited",
  "Payment pending",
  "Registered",
  "Participated",
  "Renewal opportunity",
  "Lost",
  "Archived",
] as const;

export type LeadStage = (typeof LEAD_STAGES)[number];

export function formatInr(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export const whatsappUrl = (message: string) =>
  `https://wa.me/91${TOURNAMENT.whatsapp}?text=${encodeURIComponent(message)}`;
