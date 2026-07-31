import { useState } from "react";
import {
  Search, Loader2, ShieldCheck, Clock, XCircle, Copy, CheckCircle2, AlertTriangle,
} from "lucide-react";
import {
  useGetDemandByProtocol,
  useGetDemandStatusHistory,
  getGetDemandByProtocolQueryKey,
  getGetDemandStatusHistoryQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HelpTooltip } from "@/components/HelpTooltip";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<string, string> = {
  received: "Recebida",
  in_analysis: "Em Análise",
  processing: "Em Execução",
  awaiting_info: "Aguardando Informações",
  completed: "Concluída",
  rejected: "Não Aprovada",
  archived: "Arquivada",
  escalated: "Escalada",
};

const STATUS_DOTS: Record<string, string> = {
  received: "bg-blue-500",
  in_analysis: "bg-amber-500",
  processing: "bg-purple-500",
  awaiting_info: "bg-orange-500",
  completed: "bg-[#5B9A6E]",
  rejected: "bg-red-400",
  archived: "bg-foreground/20",
  escalated: "bg-red-500",
};

/** Valida o formato VUNDF-YYYYMMDD-XXXX (case-insensitive) */
function isValidProtocolFormat(value: string): boolean {
  return /^VUNDF-\d{8}-\d{4}$/i.test(value.trim());
}

