import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThumbsUp, CalendarDays, MapPin } from 'lucide-react';
import { Proposal, useToggleProposalSupport } from '@workspace/api-client-react';
import { StatusBadge } from './StatusBadge';
import { useAuth } from '@workspace/replit-auth-web';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProposalCardProps {
  proposal: Proposal & { userSupported?: boolean };
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  const { isAuthenticated, login } = useAuth();
  const toggleSupport = useToggleProposalSupport();
  const queryClient = useQueryClient();

  const handleSupport = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast('Autenticação necessária', {
        description: 'Você precisa entrar para apoiar uma proposta.',
        action: {
          label: 'Entrar',
          onClick: login,
        },
      });
      return;
    }

    toggleSupport.mutate(
      { id: proposal.id },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: ['/api/proposals'] });
          toast(data.supported ? 'Apoio registrado' : 'Apoio removido', {
            description: data.supported 
              ? 'Você agora apoia esta proposta.' 
              : 'Você removeu o apoio desta proposta.',
          });
        },
      }
    );
  };

  const formattedDate = format(new Date(proposal.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR });

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow duration-200">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-4 mb-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
            {proposal.category}
          </Badge>
          <StatusBadge status={proposal.status} type="proposal" />
        </div>
        <CardTitle className="text-lg leading-tight line-clamp-2">
          {proposal.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 flex-grow flex flex-col justify-between">
        <p className="text-sm text-foreground/80 line-clamp-4 leading-relaxed mb-4">
          {proposal.description}
        </p>

        <div className="flex flex-col gap-2 text-xs text-muted-foreground mt-auto">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Criada em {formattedDate}</span>
          </div>
          {proposal.targetUnit && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{proposal.targetUnit}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-4 mt-auto flex items-center justify-between border-t bg-muted/10">
        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <div className="bg-primary/10 p-1.5 rounded-full text-primary">
            <ThumbsUp className="w-3.5 h-3.5" />
          </div>
          <span>{proposal.supportCount} apoios</span>
        </div>
        
        <Button 
          variant={proposal.userSupported ? "default" : "outline"}
          size="sm" 
          onClick={handleSupport}
          disabled={toggleSupport.isPending}
          className="h-8"
        >
          {proposal.userSupported ? 'Apoiada' : 'Apoiar Proposta'}
        </Button>
      </CardFooter>
    </Card>
  );
}
