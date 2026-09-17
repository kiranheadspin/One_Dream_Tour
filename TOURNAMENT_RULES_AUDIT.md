# S50 tournament rules integration

Source: **All India Corporate Cricket - One dream Cup S50.pdf**, supplied by the organiser on 14 September 2026. All six pages were inspected, including the image-only tournament-format diagram on page 3.

- Archived source: `public/rules/one-dream-cup-s50-3848cece.pdf`
- SHA-256: `3848cece76e952905dc700d8167c2939f7181b18b292f0f800af2d0af71ca6e9`
- Website acceptance version: `s50-2026-09-14-v1` (an application version identifier, not a publication date printed in the brochure).
- Shared content and acceptance predicate: `src/lib/tournament-rules.ts`.

## Verified facts and resolved discrepancies

| Subject | Source | Integrated behaviour |
| --- | --- | --- |
| City dates, entry fee, cash breakdown | Page 2 | Existing dates and ₹14,500 fee match. The ₹2,80,000 total includes ₹80,000 for eight qualifiers’ Goa travel. |
| City stages and Goa bracket | Page 3 diagram; page 4 | League, pre-quarter-final, quarter-final and semi-final city stages; two qualifiers per city; eight-team Goa quarter-finals, semi-finals and final. |
| Playing side and overs | Page 4 | Men’s 11-a-side; seven-over league matches, six with rain predicted; two overs maximum per bowler. No total roster maximum inferred from the playing XI. |
| Match balls, wicketkeeping, field restrictions and scoring | Page 4 | Published in full on public and captain rules pages. No free hit, LBW or leg byes; byes allowed. |
| Rain, bowling action, retirement, runners and conduct | Page 4 | Brochure conditions are included without importing standard cricket tie-break rules or inventing a DL calculation. |
| Employment and PF | Page 4; organiser clarification in this task | All players from the same organisation; specified employment evidence and PF required at verification. PF form entry remains optional. Existing roster data is preserved. |
| Other-city participation | Page 4 | Published restriction on players who have played in another city competition; Goa qualification remains allowed. Multiple company teams in different cities require different players. |
| Travel | Pages 2 and 4 | ₹10,000 per qualifier is base Goa travel compensation based on sleeper-class train fare, with no additional travel compensation promised. |
| Awards | Page 5 | Match Star Player; city player/batsman/bowler; tournament player/batsman/bowler. No invented amounts for further rewards. |
| Minimum matches | Not specified | Removed unsupported “at least two matches” promise. |
| Rules acceptance | Application control | Public/captain content shares one source. Timestamp alone is insufficient: old/unversioned acceptances require current-version review. Stale requests are rejected. Repeating a current acceptance preserves its timestamp. Payment initiation and submission check the current version. |
| Documents and eligibility status | Application control | Replaced “no documents requested” with employment-evidence guidance. No upload feature is claimed. Roster entry/payment do not certify eligibility; admin detail shows missing PF counts. |

## Decisions still needed from the organiser

The brochure is not a complete playing-conditions or commercial-policy document. The website explicitly leaves these unresolved:

- Total squad size, substitute/replacement rules and roster-lock deadline.
- Overs for city knockouts and Goa, and any adjusted bowling/fielding limits for shortened matches.
- Tied-match resolution, league points and ranking tie-break procedure. The rain-rule mention of a super over does not establish a tied-match rule.
- The precise DL implementation and how it interacts with reduced-overs/super-over decisions. The brochure only supplies an umpire decision and a three-over second-innings minimum.
- Grounds, reporting times, registration deadlines, Goa dates and rescheduling logistics.
- GST treatment, payment schedule and refund/cancellation terms. Publishing this brochure does not set the existing `payments_enabled` flag or approve commercial terms.
- The approved employment-evidence submission process and any PF exceptions. The user confirmed optional roster entry, not a waiver of PF verification.

Employment authenticity, actual participation in other city competitions, disability/injury evidence and umpire decisions require organiser review. The current app has no verified player identity or match-participation register from which to automate these decisions. No automatic eligibility certification was added.

## Release and future changes

Apply `supabase/migrations/202609140004_rules_acceptance_audit.sql` before deploying the new acceptance route. It preserves old/new version and timestamp in the existing protected audit log within the same transaction. It does not rewrite existing acceptances. Historical acceptances that predate this migration cannot be reconstructed beyond the values still stored on each team.

For a rules change, preserve the old PDF and text, assign a new version identifier, update the shared source, and require review of the new version. Do not change accepted text under an existing identifier. Keep commercial-policy approval separate from playing-rule acceptance. A source-PDF checksum regression check detects accidental replacement of the supplied brochure.

The changes are local; this task does not deploy the site or apply the migration to production. Verification uses a clean temporary checkout because the original checkout contains a Next.js dependency file marked iCloud dataless. Tests use local demo data; they do not verify live Supabase or real payments.

## Verification results

- `npm run verify` passed in the isolated checkout: TypeScript, zero-warning ESLint, 78 tests and a production build using demo configuration. The 16 focused source/acceptance checks also passed explicitly.
- Targeted Playwright run: five passed, one intentional mobile skip of the shared payment mutation scenario. Covered public facts on desktop/mobile and the existing captain UPI submission/admin confirmation flow.
- Final expanded S50 regression: two passed (1366×900 desktop and 390×844 mobile). Covered all public rule sections, source PDF response, old-version review, stale acceptance rejection, stale payment-route rejection, checkbox-gated acceptance, persistence, timestamp idempotency, employment guidance, optional PF input and admin verification guidance. Page identity, rendering, no horizontal overflow, no framework error overlay and no page/console errors passed.
- Browser plugin was unavailable. Playwright ran at `http://127.0.0.1:3000` against the isolated demo checkout. Screenshots were visually inspected and are saved under `/private/tmp/odc-s50-qa/`.
- The SQL migration executed in isolated PGlite/PostgreSQL. Old/new acceptance history, no-op updates, transaction rollback and revoked direct function execution passed. This does not establish deployment to live Supabase.
- `git diff --check` passed. Existing user-owned changes were preserved; no commit, push, production migration or deployment was performed.
