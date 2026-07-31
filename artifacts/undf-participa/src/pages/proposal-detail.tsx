import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, ThumbsUp, Building2, Loader2, ArrowLeft, XCircle } from "lucide-react";
import { useToggleProposalSupport } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@workspace/auth-web";
import { useProposalById } from "@/hooks/use-user-data";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  open:         { label: "Aberta para Apoio",  color: "bg-blue-100 text-blue-700" },
  under_review: { label: "Em Avaliação",       color: "bg-amber-100 text-amber-700" },
  approved:     { label: "Aprovada",           color: "bg-green-100 text-green-700" },
  rejected:     { label: "Não Aprovada",       color: "bg-red-100 text-red-700" },
  implemented:  { label: "Implementada",       color: "bg-emerald-100 text-emerald-700" },
};

export default function ProposalDetail() {
  const { id } = useParams<{ id: string }>();
  const proposalId = parseInt(id ?? "", 10);
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: proposal, isLoading, isError } = useProposalById(
    isNaN(proposalId) ? null : proposalId,
  );

  const toggleSupport = useToggleProposalSupport();

  const handleSupport = async () => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    if (!proposal || proposal.status !== "open") return;
    try {
      await toggleSupport.mutateAsync({ id: proposal.id });
      queryClient.invalidateQueries({ queryKey: ["/api/proposals", proposalId] });
      toast.success("Apoio registrado!");
    } catch {
      toast.error("Erro ao registrar apoio.");
    }
  };

  if (isNaN(proposalId)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-6 text-center">
        <XCircle className="w-12 h-12 text-destructive/50" />
        <h2 className="text-lg font-bold">ID inválido</h2>
        <Link href="/propostas"><Button variant="outline">← Voltar às propostas</Button></Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
      </div>
    );
  }

  if (isError || !proposal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-6 text-center">
        <XCircle className="w-12 h-12 text-destructive/50" />
        <h2 className="text-lg font-bold">Proposta não encontrada</h2>
        <Link href="/propostas"><Button variant="outline">← Voltar às propostas</Button></Link>
      </div>
    );
  }

  const sc = STATUS_CONFIG[proposal.status] ?? { label: proposal.status, color: "bg-gray-100 text-gray-600" };
  const canSupport = proposal.status === "open";

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="px-6 md:px-12 pt-8 pb-0">
        <Link href="/propostas">
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest font-medium">
            <ArrowLeft className="w-3.5 h-3.5" /> Propostas
          </button>
        </Link>
      </div>

      {/* Header */}
      <div className="px-6 md:px-12 pt-8 pb-10 border-b border-border">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${sc.color}`}>
            {sc.label}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
            {proposal.category}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight mb-4">
          {proposal.title}
        </h1>
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Registrada em {format(new Date(proposal.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </span>
          {proposal.targetUnit && (
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              {proposal.targetUnit}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 md:px-12 py-10 max-w-3xl space-y-6">
        {/* Descrição */}
        <div className="border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
            Descrição
          </p>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {proposal.description}
          </p>
        </div>

        {/* Resposta institucional */}
        {proposal.adminDecision && (
          <div className="border border-[#5B9A6E]/30 bg-[#5B9A6E]/5 p-6">
            <p className="text-xs uppercase tracking-wider text-[#5B9A6E] font-semibold mb-2">
              Decisão Institucional
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              {proposal.adminDecision}
            </p>
          </div>
        )}

        {/* Apoio */}
        <button
          onClick={handleSupport}
          disabled={!canSupport || toggleSupport.isPending}
          className={`flex items-center justify-between w-full border px-5 py-3.5 text-sm font-semibold uppercase tracking-wider transition-colors ${
            !canSupport
              ? "border-border/40 text-muted-foreground/40 cursor-not-allowed"
              : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
          }`}
        >
          <span className="flex items-center gap-2">
            <ThumbsUp className="w-4 h-4" />
            {canSupport ? "Apoiar esta proposta" : "Encerrada para apoios"}
          </span>
          <span className="tabular-nums">{proposal.supportCount} apoios</span>
        </button>

        {/* Meta */}
        <div className="text-xs text-muted-foreground border-t border-border pt-4">
          Última atualização: {format(new Date(proposal.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </div>
      </div>
    </div>
  );
}
