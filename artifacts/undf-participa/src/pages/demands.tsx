import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Filter, Search, Clock, ThumbsUp, Building2, MapPin, Loader2, ArrowRight
} from "lucide-react";
import { useListDemands, useToggleDemandSupport, getListDemandsQueryKey } from "@workspace/api-client-react";
import { DemandCategory, DemandStatus, DemandType, ListDemandsSort } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@workspace/auth-web";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function Demands() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState<DemandStatus | undefined>();
  const [sort, setSort] = useState<ListDemandsSort>("createdAt");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useListDemands({
    page,
    limit: 12,
    status,
    sort,
  });

  const toggleSupport = useToggleDemandSupport();

  const handleSupport = async (id: number) => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    await toggleSupport.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListDemandsQueryKey() });
  };

  const getStatusConfig = (s: DemandStatus) => {
    switch(s) {
      case 'received': return { label: "Recebida", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" };
      case 'processing': return { label: "Em Análise", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" };
      case 'completed': return { label: "Resolvida", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" };
      case 'archived': return { label: "Arquivada", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Demandas da Comunidade</h1>
          <p className="text-muted-foreground mt-1">Acompanhe as solicitações em andamento na UnDF.</p>
        </div>
        <Link href="/demandas/nova">
          <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
            Registrar Nova Demanda
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-lg p-4 mb-8 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filtros:</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? undefined : v as DemandStatus)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="received">Recebida</SelectItem>
              <SelectItem value="processing">Em Análise</SelectItem>
              <SelectItem value="completed">Resolvida</SelectItem>
              <SelectItem value="archived">Arquivada</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v) => setSort(v as ListDemandsSort)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Mais recentes</SelectItem>
              <SelectItem value="supportCount">Mais apoiadas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : data?.data.length === 0 ? (
        <div className="text-center py-20 bg-card border rounded-lg border-dashed">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">Nenhuma demanda encontrada</h3>
          <p className="text-muted-foreground mt-1 mb-4">Tente ajustar os filtros ou seja o primeiro a registrar algo.</p>
          <Button variant="outline" onClick={() => { setStatus(undefined); setSort("createdAt"); }}>
            Limpar filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.data.map((demand) => {
            const statusConfig = getStatusConfig(demand.status);
            return (
              <Card key={demand.id} className="flex flex-col border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="secondary" className="font-normal">
                      {demand.category}
                    </Badge>
                    <Badge className={`${statusConfig.color} hover:${statusConfig.color} border-transparent`}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-2 text-foreground line-clamp-2">
                    {demand.content?.substring(0, 100) || "Demanda sem descrição textual"}
                    {demand.content && demand.content.length > 100 ? "..." : ""}
                  </h3>
                  
                  <div className="space-y-2 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{format(new Date(demand.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR })}</span>
                    </div>
                    {demand.targetUnit && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 shrink-0" />
                        <span className="truncate">{demand.targetUnit}</span>
                      </div>
                    )}
                    {demand.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="truncate">{demand.address}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-5 pt-0 mt-auto border-t flex items-center justify-between gap-4">
                  <Button 
                    variant={(demand as any).userSupported ? "secondary" : "outline"}
                    size="sm"
                    className="flex-1 shrink-0 whitespace-nowrap"
                    onClick={() => handleSupport(demand.id)}
                    disabled={toggleSupport.isPending}
                    data-testid={`button-support-${demand.id}`}
                  >
                    <ThumbsUp className={`w-4 h-4 mr-2 ${(demand as any).userSupported ? "fill-current" : ""}`} />
                    <span className="hidden sm:inline">Também sou afetado</span>
                    <span className="sm:hidden">Apoiar</span>
                    <Badge variant="secondary" className="ml-2 bg-background/50">
                      {demand.supportCount}
                    </Badge>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4 text-sm font-medium">
            Página {page} de {data.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === data.totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
