import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { useAuth } from "@/contexts/AuthContext";
import { getTeacherLessons } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";

export default function ProfessorAulas() {
  const { profile } = useAuth();
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const teacherId = profile?.id;
      const { data } = await getTeacherLessons(teacherId);
      if (data) setLessons(data);
      setLoading(false);
    }
    load();
  }, [profile]);

  if (loading) {
    return <Shell><div className="p-8"><p>Carregando aulas...</p></div></Shell>;
  }

  const upcomingLessons = lessons.filter(l => l.status === "scheduled" || new Date(l.scheduled_date) >= new Date());
  const pastLessons = lessons.filter(l => l.status !== "scheduled" && new Date(l.scheduled_date) < new Date());

  return (
    <Shell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="font-headline-lg text-secondary mb-2">Minhas Aulas</h1>
          <p className="font-body-lg text-on-surface-variant">Acompanhe seu cronograma de aulas e inicie as salas virtuais.</p>
        </div>

        <div className="bg-surface rounded-3xl p-6 md:p-8 bento-shadow border border-outline-variant/30">
          <h2 className="font-headline-md text-secondary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">event_upcoming</span>
            PrÃ³ximas Aulas
          </h2>
          
          {upcomingLessons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingLessons.map((lesson, i) => (
                <div key={i} className="flex flex-col p-5 border border-outline-variant/40 rounded-2xl hover:border-primary/40 hover:bg-surface-container-lowest transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="font-label-sm text-primary uppercase tracking-widest">{lesson.class?.language} {lesson.class?.level}</span>
                      <h3 className="font-headline-sm text-on-surface mt-1 group-hover:text-primary transition-colors">{lesson.title}</h3>
                    </div>
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-sm text-center">
                      <p>{new Date(lesson.scheduled_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                      <p>{lesson.start_time?.substring(0, 5)}</p>
                    </div>
                  </div>
                  <div className="mt-auto flex justify-between items-center w-full gap-4 pt-4 border-t border-outline-variant/20">
                    <div className="flex items-center gap-1.5 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px]">location_on</span>
                      <span className="font-label-md truncate">{lesson.room}</span>
                    </div>
                    <Button className="rounded-xl shrink-0">Iniciar Sala</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-12">
               <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4 opacity-50">event_busy</span>
               <p className="text-on-surface-variant font-label-md">Nenhuma aula futura agendada.</p>
             </div>
          )}
        </div>

        <div className="bg-surface rounded-3xl p-6 md:p-8 bento-shadow border border-outline-variant/30">
          <h2 className="font-headline-md text-secondary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant">history</span>
            Aulas Ministradas
          </h2>
          
          {pastLessons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastLessons.map((lesson, i) => (
                <div key={i} className="flex flex-col p-5 border border-outline-variant/30 rounded-2xl bg-surface-container-lowest opacity-70 hover:opacity-100 transition-opacity">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-headline-sm text-on-surface line-clamp-1">{lesson.title}</h3>
                      <p className="font-label-sm text-on-surface-variant mt-1">
                        {new Date(lesson.scheduled_date).toLocaleDateString('pt-BR')} â€¢ {lesson.class?.language} {lesson.class?.level}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-on-surface-variant">Nenhum histÃ³rico de aulas ministradas.</p>
          )}
        </div>
      </div>
    </Shell>
  );
}

