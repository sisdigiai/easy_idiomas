import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { getSystemClasses } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";

export default function Turmas() {
  const [classesList, setClassesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await getSystemClasses();
      if (data) setClassesList(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <Shell>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center bg-surface border border-outline-variant/30 rounded-3xl p-6 md:p-8 bento-shadow">
            <div>
                 <h1 className="font-headline-lg text-secondary mb-2">Turmas</h1>
                 <p className="font-body-lg text-on-surface-variant">Gerencie as turmas ativas do sistema.</p>
            </div>
            <Button className="rounded-xl flex items-center gap-2">
                 <span className="material-symbols-outlined">add</span>
                 Nova Turma
            </Button>
        </div>

        {loading ? (
             <div className="p-12 text-center"><span className="material-symbols-outlined animate-spin text-primary">progress_activity</span></div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classesList.length === 0 && <p className="col-span-full">Nenhuma turma encontrada no sistema.</p>}
                {classesList.map((c, i) => (
                    <div key={c.id || i} className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 hover:border-primary/40 transition-colors shadow-sm flex flex-col relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                        
                        <div className="mb-4">
                            <span className="font-label-sm uppercase tracking-widest text-primary mb-1 block">
                                {c.language} • {c.level}
                            </span>
                            <h2 className="font-headline-sm text-on-surface">{c.name}</h2>
                        </div>
                        
                        <div className="space-y-3 mb-6 bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 text-on-surface flex-1">
                             <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-tertiary">person</span>
                                <span className="font-label-md">Prof. {c.teacher?.full_name || 'Alocar professor'}</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">meeting_room</span>
                                <span className="font-label-md">Turno: {c.shift || 'N/A'}</span>
                             </div>
                        </div>
                        
                        <div className="flex gap-2 w-full mt-auto">
                            <Button variant="outline" className="flex-1 rounded-xl">Detalhes</Button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </Shell>
  );
}
