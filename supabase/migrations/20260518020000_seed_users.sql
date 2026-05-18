CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
    v_admin_id UUID := gen_random_uuid();
    v_coord_id UUID := gen_random_uuid();
    v_teacher_id UUID := gen_random_uuid();
    v_student_id UUID := gen_random_uuid();
    v_teacher_record_id UUID := gen_random_uuid();
    v_student_record_id UUID := gen_random_uuid();
BEGIN
    -- 1. Insert into auth.users (mocking the standard auth setup for Supabase)
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
        created_at, updated_at
    )
    VALUES 
    (
        v_admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'junior@oticastatymello.com.br', crypt('password123', gen_salt('bf')), now(),
        now(), now()
    ),
    (
        v_coord_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'coordenador@easyidiomas.com', crypt('password123', gen_salt('bf')), now(),
        now(), now()
    ),
    (
        v_teacher_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'professor@easyidiomas.com', crypt('password123', gen_salt('bf')), now(),
        now(), now()
    ),
    (
        v_student_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'aluno@easyidiomas.com', crypt('password123', gen_salt('bf')), now(),
        now(), now()
    )
    ON CONFLICT (id) DO NOTHING;

    -- 2. Insert into profiles
    INSERT INTO public.profiles (id, full_name, email, role, status)
    VALUES
    (v_admin_id, 'Super Admin', 'junior@oticastatymello.com.br', 'admin', 'active'),
    (v_coord_id, 'Coordenador Pedagógico', 'coordenador@easyidiomas.com', 'coordinator', 'active'),
    (v_teacher_id, 'Professor Ativo', 'professor@easyidiomas.com', 'teacher', 'active'),
    (v_student_id, 'Aluno Teste', 'aluno@easyidiomas.com', 'student', 'active')
    ON CONFLICT (id) DO UPDATE SET 
        role = EXCLUDED.role, 
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;

    -- 3. Insert specific app records
    -- Teacher record
    IF NOT EXISTS (SELECT 1 FROM public.teachers WHERE profile_id = v_teacher_id) THEN
        INSERT INTO public.teachers (id, profile_id, full_name, email, languages, status)
        VALUES (v_teacher_record_id, v_teacher_id, 'Professor Ativo', 'professor@easyidiomas.com', ARRAY['Inglês', 'Espanhol'], 'active');
    END IF;

    -- Student record
    IF NOT EXISTS (SELECT 1 FROM public.students WHERE profile_id = v_student_id) THEN
        INSERT INTO public.students (id, profile_id, full_name, email, main_language, current_level, status)
        VALUES (v_student_record_id, v_student_id, 'Aluno Teste', 'aluno@easyidiomas.com', 'Inglês', 'B1', 'active');
    END IF;

END $$;
