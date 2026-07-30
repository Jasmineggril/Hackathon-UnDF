/**
 * Tour guiado da plataforma Voz UnDF.
 *
 * - Destaca elementos reais via data-tour="X" + targetSelector
 * - Navega para a rota da etapa, aguarda o elemento renderizar e posiciona
 *   o popover próximo ao alvo
 * - Etapas opcionais são puladas se o elemento não for encontrado em 3s
 * - Mantém: Escape, setas do teclado, aria-live, redução de movimento
 * - Salva progresso no localStorage
 */

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  createContext,
  useContext,
  type CSSProperties,
} from "react";
import { X, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocation } from "wouter";

// ── Constants ─────────────────────────────────────────────────────────────────

const TOUR_STORAGE_KEY = "voz-undf:tour-completed";
const TOUR_OPEN_EVENT = "voz-undf:open-tour";

// ── Step definitions ──────────────────────────────────────────────────────────

export interface TourStep {
  id: string;
  route: string;
  targetSelector: string;
  title: string;
  description: string;
  placement: "top" | "bottom" | "left" | "right" | "center";
  optional?: boolean;
  icon: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "intro",
    route: "/",
    targetSelector: "[data-tour='meu-painel']",
    title: "Bem-vindo ao Voz UnDF",
    description:
      "Aqui você pode registrar demandas, apresentar propostas e acompanhar as respostas da Universidade. Sua voz participa. A Universidade transforma.",
    placement: "bottom",
    optional: true,
    icon: "🎓",
  },
  {
    id: "nova-demanda",
    route: "/demandas",
    targetSelector: "[data-tour='nova-demanda']",
    title: "Registrar uma demanda",
    description:
      "Use o botão 'Nova demanda' para registrar um problema, solicitação, sugestão, elogio ou denúncia. Cada registro recebe um protocolo único para acompanhamento.",
    placement: "bottom",
    optional: true,
    icon: "📝",
  },
  {
    id: "demandas-publicas",
    route: "/demandas",
    targetSelector: "[data-tour='demandas-publicas']",
    title: "Demandas públicas",
    description:
      "Veja as demandas da comunidade, filtre por categoria ou status e apoie as que também te afetam.",
    placement: "bottom",
    optional: true,
    icon: "📋",
  },
  {
    id: "tambem-afetado",
    route: "/demandas",
    targetSelector: "[data-tour='tambem-afetado']",
    title: "Também sou afetado",
    description:
      "Quando uma demanda também afetar você, use esse recurso para ajudar a gestão a identificar prioridades coletivas.",
    placement: "top",
    optional: true,
    icon: "🤝",
  },
  {
    id: "propostas",
    route: "/propostas",
    targetSelector: "[data-tour='propostas']",
    title: "Propostas da comunidade",
    description:
      "Apresente ideias de melhoria e acompanhe propostas da comunidade. Propostas com mais apoios são priorizadas pela gestão.",
    placement: "bottom",
    optional: true,
    icon: "💡",
  },
  {
    id: "apoiar-proposta",
    route: "/propostas",
    targetSelector: "[data-tour='apoiar-proposta']",
    title: "Apoiar uma proposta",
    description:
      "Apoie propostas que você considera importantes para a universidade. O número de apoios influencia a priorização.",
    placement: "top",
    optional: true,
    icon: "👍",
  },
  {
    id: "protocolos",
    route: "/protocolo",
    targetSelector: "[data-tour='protocolos']",
    title: "Protocolo de acompanhamento",
    description:
      "Cada demanda recebe um número de protocolo único no formato VUNDF-YYYYMMDD-XXXX. Guarde-o para consultar o status a qualquer momento.",
    placement: "bottom",
    optional: true,
    icon: "🔖",
  },
  {
    id: "transparencia",
    route: "/transparencia",
    targetSelector: "[data-tour='transparencia']",
    title: "Transparência pública",
    description:
      "Acompanhe indicadores públicos: volume de demandas, distribuição por categoria e tendências mensais.",
    placement: "bottom",
    optional: true,
    icon: "📊",
  },
  {
    id: "acessibilidade",
    route: "/",
    targetSelector: "[data-tour='acessibilidade']",
    title: "Recursos de acessibilidade",
    description:
      "Use os recursos de Libras (VLibras), contraste, tamanho de texto, leitura e modo de foco. Todos disponíveis no painel de acessibilidade.",
    placement: "top",
    optional: true,
    icon: "♿",
  },
  {
    id: "libras",
    route: "/",
    targetSelector: "[data-tour='libras']",
    title: "Libras (VLibras)",
    description:
      "Ative a tradução em Língua Brasileira de Sinais clicando no widget VLibras. Disponível em todas as páginas.",
    placement: "left",
    optional: true,
    icon: "🤟",
  },
  {
    id: "ajuda",
    route: "/",
    targetSelector: "[data-tour='ajuda']",
    title: "Central de ajuda",
    description:
      "Encontre respostas para dúvidas frequentes e reabra este tour guiado a qualquer momento acessando a Central de ajuda.",
    placement: "bottom",
    optional: true,
    icon: "❓",
  },
];

