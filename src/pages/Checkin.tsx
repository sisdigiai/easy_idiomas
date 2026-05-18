import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { registerCheckin } from "@/lib/supabase/queries";
import { useAuth } from "@/contexts/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function Checkin() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCheckin = async () => {
    if (!token) return;
    setLoading(true);
    setErrorMsg("");
    
    if (!profile && isSupabaseConfigured) {
      setErrorMsg("Voce precisa fazer login para registrar sua propria presenca.");
      setLoading(false);
      return;
    }
    
    try {
        const res = await registerCheckin(token);
        if (res.error) {
            setErrorMsg(typeof res.error === 'string' ? res.error : (res.error as any).message || "Erro desconhecido.");
        } else {
            setSuccess(true);
        }
    } catch (err) {
        setErrorMsg("Erro ao conectar com o servidor.");
    }
    
    setLoading(false);
  };

  if (success) {
      return (
          <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
             <div className="w-20 h-20 bg-[#c8e6c9] text-[#2e7d32] rounded-full flex items-center justify-center mb-6">
                 <span className="material-symbols-outlined text-4xl">check_circle</span>
             </div>
             <h1 className="font-headline-lg text-secondary mb-2">Presença Confirmada!</h1>
             <p className="font-body-lg text-on-surface-variant mb-8">
                 Sua presença foi registrada com sucesso. Boa aula!
             </p>
             <Button onClick={() => navigate('/dashboard')} size="lg" className="w-full max-w-xs">
                 Ir para o Início
             </Button>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col p-6 items-center justify-center">
       <div className="bg-surface-container-lowest rounded-2xl p-8 max-w-sm w-full shadow border border-outline-variant/30 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
           <div className="mb-6 flex justify-center">
               <span className="material-symbols-outlined text-6xl text-primary p-4 bg-primary-container/20 rounded-full">how_to_reg</span>
           </div>
           <h1 className="font-headline-md text-secondary mb-2">Registrar Presença</h1>
           <p className="font-body-md text-on-surface-variant mb-8">
               Confirme sua presença nesta aula tocando no botão abaixo.
           </p>

           {errorMsg && (
               <div className="mb-6 p-4 bg-error-container/30 text-error rounded-lg flex items-start gap-2 text-left">
                   <span className="material-symbols-outlined text-[20px]">error</span>
                   <p className="font-label-md">{errorMsg}</p>
               </div>
           )}

           <Button size="lg" onClick={handleCheckin} disabled={loading} className="w-full h-14 font-headline-sm">
               {loading ? (
                   <span className="material-symbols-outlined animate-spin">progress_activity</span>
               ) : (
                   "Confirmar Presença"
               )}
           </Button>
           
           {!profile && isSupabaseConfigured && (
               <p className="mt-4 font-label-sm text-secondary">
                   Você não está logado. Por favor, <Link to="/login" className="text-primary underline">faça login</Link> primeiro.
               </p>
           )}
       </div>
    </div>
  );
}
