/**
 * Tour guiado da plataforma Voz UnDF.
 *
 * - Aparece apenas no primeiro acesso (após login)
 * - Salva preferência de conclusão no localStorage
 * - Acessível: teclado, aria-live, Escape para fechar, foco controlado
 * - Sem dependências externas além do que já existe no projeto
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const TOUR_STORAGE_KEY = "voz-undf:tour-completed";

export interface TourStep {
  title: string;
  description: string;
  icon: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    icon: "🎓",
    title: "Bem-vindo ao Voz UnDF",
    description:
      "Aqui você pode registrar demandas, apresentar propostas e acompanhar as respostas da Universidade. Sua voz participa. A Universidade transforma.",
  },
  {
    icon: "📝",
    title: "Registrar uma demanda",
    description:
      "Use o botão 'Nova demanda' para registrar um problema, solicitação, sugestão, elogio ou denúncia. Cada registro recebe um protocolo único para acompanhamento.",
  },
  {
    icon: "💡",
    title: "Propostas da comunidade",
    description:
      "Apresente ideias de melhoria e acompanhe propostas da comunidade. Propostas com mais apoios são priorizadas pela gestão.",
  },
  {
    icon: "🤝",
    title: "Também sou afetado",
    description:
      "Quando uma demanda também afetar você, use o recurso 'Também sou afetado' para ajudar a gestão a identificar prioridades coletivas.",
  },
  {
    icon: "🔖",
    title: "Protocolo de acompanhamento",
    description:
      "Cada demanda recebe um número de protocolo único no formato VUNDF-YYYYMMDD-XXXX. Guarde-o para acompanhar o andamento a qualquer momento.",
  },
  {
    icon: "📊",
    title: "Transparência pública",
    description:
      "Acompanhe indicadores públicos e entenda como a Universidade está respondendo às demandas da comunidade.",
  },
  {
    icon: "♿",
    title: "Recursos de acessibilidade",
    description:
      "Use os recursos de Libras (VLibras), contraste, tamanho de texto, leitura e modo de foco conforme sua necessidade. Todos disponíveis no painel de acessibilidade.",
  },
  {
    icon: "👤",
    title: "Meu painel",
    description:
      "Acompanhe suas demandas, propostas, apoios e protocolos em um só lugar. Acesse 'Meu painel' no menu superior a qualquer momento.",
  },
];

interface GuidedTourProps {
  /** Se verdadeiro, exibe o tour imediatamente (ignora localStorage) */
  forceOpen?: boolean;
  onClose?: () => void;
}

export function GuidedTour({ forceOpen = false, onClose }: GuidedTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      setStep(0);
      return;
    }
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!completed) {
      // Pequeno delay para garantir que a página carregou
      const t = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, [forceOpen]);

  const close = useCallback(
    (markComplete = true) => {
      if (markComplete) {
        localStorage.setItem(TOUR_STORAGE_KEY, "true");
      }
      setIsOpen(false);
      onClose?.();
    },
    [onClose],
  );

  // Foco controlado — mover foco para o diálogo ao abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Escape para fechar
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
      if (e.key === "ArrowRight") setStep((s) => Math.min(s + 1, TOUR_STEPS.length - 1));
      if (e.key === "ArrowLeft") setStep((s) => Math.max(s - 1, 0));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Tour guiado — etapa ${step + 1} de ${TOUR_STEPS.length}: ${current.title}`}
          onClick={(e) => e.target === e.currentTarget && close(false)}
        >
          <motion.div
            ref={dialogRef}
            initial={{ scale: 0.92, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 12 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="bg-[#F2F0EB] w-full max-w-lg border border-[#1B3469]/15 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1B3469]/10">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#1B3469]/50" />
                <span className="text-xs uppercase tracking-widest text-[#1B3469]/50 font-semibold">
                  Tour guiado · {step + 1} de {TOUR_STEPS.length}
                </span>
              </div>
              <button
                ref={closeRef}
                onClick={() => close(false)}
                className="p-1 text-[#1B3469]/40 hover:text-[#1B3469] transition-colors focus-visible:outline-2 focus-visible:outline-[#1B3469] rounded"
                aria-label="Fechar tour"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-0.5 bg-[#1B3469]/10">
              <div
                className="h-full bg-[#1B3469] transition-all duration-500"
                style={{ width: `${((step + 1) / TOUR_STEPS.length) * 100}%` }}
              />
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="px-8 py-10"
                aria-live="polite"
                aria-atomic="true"
              >
                <div className="text-5xl mb-5 select-none" role="img" aria-hidden="true">
                  {current.icon}
                </div>
                <h2 className="text-2xl font-bold text-[#1B3469] mb-3 leading-tight">
                  {current.title}
                </h2>
                <p className="text-[#1B3469]/70 text-sm leading-relaxed">
                  {current.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-[#1B3469]/10 flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => close(true)}
                className="text-[#1B3469]/50 hover:text-[#1B3469] text-xs"
              >
                Não mostrar novamente
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep((s) => Math.max(s - 1, 0))}
                  disabled={step === 0}
                  className="border-[#1B3469]/20 text-[#1B3469]"
                  aria-label="Etapa anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {isLast ? (
                  <Button
                    size="sm"
                    onClick={() => close(true)}
                    className="bg-[#1B3469] hover:bg-[#1B3469]/90 text-white px-5"
                  >
                    Concluir tour
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setStep((s) => Math.min(s + 1, TOUR_STEPS.length - 1))}
                    className="bg-[#1B3469] hover:bg-[#1B3469]/90 text-white px-5"
                    aria-label="Próxima etapa"
                  >
                    Próximo
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>

            {/* Dots */}
            <div className="pb-4 flex justify-center gap-1.5" role="tablist" aria-label="Progresso do tour">
              {TOUR_STEPS.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === step}
                  aria-label={`Ir para etapa ${i + 1}`}
                  onClick={() => setStep(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-[#1B3469] ${
                    i === step ? "bg-[#1B3469] w-4" : "bg-[#1B3469]/20"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Hook para abrir o tour programaticamente (ex: menu Ajuda) */
export function useTour() {
  const reopen = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    window.location.reload();
  };

  const reset = () => localStorage.removeItem(TOUR_STORAGE_KEY);

  const isCompleted = () =>
    typeof window !== "undefined" &&
    !!localStorage.getItem(TOUR_STORAGE_KEY);

  return { reopen, reset, isCompleted };
}
