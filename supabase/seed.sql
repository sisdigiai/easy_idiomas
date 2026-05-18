-- Seed data for Easy Aula+

-- Create some mock profiles (NOTE: In real life, these are created by Supabase Auth triggers)
-- Assuming roles: admin, coordinator, teacher, student

-- Add teachers
-- Using predefined UUIDs to satisfy foreign keys
INSERT INTO teachers (id, full_name, email, phone, languages, status) VALUES
('a0000000-0000-0000-0000-000000000001', 'Ana Laura', 'ana.laura@easyidiomas.com', '+5511999999991', '{"English"}', 'active'),
('a0000000-0000-0000-0000-000000000002', 'Carlos Mendes', 'carlos.mendes@easyidiomas.com', '+5511999999992', '{"Spanish", "English"}', 'active');

-- Add students
INSERT INTO students (id, full_name, student_code, email, phone, status, main_language, current_level) VALUES
('b0000000-0000-0000-0000-000000000001', 'Mariana Silva', 'STU-2023-084', 'mariana@example.com', '+5511988888881', 'active', 'English', 'B2'),
('b0000000-0000-0000-0000-000000000002', 'Lucas Ferreira', 'STU-2023-112', 'lucas@example.com', '+5511988888882', 'active', 'Spanish', 'A1'),
('b0000000-0000-0000-0000-000000000003', 'Beatriz Costa', 'STU-2022-041', 'beatriz@example.com', '+5511988888883', 'inactive', 'English', 'C1');

-- Add classes
INSERT INTO classes (id, name, language, level, teacher_id) VALUES
('c0000000-0000-0000-0000-000000000001', 'Inglês Avançado', 'English', 'C1', 'a0000000-0000-0000-0000-000000000001'),
('c0000000-0000-0000-0000-000000000002', 'Espanhol Iniciante', 'Spanish', 'A1', 'a0000000-0000-0000-0000-000000000002');

-- Link students to classes
INSERT INTO student_classes (student_id, class_id) VALUES
('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001'),
('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001'),
('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002');

-- Add lessons
INSERT INTO lessons (id, class_id, teacher_id, title, lesson_type, room, scheduled_date, start_time, end_time, status) VALUES
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Grammar Check & Speaking', 'presential', 'Sala 04', CURRENT_DATE, '09:00', '10:30', 'in_progress'),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Introducción', 'online', 'Zoom', CURRENT_DATE, '11:00', '12:30', 'scheduled');

-- Add attendance
INSERT INTO attendance_records (lesson_id, student_id, status) VALUES
('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'present');

-- Add activities
INSERT INTO activities (id, class_id, title, activity_type, description, due_date) VALUES
('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Writing Essay', 'homework', 'Write 500 words about AI.', CURRENT_DATE + 2),
('e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'Vocabulary Quiz', 'quiz', 'Basic greetings.', CURRENT_DATE + 5);

-- Add student activities
INSERT INTO student_activities (activity_id, student_id, status) VALUES
('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'completed'),
('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'pending'),
('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'pending');

-- Add materials
INSERT INTO materials (class_id, title, material_type, url) VALUES
('c0000000-0000-0000-0000-000000000001', 'Advanced Grammar Guide', 'pdf', 'https://example.com/grammar.pdf'),
('c0000000-0000-0000-0000-000000000002', 'Hola Mundo Video', 'video', 'https://example.com/hola.mp4');
