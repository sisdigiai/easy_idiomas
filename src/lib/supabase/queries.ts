import { supabase, isSupabaseConfigured } from "./client";

type QueryResult<T> = { data: T | null; error: unknown | null };

const MOCK_DASHBOARD = {
  summary: {
    active_students: 128,
    weekly_classes: 42,
    avg_attendance_percentage: 94,
    pending_activities: 15,
  },
  todayLessons: [
    {
      id: "mock-lesson-1",
      title: "Ingles Avancado",
      level: "C1",
      start_time: "09:00",
      end_time: "10:30",
      room: "Sala 04",
      status: "in_progress",
      lesson_type: "presential",
      teacher: { full_name: "Prof. Ana Laura" },
      class: { language: "Ingles", level: "C1" },
    },
  ],
  recentActivity: [],
};

const MOCK_STUDENTS = [
  { student_id: "mock-stu-1", full_name: "Mariana Silva", main_language: "Ingles", current_level: "B2", student_code: "STU-2023-084", status: "active", progress_percentage: 75, avg_attendance: 92, pending_activities: 0, class_name: "Ingles B2" },
  { student_id: "mock-stu-2", full_name: "Lucas Ferreira", main_language: "Espanhol", current_level: "A1", student_code: "STU-2023-112", status: "active", progress_percentage: 32, avg_attendance: 85, pending_activities: 1, class_name: "Espanhol A1" },
];

const MOCK_LESSONS = [
  { id: "mock-less-1", title: "Ingles Avancado", class: { language: "Ingles", level: "C1", name: "Ingles C1" }, teacher: { full_name: "Prof. Ana Laura" }, start_time: "09:00", end_time: "10:30", room: "Sala 04", status: "scheduled", scheduled_date: new Date().toISOString() },
];

const MOCK_PRESENCA = {
  lesson: { id: "mock-less-1", title: "Ingles Intermediario", room: "Sala 04", class: { language: "Ingles", level: "B1" } },
  attendance: {
    present: [{ student: { full_name: "Ana Silva", id: "1" }, check_in_at: new Date().toISOString() }],
    total_students: 20,
  },
};

function byId(rows: any[] | null | undefined) {
  return new Map((rows || []).map((row) => [row.id, row]));
}

function enrichLesson(lesson: any, classMap: Map<string, any>, teacherMap: Map<string, any>) {
  const classData = classMap.get(lesson.class_id);
  const teacher = teacherMap.get(lesson.teacher_id);
  return {
    ...lesson,
    class: classData ? { id: classData.id, name: classData.name, language: classData.language, level: classData.level } : null,
    teacher: teacher ? { id: teacher.id, full_name: teacher.full_name, email: teacher.email } : null,
  };
}

function enrichActivity(activity: any, classMap: Map<string, any>) {
  const classData = classMap.get(activity.class_id);
  return {
    ...activity,
    class: classData ? { id: classData.id, name: classData.name, language: classData.language, level: classData.level } : null,
  };
}

function enrichMaterial(material: any, classMap: Map<string, any>) {
  const classData = classMap.get(material.class_id);
  return {
    ...material,
    class: classData ? { id: classData.id, name: classData.name, language: classData.language, level: classData.level } : null,
  };
}

