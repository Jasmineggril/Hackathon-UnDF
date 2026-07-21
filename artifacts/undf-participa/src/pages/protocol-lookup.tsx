import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useGetDemandByProtocol } from '@workspace/api-client-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { Search, Loader2, AlertCircle, FileText, CalendarDays, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ProtocolLookup() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const protocolFromUrl = searchParams.get('p') || '';
  
  const [protocol, setProtocol] = useState(protocolFromUrl);
  const [searchProtocol, setSearchProtocol] = useState(protocolFromUrl);

  const { data: demand, isLoading, isError, error } = useGetDemandByProtocol(searchProtocol, {
    query: {
      enabled: searchProtocol.length > 5,
      retry: false
    }
  });

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
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
