-- EPFO/UAN is an optional player detail. Keep the legacy shirt-size column
-- during rollout so already registered players retain their historical data.
-- The application no longer reads or writes shirt_size.
alter table public.team_members
  add column if not exists epfo_number text;
