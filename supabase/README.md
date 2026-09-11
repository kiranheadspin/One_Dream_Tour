# Supabase setup

1. Create a Supabase project and copy `.env.example` to `.env.local`.
2. Set the URL, anon key and service-role key. Keep the service-role key server-only.
3. Run all migrations with `supabase db push`, then seed with `supabase db reset` locally or execute `seed.sql` once in the SQL editor.
4. Create approved administrator email/password users through Supabase Auth and assign only the `admin` role in `profile_roles`. Captain accounts are provisioned by the admin CRM.
5. Create a private Storage bucket named `team-documents`. Generate short-lived signed URLs on the server after checking team ownership; never expose raw storage paths as public URLs.
6. Set `NEXT_PUBLIC_DEMO_MODE=false` only after all required variables exist.

The production-hardening migrations also provide service-only lead submission, rate limiting, captain username provisioning, and hashed one-time activation records. See `PRODUCTION_SETUP.md` for the complete staged rollout and password Auth configuration.

The migration keeps consent, payment-event and audit records append-only for application roles. Exact dates, venues, GST treatment, refund terms, squad limits, document requirements and payment schedules remain `null` until an administrator publishes verified values.
