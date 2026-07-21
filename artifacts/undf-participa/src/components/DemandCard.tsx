import { Link } from 'wouter';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, ThumbsUp, CalendarDays, MapPin } from 'lucide-react';
import { Demand, useToggleDemandSupport } from '@workspace/api-client-react';
import { StatusBadge } from './StatusBadge';
import { useAuth } from '@workspace/replit-auth-web';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DemandCardProps {
  demand: Demand & { userSupported?: boolean };
}

export function DemandCard({ demand }: DemandCardProps) {
  const { isAuthenticated, login } = useAuth();
  const toggleSupport = useToggleDemandSupport();
  const queryClient = useQueryClient();

  const handleSupport = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast('Autenticação necessária', {
        description: 'Você precisa entrar para apoiar uma demanda.',
        action: {
          label: 'Entrar',
          onClick: login,
        },
      });
      return;
    }

    toggleSupport.mutate(
      { id: demand.id },
      {
        onSuccess: (data) => {
          // Optimistically update the list cache if we want, but simple invalidate is fine or manual set
          // Given the list might be complex, we'll invalidate the demands list
          queryClient.invalidateQueries({ queryKey: ['/api/demands'] });
          toast(data.supported ? 'Apoio registrado' : 'Apoio removido', {
            description: data.supported 
              ? 'Você agora apoia esta demanda como afetado.' 
              : 'Você não apoia mais esta demanda.',
          });
        },
      }
    );
  };

  const formattedDate = format(new Date(demand.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR });

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow duration-200">
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Badge variant="outline" className="w-fit text-xs font-normal text-muted-foreground">
            Protocolo: {demand.protocol}
          </Badge>
          <div className="flex gap-2 items-center mt-1">
            <StatusBadge status={demand.status} type="demand" />
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
              {demand.category}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 flex-grow">
        {demand.type === 'text' && demand.content ? (
          <p className="text-sm text-foreground line-clamp-3 leading-relaxed">
            {demand.content}
          </p>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground italic bg-muted/50 p-3 rounded-md">
            <MessageSquare className="w-4 h-4" />
            <span>Demanda registrada via {demand.type === 'audio' ? 'áudio' : 'imagem'}</span>
          </div>
        )}

        <div className="flex flex-col gap-2 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Registrada em {formattedDate}</span>
          </div>
          {demand.targetUnit && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{demand.targetUnit}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 mt-auto flex items-center justify-between border-t bg-muted/20 pb-4">
        <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <ThumbsUp className="w-4 h-4 text-primary" />
          <span>{demand.supportCount} afetado{demand.supportCount !== 1 ? 's' : ''}</span>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={demand.userSupported ? "default" : "outline"}
            size="sm" 
            className="text-xs h-8"
            onClick={handleSupport}
            disabled={toggleSupport.isPending}
          >
            {demand.userSupported ? 'Apoiado' : 'Também sou afetado'}
          </Button>
          
          <Button variant="ghost" size="sm" className="text-xs h-8" asChild>
            <Link href={`/protocolo?p=${demand.protocol}`}>
              Detalhes
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
