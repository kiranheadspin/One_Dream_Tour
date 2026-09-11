# Production setup

The code path is production-capable, but production is intentionally fail-closed until real Supabase, domain and organizer settings are supplied. Never commit `.env.local` or copy a service-role/API key into a `NEXT_PUBLIC_` variable.

## 1. Create and migrate Supabase

Create a hosted Supabase project in the deployment region that matches the expected users, then link this repository and apply every checked-in migration:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
npx supabase gen types typescript --linked > src/lib/supabase/database.types.ts
```

The migrations enable RLS on sensitive tables, add role policies, create profiles and one-time captain activation records, make public lead plus consent persistence atomic, and provide a privacy-preserving shared rate limiter. Review migration output in staging before applying it to an existing database; the active email/city lead constraint must be reconciled first if legacy duplicate rows exist.

The repository also owns the Auth policy in `supabase/config.toml`. It currently uses `https://onedreamcup.vercel.app` as the production origin. When the canonical domain changes, replace `site_url` with the exact new HTTPS origin, then run:

```bash
npx supabase config push
```

Confirm in the Supabase dashboard that:

1. The Auth site URL is the canonical HTTPS production URL.
2. Public sign-up, anonymous sign-in, and Auth email delivery remain disabled.
3. The ten-character password minimum, uppercase/lowercase/digit rules, authenticator-app MFA availability, and refresh-token rotation match `supabase/config.toml`.
5. Enable point-in-time recovery/backups appropriate to the project plan and test a restore in staging.
6. Keep the database, Auth and API security advisors clear before launch.

Create each administrator in Supabase Auth with a confirmed email and strong password. The database trigger creates a profile, but it never trusts browser input to assign a role. Copy the UUID, then assign the organizer-approved role in the SQL editor:

```sql
insert into public.profile_roles (profile_id, role)
values ('AUTH_USER_UUID', 'admin')
on conflict do nothing;
```

Do not create shared admin identities. Captains are created from an approved lead in the admin CRM; the application generates a username and one-time activation link for WhatsApp sharing.

## 2. Configure deployment secrets

Generate a non-public secret for keyed request/consent hashes:

```bash
openssl rand -hex 32
```

Set the result as `REQUEST_HASH_SECRET`, then add all production values from `.env.example` to the hosting provider's **Production** environment. The required core values are:

```dotenv
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SITE_URL=https://YOUR_DOMAIN
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SERVICE_ROLE_KEY
REQUEST_HASH_SECRET=AT_LEAST_32_RANDOM_CHARACTERS
```

`NEXT_PUBLIC_DEMO_MODE=false` requires HTTPS plus every core Supabase/security value. This makes a misconfigured production build fail instead of silently deploying the demo backend.

Configure the organizer-approved UPI variables only after the finance workflow is verified. Keep `payments_enabled` false in `app_settings` until fees, refund terms, payee identity and reconciliation have been approved.

## 3. Verify staging

Run the credential-free checks first:

```bash
NEXT_PUBLIC_DEMO_MODE=true npm run verify
NEXT_PUBLIC_DEMO_MODE=true npm run test:e2e
npm audit --omit=dev
```

Then deploy a staging build against a separate Supabase project with demo mode disabled and verify:

1. `/api/health` returns `200`.
2. A random username or email address receives no access.
3. An admin-created captain activation link works once, expires after 48 hours, and lets the captain set a conforming password.
4. Captain username/password sign-in returns to `/dashboard`; admin email/password sign-in returns to `/admin`.
5. Captain data cannot be accessed from the admin URL or vice versa.
6. One form submission creates one lead plus exactly two consent records without contacting an email service.
7. Repeating the same email/city returns the original reference without duplicate rows.
8. Rate limits remain effective across multiple deployment instances.
9. The connected RLS cases in `tests/database/README.md` pass with distinct anonymous, captain and admin clients.
10. Protected pages and APIs return `Cache-Control: private/no-store` when refreshing sessions, and logs contain no keys, raw IP addresses, activation tokens, or form payloads.

## 4. Operate it

- Monitor `/api/health`, Next.js/server errors, and Supabase database/Auth health.
- Set alerts for repeated `429`, `503`, and Auth failures.
- Purge expired `request_rate_limits` rows on a daily database schedule, for example `delete from public.request_rate_limits where expires_at < now() - interval '7 days';`.
- Rotate the Supabase service-role key and `REQUEST_HASH_SECRET` through the hosting secret manager; changing the hash secret intentionally starts new rate-limit identities.
- Document backup restore, incident response, data access/deletion and payment dispute owners before accepting real registrations.
