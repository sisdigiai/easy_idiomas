import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { getSystemMaterials } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";

export default function Materiais() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await getSystemMaterials();
      if (data) setMaterials(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <Shell>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center bg-surface border border-outline-variant/30 rounded-3xl p-6 md:p-8 bento-shadow">
            <div>
                 <h1 className="font-headline-lg text-secondary mb-2">Materiais</h1>
                 <p className="font-body-lg text-on-surface-variant">Visão geral do acervo de materiais da escola.</p>
            </div>
            <Button className="rounded-xl flex items-center gap-2">
                 <span className="material-symbols-outlined">upload_file</span>
                 Adicionar Material
            </Button>
        </div>

        {loading ? (
             <div className="p-12 text-center"><span className="material-symbols-outlined animate-spin text-primary">progress_activity</span></div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {materials.length === 0 && <p className="col-span-full">Nenhum material cadastrado.</p>}
                {materials.map((m, i) => (
                    <div key={m.id || i} className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 hover:shadow-md transition-shadow flex flex-col group">
                        <div className="w-full h-32 bg-surface-container flex items-center justify-center rounded-xl mb-4 text-tertiary">
                            <span className="material-symbols-outlined text-[48px] opacity-70 group-hover:scale-110 transition-transform">
                                {m.material_type === 'pdf' ? 'picture_as_pdf' : m.material_type === 'audio' ? 'audio_file' : 'description'}
                            </span>
                        </div>
                        <h3 className="font-headline-sm text-on-surface mb-1 line-clamp-2">{m.title}</h3>
                        <p className="font-label-sm text-primary uppercase tracking-widest">{m.class?.name || 'Geral'}</p>
                        <p className="font-body-sm text-on-surface-variant flex-1 mt-2 line-clamp-2">{m.description}</p>
                    </div>
                ))}
            </div>
        )}
      </div>
    </Shell>
  );
}
