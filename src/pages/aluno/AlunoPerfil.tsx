import { Shell } from "@/components/layout/Shell";

export default function AlunoPerfil() {
  return (
    <Shell>
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <h1 className="font-headline-lg text-secondary mb-4">Meu Perfil</h1>
        <p className="font-body-md text-on-surface-variant">Suas informações pessoais, configurações e contato com a escola.</p>
      </div>
    </Shell>
  );
}
