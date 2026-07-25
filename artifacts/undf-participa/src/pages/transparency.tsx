import { useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { 
  useGetTransparencyStats, 
  useGetDemandsByCategory, 
  useGetDemandsByStatus, 
  useGetMonthlyTrend 
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, PieChart as PieChartIcon, Activity, AlertCircle, Loader2 } from "lucide-react";

const COLORS = ['#1D3461', '#4A9B6F', '#F59E0B', '#E11D48', '#8B5CF6', '#06B6D4', '#14B8A6', '#F97316'];

export default function Transparency() {
  const { data: stats, isLoading: loadingStats } = useGetTransparencyStats();
  const { data: byCategory, isLoading: loadingCat } = useGetDemandsByCategory();
  const { data: byStatus, isLoading: loadingStatus } = useGetDemandsByStatus();
  const { data: trend, isLoading: loadingTrend } = useGetMonthlyTrend();

  const isLoading = loadingStats || loadingCat || loadingStatus || loadingTrend;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border p-3 rounded-lg shadow-lg">
          <p className="font-medium text-foreground mb-1">{label || payload[0].name}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} className="text-sm" style={{ color: p.color || p.fill }}>
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Painel de Transparência</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">
          Acompanhe os dados em tempo real sobre as demandas da comunidade universitária. 
          A transparência ativa é um pilar da gestão colaborativa da UnDF.
        </p>
      </div>

      {isLoading ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground font-medium">Carregando dados institucionais...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main Stats KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-primary text-primary-foreground border-none">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-primary-foreground/80 font-medium text-sm mb-1 uppercase tracking-wider">Demandas Recebidas</p>
                    <h3 className="text-4xl font-bold">{stats?.totalDemands || 0}</h3>
                  </div>
                  <Activity className="w-8 h-8 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-secondary text-secondary-foreground border-none">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-secondary-foreground/80 font-medium text-sm mb-1 uppercase tracking-wider">Demandas Resolvidas</p>
                    <h3 className="text-4xl font-bold">{stats?.demandsResolved || 0}</h3>
                  </div>
                  <div className="w-8 h-8 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-muted-foreground font-medium text-sm mb-1 uppercase tracking-wider">Tempo Médio (Dias)</p>
                    <h3 className="text-4xl font-bold text-foreground">{stats?.avgResolutionDays || "-"}</h3>
                  </div>
                  <div className="w-8 h-8 opacity-20 text-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-muted-foreground font-medium text-sm mb-1 uppercase tracking-wider">Comunidade Ativa</p>
                    <h3 className="text-4xl font-bold text-foreground">{stats?.totalParticipants || 0}</h3>
                  </div>
                  <div className="w-8 h-8 opacity-20 text-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart 1: Evolution over time */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" /> 
                  Evolução de Registros
                </CardTitle>
                <CardDescription>Volume de demandas recebidas nos últimos meses</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {trend && trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        name="Demandas" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: "hsl(var(--primary))" }} 
                        activeDot={{ r: 6 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground flex-col">
                    <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
                    <span>Dados insuficientes para o período.</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chart 2: Status breakdown */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-primary" /> 
                  Status Atual
                </CardTitle>
                <CardDescription>Distribuição das demandas por etapa de resolução</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center">
                {byStatus && byStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={byStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="label"
                      >
                        {byStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground flex-col">
                    <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
                    <span>Nenhuma demanda registrada ainda.</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chart 3: Categories */}
            <Card className="shadow-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" /> 
                  Demandas por Categoria
                </CardTitle>
                <CardDescription>Principais áreas de solicitação da comunidade acadêmica</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                {byCategory && byCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byCategory} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis dataKey="category" type="category" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} width={150} />
                      <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
                      <Bar dataKey="count" name="Registros" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]}>
                        {byCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground flex-col">
                    <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
                    <span>Nenhuma categoria registrada.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
