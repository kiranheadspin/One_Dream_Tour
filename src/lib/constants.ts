export const TOURNAMENT = {
  name: "One Dream Cup",
  edition: "50th Special Edition",
  format: "Corporate tennis-ball cricket; seven-over league stage",
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

export const LEAD_STAGE_SELECT_CLASS: Record<LeadStage, string> = {
  New: "[&>select]:border-sky-200 [&>select]:bg-sky-50 [&>select]:text-sky-800 [&>svg]:text-sky-600",
  Contacted: "[&>select]:border-violet-200 [&>select]:bg-violet-50 [&>select]:text-violet-800 [&>svg]:text-violet-600",
  Qualified: "[&>select]:border-cyan-200 [&>select]:bg-cyan-50 [&>select]:text-cyan-800 [&>svg]:text-cyan-600",
  "Slot reserved": "[&>select]:border-purple-200 [&>select]:bg-purple-50 [&>select]:text-purple-800 [&>svg]:text-purple-600",
  "Registration invited": "[&>select]:border-indigo-200 [&>select]:bg-indigo-50 [&>select]:text-indigo-800 [&>svg]:text-indigo-600",
  "Payment pending": "[&>select]:border-amber-200 [&>select]:bg-amber-50 [&>select]:text-amber-800 [&>svg]:text-amber-600",
  Registered: "[&>select]:border-emerald-200 [&>select]:bg-emerald-50 [&>select]:text-emerald-800 [&>svg]:text-emerald-600",
  Participated: "[&>select]:border-teal-200 [&>select]:bg-teal-50 [&>select]:text-teal-800 [&>svg]:text-teal-600",
  "Renewal opportunity": "[&>select]:border-orange-200 [&>select]:bg-orange-50 [&>select]:text-orange-800 [&>svg]:text-orange-600",
  Lost: "[&>select]:border-rose-200 [&>select]:bg-rose-50 [&>select]:text-rose-800 [&>svg]:text-rose-600",
  Archived: "[&>select]:border-slate-200 [&>select]:bg-slate-100 [&>select]:text-slate-600 [&>svg]:text-slate-500",
};

export function formatInr(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export const whatsappUrl = (message: string) =>
  `https://wa.me/91${TOURNAMENT.whatsapp}?text=${encodeURIComponent(message)}`;