function normalizeProtocol(value: string): string {
  return value.trim().toUpperCase();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProtocolLookup() {
  const initialProtocol = new URLSearchParams(window.location.search).get("q") || "";
  const [searchInput, setSearchInput] = useState(initialProtocol);
  const [activeProtocol, setActiveProtocol] = useState(
    initialProtocol ? normalizeProtocol(initialProtocol) : "",
  );
  const [formatError, setFormatError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: demand, isLoading: loadingDemand, isError } = useGetDemandByProtocol(
    activeProtocol,
    {
      query: {
        enabled: activeProtocol.length > 0,
        queryKey: getGetDemandByProtocolQueryKey(activeProtocol),
        retry: false,
      },
    },
  );

  const { data: history, isLoading: loadingHistory } = useGetDemandStatusHistory(
    demand?.id || 0,
    {
      query: {
        enabled: !!demand?.id,
        queryKey: getGetDemandStatusHistoryQueryKey(demand?.id || 0),
      },
    },
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFormatError(null);
    const normalized = normalizeProtocol(searchInput);

    if (!normalized) {
      setFormatError("Digite o número do protocolo.");
      return;
    }

    if (!isValidProtocolFormat(normalized)) {
      setFormatError(
        "Formato inválido. Use o padrão VUNDF-YYYYMMDD-XXXX (ex: VUNDF-20260726-4821).",
      );
      return;
    }

    setActiveProtocol(normalized);
    window.history.replaceState({}, "", `/protocolo?q=${normalized}`);
  };

  const copyProtocol = (protocol: string) => {
    navigator.clipboard.writeText(protocol);
    setCopied(true);
    toast.success("Protocolo copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Header + search */}
      <div className="px-6 md:px-12 pt-16 pb-16 border-b border-border">
        <span className="text-xs tracking-widest uppercase text-secondary font-semibold">consulta</span>
        <h1 className="text-[clamp(2.4rem,5vw,4.5rem)] font-bold leading-[0.95] tracking-tight text-foreground mt-3 mb-2">
          protocolo.
        </h1>
        <div className="flex items-center gap-2 mb-8" data-tour="protocolos">
          <p className="text-muted-foreground text-sm">
            Formato: <code className="font-mono text-foreground/70">VUNDF-AAAAMMDD-XXXX</code>
          </p>
          <HelpTooltip
            text="O número de protocolo é gerado automaticamente após o registro da demanda. Exemplo: VUNDF-20260726-4821"
            title="Número de protocolo"
          />
        </div>

        <form onSubmit={handleSearch} className="flex gap-0 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setFormatError(null);
              }}
              placeholder="Ex: VUNDF-20260726-4821"
              className="pl-11 h-12 text-base font-mono bg-card border-border border-r-0 focus-visible:ring-0 uppercase"
              aria-label="Número do protocolo"
              aria-describedby={formatError ? "protocol-error" : undefined}
            />
          </div>
          <Button
            type="submit"
            className="h-12 px-8 bg-primary hover:bg-primary/90 text-white shrink-0"
          >
            Consultar
          </Button>
        </form>

        {formatError && (
          <p id="protocol-error" className="text-xs text-destructive mt-2 pl-1 flex items-center gap-1.5" role="alert">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            {formatError}
          </p>
        )}
      </div>

      {/* Results */}
      <div className="px-6 md:px-12 py-12">
        {activeProtocol && (
          loadingDemand ? (
            <div className="flex items-center justify-center py-24 gap-3" role="status" aria-label="Consultando protocolo">
              <Loader2 className="w-6 h-6 animate-spin text-primary/40" aria-hidden="true" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Consultando protocolo</span>
            </div>
          ) : isError || !demand ? (
            <div className="border border-destructive/20 bg-destructive/5 p-10 text-center max-w-md">
              <XCircle className="w-10 h-10 text-destructive/50 mx-auto mb-4" aria-hidden="true" />
              <h3 className="font-bold text-foreground mb-2">Protocolo não encontrado</h3>
              <p className="text-sm text-muted-foreground">
                Não encontramos uma manifestação com o protocolo{" "}
                <code className="font-mono font-bold">{activeProtocol}</code>. Confira o número e tente novamente.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 border-border"
                onClick={() => {
                  setSearchInput("");
                  setActiveProtocol("");
                  window.history.replaceState({}, "", "/protocolo");
                }}
              >
                Limpar busca
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-4xl"
            >
              {/* Main info */}
              <div className="md:col-span-7 space-y-6">
                {/* Protocol header */}
                <div className="border border-border p-6 bg-card">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">
                        Protocolo
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="text-2xl font-mono font-bold text-foreground">
                          {demand.protocol}
                        </code>
                        <button
                          onClick={() => copyProtocol(demand.protocol)}
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-primary rounded"
                          aria-label="Copiar protocolo"
                        >
                          {copied ? (
                            <CheckCircle2 className="w-4 h-4 text-[#5B9A6E]" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className={`w-2 h-2 rounded-full ${STATUS_DOTS[demand.status] ?? "bg-gray-400"}`} aria-hidden="true" />
                      <span className="text-sm font-semibold text-foreground">
                        {STATUS_LABELS[demand.status] ?? demand.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Tipo</p>
                      <p className="text-foreground capitalize">{demand.type}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Categoria</p>
                      <p className="text-foreground">{demand.category}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Registrada em</p>
                      <p className="text-foreground">
                        {format(new Date(demand.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Atualizada em</p>
                      <p className="text-foreground">
                        {format(new Date(demand.updatedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    {demand.targetUnit && (
                      <div className="col-span-2">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Setor responsável</p>
                        <p className="text-foreground">{demand.targetUnit}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                {demand.content && (
                  <div className="border border-border p-6 bg-card">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Descrição</p>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {demand.content}
                    </p>
                  </div>
                )}

                {/* Mídia */}
                {demand.type === "audio" && demand.mediaUrl && (
                  <div className="border border-border p-6 bg-card">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Áudio</p>
                    <audio controls src={demand.mediaUrl} className="w-full" />
                  </div>
                )}
                {demand.type === "image" && demand.mediaUrl && (
                  <div className="border border-border p-6 bg-card">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Imagem</p>
                    <img src={demand.mediaUrl} alt="Imagem da demanda" className="max-h-96 object-contain rounded" />
                  </div>
                )}
                {demand.type === "video" && demand.mediaUrl && (
                  <div className="border border-border p-6 bg-card">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Vídeo</p>
                    <video controls src={demand.mediaUrl} className="w-full rounded" />
                  </div>
                )}

                {/* Admin response */}
                {demand.adminResponse && (
                  <div className="border border-[#5B9A6E]/30 bg-[#5B9A6E]/5 p-6">
                    <p className="text-xs uppercase tracking-wider text-[#5B9A6E] font-semibold mb-2">
                      Resposta institucional
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">{demand.adminResponse}</p>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="md:col-span-5">
                <div className="border border-border p-6 bg-card">
                  <div className="flex items-center gap-2 mb-5">
                    <Clock className="w-4 h-4 text-secondary" aria-hidden="true" />
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                      Histórico de Tramitação
                    </h3>
                  </div>

                  {loadingHistory ? (
                    <div className="flex items-center gap-2" role="status">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Carregando histórico…</span>
                    </div>
                  ) : history && history.length > 0 ? (
                    <div className="space-y-0">
                      {history.map((entry, i) => (
                        <div key={entry.id} className="flex gap-4">
                          <div className="flex flex-col items-center pt-1">
                            <div
                              className={`w-3 h-3 rounded-full shrink-0 ${i === 0 ? "bg-primary" : "bg-border"} border-2 border-background`}
                              aria-hidden="true"
                            />
                            {i < history.length - 1 && (
                              <div className="w-px flex-1 bg-border mt-1" aria-hidden="true" />
                            )}
                          </div>
                          <div className={`pb-6 flex-1 ${i === history.length - 1 ? "pb-0" : ""}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-sm text-foreground">
                                {STATUS_LABELS[entry.newStatus] || entry.newStatus}
                              </span>
                              <time className="text-xs text-muted-foreground tabular-nums" dateTime={entry.createdAt}>
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
                    <p className="text-sm text-muted-foreground">
                      Nenhuma movimentação além da abertura.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )
        )}

        {!activeProtocol && (
          <div className="py-24 text-center text-muted-foreground/40" aria-label="Aguardando protocolo">
            <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-30" aria-hidden="true" />
            <p className="text-xs uppercase tracking-widest">Digite o número do protocolo para consultar</p>
            <p className="text-xs mt-2 opacity-60">Ex: VUNDF-20260726-4821</p>
          </div>
        )}
      </div>
    </div>
  );
}
