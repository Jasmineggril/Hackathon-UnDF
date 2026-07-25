import { Link } from 'wouter';
import { useGetTransparencyStats, useGetDemandsByCategory, useGetDemandsByStatus, useGetMonthlyTrend } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, PieChart, Activity, Users, MessageSquare, Lightbulb, CheckCircle2 } from 'lucide-react';

export default function Transparency() {
  const { data: stats } = useGetTransparencyStats();
  const { data: byCategory } = useGetDemandsByCategory();
  const { data: byStatus } = useGetDemandsByStatus();
  const { data: monthly } = useGetMonthlyTrend();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Portal de Transparência</h1>
        <p className="text-muted-foreground mt-1">
          Dados agregados reais da participação da comunidade na gestão universitária.
        </p>
      </div>

      {/* Indicadores Gerais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <MessageSquare className="w-8 h-8 text-blue-600 mb-3" />
            <span className="text-3xl font-bold text-foreground">
              {stats?.totalDemands ?? '...'}
            </span>
            <span className="text-sm text-muted-foreground">Demandas Totais</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mb-3" />
            <span className="text-3xl font-bold text-emerald-600">
              {stats?.demandsResolved ?? '...'}
            </span>
            <span className="text-sm text-muted-foreground">Resolvidas</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Lightbulb className="w-8 h-8 text-amber-600 mb-3" />
            <span className="text-3xl font-bold text-amber-600">
              {stats?.totalProposals ?? '...'}
            </span>
            <span className="text-sm text-muted-foreground">Propostas</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Users className="w-8 h-8 text-blue-600 mb-3" />
            <span className="text-3xl font-bold text-blue-600">
              {stats?.totalParticipants ?? '...'}
            </span>
            <span className="text-sm text-muted-foreground">Participantes</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Distribuição por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="w-5 h-5 text-primary" />
              Demandas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {byCategory && byCategory.length > 0 ? (
              <div className="space-y-3">
                {byCategory.map((item) => {
                  const maxCount = Math.max(...byCategory.map((c) => c.count));
                  const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                  return (
                    <div key={item.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{item.category}</span>
                        <span className="text-muted-foreground">{item.count}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum dado disponível ainda.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Distribuição por Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-primary" />
              Demandas por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {byStatus && byStatus.length > 0 ? (
              <div className="space-y-3">
                {byStatus.map((item) => {
                  const maxCount = Math.max(...byStatus.map((s) => s.count));
                  const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                  const colors: Record<string, string> = {
                    received: 'bg-slate-500',
                    processing: 'bg-amber-500',
                    completed: 'bg-emerald-500',
                    archived: 'bg-slate-300',
                  };
                  return (
                    <div key={item.status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-muted-foreground">{item.count}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`rounded-full h-2 transition-all ${colors[item.status] ?? 'bg-primary'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum dado disponível ainda.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tendência Mensal */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
            Tendência Mensal (Últimos 12 meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthly && monthly.length > 0 ? (
            <div className="flex items-end gap-2 h-48">
              {monthly.map((item) => {
                const maxCount = Math.max(...monthly.map((m) => m.count));
                const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-muted-foreground">{item.count}</span>
                    <div
                      className="w-full bg-primary rounded-t-md transition-all min-h-[4px]"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">
              Dados de tendência disponíveis quando houver registros suficientes.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Indicadores-chave */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="w-5 h-5 text-primary" />
            Indicadores de Transparência (ODS 16)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <span className="text-2xl font-bold text-primary block mb-1">
                {stats?.totalDemands ? Math.round(((stats.demandsResolved / stats.totalDemands) * 100)) : 0}%
              </span>
              <span className="text-sm text-muted-foreground">Taxa de Resolução</span>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <span className="text-2xl font-bold text-primary block mb-1">
                {stats?.totalProposals ? Math.round(((stats.proposalsApproved / stats.totalProposals) * 100)) : 0}%
              </span>
              <span className="text-sm text-muted-foreground">Propostas Aprovadas</span>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <span className="text-2xl font-bold text-primary block mb-1">
                {stats?.demandsInProgress ?? 0}
              </span>
              <span className="text-sm text-muted-foreground">Em Andamento</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
