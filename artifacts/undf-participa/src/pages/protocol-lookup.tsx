import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, Loader2, ArrowRight, ShieldCheck, Clock } from "lucide-react";
import { useGetDemandByProtocol, useGetDemandStatusHistory, getGetDemandByProtocolQueryKey, getGetDemandStatusHistoryQueryKey } from "@workspace/api-client-react";
import { DemandStatus } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ProtocolLookup() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialProtocol = searchParams.get("q") || "";
  
  const [searchInput, setSearchInput] = useState(initialProtocol);
  const [activeProtocol, setActiveProtocol] = useState(initialProtocol);

  const { data: demand, isLoading: loadingDemand, isError, error } = useGetDemandByProtocol(activeProtocol, {
    query: {
      enabled: activeProtocol.length >= 8,
      queryKey: getGetDemandByProtocolQueryKey(activeProtocol)
    }
  });

  const { data: history, isLoading: loadingHistory } = useGetDemandStatusHistory(demand?.id || 0, {
    query: {
      enabled: !!demand?.id,
      queryKey: getGetDemandStatusHistoryQueryKey(demand?.id || 0)
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim().length >= 8) {
      setActiveProtocol(searchInput.trim());
      // Update URL without reload
      window.history.replaceState({}, '', `/protocolo?q=${searchInput.trim()}`);
    }
  };

  const getStatusLabel = (s: string) => {
    switch(s) {
      case 'received': return "Recebida";
      case 'processing': return "Em Análise";
      case 'completed': return "Resolvida";
      case 'archived': return "Arquivada";
      default: return s;
    }
  };

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-16rem)]">
      {/* Header Area */}
      <section className="bg-muted py-12 md:py-20 border-b">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <ShieldCheck className="w-12 h-12 mx-auto text-primary mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Acompanhamento de Protocolo
          </h1>
          <p className="text-muted-foreground text-lg mb-8 text-balance">
            Consulte o andamento da sua demanda ou proposta com total transparência.
          </p>
          
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto relative shadow-sm rounded-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Ex: DEM-2023-A1B2C3D4"
                className="pl-10 h-12 text-lg uppercase font-mono"
              />
            </div>
            <Button type="submit" className="h-12 px-8 bg-primary" disabled={searchInput.length < 8}>
              Buscar
            </Button>
          </form>
          {searchInput.length > 0 && searchInput.length < 8 && (
            <p className="text-xs text-muted-foreground mt-2">O protocolo deve ter no mínimo 8 caracteres.</p>
          )}
        </div>
      </section>

      {/* Results Area */}
      <section className="py-12 flex-1 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          {activeProtocol.length >= 8 && (
            <>
              {loadingDemand ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Buscando informações do protocolo...</p>
                </div>
              ) : isError ? (
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center text-destructive">
                  <XCircle className="w-12 h-12 mx-auto mb-4 opacity-80" />
                  <h3 className="text-xl font-bold mb-2">Protocolo não encontrado</h3>
                  <p className="opacity-90">Verifique se o código foi digitado corretamente e tente novamente.</p>
                </div>
              ) : demand && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  {/* Demand Summary */}
                  <Card className="border-border shadow-sm overflow-hidden">
                    <div className="bg-primary/5 px-6 py-4 border-b flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Protocolo</span>
                        <span className="font-mono font-bold text-lg text-primary">{demand.protocol}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Status Atual</span>
                        <span className="font-bold text-foreground bg-background px-3 py-1 rounded-full border">{getStatusLabel(demand.status)}</span>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="grid sm:grid-cols-2 gap-6 mb-6">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Categoria</p>
                          <p className="text-foreground">{demand.category}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Data de Abertura</p>
                          <p className="text-foreground">{format(new Date(demand.createdAt), "dd/MM/yyyy HH:mm")}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Descrição</p>
                        <p className="text-foreground p-4 bg-muted/30 rounded-md border text-sm">{demand.content || "Sem descrição textual."}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Timeline */}
                  <div className="mt-12">
                    <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" /> Histórico de Tramitação
                    </h3>
                    
                    {loadingHistory ? (
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    ) : history && history.length > 0 ? (
                      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                        {history.map((entry, index) => (
                          <div key={entry.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary text-primary-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                              {index === 0 ? <ShieldCheck className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card border p-4 rounded-lg shadow-sm">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-foreground">{getStatusLabel(entry.newStatus)}</span>
                                <time className="text-xs text-muted-foreground font-medium">{format(new Date(entry.createdAt), "dd/MM/yy HH:mm")}</time>
                              </div>
                              {entry.adminResponse && (
                                <p className="text-sm text-muted-foreground mt-2 border-l-2 border-primary/30 pl-3">
                                  {entry.adminResponse}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Nenhuma movimentação registrada além da abertura.</p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

// Keep a local XCircle since we didn't import it at the top to save space
function XCircle(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}
