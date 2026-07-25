import { useState } from "react";
import { Link } from "wouter";
import { Filter, Search, Megaphone, CheckCircle2, XCircle, Clock, ThumbsUp, Loader2 } from "lucide-react";
import { useListProposals, useToggleProposalSupport, getListProposalsQueryKey } from "@workspace/api-client-react";
import { ProposalStatus, ListProposalsSort } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@workspace/auth-web";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Proposals() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState<ProposalStatus | undefined>();
  const [sort, setSort] = useState<ListProposalsSort>("createdAt");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useListProposals({
    page,
    limit: 12,
    status,
    sort,
  });

  const toggleSupport = useToggleProposalSupport();

  const handleSupport = async (id: number) => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    await toggleSupport.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListProposalsQueryKey() });
  };

  const getStatusConfig = (s: ProposalStatus) => {
    switch(s) {
      case 'open': return { label: "Aberta para Apoio", color: "bg-blue-100 text-blue-800", icon: Megaphone };
      case 'under_review': return { label: "Em Avaliação", color: "bg-orange-100 text-orange-800", icon: Clock };
      case 'approved': return { label: "Aprovada", color: "bg-green-100 text-green-800", icon: CheckCircle2 };
      case 'rejected': return { label: "Rejeitada", color: "bg-red-100 text-red-800", icon: XCircle };
      case 'implemented': return { label: "Implementada", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Propostas da Comunidade</h1>
          <p className="text-muted-foreground mt-1">Ideias e projetos estruturados aguardando aprovação institucional.</p>
        </div>
        <Link href="/propostas/nova">
          <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
            Nova Proposta
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
          <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? undefined : v as ProposalStatus)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="open">Aberta para Apoio</SelectItem>
              <SelectItem value="under_review">Em Avaliação</SelectItem>
              <SelectItem value="approved">Aprovada</SelectItem>
              <SelectItem value="implemented">Implementada</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v) => setSort(v as ListProposalsSort)}>
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
          <h3 className="text-lg font-medium text-foreground">Nenhuma proposta encontrada</h3>
          <p className="text-muted-foreground mt-1 mb-4">Seja o primeiro a enviar uma ideia transformadora para a universidade.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data?.data.map((proposal) => {
            const statusConfig = getStatusConfig(proposal.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <Card key={proposal.id} className="flex flex-col border-border bg-card">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2 gap-4">
                    <Badge variant="outline" className="font-normal border-primary/20 text-primary">
                      {proposal.category}
                    </Badge>
                    <Badge className={`${statusConfig.color} border-transparent flex items-center gap-1`}>
                      <StatusIcon className="w-3 h-3" /> {statusConfig.label}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl leading-tight">{proposal.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {proposal.description}
                  </p>
                  
                  {proposal.adminDecision && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-md border text-sm">
                      <strong className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Resposta Institucional</strong>
                      <p className="text-foreground line-clamp-2">{proposal.adminDecision}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0 border-t mt-4 flex items-center justify-between p-6">
                  <div className="flex items-center text-sm font-medium text-muted-foreground gap-2">
                    <ThumbsUp className="w-4 h-4" />
                    {proposal.supportCount} apoiadores
                  </div>
                  <Button 
                    variant={proposal.status === 'open' ? 'default' : 'outline'}
                    className={proposal.status === 'open' ? 'bg-primary hover:bg-primary/90' : ''}
                    disabled={proposal.status !== 'open' || toggleSupport.isPending}
                    onClick={() => handleSupport(proposal.id)}
                  >
                    Apoiar Proposta
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
          <span className="flex items-center px-4 text-sm font-medium">Página {page} de {data.totalPages}</span>
          <Button variant="outline" disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)}>Próxima</Button>
        </div>
      )}
    </div>
  );
}
