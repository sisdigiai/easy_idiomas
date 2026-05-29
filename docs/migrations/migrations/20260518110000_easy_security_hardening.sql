begin;

create extension if not exists pgcrypto;

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

insert into public.tenants (id, slug, name, status)
values ('11111111-1111-4111-8111-111111111111'::uuid, 'easy-idiomas', 'EASY Idiomas', 'active')
on conflict (slug) do update set name = excluded.name, status = excluded.status, updated_at = now();

alter table public.profiles add column if not exists tenant_id uuid;
alter table public.students add column if not exists tenant_id uuid;
alter table public.teachers add column if not exists tenant_id uuid;
alter table public.classes add column if not exists tenant_id uuid;
alter table public.student_classes add column if not exists tenant_id uuid;
alter table public.lessons add column if not exists tenant_id uuid;
alter table public.attendance_records add column if not exists tenant_id uuid;
alter table public.activities add column if not exists tenant_id uuid;
alter table public.student_activities add column if not exists tenant_id uuid;
alter table public.materials add column if not exists tenant_id uuid;
alter table public.lesson_plans add column if not exists tenant_id uuid;
alter table public.ai_suggestions add column if not exists tenant_id uuid;
alter table public.class_schedules add column if not exists tenant_id uuid;

alter table public.profiles add column if not exists deleted_at timestamptz;
alter table public.students add column if not exists deleted_at timestamptz;
alter table public.teachers add column if not exists deleted_at timestamptz;
alter table public.classes add column if not exists deleted_at timestamptz;
alter table public.student_classes add column if not exists deleted_at timestamptz;
alter table public.lessons add column if not exists deleted_at timestamptz;
alter table public.attendance_records add column if not exists deleted_at timestamptz;
alter table public.activities add column if not exists deleted_at timestamptz;
alter table public.student_activities add column if not exists deleted_at timestamptz;
alter table public.materials add column if not exists deleted_at timestamptz;
alter table public.lesson_plans add column if not exists deleted_at timestamptz;
alter table public.ai_suggestions add column if not exists deleted_at timestamptz;
alter table public.class_schedules add column if not exists deleted_at timestamptz;

update public.profiles set tenant_id = '11111111-1111-4111-8111-111111111111'::uuid where tenant_id is null;
update public.students set tenant_id = coalesce((select p.tenant_id from public.profiles p where p.id = students.profile_id), '11111111-1111-4111-8111-111111111111'::uuid) where tenant_id is null;
update public.teachers set tenant_id = coalesce((select p.tenant_id from public.profiles p where p.id = teachers.profile_id), '11111111-1111-4111-8111-111111111111'::uuid) where tenant_id is null;
update public.classes set tenant_id = coalesce((select t.tenant_id from public.teachers t where t.id = classes.teacher_id), '11111111-1111-4111-8111-111111111111'::uuid) where tenant_id is null;
update public.student_classes set tenant_id = coalesce((select s.tenant_id from public.students s where s.id = student_classes.student_id), (select c.tenant_id from public.classes c where c.id = student_classes.class_id), '11111111-1111-4111-8111-111111111111'::uuid) where tenant_id is null;
update public.lessons set tenant_id = coalesce((select c.tenant_id from public.classes c where c.id = lessons.class_id), (select t.tenant_id from public.teachers t where t.id = lessons.teacher_id), '11111111-1111-4111-8111-111111111111'::uuid) where tenant_id is null;
update public.attendance_records set tenant_id = coalesce((select l.tenant_id from public.lessons l where l.id = attendance_records.lesson_id), (select s.tenant_id from public.students s where s.id = attendance_records.student_id), '11111111-1111-4111-8111-111111111111'::uuid) where tenant_id is null;
update public.activities set tenant_id = coalesce((select c.tenant_id from public.classes c where c.id = activities.class_id), (select l.tenant_id from public.lessons l where l.id = activities.lesson_id), '11111111-1111-4111-8111-111111111111'::uuid) where tenant_id is null;
update public.student_activities set tenant_id = coalesce((select a.tenant_id from public.activities a where a.id = student_activities.activity_id), (select s.tenant_id from public.students s where s.id = student_activities.student_id), '11111111-1111-4111-8111-111111111111'::uuid) where tenant_id is null;
update public.materials set tenant_id = coalesce((select c.tenant_id from public.classes c where c.id = materials.class_id), (select l.tenant_id from public.lessons l where l.id = materials.lesson_id), '11111111-1111-4111-8111-111111111111'::uuid) where tenant_id is null;
update public.lesson_plans set tenant_id = coalesce((select l.tenant_id from public.lessons l where l.id = lesson_plans.lesson_id), (select p.tenant_id from public.profiles p where p.id = lesson_plans.created_by), '11111111-1111-4111-8111-111111111111'::uuid) where tenant_id is null;
update public.ai_suggestions set tenant_id = coalesce((select c.tenant_id from public.classes c where c.id = ai_suggestions.class_id), (select l.tenant_id from public.lessons l where l.id = ai_suggestions.lesson_id), (select p.tenant_id from public.profiles p where p.id = ai_suggestions.requested_by), '11111111-1111-4111-8111-111111111111'::uuid) where tenant_id is null;
update public.class_schedules set tenant_id = coalesce((select c.tenant_id from public.classes c where c.id = class_schedules.class_id), '11111111-1111-4111-8111-111111111111'::uuid) where tenant_id is null;

