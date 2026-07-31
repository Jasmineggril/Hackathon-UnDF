import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Search, ShieldAlert, CheckCircle2, Archive, Loader2, ArrowRight
} from "lucide-react";
import { useAdminListDemands, useUpdateDemandStatus, getAdminListDemandsQueryKey } from "@workspace/api-client-react";
import { DemandStatus } from "@workspace/api-client-react";
import { useAuth } from "@workspace/auth-web";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<DemandStatus | undefined>();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  const [newStatus, setNewStatus] = useState<DemandStatus | "">("");
  const [adminResponse, setAdminResponse] = useState("");

  const { data, isLoading } = useAdminListDemands({
    page: 1,
    limit: 50,
    status: statusFilter
  }, {
    query: {
      queryKey: getAdminListDemandsQueryKey({ page: 1, limit: 50, status: statusFilter }),
      enabled: isAuthenticated && (user?.role === 'gestor' || user?.role === 'administrador')
    }
  });

  const updateStatus = useUpdateDemandStatus();

  if (!isAuthenticated || (user?.role !== 'gestor' && user?.role !== 'administrador')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] p-4 text-center">
        <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
        <p className="text-muted-foreground">Esta área é exclusiva para gestores da universidade.</p>
      </div>
    );
  }

  const selectedDemand = data?.data.find(d => d.id === selectedId);

  const handleUpdate = async () => {
    if (!selectedId || !newStatus) return;
    try {
      await updateStatus.mutateAsync({
        id: selectedId,
        data: {
          status: newStatus as DemandStatus,
          adminResponse: adminResponse || undefined
        }
      });
      queryClient.invalidateQueries({ queryKey: getAdminListDemandsQueryKey() });
      setNewStatus("");
      setAdminResponse("");
      // keep it selected to show updated state
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusLabel = (s: string) => {
    switch(s) {
      case 'received': return "Recebida";
      case 'in_analysis': return "Em Análise";
      case 'processing': return "Em Execução";
      case 'awaiting_info': return "Aguardando Info";
      case 'completed': return "Resolvida";
      case 'rejected': return "Não Aprovada";
      case 'escalated': return "Escalada";
      case 'archived': return "Arquivada";
      default: return s;
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar List */}
      <div className="w-full md:w-[400px] border-r bg-muted/20 flex flex-col h-full">
        <div className="p-4 border-b bg-card z-10 flex flex-col gap-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-secondary" /> Painel da Gestão
          </h2>
          <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? undefined : v as DemandStatus)}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Filtrar por Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="received">Recebidas</SelectItem>
              <SelectItem value="processing">Em Análise</SelectItem>
              <SelectItem value="completed">Resolvidas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : data?.data.length === 0 ? (
            <p className="text-sm text-center text-muted-foreground p-4">Nenhuma demanda encontrada.</p>
          ) : (
            data?.data.map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  setSelectedId(d.id);
                  setNewStatus("");
                  setAdminResponse(d.adminResponse || "");
                }}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  selectedId === d.id 
                    ? "bg-primary text-primary-foreground border-primary shadow-md" 
                    : "bg-card border-border hover:border-primary/40"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-mono font-bold ${selectedId === d.id ? "text-primary-foreground/80" : "text-primary"}`}>
                    {d.protocol}
                  </span>
                  <Badge variant={selectedId === d.id ? "secondary" : "outline"} className="text-[10px] px-1 py-0 h-4">
                    {getStatusLabel(d.status)}
                  </Badge>
                </div>
                <p className={`text-sm font-medium line-clamp-2 ${selectedId === d.id ? "" : "text-foreground"}`}>
                  {d.content || "Sem descrição"}
                </p>
                <div className={`mt-3 text-xs flex justify-between ${selectedId === d.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  <span>{format(new Date(d.createdAt), "dd/MM/yyyy")}</span>
                  <span>{d.supportCount} apoios</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Detail View */}
      <div className="flex-1 bg-background flex flex-col h-full overflow-hidden hidden md:flex">
        {selectedDemand ? (
          <div className="flex-1 overflow-y-auto">
            <div className="p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in">
              {/* Header Info */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold font-mono text-primary">{selectedDemand.protocol}</h1>
                  <Badge variant="outline">{selectedDemand.category}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Criada em {format(new Date(selectedDemand.createdAt), "dd/MM/yyyy 'às' HH:mm")}</span>
                  <span>•</span>
                  <span>{selectedDemand.isAnonymous ? "Autor Anônimo" : "Identificado"}</span>
                </div>
              </div>

              {/* Content */}
              <div className="bg-card border rounded-lg p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Relato do Usuário</h3>
                <p className="text-foreground whitespace-pre-wrap">{selectedDemand.content || "Sem conteúdo textual."}</p>
                
                {selectedDemand.targetUnit && (
                  <div className="mt-4 pt-4 border-t">
                    <span className="text-xs font-bold text-muted-foreground block mb-1">Unidade Referência</span>
                    <span className="text-sm font-medium">{selectedDemand.targetUnit}</span>
                  </div>
                )}
              </div>

              {/* Action Area */}
              <div className="bg-muted/30 border border-primary/20 rounded-lg p-6">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-primary" /> Ação da Gestão
                </h3>
                
                <div className="grid sm:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status Atual</label>
                    <div className="h-10 px-3 border rounded-md bg-background flex items-center text-sm font-bold opacity-70">
                      {getStatusLabel(selectedDemand.status)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Alterar para</label>
                    <Select value={newStatus} onValueChange={(v) => setNewStatus(v as DemandStatus)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_analysis">Em Análise</SelectItem>
                        <SelectItem value="processing">Em Execução</SelectItem>
                        <SelectItem value="awaiting_info">Aguardando Info</SelectItem>
                        <SelectItem value="completed">Resolvida</SelectItem>
                        <SelectItem value="rejected">Não Aprovada</SelectItem>
                        <SelectItem value="escalated">Escalada</SelectItem>
                        <SelectItem value="archived">Arquivar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Resposta Pública Institucional</label>
                    <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">Visível ao autor</Badge>
                  </div>
                  <Textarea 
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    placeholder="Descreva as providências tomadas ou o motivo do arquivamento. Esta mensagem aparecerá no histórico do protocolo..."
                    className="bg-background min-h-[120px]"
                  />
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleUpdate}
                    disabled={updateStatus.isPending || (!newStatus && adminResponse === selectedDemand.adminResponse)}
                    className="bg-primary hover:bg-primary/90 min-w-[150px]"
                  >
                    {updateStatus.isPending ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
            <ShieldAlert className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg">Selecione uma demanda na lista ao lado para visualizar os detalhes e gerenciar o status.</p>
          </div>
        )}
      </div>
    </div>
  );
}
