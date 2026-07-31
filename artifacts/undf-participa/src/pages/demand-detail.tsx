import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Clock, ThumbsUp, Building2, MapPin, Loader2, ArrowLeft, Copy,
  CheckCircle2, XCircle, Mic, Image as ImageIcon,
} from "lucide-react";
import {
  useGetDemandStatusHistory,
  useToggleDemandSupport,
  getGetDemandStatusHistoryQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@workspace/auth-web";
import { useDemandById } from "@/hooks/use-user-data";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

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

const STATUS_COLORS: Record<string, string> = {
  received: "bg-blue-100 text-blue-700",
  in_analysis: "bg-amber-100 text-amber-700",
  processing: "bg-purple-100 text-purple-700",
  awaiting_info: "bg-orange-100 text-orange-700",
  completed: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  archived: "bg-gray-100 text-gray-600",
  escalated: "bg-red-100 text-red-700",
};

const TYPE_LABELS: Record<string, string> = {
  text: "Texto",
  audio: "Áudio",
  image: "Imagem",
  video: "Vídeo",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  audio: <Mic className="w-4 h-4" />,
  image: <ImageIcon className="w-4 h-4" />,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DemandDetail() {
  const { id } = useParams<{ id: string }>();
  const demandId = parseInt(id ?? "", 10);
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data: demand, isLoading, isError } = useDemandById(
    isNaN(demandId) ? null : demandId,
  );

  const historyDemandId = demand?.id ?? 0;
  const { data: history, isLoading: loadingHistory } = useGetDemandStatusHistory(
    historyDemandId,
    {
      query: {
        queryKey: getGetDemandStatusHistoryQueryKey(historyDemandId),
        enabled: !!demand?.id,
      },
    },
  );

  const toggleSupport = useToggleDemandSupport();

  const handleSupport = async () => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    if (!demand) return;
    try {
      await toggleSupport.mutateAsync({ id: demand.id });
      queryClient.invalidateQueries({ queryKey: ["/api/demands", demandId] });
      toast.success(demand.userSupported ? "Apoio removido." : "Apoio registrado!");
    } catch {
      toast.error("Erro ao registrar apoio.");
    }
  };

  const copyProtocol = () => {
    if (!demand) return;
    navigator.clipboard.writeText(demand.protocol);
    setCopied(true);
    toast.success("Protocolo copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isNaN(demandId)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-6 text-center">
        <XCircle className="w-12 h-12 text-destructive/50" />
        <h2 className="text-lg font-bold">ID inválido</h2>
        <Link href="/demandas">
          <Button variant="outline">← Voltar às demandas</Button>
        </Link>
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

  if (isError || !demand) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-6 text-center">
        <XCircle className="w-12 h-12 text-destructive/50" />
        <h2 className="text-lg font-bold">Demanda não encontrada</h2>
        <p className="text-sm text-muted-foreground">Verifique o número ou tente novamente.</p>
        <Link href="/demandas">
          <Button variant="outline">← Voltar às demandas</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="px-6 md:px-12 pt-8 pb-0">
        <Link href="/demandas">
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest font-medium">
            <ArrowLeft className="w-3.5 h-3.5" /> Demandas
          </button>
        </Link>
      </div>

      {/* Header */}
      <div className="px-6 md:px-12 pt-8 pb-10 border-b border-border">
        <div className="flex flex-wrap items-start gap-3 mb-4">
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
              STATUS_COLORS[demand.status] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {STATUS_LABELS[demand.status] ?? demand.status}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
            {demand.category}
          </span>
          {TYPE_ICONS[demand.type] && (
            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
              {TYPE_ICONS[demand.type]} {TYPE_LABELS[demand.type] ?? demand.type}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mb-2">
          <code className="text-xl font-mono font-bold text-[#1B3469]">{demand.protocol}</code>
          <button
            onClick={copyProtocol}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Copiar protocolo"
          >
            {copied ? (
              <CheckCircle2 className="w-4 h-4 text-[#5B9A6E]" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-3">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Registrada em {format(new Date(demand.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </span>
          {demand.targetUnit && (
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              {demand.targetUnit}
            </span>
          )}
          {demand.address && !demand.isAnonymous && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {demand.address}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 md:px-12 py-10 grid grid-cols-1 md:grid-cols-12 gap-8 max-w-5xl">

        {/* Main column */}
        <div className="md:col-span-7 space-y-6">

          {/* Texto da demanda */}
          {demand.content && (
            <div className="border border-border bg-card p-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                Relato
              </p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {demand.content}
              </p>
            </div>
          )}

          {/* Mídia — áudio */}
          {demand.type === "audio" && demand.mediaUrl && (
            <div className="border border-border bg-card p-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                Áudio da Manifestação
              </p>
              <audio controls src={demand.mediaUrl} className="w-full" />
            </div>
          )}

          {/* Mídia — imagem */}
          {demand.type === "image" && demand.mediaUrl && (
            <div className="border border-border bg-card p-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                Imagem Anexada
              </p>
              <img
                src={demand.mediaUrl}
                alt="Imagem da demanda"
                className="w-full max-h-96 object-contain rounded"
              />
            </div>
          )}

          {/* Resposta institucional */}
          {demand.adminResponse && (
            <div className="border border-[#5B9A6E]/30 bg-[#5B9A6E]/5 p-6">
              <p className="text-xs uppercase tracking-wider text-[#5B9A6E] font-semibold mb-2">
                Resposta Institucional
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {demand.adminResponse}
              </p>
            </div>
          )}

          {/* Apoio */}
          <button
            onClick={handleSupport}
            disabled={toggleSupport.isPending}
            className={`flex items-center justify-between w-full border px-5 py-3.5 text-sm font-semibold uppercase tracking-wider transition-colors ${
              demand.userSupported
                ? "border-[#5B9A6E] bg-[#5B9A6E]/10 text-[#5B9A6E]"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
            }`}
          >
            <span className="flex items-center gap-2">
              <ThumbsUp
                className={`w-4 h-4 ${demand.userSupported ? "fill-current" : ""}`}
              />
              {demand.userSupported ? "Você apoiou esta demanda" : "Também sou afetado"}
            </span>
            <span className="tabular-nums">{demand.supportCount} apoios</span>
          </button>

          {/* Link para protocolo (acompanhamento) */}
          <div className="flex gap-2">
            <Link href={`/protocolo?q=${demand.protocol}`}>
              <Button variant="outline" size="sm" className="border-border">
                Acompanhar pelo protocolo
              </Button>
            </Link>
          </div>
        </div>

        {/* Histórico */}
        <div className="md:col-span-5">
          <div className="border border-border p-6 bg-card sticky top-6">
            <div className="flex items-center gap-2 mb-5">
              <Clock className="w-4 h-4 text-secondary" />
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Histórico de Tramitação
              </h3>
            </div>

            {loadingHistory ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Carregando…</span>
              </div>
            ) : history && history.length > 0 ? (
              <div className="space-y-0">
                {history.map((entry, i) => (
                  <div key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center pt-1">
                      <div
                        className={`w-2.5 h-2.5 rounded-full shrink-0 border-2 border-background ${
                          i === 0 ? "bg-primary" : "bg-border"
                        }`}
                      />
                      {i < (history.length - 1) && (
                        <div className="w-px flex-1 bg-border mt-1" />
                      )}
                    </div>
                    <div className={`pb-5 flex-1 ${i === history.length - 1 ? "pb-0" : ""}`}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-sm text-foreground">
                          {STATUS_LABELS[entry.newStatus] ?? entry.newStatus}
                        </span>
                        <time className="text-xs text-muted-foreground tabular-nums">
                          {format(new Date(entry.createdAt), "dd/MM/yy HH:mm")}
                        </time>
                      </div>
                      {entry.adminResponse && (
                        <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-secondary/40 pl-2.5 mt-1.5">
                          {entry.adminResponse}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {/* Entry criação */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center pt-1">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0 border-2 border-background bg-primary" />
                  </div>
                  <div className="pb-0 flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-sm text-foreground">Recebida</span>
                      <time className="text-xs text-muted-foreground tabular-nums">
                        {format(new Date(demand.createdAt), "dd/MM/yy HH:mm")}
                      </time>
                    </div>
                    <p className="text-xs text-muted-foreground">Demanda registrada na plataforma.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