// ── Popover positioning ───────────────────────────────────────────────────────

const POPOVER_WIDTH = 340;
const POPOVER_EST_HEIGHT = 260;
const GAP = 14;

function computePopoverStyle(
  rect: DOMRect | null,
  placement: TourStep["placement"],
): CSSProperties {
  if (!rect) {
    return {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: POPOVER_WIDTH,
      zIndex: 202,
    };
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left: number;
  let top: number;

  switch (placement) {
    case "bottom":
      top = rect.bottom + GAP;
      left = rect.left + rect.width / 2 - POPOVER_WIDTH / 2;
      break;
    case "top":
      top = rect.top - POPOVER_EST_HEIGHT - GAP;
      left = rect.left + rect.width / 2 - POPOVER_WIDTH / 2;
      break;
    case "left":
      left = rect.left - POPOVER_WIDTH - GAP;
      top = rect.top + rect.height / 2 - POPOVER_EST_HEIGHT / 2;
      break;
    case "right":
      left = rect.right + GAP;
      top = rect.top + rect.height / 2 - POPOVER_EST_HEIGHT / 2;
      break;
    default:
      top = rect.bottom + GAP;
      left = rect.left + rect.width / 2 - POPOVER_WIDTH / 2;
  }

  // Clamp to viewport
  left = Math.max(8, Math.min(left, vw - POPOVER_WIDTH - 8));
  top = Math.max(8, Math.min(top, vh - POPOVER_EST_HEIGHT - 8));

  return { position: "fixed", top, left, width: POPOVER_WIDTH, zIndex: 202 };
}

// ── Highlight helpers ─────────────────────────────────────────────────────────

function applyHighlight(el: HTMLElement) {
  el.setAttribute("data-tour-highlight", "true");
  const computed = window.getComputedStyle(el);
  if (computed.position === "static") el.style.position = "relative";
  el.style.zIndex = "201";
}

function removeAllHighlights() {
  document.querySelectorAll("[data-tour-highlight]").forEach((el) => {
    const h = el as HTMLElement;
    h.removeAttribute("data-tour-highlight");
    h.style.removeProperty("z-index");
    h.style.removeProperty("position");
  });
}

// ── Context ───────────────────────────────────────────────────────────────────

interface TourContextValue {
  openTour: () => void;
}

const TourContext = createContext<TourContextValue>({ openTour: () => {} });

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(TOUR_OPEN_EVENT, handler);

    try {
      const requested = localStorage.getItem("voz-undf:open-tour-next");
      if (requested === "true") {
        localStorage.removeItem("voz-undf:open-tour-next");
        setTimeout(() => setOpen(true), 300);
      }
    } catch {}

    return () => window.removeEventListener(TOUR_OPEN_EVENT, handler);
  }, []);

  return (
    <TourContext.Provider value={{ openTour: () => setOpen(true) }}>
      {children}
      <TourDialog open={open} setOpen={setOpen} />
    </TourContext.Provider>
  );
}

export function useTourContext() {
  return useContext(TourContext);
}

// ── Dialog with real element targeting ────────────────────────────────────────

function TourDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [, navigate] = useLocation();
  const closeRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const totalSteps = TOUR_STEPS.length;
  const current = TOUR_STEPS[step];
  const isLast = step === totalSteps - 1;

  const close = useCallback(
    (markComplete = true) => {
      if (markComplete) localStorage.setItem(TOUR_STORAGE_KEY, "true");
      removeAllHighlights();
      setOpen(false);
      setStep(0);
      setTargetRect(null);
    },
    [setOpen],
  );

  const skipToStep = useCallback(
    (target: number) => {
      removeAllHighlights();
      setTargetRect(null);
      if (target >= totalSteps) {
        close(true);
      } else {
        setStep(target);
      }
    },
    [totalSteps, close],
  );

  // Navigate + find element when step or open changes
  useEffect(() => {
    if (!open) return;

    removeAllHighlights();
    setTargetRect(null);

    // Navigate to the step's route
    navigate(current.route);

    let cancelled = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 30; // 30 × 100ms = 3s

    const findTarget = () => {
      if (cancelled) return;

      const el = document.querySelector(current.targetSelector) as HTMLElement | null;

      if (el) {
        el.scrollIntoView({ behavior: prefersReducedMotion ? "instant" : "smooth", block: "center" });
        applyHighlight(el);
        // Wait for scroll to settle before measuring
        setTimeout(() => {
          if (cancelled) return;
          setTargetRect(el.getBoundingClientRect());
          setTimeout(() => closeRef.current?.focus(), 80);
        }, prefersReducedMotion ? 0 : 350);
      } else if (attempts < MAX_ATTEMPTS) {
        attempts++;
        setTimeout(findTarget, 100);
      } else if (current.optional) {
        // Element not found: skip this step
        skipToStep(step + 1);
      } else {
        // Not optional: show as center modal
        setTargetRect(null);
        setTimeout(() => closeRef.current?.focus(), 80);
      }
    };

    // Small delay so route transition can render
    const t = setTimeout(findTarget, 120);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [step, open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update rect on scroll / resize
  useEffect(() => {
    if (!open || !targetRect) return;

    const update = () => {
      const el = document.querySelector(current.targetSelector) as HTMLElement | null;
      if (el) setTargetRect(el.getBoundingClientRect());
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [open, targetRect, current.targetSelector]);

  // Keyboard: Escape + arrows
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(false); }
      if (e.key === "ArrowRight") skipToStep(step + 1);
      if (e.key === "ArrowLeft") skipToStep(Math.max(step - 1, 0));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, close, step, skipToStep]);

  // Cleanup on unmount
  useEffect(() => () => removeAllHighlights(), []);

  const popoverStyle = computePopoverStyle(targetRect, current.placement);
  const hasTarget = targetRect !== null;

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 350, damping: 28 };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Dark overlay */}
          <motion.div
            key="tour-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
            className="fixed inset-0 bg-black/55 pointer-events-none"
            style={{ zIndex: 200 }}
            aria-hidden="true"
          />

          {/* Popover */}
          <motion.div
            key={`tour-step-${step}`}
            role="dialog"
            aria-modal="true"
            aria-label={`Tour guiado — etapa ${step + 1} de ${totalSteps}: ${current.title}`}
            initial={{ opacity: 0, scale: 0.94, y: hasTarget ? 0 : 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={transition}
            style={popoverStyle}
            className="bg-[#F2F0EB] border border-[#1B3469]/15 shadow-2xl pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#1B3469]/10">
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-[#1B3469]/50 shrink-0" aria-hidden="true" />
                <span className="text-xs uppercase tracking-widest text-[#1B3469]/50 font-semibold">
                  Tour · {step + 1}/{totalSteps}
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
            <div className="h-0.5 bg-[#1B3469]/10" aria-hidden="true">
              <div
                className="h-full bg-[#1B3469] transition-all duration-500"
                style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
              />
            </div>

            {/* Content */}
            <div
              className="px-6 py-6"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="text-3xl mb-3 select-none" role="img" aria-hidden="true">
                {current.icon}
              </div>
              <h2 className="text-lg font-bold text-[#1B3469] mb-2 leading-tight">
                {current.title}
              </h2>
              <p className="text-[#1B3469]/70 text-sm leading-relaxed">
                {current.description}
              </p>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-[#1B3469]/10 flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => close(true)}
                className="text-[#1B3469]/40 hover:text-[#1B3469] text-xs px-2"
              >
                Não mostrar novamente
              </Button>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => skipToStep(Math.max(step - 1, 0))}
                  disabled={step === 0}
                  className="border-[#1B3469]/20 text-[#1B3469] h-8 w-8 p-0"
                  aria-label="Etapa anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {isLast ? (
                  <Button
                    size="sm"
                    onClick={() => close(true)}
                    className="bg-[#1B3469] hover:bg-[#1B3469]/90 text-white px-4 h-8"
                  >
                    Concluir
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => skipToStep(step + 1)}
                    className="bg-[#1B3469] hover:bg-[#1B3469]/90 text-white px-4 h-8"
                    aria-label="Próxima etapa"
                  >
                    Próximo
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>

            {/* Dots */}
            <div
              className="pb-3 flex justify-center gap-1"
              role="tablist"
              aria-label="Progresso do tour"
            >
              {TOUR_STEPS.map((s, i) => (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={i === step}
                  aria-label={`Ir para etapa ${i + 1}`}
                  onClick={() => skipToStep(i)}
                  className={`h-1.5 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-[#1B3469] ${
                    i === step ? "bg-[#1B3469] w-4" : "bg-[#1B3469]/20 w-1.5"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── CSS for highlighted elements (injected via <style>) ───────────────────────

export function TourHighlightStyles() {
  return (
    <style>{`
      [data-tour-highlight="true"] {
        outline: 3px solid #1B3469 !important;
        outline-offset: 4px !important;
        border-radius: 2px;
        transition: outline 0.15s ease;
      }
    `}</style>
  );
}

// ── GuidedTour (entry point used in App.tsx AuthenticatedTour) ────────────────

interface GuidedTourProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export function GuidedTour({ forceOpen = false, onClose }: GuidedTourProps) {
  const { openTour } = useTourContext();

  useEffect(() => {
    if (forceOpen) {
      openTour();
      return undefined;
    }
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!completed) {
      const t = setTimeout(() => openTour(), 800);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [forceOpen, openTour]);

  useEffect(() => () => onClose?.(), [onClose]);

  return null;
}

// ── useTour hook ──────────────────────────────────────────────────────────────

export function useTour() {
  const { openTour } = useTourContext();

  const reopen = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    openTour();
  };

  const reset = () => localStorage.removeItem(TOUR_STORAGE_KEY);

  const isCompleted = () =>
    typeof window !== "undefined" && !!localStorage.getItem(TOUR_STORAGE_KEY);

  return { reopen, reset, isCompleted, openTour };
}

// Re-export TOUR_STEPS for tests
export { TOUR_STEPS };
