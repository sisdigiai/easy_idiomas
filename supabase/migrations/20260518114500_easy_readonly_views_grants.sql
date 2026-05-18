revoke insert, update, delete on public.v_easy_profiles from authenticated;
revoke insert, update, delete on public.view_dashboard_summary from authenticated;
revoke insert, update, delete on public.view_student_progress from authenticated;
revoke insert, update, delete on public.view_class_attendance_summary from authenticated;
revoke insert, update, delete on public.view_pending_activities from authenticated;

grant select on public.v_easy_profiles to authenticated;
grant select on public.view_dashboard_summary, public.view_student_progress, public.view_class_attendance_summary, public.view_pending_activities to authenticated;
