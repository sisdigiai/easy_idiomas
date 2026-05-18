import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { getSystemTeachers } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";

export default function Professores() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await getSystemTeachers();
      if (data) setTeachers(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <Shell>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center bg-surface-container border border-outline-variant/30 rounded-3xl p-6 md:p-8">
            <div>
                 <h1 className="font-headline-lg text-secondary mb-2">Professores</h1>
                 <p className="font-body-lg text-on-surface-variant">Gerencie o corpo docente da instituição.</p>
            </div>
            <Button className="rounded-xl hidden md:flex items-center gap-2">
                 <span className="material-symbols-outlined">person_add</span>
                 Novo Professor
            </Button>
        </div>

        {loading ? (
             <div className="p-12 text-center"><span className="material-symbols-outlined animate-spin text-primary">progress_activity</span></div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teachers.length === 0 && <p className="col-span-full">Nenhum professor encontrado no sistema.</p>}
                {teachers.map((prof, i) => (
                    <div key={prof.id || i} className="bg-surface rounded-2xl p-6 border border-outline-variant/30 hover:border-primary/40 transition-colors shadow-sm flex flex-col items-center text-center group">
                        <div className="w-20 h-20 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-headline-lg mb-4 overflow-hidden shadow-md">
                           {prof.avatar_url ? (
                               <img src={prof.avatar_url} alt="" className="w-full h-full object-cover" />
                           ) : (
                               prof.full_name?.substring(0, 1) || 'P'
                           )}
                        </div>
                        <h2 className="font-headline-sm text-on-surface mb-1">{prof.full_name}</h2>
                        <p className="font-label-sm text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full mb-4">
                            {prof.status === 'active' ? 'Ativo' : 'Inativo'}
                        </p>
                        
                        <div className="flex gap-2 w-full mt-auto pt-4 border-t border-outline-variant/20">
                            <Button variant="outline" className="flex-1 rounded-xl">Ver Perfil</Button>
                            <Button variant="ghost" className="rounded-xl text-primary"><span className="material-symbols-outlined">edit</span></Button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </Shell>
  );
}
