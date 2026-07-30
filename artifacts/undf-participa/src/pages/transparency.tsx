import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import {
  useGetTransparencyStats, useGetDemandsByCategory,
  useGetDemandsByStatus, useGetMonthlyTrend
} from "@workspace/api-client-react";
import { Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const BRAND = ["#1B3469", "#5B9A6E", "#3B7DD8", "#A0522D", "#8B5CF6", "#06B6D4"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border px-4 py-3 text-sm shadow-lg">
      <p className="font-semibold text-foreground mb-1">{label || payload[0].name}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || p.fill }} className="tabular-nums">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function Transparency() {
  const { data: stats, isLoading: ls } = useGetTransparencyStats();
  const { data: byCategory, isLoading: lc } = useGetDemandsByCategory();
  const { data: byStatus, isLoading: lst } = useGetDemandsByStatus();
  const { data: trend, isLoading: lt } = useGetMonthlyTrend();
  const isLoading = ls || lc || lst || lt;

  const kpis = [
    { label: "demandas recebidas", value: stats?.totalDemands ?? "—", accent: false },
    { label: "demandas resolvidas", value: stats?.demandsResolved ?? "—", accent: true },
    { label: "dias médios de resolução", value: stats?.avgResolutionDays ?? "—", accent: false },
    { label: "participantes ativos", value: stats?.totalParticipants ?? "—", accent: false },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* Page header */}
      <div className="px-6 md:px-12 pt-16 pb-16 border-b border-border" data-tour="transparencia">
        <span className="text-xs tracking-widest uppercase text-secondary font-semibold">dados abertos</span>
        <h1 className="text-[clamp(2.4rem,5vw,4.5rem)] font-bold leading-[0.95] tracking-tight text-foreground mt-3">
          transparência.
        </h1>
        <p className="text-muted-foreground mt-4 max-w-lg text-sm leading-relaxed">
          Dados em tempo real sobre as demandas da comunidade universitária.
          Transparência ativa é um pilar da gestão colaborativa da UnDF.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Carregando dados institucionais</span>
        </div>
      ) : (
        <div>
          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border-b border-border">
            {kpis.map((k, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`px-8 py-10 flex flex-col ${k.accent ? "bg-primary text-primary-foreground" : "bg-background"}`}
              >
                <span className={`text-[clamp(2.5rem,5vw,4.5rem)] font-bold tabular-nums leading-none ${k.accent ? "text-white" : "text-foreground"}`}>
                  {String(k.value)}
                </span>
                <span className={`text-xs uppercase tracking-widest mt-3 ${k.accent ? "text-white/60" : "text-muted-foreground"}`}>
                  {k.label}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="px-6 md:px-12 py-14 grid grid-cols-1 lg:grid-cols-2 gap-px bg-border">

            {/* Evolution line chart */}
            <div className="bg-background p-8">
              <span className="text-xs uppercase tracking-widest text-secondary font-semibold">01</span>
              <h2 className="text-xl font-bold text-foreground mt-2 mb-1">Evolução de Registros</h2>
              <p className="text-xs text-muted-foreground mb-6">Volume mensal de demandas recebidas</p>
              <div className="h-64">
                {trend && trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone" dataKey="count" name="Demandas"
                        stroke={BRAND[0]} strokeWidth={2}
                        dot={{ r: 3, fill: BRAND[0] }} activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center flex-col gap-3 text-muted-foreground/40">
                    <AlertCircle className="w-7 h-7" />
                    <span className="text-xs uppercase tracking-wider">Dados insuficientes</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status pie chart */}
            <div className="bg-background p-8">
              <span className="text-xs uppercase tracking-widest text-secondary font-semibold">02</span>
              <h2 className="text-xl font-bold text-foreground mt-2 mb-1">Status Atual</h2>
              <p className="text-xs text-muted-foreground mb-6">Distribuição por etapa de resolução</p>
              <div className="h-64 flex items-center">
                {byStatus && byStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={byStatus} cx="40%" cy="50%" innerRadius={55} outerRadius={85}
                        paddingAngle={4} dataKey="count" nameKey="label">
                        {byStatus.map((_, i) => (
                          <Cell key={i} fill={BRAND[i % BRAND.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend layout="vertical" verticalAlign="middle" align="right"
                        wrapperStyle={{ fontSize: "11px", paddingLeft: "16px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center flex-col gap-3 text-muted-foreground/40">
                    <AlertCircle className="w-7 h-7" />
                    <span className="text-xs uppercase tracking-wider">Sem dados disponíveis</span>
                  </div>
                )}
              </div>
            </div>

            {/* Category bar chart — full width */}
            <div className="bg-background p-8 lg:col-span-2">
              <span className="text-xs uppercase tracking-widest text-secondary font-semibold">03</span>
              <h2 className="text-xl font-bold text-foreground mt-2 mb-1">Demandas por Categoria</h2>
              <p className="text-xs text-muted-foreground mb-6">Principais áreas de solicitação da comunidade acadêmica</p>
              <div className="h-72">
                {byCategory && byCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byCategory} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis dataKey="category" type="category" stroke="hsl(var(--foreground))" fontSize={11} tickLine={false} axisLine={false} width={150} />
                      <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }} />
                      <Bar dataKey="count" name="Registros" radius={0}>
                        {byCategory.map((_, i) => (
                          <Cell key={i} fill={BRAND[i % BRAND.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center flex-col gap-3 text-muted-foreground/40">
                    <AlertCircle className="w-7 h-7" />
                    <span className="text-xs uppercase tracking-wider">Nenhuma categoria registrada</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
