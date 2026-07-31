import { useState } from "react";
import { useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ShieldAlert, Loader2, Clock, ChevronDown,
} from "lucide-react";
import {
  useAdminListDemands,
  useUpdateDemandStatus,
  useGetDemandStatusHistory,
  getAdminListDemandsQueryKey,
  getGetDemandStatusHistoryQueryKey,
} from "@workspace/api-client-react";
import { DemandStatus } from "@workspace/api-client-react";
import { useAuth } from "@workspace/auth-web";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<string, string> = {
  received: "Recebida",
  in_analysis: "Em Análise",
  processing: "Em Execução",
  awaiting_info: "Aguardando Info",
  completed: "Concluída",
  rejected: "Não Aprovada",
  escalated: "Escalada",
  archived: "Arquivada",
};

const STATUS_BADGE_COLORS: Record<string, string> = {
  received: "bg-blue-100 text-blue-700",
  in_analysis: "bg-amber-100 text-amber-700",
  processing: "bg-purple-100 text-purple-700",
  awaiting_info: "bg-orange-100 text-orange-700",
  completed: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  escalated: "bg-red-200 text-red-800",
  archived: "bg-gray-100 text-gray-600",
};

const TYPE_LABELS: Record<string, string> = {
  text: "Texto",
  audio: "Áudio",
  image: "Imagem",
  video: "Vídeo",
};

// ---------------------------------------------------------------------------
// History panel
// ---------------------------------------------------------------------------

