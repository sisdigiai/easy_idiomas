import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { useAuth } from "@/contexts/AuthContext";
import { getTeacherStudents } from "@/lib/supabase/queries";

export default function ProfessorAlunos() {
  const { profile } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const teacherId = profile?.id;
      const { data } = await getTeacherStudents(teacherId);
      if (data) setStudents(data);
      setLoading(false);
    }
    load();
  }, [profile]);

  if (loading) {
    return <Shell><div className="p-8"><p>Carregando alunos...</p></div></Shell>;
  }

  return (
    <Shell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="font-headline-lg text-secondary mb-2">Meus Alunos</h1>
          <p className="font-body-lg text-on-surface-variant">Confira o rendimento e dados dos alunos de suas turmas.</p>
        </div>

        <div className="bg-surface rounded-3xl p-6 md:p-8 bento-shadow border border-outline-variant/30">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline-md text-secondary">RelaÃ§Ã£o de Alunos</h2>
            <div className="relative w-full md:w-64 max-w-xs ml-4">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input type="text" placeholder="Buscar aluno..." className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl pl-10 pr-4 py-2 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-outline-variant/50 text-on-surface-variant">
                  <th className="p-3 font-label-md">Nome</th>
                  <th className="p-3 font-label-md">Turma</th>
                  <th className="p-3 font-label-md text-center">NÃ­vel</th>
                  <th className="p-3 font-label-md text-center">Desempenho</th>
                  <th className="p-3 font-label-md text-right">AÃ§Ãµes</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, i) => (
                  <tr key={i} className="border-b border-outline-variant/20 hover:bg-surface-container-lowest transition-colors">
                    <td className="p-3">
                       <p className="font-headline-sm text-on-surface">{student.full_name}</p>
                       <p className="font-label-sm text-on-surface-variant">{student.main_language}</p>
                    </td>
                    <td className="p-3 text-on-surface">{student.class_name || "-"}</td>
                    <td className="p-3 text-center">
                       <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full font-label-md">
                          {student.current_level || "-"}
                       </span>
                    </td>
                    <td className="p-3">
                       <div className="flex items-center justify-center gap-2">
                          <div className="w-24 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                             <div className="h-full bg-tertiary rounded-full" style={{ width: '75%' }}></div>
                          </div>
                          <span className="font-label-sm min-w-[3ch]">75%</span>
                       </div>
                    </td>
                    <td className="p-3 text-right">
                      <button className="text-secondary hover:bg-secondary/10 p-2 rounded-full transition-colors">
                         <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-on-surface-variant font-label-md">
                      VocÃª ainda nÃ£o tem alunos alocados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Shell>
  );
}

