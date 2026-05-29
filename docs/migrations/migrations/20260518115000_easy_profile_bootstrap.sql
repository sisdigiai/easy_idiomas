insert into public.profiles (
  id,
  tenant_id,
  full_name,
  email,
  role,
  status
)
select
  u.id,
  '11111111-1111-4111-8111-111111111111'::uuid,
  coalesce(nullif(u.raw_user_meta_data->>'full_name', ''), split_part(u.email, '@', 1)),
  u.email,
  case
    when u.email in ('junior@oticastatymello.com.br', 'eliseueocara@easyidiomas.com') then 'admin'
    else 'student'
  end,
  'active'
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
);

create or replace function public.easy_handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
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
    '11111111-1111-4111-8111-111111111111'::uuid,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1)),
    new.email,
    case
      when new.email in ('junior@oticastatymello.com.br', 'eliseueocara@easyidiomas.com') then 'admin'
      else 'student'
    end,
    'active'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists easy_on_auth_user_created on auth.users;
create trigger easy_on_auth_user_created
after insert on auth.users
for each row execute function public.easy_handle_new_auth_user();

revoke all on function public.easy_handle_new_auth_user() from public;
