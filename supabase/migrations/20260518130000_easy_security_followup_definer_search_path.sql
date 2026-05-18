begin;

-- SEC-1: trigger function should not be invocable as an RPC.
-- Trigger fires from auth.users via the easy_on_auth_user_created trigger;
-- the AFTER INSERT context provides the SECURITY DEFINER privileges it needs,
-- so revoking EXECUTE from client roles closes the REST endpoint without
-- affecting the trigger.
revoke execute on function public.easy_handle_new_auth_user() from public;
revoke execute on function public.easy_handle_new_auth_user() from anon;
revoke execute on function public.easy_handle_new_auth_user() from authenticated;

-- SEC-2: drop the legacy duplicate. easy_is_admin_or_coordinator supersedes it
-- and has search_path locked down. Pre-flight checks showed zero references.
drop function if exists public.is_admin_or_coordinator();

-- SEC-3: pin search_path on the updated_at trigger helper so it cannot be
-- hijacked via a schema injected ahead of public in the caller's search_path.
alter function public.update_modified_column() set search_path = public;

-- SEC-6: reduce default QR TTL from 10 to 3 minutes. Hard cap at 60 preserved.
-- Lower default mitigates "token forwarded over WhatsApp" attendance fraud.
create or replace function public.rpc_easy_generate_lesson_qr(p_lesson_id uuid, p_ttl_minutes integer default 3)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_lesson public.lessons%rowtype;
  v_token text := gen_random_uuid()::text;
  v_expires_at timestamptz := now() + make_interval(mins => greatest(1, least(coalesce(p_ttl_minutes, 3), 60)));
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

revoke execute on function public.rpc_easy_generate_lesson_qr(uuid, integer) from public;
grant execute on function public.rpc_easy_generate_lesson_qr(uuid, integer) to authenticated;

commit;
