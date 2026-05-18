import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { useAuth } from "@/contexts/AuthContext";
import { getTeacherActivities } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";

export default function ProfessorAtividades() {
  const { profile } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const teacherId = profile?.id;
      const { data } = await getTeacherActivities(teacherId);
      if (data) setActivities(data);
      setLoading(false);
    }
    load();
  }, [profile]);

  if (loading) {
    return <Shell><div className="p-8"><p>Carregando atividades...</p></div></Shell>;
  }

  return (
    <Shell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-secondary mb-2">Atividades</h1>
            <p className="font-body-lg text-on-surface-variant">Acompanhe as missÃµes enviadas e correÃ§Ãµes pendentes.</p>
          </div>
          <Button className="rounded-xl w-full md:w-auto shadow-sm">
             <span className="material-symbols-outlined mr-2">add</span>
             Nova Atividade
          </Button>
        </div>

        <div className="bg-surface rounded-3xl p-6 md:p-8 bento-shadow border border-outline-variant/30">
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((act, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-5 border border-outline-variant/40 rounded-2xl hover:border-primary/40 transition-all gap-4 shadow-sm bg-surface-container-lowest">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined">
                        {act.type === 'writing' ? 'edit_document' : act.type === 'listening' ? 'headphones' : 'menu_book'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                         <span className="font-label-sm text-primary uppercase tracking-widest">{act.class?.name || "Turma"}</span>
                         <span className="text-on-surface-variant text-[10px]">â€¢</span>
                         <span className="font-label-sm text-error bg-error/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">timer</span>
                            Entrega: {new Date(act.due_date).toLocaleDateString('pt-BR')}
                         </span>
                      </div>
                      <h3 className="font-headline-sm text-on-surface">{act.title}</h3>
                      <p className="font-body-sm text-on-surface-variant mt-1">{act.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end gap-3 shrink-0 border-t md:border-t-0 md:border-l border-outline-variant/30 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
                    <div className="flex items-center justify-between md:justify-end gap-2 w-full">
                       <span className="font-label-sm text-secondary uppercase text-[10px]">Pendentes</span>
                       <span className="font-headline-sm text-secondary bg-secondary/10 px-3 py-1 rounded-full">{act.pending_count || 0}</span>
                    </div>
                    <Button variant="outline" className="w-full rounded-xl">Corrigir</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-low border border-outline-variant/30 p-8 rounded-2xl text-center">
                <span className="material-symbols-outlined text-[48px] text-tertiary mb-3 opacity-50">task_alt</span>
                <p className="font-headline-sm text-on-surface mb-1">Tudo tranquilo!</p>
                <p className="text-on-surface-variant">VocÃª nÃ£o enviou atividades recentemente.</p>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}

