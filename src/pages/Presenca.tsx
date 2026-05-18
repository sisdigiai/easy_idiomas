import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { getLessonAttendance, setLessonQRCode } from "@/lib/supabase/queries";
import { QRCodeSVG } from "qrcode.react";

export default function Presenca() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const lessonId = searchParams.get('lessonId') || undefined;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tokenGenerated, setTokenGenerated] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  const fetchAttendance = async () => {
    const res = await getLessonAttendance(lessonId);
    if (res.data) {
       setData(res.data);
       if (res.data.lesson?.qr_code_token) {
           const expiresAt = new Date(res.data.lesson.qr_expires_at).getTime();
           const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
           if (remaining > 0) {
               setTokenGenerated(res.data.lesson.qr_code_token);
               setCountdown(remaining);
           }
       }
    }
    setLoading(false);
  };

  useEffect(() => {
     fetchAttendance();
     // Real-time updates could be added here
     const interval = setInterval(() => {
         // Re-fetch occasionally to update attendance
         if (lessonId) fetchAttendance();
     }, 10000); // every 10 seconds
     return () => clearInterval(interval);
  }, [lessonId]);

  useEffect(() => {
      if (countdown > 0) {
          const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
          return () => clearTimeout(timer);
      } else {
          setTokenGenerated(null);
      }
  }, [countdown]);

  const handleGerarQR = async () => {
      if (!data?.lesson) return;
      const res = await setLessonQRCode(data.lesson.id, 10);
      if (res.data?.token) {
        setTokenGenerated(res.data.token);
        const expiresAt = new Date(res.data.expires_at).getTime();
        setCountdown(Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)));
      }
      fetchAttendance();
  };

  if (loading) {
      return <Shell><div className="flex justify-center p-8"><span className="material-symbols-outlined animate-spin text-primary">progress_activity</span></div></Shell>;
  }

  if (!data?.lesson) {
      return (
          <Shell>
              <div className="p-4 md:p-8">
                  <h2 className="font-headline-lg-mobile md:font-headline-lg text-on-background mb-1">Presença</h2>
                  <p className="font-body-lg text-on-surface-variant mb-4">Nenhuma aula ativa encontrada no momento.</p>
                  <Button onClick={() => navigate('/aulas')} variant="outline">Ver Aulas</Button>
              </div>
          </Shell>
      )
  }

  const { lesson, attendance } = data;
  const percentage = Math.round((attendance.present.length / (attendance.total_students || 20)) * 100);
  const checkinUrl = `${window.location.origin}/checkin/${tokenGenerated}`;

  return (
    <Shell>
      <div className="p-4 md:p-8">
        <div className="flex items-center gap-4 mb-1">
             <button onClick={() => navigate(-1)} className="text-secondary hover:text-primary"><span className="material-symbols-outlined">arrow_back</span></button>
             <h2 className="font-headline-lg-mobile md:font-headline-lg text-on-background">
               Escaneie para registrar presença
             </h2>
        </div>
        <p className="font-body-lg text-on-surface-variant flex items-center gap-2 mb-8 ml-10">
          <span className="material-symbols-outlined text-[20px]">book</span>
          {lesson.title} · {lesson.room}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white rounded-xl p-8 flex flex-col items-center justify-center shadow-sm border border-outline-variant relative overflow-hidden min-h-[400px]">
               {tokenGenerated && countdown > 0 ? (
                   <>
                       <div className="bg-white p-4 mb-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                           <QRCodeSVG value={checkinUrl} size={256} level="H" includeMargin={true} />
                       </div>
                       <div className="flex flex-col items-center gap-1 mb-6 text-on-surface-variant text-center">
                          <p className="font-body-md">Acesse: <strong className="text-on-background truncate max-w-[280px] md:max-w-md inline-block align-bottom">{checkinUrl}</strong></p>
                          <p className="font-body-md text-error flex items-center gap-1">
                               <span className="material-symbols-outlined text-[16px]">timer</span>
                               Expira em: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                          </p>
                       </div>
                       <div className="flex items-center gap-2 text-primary bg-primary-container/20 px-4 py-2 rounded-full">
                          <span className="material-symbols-outlined animate-pulse">sensors</span>
                          <span className="font-label-md">Aguardando check-ins...</span>
                       </div>
                   </>
               ) : (
                   <div className="flex flex-col items-center justify-center text-center">
                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">qr_code_scanner</span>
                        <h3 className="font-headline-sm text-secondary mb-2">QR Code não gerado ou expirado</h3>
                        <p className="font-body-md text-on-surface-variant mb-6 ax-w-sm">
                            Gere um novo QR Code para permitir que os alunos registrem presença.
                        </p>
                        <Button size="lg" onClick={handleGerarQR}>
                            Gerar QR Code
                        </Button>
                   </div>
               )}
            </div>
            
            <div className="flex gap-4">
                <Button variant="outline" size="lg" onClick={handleGerarQR} className="flex-1 gap-2">
                   <span className="material-symbols-outlined">refresh</span>
                   {tokenGenerated ? "Renovar QR" : "Gerar QR"}
                </Button>
                <Button size="lg" onClick={() => navigate('/aulas')} className="flex-1 gap-2 bg-error text-white hover:bg-error/90">
                   <span className="material-symbols-outlined">stop_circle</span>
                   Encerrar chamada
                </Button>
            </div>
          </div>
          
          <div className="lg:col-span-5 flex flex-col gap-6">
             <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container-highest flex items-center gap-6">
                <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center bg-gray-50 rounded-full border-4 border-[#15803D]">
                   <span className="font-headline-md text-on-background">{percentage}%</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-on-background mb-2">Presença atual</h3>
                  <div className="font-body-md text-on-surface-variant flex flex-col gap-1">
                      <p className="flex items-center gap-2">
                         <span className="material-symbols-outlined text-[18px] text-[#15803D]">check_circle</span>
                         Presentes: {attendance.present.length}/{attendance.total_students || 20}
                      </p>
                      <p className="flex items-center gap-2">
                         <span className="material-symbols-outlined text-[18px] text-error">cancel</span>
                         Ausentes: {(attendance.total_students || 20) - attendance.present.length}
                      </p>
                  </div>
                </div>
             </div>
             
             {attendance.present.length > 0 && (
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container-highest flex-grow">
                   <div className="flex items-center justify-between mb-4 pb-2 border-b border-surface-container-highest">
                       <h3 className="font-headline-sm text-on-background">Registros recentes</h3>
                       <span className="material-symbols-outlined text-secondary">history</span>
                   </div>
                   <ul className="flex flex-col gap-4">
                       {attendance.present.map((record: any, idx: number) => (
                           <li key={idx} className="flex items-center justify-between group">
                               <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-label-md">
                                        {record.student?.full_name?.substring(0,2).toUpperCase()}
                                   </div>
                                   <div>
                                       <p className="font-label-md text-on-background">{record.student?.full_name}</p>
                                       <p className="font-label-sm text-on-surface-variant flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                                            {new Date(record.check_in_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                       </p>
                                   </div>
                               </div>
                               <span className="material-symbols-outlined text-[#15803D]">task_alt</span>
                           </li>
                       ))}
                   </ul>
                </div>
             )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
