import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@workspace/auth-web";
import {
  useUserStats,
  useUserDemands,
  useUserProposals,
  useUserSupportedDemands,
  useRemoveSupport,
} from "@/hooks/use-user-data";
import { DemoBanner } from "@/components/DemoBanner";
import { EmptyState } from "@/components/EmptyState";
import { Mascote } from "@/components/Mascote";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Copy,
  ExternalLink,
  FileText,
  LogOut,
  Plus,
  User,
  LayoutDashboard,
  Bell,
  Shield,
  Settings,
  Heart,
  BookOpen,
  ClipboardList,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Status labels
// ---------------------------------------------------------------------------

const DEMAND_STATUS_LABELS: Record<string, string> = {
  received: "Recebida",
  in_analysis: "Em Análise",
  processing: "Em Execução",
  awaiting_info: "Aguardando Info",
  completed: "Concluída",
  rejected: "Não Aprovada",
  archived: "Arquivada",
  escalated: "Escalada",
};

const PROPOSAL_STATUS_LABELS: Record<string, string> = {
  open: "Em Participação",
  under_review: "Em Avaliação",
  planned: "Planejada",
  implemented: "Implementada",
  rejected: "Não Aprovada",
  archived: "Arquivada",
};

const STATUS_COLOR: Record<string, string> = {
  received: "bg-blue-100 text-blue-700",
  in_analysis: "bg-amber-100 text-amber-700",
  processing: "bg-purple-100 text-purple-700",
  awaiting_info: "bg-orange-100 text-orange-700",
  completed: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  archived: "bg-gray-100 text-gray-600",
  escalated: "bg-red-100 text-red-700",
  open: "bg-blue-100 text-blue-700",
  under_review: "bg-amber-100 text-amber-700",
  planned: "bg-purple-100 text-purple-700",
  implemented: "bg-green-100 text-green-700",
};

// ---------------------------------------------------------------------------
// DEMAND_STATUS_FILTERS
// ---------------------------------------------------------------------------

const DEMAND_FILTERS = [
  { value: "all", label: "Todas" },
  { value: "received", label: "Recebidas" },
  { value: "in_analysis", label: "Em Análise" },
  { value: "processing", label: "Em Execução" },
  { value: "completed", label: "Respondidas" },
  { value: "rejected", label: "Não Aprovadas" },
  { value: "archived", label: "Arquivadas" },
];

const PROPOSAL_FILTERS = [
  { value: "all", label: "Todas" },
  { value: "open", label: "Em Participação" },
  { value: "under_review", label: "Em Avaliação" },
  { value: "planned", label: "Planejadas" },
  { value: "implemented", label: "Implementadas" },
  { value: "rejected", label: "Não Aprovadas" },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: number | string;
  loading?: boolean;
}) {
  return (
    <div className="bg-white border border-[#1B3469]/10 p-5">
      <p className="text-xs uppercase tracking-widest text-[#1B3469]/40 font-semibold mb-1">
        {label}
      </p>
      {loading ? (
        <Skeleton className="h-8 w-16" />
      ) : (
        <p className="text-3xl font-bold text-[#1B3469]">{value}</p>
      )}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        toast.success("Protocolo copiado!");
      }}
      className="p-1 text-[#1B3469]/40 hover:text-[#1B3469] transition-colors"
      aria-label="Copiar protocolo"
      title="Copiar"
    >
      <Copy className="w-3.5 h-3.5" />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Tab: Visão Geral
// ---------------------------------------------------------------------------

