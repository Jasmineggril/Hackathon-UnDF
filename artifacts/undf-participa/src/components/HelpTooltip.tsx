/**
 * Ajuda contextual — botão com tooltip ou popover para explicações breves.
 *
 * - Para textos curtos (< 100 chars): usa Tooltip do Radix
 * - Para textos maiores: usa Popover acessível
 * - Navegável por teclado, foco visível, ARIA adequado
 */

import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HelpTooltipProps {
  /** Texto de ajuda */
  text: string;
  /** Título do popover (para textos longos) */
  title?: string;
  /** Forçar popover mesmo para texto curto */
  forcePopover?: boolean;
  className?: string;
  /** Tamanho do ícone */
  size?: "sm" | "md";
}

const TOOLTIP_THRESHOLD = 100;

export function HelpTooltip({
  text,
  title,
  forcePopover = false,
  className,
  size = "sm",
}: HelpTooltipProps) {
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const usePopover = forcePopover || text.length > TOOLTIP_THRESHOLD || !!title;

  if (usePopover) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center justify-center text-[#1B3469]/30 hover:text-[#1B3469]/70 transition-colors focus-visible:outline-2 focus-visible:outline-[#1B3469] rounded ${className ?? ""}`}
            aria-label={`Ajuda: ${title || text.slice(0, 40)}`}
          >
            <HelpCircle className={iconSize} aria-hidden="true" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="max-w-xs text-sm text-[#1B3469]/80 bg-[#F2F0EB] border-[#1B3469]/10 shadow-lg"
          side="top"
        >
          {title && (
            <p className="font-semibold text-[#1B3469] mb-1 text-xs uppercase tracking-wide">
              {title}
            </p>
          )}
          <p className="leading-relaxed">{text}</p>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center justify-center text-[#1B3469]/30 hover:text-[#1B3469]/70 transition-colors focus-visible:outline-2 focus-visible:outline-[#1B3469] rounded ${className ?? ""}`}
          aria-label={`Ajuda: ${text}`}
        >
          <HelpCircle className={iconSize} aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-[240px] text-xs bg-[#1B3469] text-white border-0"
      >
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
