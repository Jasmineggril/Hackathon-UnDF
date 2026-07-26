import { useState } from "react";
import { Search, Loader2, ShieldCheck, Clock, ArrowRight, XCircle } from "lucide-react";
import { useGetDemandByProtocol, useGetDemandStatusHistory, getGetDemandByProtocolQueryKey, getGetDemandStatusHistoryQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

const STATUS_LABELS: Record<string, string> = {
  received: "Recebida", processing: "Em Análise",
  completed: "Resolvida", archived: "Arquivada",
};
const STATUS_DOTS: Record<string, string> = {
  received: "bg-blue-500", processing: "bg-amber-500",
  completed: "bg-[#5B9A6E]", archived: "bg-foreground/20",
};

export default function ProtocolLookup() {
  const initialProtocol = new URLSearchParams(window.location.search).get("q") || "";
  const [searchInput, setSearchInput] = useState(initialProtocol);
  const [activeProtocol, setActiveProtocol] = useState(initialProtocol);

  const { data: demand, isLoading: loadingDemand, isError } = useGetDemandByProtocol(activeProtocol, {
    query: { enabled: activeProtocol.length >= 8, queryKey: getGetDemandByProtocolQueryKey(activeProtocol) }
  });
  const { data: history, isLoading: loadingHistory } = useGetDemandStatusHistory(demand?.id || 0, {
    query: { enabled: !!demand?.id, queryKey: getGetDemandStatusHistoryQueryKey(demand?.id || 0) }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    if (q.length >= 8) {
      setActiveProtocol(q);
      window.history.replaceState({}, "", `/protocolo?q=${q}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Header + search */}
      <div className="px-6 md:px-12 pt-16 pb-16 border-b border-border">
        <span className="text-xs tracking-widest uppercase text-secondary font-semibold">consulta</span>
        <h1 className="text-[clamp(2.4rem,5vw,4.5rem)] font-bold leading-[0.95] tracking-tight text-foreground mt-3 mb-8">
          protocolo.
        </h1>

        <form onSubmit={handleSearch} className="flex gap-0 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Ex: DEM-2023-A1B2C3D4"
              className="pl-11 h-12 text-base font-mono bg-card border-border border-r-0 focus-visible:ring-0"
            />
          </div>
          <Button
            type="submit"
            disabled={searchInput.trim().length < 8}
            className="h-12 px-8 bg-primary hover:bg-primary/90 text-white shrink-0"
          >
            Buscar
          </Button>
        </form>
        {searchInput.length > 0 && searchInput.trim().length < 8 && (
          <p className="text-xs text-muted-foreground mt-2 pl-1">Mínimo de 8 caracteres.</p>
        )}
      </div>

      {/* Results */}
      <div className="px-6 md:px-12 py-12">
        {activeProtocol.length >= 8 && (
          loadingDemand ? (
            <div className="flex items-center justify-center py-24 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Consultando protocolo</span>
            </div>
          ) : isError ? (
            <div className="border border-destructive/20 bg-destructive/5 p-10 text-center max-w-md">
              <XCircle className="w-10 h-10 text-destructive/50 mx-auto mb-4" />
              <h3 className="font-bold text-foreground mb-2">Protocolo não encontrado</h3>
              <p className="text-sm text-muted-foreground">Verifique o código digitado e tente novamente.</p>
            </div>
          ) : demand && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl space-y-0"
            >
              {/* Summary card */}
              <div className="border border-border">
                {/* Header bar */}
                <div className="bg-primary px-6 py-4 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-white/50 block mb-1">Protocolo</span>
                    <span className="font-mono font-bold text-white text-lg tracking-wider">{demand.protocol}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs uppercase tracking-widest text-white/50 block mb-1">Status Atual</span>
                    <span className="flex items-center gap-2 justify-end">
                      <span className={`w-2 h-2 rounded-full ${STATUS_DOTS[demand.status] || "bg-white/30"}`} />
                      <span className="font-bold text-white text-sm">{STATUS_LABELS[demand.status] || demand.status}</span>
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Categoria</p>
                      <p className="text-sm font-semibold text-foreground">{demand.category}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Abertura</p>
                      <p className="text-sm font-semibold text-foreground">
                        {format(new Date(demand.createdAt), "dd/MM/yyyy 'às' HH:mm")}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Descrição</p>
                    <p className="text-sm text-foreground/80 leading-relaxed bg-muted p-4 border-l-2 border-secondary">
                      {demand.content || "Sem descrição textual."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="border border-border border-t-0 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="w-4 h-4 text-secondary" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Histórico de Tramitação</h3>
                </div>

                {loadingHistory ? (
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                ) : history && history.length > 0 ? (
                  <div className="space-y-0">
                    {history.map((entry, i) => (
                      <div key={entry.id} className="flex gap-4">
                        {/* timeline line */}
                        <div className="flex flex-col items-center pt-1">
                          <div className={`w-3 h-3 rounded-full shrink-0 ${i === 0 ? "bg-primary" : "bg-border"} border-2 border-background`} />
                          {i < history.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                        </div>
                        {/* content */}
                        <div className={`pb-6 flex-1 ${i === history.length - 1 ? "pb-0" : ""}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm text-foreground">{STATUS_LABELS[entry.newStatus] || entry.newStatus}</span>
                            <time className="text-xs text-muted-foreground tabular-nums">
                              {format(new Date(entry.createdAt), "dd/MM/yy HH:mm")}
                            </time>
                          </div>
                          {entry.adminResponse && (
                            <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-secondary/40 pl-3 mt-2">
                              {entry.adminResponse}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma movimentação além da abertura.</p>
                )}
              </div>
            </motion.div>
          )
        )}

        {!activeProtocol && (
          <div className="py-24 text-center text-muted-foreground/40">
            <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-xs uppercase tracking-widest">Digite o número do protocolo para consultar</p>
          </div>
        )}
      </div>
    </div>
  );
}
