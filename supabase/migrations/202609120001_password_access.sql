begin;

alter table public.profiles
  add column if not exists username text,
  add column if not exists captain_activated_at timestamptz;

alter table public.profiles
  drop constraint if exists profiles_username_format_check;

alter table public.profiles
  add constraint profiles_username_format_check
  check (username is null or username ~ '^[a-z][a-z0-9._-]{4,31}$');

create unique index if not exists profiles_username_unique_idx
  on public.profiles (lower(username))
  where username is not null and deleted_at is null;

-- Captains may edit ordinary profile fields, but login identifiers and
-- activation state remain server-managed.
revoke update on table public.profiles from authenticated;
grant update (full_name, phone, updated_at) on table public.profiles to authenticated;

create table if not exists public.captain_activation_tokens (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  token_hash text not null unique check (char_length(token_hash) = 64),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  check (expires_at > created_at)
);

create index if not exists captain_activation_tokens_profile_idx
  on public.captain_activation_tokens (profile_id, created_at desc);

create index if not exists captain_activation_tokens_expiry_idx
  on public.captain_activation_tokens (expires_at)
  where used_at is null;

alter table public.captain_activation_tokens enable row level security;
revoke all on table public.captain_activation_tokens from public, anon, authenticated;
grant all on table public.captain_activation_tokens to service_role;

-- Email is no longer an application communication channel. Existing preference
-- rows contain no message content and can be removed safely.
delete from public.communication_preferences where channel = 'email';

alter table public.communication_preferences
  drop constraint if exists communication_preferences_channel_check;

alter table public.communication_preferences
  add constraint communication_preferences_channel_check
  check (channel in ('whatsapp', 'phone'));

commit;
