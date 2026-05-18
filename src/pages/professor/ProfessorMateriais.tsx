import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { useAuth } from "@/contexts/AuthContext";
import { getTeacherMaterials } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import { isSafeExternalUrl } from "@/lib/url";

export default function ProfessorMateriais() {
  const { profile } = useAuth();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const teacherId = profile?.id;
      const { data } = await getTeacherMaterials(teacherId);
      if (data) setMaterials(data);
      setLoading(false);
    }
    load();
  }, [profile]);

  if (loading) {
    return <Shell><div className="p-8"><p>Carregando materiais...</p></div></Shell>;
  }

  return (
    <Shell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-secondary mb-2">Materiais</h1>
            <p className="font-body-lg text-on-surface-variant">Gerencie o acervo de PDFs e Ã¡udios que vocÃª disponibiliza.</p>
          </div>
          <Button className="rounded-xl w-full md:w-auto shadow-sm">
             <span className="material-symbols-outlined mr-2">upload_file</span>
             Novo Material
          </Button>
        </div>

        <div className="bg-surface rounded-3xl p-6 md:p-8 bento-shadow border border-outline-variant/30">
          <div className="relative mb-6">
             <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
             <input type="text" placeholder="Buscar material..." className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl pl-10 pr-4 py-2 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>

          {materials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map((mat, i) => (
                <div key={i} className="flex flex-col border border-outline-variant/40 rounded-2xl bg-surface-container-lowest overflow-hidden group hover:border-primary/40 transition-colors">
                  <div className="h-24 bg-surface-container-low flex items-center justify-center border-b border-outline-variant/30 relative">
                    <div className="absolute top-2 right-2 bg-background/50 backdrop-blur text-secondary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-outline-variant/20">
                      {mat.material_type}
                    </div>
                    <span className="material-symbols-outlined text-[48px] text-tertiary opacity-70 group-hover:scale-110 transition-transform">
                      {mat.material_type === 'pdf' ? 'picture_as_pdf' : mat.material_type === 'audio' ? 'audio_file' : 'description'}
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-headline-sm text-on-surface line-clamp-1">{mat.title}</h3>
                    <p className="font-label-sm text-primary mb-2 mt-1">{mat.class?.name || "Todas as Turmas"}</p>
                    <p className="font-body-sm text-on-surface-variant line-clamp-2 mb-4 flex-1">{mat.description}</p>
                    <div className="flex gap-2 w-full">
                       {isSafeExternalUrl(mat.url) ? (
                         <a
                           href={mat.url}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex-1 inline-flex items-center justify-center rounded-xl border border-outline-variant px-4 py-2 hover:bg-primary/5 transition-colors"
                         >
                           Ver
                         </a>
                       ) : (
                         <Button variant="outline" className="flex-1 rounded-xl" disabled title="Link indisponível">
                           <span className="material-symbols-outlined mr-1">link_off</span> Indisponível
                         </Button>
                       )}
                       <Button variant="ghost" className="shrink-0 text-error hover:bg-error/10 hover:text-error rounded-xl">
                          <span className="material-symbols-outlined">delete</span>
                       </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-12">
               <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4 opacity-50">folder_off</span>
               <p className="text-on-surface-variant font-label-md">NÃ£o hÃ¡ materiais enviados ainda.</p>
             </div>
          )}
        </div>
      </div>
    </Shell>
  );
}

