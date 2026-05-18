import { useEffect, useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { createLessonWithPlan, getSystemClasses, recordAiSuggestion } from "@/lib/supabase/queries";

export default function AssistenteIA() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [suggestion, setSuggestion] = useState<any>(null);
  const [form, setForm] = useState({
    classId: "",
    duration: "60",
    focus: "Gramatica",
    topic: "Present Perfect (Have you ever...)",
    scheduledDate: new Date().toISOString().split("T")[0],
    startTime: "19:00",
  });

  useEffect(() => {
    async function loadClasses() {
      const res = await getSystemClasses();
      setClasses(res.data || []);
      setForm((current) => ({ ...current, classId: current.classId || res.data?.[0]?.id || "" }));
    }
    loadClasses();
  }, []);

  const handleGenerate = () => {
    setLoading(true);
    setError("");
    setTimeout(() => {
      setSuggestion({
        title: "Mastering Present Perfect",
        objective: "Students will be able to describe past experiences using the present perfect tense.",
        agenda: [
          { time: "10m", title: "Warm up - Have you ever?" },
          { time: "20m", title: "Grammar presentation" },
          { time: "20m", title: "Speaking practice" },
          { time: "10m", title: "Wrap-up and feedback" },
        ],
        warmup: "Ask students if they have ever traveled to a different country. Pair them up to discuss experiences.",
        main_activity: "Explain Present Perfect structure and contrast it with Simple Past using timelines.",
        practice: "Students ask each other questions starting with 'Have you ever...' and answer with short responses.",
        homework: "Write a short paragraph about three life experiences using the target grammar.",
        notes: "Focus on the difference between specific past time and unspecified life experiences.",
      });
      setLoading(false);
    }, 800);
  };

  const handleApprove = async () => {
    if (!suggestion || !form.classId) {
      setError("Selecione uma turma antes de aprovar o plano.");
      return;
    }

    setSaving(true);
    setError("");
    const duration = Number(form.duration) || 60;
    const endDate = new Date(`${form.scheduledDate}T${form.startTime}`);
    endDate.setMinutes(endDate.getMinutes() + duration);
    const selectedClass = classes.find((classData) => classData.id === form.classId);

    const lessonRes = await createLessonWithPlan({
      classId: form.classId,
      teacherId: selectedClass?.teacher_id || null,
      title: suggestion.title,
      lessonType: "presential",
      room: "A definir",
      scheduledDate: form.scheduledDate,
      startTime: form.startTime,
      endTime: endDate.toTimeString().slice(0, 5),
      topic: form.topic,
      objective: suggestion.objective,
      agenda: suggestion.agenda,
      warmup: suggestion.warmup,
      mainActivity: suggestion.main_activity,
      practice: suggestion.practice,
      homework: suggestion.homework,
      notes: suggestion.notes,
      status: "scheduled",
      planSource: "ai_assisted",
    });

    if (lessonRes.error) {
      setSaving(false);
      setError((lessonRes.error as any)?.message || "Nao foi possivel aprovar o plano.");
      return;
    }

    await recordAiSuggestion({
      lessonId: lessonRes.data?.lesson?.id,
      classId: form.classId,
      promptInput: { focus: form.focus, topic: form.topic, duration: form.duration },
      suggestionOutput: suggestion,
      status: "approved",
    });

    setSaving(false);
    navigate(`/aulas/${lessonRes.data?.lesson?.id || ""}`);
  };

  return (
    <Shell>
      <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-12">
        <header className="flex flex-col items-center text-center gap-4 py-8">
          <div className="w-16 h-16 rounded-2xl bg-tertiary-container/30 text-tertiary flex items-center justify-center mb-2 border border-tertiary/20">
            <span className="material-symbols-outlined text-[32px]">auto_awesome</span>
          </div>
          <h1 className="font-display-sm text-secondary tracking-tight">Assistente de Aula IA</h1>
          <p className="font-body-lg text-on-surface-variant max-w-lg">
            A IA gera uma sugestao. A aprovacao humana cria a aula e grava o plano no banco.
          </p>
        </header>

        {!suggestion && (
          <main className="bg-surface rounded-2xl bento-shadow border border-outline-variant/30 flex flex-col gap-6 p-6 md:p-8 mx-auto w-full max-w-2xl relative overflow-hidden">
            {loading && (
              <div className="absolute inset-0 bg-surface/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full border-4 border-tertiary/20 border-t-tertiary animate-spin mb-4" />
                <h3 className="font-headline-sm text-tertiary">Gerando sugestao...</h3>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <label className="flex flex-col gap-1.5">
                <span className="font-label-sm uppercase tracking-wider text-on-surface-variant/70 ml-1">Turma</span>
                <select value={form.classId} onChange={(event) => setForm({ ...form, classId: event.target.value })} className="px-4 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-tertiary/20 focus:border-tertiary outline-none">
                  {classes.map((classData) => (
                    <option key={classData.id} value={classData.id}>{classData.name} - {classData.language} {classData.level}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-label-sm uppercase tracking-wider text-on-surface-variant/70 ml-1">Duracao</span>
                <input type="number" value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} className="px-4 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-tertiary/20 focus:border-tertiary outline-none" />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="font-label-sm uppercase tracking-wider text-on-surface-variant/70 ml-1">Foco principal</span>
              <select value={form.focus} onChange={(event) => setForm({ ...form, focus: event.target.value })} className="px-4 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-tertiary/20 focus:border-tertiary outline-none">
                <option>Gramatica</option>
                <option>Conversacao</option>
                <option>Vocabulario</option>
                <option>Compreensao</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-label-sm uppercase tracking-wider text-on-surface-variant/70 ml-1">Tema da aula</span>
              <input value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })} className="px-4 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-tertiary/20 focus:border-tertiary outline-none" />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <label className="flex flex-col gap-1.5">
                <span className="font-label-sm uppercase tracking-wider text-on-surface-variant/70 ml-1">Data</span>
                <input type="date" value={form.scheduledDate} onChange={(event) => setForm({ ...form, scheduledDate: event.target.value })} className="px-4 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-tertiary/20 focus:border-tertiary outline-none" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-label-sm uppercase tracking-wider text-on-surface-variant/70 ml-1">Inicio</span>
                <input type="time" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} className="px-4 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest focus:ring-2 focus:ring-tertiary/20 focus:border-tertiary outline-none" />
              </label>
            </div>

            {error && <p className="text-error font-label-md">{error}</p>}

            <div className="flex justify-between items-center gap-3 mt-4 pt-6 border-t border-outline-variant/30">
              <Button variant="ghost" className="text-on-surface-variant hover:text-on-surface" onClick={() => navigate(-1)}>Voltar</Button>
              <Button className="rounded-xl px-8 bg-tertiary hover:bg-tertiary/90 gap-2" onClick={handleGenerate} disabled={loading}>
                <span className="material-symbols-outlined text-[20px]">magic_button</span>
                {loading ? "Gerando..." : "Gerar sugestao"}
              </Button>
            </div>
          </main>
        )}

        {suggestion && (
          <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
            <div className="bg-surface rounded-2xl bento-shadow border border-outline-variant/30 overflow-hidden">
              <div className="border-b border-outline-variant/30 p-6 md:p-8">
                <span className="px-3 py-1 bg-tertiary-container/30 text-tertiary font-label-sm uppercase tracking-wider rounded-lg border border-tertiary/20">Sugestao IA</span>
                <h2 className="font-display-sm text-secondary tracking-tight mt-4 mb-2">{suggestion.title}</h2>
                <p className="font-body-lg text-on-surface-variant max-w-2xl"><strong>Objetivo:</strong> {suggestion.objective}</p>
              </div>

              <div className="p-6 md:p-8 space-y-4">
                {[
                  ["Aquecimento", suggestion.warmup],
                  ["Atividade principal", suggestion.main_activity],
                  ["Pratica integrada", suggestion.practice],
                  ["Tarefa de casa", suggestion.homework],
                  ["Notas do professor", suggestion.notes],
                ].map(([title, body]) => (
                  <div key={title} className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30">
                    <p className="font-label-sm uppercase tracking-wider text-secondary mb-2">{title}</p>
                    <p className="font-body-md text-on-surface leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-error font-label-md text-center">{error}</p>}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 px-6 bg-surface rounded-2xl border border-outline-variant/40 shadow-sm">
              <Button variant="ghost" className="text-on-surface-variant hover:text-error hover:bg-error/10 w-full sm:w-auto rounded-xl" onClick={() => setSuggestion(null)}>
                Refazer
              </Button>
              <Button className="w-full sm:w-auto rounded-xl bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/20" onClick={handleApprove} disabled={saving}>
                {saving ? "Aprovando..." : "Aprovar e agendar"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
