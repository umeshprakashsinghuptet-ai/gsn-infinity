-- UPS Creator Studio v1.3 security hardening migration
-- Run once in Supabase SQL Editor as project owner.
-- This migration intentionally does NOT grant Super Admin to any account.
-- Bootstrap the first Super Admin manually using the guarded SQL in section 5.

begin;

-- 1) Ensure profile roles have a safe default.
alter table public.profiles
  alter column role set default 'tester';

-- 2) Prevent normal authenticated users from assigning/changing their own role.
-- Supabase service-role / SQL-owner operations have auth.uid() IS NULL and can
-- perform controlled administrative role changes from a trusted server/SQL session.
create or replace function public.ups_guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null then
    if tg_op = 'INSERT' then
      new.role := 'tester';
    elsif tg_op = 'UPDATE' and new.role is distinct from old.role then
      raise exception 'Profile role changes must be performed by an authorized administrator';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists ups_profiles_role_guard_insert on public.profiles;
drop trigger if exists ups_profiles_role_guard_update on public.profiles;
create trigger ups_profiles_role_guard_insert
before insert on public.profiles
for each row execute function public.ups_guard_profile_role();
create trigger ups_profiles_role_guard_update
before update of role on public.profiles
for each row execute function public.ups_guard_profile_role();

-- 3) Keep updated_at current.
create or replace function public.ups_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists ups_creator_projects_updated_at on public.creator_projects;
create trigger ups_creator_projects_updated_at
before update on public.creator_projects
for each row execute function public.ups_set_updated_at();

-- 4) Enforce owner-only project access. RLS is the security boundary.
alter table public.creator_projects enable row level security;

drop policy if exists "UPS users read own projects" on public.creator_projects;
drop policy if exists "UPS users insert own projects" on public.creator_projects;
drop policy if exists "UPS users update own projects" on public.creator_projects;
drop policy if exists "UPS users delete own projects" on public.creator_projects;

create policy "UPS users read own projects"
on public.creator_projects for select to authenticated
using (auth.uid() = user_id);

create policy "UPS users insert own projects"
on public.creator_projects for insert to authenticated
with check (auth.uid() = user_id);

create policy "UPS users update own projects"
on public.creator_projects for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "UPS users delete own projects"
on public.creator_projects for delete to authenticated
using (auth.uid() = user_id);

create index if not exists idx_ups_creator_projects_user_updated
on public.creator_projects(user_id, updated_at desc);

-- 5) Make the profile bucket private and set a per-bucket 5 MB cap.
-- The Free plan global limit shown in the dashboard remains 50 MB; this
-- per-bucket cap is an additional restriction for this bucket.
update storage.buckets
set public = false,
    file_size_limit = 5242880
where name = 'owner-private-profile';

commit;

-- IMPORTANT:
-- If the UPDATE above affects 0 rows, create the bucket first or verify its name.
-- Do not put the Supabase service_role key in config.js or browser code.
-- API/Data API exposure is configured in Supabase Dashboard > Settings > API,
-- not by this migration.