alter table public.profiles alter column tenant_id set not null;
alter table public.students alter column tenant_id set not null;
alter table public.teachers alter column tenant_id set not null;
alter table public.classes alter column tenant_id set not null;
alter table public.student_classes alter column tenant_id set not null;
alter table public.lessons alter column tenant_id set not null;
alter table public.attendance_records alter column tenant_id set not null;
alter table public.activities alter column tenant_id set not null;
alter table public.student_activities alter column tenant_id set not null;
alter table public.materials alter column tenant_id set not null;
alter table public.lesson_plans alter column tenant_id set not null;
alter table public.ai_suggestions alter column tenant_id set not null;
alter table public.class_schedules alter column tenant_id set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_tenant_id_fkey') then alter table public.profiles add constraint profiles_tenant_id_fkey foreign key (tenant_id) references public.tenants(id); end if;
  if not exists (select 1 from pg_constraint where conname = 'students_tenant_id_fkey') then alter table public.students add constraint students_tenant_id_fkey foreign key (tenant_id) references public.tenants(id); end if;
  if not exists (select 1 from pg_constraint where conname = 'teachers_tenant_id_fkey') then alter table public.teachers add constraint teachers_tenant_id_fkey foreign key (tenant_id) references public.tenants(id); end if;
  if not exists (select 1 from pg_constraint where conname = 'classes_tenant_id_fkey') then alter table public.classes add constraint classes_tenant_id_fkey foreign key (tenant_id) references public.tenants(id); end if;
  if not exists (select 1 from pg_constraint where conname = 'student_classes_tenant_id_fkey') then alter table public.student_classes add constraint student_classes_tenant_id_fkey foreign key (tenant_id) references public.tenants(id); end if;
  if not exists (select 1 from pg_constraint where conname = 'lessons_tenant_id_fkey') then alter table public.lessons add constraint lessons_tenant_id_fkey foreign key (tenant_id) references public.tenants(id); end if;
  if not exists (select 1 from pg_constraint where conname = 'attendance_records_tenant_id_fkey') then alter table public.attendance_records add constraint attendance_records_tenant_id_fkey foreign key (tenant_id) references public.tenants(id); end if;
  if not exists (select 1 from pg_constraint where conname = 'activities_tenant_id_fkey') then alter table public.activities add constraint activities_tenant_id_fkey foreign key (tenant_id) references public.tenants(id); end if;
  if not exists (select 1 from pg_constraint where conname = 'student_activities_tenant_id_fkey') then alter table public.student_activities add constraint student_activities_tenant_id_fkey foreign key (tenant_id) references public.tenants(id); end if;
  if not exists (select 1 from pg_constraint where conname = 'materials_tenant_id_fkey') then alter table public.materials add constraint materials_tenant_id_fkey foreign key (tenant_id) references public.tenants(id); end if;
  if not exists (select 1 from pg_constraint where conname = 'lesson_plans_tenant_id_fkey') then alter table public.lesson_plans add constraint lesson_plans_tenant_id_fkey foreign key (tenant_id) references public.tenants(id); end if;
  if not exists (select 1 from pg_constraint where conname = 'ai_suggestions_tenant_id_fkey') then alter table public.ai_suggestions add constraint ai_suggestions_tenant_id_fkey foreign key (tenant_id) references public.tenants(id); end if;
  if not exists (select 1 from pg_constraint where conname = 'class_schedules_tenant_id_fkey') then alter table public.class_schedules add constraint class_schedules_tenant_id_fkey foreign key (tenant_id) references public.tenants(id); end if;
  if not exists (select 1 from pg_constraint where conname = 'students_profile_id_unique') then alter table public.students add constraint students_profile_id_unique unique (profile_id); end if;
  if not exists (select 1 from pg_constraint where conname = 'teachers_profile_id_unique') then alter table public.teachers add constraint teachers_profile_id_unique unique (profile_id); end if;
  if not exists (select 1 from pg_constraint where conname = 'student_classes_student_class_unique') then alter table public.student_classes add constraint student_classes_student_class_unique unique (student_id, class_id); end if;
  if not exists (select 1 from pg_constraint where conname = 'attendance_records_lesson_student_unique') then alter table public.attendance_records add constraint attendance_records_lesson_student_unique unique (lesson_id, student_id); end if;
  if not exists (select 1 from pg_constraint where conname = 'student_activities_activity_student_unique') then alter table public.student_activities add constraint student_activities_activity_student_unique unique (activity_id, student_id); end if;
