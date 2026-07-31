import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Filter, Megaphone, CheckCircle2, XCircle, Clock, ThumbsUp, Loader2, Plus, Search } from "lucide-react";
import { useListProposals, useToggleProposalSupport, getListProposalsQueryKey } from "@workspace/api-client-react";
import { ProposalStatus, ListProposalsSort } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@workspace/auth-web";
import { useUserSupportedProposalIds } from "@/hooks/use-user-data";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_CONFIG: Record<ProposalStatus, { label: string; dot: string }> = {
  open:         { label: "Aberta",       dot: "bg-blue-500" },
  under_review: { label: "Em Avaliação", dot: "bg-amber-500" },
  approved:     { label: "Aprovada",     dot: "bg-[#5B9A6E]" },
  rejected:     { label: "Rejeitada",    dot: "bg-red-500" },
  implemented:  { label: "Implementada", dot: "bg-emerald-600" },
};

export default function Proposals() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState<ProposalStatus | undefined>();
  const [sort, setSort] = useState<ListProposalsSort>("createdAt");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useListProposals({ page, limit: 12, status, sort });
  const toggleSupport = useToggleProposalSupport();

  // IDs de propostas já apoiadas pelo usuário (para feedback visual)
  const { data: supportedData } = useUserSupportedProposalIds(isAuthenticated);
  const [localSupported, setLocalSupported] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (supportedData?.ids) {
      setLocalSupported(new Set(supportedData.ids));
    }
  }, [supportedData]);

  const handleSupport = async (id: number) => {
    if (!isAuthenticated) { window.location.href = "/login"; return; }

    // Optimistic update
    const wasSupported = localSupported.has(id);
    setLocalSupported((prev) => {
      const next = new Set(prev);
      wasSupported ? next.delete(id) : next.add(id);
      return next;
    });

    try {
      await toggleSupport.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListProposalsQueryKey() });
      queryClient.invalidateQueries({ queryKey: ["/api/user/supported-proposals"] });
      toast.success(wasSupported ? "Apoio removido." : "Proposta apoiada com sucesso!");
    } catch {
      // Reverte optimistic update em caso de erro
      setLocalSupported((prev) => {
        const next = new Set(prev);
        wasSupported ? next.add(id) : next.delete(id);
        return next;
      });
      toast.error("Erro ao registrar apoio. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Page header */}
      <div className="px-6 md:px-12 pt-16 pb-12 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <span className="text-xs tracking-widest uppercase text-secondary font-semibold">iniciativas</span>
            <h1 className="text-[clamp(2.4rem,5vw,4.5rem)] font-bold leading-[0.95] tracking-tight text-foreground mt-3">
              propostas.
            </h1>
            <p className="text-muted-foreground mt-4 max-w-sm text-sm leading-relaxed">
              Ideias e projetos estruturados aguardando avaliação e aprovação institucional.
            </p>
          </div>
          <Link href="/propostas/nova">
            <Button data-tour="propostas" className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 px-6 py-5">
              <Plus className="w-4 h-4" /> Nova Proposta
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 md:px-12 py-5 border-b border-border flex flex-wrap items-center gap-4">
        <span className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Filter className="w-3 h-3" /> Filtrar
        </span>
        <Select value={status || "all"} onValueChange={(v) => { setStatus(v === "all" ? undefined : v as ProposalStatus); setPage(1); }}>
          <SelectTrigger className="w-48 border-border bg-transparent text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="open">Aberta para Apoio</SelectItem>
            <SelectItem value="under_review">Em Avaliação</SelectItem>
            <SelectItem value="approved">Aprovada</SelectItem>
            <SelectItem value="implemented">Implementada</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => { setSort(v as ListProposalsSort); setPage(1); }}>
          <SelectTrigger className="w-44 border-border bg-transparent text-sm">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Mais recentes</SelectItem>
            <SelectItem value="supportCount">Mais apoiadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      <div className="px-6 md:px-12 py-10">
        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
          </div>
        ) : data?.data.length === 0 ? (
          <div className="py-32 text-center border border-dashed border-border">
            <p className="text-muted-foreground text-sm mb-4">Nenhuma proposta encontrada.</p>
            <Button variant="outline" onClick={() => { setStatus(undefined); setSort("createdAt"); }}>
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
            {data?.data.map((proposal) => {
              const sc = STATUS_CONFIG[proposal.status];
              const canSupport = proposal.status === "open";
              const isSupported = localSupported.has(proposal.id);
              return (
                <div
                  key={proposal.id}
                  className="bg-background p-8 flex flex-col group hover:bg-primary transition-colors duration-300 relative"
                >
                  {/* top meta */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground group-hover:text-white/50 transition-colors font-medium">
                      {proposal.category}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-white/50 transition-colors">
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                  </div>

                  {/* title */}
                  <h3 className="text-base font-bold text-foreground group-hover:text-white transition-colors mb-3 leading-snug">
                    {proposal.title}
                  </h3>

                  {/* description */}
                  <p className="text-sm text-muted-foreground group-hover:text-white/65 transition-colors leading-relaxed line-clamp-3 flex-1 mb-5">
                    {proposal.description}
                  </p>

                  {/* admin decision */}
                  {proposal.adminDecision && (
                    <div className="border-l-2 border-secondary group-hover:border-white/30 pl-3 mb-5 transition-colors">
                      <span className="text-xs uppercase tracking-wider text-secondary group-hover:text-white/50 transition-colors block mb-1 font-semibold">
                        Resposta Institucional
                      </span>
                      <p className="text-xs text-muted-foreground group-hover:text-white/60 transition-colors line-clamp-2">
                        {proposal.adminDecision}
                      </p>
                    </div>
                  )}

                  {/* support */}
                  <button
                    data-tour={proposal.id === data?.data[0]?.id ? "apoiar-proposta" : undefined}
                    onClick={() => canSupport && handleSupport(proposal.id)}
                    disabled={!canSupport || toggleSupport.isPending}
                    className={`flex items-center justify-between w-full border px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      !canSupport
                        ? "border-border/40 text-muted-foreground/40 cursor-not-allowed group-hover:border-white/15 group-hover:text-white/30"
                        : isSupported
                          ? "border-primary/60 text-primary bg-primary/5 group-hover:border-white/40 group-hover:text-white group-hover:bg-white/10"
                          : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary group-hover:border-white/30 group-hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {toggleSupport.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ThumbsUp className={`w-3.5 h-3.5 ${isSupported ? "fill-current" : ""}`} />
                      )}
                      {!canSupport
                        ? "Encerrada para apoios"
                        : isSupported
                          ? "Apoio registrado ✓"
                          : "Apoiar proposta"}
                    </span>
                    <span className="tabular-nums">{proposal.supportCount}</span>
                  </button>

                  {/* Ver detalhes */}
                  <Link
                    href={`/propostas/${proposal.id}`}
                    className="mt-3 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-white/60 transition-colors hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Ver detalhes <Search className="w-3 h-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
            <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Anterior</Button>
            <span className="text-sm text-muted-foreground tabular-nums">{page} / {data.totalPages}</span>
            <Button variant="outline" disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)}>Próxima →</Button>
          </div>
        )}
      </div>
    </div>
  );
}
