import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { getLessonById } from "@/lib/supabase/queries";

export default function AulaDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await getLessonById(id);
        if (data && !error) {
          setLesson(data);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleGerarQR = () => {
    navigate(`/presenca?lessonId=${id}`);
  };

  if (loading) {
    return (
      <Shell>
        <div className="flex justify-center p-8">
          <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
        </div>
      </Shell>
    );
  }

  if (!lesson) {
    return (
      <Shell>
        <div className="p-4 md:p-8">
          <h1 className="font-headline-lg text-secondary">Aula não encontrada</h1>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-secondary hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Voltar
        </button>

        <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8 pb-6 border-b border-outline-variant/20">
            <div>
              <p className="text-secondary font-label-md mb-1 uppercase tracking-wide">
                {lesson.class?.language} {lesson.class?.level}
              </p>
              <h1 className="font-headline-lg text-on-surface mb-2">{lesson.title}</h1>
              <div className="flex gap-4 text-on-surface-variant font-body-md bg-secondary-container/20 p-3 rounded-lg inline-flex">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                  {new Date(lesson.scheduled_date).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                  {lesson.start_time?.substring(0, 5)} - {lesson.end_time?.substring(0, 5)}
                </span>
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">meeting_room</span>
                  {lesson.room}
                </span>
              </div>
            </div>
            <div>
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-label-md ${lesson.status === 'in_progress' ? 'bg-[#c8e6c9] text-[#2e7d32]' : 'bg-secondary-container text-on-secondary-container'}`}>
                {lesson.status === 'in_progress' && <span className="w-2 h-2 rounded-full bg-[#2e7d32] animate-pulse"></span>}
                {lesson.status === 'in_progress' ? 'Em andamento' : lesson.status === 'completed' ? 'Concluída' : 'Agendada'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface px-6 py-8 rounded-xl border border-outline-variant/30 text-center flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-primary mb-4 p-4 bg-primary-container/30 rounded-full">qr_code_scanner</span>
              <h3 className="font-headline-sm text-on-surface mb-2">Chamada via QR Code</h3>
              <p className="font-body-md text-on-surface-variant mb-6 max-w-sm">
                Inicie a chamada para gerar o código QR temporário. Os alunos poderão escanear para registrar presença.
              </p>
              <Button size="lg" onClick={handleGerarQR} className="w-full md:w-auto gap-2">
                <span className="material-symbols-outlined">qr_code_2</span>
                Gerar QR da Aula
              </Button>
            </div>

            <div className="bg-surface px-6 py-8 rounded-xl border border-outline-variant/30 text-center flex flex-col items-center justify-center">
               <span className="material-symbols-outlined text-4xl text-secondary mb-4 p-4 bg-secondary-container/30 rounded-full">fact_check</span>
               <h3 className="font-headline-sm text-on-surface mb-2">Chamada Manual</h3>
               <p className="font-body-md text-on-surface-variant mb-6 max-w-sm">
                 Se preferir, você pode acessar a lista de alunos e realizar a chamada manualmente.
               </p>
               <Button variant="outline" size="lg" onClick={() => navigate(`/presenca?lessonId=${id}&manual=true`)} className="w-full md:w-auto gap-2">
                 <span className="material-symbols-outlined">checklist</span>
                 Fazer Chamada Manual
               </Button>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
