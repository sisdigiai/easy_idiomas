import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingForm, setLoadingForm] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { session, profile } = useAuth();

  const from = location.state?.from?.pathname;

  // Redirect if already logged in and profile loaded
  useEffect(() => {
    if (session && profile) {
       let defaultRoute = "/dashboard";
       if (profile.role === 'student') defaultRoute = "/aluno";
       else if (profile.role === 'teacher') defaultRoute = "/professor";

       navigate(from || defaultRoute, { replace: true });
    }
  }, [session, profile, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
       // Mock logic based on email if no Supabase is configured
       let mockRole = "student";
       const cleanEmail = email.trim().toLowerCase();
       if (cleanEmail === "junior@oticastatymello.com.br" || cleanEmail.includes("admin")) {
           mockRole = "admin";
       } else if (cleanEmail.includes("coordenador")) {
           mockRole = "coordinator";
       } else if (cleanEmail.includes("professor")) {
           mockRole = "teacher";
       }
       
       localStorage.setItem("mock_user_role", mockRole);
       localStorage.setItem("mock_user_email", cleanEmail || "convidado@teste.com");
       
       window.location.href = mockRole === "admin" || mockRole === "coordinator" ? "/dashboard" : mockRole === "teacher" ? "/professor" : "/aluno";
       return;
    }

    setLoadingForm(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email ou senha incorretos.");
      setLoadingForm(false);
      return;
    }

    setLoadingForm(false);
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[440px] bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100 p-8 flex flex-col items-center relative pb-16">
        {/* Logo Header */}
        <div className="mb-8 flex flex-col items-center text-center">
           <div className="mb-6 flex flex-col items-center">
             <div className="bg-primary text-white w-16 h-16 flex items-center justify-center rounded-2xl shadow-sm mb-3">
               <span className="text-3xl font-black tracking-tighter">EA</span>
             </div>
             <h1 className="text-2xl font-black text-primary tracking-tight">EASY</h1>
             <p className="text-sm font-medium text-secondary uppercase tracking-widest mt-[-4px]">Idiomas</p>
           </div>
          <h2 className="font-headline-md text-on-surface mb-2">Bem-vindo ao Easy Aula+</h2>
          <p className="font-body-md text-secondary">
            Apoio simples para aulas, presença, atividades e progresso.
          </p>
        </div>

        {/* Login Form */}
        <form className="w-full flex flex-col gap-6" onSubmit={handleLogin}>
          {error && <p className="text-error text-center font-label-md bg-error-container/50 p-2 rounded">{error}</p>}
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-on-surface" htmlFor="email">
              Email
            </label>
            <Input 
              id="email" 
              type="email" 
              placeholder="seu@email.com" 
              icon="mail" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-md text-on-surface" htmlFor="password">
              Senha
            </label>
            <div className="relative">
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                icon="lock" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
               <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface">
                 <span className="material-symbols-outlined">visibility</span>
               </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 bg-white cursor-pointer" />
              <span className="font-body-md text-sm text-secondary group-hover:text-on-surface transition-colors">
                Lembrar-me
              </span>
            </label>
            <a href="#" className="font-label-md text-sm text-primary hover:text-primary-container transition-colors">
              Esqueci minha senha
            </a>
          </div>

          <Button type="submit" disabled={loadingForm} className="w-full mt-2 gap-2" size="lg">
            {loadingForm ? (
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
            ) : (
                <>
                  Entrar
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
            )}
          </Button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="font-body-md text-sm text-secondary text-center">
            Precisa de ajuda para acessar? <br />{" "}
            <a href="#" className="text-primary hover:underline font-label-md">
              Contate o suporte institucional
            </a>
          </p>
        </div>

        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="font-body-md text-[10px] text-gray-400 uppercase tracking-widest">
            Produto da EASY Idiomas
          </p>
        </div>
      </div>
    </main>
  );
}