async function loadCoreData() {
  const [
    studentsRes,
    teachersRes,
    classesRes,
    studentClassesRes,
    lessonsRes,
    attendanceRes,
    activitiesRes,
    studentActivitiesRes,
    materialsRes,
  ] = await Promise.all([
    supabase.from("v_easy_students").select("*"),
    supabase.from("v_easy_teachers").select("*"),
    supabase.from("v_easy_classes").select("*"),
    supabase.from("v_easy_student_classes").select("*"),
    supabase.from("v_easy_lessons").select("*"),
    supabase.from("v_easy_attendance_records").select("*"),
    supabase.from("v_easy_activities").select("*"),
    supabase.from("v_easy_student_activities").select("*"),
    supabase.from("v_easy_materials").select("*"),
  ]);

  const firstError = [
    studentsRes.error,
    teachersRes.error,
    classesRes.error,
    studentClassesRes.error,
    lessonsRes.error,
    attendanceRes.error,
    activitiesRes.error,
    studentActivitiesRes.error,
    materialsRes.error,
  ].find(Boolean);

  if (firstError) throw firstError;

  const students = studentsRes.data || [];
  const teachers = teachersRes.data || [];
  const classes = classesRes.data || [];
  const studentClasses = studentClassesRes.data || [];
  const lessons = lessonsRes.data || [];
  const attendance = attendanceRes.data || [];
  const activities = activitiesRes.data || [];
  const studentActivities = studentActivitiesRes.data || [];
  const materials = materialsRes.data || [];

  const studentMap = byId(students);
  const teacherMap = byId(teachers);
  const classMap = byId(classes);
  const activityMap = byId(activities);
  const lessonMap = byId(lessons);

  return {
    students,
    teachers,
    classes,
    studentClasses,
    lessons,
    attendance,
    activities,
    studentActivities,
    materials,
    studentMap,
    teacherMap,
    classMap,
    activityMap,
    lessonMap,
  };
}

function attendancePercentage(records: any[]) {
  if (!records.length) return 0;
  const present = records.filter((record) => record.status === "present").length;
  return Math.round((present / records.length) * 100);
}

function getClassName(classData?: any) {
  if (!classData) return "-";
  return classData.name || [classData.language, classData.level].filter(Boolean).join(" ") || "-";
}

