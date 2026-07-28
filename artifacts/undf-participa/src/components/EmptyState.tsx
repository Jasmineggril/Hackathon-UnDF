/**
 * Estado vazio reutilizável — acolhedor e orientado à ação.
 */

import { type ReactNode } from "react";
import { Mascote } from "./Mascote";

interface EmptyStateProps {
  /** Ícone emoji ou ReactNode */
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  /** Exibe o Vozinho */
  withMascote?: boolean;
  mascoteMessage?: string;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  withMascote,
  mascoteMessage,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className ?? ""}`}
      role="status"
      aria-label={title}
    >
      {withMascote ? (
        <div className="mb-6">
          <Mascote
            message={mascoteMessage}
            size="md"
            static
          />
        </div>
      ) : icon ? (
        <div className="text-5xl mb-4 select-none" aria-hidden="true">
          {icon}
        </div>
      ) : null}

      <h3 className="text-base font-bold text-[#1B3469] mb-2">{title}</h3>

      {description && (
        <p className="text-sm text-[#1B3469]/60 max-w-sm leading-relaxed mb-6">
          {description}
        </p>
      )}

      {action && <div>{action}</div>}
    </div>
  );
}
