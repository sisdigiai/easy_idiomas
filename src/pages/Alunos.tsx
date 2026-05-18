import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getStudentsProgress } from "@/lib/supabase/queries";

export default function Alunos() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
       const res = await getStudentsProgress();
       if (res.data) setStudents(res.data);
       setLoading(false);
    }
    load();
  }, []);

  return (
    <Shell>
      <div className="p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-background mb-2">Alunos</h1>
            <p className="font-body-md text-on-surface-variant">Gerencie alunos e acompanhe o progresso.</p>
          </div>
          <Button className="hidden md:flex gap-2">
            <span className="material-symbols-outlined">add</span>
            Adicionar Aluno
          </Button>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-4 border border-outline-variant/30">
           <Input className="flex-1" placeholder="Buscar alunos..." icon="search" />
           <Button variant="outline" className="gap-2 shrink-0">
             <span className="material-symbols-outlined">tune</span>
             Filtros
           </Button>
        </div>

        {loading ? (
             <div className="flex justify-center p-8"><span className="material-symbols-outlined animate-spin text-primary">progress_activity</span></div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {students.length === 0 && <p className="col-span-full text-center text-secondary">Nenhum aluno encontrado.</p>}
            {students.map((student) => (
                <div key={student.student_id} className={`bg-surface-container-lowest rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-outline-variant/30 overflow-hidden transition-all ${student.status === 'inactive' ? 'opacity-75' : 'hover:shadow-lg'}`}>
                    <div className="p-4 flex gap-4 border-b border-surface-container-high">
                        <div className="w-12 h-12 rounded-full bg-tertiary-fixed/30 overflow-hidden shrink-0">
                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.full_name)}&background=random`} alt={student.full_name} className={student.status === 'inactive' ? 'grayscale' : ''} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-0.5">
                                <h3 className={`font-headline-sm text-[16px] leading-[24px] font-bold truncate ${student.status === 'inactive' ? 'text-on-surface-variant' : 'text-on-secondary-fixed-variant'}`}>{student.full_name}</h3>
                                {student.status === 'active' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#15803D]/10 text-[#15803D] font-label-sm text-[10px] border border-[#15803D]/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#15803D]"></div>
                                        Ativo
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-variant text-on-surface-variant font-label-sm text-[10px] border border-outline-variant">
                                        <div className="w-1.5 h-1.5 rounded-full bg-outline"></div>
                                        Inativo
                                    </span>
                                )}
                            </div>
                            <p className="font-label-sm text-[11px] text-secondary truncate">{student.student_code}</p>
                        </div>
                    </div>
                    <div className="p-4 flex flex-col gap-3">
                        <div className="flex gap-2 flex-wrap">
                            <div className={`px-2 py-0.5 rounded text-[11px] font-bold ${student.status === 'inactive' ? 'bg-surface-variant text-on-surface-variant' : 'bg-secondary-container text-on-secondary-container'}`}>
                                {student.main_language} · {student.current_level}
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-secondary">
                            <div><span className="font-bold">Frequência:</span> {Math.round(student.avg_attendance || 0)}%</div>
                            <div><span className="font-bold">Progresso:</span> {Math.round(student.progress_percentage || 0)}%</div>
                        </div>
                        <div className="w-full bg-surface-variant rounded-full h-1.5 mt-1">
                            <div className={`h-1.5 rounded-full ${student.status === 'inactive' ? 'bg-tertiary' : 'bg-[#15803D]'}`} style={{ width: `${student.progress_percentage || 0}%` }}></div>
                        </div>
                         <div className="text-[11px] mt-1">
                            {student.pending_activities > 0 ? (
                                <p className="text-error font-bold">{student.pending_activities} atividade(s) pendente(s)</p>
                            ) : (
                                <p className="text-[#15803D]">Sem pendências</p>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            </div>
        )}
      </div>
    </Shell>
  );
}