export async function getDashboardData(): Promise<QueryResult<any>> {
  if (!isSupabaseConfigured) return { data: MOCK_DASHBOARD, error: null };

  try {
    const core = await loadCoreData();
    const today = new Date().toISOString().split("T")[0];
    const weekAhead = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const visibleLessons = core.lessons.map((lesson) => enrichLesson(lesson, core.classMap, core.teacherMap));
    const todayLessons = visibleLessons
      .filter((lesson) => lesson.scheduled_date === today)
      .sort((a, b) => String(a.start_time || "").localeCompare(String(b.start_time || "")))
      .slice(0, 5);

    const recentActivity = core.studentActivities
      .filter((row) => row.status === "completed")
      .slice(0, 5)
      .map((row) => {
        const student = core.studentMap.get(row.student_id);
        const activity = core.activityMap.get(row.activity_id);
        return {
          id: row.id,
          user: student?.full_name || "Aluno",
          avatar: "",
          action: "Concluiu a atividade",
          target: activity?.title || "Atividade",
          time: "Recentemente",
        };
      });

    return {
      data: {
        summary: {
          active_students: core.students.filter((student) => student.status === "active").length,
          weekly_classes: core.lessons.filter((lesson) => lesson.scheduled_date >= today && lesson.scheduled_date <= weekAhead && ["scheduled", "in_progress"].includes(lesson.status)).length,
          avg_attendance_percentage: attendancePercentage(core.attendance),
          pending_activities: core.studentActivities.filter((row) => row.status === "pending").length,
        },
        todayLessons,
        recentActivity,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getStudentsProgress(): Promise<QueryResult<any[]>> {
  if (!isSupabaseConfigured) return { data: MOCK_STUDENTS, error: null };

  try {
    const core = await loadCoreData();
    const data = core.students.map((student) => {
      const enrollments = core.studentClasses.filter((row) => row.student_id === student.id);
      const classNames = enrollments.map((row) => getClassName(core.classMap.get(row.class_id))).join(", ");
      const studentAttendance = core.attendance.filter((row) => row.student_id === student.id);
      const studentActivities = core.studentActivities.filter((row) => row.student_id === student.id);
      const totalActivities = studentActivities.length;
      const completedActivities = studentActivities.filter((row) => row.status === "completed").length;
      return {
        ...student,
        student_id: student.id,
        class_name: classNames || "-",
        progress_percentage: totalActivities ? Math.round((completedActivities / totalActivities) * 100) : 0,
        avg_attendance: attendancePercentage(studentAttendance),
        pending_activities: studentActivities.filter((row) => row.status === "pending").length,
      };
    });

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getLessonsList(): Promise<QueryResult<any[]>> {
  if (!isSupabaseConfigured) return { data: MOCK_LESSONS, error: null };

  try {
    const core = await loadCoreData();
    const data = core.lessons
      .map((lesson) => enrichLesson(lesson, core.classMap, core.teacherMap))
      .sort((a, b) => `${a.scheduled_date || ""}${a.start_time || ""}`.localeCompare(`${b.scheduled_date || ""}${b.start_time || ""}`));
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getLessonById(lessonId?: string): Promise<QueryResult<any>> {
  if (!lessonId) return { data: null, error: "lesson_id_required" };
  if (!isSupabaseConfigured) return { data: MOCK_LESSONS.find((lesson) => lesson.id === lessonId) || MOCK_LESSONS[0], error: null };

  try {
    const core = await loadCoreData();
    const lesson = core.lessons.find((row) => row.id === lessonId);
    return { data: lesson ? enrichLesson(lesson, core.classMap, core.teacherMap) : null, error: lesson ? null : "lesson_not_found" };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getLessonAttendance(lessonId?: string): Promise<QueryResult<any>> {
  if (!isSupabaseConfigured) return { data: MOCK_PRESENCA, error: null };

  try {
    const core = await loadCoreData();
    const sortedLessons = [...core.lessons].sort((a, b) => `${b.scheduled_date || ""}${b.start_time || ""}`.localeCompare(`${a.scheduled_date || ""}${a.start_time || ""}`));
    const rawLesson = lessonId ? core.lessons.find((row) => row.id === lessonId) : sortedLessons[0];
    if (!rawLesson) return { data: null, error: "lesson_not_found" };

    const lesson = enrichLesson(rawLesson, core.classMap, core.teacherMap);
    const present = core.attendance
      .filter((record) => record.lesson_id === rawLesson.id && record.status === "present")
      .sort((a, b) => String(b.check_in_at || "").localeCompare(String(a.check_in_at || "")))
      .map((record) => ({
        ...record,
        student: core.studentMap.get(record.student_id) || null,
      }));

    const totalStudents = core.studentClasses.filter((row) => row.class_id === rawLesson.class_id && row.status === "active").length;

    return {
      data: {
        lesson,
        attendance: {
          present,
          total_students: totalStudents || present.length,
        },
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getReports(): Promise<QueryResult<any>> {
  if (!isSupabaseConfigured) return { data: null, error: null };

  try {
    const core = await loadCoreData();
    const attendanceByClass = core.classes.map((classData) => {
      const classLessons = core.lessons.filter((lesson) => lesson.class_id === classData.id);
      const lessonIds = new Set(classLessons.map((lesson) => lesson.id));
      const records = core.attendance.filter((record) => lessonIds.has(record.lesson_id));
      const enrolled = core.studentClasses.filter((row) => row.class_id === classData.id && row.status === "active").length;
      const absentCount = Math.max(0, enrolled * classLessons.length - records.filter((record) => record.status === "present").length);
      return {
        class_name: getClassName(classData),
        language: classData.language,
        level: classData.level,
        total_lessons: classLessons.length,
        avg_attendance: attendancePercentage(records),
        students_with_absences: absentCount,
        absent_count: absentCount,
      };
    });

    const attendanceByStudent = core.students.map((student) => {
      const records = core.attendance.filter((record) => record.student_id === student.id);
      const enrollments = core.studentClasses.filter((row) => row.student_id === student.id);
      const className = enrollments.map((row) => getClassName(core.classMap.get(row.class_id))).join(", ") || "Geral";
      const lastAttendance = records
        .map((record) => record.check_in_at)
        .filter(Boolean)
        .sort()
        .at(-1);

      return {
        student_name: student.full_name,
        student_code: student.student_code,
        class_name: className,
        attendance_percentage: attendancePercentage(records),
        absences: records.filter((record) => record.status !== "present").length,
        last_attendance: lastAttendance ? new Date(lastAttendance).toLocaleDateString("pt-BR") : "-",
      };
    });

    const pendingActivities = core.studentActivities
      .filter((row) => row.status === "pending")
      .map((row) => {
        const student = core.studentMap.get(row.student_id);
        const activity = core.activityMap.get(row.activity_id);
        const classData = activity ? core.classMap.get(activity.class_id) : null;
        return {
          student_activity_id: row.id,
          student_name: student?.full_name || "Aluno",
          activity_title: activity?.title || "Atividade",
          class_name: getClassName(classData),
          due_date: activity?.due_date,
          status: "Pendente",
        };
      });

    const studentProgress = (await getStudentsProgress()).data || [];

    return {
      data: {
        attendanceByClass,
        attendanceByStudent,
        pendingActivities,
        studentProgress: studentProgress.map((student: any) => ({
          student_name: student.full_name,
          language: student.main_language || "-",
          level: student.current_level || "-",
          progress_percentage: student.progress_percentage || 0,
          completed_activities: (core.studentActivities || []).filter((row) => row.student_id === student.id && row.status === "completed").length,
          pending_activities: student.pending_activities || 0,
        })),
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getSystemTeachers(): Promise<QueryResult<any[]>> {
  if (!isSupabaseConfigured) return { data: [], error: null };
  const { data, error } = await supabase.from("v_easy_teachers").select("*").order("full_name");
  return { data, error };
}

export async function getSystemClasses(): Promise<QueryResult<any[]>> {
  if (!isSupabaseConfigured) return { data: [], error: null };
  try {
    const core = await loadCoreData();
    const data = core.classes.map((classData) => ({
      ...classData,
      teacher: core.teacherMap.get(classData.teacher_id) || null,
    }));
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getSystemActivities(): Promise<QueryResult<any[]>> {
  if (!isSupabaseConfigured) return { data: [], error: null };
  try {
    const core = await loadCoreData();
    return { data: core.activities.map((activity) => enrichActivity(activity, core.classMap)), error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getSystemMaterials(): Promise<QueryResult<any[]>> {
  if (!isSupabaseConfigured) return { data: [], error: null };
  try {
    const core = await loadCoreData();
    return { data: core.materials.map((material) => enrichMaterial(material, core.classMap)), error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function setLessonQRCode(lessonId: string, ttlMinutes = 10): Promise<QueryResult<any>> {
  if (!isSupabaseConfigured) return { data: { token: "mock-token", expires_at: new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString() }, error: null };
  const { data, error } = await supabase.rpc("rpc_easy_generate_lesson_qr", {
    p_lesson_id: lessonId,
    p_ttl_minutes: ttlMinutes,
  });
  return { data, error };
}

export async function getStudentDashboard(profileId?: string): Promise<QueryResult<any>> {
  if (!isSupabaseConfigured) return { data: null, error: null };

  try {
    const core = await loadCoreData();
    const student = core.students.find((row) => row.profile_id === profileId) || core.students[0];
    if (!student) return { data: null, error: "student_not_found" };

    const today = new Date().toISOString().split("T")[0];
    const classIds = new Set(core.studentClasses.filter((row) => row.student_id === student.id).map((row) => row.class_id));
    const nextRawLesson = core.lessons
      .filter((lesson) => classIds.has(lesson.class_id) && lesson.scheduled_date >= today)
      .sort((a, b) => `${a.scheduled_date || ""}${a.start_time || ""}`.localeCompare(`${b.scheduled_date || ""}${b.start_time || ""}`))[0];

    const nextLesson = nextRawLesson ? {
      ...enrichLesson(nextRawLesson, core.classMap, core.teacherMap),
      teacher_name: core.teacherMap.get(nextRawLesson.teacher_id)?.full_name,
      class_data: core.classMap.get(nextRawLesson.class_id),
    } : null;

    const studentActivities = core.studentActivities.filter((row) => row.student_id === student.id);
    const completed = studentActivities.filter((row) => row.status === "completed").length;
    const pending = studentActivities.filter((row) => row.status === "pending").length;
    const pendingActivitiesList = studentActivities
      .filter((row) => row.status === "pending")
      .map((row) => {
        const activity = core.activityMap.get(row.activity_id);
        return {
          id: activity?.id || row.id,
          title: activity?.title || "Atividade",
          type: activity?.activity_type,
          due_date: activity?.due_date,
        };
      });

    return {
      data: {
        student,
        nextLesson,
        progress: {
          attendance: attendancePercentage(core.attendance.filter((row) => row.student_id === student.id)),
          completed_activities: completed,
          pending_activities: pending,
          course_progress: studentActivities.length ? Math.round((completed / studentActivities.length) * 100) : 0,
        },
        continueStudying: core.materials[0] ? { material_title: core.materials[0].title, type: core.materials[0].material_type } : null,
        pendingActivitiesList,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getStudentLessons(_studentId?: string): Promise<QueryResult<any[]>> {
  return getLessonsList();
}

export async function getStudentActivitiesRaw(_studentId?: string): Promise<QueryResult<any[]>> {
  if (!isSupabaseConfigured) return { data: [], error: null };
  try {
    const core = await loadCoreData();
    const data = core.studentActivities.map((row) => {
      const activity = core.activityMap.get(row.activity_id);
      return { ...row, activity: activity ? enrichActivity(activity, core.classMap) : null };
    });
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getStudentMaterials(_studentId?: string): Promise<QueryResult<any[]>> {
  return getSystemMaterials();
}

export async function getStudentProgressDetails(profileOrStudentId?: string): Promise<QueryResult<any>> {
  if (!isSupabaseConfigured) return { data: null, error: null };
  try {
    const core = await loadCoreData();
    const student = core.students.find((row) => row.profile_id === profileOrStudentId || row.id === profileOrStudentId) || core.students[0];
    if (!student) return { data: null, error: "student_not_found" };
    const studentActivities = core.studentActivities.filter((row) => row.student_id === student.id);
    const completed = studentActivities.filter((row) => row.status === "completed").length;
    const pending = studentActivities.filter((row) => row.status === "pending").length;
    return {
      data: {
        current_level: student.current_level || "Desconhecido",
        progress_percentage: studentActivities.length ? Math.round((completed / studentActivities.length) * 100) : 0,
        attendance: attendancePercentage(core.attendance.filter((row) => row.student_id === student.id)),
        completed_activities: completed,
        pending_activities: pending,
        skills: [
          { name: "Grammar", value: 85 },
          { name: "Vocabulary", value: 70 },
          { name: "Listening", value: 80 },
          { name: "Speaking", value: 60 },
        ],
        recent_evaluations: [],
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}

export async function registerCheckin(token: string): Promise<QueryResult<any>> {
  if (!isSupabaseConfigured) return { data: { ok: true }, error: null };
  const { data, error } = await supabase.rpc("rpc_easy_register_checkin", { p_token: token });
  return { data, error };
}

export async function getTeacherDashboard(_teacherId?: string): Promise<QueryResult<any>> {
  if (!isSupabaseConfigured) return { data: { todayLessons: MOCK_LESSONS, pendingReviews: 0, nextLesson: MOCK_LESSONS[0] }, error: null };
  try {
    const core = await loadCoreData();
    const today = new Date().toISOString().split("T")[0];
    const todayLessons = core.lessons
      .filter((lesson) => lesson.scheduled_date === today)
      .map((lesson) => ({ ...enrichLesson(lesson, core.classMap, core.teacherMap), class_data: core.classMap.get(lesson.class_id) }))
      .sort((a, b) => String(a.start_time || "").localeCompare(String(b.start_time || "")));
    return {
      data: {
        todayLessons,
        pendingReviews: core.studentActivities.filter((row) => row.status === "submitted").length,
        nextLesson: todayLessons.find((lesson) => lesson.status === "scheduled") || todayLessons[0] || null,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getTeacherLessons(_teacherId?: string): Promise<QueryResult<any[]>> {
  return getLessonsList();
}

export async function getTeacherActivities(_teacherId?: string): Promise<QueryResult<any[]>> {
  if (!isSupabaseConfigured) return { data: [], error: null };
  try {
    const core = await loadCoreData();
    const data = core.activities.map((activity) => ({
      ...enrichActivity(activity, core.classMap),
      pending_count: core.studentActivities.filter((row) => row.activity_id === activity.id && row.status === "pending").length,
    }));
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getTeacherMaterials(_teacherId?: string): Promise<QueryResult<any[]>> {
  return getSystemMaterials();
}

export async function getTeacherStudents(_teacherId?: string): Promise<QueryResult<any[]>> {
  if (!isSupabaseConfigured) return { data: [], error: null };
  try {
    const core = await loadCoreData();
    const data = core.students.map((student) => {
      const enrollment = core.studentClasses.find((row) => row.student_id === student.id);
      return {
        ...student,
        class_name: enrollment ? getClassName(core.classMap.get(enrollment.class_id)) : "-",
      };
    });
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createLessonWithPlan(input: {
  classId: string;
  teacherId?: string | null;
  title: string;
  lessonType: "presential" | "online";
  room?: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  topic?: string;
  objective?: string;
  status?: "draft" | "scheduled";
  planSource?: "manual" | "ai_assisted";
  agenda?: any[];
  warmup?: string;
  mainActivity?: string;
  practice?: string;
  homework?: string;
  notes?: string;
}): Promise<QueryResult<any>> {
  if (!isSupabaseConfigured) return { data: { id: "mock-lesson" }, error: null };

  const { data: lesson, error: lessonError } = await supabase.rpc("rpc_easy_create_lesson", {
    p_class_id: input.classId,
    p_teacher_id: input.teacherId || null,
    p_title: input.title,
    p_lesson_type: input.lessonType,
    p_room: input.room || null,
    p_scheduled_date: input.scheduledDate,
    p_start_time: input.startTime,
    p_end_time: input.endTime,
    p_topic: input.topic || null,
    p_lesson_objective: input.objective || null,
    p_status: input.status || "scheduled",
    p_online_url: null,
  });

  if (lessonError || !lesson?.id) return { data: null, error: lessonError || "lesson_create_failed" };

  const { data: plan, error: planError } = await supabase.rpc("rpc_easy_upsert_lesson_plan", {
    p_lesson_id: lesson.id,
    p_source: input.planSource || "manual",
    p_title: input.title,
    p_objective: input.objective || "",
    p_agenda: input.agenda || [],
    p_warmup_activity: input.warmup || null,
    p_main_activity: input.mainActivity || input.objective || null,
    p_practice_activity: input.practice || null,
    p_homework: input.homework || null,
    p_teacher_notes: input.notes || null,
    p_status: input.status === "draft" ? "draft" : "approved",
  });

  if (planError) return { data: { lesson }, error: planError };

  return { data: { lesson, plan }, error: null };
}

export async function recordAiSuggestion(input: {
  lessonId?: string | null;
  classId?: string | null;
  promptInput: Record<string, unknown>;
  suggestionOutput: Record<string, unknown>;
  status?: "pending_review" | "approved" | "rejected";
}): Promise<QueryResult<any>> {
  if (!isSupabaseConfigured) return { data: { id: "mock-ai-suggestion" }, error: null };
  const { data, error } = await supabase.rpc("rpc_easy_record_ai_suggestion", {
    p_lesson_id: input.lessonId || null,
    p_class_id: input.classId || null,
    p_prompt_input: input.promptInput,
    p_suggestion_output: input.suggestionOutput,
    p_status: input.status || "pending_review",
  });
  return { data, error };
}
