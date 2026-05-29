begin;

-- SEC-4 (server-side half): lock URL columns to http/https schemes only.
-- Stops admin/coordinator from inserting javascript:, data:, vbscript: payloads
-- that would execute when a student clicks the link.
-- Pre-flight on prod data showed zero rows would violate.

alter table public.materials
  add constraint materials_url_scheme_check
  check (url is null or url ~* '^https?://[^[:space:]]+$') not valid;
alter table public.materials validate constraint materials_url_scheme_check;

alter table public.lessons
  add constraint lessons_online_url_scheme_check
  check (online_url is null or online_url ~* '^https?://[^[:space:]]+$') not valid;
alter table public.lessons validate constraint lessons_online_url_scheme_check;

alter table public.class_schedules
  add constraint class_schedules_online_url_scheme_check
  check (online_url is null or online_url ~* '^https?://[^[:space:]]+$') not valid;
alter table public.class_schedules validate constraint class_schedules_online_url_scheme_check;

commit;
