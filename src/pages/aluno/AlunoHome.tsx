import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Shell } from "@/components/layout/Shell";
import { useAuth } from "@/contexts/AuthContext";
import { getStudentDashboard } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";

export default function AlunoHome() {
  const { profile } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (profile) {
        const res = await getStudentDashboard(profile.id);
        if (res.data) setData(res.data);
      }
      setLoading(false);
    }
    load();
  }, [profile]);

  if (loading) {
    return (
      <Shell>
        <div className="flex justify-center p-8">
          <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
        </div>
      </Shell>
    );
  }

  const mockFirstName = profile?.full_name?.split(' ')[0] || "Aluno";
  const firstName = data?.student?.full_name?.split(' ')[0] || mockFirstName;
  const nextLesson = data?.nextLesson;
  const progress = data?.progress;
  const continueStudying = data?.continueStudying;
  const pendingActivities = data?.pendingActivitiesList || [];

  // Gamification metrics
  const xp = 2450;
  const levelNumber = 12;
  const xpToNextLevel = 3000;
  const streakDays = 7;
  const currentRank = "Prata III";
  const badges = [
    { title: "First Step", icon: "emoji_events", color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/30" },
    { title: "Perfect Week", icon: "local_fire_department", color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30" },
    { title: "Grammar Master", icon: "menu_book", color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <Shell>
      <div className="flex flex-col gap-8 pb-10">
        {/* Gamified Welcome Header */}
        <header className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-secondary to-[#1e293b] border border-outline-variant/20 p-8 md:p-10 flex flex-col md:flex-row md:justify-between items-center md:items-end gap-6 shadow-xl w-full">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          
          <div className="relative z-10 w-full md:w-auto text-center md:text-left">
            <h1 className="font-display-lg text-white mb-2 tracking-tight">
              Olá, <span className="text-primary-container">{firstName}</span>!
            </h1>
            <p className="font-body-lg text-white/80">
              Você está a {xpToNextLevel - xp} XP do próximo nível.
            </p>
          </div>
          
          <div className="relative z-10 flex gap-4 md:gap-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 w-full md:w-auto overflow-x-auto hide-scrollbar">
            {/* Streak */}
            <div className="flex flex-col items-center justify-center min-w-[80px]">
              <div className="text-orange-400 mb-1 flex items-center justify-center animate-pulse">
                 <span className="material-symbols-outlined text-[32px] fill">local_fire_department</span>
              </div>
              <span className="font-headline-sm text-white">{streakDays}</span>
              <span className="font-label-sm text-white/60 uppercase tracking-widest text-[10px]">Dias</span>
            </div>
            
            <div className="w-px bg-white/20 h-12 self-center"></div>

            {/* Level */}
            <div className="flex flex-col items-center justify-center min-w-[80px]">
              <div className="w-8 h-8 rounded-full bg-secondary/50 border border-secondary text-white flex items-center justify-center font-bold font-mono mb-1">
                 {levelNumber}
              </div>
              <span className="font-headline-sm text-white">Nível</span>
              <span className="font-label-sm text-white/60 uppercase tracking-widest text-[10px]">{currentRank}</span>
            </div>

            <div className="w-px bg-white/20 h-12 self-center"></div>

            {/* XP progress */}
            <div className="flex flex-col items-center justify-center min-w-[100px]">
              <div className="flex items-center gap-1 mb-1 relative w-full h-8 flex items-center justify-center">
                 <span className="material-symbols-outlined text-primary text-[24px]">stars</span>
                 <span className="font-headline-sm text-white font-mono">{xp}</span>
              </div>
              <div className="w-24 h-1.5 bg-white/20 rounded-full mt-1 overflow-hidden">
                 <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${(xp/xpToNextLevel)*100}%` }}></div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 flex flex-col gap-6">
                {/* Next Class Card inside Content */}
                {nextLesson && (
                    <div className="bg-surface rounded-3xl p-6 md:p-8 bento-shadow border border-outline-variant/50 flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-2 h-full bg-primary rounded-l-3xl"></div>
                        
                        <div className="flex-1 ml-2">
                            <p className="font-label-sm text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                               <span className="material-symbols-outlined text-[16px] animate-bounce">alarm_on</span>
                               Sua próxima aula
                            </p>
                            <h2 className="font-display-sm text-on-surface mb-2 tracking-tight group-hover:text-primary transition-colors">{nextLesson.title}</h2>
                            <p className="font-body-md text-on-surface-variant flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">language</span>
                                {nextLesson.class_data?.language || 'Inglês'} {nextLesson.class_data?.level || 'Intermediário'}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 bg-surface-container-low border border-outline-variant/50 p-5 rounded-2xl w-full md:w-auto shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center">
                                   <span className="material-symbols-outlined fill text-[24px]">calendar_today</span>
                                </div>
                                <div>
                                    <p className="font-headline-sm text-on-surface">
                                        {new Date(nextLesson.scheduled_date || new Date()).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).replace('.', '')}
                                    </p>
                                    <p className="font-label-md text-on-surface-variant">{nextLesson.start_time?.substring(0,5) || '14:00'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 border-t border-outline-variant/30 pt-3">
                                 <span className="material-symbols-outlined text-on-surface-variant">meeting_room</span>
                                 <p className="font-label-md text-on-surface-variant">Sala: <span className="text-on-surface font-semibold">{nextLesson.room || 'Virtual'}</span></p>
                            </div>
                            <Button className="w-full mt-2 rounded-xl">Entrar na aula</Button>
                        </div>
                    </div>
                )}

                {/* Badges & Achievements */}
                <div className="bg-surface rounded-3xl p-8 bento-shadow border border-outline-variant/30 relative">
                   <div className="flex justify-between items-center mb-6">
                       <h3 className="font-headline-md text-secondary tracking-tight">Suas Conquistas</h3>
                       <span className="font-label-sm text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full">{badges.length} desbloqueadas</span>
                   </div>
                   <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                       {badges.map((badge, idx) => (
                           <div key={idx} className="flex flex-col items-center justify-center min-w-[100px] gap-2 p-4 rounded-2xl border border-outline-variant/20 hover:border-outline-variant/50 hover:bg-surface-container-low transition-all">
                               <div className={`w-14 h-14 rounded-full ${badge.bg} ${badge.color} flex items-center justify-center shadow-inner`}>
                                   <span className="material-symbols-outlined text-[28px] fill">{badge.icon}</span>
                               </div>
                               <span className="font-label-sm text-on-surface text-center leading-tight">{badge.title}</span>
                           </div>
                       ))}
                       <div className="flex flex-col items-center justify-center min-w-[100px] gap-2 p-4 rounded-2xl border border-dashed border-outline-variant/40 text-on-surface-variant/50">
                           <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center opacity-50">
                               <span className="material-symbols-outlined text-[28px]">lock</span>
                           </div>
                           <span className="font-label-sm text-center">Mestre das<br/>Palavras</span>
                       </div>
                   </div>
                </div>

                {/* Pending Activities List */}
                <div className="bg-surface rounded-3xl p-8 bento-shadow border border-outline-variant/30 relative overflow-hidden">
                     <div className="absolute -top-10 -right-10 w-40 h-40 bg-error/5 rounded-full pointer-events-none"></div>
                     <div className="flex justify-between items-center mb-6 relative z-10">
                         <h3 className="font-headline-md text-secondary tracking-tight flex items-center gap-2">
                             Missões Pendentes
                             <span className="flex h-5 w-5 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white shadow-sm">{pendingActivities.length || 1}</span>
                         </h3>
                         <Link to="/aluno/atividades" className="text-primary hover:underline font-label-md">Ver todas</Link>
                     </div>
                     
                     <div className="space-y-4 relative z-10">
                         {pendingActivities.length > 0 ? pendingActivities.map((act: any) => (
                              <div key={act.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border border-outline-variant/40 rounded-2xl hover:border-primary/40 hover:bg-surface-container-lowest transition-all gap-4 group">
                                  <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                          <span className="material-symbols-outlined">
                                              {act.type === 'writing' ? 'edit_document' : act.type === 'listening' ? 'headphones' : 'assignment'}
                                          </span>
                                      </div>
                                      <div>
                                          <p className="font-headline-sm text-on-surface capitalize">{act.title}</p>
                                          <p className="font-label-sm text-error mt-0.5 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">timer</span> Entregar até: {new Date(act.due_date).toLocaleDateString('pt-BR')}</p>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
                                      <span className="font-label-sm text-amber-500 font-bold flex items-center gap-0.5 whitespace-nowrap">+50 XP</span>
                                      <Button variant="outline" className="w-full sm:w-auto rounded-xl">Fazer</Button>
                                  </div>
                              </div>
                         )) : (
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border border-outline-variant/40 rounded-2xl hover:border-primary/40 hover:bg-surface-container-lowest transition-all gap-4 group">
                                  <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                          <span className="material-symbols-outlined">edit_document</span>
                                      </div>
                                      <div>
                                          <p className="font-headline-sm text-on-surface capitalize">Review Unit 3 (Mock)</p>
                                          <p className="font-label-sm text-error mt-0.5 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">timer</span> Entregar amanhã</p>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
                                      <span className="font-label-sm text-amber-500 font-bold flex items-center gap-0.5 whitespace-nowrap">+100 XP</span>
                                      <Button variant="outline" className="w-full sm:w-auto rounded-xl border-primary/20 hover:bg-primary/5">Fazer</Button>
                                  </div>
                              </div>
                         )}
                     </div>
                </div>
            </div>
            
            <div className="lg:col-span-1 flex flex-col gap-6">
                {/* Progress Summary Sidebar */}
                <div className="bg-surface rounded-3xl p-8 bento-shadow border border-outline-variant/30 flex flex-col relative overflow-hidden">
                     <div className="flex justify-between items-center mb-8 relative z-10">
                         <h3 className="font-headline-md text-secondary tracking-tight">Ocupação</h3>
                     </div>
                     
                     <div className="flex flex-col items-center gap-6 mb-8 relative z-10">
                          <div className="relative w-32 h-32 flex shrink-0 items-center justify-center rounded-full bg-secondary-container shadow-inner">
                              <svg className="absolute w-full h-full -rotate-90 drop-shadow-md">
                                 <circle cx="64" cy="64" r="56" className="fill-none stroke-outline-variant/20" strokeWidth="8" />
                                 <circle cx="64" cy="64" r="56" className="fill-none stroke-primary transition-all duration-1000 ease-in-out drop-shadow-sm" strokeWidth="8" strokeDasharray="351.85" strokeDashoffset={351.85 - (351.85 * (progress?.course_progress || 65) / 100)} strokeLinecap="round" />
                              </svg>
                              <div className="flex flex-col items-center">
                                  <span className="font-display-lg text-secondary tracking-tighter">{progress?.course_progress || 65}%</span>
                                  <span className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[9px]">Concluído</span>
                              </div>
                          </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-3 relative z-10">
                          <div className="bg-surface-container-low border border-outline-variant/30 p-4 rounded-2xl flex flex-col items-center text-center">
                              <span className="material-symbols-outlined text-secondary mb-1">done_all</span>
                              <p className="font-display-sm text-secondary tracking-tighter">{progress?.completed_activities || 18}</p>
                              <p className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[9px]">Ativ. concluídas</p>
                          </div>
                          <div className="bg-error/5 border border-error/10 p-4 rounded-2xl flex flex-col items-center text-center">
                              <span className="material-symbols-outlined text-error mb-1">hourglass_bottom</span>
                              <p className="font-display-sm text-error tracking-tighter">{progress?.pending_activities || 2}</p>
                              <p className="font-label-sm text-error uppercase tracking-wider text-[9px]">Ativ. pendentes</p>
                          </div>
                     </div>
                     
                     <div className="mt-8 pt-6 border-t border-outline-variant/30 w-full relative z-10">
                        <div className="flex justify-between items-center mb-2">
                           <span className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">Frequência atual</span>
                           <span className="font-label-md text-secondary font-bold">{progress?.attendance || 92}%</span>
                        </div>
                        <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                           <div className="h-full bg-secondary rounded-full" style={{ width: `${progress?.attendance || 92}%` }}></div>
                        </div>
                     </div>
                </div>

                {/* Continue Studying Mini */}
                <div className="bg-primary/5 rounded-3xl p-6 border border-primary/20 relative overflow-hidden group hover:bg-primary/10 transition-colors cursor-pointer">
                    <div className="absolute -right-4 -bottom-4 text-primary/10 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[100px]">local_library</span>
                    </div>
                    <h3 className="font-headline-sm text-primary mb-2 relative z-10">Continue os Estudos</h3>
                    <p className="font-body-md text-on-surface-variant mb-6 relative z-10 max-w-[80%]">{continueStudying?.material_title || "Unit 3: Present Perfect vs Simple Past"}</p>
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-md relative z-10 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined">play_arrow</span>
                    </div>
                </div>
                
                 {/* Support Button */}
                <div className="flex justify-center mt-2">
                     <a href="mailto:contato@easyidiomas.com" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md px-6 py-3 rounded-full border border-outline-variant/50 hover:bg-surface-container-low w-full justify-center">
                         <span className="material-symbols-outlined">support_agent</span>
                         Falar com a Coordenadoria
                     </a>
                </div>
            </div>
        </div>
      </div>
    </Shell>
  );
}
