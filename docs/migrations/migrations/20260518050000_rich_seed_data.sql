DO $$
DECLARE
    -- use the IDs created in seed_users
    v_teacher_record_id UUID := (SELECT id FROM public.teachers WHERE email = 'professor@easyidiomas.com' LIMIT 1);
    v_student_record_id UUID := (SELECT id FROM public.students WHERE email = 'aluno@easyidiomas.com' LIMIT 1);
    
    v_class_1_id UUID := gen_random_uuid();
    v_class_2_id UUID := gen_random_uuid();
    v_class_3_id UUID := gen_random_uuid();
    
    v_lesson_1_id UUID := gen_random_uuid();
    v_lesson_2_id UUID := gen_random_uuid();
    v_lesson_3_id UUID := gen_random_uuid();
    v_lesson_4_id UUID := gen_random_uuid();
    
    v_activity_1_id UUID := gen_random_uuid();
    v_activity_2_id UUID := gen_random_uuid();
    
    v_student_2_id UUID := gen_random_uuid();
    v_student_3_id UUID := gen_random_uuid();
    v_student_4_id UUID := gen_random_uuid();
    
BEGIN
    -- Only run if standard seeds were applied
    IF v_student_record_id IS NULL THEN
        RETURN;
    END IF;

    -- Extra Students
    INSERT INTO public.students (id, full_name, email, main_language, current_level, status)
    VALUES 
    (v_student_2_id, 'José Almeida', 'jose@easyidiomas.com', 'Inglês', 'C1', 'active'),
    (v_student_3_id, 'Carla Perez', 'carla@easyidiomas.com', 'Espanhol', 'B2', 'active'),
    (v_student_4_id, 'Ricardo Fontes', 'ricardo@easyidiomas.com', 'Inglês', 'A1', 'active')
    ON CONFLICT DO NOTHING;

    -- Classes
    INSERT INTO public.classes (id, name, language, level, teacher_id, status)
    VALUES 
    (v_class_1_id, 'Inglês Intermediário B1', 'Inglês', 'B1', v_teacher_record_id, 'active'),
    (v_class_2_id, 'Espanhol Avançado C1', 'Espanhol', 'C1', v_teacher_record_id, 'active'),
    (v_class_3_id, 'Inglês Conversação', 'Inglês', 'B2', v_teacher_record_id, 'active')
    ON CONFLICT (id) DO NOTHING;

    -- Student classes
    INSERT INTO public.student_classes (student_id, class_id)
    VALUES 
    (v_student_record_id, v_class_1_id),
    (v_student_record_id, v_class_3_id),
    (v_student_2_id, v_class_3_id),
    (v_student_3_id, v_class_2_id),
    (v_student_4_id, v_class_1_id)
    ON CONFLICT DO NOTHING;

    -- Lessons (some today, some tomorrow)
    INSERT INTO public.lessons (id, class_id, teacher_id, title, lesson_type, room, scheduled_date, start_time, end_time, status)
    VALUES 
    (v_lesson_1_id, v_class_1_id, v_teacher_record_id, 'Present Perfect Continuous', 'presential', 'Sala 05', CURRENT_DATE, '15:00:00', '16:30:00', 'scheduled'),
    (v_lesson_2_id, v_class_2_id, v_teacher_record_id, 'Subjuntivo Prática', 'online', 'Zoom', CURRENT_DATE, '18:00:00', '19:30:00', 'scheduled'),
    (v_lesson_3_id, v_class_3_id, v_teacher_record_id, 'Business Phrases', 'presential', 'Sala 01', CURRENT_DATE + INTERVAL '1 day', '10:00:00', '11:00:00', 'scheduled'),
    (v_lesson_4_id, v_class_1_id, v_teacher_record_id, 'Mock Exam', 'presential', 'Sala 05', CURRENT_DATE - INTERVAL '1 day', '15:00:00', '16:30:00', 'completed')
    ON CONFLICT (id) DO NOTHING;

    -- Activities
    INSERT INTO public.activities (id, lesson_id, class_id, title, activity_type, description, due_date, status)
    VALUES 
    (v_activity_1_id, v_lesson_1_id, v_class_1_id, 'Homework Unit 5', 'writing', 'Write 200 words about your last trip.', CURRENT_DATE + INTERVAL '3 days', 'active'),
    (v_activity_2_id, v_lesson_2_id, v_class_2_id, 'Listening Podcast', 'listening', 'Listen to podcast episode 3 and summarize.', CURRENT_DATE + INTERVAL '5 days', 'active')
    ON CONFLICT (id) DO NOTHING;

    -- Student Activity mapping
    INSERT INTO public.student_activities (activity_id, student_id, status)
    VALUES 
    (v_activity_1_id, v_student_record_id, 'pending'),
    (v_activity_1_id, v_student_4_id, 'pending'),
    (v_activity_2_id, v_student_3_id, 'pending')
    ON CONFLICT DO NOTHING;

    -- Materials
    INSERT INTO public.materials (class_id, title, description, url, material_type)
    VALUES 
    (v_class_1_id, 'English Grammar in Use - Units 1-5', 'Reference PDF', 'https://example.com/grammar.pdf', 'pdf'),
    (v_class_2_id, 'Podcast Episode 3', 'Audio track', 'https://example.com/audio.mp3', 'audio')
    ON CONFLICT DO NOTHING;

    -- Attendance history
    INSERT INTO public.attendance_records (lesson_id, student_id, status, check_in_at)
    VALUES 
    (v_lesson_4_id, v_student_record_id, 'present', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '14:55:00'),
    (v_lesson_4_id, v_student_4_id, 'present', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '14:59:00')
    ON CONFLICT DO NOTHING;

END $$;
