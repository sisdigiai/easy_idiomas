create or replace function public.rpc_easy_create_lesson(
  p_class_id uuid,
  p_teacher_id uuid,
  p_title text,
  p_lesson_type text,
  p_room text,
  p_scheduled_date date,
  p_start_time time,
  p_end_time time,
  p_topic text default null,
  p_lesson_objective text default null,
  p_status text default 'scheduled',
  p_online_url text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid := public.easy_current_tenant_id();
  v_role text := public.easy_current_role();
  v_current_teacher_id uuid := public.easy_current_teacher_id();
  v_teacher_id uuid;
  v_lesson public.lessons%rowtype;
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;

  if p_class_id is null or nullif(trim(p_title), '') is null then
    raise exception 'invalid_lesson_payload';
  end if;

  if p_lesson_type not in ('presential', 'online') then
    raise exception 'invalid_lesson_type';
  end if;

  if p_status not in ('draft', 'scheduled', 'in_progress', 'completed', 'cancelled') then
    raise exception 'invalid_lesson_status';
  end if;

  if not exists (
    select 1 from public.classes c
    where c.id = p_class_id
      and c.tenant_id = v_tenant_id
      and c.deleted_at is null
  ) then
    raise exception 'class_not_found';
  end if;

  if v_role in ('admin', 'coordinator') then
    v_teacher_id := p_teacher_id;
  elsif v_role = 'teacher' then
    v_teacher_id := v_current_teacher_id;
  else
    raise exception 'permission_denied';
  end if;

  if v_teacher_id is null then
    raise exception 'teacher_required';
  end if;

  if not exists (
    select 1 from public.teachers t
    where t.id = v_teacher_id
      and t.tenant_id = v_tenant_id
      and t.deleted_at is null
      and t.status = 'active'
  ) then
    raise exception 'teacher_not_found';
  end if;

  if v_role = 'teacher' and not exists (
    select 1 from public.classes c
    where c.id = p_class_id
      and c.teacher_id = v_current_teacher_id
      and c.tenant_id = v_tenant_id
      and c.deleted_at is null
  ) then
    raise exception 'teacher_class_mismatch';
  end if;

  insert into public.lessons (
    tenant_id,
    class_id,
    teacher_id,
    title,
    lesson_type,
    room,
    scheduled_date,
    start_time,
    end_time,
    status,
    created_by,
    approved_by,
    approved_at,
    online_url,
    topic,
    lesson_objective
  )
  values (
    v_tenant_id,
    p_class_id,
    v_teacher_id,
    trim(p_title),
    p_lesson_type,
    nullif(trim(coalesce(p_room, '')), ''),
    p_scheduled_date,
    p_start_time,
    p_end_time,
    p_status,
    auth.uid(),
    case when p_status = 'scheduled' then auth.uid() else null end,
    case when p_status = 'scheduled' then now() else null end,
    nullif(trim(coalesce(p_online_url, '')), ''),
    nullif(trim(coalesce(p_topic, '')), ''),
    nullif(trim(coalesce(p_lesson_objective, '')), '')
  )
  returning * into v_lesson;

  return to_jsonb(v_lesson);
end;
$$;

create or replace function public.rpc_easy_upsert_lesson_plan(
  p_lesson_id uuid,
  p_source text,
  p_title text,
  p_objective text,
  p_agenda jsonb default '[]'::jsonb,
  p_warmup_activity text default null,
  p_main_activity text default null,
  p_practice_activity text default null,
  p_homework text default null,
  p_teacher_notes text default null,
  p_status text default 'draft'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid := public.easy_current_tenant_id();
  v_existing_id uuid;
  v_plan public.lesson_plans%rowtype;
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;

  if p_source not in ('manual', 'ai_assisted') then
    raise exception 'invalid_plan_source';
  end if;

  if p_status not in ('draft', 'approved', 'archived') then
    raise exception 'invalid_plan_status';
  end if;

  if not public.easy_can_access_lesson(p_lesson_id) then
    raise exception 'permission_denied';
  end if;

  select id into v_existing_id
  from public.lesson_plans
  where lesson_id = p_lesson_id
    and tenant_id = v_tenant_id
    and deleted_at is null
  order by created_at desc
  limit 1;

  if v_existing_id is null then
    insert into public.lesson_plans (
      tenant_id,
      lesson_id,
      created_by,
      source,
      title,
      objective,
      agenda,
      warmup_activity,
      main_activity,
      practice_activity,
      homework,
      teacher_notes,
      status,
      approved_by,
      approved_at
    )
    values (
      v_tenant_id,
      p_lesson_id,
      auth.uid(),
      p_source,
      nullif(trim(coalesce(p_title, '')), ''),
      nullif(trim(coalesce(p_objective, '')), ''),
      coalesce(p_agenda, '[]'::jsonb),
      nullif(trim(coalesce(p_warmup_activity, '')), ''),
      nullif(trim(coalesce(p_main_activity, '')), ''),
      nullif(trim(coalesce(p_practice_activity, '')), ''),
      nullif(trim(coalesce(p_homework, '')), ''),
      nullif(trim(coalesce(p_teacher_notes, '')), ''),
      p_status,
      case when p_status = 'approved' then auth.uid() else null end,
      case when p_status = 'approved' then now() else null end
    )
    returning * into v_plan;
  else
    update public.lesson_plans
    set
      source = p_source,
      title = nullif(trim(coalesce(p_title, '')), ''),
      objective = nullif(trim(coalesce(p_objective, '')), ''),
      agenda = coalesce(p_agenda, '[]'::jsonb),
      warmup_activity = nullif(trim(coalesce(p_warmup_activity, '')), ''),
      main_activity = nullif(trim(coalesce(p_main_activity, '')), ''),
      practice_activity = nullif(trim(coalesce(p_practice_activity, '')), ''),
      homework = nullif(trim(coalesce(p_homework, '')), ''),
      teacher_notes = nullif(trim(coalesce(p_teacher_notes, '')), ''),
      status = p_status,
      approved_by = case when p_status = 'approved' then auth.uid() else approved_by end,
      approved_at = case when p_status = 'approved' then now() else approved_at end,
      updated_at = now()
    where id = v_existing_id
    returning * into v_plan;
  end if;

  return to_jsonb(v_plan);
end;
$$;

create or replace function public.rpc_easy_record_ai_suggestion(
  p_lesson_id uuid,
  p_class_id uuid,
  p_prompt_input jsonb,
  p_suggestion_output jsonb,
  p_status text default 'pending_review'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid := public.easy_current_tenant_id();
  v_suggestion public.ai_suggestions%rowtype;
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;

  if p_status not in ('pending_review', 'approved', 'rejected') then
    raise exception 'invalid_suggestion_status';
  end if;

  if p_lesson_id is not null and not public.easy_can_access_lesson(p_lesson_id) then
    raise exception 'permission_denied';
  end if;

  if p_class_id is not null and not public.easy_can_access_class(p_class_id) then
    raise exception 'permission_denied';
  end if;

  insert into public.ai_suggestions (
    tenant_id,
    requested_by,
    lesson_id,
    class_id,
    suggestion_type,
    prompt_input,
    suggestion_output,
    status,
    reviewed_by,
    reviewed_at
  )
  values (
    v_tenant_id,
    auth.uid(),
    p_lesson_id,
    p_class_id,
    'lesson_plan',
    coalesce(p_prompt_input, '{}'::jsonb),
    coalesce(p_suggestion_output, '{}'::jsonb),
    p_status,
    case when p_status in ('approved', 'rejected') then auth.uid() else null end,
    case when p_status in ('approved', 'rejected') then now() else null end
  )
  returning * into v_suggestion;

  return to_jsonb(v_suggestion);
end;
$$;

revoke all on function public.rpc_easy_create_lesson(uuid, uuid, text, text, text, date, time, time, text, text, text, text) from public;
revoke all on function public.rpc_easy_upsert_lesson_plan(uuid, text, text, text, jsonb, text, text, text, text, text, text) from public;
revoke all on function public.rpc_easy_record_ai_suggestion(uuid, uuid, jsonb, jsonb, text) from public;

grant execute on function public.rpc_easy_create_lesson(uuid, uuid, text, text, text, date, time, time, text, text, text, text) to authenticated;
grant execute on function public.rpc_easy_upsert_lesson_plan(uuid, text, text, text, jsonb, text, text, text, text, text, text) to authenticated;
grant execute on function public.rpc_easy_record_ai_suggestion(uuid, uuid, jsonb, jsonb, text) to authenticated;
