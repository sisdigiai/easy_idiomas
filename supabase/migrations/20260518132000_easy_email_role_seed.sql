begin;

-- SEC-7: replace the hard-coded admin allowlist in easy_handle_new_auth_user
-- with a tenant-scoped seed table.
--
-- Flow for onboarding a new admin/teacher of a tenant:
--   1. service role (or future RPC) inserts a row into email_role_seed
--      with (email, tenant_id, role).
--   2. invitee signs up in Supabase Auth.
--   3. trigger reads the seed row, creates the profile with the right
--      (tenant_id, role), and marks the seed row consumed for audit.
--
-- Fallback for emails not in the seed: legacy behavior is preserved
-- (EASY Idiomas tenant + student role) so current student signups keep
-- working. Locking the fallback to invite-only is a separate decision.

create table if not exists public.email_role_seed (
  email text primary key check (email = lower(email)),
  tenant_id uuid not null references public.tenants(id),
  role text not null check (role in ('admin','coordinator','teacher','student')),
  invited_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  consumed_at timestamptz,
  consumed_user_id uuid references auth.users(id)
);

create index if not exists idx_email_role_seed_tenant on public.email_role_seed(tenant_id);

-- Seed the two existing admins so the trigger keeps assigning them as admin.
insert into public.email_role_seed (email, tenant_id, role)
values
  ('junior@oticastatymello.com.br', '11111111-1111-4111-8111-111111111111'::uuid, 'admin'),
  ('eliseueocara@easyidiomas.com',  '11111111-1111-4111-8111-111111111111'::uuid, 'admin')
on conflict (email) do nothing;

alter table public.email_role_seed enable row level security;

drop policy if exists email_role_seed_admin_read on public.email_role_seed;
drop policy if exists email_role_seed_admin_write on public.email_role_seed;

create policy email_role_seed_admin_read
  on public.email_role_seed
  for select to authenticated
  using (tenant_id = public.easy_current_tenant_id() and public.easy_is_admin());

-- Writes blocked at the role grant level (no insert/update/delete to authenticated)
-- The policy is a belt-and-suspenders for future RPC-mediated writes.
create policy email_role_seed_admin_write
  on public.email_role_seed
  for all to authenticated
  using (tenant_id = public.easy_current_tenant_id() and public.easy_is_admin())
  with check (tenant_id = public.easy_current_tenant_id() and public.easy_is_admin());

revoke all on public.email_role_seed from public;
revoke all on public.email_role_seed from anon;
revoke insert, update, delete on public.email_role_seed from authenticated;
grant select on public.email_role_seed to authenticated;

create or replace function public.easy_handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_seed public.email_role_seed%rowtype;
  v_has_seed boolean := false;
  v_tenant_id uuid;
  v_role text;
begin
  select * into v_seed
  from public.email_role_seed
  where email = lower(new.email)
    and consumed_at is null
  limit 1;
  v_has_seed := found;

  if v_has_seed then
    v_tenant_id := v_seed.tenant_id;
    v_role := v_seed.role;
  else
    v_tenant_id := '11111111-1111-4111-8111-111111111111'::uuid;
    v_role := 'student';
  end if;

  insert into public.profiles (
    id,
    tenant_id,
    full_name,
    email,
    role,
    status
  )
  values (
    new.id,
    v_tenant_id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1)),
    new.email,
    v_role,
    'active'
  )
  on conflict (id) do nothing;

  if v_has_seed then
    update public.email_role_seed
       set consumed_at = now(),
           consumed_user_id = new.id
     where email = v_seed.email;
  end if;

  return new;
end;
$$;

-- Trigger function remains SECURITY DEFINER, but only callable from the trigger
-- context. SEC-1 already revoked direct EXECUTE; re-revoke here in case of order.
revoke execute on function public.easy_handle_new_auth_user() from public;
revoke execute on function public.easy_handle_new_auth_user() from anon;
revoke execute on function public.easy_handle_new_auth_user() from authenticated;

commit;
