# One Dream Cup

Production-oriented tournament marketing, lead CRM, captain registration and payment operations for the One Dream Cup 50th Special Edition.

The app uses a premium dark-navy/gold public identity and warm, structured operational dashboards. It runs credential-free in an explicitly labelled demo mode and switches to Supabase and organizer-configured UPI collection when production configuration is supplied.

## Architecture

```text
Public site → validated lead API → demo store or Supabase → admin CRM
                                        ↓
Password auth → captain-owned team → rules → UPI payment → admin confirmation → receipt
                                        ↓
                              consent + audit history
```

- Next.js 16 App Router, React 19 and strict TypeScript
- Tailwind CSS 4 and shadcn/ui (Base UI primitives)
- React Hook Form and Zod at client/server boundaries
- Supabase PostgreSQL, Auth, RLS and private Storage architecture
- Manual UPI QR/app intent, captain review request and organizer receipt confirmation
- Reserved Razorpay server order, HMAC and webhook layer for a future provider-backed checkout
- Admin-created captain usernames with one-time WhatsApp activation links
- File-backed, `0600` demo store in `.data/` for local evaluation only
- Provider abstractions for analytics, notification and payment integrations

## Folder structure

```text
src/app/(public)       Public website, city pages and enquiry flow
src/app/(captain)      Protected captain registration workspace
src/app/(admin)        Protected operational CRM
src/app/api            Validated, role-checked APIs and webhooks
src/components         Public, form, captain, admin and shadcn components
src/lib                Domain models, services, validation, auth and providers
supabase/migrations    Relational schema, indexes and RLS policies
supabase/seed.sql      Non-secret tournament reference content
tests/e2e              Desktop and mobile Playwright workflows
design                 Approved concepts, visual record and QA captures
```

## Database summary

The migrations cover profiles and roles, companies, tournaments, city qualifiers, venues, campaigns and sources, leads and activities, follow-ups, teams and members, registrations and steps, payments/attempts/events/refunds, documents, announcements, consent history, communication preferences, marketing interests, opportunities, content, settings and append-only audit logs.

Important properties:

- UUID primary keys, timestamps and soft deletion where appropriate
- money stored as integer paise
- configurable lead stages via checked text values (easy to migrate to lookup tables)
- unique payment idempotency and webhook provider-event identifiers
- separate, append-only operational and marketing consent records
- composite/partial indexes for active pipeline, ownership and follow-ups
- captain policies bind records to `auth.uid()`; admin policies use `is_admin()`
- exact dates, venues, GST, refund, squad, document and schedule data remain unpublished until verified

The checked-in starter type is [database.types.ts](/Users/kirandn/Documents/One%20Dream%20Group/src/lib/supabase/database.types.ts). Regenerate it after applying migrations:

```bash
supabase gen types typescript --local > src/lib/supabase/database.types.ts
```

## Local setup

Node 20.9 or newer is required by the pinned Next.js version.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Demo mode is enabled by default.

### Demo access

Go to `/login`, then choose:

- **Preview captain portal** for team, player, rules, preferences and manual UPI-review workflows
- **Preview admin CRM** for leads, follow-ups, exports, teams, payments, content and reports

Demo mode is always labelled, uses non-payable UPI details and never contacts Razorpay. Delete `.data/one-dream-cup-demo.json` to regenerate pristine sample data on the next request.

## Environment variables

