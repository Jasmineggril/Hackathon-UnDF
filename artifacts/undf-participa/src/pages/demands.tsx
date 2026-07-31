import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Filter, Clock, ThumbsUp, Building2, MapPin, Loader2, ArrowRight, Plus } from "lucide-react";
import { useListDemands, useToggleDemandSupport, getListDemandsQueryKey } from "@workspace/api-client-react";
import { DemandStatus, ListDemandsSort } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@workspace/auth-web";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_CONFIG: Record<DemandStatus, { label: string; dot: string }> = {
  received:     { label: "Recebida",         dot: "bg-blue-500" },
  in_analysis:  { label: "Em Análise",        dot: "bg-amber-500" },
  processing:   { label: "Em Execução",       dot: "bg-purple-500" },
  awaiting_info: { label: "Aguardando Info",  dot: "bg-orange-500" },
  completed:    { label: "Resolvida",         dot: "bg-[#5B9A6E]" },
  rejected:     { label: "Não Aprovada",      dot: "bg-red-500" },
  escalated:    { label: "Escalada",          dot: "bg-red-500" },
  archived:     { label: "Arquivada",         dot: "bg-foreground/30" },
};

export default function Demands() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState<DemandStatus | undefined>();
  const [sort, setSort] = useState<ListDemandsSort>("createdAt");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useListDemands({ page, limit: 12, status, sort });
  const toggleSupport = useToggleDemandSupport();

  const handleSupport = async (id: number) => {
    if (!isAuthenticated) { window.location.href = "/login"; return; }
    await toggleSupport.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListDemandsQueryKey() });
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Page header */}
      <div className="px-6 md:px-12 pt-16 pb-12 border-b border-border" data-tour="demandas-publicas">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <span className="text-xs tracking-widest uppercase text-secondary font-semibold">comunidade</span>
            <h1 className="text-[clamp(2.4rem,5vw,4.5rem)] font-bold leading-[0.95] tracking-tight text-foreground mt-3">
              demandas.
            </h1>
            <p className="text-muted-foreground mt-4 max-w-sm text-sm leading-relaxed">
              Acompanhe as solicitações em andamento na UnDF. Apoie o que também te afeta.
            </p>
          </div>
          <Link href="/demandas/nova">
            <Button data-tour="nova-demanda" className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 px-6 py-5">
              <Plus className="w-4 h-4" /> Registrar Demanda
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 md:px-12 py-5 border-b border-border flex flex-wrap items-center gap-4">
        <span className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Filter className="w-3 h-3" /> Filtrar
        </span>
        <Select value={status || "all"} onValueChange={(v) => { setStatus(v === "all" ? undefined : v as DemandStatus); setPage(1); }}>
          <SelectTrigger className="w-44 border-border bg-transparent text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="received">Recebida</SelectItem>
          <SelectItem value="in_analysis">Em Análise</SelectItem>
          <SelectItem value="processing">Em Execução</SelectItem>
          <SelectItem value="awaiting_info">Aguardando Info</SelectItem>
          <SelectItem value="completed">Resolvida</SelectItem>
          <SelectItem value="rejected">Não Aprovada</SelectItem>
          <SelectItem value="escalated">Escalada</SelectItem>
          <SelectItem value="archived">Arquivada</SelectItem>
        </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => { setSort(v as ListDemandsSort); setPage(1); }}>
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
        ) : isError ? (
          <div className="py-32 text-center border border-dashed border-red-200 rounded-xl bg-red-50">
            <p className="text-red-700 text-lg font-semibold mb-3">Erro ao carregar demandas</p>
            <p className="text-sm text-red-600 mb-6">
              {error instanceof Error ? error.message : "Ocorreu um problema ao buscar as demandas."}
            </p>
            <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: getListDemandsQueryKey() })}>
              Tentar novamente
            </Button>
          </div>
        ) : data?.data.length === 0 ? (
          <div className="py-32 text-center border border-dashed border-border">
            <p className="text-muted-foreground text-sm mb-4">Nenhuma demanda encontrada.</p>
            <Button variant="outline" onClick={() => { setStatus(undefined); setSort("createdAt"); }}>
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {data?.data.map((demand) => {
              const sc = STATUS_CONFIG[demand.status];
              const supported = (demand as any).userSupported;
              return (
                <Link key={demand.id} href={`/demandas/${demand.id}`} className="bg-background flex flex-col p-7 group hover:bg-primary transition-colors duration-300 cursor-pointer">
                  {/* top meta */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground group-hover:text-white/50 transition-colors font-medium">
                      {demand.category}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-white/50 transition-colors">
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                  </div>

                  {/* content */}
                  <p className="text-sm font-semibold text-foreground group-hover:text-white transition-colors leading-relaxed line-clamp-3 flex-1 mb-5">
                    {demand.content?.substring(0, 120) || "Demanda sem descrição textual"}
                    {demand.content && demand.content.length > 120 ? "…" : ""}
                  </p>

                  {/* metadata */}
                  <div className="space-y-1.5 mb-6 text-xs text-muted-foreground group-hover:text-white/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      {format(new Date(demand.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR })}
                    </div>
                    {demand.targetUnit && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{demand.targetUnit}</span>
                      </div>
                    )}
                    {demand.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{demand.address}</span>
                      </div>
                    )}
                  </div>

                  {/* support button — stopPropagation para não navegar ao clicar */}
                  <button
                    data-tour={demand.id === data?.data[0]?.id ? "tambem-afetado" : undefined}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSupport(demand.id); }}
                    disabled={toggleSupport.isPending}
                    className={`flex items-center justify-between w-full border px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      supported
                        ? "border-secondary bg-secondary/10 text-secondary group-hover:border-white/30 group-hover:bg-white/10 group-hover:text-white"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary group-hover:border-white/30 group-hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <ThumbsUp className={`w-3.5 h-3.5 ${supported ? "fill-current" : ""}`} />
                      Também sou afetado
                    </span>
                    <span className="tabular-nums">{demand.supportCount}</span>
                  </button>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
            <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              ← Anterior
            </Button>
            <span className="text-sm text-muted-foreground tabular-nums">
              {page} / {data.totalPages}
            </span>
            <Button variant="outline" disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)}>
              Próxima →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
