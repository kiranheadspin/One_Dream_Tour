# Supabase setup

1. Create a Supabase project and copy `.env.example` to `.env.local`.
2. Set the URL, anon key and service-role key. Keep the service-role key server-only.
3. Run all migrations with `supabase db push`, then seed with `supabase db reset` locally or execute `seed.sql` once in the SQL editor.
4. Invite users through Supabase Auth. The Auth trigger creates matching `profiles` rows; assign only organizer-approved `admin` or `captain` roles in `profile_roles`.
5. Create a private Storage bucket named `team-documents`. Generate short-lived signed URLs on the server after checking team ownership; never expose raw storage paths as public URLs.
6. Set `NEXT_PUBLIC_DEMO_MODE=false` only after all required variables exist.

The production-hardening migration also provides the service-only `submit_public_lead` and `consume_rate_limit` functions. They keep lead/consent writes transactional, make duplicate submissions race-safe and share rate limits across serverless instances. See `PRODUCTION_SETUP.md` for the complete staged rollout and Resend Auth configuration.

The migration keeps consent, payment-event and audit records append-only for application roles. Exact dates, venues, GST treatment, refund terms, squad limits, document requirements and payment schedules remain `null` until an administrator publishes verified values.