See [.env.example](/Users/kirandn/Documents/One%20Dream%20Group/.env.example).

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_DEMO_MODE` | `true` for isolated demo providers; set `false` for production |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL, auth callback, sitemap and metadata |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only lead/webhook operations; never expose to browser |
| `PAYMENT_UPI_ID` | Organizer-approved UPI ID encoded in the QR and payment intent |
| `PAYMENT_UPI_PAYEE_NAME` | Verified payee name displayed to captains |
| `PAYMENT_UPI_PHONE` | Organizer-approved payment phone shown for verification/contact |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Browser-safe Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Server-only order and payment-signature secret |
| `RAZORPAY_WEBHOOK_SECRET` | Independent webhook signing secret |
| `REQUEST_HASH_SECRET` | Key for privacy-preserving shared rate limits and consent evidence |
| `BOT_VERIFICATION_SECRET` | Optional server bot-verification integration point |

Environment validation fails with a clear message when production mode lacks required Supabase or request-protection values, or uses a non-HTTPS canonical URL.

## Supabase setup

1. Create a project and install the Supabase CLI.
2. Apply all migrations: `supabase db push`.
3. Load reference data locally with `supabase db reset`, or run `supabase/seed.sql` once in the SQL editor.
4. Create a private Storage bucket named `team-documents`.
5. Use signed, short-lived document URLs only after checking team ownership.
6. Run the connected policy cases documented in `tests/database/README.md`.
7. Keep public sign-up and Auth email delivery disabled.
8. Set production environment variables, then change `NEXT_PUBLIC_DEMO_MODE=false`.

### Create an administrator

Create each approved administrator in Supabase Auth with a confirmed email and strong password. The database trigger creates its profile; copy the UUID, then assign the approved role:

```sql
insert into public.profile_roles (profile_id, role)
values ('AUTH_USER_UUID', 'admin')
on conflict do nothing;
```

Do not share one administrator identity between staff. Captain identities are provisioned from the admin CRM and roles are never assigned from public browser input.

## Manual UPI setup

1. Add the organizer-approved `PAYMENT_UPI_ID`, `PAYMENT_UPI_PAYEE_NAME` and `PAYMENT_UPI_PHONE` values to the deployment environment.
2. Verify the generated QR and **Make payment** link in at least Google Pay, PhonePe and Paytm test workflows.
3. Publish verified GST treatment, payment schedule and refund terms.
4. Set the `app_settings.payments_enabled` JSON value to `true` only after that review.
5. Complete a small controlled payment, submit its UPI transaction ID, and confirm receipt from the admin Payments page before accepting registrations.

Captains open any installed UPI app with the payee, amount and registration reference prefilled, or scan the same payment intent as a QR. Selecting **Payment done** creates a `submitted` record; it does not mark the team paid. Only an authenticated administrator can confirm receipt and atomically move the payment and team registration to the confirmed state.

## Future Razorpay setup

1. Add the key ID and server secret to the deployment environment.
2. Configure the webhook URL as `https://YOUR_DOMAIN/api/webhooks/razorpay`.
3. Set a dedicated webhook secret and subscribe to payment captured/failed/refund events required by operations.
4. Reconnect the captain-facing action to provider checkout only after the organizer approves that change.
5. Complete a Razorpay test-mode payment and verify the order, server signature, webhook event and receipt before live keys.

The server never trusts client-side success. It verifies `order_id|payment_id`, checks captain ownership, writes idempotent payment records and independently verifies raw webhook bodies.

## Deployment

Recommended target: Vercel with Supabase hosted PostgreSQL.

Follow [PRODUCTION_SETUP.md](/Users/kirandn/Documents/One%20Dream%20Group/PRODUCTION_SETUP.md) for the fail-closed environment, password authentication, staging and operating runbook.

```bash
npm run verify
npm run test:e2e
```

Then import the repository into Vercel, add production environment variables to the correct environments, deploy, set the canonical URL, update the Supabase redirect allow-list and configure the Razorpay webhook.

Demo file persistence is for local preview only and is not suitable for serverless production. Production must run with Supabase.

## Security checklist

- [x] Server-side role checks on protected pages and mutations
- [x] Supabase RLS on every sensitive table
- [x] Captain ownership and IDOR checks
- [x] Zod validation and safe error responses
- [x] Shared Supabase rate limiting, race-safe duplicate detection and honeypot
- [x] Atomic lead and consent persistence
- [x] Invite-only password Auth with session refresh and safe role redirects
- [x] One-time, hashed captain activation links prepared for WhatsApp sharing
- [x] Separate required operational and optional marketing consent
- [x] Append-only consent, payment-event and audit evidence
- [x] Server-only provider secrets and environment validation
- [x] HMAC payment and raw-body webhook verification
- [x] Webhook and order idempotency constraints
- [x] CSV formula-injection protection
- [x] Private-document size/type/storage design and signed-link guidance
- [ ] External penetration test and legal/privacy review before launch

## Tests executed

