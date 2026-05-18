begin;

-- Hygiene follow-up to the security audit: RPCs that mutate data should not be
-- callable by the `anon` role. Each function already raises
-- `authentication_required` when `auth.uid()` is null, so this is defense in
-- depth (avoids exposing the function as a probe surface and surfaces in
-- Supabase advisor as zero-warning).
revoke execute on function public.rpc_easy_create_lesson(uuid, uuid, text, text, text, date, time, time, text, text, text, text) from anon;
revoke execute on function public.rpc_easy_upsert_lesson_plan(uuid, text, text, text, jsonb, text, text, text, text, text, text) from anon;
revoke execute on function public.rpc_easy_record_ai_suggestion(uuid, uuid, jsonb, jsonb, text) from anon;
revoke execute on function public.rpc_easy_generate_lesson_qr(uuid, integer) from anon;
revoke execute on function public.rpc_easy_register_checkin(text) from anon;

commit;
