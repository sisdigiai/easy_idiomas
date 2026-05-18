import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shell } from "@/components/layout/Shell";
import { useAuth } from "@/contexts/AuthContext";
import { getTeacherLessons } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";

export default function ProfessorPresenca() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await getTeacherLessons(profile?.id);
      const list = data || [];
      setLessons(list);
      setSelectedLessonId(list[0]?.id || "");
      setLoading(false);
    }
    load();
  }, [profile]);

  if (loading) {
    return <Shell><div className="p-8"><p>Carregando...</p></div></Shell>;
  }

  const today = new Date().toDateString();
  const todayLessons = lessons.filter((lesson) => new Date(lesson.scheduled_date).toDateString() === today);
  const options = todayLessons.length ? todayLessons : lessons;

  return (
    <Shell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="font-headline-lg text-secondary mb-2">Presenca</h1>
          <p className="font-body-lg text-on-surface-variant">Gerencie a chamada via QR Code ou ajuste manual para as suas aulas.</p>
        </div>

        <div className="bg-surface rounded-2xl p-6 md:p-8 bento-shadow border border-outline-variant/30">
          <h2 className="font-headline-md text-secondary mb-6 tracking-tight">Gerar QR Code de presenca</h2>

          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center w-full">
            <div className="w-full md:w-1/2">
              <p className="font-label-md text-on-surface mb-2">Selecione a aula</p>
              <select value={selectedLessonId} onChange={(event) => setSelectedLessonId(event.target.value)} className="w-full bg-surface-container-low border border-outline-variant/30 text-on-surface p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 mb-6">
                {options.length > 0 ? options.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title} ({lesson.start_time?.substring(0, 5) || "--:--"})
                  </option>
                )) : (
                  <option disabled>Nenhuma aula disponivel</option>
                )}
              </select>

              <Button className="w-full rounded-xl" disabled={!selectedLessonId} onClick={() => navigate(`/presenca?lessonId=${selectedLessonId}`)}>
                <span className="material-symbols-outlined mr-2">qr_code_2</span>
                Abrir QR Code dinamico
              </Button>
            </div>

            <div className="w-full md:w-1/2 flex items-center justify-center p-8 border-2 border-dashed border-outline-variant/30 rounded-2xl bg-surface-container-lowest">
              <div className="text-center opacity-60">
                <span className="material-symbols-outlined text-[96px] text-on-surface-variant">qr_code_scanner</span>
                <p className="font-label-md mt-4">O codigo e gerado na tela de presenca com expiracao curta.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-6 md:p-8 bento-shadow border border-outline-variant/30">
          <h2 className="font-headline-md text-secondary mb-6 tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined">checklist</span> Chamada manual
          </h2>
          <p className="font-body-md text-on-surface-variant mb-6">Use a mesma tela de presenca para conferir a lista e ajustar a chamada quando necessario.</p>
          <Button variant="outline" className="rounded-xl" disabled={!selectedLessonId} onClick={() => navigate(`/presenca?lessonId=${selectedLessonId}&manual=true`)}>
            Selecionar aula para chamada manual
          </Button>
        </div>
      </div>
    </Shell>
  );
}
