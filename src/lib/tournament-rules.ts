import { CITY_SCHEDULE, formatInr, TOURNAMENT } from "@/lib/constants";

// Archive this version and its PDF when publishing a replacement. Never reuse a
// version identifier for changed terms: captain acceptance refers to this text.
export const RULES_VERSION = "s50-2026-09-14-v1";
export const RULES_SOURCE = {
  title: "All India Corporate Cricket - One dream Cup S50",
  url: "/rules/one-dream-cup-s50-3848cece.pdf",
  sha256: "3848cece76e952905dc700d8167c2939f7181b18b292f0f800af2d0af71ca6e9",
} as const;

export const PLAYING_SIDE_SIZE = 11;
export const RULES_SUMMARY = {
  format: "Men’s 11-a-side corporate tennis-ball cricket. League matches are seven overs, reduced to six when rain is predicted. A bowler may bowl a maximum of two overs.",
  eligibility: "All players must be from the same organisation and prove their employment. A PF number is required for eligibility verification. Players who have played in one city cannot play in another city competition; qualifying teams progress to Goa. A company may enter teams in other cities with different players.",
  evidence: "Provide employment proof. If an ID card is not accepted, company salary-credit proof (without disclosing the salary amount), the company portal or Teams may be used. Players who joined in the current month may provide company-portal details, an ID card and an email ID.",
  pfEntry: "PF/EPFO entry is optional while entering your roster. A PF number is required during eligibility verification; saving a player does not verify their eligibility.",
  travel: `Each of the ${TOURNAMENT.qualifierCount} qualifying teams receives ${formatInr(TOURNAMENT.qualifierAwardPaise)} as base compensation for Goa travel, based on sleeper-class train fare. No other travel compensation is provided.`,
  dates: TOURNAMENT.cities.map((city) => `${city}: ${CITY_SCHEDULE[city].dates}`).join("; ") + ".",
  missing: "The brochure does not specify total squad size, substitute rules, knockout overs, tied-match or league-ranking tie-break procedures, registration deadlines, venues, Goa dates, GST treatment, payment schedule or refund terms. These require a separate organiser announcement; no minimum number of matches is promised.",
} as const;

export const RULES_SECTIONS = [
  { title: "Playing format", body: RULES_SUMMARY.format, sourcePage: 4 },
  { title: "Company eligibility", body: RULES_SUMMARY.eligibility, sourcePage: 4 },
  { title: "Employment evidence", body: RULES_SUMMARY.evidence, sourcePage: 4 },
  { title: "City stages and Goa qualification", body: "Each city has league matches, pre-quarter-finals, quarter-finals and semi-finals. Two teams from each city qualify for the eight-team Goa quarter-finals, followed by semi-finals and the final.", sourcePage: 3 },
  { title: "City dates", body: RULES_SUMMARY.dates, sourcePage: 2 },
  { title: "Match balls and wicketkeeping", body: "Vicky balls in Bangalore and Hyderabad, Guru in Pune, Mercury in Chennai, and medium-hard tennis balls in Goa. The wicketkeeper may bowl. Wicketkeeping gloves are not allowed.", sourcePage: 4 },
  { title: "Powerplay and field restrictions", body: "In the first two overs, a maximum of two fielders may be outside the inner circle; thereafter, a maximum of five. No more than five fielders, excluding the bowler, may be on the leg side.", sourcePage: 4 },
  { title: "Scoring and dismissals", body: "No free hit, no LBW and no leg byes. Byes are allowed. The brochure directs teams to the “Crickhero” app for scores and the points table; a tournament scoring link has not been supplied.", sourcePage: 4 },
  { title: "Illegal bowling action", body: "Throwing is not allowed. If a batter appeals and the umpire upholds it, a no-ball and a warning are given. A repeated illegal action results in another no-ball and the bowler may not bowl again in the tournament. Another bowler may complete the remaining over.", sourcePage: 4 },
  { title: "Rain and washouts", body: "For rain before the start or after the first innings, the umpire decides on reduced overs or a super over according to the situation. The same rain rule applies in knockout matches. At least three overs must be played in the second innings for a result by the brochure’s stated DL method. Washouts are rescheduled to another day.", sourcePage: 4 },
  { title: "Retirement and runners", body: "A batter may retire out at any time and cannot return. A batter who retires hurt through injury or illness may return after checking with the umpires. A runner for a disability or serious previous injury, such as surgery, requires sufficient proof and the umpire’s decision. For an injury during the match, a runner is permitted only if the opposing captain agrees.", sourcePage: 4 },
  { title: "Conduct and clothing", body: "Only the captain should discuss matters with the umpire; the umpire’s decision is final. No specific dress code is imposed, but players are asked to avoid shorts and sandals.", sourcePage: 4 },
  { title: "Entry fee and cash allocation", body: `Team entry is ${formatInr(TOURNAMENT.feePaise)}. The advertised ${formatInr(TOURNAMENT.prizePoolPaise)} total comprises ${formatInr(TOURNAMENT.winnerPaise)} for the winner, ${formatInr(TOURNAMENT.runnerUpPaise)} for the runner-up and ${formatInr(TOURNAMENT.qualifierAwardPaise)} for each of eight qualifiers’ travel.`, sourcePage: 2 },
  { title: "Goa travel compensation", body: RULES_SUMMARY.travel, sourcePage: 4 },
  { title: "Player awards", body: "Star Player awards for each match; Player of the City, Best Batsman of the City and Best Bowler of the City; Best Player, Best Batsman and Best Bowler of the Tournament. Further rewards are to be announced; their amounts are not specified.", sourcePage: 5 },
  { title: "Details awaiting clarification", body: RULES_SUMMARY.missing },
] as const;

export function hasAcceptedCurrentRules(team: { rulesVersion?: string; rulesAcceptedAt?: string }) {
  return Boolean(team.rulesAcceptedAt && team.rulesVersion === RULES_VERSION);
}
