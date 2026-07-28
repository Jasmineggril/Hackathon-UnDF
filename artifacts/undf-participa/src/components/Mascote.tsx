/**
 * Mascote institucional do Voz UnDF — "Vozinho"
 *
 * Personagem universitário: estudante com mochila e skate,
 * representando movimento, participação e juventude.
 *
 * - Aparece em estados vazios, onboarding, confirmação e ajuda
 * - Pode ser ocultado; preferência salva no localStorage
 * - Respeita prefers-reduced-motion
 * - Alt text adequado ou marcado como decorativo
 * - Não substitui textos acessíveis
 *
 * Arte definitiva: pendente. Este é um placeholder vetorial funcional.
 */

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";

const MASCOTE_HIDDEN_KEY = "voz-undf:mascote-hidden";

interface MascoteProps {
  /** Fala/mensagem contextual */
  message?: string;
  /** Tamanho do SVG */
  size?: "sm" | "md" | "lg";
  /** Se true, não mostra botão de ocultar */
  static?: boolean;
  className?: string;
}

const sizes = {
  sm: 64,
  md: 96,
  lg: 128,
};

/** SVG inline do Vozinho — estudante universitário */
function VozinhoSVG({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Vozinho, mascote do Voz UnDF"
    >
      {/* Fundo circular */}
      <circle cx="50" cy="50" r="48" fill="#E8E5DF" />

      {/* Corpo */}
      <rect x="33" y="55" width="34" height="26" rx="4" fill="#1B3469" />

      {/* Cabeça */}
      <circle cx="50" cy="38" r="15" fill="#F5D5B0" />

      {/* Cabelo */}
      <path d="M35 35 Q38 22 50 23 Q62 22 65 35 Q63 28 50 27 Q37 28 35 35Z" fill="#2D1A0E" />

      {/* Olhos */}
      <circle cx="45" cy="37" r="2" fill="#2D1A0E" />
      <circle cx="55" cy="37" r="2" fill="#2D1A0E" />
      <circle cx="46" cy="36" r="0.7" fill="white" />
      <circle cx="56" cy="36" r="0.7" fill="white" />

      {/* Sorriso */}
      <path d="M44 43 Q50 48 56 43" stroke="#2D1A0E" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Bochecha */}
      <circle cx="42" cy="42" r="3" fill="#FFAD9A" opacity="0.5" />
      <circle cx="58" cy="42" r="3" fill="#FFAD9A" opacity="0.5" />

      {/* Capelo (chapéu de formatura) */}
      <rect x="36" y="24" width="28" height="4" rx="1" fill="#1B3469" />
      <rect x="45" y="20" width="10" height="5" rx="1" fill="#1B3469" />
      <line x1="64" y1="26" x2="68" y2="32" stroke="#5B9A6E" strokeWidth="1.5" />
      <circle cx="68" cy="33" r="2" fill="#5B9A6E" />

      {/* Mochila */}
      <rect x="62" y="56" width="11" height="14" rx="2" fill="#5B9A6E" />
      <rect x="63" y="60" width="9" height="6" rx="1" fill="#4a8059" />
      <circle cx="67.5" cy="63" r="1" fill="#5B9A6E" />

      {/* Skate */}
      <rect x="30" y="82" width="40" height="6" rx="3" fill="#2D1A0E" />
      <circle cx="37" cy="89" r="3" fill="#1B3469" />
      <circle cx="63" cy="89" r="3" fill="#1B3469" />

      {/* Pernas */}
      <rect x="40" y="78" width="7" height="8" rx="2" fill="#1B3469" />
      <rect x="53" y="78" width="7" height="8" rx="2" fill="#1B3469" />

      {/* Tênis */}
      <rect x="38" y="84" width="10" height="4" rx="2" fill="#5B9A6E" />
      <rect x="52" y="84" width="10" height="4" rx="2" fill="#5B9A6E" />
    </svg>
  );
}

export function Mascote({ message, size = "md", static: isStatic, className }: MascoteProps) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(MASCOTE_HIDDEN_KEY);
    if (saved === "true") setHidden(true);
  }, []);

  const hide = () => {
    localStorage.setItem(MASCOTE_HIDDEN_KEY, "true");
    setHidden(true);
  };

  if (hidden) return null;

  const svgSize = sizes[size];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center gap-3 ${className ?? ""}`}
    >
      <div className="relative">
        <VozinhoSVG size={svgSize} />
        {!isStatic && (
          <button
            onClick={hide}
            className="absolute -top-1 -right-1 w-5 h-5 bg-white border border-[#1B3469]/20 rounded-full flex items-center justify-center text-[#1B3469]/40 hover:text-[#1B3469] transition-colors"
            aria-label="Ocultar mascote Vozinho"
            title="Ocultar"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {message && (
        <div className="max-w-[200px] bg-white border border-[#1B3469]/10 rounded-lg px-3 py-2 text-center relative shadow-sm">
          {/* Balão de fala */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white" />
          <p className="text-xs text-[#1B3469]/80 leading-relaxed">{message}</p>
        </div>
      )}
    </motion.div>
  );
}

/** Verifica se o mascote está oculto */
export function isMascoteHidden(): boolean {
  return typeof window !== "undefined" && localStorage.getItem(MASCOTE_HIDDEN_KEY) === "true";
}

/** Reexibe o mascote (para preferências) */
export function showMascote(): void {
  localStorage.removeItem(MASCOTE_HIDDEN_KEY);
}
