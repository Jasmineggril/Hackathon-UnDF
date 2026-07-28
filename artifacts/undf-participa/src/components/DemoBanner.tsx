/**
 * Faixa de ambiente de demonstração.
 * Exibida apenas quando VITE_DEMO_MODE=true E o usuário está em modo demo.
 */

import { FlaskConical } from "lucide-react";

interface DemoBannerProps {
  /** Quando false, não renderiza nada */
  visible?: boolean;
}

export function DemoBanner({ visible = true }: DemoBannerProps) {
  if (!visible) return null;
  if (import.meta.env.VITE_DEMO_MODE !== "true") return null;

  return (
    <div
      role="status"
      aria-label="Ambiente de demonstração ativo"
      className="w-full bg-amber-50 border-b border-amber-200 py-1.5 px-4 flex items-center justify-center gap-2 text-xs font-medium text-amber-800"
    >
      <FlaskConical className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>Ambiente de demonstração — os dados exibidos são fictícios</span>
    </div>
  );
}
