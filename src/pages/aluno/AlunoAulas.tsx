import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { useAuth } from "@/contexts/AuthContext";
import { getStudentLessons } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";

export default function AlunoAulas() {
  const { profile } = useAuth();
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // If we have a profile ID in a real app, we'd query by student ID.
      // Since it's a demo/mock, we pass a dummy ID or the profile.id.
      const studentId = profile?.id;
      const { data } = await getStudentLessons(studentId);
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
          <p className="font-body-lg text-on-surface-variant">Acompanhe seu cronograma de aulas e acesse as salas virtuais.</p>
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
                  <div className="flex items-center gap-2 text-on-surface-variant font-label-md mb-4 bg-surface-container-low p-2 rounded-lg">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    {lesson.teacher?.full_name || lesson.teacher_name || "Prof. Associado"}
                  </div>
                  <div className="mt-auto flex justify-between items-center w-full gap-4">
                    <div className="flex items-center gap-1.5 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px]">location_on</span>
                      <span className="font-label-md truncate">{lesson.room}</span>
                    </div>
                    <Button className="rounded-xl shrink-0">Entrar na Sala</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-on-surface-variant">NÃ£o hÃ¡ prÃ³ximas aulas agendadas.</p>
          )}
        </div>

        <div className="bg-surface rounded-3xl p-6 md:p-8 bento-shadow border border-outline-variant/30">
          <h2 className="font-headline-md text-secondary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant">history</span>
            Aulas Passadas
          </h2>
          
          {pastLessons.length > 0 ? (
            <div className="space-y-3">
              {pastLessons.map((lesson, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-outline-variant/30 rounded-xl bg-surface-container-lowest gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-on-surface-variant">check_circle</span>
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-on-surface">{lesson.title}</h3>
                      <p className="font-body-sm text-on-surface-variant">
                        {new Date(lesson.scheduled_date).toLocaleDateString('pt-BR')} â€¢ {lesson.class?.language} {lesson.class?.level}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full md:w-auto rounded-xl">Ver Resumo</Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-on-surface-variant">Nenhum histÃ³rico de aulas.</p>
          )}
        </div>
      </div>
    </Shell>
  );
}

