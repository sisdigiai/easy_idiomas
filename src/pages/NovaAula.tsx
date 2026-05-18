import { useEffect, useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { createLessonWithPlan, getSystemClasses, getSystemTeachers } from "@/lib/supabase/queries";

const today = new Date().toISOString().split("T")[0];

export default function NovaAula() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    classId: "",
    teacherId: "",
    title: "",
    lessonType: "presential" as "presential" | "online",
    room: "",
    scheduledDate: today,
    startTime: "19:00",
    endTime: "20:30",
    topic: "",
    objective: "",
    notes: "",
  });

  useEffect(() => {
    async function loadOptions() {
      const [classesRes, teachersRes] = await Promise.all([getSystemClasses(), getSystemTeachers()]);
      setClasses(classesRes.data || []);
      setTeachers(teachersRes.data || []);
      setForm((current) => ({
        ...current,
        classId: current.classId || classesRes.data?.[0]?.id || "",
        teacherId: current.teacherId || classesRes.data?.[0]?.teacher_id || teachersRes.data?.[0]?.id || "",
      }));
    }
    loadOptions();
  }, []);

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async (status: "draft" | "scheduled") => {
    setSaving(true);
    setError("");

    if (!form.classId || !form.title.trim() || !form.scheduledDate || !form.startTime || !form.endTime) {
      setError("Preencha turma, titulo, data e horario antes de salvar.");
      setSaving(false);
      return;
    }

    const res = await createLessonWithPlan({
      classId: form.classId,
      teacherId: form.teacherId || null,
      title: form.title.trim(),
      lessonType: form.lessonType,
      room: form.room,
      scheduledDate: form.scheduledDate,
      startTime: form.startTime,
      endTime: form.endTime,
      topic: form.topic,
      objective: form.objective,
      notes: form.notes,
      status,
      planSource: "manual",
      mainActivity: form.objective,
    });

    setSaving(false);
    if (res.error) {
      setError((res.error as any)?.message || "Nao foi possivel salvar a aula.");
      return;
    }

    navigate(status === "draft" ? "/aulas" : `/aulas/${res.data?.lesson?.id || ""}`);
  };

  return (
    <Shell>
      <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-12">
        <header className="bg-surface px-6 md:px-8 py-7 rounded-2xl bento-shadow border border-outline-variant/30">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div>
              <h1 className="font-display-sm text-secondary tracking-tight mb-2">Criar Nova Aula</h1>
              <p className="font-body-md text-on-surface-variant max-w-xl">
                A aula e o plano sao salvos via RPC segura. Professor cria apenas para turmas vinculadas; coordenacao e admin podem operar de forma ampla.
              </p>
            </div>
            <Button className="rounded-xl gap-2 bg-tertiary text-on-tertiary hover:bg-tertiary/90" onClick={() => navigate("/aulas/nova/ia")}>
              <span className="material-symbols-outlined text-[20px]">magic_button</span>
              Gerar com IA
            </Button>
          </div>
        </header>

        <main className="bg-surface rounded-2xl bento-shadow border border-outline-variant/30 flex flex-col gap-7 p-6 md:p-8">
          {error && (
            <div className="rounded-xl border border-error/30 bg-error-container/30 px-4 py-3 text-error font-label-md">
              {error}
            </div>
          )}

          <section>
            <h3 className="font-headline-sm text-secondary mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-outline-variant">info</span>
              Informacoes basicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <label className="flex flex-col gap-1.5">
                <span className="font-label-sm uppercase tracking-wider text-on-surface-variant/70 ml-1">Turma</span>
                <select value={form.classId} onChange={(event) => update("classId", event.target.value)} className="px-4 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                  {classes.map((classData) => (
                    <option key={classData.id} value={classData.id}>
                      {classData.name} - {classData.language} {classData.level}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-label-sm uppercase tracking-wider text-on-surface-variant/70 ml-1">Professor</span>
                <select value={form.teacherId} onChange={(event) => update("teacherId", event.target.value)} className="px-4 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>{teacher.full_name}</option>
                  ))}
                </select>
              </label>
              <label className="md:col-span-2 flex flex-col gap-1.5">
                <span className="font-label-sm uppercase tracking-wider text-on-surface-variant/70 ml-1">Titulo da aula</span>
                <input value={form.title} onChange={(event) => update("title", event.target.value)} className="px-4 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Ex: Present perfect na pratica" />
              </label>
            </div>
          </section>

          <div className="w-full h-px bg-outline-variant/30" />

          <section>
            <h3 className="font-headline-sm text-secondary mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-outline-variant">schedule</span>
              Horario e local
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <label className="flex flex-col gap-1.5">
                <span className="font-label-sm uppercase tracking-wider text-on-surface-variant/70 ml-1">Data</span>
                <input type="date" value={form.scheduledDate} onChange={(event) => update("scheduledDate", event.target.value)} className="px-4 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-label-sm uppercase tracking-wider text-on-surface-variant/70 ml-1">Inicio</span>
                <input type="time" value={form.startTime} onChange={(event) => update("startTime", event.target.value)} className="px-4 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-label-sm uppercase tracking-wider text-on-surface-variant/70 ml-1">Fim</span>
                <input type="time" value={form.endTime} onChange={(event) => update("endTime", event.target.value)} className="px-4 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-label-sm uppercase tracking-wider text-on-surface-variant/70 ml-1">Tipo</span>
                <select value={form.lessonType} onChange={(event) => update("lessonType", event.target.value)} className="px-4 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                  <option value="presential">Presencial</option>
                  <option value="online">Online</option>
                </select>
              </label>
              <label className="md:col-span-4 flex flex-col gap-1.5">
                <span className="font-label-sm uppercase tracking-wider text-on-surface-variant/70 ml-1">Sala ou link</span>
                <input value={form.room} onChange={(event) => update("room", event.target.value)} className="px-4 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Sala 04 ou link da sala online" />
              </label>
            </div>
          </section>

          <div className="w-full h-px bg-outline-variant/30" />

          <section>
            <h3 className="font-headline-sm text-secondary mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-outline-variant">menu_book</span>
              Plano de aula
            </h3>
            <div className="flex flex-col gap-5">
              <label className="flex flex-col gap-1.5">
                <span className="font-label-sm uppercase tracking-wider text-on-surface-variant/70 ml-1">Tema principal</span>
                <input value={form.topic} onChange={(event) => update("topic", event.target.value)} className="px-4 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Qual o assunto principal da aula?" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-label-sm uppercase tracking-wider text-on-surface-variant/70 ml-1">Objetivo da aula</span>
                <textarea value={form.objective} onChange={(event) => update("objective", event.target.value)} className="px-4 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[100px] resize-none" placeholder="Ao final desta aula, o que os alunos devem conseguir fazer?" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-label-sm uppercase tracking-wider text-on-surface-variant/70 ml-1">Observacoes internas</span>
                <textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} className="px-4 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[80px] resize-none" placeholder="Materiais, lembretes e ajustes para o professor." />
              </label>
            </div>
          </section>

          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-2 pt-6 border-t border-outline-variant/30">
            <Button variant="outline" className="rounded-xl px-5" onClick={() => navigate(-1)} disabled={saving}>Cancelar</Button>
            <Button variant="outline" className="rounded-xl px-5 border-secondary/30 text-secondary hover:bg-secondary/5" onClick={() => handleSave("draft")} disabled={saving}>
              Salvar rascunho
            </Button>
            <Button className="rounded-xl px-6 shadow-md shadow-primary/20" onClick={() => handleSave("scheduled")} disabled={saving}>
              {saving ? "Salvando..." : "Agendar aula"}
            </Button>
          </div>
        </main>
      </div>
    </Shell>
  );
}
