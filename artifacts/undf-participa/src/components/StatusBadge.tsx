import { Badge } from '@/components/ui/badge';
import { DemandStatus, ProposalStatus } from '@workspace/api-client-react';

interface StatusBadgeProps {
  status: DemandStatus | ProposalStatus | string;
  type?: 'demand' | 'proposal';
}

export function StatusBadge({ status, type = 'demand' }: StatusBadgeProps) {
  if (type === 'demand') {
    switch (status) {
      case DemandStatus.received:
        return <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">Recebida</Badge>;
      case DemandStatus.processing:
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">Em Análise</Badge>;
      case DemandStatus.completed:
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200">Concluída</Badge>;
      case DemandStatus.archived:
        return <Badge variant="outline" className="text-slate-500 border-slate-200">Arquivada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  // Proposal
  switch (status) {
    case ProposalStatus.open:
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">Aberta</Badge>;
    case ProposalStatus.under_review:
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">Em Avaliação</Badge>;
    case ProposalStatus.approved:
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200">Aprovada</Badge>;
    case ProposalStatus.rejected:
      return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">Rejeitada</Badge>;
    case ProposalStatus.implemented:
      return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-indigo-200">Implementada</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
