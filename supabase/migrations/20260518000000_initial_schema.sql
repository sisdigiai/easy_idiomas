-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- PROFILES
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    role TEXT CHECK (role IN ('admin', 'coordinator', 'teacher', 'student')),
    avatar_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- STUDENTS
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    student_code TEXT UNIQUE,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'active',
    main_language TEXT,
    current_level TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- TEACHERS
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    languages TEXT[],
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- CLASSES
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    language TEXT NOT NULL,
    level TEXT,
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- STUDENT CLASSES
CREATE TABLE student_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- LESSONS
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    lesson_type TEXT CHECK (lesson_type IN ('presential', 'online')),
    room TEXT,
    scheduled_date DATE,
    start_time TIME,
    end_time TIME,
    status TEXT DEFAULT 'scheduled',
    qr_code_token TEXT UNIQUE,
    qr_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ATTENDANCE RECORDS
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'present',
    check_in_at TIMESTAMPTZ DEFAULT now(),
    source TEXT DEFAULT 'qr_code',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ACTIVITIES
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    activity_type TEXT,
    description TEXT,
    due_date DATE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- STUDENT ACTIVITIES
CREATE TABLE student_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    submitted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- MATERIALS
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    material_type TEXT,
    url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- TRIGGERS FOR UPDATED_AT
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER set_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER set_teachers_updated_at BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER set_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER set_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER set_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER set_student_activities_updated_at BEFORE UPDATE ON student_activities FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER set_materials_updated_at BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- INDEXES
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX idx_student_classes_student_id ON student_classes(student_id);
CREATE INDEX idx_student_classes_class_id ON student_classes(class_id);
CREATE INDEX idx_lessons_class_id ON lessons(class_id);
CREATE INDEX idx_lessons_teacher_id ON lessons(teacher_id);
CREATE INDEX idx_attendance_lesson_id ON attendance_records(lesson_id);
CREATE INDEX idx_attendance_student_id ON attendance_records(student_id);
CREATE INDEX idx_activities_class_id ON activities(class_id);
CREATE INDEX idx_student_activities_activity_id ON student_activities(activity_id);
CREATE INDEX idx_student_activities_student_id ON student_activities(student_id);

