import { useState } from 'react';
import { useAuth } from '@workspace/auth-web';
import { useAdminListDemands, useUpdateDemandStatus, DemandStatus } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/StatusBadge';
import { toast } from 'sonner';
import { Loader2, Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Admin() {
  const { user, isAuthenticated, login } = useAuth();
  const [statusFilter, setStatusFilter] = useState<DemandStatus | undefined>();
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<DemandStatus>('processing');
  const [adminResponse, setAdminResponse] = useState('');

  const { data, isLoading } = useAdminListDemands({ status: statusFilter, page, limit: 20 });
  const updateStatus = useUpdateDemandStatus();

  if (!isAuthenticated || (user?.role !== 'gestor' && user?.role !== 'administrador')) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <Card>
          <CardContent className="pt-6">
            <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-4">Acesso Restrito</h2>
            <p className="text-muted-foreground mb-6">
              Esta área é exclusiva para gestores e administradores da plataforma Voz UnDF.
            </p>
            {!isAuthenticated && (
              <Button onClick={login}>Entrar</Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleUpdateStatus = (demandId: number) => {
    updateStatus.mutate(
      { id: demandId, data: { status: newStatus, adminResponse: adminResponse.trim() || null } },
      {
        onSuccess: () => {
          toast.success('Status atualizado com sucesso!');
          setEditingId(null);
          setAdminResponse('');
        },
        onError: () => {
          toast.error('Erro ao atualizar status.');
        },
      }
    );
  };

  const STATUS_OPTIONS = [
    { value: 'received', label: 'Recebida' },
    { value: 'processing', label: 'Em Análise' },
    { value: 'completed', label: 'Concluída' },
    { value: 'archived', label: 'Arquivada' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary" />
            Painel Administrativo
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie demandas e respostas da comunidade.
          </p>
        </div>
        <Link href="/transparencia">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Transparência
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <Select
          value={statusFilter || 'all'}
          onValueChange={(v) => {
            setStatusFilter(v === 'all' ? undefined : (v as DemandStatus));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full md:w-[250px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {data?.data.map((demand) => (
            <Card key={demand.id}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{demand.protocol}</span>
                      <StatusBadge status={demand.status} type="demand" />
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {demand.category}
                      </span>
                    </div>
                    {demand.type === 'text' && demand.content && (
                      <p className="text-sm text-foreground line-clamp-2">{demand.content}</p>
                    )}
                    {demand.targetUnit && (
                      <p className="text-xs text-muted-foreground mt-1">Alvo: {demand.targetUnit}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(demand.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    {demand.adminResponse && (
                      <p className="text-xs text-primary mt-2 italic">
                        Resposta: {demand.adminResponse}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{demand.supportCount} apoios</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingId(demand.id);
                        setNewStatus(demand.status as DemandStatus);
                        setAdminResponse(demand.adminResponse || '');
                      }}
                    >
                      Gerenciar
                    </Button>
                  </div>
                </div>

                {editingId === demand.id && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Novo Status</Label>
                        <Select value={newStatus} onValueChange={(v) => setNewStatus(v as DemandStatus)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Resposta da Administração</Label>
                        <Textarea
                          placeholder="Texto da resposta oficial..."
                          value={adminResponse}
                          onChange={(e) => setAdminResponse(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(demand.id)}
                        disabled={updateStatus.isPending}
                      >
                        {updateStatus.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Salvar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {data?.data.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma demanda encontrada.
            </div>
          )}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {data.totalPages}
          </span>
          <Button variant="outline" disabled={page === data.totalPages} onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}>
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
