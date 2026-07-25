import { useState } from 'react';
import { useLocation } from 'wouter';
import { useCreateProposal, DemandCategory } from '@workspace/api-client-react';
import { useAuth } from '@workspace/auth-web';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Lightbulb } from 'lucide-react';

export default function NewProposal() {
  const { isAuthenticated, login } = useAuth();
  const [, navigate] = useLocation();
  const createProposal = useCreateProposal();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DemandCategory>('Sugestão de Melhoria');
  const [targetUnit, setTargetUnit] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-4">Autenticação Necessária</h2>
            <p className="text-muted-foreground mb-6">
              Você precisa estar logado para submeter uma proposta.
            </p>
            <Button onClick={login}>Entrar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (title.trim().length < 10) {
      toast.error('O título deve ter pelo menos 10 caracteres.');
      return;
    }
    if (description.trim().length < 30) {
      toast.error('A descrição deve ter pelo menos 30 caracteres.');
      return;
    }

    createProposal.mutate(
      {
        data: {
          title: title.trim(),
          description: description.trim(),
          category,
          targetUnit: targetUnit.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toast.success('Proposta submetida com sucesso!');
          navigate('/propostas');
        },
        onError: () => {
          toast.error('Erro ao submeter proposta. Tente novamente.');
        },
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" onClick={() => navigate('/propostas')} className="mb-6 gap-2">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Enviar Nova Proposta
          </CardTitle>
          <CardDescription>
            Proponha melhorias, inovações ou soluções para a comunidade universitária.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Título da Proposta *</Label>
              <Input
                placeholder="Ex: Criação de espaço de estudo colaborativo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground text-right">
                {title.length}/200
              </p>
            </div>

            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as DemandCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(DemandCategory).map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Descrição Detalhada *</Label>
              <Textarea
                placeholder="Descreva sua proposta, justificativa e benefícios esperados..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                maxLength={5000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/5000 (mínimo 30)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Unidade/Local alvo (opcional)</Label>
              <Input
                placeholder="Ex: Diretoria Acadêmica, Centro de Tecnologia"
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={createProposal.isPending} className="gap-2">
                {createProposal.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Submeter Proposta
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/propostas')}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