-- VIEWS
-- 1. Dashboard summary
CREATE OR REPLACE VIEW view_dashboard_summary AS
SELECT 
    (SELECT COUNT(*) FROM students WHERE status = 'active') AS active_students,
    (SELECT COUNT(*) FROM lessons WHERE scheduled_date >= CURRENT_DATE AND scheduled_date < CURRENT_DATE + 7) AS weekly_classes,
    (SELECT COALESCE(AVG(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100, 0) FROM attendance_records) AS avg_attendance_percentage,
    (SELECT COUNT(*) FROM student_activities WHERE status = 'pending') AS pending_activities;

-- 2. Student progress
CREATE OR REPLACE VIEW view_student_progress AS
SELECT 
    s.id AS student_id,
    s.full_name,
    s.main_language,
    s.current_level,
    count(sa.id) FILTER (WHERE sa.status = 'completed') AS completed_activities,
    count(sa.id) AS total_activities,
    round(
        COALESCE(
            (count(sa.id) FILTER (WHERE sa.status = 'completed')::numeric / NULLIF(count(sa.id), 0)) * 100, 
            0
        ), 2
    ) AS progress_percentage
FROM students s
LEFT JOIN student_activities sa ON sa.student_id = s.id
GROUP BY s.id, s.full_name, s.main_language, s.current_level;

-- 3. Class attendance summary
CREATE OR REPLACE VIEW view_class_attendance_summary AS
SELECT 
    c.id AS class_id,
    c.name AS class_name,
    l.id AS lesson_id,
    l.title AS lesson_title,
    count(ar.id) FILTER (WHERE ar.status = 'present') AS present_count,
    count(sc.student_id) - count(ar.id) FILTER (WHERE ar.status = 'present') AS absent_count,
    count(sc.student_id) AS total_students
FROM classes c
JOIN lessons l ON l.class_id = c.id
LEFT JOIN student_classes sc ON sc.class_id = c.id
LEFT JOIN attendance_records ar ON ar.lesson_id = l.id AND ar.student_id = sc.student_id
GROUP BY c.id, c.name, l.id, l.title;

-- 4. Pending activities
CREATE OR REPLACE VIEW view_pending_activities AS
SELECT 
    sa.id AS student_activity_id,
    s.full_name AS student_name,
    a.title AS activity_title,
    a.due_date,
    c.name AS class_name
FROM student_activities sa
JOIN students s ON s.id = sa.student_id
JOIN activities a ON a.id = sa.activity_id
JOIN classes c ON c.id = a.class_id
WHERE sa.status = 'pending';

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- POLICIES
-- Create a function to check admin/coordinator status
CREATE OR REPLACE FUNCTION is_admin_or_coordinator()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'coordinator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Everyone authenticated can read profiles (useful for avatars, names)
CREATE POLICY "Profiles are viewable by authenticated users" 
ON profiles FOR SELECT TO authenticated USING (true);

-- Admins/coordinators can manage profiles
CREATE POLICY "Admins and coordinators can manage profiles" 
ON profiles FOR ALL TO authenticated USING (is_admin_or_coordinator());

-- Users can update own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Students
CREATE POLICY "Admins can manage students" ON students FOR ALL TO authenticated USING (is_admin_or_coordinator());
CREATE POLICY "Teachers can view students" ON students FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher'));

-- Teachers
CREATE POLICY "Admins can manage teachers" ON teachers FOR ALL TO authenticated USING (is_admin_or_coordinator());
CREATE POLICY "Teachers can view themselves" ON teachers FOR SELECT TO authenticated USING (profile_id = auth.uid());
CREATE POLICY "Anyone can view teachers" ON teachers FOR SELECT TO authenticated USING (true);

-- Classes
CREATE POLICY "Admins can manage classes" ON classes FOR ALL TO authenticated USING (is_admin_or_coordinator());
CREATE POLICY "Teachers can view their classes" ON classes FOR SELECT TO authenticated USING (teacher_id IN (SELECT id FROM teachers WHERE profile_id = auth.uid()));
CREATE POLICY "Anyone can view classes" ON classes FOR SELECT TO authenticated USING (true);

-- Student Classes
CREATE POLICY "Admins can manage student_classes" ON student_classes FOR ALL TO authenticated USING (is_admin_or_coordinator());
CREATE POLICY "Teachers can view student_classes" ON student_classes FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher'));

-- Lessons
CREATE POLICY "Admins can manage lessons" ON lessons FOR ALL TO authenticated USING (is_admin_or_coordinator());
CREATE POLICY "Teachers can manage their lessons" ON lessons FOR ALL TO authenticated USING (teacher_id IN (SELECT id FROM teachers WHERE profile_id = auth.uid()));
CREATE POLICY "Anyone can view lessons" ON lessons FOR SELECT TO authenticated USING (true);

-- Attendance
CREATE POLICY "Admins can manage attendance" ON attendance_records FOR ALL TO authenticated USING (is_admin_or_coordinator());
CREATE POLICY "Teachers can manage their classes attendance" ON attendance_records FOR ALL TO authenticated USING (
    lesson_id IN (SELECT id FROM lessons WHERE teacher_id IN (SELECT id FROM teachers WHERE profile_id = auth.uid()))
);

-- Activities
CREATE POLICY "Admins can manage activities" ON activities FOR ALL TO authenticated USING (is_admin_or_coordinator());
CREATE POLICY "Teachers can manage activities for their classes" ON activities FOR ALL TO authenticated USING (
    class_id IN (SELECT id FROM classes WHERE teacher_id IN (SELECT id FROM teachers WHERE profile_id = auth.uid()))
);
CREATE POLICY "Anyone can view activities" ON activities FOR SELECT TO authenticated USING (true);

-- Student Activities
CREATE POLICY "Admins can manage student activities" ON student_activities FOR ALL TO authenticated USING (is_admin_or_coordinator());
CREATE POLICY "Teachers can manage student activities for their classes" ON student_activities FOR ALL TO authenticated USING (
    activity_id IN (SELECT id FROM activities WHERE class_id IN (SELECT id FROM classes WHERE teacher_id IN (SELECT id FROM teachers WHERE profile_id = auth.uid())))
);

-- Materials
CREATE POLICY "Admins can manage materials" ON materials FOR ALL TO authenticated USING (is_admin_or_coordinator());
CREATE POLICY "Teachers can manage materials for their classes" ON materials FOR ALL TO authenticated USING (
    class_id IN (SELECT id FROM classes WHERE teacher_id IN (SELECT id FROM teachers WHERE profile_id = auth.uid()))
);
CREATE POLICY "Anyone can view materials" ON materials FOR SELECT TO authenticated USING (true);
