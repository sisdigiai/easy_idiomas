begin;

-- SEC-FU2: lock the bootstrap trigger to invite-only.
-- Previously: a user signing up with an email not in email_role_seed was
-- silently provisioned as a student of EASY Idiomas (open enrollment).
-- Now: if the email is not in email_role_seed, NO profile is created. The
-- auth.users row exists but the user cannot access the app (ProtectedRoute
-- and RLS both deny without a profile row).
--
-- To onboard a real user from now on:
--   1. admin calls rpc_easy_invite_email(email, role) → adds to seed table
--   2. user signs up in Supabase Auth with the same email
--   3. trigger reads the seed row, creates the profile, marks consumed
create or replace function public.easy_handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_seed public.email_role_seed%rowtype;
begin
  select * into v_seed
  from public.email_role_seed
  where email = lower(new.email)
    and consumed_at is null
  limit 1;

  if not found then
    -- Invite-only: no profile for non-seeded emails.
    -- auth.users row stays (Supabase Auth manages it) but user is denied
    -- access to the app surface because no profile / RLS denies everything.
    return new;
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
    v_seed.tenant_id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1)),
    new.email,
    v_seed.role,
    'active'
  )
  on conflict (id) do nothing;

  update public.email_role_seed
     set consumed_at = now(),
         consumed_user_id = new.id
   where email = v_seed.email;

  return new;
end;
$$;

revoke execute on function public.easy_handle_new_auth_user() from public;
revoke execute on function public.easy_handle_new_auth_user() from anon;
revoke execute on function public.easy_handle_new_auth_user() from authenticated;

-- SEC-FU3: RPC for admins to populate email_role_seed for their tenant.
-- This is the only mutation path open to clients (table-level writes are
-- still revoked). Validates role, tenant, email format, and admin scope.
create or replace function public.rpc_easy_invite_email(
  p_email text,
  p_role text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_tenant_id uuid := public.easy_current_tenant_id();
  v_email text := lower(trim(coalesce(p_email, '')));
  v_seed public.email_role_seed%rowtype;
begin
  if v_user_id is null then
    raise exception 'authentication_required';
  end if;
  if not public.easy_is_admin() then
    raise exception 'forbidden';
  end if;
  if v_tenant_id is null then
    raise exception 'tenant_required';
  end if;
  if v_email = '' or v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'invalid_email';
  end if;
  if p_role not in ('admin','coordinator','teacher','student') then
    raise exception 'invalid_role';
  end if;

  insert into public.email_role_seed (email, tenant_id, role, invited_by)
  values (v_email, v_tenant_id, p_role, v_user_id)
  on conflict (email) do update
    set tenant_id = excluded.tenant_id,
        role = excluded.role,
        invited_by = excluded.invited_by,
        consumed_at = null,
        consumed_user_id = null
  returning * into v_seed;

  return to_jsonb(v_seed);
end;
$$;

revoke execute on function public.rpc_easy_invite_email(text, text) from public;
revoke execute on function public.rpc_easy_invite_email(text, text) from anon;
grant execute on function public.rpc_easy_invite_email(text, text) to authenticated;

commit;
