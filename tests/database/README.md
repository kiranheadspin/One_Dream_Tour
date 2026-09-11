# Database policy verification

`src/lib/database-policy.test.ts` statically verifies that every sensitive table enables RLS, captain ownership uses `auth.uid()`, and consent/payment/audit event tables are append-only for application roles.

For a connected local Supabase stack, apply the migration and additionally verify these integration cases with separate authenticated clients:

1. A captain can select only the team where `captain_profile_id = auth.uid()`.
2. A captain cannot select or mutate another captain's `team_members`, `registrations`, `payments` or `documents`.
3. An anonymous client cannot select leads or insert payment/audit events.
4. An administrator can list and update leads through the authenticated role policy.
5. Application roles cannot update or delete consent, webhook or audit events.

These connected checks require project credentials and are intentionally not faked in the credential-free demo suite.
