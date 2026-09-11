# One Dream Cup — Visual Direction and Implementation Plan

Status: design review required before application implementation.

## Repository inspection

- The repository is an empty Git repository on `main` with no commits.
- There is no existing framework, dependency manifest, environment configuration, database schema, or reusable application code.
- This is therefore a greenfield implementation. No existing application behavior needs migration or preservation.
- The supplied visual asset is the One Dream Group parent-brand logo, not the tournament poster referenced by the brief. The concepts use that logo as the identity anchor and use only the tournament facts supplied in the written brief.

## Design concept

The creative idea is **corporate tournament operations inside a premium night-stadium identity**.

- Public pages use a dark navy/near-black stadium atmosphere, editorial sports typography, restrained metallic gold, and the existing blue brand mark.
- Lead capture uses the same dark shell with one warm-light form plane for trust, clarity, and accessibility.
- Captain and admin workspaces move to a light operational canvas with dark navy navigation. Gold is reserved for primary actions and focus; blue remains the identity and progress color.
- Admin information stays table- and row-led. The design does not turn operational data into a decorative card grid.
- Red is reserved for errors, overdue follow-ups, or blocking actions.
- The design avoids betting/gaming signals, glassmorphism, neon, excessive glow, fake proof, and invented tournament details.

### Proposed tokens

| Role | Proposed value | Use |
| --- | --- | --- |
| Stadium navy | `#061321` | Public page background and app chrome |
| Deep navy | `#0A2038` | Secondary dark bands and sidebar states |
| Metallic gold | `#D8A72C` | Primary actions, rules, dividers, tournament emphasis |
| Parent-brand blue | `#3155C6` | Brand mark, selected navigation, progress |
| Warm canvas | `#F5F4F0` | Dashboard and form workspace |
| True white | `#FFFFFF` | High-contrast surfaces and text |
| Ink navy | `#0C1B35` | Light-surface text |
| Muted text | `#667085` | Secondary operational copy |
| Urgent red | `#C93D3D` | Error and overdue states only |

Typography direction:

- Marketing/display: `Barlow Condensed` (or an equivalent licensed condensed family), 700–800 weight.
- UI, forms, and tables: `Geist Sans`, with explicit control sizes and line heights.
- No decorative eyebrow or pill appears above the hero heading.

Component geometry:

- Public pages: open bands, fine gold rules, stable media frames, and occasional 4–8 px corners.
- Forms: 6–8 px controls, 44 px minimum target height, label-above-field, visible focus, inline error space, and an error summary after invalid submission.
- Dashboards: 1 px borders, restrained 4–8 px corners, minimal shadow, dense but readable rows and tables.
- Motion: 160–220 ms directional reveals and progress transitions, disabled under `prefers-reduced-motion`.

## Review artifacts

### Desktop

1. `concepts/01-public-hero-desktop.png` — header, hero, tournament facts, actions, and next-section preview.
2. `concepts/02-public-sections-desktop.png` — overview, city qualifiers, Road to Goa, format, and prize structure.
3. `concepts/03-public-lower-desktop.png` — registration process, real-asset gallery placeholder, FAQ, corporate services, final CTA, and footer.
4. `concepts/04-lead-form-desktop.png` — short eligibility enquiry with separate required and optional consent.
5. `concepts/05-lead-success-desktop.png` — reference, neutral notification state, next steps, WhatsApp continuation, and consent reminder.
6. `concepts/06-captain-dashboard-desktop.png` — progress, current status, required actions, players, announcements, and support.
7. `concepts/07-admin-dashboard-desktop-v2.png` — table-led lead operations, follow-ups, conversion, slots, and audit activity. This v2 is the selected desktop admin concept.

### Mobile

8. `concepts/08-public-mobile.png` — 390 px public hero, city qualifiers, vertical Road to Goa, and safe-area actions.
9. `concepts/09-lead-form-mobile.png` — 390 px pristine enquiry form with single-column fields and separate unchecked consents.
10. `concepts/10-captain-dashboard-mobile.png` — 390 px progress, actions, support, and bottom navigation.
11. `concepts/11-admin-dashboard-mobile.png` — 390 px responsive record rows, filter trigger, follow-ups, activity, and bottom navigation.

Concept images are design references. Real navigation, copy, controls, forms, tables, status messages, and data will be code-native and accessible.

## Product architecture

### Application stack

