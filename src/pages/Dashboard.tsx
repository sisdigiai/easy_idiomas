import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboardData } from "@/lib/supabase/queries";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { profile } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const roleName = profile?.role === 'admin' ? "Administrador" : "Coordenador";
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    async function load() {
      const res = await getDashboardData();
      if (res.data) setData(res.data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <Shell>
      <div className="flex flex-col gap-8 pb-10">
        
        {/* Welcome Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-primary/5 border border-primary/10 p-8 md:p-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6 shadow-sm">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="relative z-10">
            <h1 className="font-display-lg text-secondary mb-3 tracking-tight">
              Olá, <span className="text-primary">{profile?.full_name?.split(' ')[0] || roleName}</span>!
            </h1>
            <p className="font-body-lg text-on-surface-variant max-w-lg">
              Aqui está o panorama completo da sua escola hoje. Prontos para mais um dia de aprendizado?
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 relative z-10">
            <Button className="rounded-xl px-6 gap-2 shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all" onClick={() => window.location.href='/aulas/nova'}>
               <span className="material-symbols-outlined text-[20px]">add_circle</span>
               Nova aula
            </Button>
            <Button variant="outline" className="rounded-xl bg-surface/80 backdrop-blur-md px-5 gap-2 hover:-translate-y-1 transition-all border-outline-variant/50">
               <span className="material-symbols-outlined text-[20px]">qr_code</span>
               Gerar QR
            </Button>
          </div>
        </div>

        {/* Bento Grid Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-surface rounded-3xl p-6 bento-shadow bento-hover border border-outline-variant/30 flex flex-col relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-4">
              <span className="material-symbols-outlined">group</span>
            </div>
            <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-2">Alunos Ativos</h3>
            <div className="flex items-baseline gap-3">
              <span className="font-display-lg font-bold text-on-surface">
                  {loading ? "..." : data?.summary?.active_students || 0}
              </span>
              <Badge variant="success" className="gap-1 bg-green-100 text-green-800 rounded-full px-2 py-0.5 border-0">
                <span className="material-symbols-outlined text-[12px]">trending_up</span>
                +5%
              </Badge>
            </div>
          </div>
          
          <div className="bg-surface rounded-3xl p-6 bento-shadow bento-hover border border-outline-variant/30 flex flex-col relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <span className="material-symbols-outlined">calendar_month</span>
            </div>
            <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-2">Aulas na Semana</h3>
            <div className="flex items-baseline gap-3">
              <span className="font-display-lg font-bold text-on-surface">
                  {loading ? "..." : data?.summary?.weekly_classes || 0}
              </span>
              <span className="font-body-sm text-on-surface-variant">Previstas</span>
            </div>
          </div>
          
          <div className="bg-surface rounded-3xl p-6 bento-shadow bento-hover border border-outline-variant/30 flex flex-col relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-tertiary/10 text-tertiary flex items-center justify-center mb-4">
              <span className="material-symbols-outlined">fact_check</span>
            </div>
            <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-2">Presença Média</h3>
            <div className="flex items-baseline gap-3">
              <span className="font-display-lg font-bold text-on-surface">
                  {loading ? "..." : Math.round(data?.summary?.avg_attendance_percentage || 0)}%
              </span>
            </div>
          </div>
          
          <div className="bg-surface rounded-3xl p-6 bento-shadow border border-outline-variant/30 flex flex-col relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-error/5 rounded-bl-full pointer-events-none"></div>
             <div className="w-12 h-12 rounded-2xl bg-error/10 text-error flex items-center justify-center mb-4">
              <span className="material-symbols-outlined">assignment_late</span>
            </div>
            <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-2">Pendências</h3>
            <div className="flex items-baseline gap-3">
              <span className="font-display-lg font-bold text-error">
                  {loading ? "..." : data?.summary?.pending_activities || 0}
              </span>
              <span className="font-body-sm text-error/80">Requer atenção</span>
            </div>
          </div>
        </div>
        
        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 flex flex-col gap-6">
               <div className="flex items-center justify-between">
                  <h2 className="font-headline-md text-secondary tracking-tight">O que acontece hoje</h2>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {!loading && data?.todayLessons?.length === 0 && (
                      <div className="col-span-full flex flex-col items-center justify-center p-12 bg-surface rounded-3xl border border-dashed border-outline-variant">
                         <span className="material-symbols-outlined text-outline-variant text-[48px] mb-4">event_busy</span>
                         <p className="text-on-surface-variant text-center font-body-lg">Nenhuma aula agendada para hoje.</p>
                      </div>
                   )}
                   {data?.todayLessons?.map((lesson: any) => (
                       <div key={lesson.id} className="bg-surface rounded-3xl p-6 bento-shadow bento-hover border border-outline-variant/30 flex flex-col relative overflow-hidden group cursor-pointer">
                           <div className={`absolute top-0 left-0 w-full h-1 pl-4 flex`}>
                               <div className={`h-full w-1/3 rounded-b-md ${lesson.status === 'in_progress' ? 'bg-primary' : 'bg-outline-variant'}`}></div>
                           </div>
                           
                           <div className="flex justify-between items-start mb-6 pt-2">
                               <div>
                                    <Badge className="mb-3 uppercase tracking-wider bg-secondary/5 text-secondary border-0 px-3 py-1 text-xs px-2.5">
                                      {lesson.class?.level || lesson.level || 'N/A'}
                                    </Badge>
                                    <h3 className="font-headline-sm text-on-surface group-hover:text-primary transition-colors">{lesson.title}</h3>
                               </div>
                           </div>
                           
                           <div className="space-y-4 flex-1">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[20px] text-on-surface-variant">schedule</span>
                                    </div>
                                    <div>
                                      <p className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">Horário</p>
                                      <span className="font-label-md text-on-surface">{lesson.start_time} - {lesson.end_time}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[20px] text-on-surface-variant">person</span>
                                    </div>
                                    <div>
                                      <p className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">Professor</p>
                                      <span className="font-label-md text-on-surface truncate">{lesson.teacher?.full_name}</span>
                                    </div>
                                </div>
                           </div>
                           
                           <div className="mt-6 pt-5 border-t border-outline-variant/20 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-on-surface-variant">
                                    <span className="material-symbols-outlined text-[16px]">{lesson.lesson_type === 'online' ? 'videocam' : 'meeting_room'}</span>
                                    <span className="font-label-sm">{lesson.room}</span>
                                </div>
                               {lesson.status === 'in_progress' ? 
                                 <span className="flex items-center gap-1.5 text-primary font-label-sm uppercase tracking-wider text-[11px]"><span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Ao vivo</span>
                               : <span className="text-on-surface-variant font-label-sm uppercase tracking-wider text-[11px]">Agendada</span>}
                           </div>
                       </div>
                   ))}
               </div>

               {isAdmin && (
                  <div className="mt-2 bg-gradient-to-br from-secondary to-secondary-container/20 rounded-3xl p-8 bento-shadow flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden text-white border border-outline-variant/20">
                      <div className="relative z-10">
                        <h3 className="font-headline-md mb-2 tracking-tight text-white">Relatórios Gerenciais</h3>
                        <p className="font-body-md text-white/80 max-w-md">Fechamento do mês, fluxo de caixa e novas matrículas disponíveis.</p>
                      </div>
                      <div className="flex gap-3 relative z-10 w-full md:w-auto">
                         <Button className="flex-1 md:flex-none bg-white text-secondary hover:bg-white/90 rounded-xl px-6">Financeiro</Button>
                         <Button variant="outline" className="flex-1 md:flex-none text-white border-white/30 hover:bg-white/10 rounded-xl px-6">Matrículas</Button>
                      </div>
                  </div>
               )}
            </div>
            
            <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="font-headline-md text-secondary tracking-tight">Linha do Tempo</h2>
                </div>
                
                <div className="bg-surface rounded-3xl p-8 bento-shadow border border-outline-variant/30 flex-1 relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>
                    <div className="relative border-l border-outline-variant/60 ml-2 space-y-8 pb-4">
                        {data?.recentActivity?.map((act: any) => (
                           <div key={act.id} className="relative pl-6 group">
                              <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-surface border-2 ${act.status === 'success'? 'border-primary' : act.status === 'warning' ? 'border-error' : 'border-secondary/50'} flex items-center justify-center z-10 transition-transform group-hover:scale-125`}>
                                 {act.status === 'success' && <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>}
                              </div>
                              <div className="mb-1 flex items-center gap-2 text-on-surface-variant font-label-sm uppercase tracking-wider text-[10px]">
                                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                                  {act.time}
                              </div>
                              <h4 className={`font-label-md ${act.status === 'warning' ? 'text-error' : 'text-on-surface'} mb-1 leading-snug`}>{act.title}</h4>
                              <p className="font-body-sm text-on-surface-variant leading-relaxed">{act.description}</p>
                           </div>
                        ))}
                    </div>
                </div>

                {isAdmin && (
                   <div className="bg-error/5 rounded-3xl p-6 bento-shadow border border-error/20 flex flex-col gap-3 relative overflow-hidden">
                       <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center text-error mb-1">
                          <span className="material-symbols-outlined">campaign</span>
                       </div>
                       <h3 className="font-headline-sm text-error tracking-tight">Alertas da Escola</h3>
                       <p className="font-body-md text-on-surface-variant">2 boletos vencidos, 1 professor relatou ausência amanhã.</p>
                       <Button variant="outline" className="mt-2 border-error/30 text-error hover:bg-error/10 w-fit rounded-xl px-5">Ver detalhes</Button>
                   </div>
                )}
            </div>
        </div>

      </div>
    </Shell>
  );
}
