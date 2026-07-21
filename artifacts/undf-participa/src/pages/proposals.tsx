import { useState } from 'react';
import { useListProposals, DemandCategory, ProposalStatus } from '@workspace/api-client-react';
import { ProposalCard } from '@/components/ProposalCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Link } from 'wouter';

export default function Proposals() {
  const [category, setCategory] = useState<DemandCategory | undefined>();
  const [status, setStatus] = useState<ProposalStatus | undefined>();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useListProposals({
    category,
    status,
    page,
    limit: 12,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Propostas</h1>
          <p className="text-muted-foreground mt-1">Conheça, apoie e envie propostas para melhorar a UnDF.</p>
        </div>
        <Button asChild>
          <Link href="/propostas/nova">Enviar Nova Proposta</Link>
        </Button>
      </div>

      <div className="bg-card border rounded-lg p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
        <Select 
          value={category || 'all'} 
          onValueChange={(val) => {
            setCategory(val === 'all' ? undefined : val as DemandCategory);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full md:w-[250px] bg-background">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {Object.values(DemandCategory).map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={status || 'all'} 
          onValueChange={(val) => {
            setStatus(val === 'all' ? undefined : val as ProposalStatus);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full md:w-[200px] bg-background">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value={ProposalStatus.open}>Aberta</SelectItem>
            <SelectItem value={ProposalStatus.under_review}>Em Avaliação</SelectItem>
            <SelectItem value={ProposalStatus.approved}>Aprovada</SelectItem>
            <SelectItem value={ProposalStatus.implemented}>Implementada</SelectItem>
            <SelectItem value={ProposalStatus.rejected}>Rejeitada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="text-center py-20 border rounded-lg bg-destructive/5 text-destructive">
          <p>Ocorreu um erro ao carregar as propostas. Tente novamente mais tarde.</p>
        </div>
      ) : data?.data.length === 0 ? (
        <div className="text-center py-20 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">Nenhuma proposta encontrada com os filtros selecionados.</p>
          <Button variant="link" onClick={() => { setCategory(undefined); setStatus(undefined); }} className="mt-2">
            Limpar filtros
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.data.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal} />
            ))}
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <Button 
                variant="outline" 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {data.totalPages}
              </span>
              <Button 
                variant="outline" 
                disabled={page === data.totalPages}
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
