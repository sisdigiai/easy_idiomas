import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { getSystemActivities } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";

export default function Atividades() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await getSystemActivities();
      if (data) setActivities(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <Shell>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center bg-surface border border-outline-variant/30 rounded-3xl p-6 md:p-8 bento-shadow">
            <div>
                 <h1 className="font-headline-lg text-secondary mb-2">Atividades</h1>
                 <p className="font-body-lg text-on-surface-variant">Banco de atividades cadastradas no sistema.</p>
            </div>
            <Button className="rounded-xl flex items-center gap-2">
                 <span className="material-symbols-outlined">add_task</span>
                 Nova Atividade
            </Button>
        </div>

        {loading ? (
             <div className="p-12 text-center"><span className="material-symbols-outlined animate-spin text-primary">progress_activity</span></div>
        ) : (
            <div className="space-y-4">
                {activities.length === 0 && <p className="col-span-full">Nenhuma atividade cadastrada.</p>}
                {activities.map((a, i) => (
                    <div key={a.id || i} className="flex flex-col md:flex-row items-start md:items-center p-5 border border-outline-variant/30 rounded-2xl bg-surface hover:border-primary/40 transition-colors gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 text-secondary">
                             <span className="material-symbols-outlined">
                                 {a.type === 'writing' ? 'edit_document' : a.type === 'listening' ? 'headphones' : 'menu_book'}
                             </span>
                        </div>
                        <div className="flex-1">
                             <div className="flex gap-2 items-center mb-1">
                                 <span className="font-label-sm text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">
                                     {a.class?.name || 'Geral'}
                                 </span>
                             </div>
                             <h3 className="font-headline-sm text-on-surface">{a.title}</h3>
                             <p className="font-body-sm text-on-surface-variant max-w-3xl truncate mt-1">{a.description}</p>
                        </div>
                        <div className="flex gap-3 mt-4 md:mt-0 w-full md:w-auto">
                            <Button variant="outline" className="flex-1 md:flex-none rounded-xl">Visualizar</Button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </Shell>
  );
}
