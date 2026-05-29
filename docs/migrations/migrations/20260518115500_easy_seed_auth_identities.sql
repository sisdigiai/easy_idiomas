insert into auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  u.id::text,
  u.id,
  jsonb_build_object(
    'sub', u.id::text,
    'email', u.email,
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  u.last_sign_in_at,
  coalesce(u.created_at, now()),
  now()
from auth.users u
where u.email in (
  'eliseueocara@easyidiomas.com',
  'coordenador@easyidiomas.com',
  'professor@easyidiomas.com',
  'aluno@easyidiomas.com'
)
and not exists (
  select 1
  from auth.identities i
  where i.user_id = u.id
    and i.provider = 'email'
);
