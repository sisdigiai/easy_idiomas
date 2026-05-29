begin;

drop view if exists public.view_dashboard_summary;
drop view if exists public.view_student_progress;
drop view if exists public.view_class_attendance_summary;
drop view if exists public.view_pending_activities;

create or replace view public.view_dashboard_summary with (security_invoker = true) as
select
  (select count(*) from public.students where status = 'active' and deleted_at is null) as active_students,
  (select count(*) from public.lessons where scheduled_date >= current_date and scheduled_date < current_date + 7 and deleted_at is null) as weekly_classes,
  (select coalesce(avg(case when status = 'present' then 1 else 0 end) * 100, 0) from public.attendance_records where deleted_at is null) as avg_attendance_percentage,
  (select count(*) from public.student_activities where status = 'pending' and deleted_at is null) as pending_activities;

create or replace view public.view_student_progress with (security_invoker = true) as
select
  s.tenant_id,
  s.id as student_id,
  s.full_name,
  s.main_language,
  s.current_level,
  count(sa.id) filter (where sa.status = 'completed' and sa.deleted_at is null) as completed_activities,
  count(sa.id) filter (where sa.deleted_at is null) as total_activities,
  round(
    coalesce(
      (count(sa.id) filter (where sa.status = 'completed' and sa.deleted_at is null)::numeric / nullif(count(sa.id) filter (where sa.deleted_at is null), 0)) * 100,
      0
    ),
    2
  ) as progress_percentage
from public.students s
left join public.student_activities sa on sa.student_id = s.id and sa.tenant_id = s.tenant_id
where s.deleted_at is null
group by s.tenant_id, s.id, s.full_name, s.main_language, s.current_level;

create or replace view public.view_class_attendance_summary with (security_invoker = true) as
select
  c.tenant_id,
  c.id as class_id,
  c.name as class_name,
  l.id as lesson_id,
  l.title as lesson_title,
  count(ar.id) filter (where ar.status = 'present' and ar.deleted_at is null) as present_count,
  count(sc.student_id) filter (where sc.deleted_at is null) - count(ar.id) filter (where ar.status = 'present' and ar.deleted_at is null) as absent_count,
  count(sc.student_id) filter (where sc.deleted_at is null) as total_students
from public.classes c
join public.lessons l on l.class_id = c.id and l.tenant_id = c.tenant_id and l.deleted_at is null
left join public.student_classes sc on sc.class_id = c.id and sc.tenant_id = c.tenant_id and sc.deleted_at is null
left join public.attendance_records ar on ar.lesson_id = l.id and ar.student_id = sc.student_id and ar.tenant_id = c.tenant_id and ar.deleted_at is null
where c.deleted_at is null
group by c.tenant_id, c.id, c.name, l.id, l.title;

create or replace view public.view_pending_activities with (security_invoker = true) as
select
  sa.tenant_id,
  sa.id as student_activity_id,
  s.full_name as student_name,
  a.title as activity_title,
  a.due_date,
  c.name as class_name
from public.student_activities sa
join public.students s on s.id = sa.student_id and s.tenant_id = sa.tenant_id and s.deleted_at is null
join public.activities a on a.id = sa.activity_id and a.tenant_id = sa.tenant_id and a.deleted_at is null
join public.classes c on c.id = a.class_id and c.tenant_id = sa.tenant_id and c.deleted_at is null
where sa.status = 'pending'
  and sa.deleted_at is null;

revoke execute on function public.easy_current_tenant_id() from public;
revoke execute on function public.easy_current_role() from public;
revoke execute on function public.easy_is_admin_or_coordinator() from public;
revoke execute on function public.easy_is_admin() from public;
revoke execute on function public.easy_current_teacher_id() from public;
revoke execute on function public.easy_current_student_id() from public;
revoke execute on function public.easy_can_access_class(uuid) from public;
revoke execute on function public.easy_can_access_lesson(uuid) from public;
revoke execute on function public.rpc_easy_generate_lesson_qr(uuid, integer) from public;
revoke execute on function public.rpc_easy_register_checkin(text) from public;
revoke execute on function public.is_admin_or_coordinator() from public;
revoke execute on function public.easy_current_tenant_id() from anon;
revoke execute on function public.easy_current_role() from anon;
revoke execute on function public.easy_is_admin_or_coordinator() from anon;
revoke execute on function public.easy_is_admin() from anon;
revoke execute on function public.easy_current_teacher_id() from anon;
revoke execute on function public.easy_current_student_id() from anon;
revoke execute on function public.easy_can_access_class(uuid) from anon;
revoke execute on function public.easy_can_access_lesson(uuid) from anon;
revoke execute on function public.rpc_easy_generate_lesson_qr(uuid, integer) from anon;
revoke execute on function public.rpc_easy_register_checkin(text) from anon;
revoke execute on function public.is_admin_or_coordinator() from anon;

grant execute on function public.easy_current_tenant_id() to authenticated;
grant execute on function public.easy_current_role() to authenticated;
grant execute on function public.easy_is_admin_or_coordinator() to authenticated;
grant execute on function public.easy_is_admin() to authenticated;
grant execute on function public.easy_current_teacher_id() to authenticated;
grant execute on function public.easy_current_student_id() to authenticated;
grant execute on function public.easy_can_access_class(uuid) to authenticated;
grant execute on function public.easy_can_access_lesson(uuid) to authenticated;
grant execute on function public.rpc_easy_generate_lesson_qr(uuid, integer) to authenticated;
grant execute on function public.rpc_easy_register_checkin(text) to authenticated;
grant execute on function public.is_admin_or_coordinator() to authenticated;

revoke all privileges on public.view_dashboard_summary from anon;
revoke all privileges on public.view_student_progress from anon;
revoke all privileges on public.view_class_attendance_summary from anon;
revoke all privileges on public.view_pending_activities from anon;
grant select on public.view_dashboard_summary, public.view_student_progress, public.view_class_attendance_summary, public.view_pending_activities to authenticated;

commit;