- Next.js App Router with TypeScript and React Server Components by default.
- Tailwind CSS and shadcn/ui primitives, customized to the approved tokens rather than used as stock components.
- Supabase PostgreSQL, Auth, Storage, and Row Level Security.
- React Hook Form plus Zod for client/server validation parity.
- Razorpay behind a payment service interface, with server order creation, signature verification, idempotent webhooks, and explicit development mock mode.
- Resend behind a notification interface, with a safe local preview transport when credentials are absent.
- Click-to-chat WhatsApp links through a centralized organizer-contact service; future official WhatsApp provider support remains replaceable.
- Vercel-compatible deployment and environment validation.

### Runtime boundaries

- Public marketing content is server-rendered and cacheable.
- Enquiry, registration, payment, consent, and admin mutations execute on the server and re-check authentication/authorization.
- Browser code never receives service-role credentials or payment secrets.
- Supabase RLS remains the final data boundary; hidden UI is never treated as authorization.
- Private documents use validated uploads, private storage buckets, and short-lived signed URLs.

### Feature structure

- `app/(public)` — tournament, cities, Road to Goa, rules, FAQ, registration, corporate events, policies.
- `app/(auth)` — passwordless sign-in, callback, invitation acceptance.
- `app/(captain)` — captain-owned teams, players, documents, registration, payments, schedule, announcements, preferences.
- `app/(admin)` — leads, companies, captains, tournaments, registrations, payments, follow-ups, communications, content, reports, settings, audit log.
- `features/*` — feature-owned schemas, services, server actions, queries, and UI.
- `lib/auth`, `lib/payments`, `lib/notifications`, `lib/analytics`, `lib/storage`, `lib/rate-limit` — replaceable infrastructure interfaces.
- `supabase/migrations`, `supabase/seed.sql`, generated database types, policy tests, and schema documentation.

## Data model direction

Core identity and CRM:

- profiles, roles, profile_roles, companies, company_contacts
- leads, configurable lead_stages, lead_activities, follow_ups, opportunities
- campaign_sources and attribution with UTM/referral fields

Tournament registration:

- tournaments, tournament_cities, venues, teams, team_members
- registrations, registration_steps, documents, announcements
- app_settings and content_pages for organizer-configurable facts

Money and trust:

- payments and payment_attempts in integer paise
- payment_events for webhook idempotency and provider references
- refunds with partial-refund support
- consent_records as append-only history with text version, source, channel, actor, and timestamp
- communication_preferences, marketing_interests, do-not-contact and withdrawal state
- audit_logs for sensitive admin actions

Every ownership-sensitive table will carry the minimum relationship needed for RLS to prove captain ownership. Soft deletion will be limited to business records where recovery/audit value outweighs permanent deletion; consent, payment, and audit history will not be silently overwritten.

## Implementation sequence

1. **Foundation** — scaffold, tokens, route groups, environment validation, Supabase clients, schema/migrations, seed data, auth, roles, RLS, and app shells.
2. **Lead MVP** — public pages, city routes, enquiry and success state, attribution, rate limiting/bot hook, consent capture, admin lead table/detail/follow-up, WhatsApp action.
3. **Registration** — captain invitation, passwordless sign-in, company/team/player workflow, documents, rules, consent, registration status, confirmations.
4. **Payment** — Razorpay adapter, mock mode, order/signature/webhook flow, receipts, manual payment/refund paths, admin/captain payment views.
5. **Retention** — preferences, future sport interests, opportunities, company history, consent withdrawal, reports, and safe exports.
6. **Hardening and QA** — role/access tests, RLS tests, payment verification/idempotency tests, Playwright end-to-end workflows, responsive/accessibility checks, production build, and concept-to-browser visual fidelity review.

## Assumptions requiring no invented content

- Exact dates, venues, slots, squad requirements, deadlines, documents, payment split, GST, refund terms, and rules start as unconfigured admin content.
- Public UI shows “to be announced”, “not configured”, or nothing until an organizer publishes a value.
- Demo data is visibly marked and cannot be mistaken for production data.
- The supplied logo remains the parent brand. A final tournament poster, official One Dream Cup lockup, sponsor assets, and gallery assets can be added when provided.
- Legal pages are templates marked for qualified legal review; the product will not claim legal compliance without that review.

## Approval gate

Implementation should begin only after the visual direction is accepted. Approval locks the visual hierarchy, section order, palette, typography direction, container model, responsive strategy, and visible above-the-fold copy. Requested changes should be made to these concepts before application scaffolding.
