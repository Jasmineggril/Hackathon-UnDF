import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useGetDemandByProtocol, useToggleDemandSupport } from '@workspace/api-client-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { Search, Loader2, AlertCircle, FileText, CalendarDays, MapPin, History, ThumbsUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@workspace/auth-web';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface StatusHistoryEntry {
  id: number;
  previousStatus: string | null;
  newStatus: string;
  adminResponse: string | null;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  received: 'Recebida',
  processing: 'Em Análise',
  completed: 'Concluída',
  archived: 'Arquivada',
};

export default function ProtocolLookup() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const protocolFromUrl = searchParams.get('p') || '';
  
  const [protocol, setProtocol] = useState(protocolFromUrl);
  const [searchProtocol, setSearchProtocol] = useState(protocolFromUrl);

  const { data: demand, isLoading, isError } = useGetDemandByProtocol(searchProtocol, {
    query: {
      enabled: searchProtocol.length > 5,
      retry: false,
      queryKey: ['/api/demands/protocol', searchProtocol],
    }
  });

  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const { isAuthenticated, login } = useAuth();
  const toggleSupport = useToggleDemandSupport();
  const queryClient = useQueryClient();

  const handleSupport = () => {
    if (!isAuthenticated) {
      toast('Autenticação necessária', {
        description: 'Você precisa entrar para apoiar uma demanda.',
        action: { label: 'Entrar', onClick: login },
      });
      return;
    }
    toggleSupport.mutate(
      { id: demand!.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/api/demands/protocol', searchProtocol] });
          toast('Apoio atualizado', { description: 'O registro foi atualizado.' });
        },
      },
    );
  };

  useEffect(() => {
    if (!demand?.id) return;
    setHistoryLoading(true);
    fetch(`/api/demands/${demand.id}/history`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setHistory(Array.isArray(data) ? data : []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [demand?.id]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (protocol.trim().length > 5) {
      setSearchProtocol(protocol.trim());
      setLocation(`/protocolo?p=${protocol.trim()}`);
    }
  };

  useEffect(() => {
    if (protocolFromUrl && protocolFromUrl !== searchProtocol) {
      setProtocol(protocolFromUrl);
      setSearchProtocol(protocolFromUrl);
    }
  }, [protocolFromUrl]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-foreground mb-4">Consultar Protocolo</h1>
        <p className="text-muted-foreground">
          Acompanhe o andamento da sua demanda informando o número do protocolo.
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Ex: 20240721-1234" 
                value={protocol}
                onChange={(e) => setProtocol(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-8" disabled={isLoading || protocol.length < 5}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Consultar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
          <p>Buscando informações do protocolo...</p>
        </div>
      )}

      {isError && !isLoading && searchProtocol && (
        <div className="bg-destructive/10 border-destructive/20 border p-6 rounded-lg flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold text-destructive">Protocolo não encontrado</h3>
          <p className="text-destructive/80 mt-2">
            Verifique se o número do protocolo foi digitado corretamente e tente novamente.
          </p>
        </div>
      )}

      {demand && !isLoading && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card>
            <CardHeader className="border-b bg-muted/20">
              <div className="flex justify-between items-start">
                <div>
                  <CardDescription className="text-xs uppercase tracking-wider font-semibold mb-1">
                    Protocolo {demand.protocol}
                  </CardDescription>
                  <CardTitle className="text-xl text-foreground">
                    Detalhes da Demanda
                  </CardTitle>
                </div>
                <StatusBadge status={demand.status} type="demand" />
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Categoria</span>
                  <span className="font-medium text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                    {demand.category}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Data de Registro</span>
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <CalendarDays className="w-4 h-4 text-muted-foreground" />
                    {format(new Date(demand.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Unidade/Local</span>
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    {demand.targetUnit || 'Não informado'}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Privacidade</span>
                  <span className="font-medium text-sm">
                    {demand.isAnonymous ? 'Anônima' : 'Identificada'}
                  </span>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Descrição Relatada
                </h4>
                {demand.type === 'text' && demand.content ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/30 p-4 rounded-md border">
                    {demand.content}
                  </p>
                ) : demand.type === 'audio' && demand.mediaUrl ? (
                  <div className="bg-muted/30 p-4 rounded-md border">
                    <audio src={demand.mediaUrl} controls className="w-full h-10" />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic bg-muted/30 p-4 rounded-md border">
                    Demanda registrada através de mídia ({demand.type}).
                  </p>
                )}
              </div>

              {demand.adminResponse && (
                <div className="border-t pt-6">
                  <h4 className="text-sm font-semibold mb-3 text-primary flex items-center gap-2">
                    Resposta da Administração
                  </h4>
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-md">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                      {demand.adminResponse}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <ThumbsUp className="w-4 h-4 text-primary" />
                  <span>{demand.supportCount} pessoa{demand.supportCount !== 1 ? 's' : ''} afetada{demand.supportCount !== 1 ? 's' : ''}</span>
                </div>
                <Button
                  variant={demand.userSupported ? "default" : "outline"}
                  size="sm"
                  onClick={handleSupport}
                  disabled={toggleSupport.isPending}
                >
                  {demand.userSupported ? 'Apoiado ✓' : 'Também sou afetado'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Histórico de Status */}
          <Card>
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-muted-foreground" />
                Histórico de Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {historyLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma mudança de status registrada ainda.
                </p>
              ) : (
                <div className="relative">
                  <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-border" />
                  <div className="space-y-6">
                    {history.map((entry, i) => (
                      <div key={entry.id} className="relative flex gap-4">
                        <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          i === history.length - 1
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {entry.previousStatus && (
                              <span className="text-xs text-muted-foreground">
                                {STATUS_LABELS[entry.previousStatus] ?? entry.previousStatus}
                              </span>
                            )}
                            {entry.previousStatus && (
                              <span className="text-xs text-muted-foreground">→</span>
                            )}
                            <StatusBadge status={entry.newStatus} type="demand" />
                          </div>
                          {entry.adminResponse && (
                            <p className="text-sm text-foreground mt-2 bg-muted/30 p-3 rounded border">
                              {entry.adminResponse}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(entry.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