end $$;

create index if not exists idx_profiles_tenant_id on public.profiles(tenant_id);
create index if not exists idx_students_tenant_id on public.students(tenant_id);
create index if not exists idx_teachers_tenant_id on public.teachers(tenant_id);
create index if not exists idx_classes_tenant_id on public.classes(tenant_id);
create index if not exists idx_student_classes_tenant_id on public.student_classes(tenant_id);
create index if not exists idx_lessons_tenant_id on public.lessons(tenant_id);
create index if not exists idx_attendance_records_tenant_id on public.attendance_records(tenant_id);
create index if not exists idx_activities_tenant_id on public.activities(tenant_id);
create index if not exists idx_materials_tenant_id on public.materials(tenant_id);

create or replace function public.easy_current_tenant_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select tenant_id from public.profiles where id = auth.uid() and deleted_at is null limit 1;
$$;

create or replace function public.easy_current_role()
returns text
language sql stable security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and deleted_at is null and status = 'active' limit 1;
$$;

create or replace function public.easy_is_admin_or_coordinator()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce(public.easy_current_role() in ('admin','coordinator'), false);
$$;

create or replace function public.easy_is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce(public.easy_current_role() = 'admin', false);
$$;

create or replace function public.easy_current_teacher_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select id from public.teachers where profile_id = auth.uid() and deleted_at is null and status = 'active' limit 1;
$$;

create or replace function public.easy_current_student_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select id from public.students where profile_id = auth.uid() and deleted_at is null and status = 'active' limit 1;
$$;

