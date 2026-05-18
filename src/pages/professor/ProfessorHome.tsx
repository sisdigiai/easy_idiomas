import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { useAuth } from "@/contexts/AuthContext";
import { getTeacherDashboard } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";

export default function ProfessorHome() {
  const { profile } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const teacherId = profile?.id;
      const { data } = await getTeacherDashboard(teacherId);
      setData(data);
      setLoading(false);
    }
    load();
  }, [profile]);

  if (loading) {
    return <Shell><div className="p-8"><p>Carregando painel...</p></div></Shell>;
  }

  const firstName = profile?.full_name?.split(' ')[0] || "Professor";
  const { todayLessons, pendingReviews, nextLesson } = data || {};

  return (
    <Shell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-10">
        {/* Welcome Header */}
        <header className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-tertiary to-tertiary-container border border-outline-variant/20 p-8 md:p-10 flex flex-col md:flex-row md:justify-between items-center md:items-end gap-6 shadow-xl w-full">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          
          <div className="relative z-10 w-full md:w-auto text-center md:text-left">
            <h1 className="font-display-lg text-on-tertiary-container mb-2 tracking-tight">
              Bem-vindo, <span className="font-bold">{firstName}</span>!
            </h1>
            <p className="font-body-lg text-on-tertiary-container/80">
              VocÃª tem {todayLessons?.length || 0} aulas programadas para hoje.
            </p>
          </div>
          
          <div className="relative z-10 flex gap-4 md:gap-6 bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/20 w-full md:w-auto overflow-x-auto hide-scrollbar">
            <div className="flex flex-col items-center justify-center min-w-[80px]">
              <span className="font-headline-lg text-on-tertiary-container">{todayLessons?.length || 0}</span>
              <span className="font-label-sm text-on-tertiary-container/70 uppercase tracking-widest text-[10px]">Aulas Hoje</span>
            </div>
            <div className="w-px bg-white/20 h-10 self-center"></div>
            <div className="flex flex-col items-center justify-center min-w-[80px]">
              <span className="font-headline-lg text-on-tertiary-container">{pendingReviews || 0}</span>
              <span className="font-label-sm text-on-tertiary-container/70 uppercase tracking-widest text-[10px]">RevisÃµes</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Next Lesson Call to Action */}
            {nextLesson && (
              <div className="bg-surface rounded-3xl p-6 md:p-8 bento-shadow border border-outline-variant/50 flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-2 h-full bg-primary rounded-l-3xl"></div>
                  
                  <div className="flex-1 ml-2">
                      <p className="font-label-sm text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                         <span className="material-symbols-outlined text-[16px] animate-bounce">alarm_on</span>
                         Sua prÃ³xima aula
                      </p>
                      <h2 className="font-display-sm text-on-surface mb-2 tracking-tight group-hover:text-primary transition-colors">{nextLesson.title}</h2>
                      <p className="font-body-md text-on-surface-variant flex items-center gap-2">
                          <span className="material-symbols-outlined text-[20px]">group</span>
                          {nextLesson.class_data?.language || 'Idioma'} {nextLesson.class_data?.level || 'NÃ­vel'} â€¢ {nextLesson.room || 'Virtual'}
                      </p>
                  </div>

                  <div className="flex flex-col gap-3 bg-surface-container-low border border-outline-variant/50 p-5 rounded-2xl w-full md:w-auto shrink-0">
                      <div className="flex justify-between items-center">
                          <span className="font-headline-sm text-on-surface">{nextLesson.start_time?.substring(0,5) || '00:00'}</span>
                      </div>
                      <Button className="w-full mt-2 rounded-xl">Iniciar Aula</Button>
                  </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-surface-container-low hover:border-primary/30 transition-all cursor-pointer group">
                   <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">qr_code_scanner</span>
                   </div>
                   <span className="font-label-sm text-on-surface">Iniciar Chamada</span>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-surface-container-low hover:border-primary/30 transition-all cursor-pointer group">
                   <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">assignment_add</span>
                   </div>
                   <span className="font-label-sm text-on-surface">Nova Atividade</span>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-surface-container-low hover:border-primary/30 transition-all cursor-pointer group">
                   <div className="w-12 h-12 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">upload_file</span>
                   </div>
                   <span className="font-label-sm text-on-surface">Enviar Material</span>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-surface-container-low hover:border-primary/30 transition-all cursor-pointer group">
                   <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">grading</span>
                   </div>
                   <span className="font-label-sm text-on-surface">Corrigir</span>
                </div>
            </div>
          </div>

          <div className="lg:col-span-1">
             {/* Today's Schedule Timeline */}
             <div className="bg-surface rounded-3xl p-6 md:p-8 bento-shadow border border-outline-variant/30 relative overflow-hidden h-full">
                <h3 className="font-headline-md text-secondary tracking-tight mb-6">Agenda de Hoje</h3>
                
                {todayLessons && todayLessons.length > 0 ? (
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-outline-variant/30 before:to-transparent">
                    {todayLessons.map((lesson: any, i: number) => (
                      <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-secondary text-secondary-container shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10"></div>
                        <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm ml-4 md:ml-0 group-hover:border-primary/30 transition-colors">
                           <div className="flex justify-between items-start mb-1">
                             <span className="font-label-sm text-primary">{lesson.start_time?.substring(0,5)}</span>
                           </div>
                           <p className="font-headline-sm text-on-surface line-clamp-1">{lesson.title}</p>
                           <p className="font-body-sm text-on-surface-variant flex items-center gap-1 mt-1">
                             <span className="material-symbols-outlined text-[14px]">room</span> {lesson.room}
                           </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-on-surface-variant">NÃ£o hÃ¡ aulas programadas para hoje.</p>
                )}
             </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

