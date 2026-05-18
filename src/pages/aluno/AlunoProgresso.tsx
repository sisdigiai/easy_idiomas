import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { useAuth } from "@/contexts/AuthContext";
import { getStudentProgressDetails } from "@/lib/supabase/queries";

export default function AlunoProgresso() {
  const { profile } = useAuth();
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const studentId = profile?.id;
      const { data } = await getStudentProgressDetails(studentId);
      setProgress(data);
      setLoading(false);
    }
    load();
  }, [profile]);

  if (loading) {
    return <Shell><div className="p-8"><p>Carregando progresso...</p></div></Shell>;
  }

  return (
    <Shell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="font-headline-lg text-secondary mb-2">Meu Progresso</h1>
          <p className="font-body-lg text-on-surface-variant">Acompanhe sua evoluÃ§Ã£o e veja no que vocÃª pode melhorar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface rounded-3xl p-6 bento-shadow border border-outline-variant/30 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p className="font-label-sm text-on-surface-variant uppercase tracking-widest mb-4">NÃ­vel Atual</p>
            <div className="w-24 h-24 rounded-full border-4 border-secondary/20 flex items-center justify-center relative shadow-inner">
               <div className="absolute inset-0 border-4 border-secondary rounded-full border-t-transparent -rotate-45"></div>
               <span className="font-display-md text-secondary">{progress?.current_level || 'B1'}</span>
            </div>
          </div>
          
          <div className="bg-surface rounded-3xl p-6 bg-gradient-to-br from-primary to-primary-container text-white bento-shadow flex flex-col justify-between">
            <div>
               <p className="font-label-sm text-white/80 uppercase tracking-widest mb-1">XP e Progresso</p>
               <h2 className="font-display-md mb-2">{progress?.progress_percentage || 0}%</h2>
            </div>
            <div>
               <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden mb-2">
                 <div className="h-full bg-white rounded-full" style={{ width: `${progress?.progress_percentage || 0}%` }}></div>
               </div>
               <p className="font-label-sm min-w-max text-right">Rumo ao prÃ³ximo nÃ­vel</p>
            </div>
          </div>

          <div className="bg-surface rounded-3xl p-6 bento-shadow border border-outline-variant/30 flex flex-col">
            <p className="font-label-sm text-on-surface-variant uppercase tracking-widest mb-4">MÃ©tricas</p>
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2">
                   <span className="material-symbols-outlined text-secondary text-[20px]">done_all</span>
                   <span className="font-label-md text-on-surface">MissÃµes ConcluÃ­das</span>
                 </div>
                 <span className="font-headline-sm text-secondary">{progress?.completed_activities || 0}</span>
              </div>
              <div className="w-full h-px bg-outline-variant/30"></div>
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2">
                   <span className="material-symbols-outlined text-tertiary text-[20px]">calendar_month</span>
                   <span className="font-label-md text-on-surface">FrequÃªncia em Aula</span>
                 </div>
                 <span className="font-headline-sm text-tertiary">{progress?.attendance || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface rounded-3xl p-8 bento-shadow border border-outline-variant/30">
             <h2 className="font-headline-md text-secondary mb-6 tracking-tight">Habilidades EspecÃ­ficas</h2>
             <div className="space-y-6">
               {(progress?.skills || []).map((skill: any, i: number) => (
                 <div key={i}>
                   <div className="flex justify-between items-center mb-2">
                     <span className="font-label-md text-on-surface">{skill.name}</span>
                     <span className="font-label-sm text-on-surface-variant">{skill.value}%</span>
                   </div>
                   <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                     <div 
                       className={`h-full rounded-full ${skill.value >= 80 ? 'bg-secondary' : skill.value >= 60 ? 'bg-primary' : 'bg-error'}`} 
                       style={{ width: `${skill.value}%` }}
                     ></div>
                   </div>
                 </div>
               ))}
             </div>
          </div>

          <div className="bg-surface rounded-3xl p-8 bento-shadow border border-outline-variant/30">
             <h2 className="font-headline-md text-secondary mb-6 tracking-tight">Ãšltimas AvaliaÃ§Ãµes</h2>
             {(progress?.recent_evaluations || []).length > 0 ? (
               <div className="space-y-4">
                 {(progress?.recent_evaluations || []).map((evalItem: any, i: number) => (
                   <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30">
                      <div>
                        <p className="font-headline-sm text-on-surface">{evalItem.title}</p>
                        <p className="font-label-sm text-on-surface-variant flex items-center gap-1 mt-1">
                          <span className="material-symbols-outlined text-[14px]">event</span> {new Date(evalItem.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className="font-display-sm text-secondary">{evalItem.note}</span>
                         <span className="font-label-sm text-on-surface-variant uppercase text-[10px]">Nota</span>
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
               <p className="text-on-surface-variant">VocÃª ainda nÃ£o tem avaliaÃ§Ãµes registradas.</p>
             )}
          </div>
        </div>
      </div>
    </Shell>
  );
}

