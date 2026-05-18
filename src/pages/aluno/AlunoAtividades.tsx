import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { useAuth } from "@/contexts/AuthContext";
import { getStudentActivitiesRaw } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";

export default function AlunoAtividades() {
  const { profile } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const studentId = profile?.id;
      const { data } = await getStudentActivitiesRaw(studentId);
      if (data) setActivities(data);
      setLoading(false);
    }
    load();
  }, [profile]);

  if (loading) {
    return <Shell><div className="p-8"><p>Carregando atividades...</p></div></Shell>;
  }

  const pendingActivities = activities.filter(a => a.status === "pending");
  const completedActivities = activities.filter(a => a.status !== "pending");

  return (
    <Shell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="font-headline-lg text-secondary mb-2">Minhas Atividades</h1>
          <p className="font-body-lg text-on-surface-variant">Veja suas missÃµes pendentes e seu histÃ³rico de prÃ¡ticas.</p>
        </div>

        <div className="bg-surface rounded-3xl p-6 md:p-8 bento-shadow border border-outline-variant/30">
          <div className="flex justify-between items-center mb-6">
             <h2 className="font-headline-md text-secondary flex items-center gap-2">
                <span className="material-symbols-outlined text-error">assignment_late</span>
                Pendentes
             </h2>
             <span className="font-label-sm text-error bg-error/10 px-3 py-1 rounded-full">{pendingActivities.length} ativas</span>
          </div>
          
          {pendingActivities.length > 0 ? (
            <div className="space-y-4">
              {pendingActivities.map((act, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-5 border border-outline-variant/40 rounded-2xl hover:border-primary/40 hover:bg-surface-container-lowest transition-all gap-4 shadow-sm group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-error/10 text-error flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">
                        {act.activity?.type === 'writing' ? 'edit_document' : act.activity?.type === 'listening' ? 'headphones' : 'menu_book'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-on-surface">{act.activity?.title}</h3>
                      <p className="font-body-sm text-on-surface-variant mt-1">{act.activity?.description}</p>
                      <p className="font-label-sm text-error mt-2 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">timer</span> 
                          Vence em: {new Date(act.activity?.due_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <Button className="w-full md:w-auto rounded-xl shadow-sm">Iniciar MissÃ£o</Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-low border border-outline-variant/30 p-8 rounded-2xl text-center">
                <span className="material-symbols-outlined text-[48px] text-tertiary mb-3 opacity-50">task_alt</span>
                <p className="font-headline-sm text-on-surface mb-1">Tudo em dia!</p>
                <p className="text-on-surface-variant">VocÃª nÃ£o tem atividades pendentes no momento.</p>
            </div>
          )}
        </div>

        <div className="bg-surface rounded-3xl p-6 md:p-8 bento-shadow border border-outline-variant/30">
          <h2 className="font-headline-md text-secondary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">task_alt</span>
            ConcluÃ­das
          </h2>
          
          {completedActivities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedActivities.map((act, i) => (
                <div key={i} className="flex flex-col p-5 border border-outline-variant/30 rounded-2xl bg-surface-container-lowest opacity-70 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    <h3 className="font-headline-sm text-on-surface">{act.activity?.title || "Atividade"}</h3>
                  </div>
                  <p className="font-label-sm text-on-surface-variant">Finalizada com sucesso.</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-on-surface-variant">VocÃª ainda nÃ£o possui histÃ³rico de atividades concluÃ­das.</p>
          )}
        </div>
      </div>
    </Shell>
  );
}