function OverviewTab() {
  const { data: stats, isLoading } = useUserStats();

  const shortcuts = [
    { label: "Nova demanda", href: "/demandas/nova", icon: Plus },
    { label: "Nova proposta", href: "/propostas/nova", icon: BookOpen },
    { label: "Consultar protocolo", href: "/protocolo", icon: ClipboardList },
    { label: "Explorar demandas", href: "/demandas", icon: FileText },
    { label: "Ver transparência", href: "/transparencia", icon: LayoutDashboard },
  ];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-[#1B3469]/10">
        <StatCard label="Demandas" value={stats?.demandTotal ?? 0} loading={isLoading} />
        <StatCard label="Em andamento" value={stats?.demandInProgress ?? 0} loading={isLoading} />
        <StatCard label="Respondidas" value={stats?.demandAnswered ?? 0} loading={isLoading} />
        <StatCard label="Propostas" value={stats?.proposalTotal ?? 0} loading={isLoading} />
        <StatCard label="Apoios dados" value={stats?.supportedTotal ?? 0} loading={isLoading} />
      </div>

      {/* Último protocolo */}
      {stats?.lastProtocol && (
        <div className="border border-[#1B3469]/10 p-5 bg-white">
          <p className="text-xs uppercase tracking-widest text-[#1B3469]/40 font-semibold mb-3">
            Último protocolo
          </p>
          <div className="flex items-center gap-3">
            <code className="text-lg font-mono font-bold text-[#1B3469]">
              {stats.lastProtocol.protocol}
            </code>
            <CopyButton text={stats.lastProtocol.protocol} />
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                STATUS_COLOR[stats.lastProtocol.status] ?? "bg-gray-100 text-gray-600"
              }`}
            >
              {DEMAND_STATUS_LABELS[stats.lastProtocol.status] ?? stats.lastProtocol.status}
            </span>
          </div>
          {stats.lastUpdatedAt && (
            <p className="text-xs text-[#1B3469]/40 mt-1">
              Atualizado em{" "}
              {format(new Date(stats.lastUpdatedAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          )}
        </div>
      )}

      {/* Atalhos */}
      <div>
        <p className="text-xs uppercase tracking-widest text-[#1B3469]/40 font-semibold mb-3">
          Atalhos rápidos
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {shortcuts.map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href}>
              <div className="border border-[#1B3469]/10 bg-white hover:bg-[#1B3469] hover:border-[#1B3469] hover:text-white transition-colors group p-4 flex flex-col items-center gap-2 cursor-pointer">
                <Icon className="w-5 h-5 text-[#1B3469]/60 group-hover:text-white transition-colors" />
                <span className="text-xs font-medium text-[#1B3469]/70 group-hover:text-white text-center transition-colors leading-tight">
                  {label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Minhas Demandas
// ---------------------------------------------------------------------------

function DemandsTab() {
  const [filter, setFilter] = useState("all");
  const { data, isLoading } = useUserDemands(filter === "all" ? undefined : filter);

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        {DEMAND_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`text-xs px-3 py-1.5 border transition-colors font-medium ${
              filter === f.value
                ? "bg-[#1B3469] text-white border-[#1B3469]"
                : "bg-white text-[#1B3469]/70 border-[#1B3469]/15 hover:border-[#1B3469]/40"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : !data?.data.length ? (
        <EmptyState
          icon="📝"
          title="Você ainda não registrou nenhuma demanda."
          description="Registre uma demanda para que a universidade possa atendê-la."
          action={
            <Link href="/demandas/nova">
              <Button className="bg-[#1B3469] hover:bg-[#1B3469]/90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Registrar minha primeira demanda
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {data.data.map((d) => (
            <div key={d.id} className="bg-white border border-[#1B3469]/10 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      STATUS_COLOR[d.status] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {DEMAND_STATUS_LABELS[d.status] ?? d.status}
                  </span>
                  <span className="text-xs text-[#1B3469]/40">{d.category}</span>
                </div>
                <p className="text-sm font-medium text-[#1B3469] truncate">
                  {d.content?.slice(0, 80) || "(sem descrição)"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs font-mono text-[#1B3469]/50">{d.protocol}</code>
                  <CopyButton text={d.protocol} />
                  <span className="text-xs text-[#1B3469]/30">
                    {format(new Date(d.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                  {d.targetUnit && (
                    <span className="text-xs text-[#1B3469]/40 truncate">{d.targetUnit}</span>
                  )}
                </div>
              </div>
              <Link href={`/protocolo?q=${d.protocol}`}>
                <Button variant="outline" size="sm" className="shrink-0 border-[#1B3469]/15 text-[#1B3469]">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Ver detalhes
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Minhas Propostas
// ---------------------------------------------------------------------------

function ProposalsTab() {
  const [filter, setFilter] = useState("all");
  const { data, isLoading } = useUserProposals(filter === "all" ? undefined : filter);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {PROPOSAL_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`text-xs px-3 py-1.5 border transition-colors font-medium ${
              filter === f.value
                ? "bg-[#1B3469] text-white border-[#1B3469]"
                : "bg-white text-[#1B3469]/70 border-[#1B3469]/15 hover:border-[#1B3469]/40"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : !data?.data.length ? (
        <EmptyState
          icon="💡"
          title="Você ainda não apresentou nenhuma proposta."
          description="Compartilhe ideias de melhoria com a comunidade universitária."
          action={
            <Link href="/propostas/nova">
              <Button className="bg-[#1B3469] hover:bg-[#1B3469]/90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Criar minha primeira proposta
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {data.data.map((p) => (
            <div key={p.id} className="bg-white border border-[#1B3469]/10 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      STATUS_COLOR[p.status] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {PROPOSAL_STATUS_LABELS[p.status] ?? p.status}
                  </span>
                  <span className="text-xs text-[#1B3469]/40">{p.category}</span>
                  <span className="text-xs text-[#1B3469]/40">❤️ {p.supportCount} apoios</span>
                </div>
                <p className="text-sm font-medium text-[#1B3469] truncate">{p.title}</p>
                <p className="text-xs text-[#1B3469]/40 mt-0.5">
                  {format(new Date(p.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                </p>
                {p.adminDecision && (
                  <p className="text-xs text-[#1B3469]/60 border-l-2 border-[#5B9A6E]/50 pl-2 mt-1">
                    {p.adminDecision}
                  </p>
                )}
              </div>
              <Link href="/propostas">
                <Button variant="outline" size="sm" className="shrink-0 border-[#1B3469]/15 text-[#1B3469]">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Ver proposta
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Demandas Apoiadas
// ---------------------------------------------------------------------------

function SupportedTab() {
  const { data, isLoading } = useUserSupportedDemands();
  const removeSupport = useRemoveSupport();

  return (
    <div>
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : !data?.data.length ? (
        <EmptyState
          icon="🤝"
          title="Você ainda não apoiou nenhuma demanda."
          description="Quando uma demanda também afetar você, clique em 'Também sou afetado' para ajudar a priorizar."
          action={
            <Link href="/demandas">
              <Button className="bg-[#1B3469] hover:bg-[#1B3469]/90 text-white">
                Explorar demandas
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {data.data.map((d) => (
            <div key={d.id} className="bg-white border border-[#1B3469]/10 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      STATUS_COLOR[d.status] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {DEMAND_STATUS_LABELS[d.status] ?? d.status}
                  </span>
                  <span className="text-xs text-[#1B3469]/40">{d.category}</span>
                  <span className="text-xs text-[#1B3469]/40">❤️ {d.supportCount}</span>
                </div>
                <p className="text-sm font-medium text-[#1B3469] truncate">
                  {d.content?.slice(0, 80) || "(sem descrição)"}
                </p>
                <p className="text-xs text-[#1B3469]/30 mt-0.5">
                  Apoiado em{" "}
                  {format(new Date(d.supportedAt), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/protocolo?q=${d.protocol}`}>
                  <Button variant="outline" size="sm" className="border-[#1B3469]/15 text-[#1B3469]">
                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                    Ver
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-500 hover:bg-red-50"
                    >
                      Retirar apoio
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Retirar apoio?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Você removerá seu apoio a esta demanda. A contagem de apoiadores será
                        atualizada.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => removeSupport.mutate(d.id)}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        Retirar apoio
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Protocolos
// ---------------------------------------------------------------------------

function ProtocolsTab() {
  const { data, isLoading } = useUserDemands();

  return (
    <div>
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : !data?.data.length ? (
        <EmptyState
          icon="🔖"
          title="Nenhum protocolo encontrado."
          description="Seus protocolos aparecem aqui após o registro de demandas."
          action={
            <Link href="/demandas/nova">
              <Button className="bg-[#1B3469] hover:bg-[#1B3469]/90 text-white">
                Registrar demanda
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {data.data.map((d) => (
            <div key={d.id} className="bg-white border border-[#1B3469]/10 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <code className="text-base font-mono font-bold text-[#1B3469]">{d.protocol}</code>
                  <CopyButton text={d.protocol} />
                </div>
                <p className="text-xs text-[#1B3469]/60 mt-0.5 truncate">
                  {d.content?.slice(0, 60) || "(sem descrição)"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      STATUS_COLOR[d.status] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {DEMAND_STATUS_LABELS[d.status] ?? d.status}
                  </span>
                  <span className="text-xs text-[#1B3469]/30">
                    {format(new Date(d.createdAt), "dd/MM/yy", { locale: ptBR })}
                  </span>
                  <span className="text-xs text-[#1B3469]/30">
                    Atualizado: {format(new Date(d.updatedAt), "dd/MM/yy", { locale: ptBR })}
                  </span>
                </div>
              </div>
              <Link href={`/protocolo?q=${d.protocol}`} className="shrink-0">
                <Button variant="outline" size="sm" className="border-[#1B3469]/15 text-[#1B3469]">
                  Acompanhar
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Notificações (estrutural — backend em desenvolvimento)
// ---------------------------------------------------------------------------

function NotificationsTab() {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded">
        <Bell className="w-3.5 h-3.5 shrink-0" />
        <span>Notificações em tempo real estão em desenvolvimento.</span>
      </div>
      <EmptyState
        withMascote
        mascoteMessage="Nenhuma novidade por enquanto!"
        title="Nenhuma notificação por enquanto."
        description="Quando o status de uma demanda ou proposta mudar, você verá aqui."
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Preferências
// ---------------------------------------------------------------------------

function PreferencesTab() {
  const { isMascoteHidden, showMascote } = (() => {
    const hidden = typeof window !== "undefined"
      ? localStorage.getItem("voz-undf:mascote-hidden") === "true"
      : false;
    return {
      isMascoteHidden: hidden,
      showMascote: () => {
        localStorage.removeItem("voz-undf:mascote-hidden");
        window.location.reload();
      },
    };
  })();

  const { reset: resetTour } = (() => {
    return {
      reset: () => {
        localStorage.removeItem("voz-undf:tour-completed");
        toast.success("Tour será exibido na próxima vez que você acessar a plataforma.");
      },
    };
  })();

  return (
    <div className="space-y-6 max-w-lg">
      <div className="border border-[#1B3469]/10 bg-white p-5">
        <p className="font-semibold text-[#1B3469] mb-1 text-sm">Mascote Vozinho</p>
        <p className="text-xs text-[#1B3469]/60 mb-3">
          O Vozinho aparece em dicas e estados vazios.
        </p>
        {isMascoteHidden ? (
          <Button variant="outline" size="sm" onClick={showMascote} className="border-[#1B3469]/15 text-[#1B3469]">
            Reexibir Vozinho
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              localStorage.setItem("voz-undf:mascote-hidden", "true");
              toast.success("Vozinho ocultado.");
            }}
            className="border-[#1B3469]/15 text-[#1B3469]"
          >
            Ocultar Vozinho
          </Button>
        )}
      </div>

      <div className="border border-[#1B3469]/10 bg-white p-5">
        <p className="font-semibold text-[#1B3469] mb-1 text-sm">Tour guiado</p>
        <p className="text-xs text-[#1B3469]/60 mb-3">
          Conheça novamente os recursos da plataforma.
        </p>
        <Button variant="outline" size="sm" onClick={resetTour} className="border-[#1B3469]/15 text-[#1B3469]">
          Ver tour novamente
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Privacidade e Segurança
// ---------------------------------------------------------------------------

function PrivacyTab() {
  const { logout } = useAuth();

  return (
    <div className="space-y-4 max-w-lg">
      <div className="border border-[#1B3469]/10 bg-white p-5">
        <p className="font-semibold text-[#1B3469] mb-1 text-sm">Dados pessoais</p>
        <p className="text-xs text-[#1B3469]/60 leading-relaxed">
          Seus dados são armazenados de forma segura e utilizados apenas para o funcionamento da plataforma, em conformidade com a LGPD. Demandas anônimas não expõem seu nome publicamente.
        </p>
      </div>

      <div className="border border-[#1B3469]/10 bg-white p-5">
        <p className="font-semibold text-[#1B3469] mb-1 text-sm">Sessão ativa</p>
        <p className="text-xs text-[#1B3469]/60 mb-3">
          Ao sair, você será redirecionado para a página inicial.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="border-red-200 text-red-500 hover:bg-red-50"
        >
          <LogOut className="w-3.5 h-3.5 mr-1.5" />
          Sair da conta
        </Button>
      </div>

      <div className="border border-[#1B3469]/10 bg-white p-5">
        <p className="font-semibold text-[#1B3469] mb-1 text-sm">Papel na plataforma</p>
        <p className="text-xs text-[#1B3469]/60">
          Seu papel é definido pela administração da universidade e não pode ser alterado por você. Para solicitar alteração, entre em contato com a gestão.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------

const ROLE_LABELS: Record<string, string> = {
  estudante: "Estudante",
  docente: "Docente",
  servidor: "Servidor",
  gestor: "Gestor",
  administrador: "Administrador",
};

export default function MeuPainel() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  const joinDate = null; // não disponível no AuthUser atual

  return (
    <div className="min-h-screen bg-background">
      <DemoBanner visible={isDemoMode} />

      {/* Cabeçalho do perfil */}
      <div className="px-6 md:px-12 pt-12 pb-10 border-b border-border bg-[#1B3469]">
        <div className="flex flex-col sm:flex-row sm:items-end gap-6">
          {/* Avatar */}
          <div className="w-16 h-16 bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
            <User className="w-8 h-8" />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-bold text-white">
                {user.fullName || user.email?.split("@")[0] || "Usuário"}
              </h1>
              <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded font-medium uppercase tracking-wide">
                {ROLE_LABELS[user.role] ?? user.role}
              </span>
            </div>
            <p className="text-white/50 text-sm">{user.email}</p>
            {isDemoMode && (
              <span className="inline-block mt-1 text-xs bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-medium">
                Conta de demonstração
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 md:px-12 py-8">
        <Tabs defaultValue="overview">
          <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-1 bg-transparent p-0 mb-8 border-b border-border pb-0">
            {[
              { value: "overview", label: "Visão geral", icon: LayoutDashboard },
              { value: "demands", label: "Minhas demandas", icon: FileText },
              { value: "proposals", label: "Minhas propostas", icon: BookOpen },
              { value: "supported", label: "Demandas apoiadas", icon: Heart },
              { value: "protocols", label: "Protocolos", icon: ClipboardList },
              { value: "notifications", label: "Notificações", icon: Bell },
              { value: "preferences", label: "Preferências", icon: Settings },
              { value: "privacy", label: "Privacidade", icon: Shield },
            ].map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1B3469] data-[state=active]:text-[#1B3469] data-[state=active]:bg-transparent text-[#1B3469]/50 hover:text-[#1B3469] px-3 pb-3 gap-1.5 text-sm"
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.split(" ")[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview"><OverviewTab /></TabsContent>
          <TabsContent value="demands"><DemandsTab /></TabsContent>
          <TabsContent value="proposals"><ProposalsTab /></TabsContent>
          <TabsContent value="supported"><SupportedTab /></TabsContent>
          <TabsContent value="protocols"><ProtocolsTab /></TabsContent>
          <TabsContent value="notifications"><NotificationsTab /></TabsContent>
          <TabsContent value="preferences"><PreferencesTab /></TabsContent>
          <TabsContent value="privacy"><PrivacyTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
