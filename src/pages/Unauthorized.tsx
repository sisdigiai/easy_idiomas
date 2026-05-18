import { Shell } from "@/components/layout/Shell";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Unauthorized() {
  return (
    <div className="flex h-screen bg-background items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-error-container/20 text-error flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[32px]">block</span>
        </div>
        <h1 className="font-headline-md text-secondary mb-2">Acesso Negado</h1>
        <p className="font-body-md text-on-surface-variant mb-6">
          Você não tem permissão para acessar esta página.
        </p>
        <Button onClick={() => window.location.href = "/"}>Voltar ao Início</Button>
      </div>
    </div>
  );
}
