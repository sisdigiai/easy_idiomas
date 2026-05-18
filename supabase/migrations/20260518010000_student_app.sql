-- Add profile_id to students
ALTER TABLE students ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_students_profile_id ON students(profile_id);

-- Update RLS for students mapping
CREATE POLICY "Students can view themselves" ON students FOR SELECT TO authenticated USING (profile_id = auth.uid());

CREATE POLICY "Students can view their enrollment" ON student_classes FOR SELECT TO authenticated USING (
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
);

-- Students can see classes they are enrolled in
CREATE POLICY "Students can view enrolled classes" ON classes FOR SELECT TO authenticated USING (
    id IN (SELECT class_id FROM student_classes WHERE student_id IN (SELECT id FROM students WHERE profile_id = auth.uid()))
);

-- Students can see their attendance
CREATE POLICY "Students can view their attendance" ON attendance_records FOR SELECT TO authenticated USING (
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
);

-- Students can see lessons of their classes
CREATE POLICY "Students can view their lessons" ON lessons FOR SELECT TO authenticated USING (
    class_id IN (SELECT class_id FROM student_classes WHERE student_id IN (SELECT id FROM students WHERE profile_id = auth.uid()))
);

-- Students can see their activities and the activities of their classes
CREATE POLICY "Students can view their student_activities" ON student_activities FOR SELECT TO authenticated USING (
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
);

-- Students can read materials of their classes
CREATE POLICY "Students can view class materials" ON materials FOR SELECT TO authenticated USING (
    class_id IN (SELECT class_id FROM student_classes WHERE student_id IN (SELECT id FROM students WHERE profile_id = auth.uid()))
);
