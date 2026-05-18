import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Shell } from "@/components/layout/Shell";
import { Badge } from "@/components/ui/badge";
import { getLessonsList } from "@/lib/supabase/queries";

export default function Aulas() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     async function load() {
         const res = await getLessonsList();
         if (res.data) setLessons(res.data);
         setLoading(false);
     }
     load();
  }, [])

  return (
    <Shell>
      <div className="p-4 md:p-8">
        <div className="flex justify-between items-center mb-2">
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-secondary">Aulas</h1>
            <Link to="/aulas/nova" className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
                <span className="material-symbols-outlined text-[20px]">add</span>
                Nova aula
            </Link>
        </div>
        <p className="font-body-md text-on-surface-variant mb-8">
          Gerencie a programação e o status das aulas.
        </p>

        {loading ? (
           <div className="flex justify-center p-8"><span className="material-symbols-outlined animate-spin text-primary">progress_activity</span></div>
        ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {lessons.length === 0 && <p className="col-span-full text-secondary">Nenhuma aula encontrada.</p>}
                {lessons.map((lesson) => (
                    <div key={lesson.id} className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/30 flex flex-col relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-full h-1.5 ${lesson.status === 'in_progress' ? 'bg-primary' : 'bg-secondary'}`}></div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <Badge className="mb-2 uppercase tracking-wide bg-secondary-container/50 text-secondary">
                                    {lesson.class?.level || 'N/A'}
                                </Badge>
                                <h3 className="font-headline-sm text-secondary">{lesson.title}</h3>
                            </div>
                            <Badge variant={lesson.status === 'in_progress' ? 'success' : 'warning'} className="gap-1.5 border border-[#c8e6c9]">
                                {lesson.status === 'in_progress' && <span className="w-2 h-2 rounded-full bg-[#4caf50] animate-pulse"></span>}
                                {lesson.status === 'in_progress' ? 'Em andamento' : 'Próxima'}
                            </Badge>
                        </div>
                        
                        <div className="space-y-3 mb-6 flex-1">
                            <div className="flex items-center gap-3 text-on-surface-variant">
                                <div className="w-8 h-8 rounded-full bg-secondary-container/30 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[18px] text-secondary">schedule</span>
                                </div>
                                <span className="font-body-md">{new Date(lesson.scheduled_date).toLocaleDateString()} {lesson.start_time?.substring(0,5)}</span>
                            </div>
                            <div className="flex items-center gap-3 text-on-surface-variant">
                                <div className="w-8 h-8 rounded-full bg-secondary-container/30 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[18px] text-secondary">person</span>
                                </div>
                                <span className="font-body-md">{lesson.teacher?.full_name}</span>
                            </div>
                             <div className="flex items-center gap-3 text-on-surface-variant">
                                <div className="w-8 h-8 rounded-full bg-secondary-container/30 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[18px] text-secondary">meeting_room</span>
                                </div>
                                <span className="font-body-md">{lesson.room}</span>
                            </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <Link to={`/aulas/${lesson.id}`} className="w-full text-center bg-primary text-on-primary py-2 rounded font-label-md hover:bg-primary/90 transition-colors">
                                Abrir Aula
                            </Link>
                        </div>
                    </div>
                ))}
             </div>
        )}
      </div>
    </Shell>
  );
}
