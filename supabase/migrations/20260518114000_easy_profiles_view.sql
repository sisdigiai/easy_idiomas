create or replace view public.v_easy_profiles
with (security_invoker = true) as
select
  id,
  tenant_id,
  full_name,
  email,
  role,
  avatar_url,
  status,
  created_at,
  updated_at
from public.profiles
where deleted_at is null;

revoke all privileges on public.v_easy_profiles from anon;
grant select on public.v_easy_profiles to authenticated;
