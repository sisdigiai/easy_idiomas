import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { getReports } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";

type ReportType = "class_attendance" | "student_attendance" | "pending_activities" | "student_progress";

export default function Relatorios() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState<ReportType>("class_attendance");

  useEffect(() => {
     async function load() {
         const res = await getReports();
         if (res.data) setData(res.data);
         setLoading(false);
     }
     load();
  }, []);

  const getActiveRows = () => {
    if (activeReport === "class_attendance") return data?.attendanceByClass || [];
    if (activeReport === "student_attendance") return data?.attendanceByStudent || [];
    if (activeReport === "pending_activities") return data?.pendingActivities || [];
    return data?.studentProgress || [];
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const rows = getActiveRows();
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const escapeCell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [headers.join(","), ...rows.map((row: any) => headers.map((header) => escapeCell(row[header])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `easy-aula-${activeReport}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const REPORT_OPTIONS = [
    { id: "class_attendance", label: "PresenÃ§a por turma" },
    { id: "student_attendance", label: "PresenÃ§a por aluno" },
    { id: "pending_activities", label: "Atividades pendentes" },
    { id: "student_progress", label: "Progresso dos alunos" },
  ];

  return (
    <Shell>
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-secondary mb-2">RelatÃ³rios GovernanÃ§a</h1>
        <p className="font-body-md text-on-surface-variant mb-8 w-full md:w-2/3">
          Aqui vocÃª acompanha o progresso, as faltas e o desenvolvimento geral dos alunos.
        </p>

        {/* Report Selector */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-outline-variant/30 pb-4">
          {REPORT_OPTIONS.map((opt) => (
             <button 
                key={opt.id}
                onClick={() => setActiveReport(opt.id as ReportType)}
                className={`px-4 py-2 rounded-full font-label-md transition-colors ${activeReport === opt.id ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'}`}
             >
                 {opt.label}
             </button>
          ))}
        </div>
        
        {loading ? (
             <div className="flex justify-center p-12"><span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span></div>
        ) : (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
                {/* Header for Export and Logo */}
                <div className="bg-surface p-6 border-b border-outline-variant/20 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                         <div className="flex items-center gap-2 grayscale opacity-80">
                           <div className="bg-primary text-white w-10 h-10 flex items-center justify-center rounded-lg shadow-sm">
                             <span className="text-xl font-black tracking-tighter">EA</span>
                           </div>
                           <div className="flex flex-col justify-center">
                             <span className="text-lg font-black text-primary leading-none tracking-tight">EASY</span>
                             <span className="text-[10px] font-medium text-secondary uppercase tracking-widest leading-none mt-[2px]">Idiomas</span>
                           </div>
                         </div>
                         <div>
                             <h2 className="font-headline-sm text-secondary">{REPORT_OPTIONS.find(o => o.id === activeReport)?.label}</h2>
                             <p className="font-label-sm text-on-surface-variant">Gerado em {new Date().toLocaleDateString()}</p>
                         </div>
                    </div>
                    <div className="flex w-full md:w-auto gap-3">
                         <Button variant="outline" size="sm" onClick={handleExportExcel} className="flex-1 md:flex-none gap-2">
                             <span className="material-symbols-outlined text-[18px]">table</span>
                             Excel
                         </Button>
                         <Button variant="outline" size="sm" onClick={handleExportPDF} className="flex-1 md:flex-none gap-2">
                             <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                             PDF
                         </Button>
                    </div>
                </div>

                {/* Table Area */}
                <div className="overflow-x-auto">
                    {/* 1. Class Attendance */}
                    {activeReport === "class_attendance" && (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-variant/30 text-on-surface-variant font-label-md">
                                    <th className="p-4 border-b border-outline-variant/20 whitespace-nowrap">Turma</th>
                                    <th className="p-4 border-b border-outline-variant/20 whitespace-nowrap hidden md:table-cell">Idioma e NÃ­vel</th>
                                    <th className="p-4 border-b border-outline-variant/20 whitespace-nowrap text-center">FrequÃªncia</th>
                                    <th className="p-4 border-b border-outline-variant/20 whitespace-nowrap text-center">AusÃªncias</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.attendanceByClass?.length === 0 && (
                                    <tr><td colSpan={4} className="p-8 text-center text-secondary">Sem dados disponÃ­veis.</td></tr>
                                )}
                                {data?.attendanceByClass?.map((item: any, i: number) => (
                                    <tr key={i} className="border-b border-outline-variant/10 hover:bg-surface-variant/10">
                                        <td className="p-4 font-body-md">
                                           <p className="font-bold text-secondary">{item.class_name}</p>
                                           <p className="text-[12px] text-on-surface-variant md:hidden mt-1">{item.language} {item.level}</p>
                                        </td>
                                        <td className="p-4 font-body-md hidden md:table-cell">
                                           <span className="px-2 py-1 bg-secondary-container/50 text-on-secondary-container rounded text-xs">{item.language} Â· {item.level}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`font-bold ${item.avg_attendance >= 80 ? 'text-[#15803D]' : 'text-error'}`}>{item.avg_attendance || item.present_count || 0}%</span>
                                            <div className="w-16 h-1 bg-surface-variant mx-auto mt-1 rounded-full overflow-hidden hidden md:block">
                                                <div className="bg-current h-full" style={{ width: `${item.avg_attendance || item.present_count || 0}%` }}></div>
                                            </div>
                                        </td>
                                        <td className="p-4 font-body-md text-center">
                                            {item.students_with_absences || item.absent_count || 0} alunos
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* 2. Student Attendance */}
                    {activeReport === "student_attendance" && (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-variant/30 text-on-surface-variant font-label-md">
                                    <th className="p-4 border-b border-outline-variant/20 whitespace-nowrap">Aluno</th>
                                    <th className="p-4 border-b border-outline-variant/20 whitespace-nowrap hidden sm:table-cell">CÃ³digo</th>
                                    <th className="p-4 border-b border-outline-variant/20 whitespace-nowrap">Turma</th>
                                    <th className="p-4 border-b border-outline-variant/20 whitespace-nowrap text-center">Freq.</th>
                                    <th className="p-4 border-b border-outline-variant/20 whitespace-nowrap text-center">Faltas</th>
                                    <th className="p-4 border-b border-outline-variant/20 whitespace-nowrap hidden lg:table-cell">Ãšlt. PresenÃ§a</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.attendanceByStudent?.length === 0 && (
                                    <tr><td colSpan={6} className="p-8 text-center text-secondary">Sem dados disponÃ­veis.</td></tr>
                                )}
                                {data?.attendanceByStudent?.map((item: any, i: number) => (
                                    <tr key={i} className="border-b border-outline-variant/10 hover:bg-surface-variant/10">
                                        <td className="p-4 font-body-md font-bold text-secondary">{item.student_name}</td>
                                        <td className="p-4 font-body-sm hidden sm:table-cell text-on-surface-variant">{item.student_code}</td>
                                        <td className="p-4 font-body-sm">{item.class_name}</td>
                                        <td className="p-4 text-center">
                                             <span className={`font-bold ${item.attendance_percentage >= 80 ? 'text-[#15803D]' : 'text-error'}`}>{item.attendance_percentage}%</span>
                                        </td>
                                        <td className="p-4 text-center font-body-sm">{item.absences}</td>
                                        <td className="p-4 font-body-sm text-on-surface-variant hidden lg:table-cell">{item.last_attendance}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* 3. Pending Activities */}
                    {activeReport === "pending_activities" && (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-variant/30 text-on-surface-variant font-label-md">
                                    <th className="p-4 border-b border-outline-variant/20 whitespace-nowrap">Atividade</th>
                                    <th className="p-4 border-b border-outline-variant/20 whitespace-nowrap">Aluno</th>
                                    <th className="p-4 border-b border-outline-variant/20 whitespace-nowrap hidden md:table-cell">Turma</th>
                                    <th className="p-4 border-b border-outline-variant/20 whitespace-nowrap text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.pendingActivities?.length === 0 && (
                                    <tr><td colSpan={4} className="p-8 text-center text-secondary">Sem atividades pendentes.</td></tr>
                                )}
                                {data?.pendingActivities?.map((item: any, i: number) => (
                                    <tr key={item.student_activity_id || i} className="border-b border-outline-variant/10 hover:bg-surface-variant/10">
                                        <td className="p-4 font-body-md text-on-surface">{item.activity_title}</td>
                                        <td className="p-4 font-body-md text-secondary font-bold">{item.student_name}</td>
                                        <td className="p-4 font-body-sm hidden md:table-cell">{item.class_name}</td>
                                        <td className="p-4 text-center">
                                            <span className="px-2 py-1 bg-error-container/40 text-error font-bold rounded text-xs">{item.status || "Pendente"}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* 4. Student Progress */}
                    {activeReport === "student_progress" && (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-variant/30 text-on-surface-variant font-label-md">
                                    <th className="p-4 border-b border-outline-variant/20 whitespace-nowrap">Aluno</th>
                                    <th className="p-4 border-b border-outline-variant/20 whitespace-nowrap hidden md:table-cell">NÃ­vel</th>
                                    <th className="p-4 border-b border-outline-variant/20 whitespace-nowrap">Progresso</th>
                                    <th className="p-4 border-b border-outline-variant/20 whitespace-nowrap text-center hidden lg:table-cell">Ativ. ConcluÃ­das</th>
                                    <th className="p-4 border-b border-outline-variant/20 whitespace-nowrap text-center">PendÃªncias</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.studentProgress?.length === 0 && (
                                    <tr><td colSpan={5} className="p-8 text-center text-secondary">Sem dados disponÃ­veis.</td></tr>
                                )}
                                {data?.studentProgress?.map((item: any, i: number) => (
                                    <tr key={i} className="border-b border-outline-variant/10 hover:bg-surface-variant/10">
                                        <td className="p-4 font-body-md font-bold text-secondary">
                                            {item.student_name}
                                            <div className="text-xs font-normal text-on-surface-variant mt-1 md:hidden">{item.language} Â· {item.level}</div>
                                        </td>
                                        <td className="p-4 font-body-sm hidden md:table-cell">{item.language} Â· {item.level}</td>
                                        <td className="p-4">
                                             <div className="flex items-center gap-3">
                                                 <span className="font-bold text-sm min-w-[32px]">{Math.round(item.progress_percentage || 0)}%</span>
                                                 <div className="w-24 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                                                     <div className="bg-primary h-full" style={{ width: `${item.progress_percentage || 0}%` }}></div>
                                                 </div>
                                             </div>
                                        </td>
                                        <td className="p-4 text-center font-body-sm hidden lg:table-cell">{item.completed_activities || 0}</td>
                                        <td className="p-4 text-center">
                                            {item.pending_activities > 0 ? (
                                                <span className="text-error font-bold text-sm bg-error-container/30 px-2 py-0.5 rounded">{item.pending_activities}</span>
                                            ) : (
                                                <span className="text-on-surface-variant text-sm">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        )}
      </div>
    </Shell>
  );
}