function DemandHistory({ demandId }: { demandId: number }) {
  const { data: history, isLoading } = useGetDemandStatusHistory(demandId, {
    query: {
      queryKey: getGetDemandStatusHistoryQueryKey(demandId),
      enabled: !!demandId,
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Carregando histórico…</span>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return <p className="text-xs text-muted-foreground">Nenhuma movimentação registrada além da abertura.</p>;
  }

  return (
    <div className="space-y-0 max-h-64 overflow-y-auto">
      {history.map((entry, i) => (
        <div key={entry.id} className="flex gap-3">
          <div className="flex flex-col items-center pt-1">
            <div
              className={`w-2 h-2 rounded-full shrink-0 border-2 border-background ${
                i === 0 ? "bg-primary" : "bg-border"
              }`}
            />
            {i < history.length - 1 && <div className="w-px flex-1 bg-border mt-0.5" />}
          </div>
          <div className={`pb-3 flex-1 ${i === history.length - 1 ? "pb-0" : ""}`}>
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="font-semibold text-xs text-foreground">
                {STATUS_LABELS[entry.newStatus] ?? entry.newStatus}
              </span>
              <time className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                {format(new Date(entry.createdAt), "dd/MM/yy HH:mm")}
              </time>
            </div>
            {entry.adminResponse && (
              <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-secondary/40 pl-2 mt-1">
                {entry.adminResponse}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const { id: routeId } = useParams<{ id?: string }>();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<DemandStatus | undefined>();
  const [selectedId, setSelectedId] = useState<number | null>(
    routeId ? parseInt(routeId, 10) : null,
  );
  const [newStatus, setNewStatus] = useState<DemandStatus | "">("");
  const [adminResponse, setAdminResponse] = useState("");
  const [targetUnit, setTargetUnit] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const isAdmin = isAuthenticated && (user?.role === "gestor" || user?.role === "administrador");

  const { data, isLoading } = useAdminListDemands(
    { page: 1, limit: 100, status: statusFilter },
    {
      query: {
        queryKey: getAdminListDemandsQueryKey({ page: 1, limit: 100, status: statusFilter }),
        enabled: isAdmin,
      },
    },
  );

  const updateStatus = useUpdateDemandStatus();

  // Guard
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] p-4 text-center">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
        <p className="text-muted-foreground">Esta área é exclusiva para gestores da universidade.</p>
      </div>
    );
  }

  const selectedDemand = data?.data.find((d) => d.id === selectedId);

  const handleSelect = (id: number, demand: typeof selectedDemand) => {
    setSelectedId(id);
    setNewStatus("");
    setAdminResponse(demand?.adminResponse ?? "");
    setTargetUnit(demand?.targetUnit ?? "");
    setShowHistory(false);
  };

  const handleUpdate = async () => {
    if (!selectedId) return;
    if (!newStatus && adminResponse === (selectedDemand?.adminResponse ?? "") && targetUnit === (selectedDemand?.targetUnit ?? "")) {
      toast.error("Altere algum campo antes de salvar.");
      return;
    }
    try {
      await updateStatus.mutateAsync({
        id: selectedId,
        data: {
          status: (newStatus || selectedDemand?.status) as DemandStatus,
          adminResponse: adminResponse || undefined,
          // @ts-ignore — targetUnit é aceito pelo handler mas não está no schema gerado
          targetUnit: targetUnit || undefined,
        },
      });
      queryClient.invalidateQueries({ queryKey: getAdminListDemandsQueryKey() });
      toast.success("Demanda atualizada com sucesso.");
      setNewStatus("");
    } catch {
      toast.error("Erro ao atualizar demanda.");
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* ── Sidebar ── */}
      <div className="w-full md:w-[380px] border-r bg-muted/20 flex flex-col h-full shrink-0">
        <div className="p-4 border-b bg-card z-10 flex flex-col gap-3">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-secondary" /> Painel da Gestão
          </h2>
          <Select
            value={statusFilter ?? "all"}
            onValueChange={(v) => {
              setStatusFilter(v === "all" ? undefined : (v as DemandStatus));
              setSelectedId(null);
            }}
          >
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Filtrar por Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="received">Recebida</SelectItem>
              <SelectItem value="in_analysis">Em Análise</SelectItem>
              <SelectItem value="processing">Em Execução</SelectItem>
              <SelectItem value="awaiting_info">Aguardando Info</SelectItem>
              <SelectItem value="completed">Concluída</SelectItem>
              <SelectItem value="rejected">Não Aprovada</SelectItem>
              <SelectItem value="escalated">Escalada</SelectItem>
              <SelectItem value="archived">Arquivada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !data?.data.length ? (
            <p className="text-sm text-center text-muted-foreground p-4">Nenhuma demanda encontrada.</p>
          ) : (
            data.data.map((d) => (
              <button
                key={d.id}
                onClick={() => handleSelect(d.id, d)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedId === d.id
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-card border-border hover:border-primary/40"
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <span
                    className={`text-xs font-mono font-bold ${
                      selectedId === d.id ? "text-primary-foreground/80" : "text-primary"
                    }`}
                  >
                    {d.protocol}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      selectedId === d.id
                        ? "bg-white/20 text-white"
                        : (STATUS_BADGE_COLORS[d.status] ?? "bg-gray-100 text-gray-600")
                    }`}
                  >
                    {STATUS_LABELS[d.status] ?? d.status}
                  </span>
                </div>
                <p
                  className={`text-xs font-medium line-clamp-2 ${
                    selectedId === d.id ? "text-primary-foreground/90" : "text-foreground"
                  }`}
                >
                  {d.content || `Demanda ${TYPE_LABELS[d.type] ?? d.type}`}
                </p>
                <div
                  className={`mt-1.5 text-[10px] flex justify-between ${
                    selectedId === d.id ? "text-primary-foreground/60" : "text-muted-foreground"
                  }`}
                >
                  <span>{format(new Date(d.createdAt), "dd/MM/yyyy", { locale: ptBR })}</span>
                  <span>{d.supportCount} apoios</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Detail Panel ── */}
      <div className="flex-1 bg-background flex flex-col h-full overflow-hidden hidden md:flex">
        {selectedDemand ? (
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 max-w-3xl mx-auto space-y-6 animate-in fade-in">

              {/* Header */}
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <h1 className="text-xl font-bold font-mono text-primary">{selectedDemand.protocol}</h1>
                  <Badge variant="outline">{selectedDemand.category}</Badge>
                  <Badge variant="outline" className="text-muted-foreground">
                    {TYPE_LABELS[selectedDemand.type] ?? selectedDemand.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Criada em {format(new Date(selectedDemand.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                  <span>•</span>
                  <span>{selectedDemand.isAnonymous ? "Autor Anônimo" : "Identificado"}</span>
                  {selectedDemand.targetUnit && (
                    <>
                      <span>•</span>
                      <span>{selectedDemand.targetUnit}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Content */}
              {selectedDemand.content && (
                <div className="bg-card border rounded-lg p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Relato do Usuário
                  </h3>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {selectedDemand.content}
                  </p>
                </div>
              )}

              {/* Audio/Image */}
              {selectedDemand.type === "audio" && selectedDemand.mediaUrl && (
                <div className="bg-card border rounded-lg p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Áudio</h3>
                  <audio controls src={selectedDemand.mediaUrl} className="w-full" />
                </div>
              )}
              {selectedDemand.type === "image" && selectedDemand.mediaUrl && (
                <div className="bg-card border rounded-lg p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Imagem</h3>
                  <img src={selectedDemand.mediaUrl} alt="Imagem da demanda" className="max-h-64 object-contain rounded" />
                </div>
              )}
              {selectedDemand.type === "video" && selectedDemand.mediaUrl && (
                <div className="bg-card border rounded-lg p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Vídeo</h3>
                  <video controls src={selectedDemand.mediaUrl} className="w-full rounded" />
                </div>
              )}

              {/* Histórico */}
              <div className="bg-card border rounded-lg">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full flex items-center justify-between p-4 text-sm font-bold text-foreground"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-secondary" />
                    Histórico de Tramitação
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showHistory ? "rotate-180" : ""}`} />
                </button>
                {showHistory && (
                  <div className="px-4 pb-4">
                    <DemandHistory demandId={selectedDemand.id} />
                  </div>
                )}
              </div>

              {/* Área de ação */}
              <div className="bg-muted/30 border border-primary/20 rounded-lg p-5">
                <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-primary" /> Ação da Gestão
                </h3>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Status Atual</label>
                    <div className="h-9 px-3 border rounded-md bg-background flex items-center text-sm font-semibold">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          STATUS_BADGE_COLORS[selectedDemand.status] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {STATUS_LABELS[selectedDemand.status] ?? selectedDemand.status}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Alterar para</label>
                    <Select value={newStatus} onValueChange={(v) => setNewStatus(v as DemandStatus)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Selecione o novo status…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="received">Recebida</SelectItem>
                        <SelectItem value="in_analysis">Em Análise</SelectItem>
                        <SelectItem value="processing">Em Execução</SelectItem>
                        <SelectItem value="awaiting_info">Aguardando Info</SelectItem>
                        <SelectItem value="completed">Concluída</SelectItem>
                        <SelectItem value="rejected">Não Aprovada</SelectItem>
                        <SelectItem value="escalated">Escalada</SelectItem>
                        <SelectItem value="archived">Arquivar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5 mb-4">
                  <label className="text-sm font-medium">Setor Responsável</label>
                  <Input
                    value={targetUnit}
                    onChange={(e) => setTargetUnit(e.target.value)}
                    placeholder="Ex: Secretaria Acadêmica, TI, Reitoria…"
                    className="bg-background"
                  />
                </div>

                <div className="space-y-1.5 mb-5">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Resposta Pública Institucional</label>
                    <span className="text-xs bg-yellow-100 text-yellow-800 border border-yellow-200 px-2 py-0.5 rounded font-medium">
                      Visível ao autor
                    </span>
                  </div>
                  <Textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    placeholder="Descreva as providências tomadas ou o motivo do arquivamento. Esta mensagem aparecerá no histórico do protocolo…"
                    className="bg-background min-h-[100px]"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleUpdate}
                    disabled={updateStatus.isPending}
                    className="bg-primary hover:bg-primary/90 min-w-[140px]"
                  >
                    {updateStatus.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando…</>
                    ) : (
                      "Salvar Alterações"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
            <ShieldAlert className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-base">Selecione uma demanda na lista ao lado para visualizar os detalhes e gerenciar o status.</p>
          </div>
        )}
      </div>
    </div>
  );
}