create or replace function public.easy_can_access_class(p_class_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce(
    public.easy_is_admin_or_coordinator()
    or exists (
      select 1 from public.classes c
      where c.id = p_class_id
        and c.tenant_id = public.easy_current_tenant_id()
        and c.deleted_at is null
        and c.teacher_id = public.easy_current_teacher_id()
    )
    or exists (
      select 1 from public.student_classes sc
      where sc.class_id = p_class_id
        and sc.tenant_id = public.easy_current_tenant_id()
        and sc.deleted_at is null
        and sc.status = 'active'
        and sc.student_id = public.easy_current_student_id()
    ), false
  );
$$;

create or replace function public.easy_can_access_lesson(p_lesson_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce(exists (
    select 1 from public.lessons l
    where l.id = p_lesson_id
      and l.tenant_id = public.easy_current_tenant_id()
      and l.deleted_at is null
      and public.easy_can_access_class(l.class_id)
  ), false);
$$;

alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.teachers enable row level security;
alter table public.classes enable row level security;
alter table public.student_classes enable row level security;
alter table public.lessons enable row level security;
alter table public.attendance_records enable row level security;
alter table public.activities enable row level security;
alter table public.student_activities enable row level security;
alter table public.materials enable row level security;
alter table public.lesson_plans enable row level security;
alter table public.ai_suggestions enable row level security;
alter table public.class_schedules enable row level security;

do $$
declare r record;
begin
  for r in select schemaname, tablename, policyname from pg_policies where schemaname = 'public' loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

create policy easy_tenants_select on public.tenants for select to authenticated using (id = public.easy_current_tenant_id() or public.easy_is_admin());
create policy easy_profiles_select on public.profiles for select to authenticated using (deleted_at is null and (id = auth.uid() or (tenant_id = public.easy_current_tenant_id() and public.easy_is_admin_or_coordinator())));
create policy easy_profiles_update_self on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid() and tenant_id = public.easy_current_tenant_id());
create policy easy_profiles_admin_write on public.profiles for all to authenticated using (tenant_id = public.easy_current_tenant_id() and public.easy_is_admin()) with check (tenant_id = public.easy_current_tenant_id() and public.easy_is_admin());

create policy easy_students_select on public.students for select to authenticated using (deleted_at is null and tenant_id = public.easy_current_tenant_id() and (public.easy_is_admin_or_coordinator() or profile_id = auth.uid() or exists (select 1 from public.student_classes sc join public.classes c on c.id = sc.class_id where sc.student_id = students.id and sc.deleted_at is null and c.deleted_at is null and c.teacher_id = public.easy_current_teacher_id())));
create policy easy_students_admin_write on public.students for all to authenticated using (tenant_id = public.easy_current_tenant_id() and public.easy_is_admin_or_coordinator()) with check (tenant_id = public.easy_current_tenant_id() and public.easy_is_admin_or_coordinator());
create policy easy_teachers_select on public.teachers for select to authenticated using (deleted_at is null and tenant_id = public.easy_current_tenant_id() and (public.easy_is_admin_or_coordinator() or profile_id = auth.uid() or exists (select 1 from public.classes c join public.student_classes sc on sc.class_id = c.id where c.teacher_id = teachers.id and sc.student_id = public.easy_current_student_id() and c.deleted_at is null and sc.deleted_at is null)));
create policy easy_teachers_admin_write on public.teachers for all to authenticated using (tenant_id = public.easy_current_tenant_id() and public.easy_is_admin_or_coordinator()) with check (tenant_id = public.easy_current_tenant_id() and public.easy_is_admin_or_coordinator());
create policy easy_classes_select on public.classes for select to authenticated using (deleted_at is null and tenant_id = public.easy_current_tenant_id() and public.easy_can_access_class(id));
create policy easy_classes_admin_write on public.classes for all to authenticated using (tenant_id = public.easy_current_tenant_id() and public.easy_is_admin_or_coordinator()) with check (tenant_id = public.easy_current_tenant_id() and public.easy_is_admin_or_coordinator());
create policy easy_student_classes_select on public.student_classes for select to authenticated using (deleted_at is null and tenant_id = public.easy_current_tenant_id() and (public.easy_is_admin_or_coordinator() or student_id = public.easy_current_student_id() or exists (select 1 from public.classes c where c.id = student_classes.class_id and c.teacher_id = public.easy_current_teacher_id() and c.deleted_at is null)));
create policy easy_student_classes_admin_write on public.student_classes for all to authenticated using (tenant_id = public.easy_current_tenant_id() and public.easy_is_admin_or_coordinator()) with check (tenant_id = public.easy_current_tenant_id() and public.easy_is_admin_or_coordinator());
create policy easy_lessons_select on public.lessons for select to authenticated using (deleted_at is null and tenant_id = public.easy_current_tenant_id() and public.easy_can_access_lesson(id));
create policy easy_lessons_staff_write on public.lessons for all to authenticated using (tenant_id = public.easy_current_tenant_id() and (public.easy_is_admin_or_coordinator() or teacher_id = public.easy_current_teacher_id())) with check (tenant_id = public.easy_current_tenant_id() and (public.easy_is_admin_or_coordinator() or teacher_id = public.easy_current_teacher_id()));
create policy easy_attendance_select on public.attendance_records for select to authenticated using (deleted_at is null and tenant_id = public.easy_current_tenant_id() and (public.easy_is_admin_or_coordinator() or student_id = public.easy_current_student_id() or public.easy_can_access_lesson(lesson_id)));
create policy easy_attendance_staff_write on public.attendance_records for all to authenticated using (tenant_id = public.easy_current_tenant_id() and (public.easy_is_admin_or_coordinator() or public.easy_can_access_lesson(lesson_id))) with check (tenant_id = public.easy_current_tenant_id() and (public.easy_is_admin_or_coordinator() or public.easy_can_access_lesson(lesson_id) or student_id = public.easy_current_student_id()));
create policy easy_activities_select on public.activities for select to authenticated using (deleted_at is null and tenant_id = public.easy_current_tenant_id() and public.easy_can_access_class(class_id));
create policy easy_activities_staff_write on public.activities for all to authenticated using (tenant_id = public.easy_current_tenant_id() and (public.easy_is_admin_or_coordinator() or public.easy_can_access_class(class_id))) with check (tenant_id = public.easy_current_tenant_id() and (public.easy_is_admin_or_coordinator() or public.easy_can_access_class(class_id)));
create policy easy_student_activities_select on public.student_activities for select to authenticated using (deleted_at is null and tenant_id = public.easy_current_tenant_id() and (public.easy_is_admin_or_coordinator() or student_id = public.easy_current_student_id() or exists (select 1 from public.activities a where a.id = student_activities.activity_id and public.easy_can_access_class(a.class_id))));
create policy easy_student_activities_staff_write on public.student_activities for all to authenticated using (tenant_id = public.easy_current_tenant_id() and (public.easy_is_admin_or_coordinator() or exists (select 1 from public.activities a where a.id = student_activities.activity_id and public.easy_can_access_class(a.class_id)))) with check (tenant_id = public.easy_current_tenant_id() and (public.easy_is_admin_or_coordinator() or student_id = public.easy_current_student_id() or exists (select 1 from public.activities a where a.id = student_activities.activity_id and public.easy_can_access_class(a.class_id))));
create policy easy_materials_select on public.materials for select to authenticated using (deleted_at is null and tenant_id = public.easy_current_tenant_id() and public.easy_can_access_class(class_id));
create policy easy_materials_staff_write on public.materials for all to authenticated using (tenant_id = public.easy_current_tenant_id() and (public.easy_is_admin_or_coordinator() or public.easy_can_access_class(class_id))) with check (tenant_id = public.easy_current_tenant_id() and (public.easy_is_admin_or_coordinator() or public.easy_can_access_class(class_id)));
create policy easy_lesson_plans_select on public.lesson_plans for select to authenticated using (deleted_at is null and tenant_id = public.easy_current_tenant_id() and (public.easy_is_admin_or_coordinator() or created_by = auth.uid() or public.easy_can_access_lesson(lesson_id)));
create policy easy_lesson_plans_staff_write on public.lesson_plans for all to authenticated using (tenant_id = public.easy_current_tenant_id() and (public.easy_is_admin_or_coordinator() or created_by = auth.uid() or public.easy_can_access_lesson(lesson_id))) with check (tenant_id = public.easy_current_tenant_id() and (public.easy_is_admin_or_coordinator() or created_by = auth.uid() or public.easy_can_access_lesson(lesson_id)));
create policy easy_ai_suggestions_select on public.ai_suggestions for select to authenticated using (deleted_at is null and tenant_id = public.easy_current_tenant_id() and (public.easy_is_admin_or_coordinator() or requested_by = auth.uid() or public.easy_can_access_class(class_id) or public.easy_can_access_lesson(lesson_id)));
create policy easy_ai_suggestions_staff_write on public.ai_suggestions for all to authenticated using (tenant_id = public.easy_current_tenant_id() and (public.easy_is_admin_or_coordinator() or requested_by = auth.uid() or public.easy_can_access_class(class_id) or public.easy_can_access_lesson(lesson_id))) with check (tenant_id = public.easy_current_tenant_id() and (public.easy_is_admin_or_coordinator() or requested_by = auth.uid() or public.easy_can_access_class(class_id) or public.easy_can_access_lesson(lesson_id)));
create policy easy_class_schedules_select on public.class_schedules for select to authenticated using (deleted_at is null and tenant_id = public.easy_current_tenant_id() and public.easy_can_access_class(class_id));
create policy easy_class_schedules_staff_write on public.class_schedules for all to authenticated using (tenant_id = public.easy_current_tenant_id() and (public.easy_is_admin_or_coordinator() or public.easy_can_access_class(class_id))) with check (tenant_id = public.easy_current_tenant_id() and (public.easy_is_admin_or_coordinator() or public.easy_can_access_class(class_id)));

create or replace view public.v_easy_students with (security_invoker = true) as select id, tenant_id, profile_id, full_name, student_code, email, phone, status, main_language, current_level, created_at, updated_at from public.students where deleted_at is null;
create or replace view public.v_easy_teachers with (security_invoker = true) as select id, tenant_id, profile_id, full_name, email, phone, languages, status, created_at, updated_at from public.teachers where deleted_at is null;
create or replace view public.v_easy_classes with (security_invoker = true) as select id, tenant_id, name, language, level, teacher_id, status, created_at, updated_at from public.classes where deleted_at is null;
create or replace view public.v_easy_student_classes with (security_invoker = true) as select id, tenant_id, student_id, class_id, status, created_at from public.student_classes where deleted_at is null;
create or replace view public.v_easy_lessons with (security_invoker = true) as select id, tenant_id, class_id, teacher_id, title, lesson_type, room, scheduled_date, start_time, end_time, status, qr_code_token, qr_expires_at, created_by, approved_by, approved_at, online_url, lesson_objective, topic, created_at, updated_at from public.lessons where deleted_at is null;
create or replace view public.v_easy_attendance_records with (security_invoker = true) as select id, tenant_id, lesson_id, student_id, status, check_in_at, source, created_at from public.attendance_records where deleted_at is null;
create or replace view public.v_easy_activities with (security_invoker = true) as select id, tenant_id, lesson_id, class_id, title, activity_type, description, due_date, status, created_at, updated_at from public.activities where deleted_at is null;
create or replace view public.v_easy_student_activities with (security_invoker = true) as select id, tenant_id, activity_id, student_id, status, submitted_at, completed_at, notes, created_at, updated_at from public.student_activities where deleted_at is null;
create or replace view public.v_easy_materials with (security_invoker = true) as select id, tenant_id, lesson_id, class_id, title, material_type, url, description, created_at, updated_at from public.materials where deleted_at is null;
create or replace view public.v_easy_lesson_plans with (security_invoker = true) as select id, tenant_id, lesson_id, created_by, source, title, objective, agenda, warmup_activity, main_activity, practice_activity, homework, teacher_notes, approved_by, approved_at, status, created_at, updated_at from public.lesson_plans where deleted_at is null;
create or replace view public.v_easy_ai_suggestions with (security_invoker = true) as select id, tenant_id, requested_by, lesson_id, class_id, suggestion_type, prompt_input, suggestion_output, status, reviewed_by, reviewed_at, created_at from public.ai_suggestions where deleted_at is null;
create or replace view public.v_easy_class_schedules with (security_invoker = true) as select id, tenant_id, class_id, weekday, start_time, end_time, room, lesson_type, online_url, active, created_at, updated_at from public.class_schedules where deleted_at is null;

create or replace function public.rpc_easy_generate_lesson_qr(p_lesson_id uuid, p_ttl_minutes integer default 10)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_lesson public.lessons%rowtype;
  v_token text := gen_random_uuid()::text;
  v_expires_at timestamptz := now() + make_interval(mins => greatest(1, least(coalesce(p_ttl_minutes, 10), 60)));
begin
  select * into v_lesson from public.lessons where id = p_lesson_id and deleted_at is null;
  if not found then
    raise exception 'lesson_not_found';
  end if;
  if not (public.easy_is_admin_or_coordinator() or v_lesson.teacher_id = public.easy_current_teacher_id()) then
    raise exception 'forbidden';
  end if;
  update public.lessons set qr_code_token = v_token, qr_expires_at = v_expires_at, updated_at = now() where id = p_lesson_id;
  return jsonb_build_object('lesson_id', p_lesson_id, 'token', v_token, 'expires_at', v_expires_at);
end;
$$;

create or replace function public.rpc_easy_register_checkin(p_token text)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_lesson public.lessons%rowtype;
  v_student_id uuid := public.easy_current_student_id();
  v_attendance_id uuid;
begin
  if v_student_id is null then
    raise exception 'student_profile_required';
  end if;
  select * into v_lesson from public.lessons where qr_code_token = p_token and qr_expires_at > now() and deleted_at is null limit 1;
  if not found then
    raise exception 'qr_code_invalid_or_expired';
  end if;
  if not exists (select 1 from public.student_classes sc where sc.student_id = v_student_id and sc.class_id = v_lesson.class_id and sc.tenant_id = v_lesson.tenant_id and sc.status = 'active' and sc.deleted_at is null) then
    raise exception 'student_not_enrolled_in_class';
  end if;
  insert into public.attendance_records (tenant_id, lesson_id, student_id, status, check_in_at, source)
  values (v_lesson.tenant_id, v_lesson.id, v_student_id, 'present', now(), 'qr_code')
  on conflict (lesson_id, student_id) do update set status = 'present', check_in_at = excluded.check_in_at, source = 'qr_code', deleted_at = null
  returning id into v_attendance_id;
  return jsonb_build_object('attendance_id', v_attendance_id, 'lesson_id', v_lesson.id, 'student_id', v_student_id, 'status', 'present');
end;
$$;

revoke execute on function public.rpc_easy_generate_lesson_qr(uuid, integer) from public;
revoke execute on function public.rpc_easy_register_checkin(text) from public;
grant execute on function public.rpc_easy_generate_lesson_qr(uuid, integer) to authenticated;
grant execute on function public.rpc_easy_register_checkin(text) to authenticated;

grant execute on function public.easy_current_tenant_id() to authenticated;
grant execute on function public.easy_current_role() to authenticated;
grant execute on function public.easy_is_admin_or_coordinator() to authenticated;
grant execute on function public.easy_is_admin() to authenticated;
grant execute on function public.easy_current_teacher_id() to authenticated;
grant execute on function public.easy_current_student_id() to authenticated;
grant execute on function public.easy_can_access_class(uuid) to authenticated;
grant execute on function public.easy_can_access_lesson(uuid) to authenticated;

revoke all privileges on all tables in schema public from anon;
revoke insert, update, delete on all tables in schema public from authenticated;
grant select on public.tenants to authenticated;
grant select on public.profiles, public.students, public.teachers, public.classes, public.student_classes, public.lessons, public.attendance_records, public.activities, public.student_activities, public.materials, public.lesson_plans, public.ai_suggestions, public.class_schedules to authenticated;
grant select on public.v_easy_students, public.v_easy_teachers, public.v_easy_classes, public.v_easy_student_classes, public.v_easy_lessons, public.v_easy_attendance_records, public.v_easy_activities, public.v_easy_student_activities, public.v_easy_materials, public.v_easy_lesson_plans, public.v_easy_ai_suggestions, public.v_easy_class_schedules to authenticated;

commit;