- `npm run typecheck` — pass
- `npm run lint` — pass with zero warnings
- `npm test` — 25 unit, validation, UPI-intent, payment-signature, RLS and webhook-policy checks pass
- `npm run test:e2e` — 14 desktop/mobile Chromium checks pass; 2 intentional cross-project skips prevent duplicate mutation of the shared demo store
- `npm run build` — production build passes
- `npm audit --omit=dev` — 0 known dependency vulnerabilities
- In-app browser — public, form, captain and admin surfaces visually reviewed; console clean

Playwright covers verified public facts, public lead creation and CRM stage movement, success references, demo role separation, captain roster/rules/manual-UPI submission/admin confirmation/receipt/consent flows, IDOR rejection, mobile navigation and both 1366px and 390px layouts.

## Screenshots and visual record

- [Approved concepts](/Users/kirandn/Documents/One%20Dream%20Group/design/CONCEPTS.md)
- [Public desktop](/Users/kirandn/Documents/One%20Dream%20Group/design/qa/home-desktop-viewport.png)
- [Public mobile](/Users/kirandn/Documents/One%20Dream%20Group/design/qa/home-mobile-viewport.png)
- [Enquiry form](/Users/kirandn/Documents/One%20Dream%20Group/design/qa/register-desktop-viewport.png)
- [Captain dashboard](/Users/kirandn/Documents/One%20Dream%20Group/design/qa/captain-desktop-viewport.png)
- [Admin CRM](/Users/kirandn/Documents/One%20Dream%20Group/design/qa/admin-desktop-viewport.png)

## Assumptions

- Exact dates, venues, deadlines, squad limits, GST, refund terms, document requirements and full rules are unconfirmed.
- ₹14,500 is stored as ₹14,500.00 (`1,450,000` paise); prize values are stored the same way.
- Public enquiry does not reserve a slot or create a payment obligation.
- Captains manage the team; individual player accounts are out of scope for v1.
- Production payments remain gated until commercial terms are published.
- Privacy and terms copy is a clearly marked operational template, not a claim of legal compliance.

## Known limitations

- Content/settings and less-used admin modules have protected, schema-backed preview surfaces; organizer-specific CRUD rules must be finalized before enabling every mutation.
- Document upload stays closed because document requirements are not confirmed; private-storage schema and restrictions are ready.
- Manual bank transfer, partial-refund and administrator refund controls need the organizer's finance process, although the relational/event model supports them.
- Phone OTP and official WhatsApp Business messaging remain provider extension points.
- Connected Supabase policy tests require local/project credentials and are intentionally not faked by the credential-free suite.
- The public gallery intentionally waits for real organizer assets.

## Recommended next improvements

1. Confirm legal, finance, eligibility, document and refund policies.
2. Connect a Supabase staging project and run authenticated RLS integration tests.
3. Add organizer-approved content CRUD, slot controls and internal-note timeline UI.
4. Add validated private uploads only for confirmed document requirements.
5. Complete manual UPI reconciliation, refunds and tax-invoice requirements; then decide whether to activate provider checkout.
6. Add real transactional templates and WhatsApp Business only for permitted channels.
7. Replace gallery placeholders with supplied event media and captions.

## Production launch checklist

- [ ] Legal review completed for privacy, terms, consent and refunds
- [ ] Exact tournament facts approved and published by an accountable admin
- [ ] Supabase migrations, seed, backups and RLS tests verified in staging
- [ ] Admin accounts use controlled Auth identities; no shared demo access
- [ ] Private Storage bucket and signed URL expiry verified
- [ ] Organizer UPI details, QR/app intent, admin reconciliation, refunds and receipts verified
- [ ] Razorpay test mode, signatures and webhooks verified before any future activation
- [ ] Administrator identities and password custody approved
- [ ] Canonical URL, OG image, sitemap, robots and auth redirect allow-list verified
- [x] Rate limiting moved to shared Supabase infrastructure
- [ ] Accessibility, privacy, security and mobile regression pass completed
- [ ] `NEXT_PUBLIC_DEMO_MODE=false`; no test keys or sample data in production
- [ ] Incident, support, data-request and payment-dispute owners assigned

# One_Dream_Tour
