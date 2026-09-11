# Production setup

The code path is production-capable, but production is intentionally fail-closed until real Supabase, Resend, domain and organizer settings are supplied. Never commit `.env.local` or copy a service-role/API key into a `NEXT_PUBLIC_` variable.

## 1. Create and migrate Supabase

Create a hosted Supabase project in the deployment region that matches the expected users, then link this repository and apply every checked-in migration:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
npx supabase gen types typescript --linked > src/lib/supabase/database.types.ts
```

The migrations enable RLS on sensitive tables, add role policies, create invite-time profiles, make public lead plus consent persistence atomic, and provide a privacy-preserving shared rate limiter. Review migration output in staging before applying it to an existing database; the active email/city lead constraint must be reconciled first if legacy duplicate rows exist.

The repository also owns the Auth policy in `supabase/config.toml`. It currently uses `https://onedreamcup.vercel.app` as the production origin. When the canonical domain changes, replace `site_url` and `additional_redirect_urls` with the exact new HTTPS origin and callback, then run:

```bash
npx supabase config push
```

Confirm in the Supabase dashboard that:

1. The Auth site URL is the canonical HTTPS production URL.
2. `https://YOUR_DOMAIN/auth/callback` is in the redirect allow-list. A preview URL belongs only in a non-production project.
3. Public email sign-up and anonymous sign-in remain disabled. The application also sends OTP with `shouldCreateUser: false`.
4. Email confirmation, authenticator-app MFA availability, eight-digit OTPs, one-hour expiry and refresh-token rotation match `supabase/config.toml`.
5. Enable point-in-time recovery/backups appropriate to the project plan and test a restore in staging.
6. Keep the database, Auth and API security advisors clear before launch.

The checked-in migration creates a profile when a user is invited, but it never trusts browser input to assign a role. Invite the user in Supabase Auth, then assign the organizer-approved role in the SQL editor:

```sql
insert into public.profile_roles (profile_id, role)
values ('AUTH_USER_UUID', 'captain')
on conflict do nothing;
```

Use `admin` only for controlled operations accounts. Do not create shared admin identities.

## 2. Configure Resend

Add and verify the sending domain in Resend, including its DNS records. Create a sending-only API key for the web application and set:

```dotenv
RESEND_API_KEY=re_replace_me
NOTIFICATION_FROM_EMAIL=registrations@YOUR_DOMAIN
ADMIN_NOTIFICATION_EMAIL=operations@YOUR_DOMAIN
NOTIFICATION_REPLY_TO_EMAIL=support@YOUR_DOMAIN
```

The enquiry handler sends two idempotent messages through the Resend API: a receipt to the submitter and an alert to operations. Delivery runs after the response, so a provider outage does not undo or misreport a database commit. Monitor failures in deployment logs and Resend delivery/webhook events.

Use the Resend Supabase integration for Auth magic links. In Resend, open **Integrations**, connect the production Supabase project, select the verified domain and configure the sender. If configuring SMTP manually, use `smtp.resend.com`, username `resend`, the Resend API key as password, and an encrypted SMTP port supported by Resend. Use a separate key from the application key where practical.

## 3. Configure deployment secrets

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
RESEND_API_KEY=YOUR_SERVER_ONLY_RESEND_KEY
NOTIFICATION_FROM_EMAIL=registrations@YOUR_DOMAIN
ADMIN_NOTIFICATION_EMAIL=operations@YOUR_DOMAIN
REQUEST_HASH_SECRET=AT_LEAST_32_RANDOM_CHARACTERS
```

`NEXT_PUBLIC_DEMO_MODE=false` requires HTTPS plus every core Supabase/Resend/security value. This makes a misconfigured production build fail instead of silently deploying the demo backend.

Configure the organizer-approved UPI variables only after the finance workflow is verified. Keep `payments_enabled` false in `app_settings` until fees, refund terms, payee identity and reconciliation have been approved.

## 4. Verify staging

Run the credential-free checks first:

```bash
NEXT_PUBLIC_DEMO_MODE=true npm run verify
NEXT_PUBLIC_DEMO_MODE=true npm run test:e2e
npm audit --omit=dev
```

Then deploy a staging build against a separate Supabase project with demo mode disabled and verify:

1. `/api/health` returns `200`.
2. A random email address is not provisioned and receives no access.
3. An invited captain magic link returns to the requested `/dashboard/...` route.
4. An admin magic link returns to `/admin`; captain data cannot be accessed from the admin URL or vice versa.
5. One form submission creates one lead plus exactly two consent records and sends two Resend messages.
6. Repeating the same email/city returns the original reference without duplicate rows or emails.
7. Rate limits remain effective across multiple deployment instances.
8. The connected RLS cases in `tests/database/README.md` pass with distinct anonymous, captain and admin clients.
9. Auth callback, protected pages and APIs return `Cache-Control: private/no-store` when refreshing sessions.
10. Logs and error responses contain no keys, raw IP addresses or form payloads.

## 5. Operate it

- Monitor `/api/health`, Next.js/server errors, Supabase database/Auth health and Resend delivery failures.
- Set alerts for repeated `429`, `503`, Auth failures and email bounces.
- Purge expired `request_rate_limits` rows on a daily database schedule, for example `delete from public.request_rate_limits where expires_at < now() - interval '7 days';`.
- Rotate the Supabase service-role key, Resend key and `REQUEST_HASH_SECRET` through the hosting secret manager; changing the hash secret intentionally starts new rate-limit identities.
- Document backup restore, incident response, data access/deletion and payment dispute owners before accepting real registrations.
