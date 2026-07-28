import { motion } from "framer-motion";
import { Shield, Users, GitBranch, BarChart2, Eye, Lock, MessageSquare, ClipboardCheck, AlertTriangle } from "lucide-react";

const roles = [
  {
    role: "Estudante",
    color: "bg-[#5B9A6E]/10 text-[#5B9A6E] border-[#5B9A6E]/20",
    responsibilities: ["Registrar demandas", "Acompanhar andamento", "Apoiar demandas coletivas", "Apresentar propostas", "Consultar protocolo", "Respeitar as regras da plataforma"],
  },
  {
    role: "Docente / Servidor",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    responsibilities: ["Registrar demandas", "Acompanhar andamento", "Apoiar demandas coletivas", "Apresentar propostas formais", "Colaborar com a gestão", "Respeitar as regras"],
  },
  {
    role: "Gestor",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    responsibilities: ["Triar demandas recebidas", "Encaminhar ao setor responsável", "Definir prazo de atendimento", "Atualizar status", "Registrar resposta institucional", "Analisar indicadores e relatórios"],
  },
  {
    role: "Administrador",
    color: "bg-red-50 text-red-700 border-red-200",
    responsibilities: ["Gerenciar permissões e roles", "Configurar categorias", "Auditar registros", "Manter segurança da plataforma", "Administrar o sistema", "Supervisionar moderação"],
  },
];

const flow = [
  { step: "01", title: "Registro", desc: "Usuário autenticado registra a manifestação com tipo, categoria e descrição." },
  { step: "02", title: "Protocolo", desc: "Sistema gera um protocolo único no formato VUNDF-AAAAMMDD-XXXX." },
  { step: "03", title: "Triagem", desc: "Gestor verifica a demanda, classifica e encaminha ao setor responsável." },
  { step: "04", title: "Análise", desc: "Setor responsável analisa a demanda e define prazo estimado de resposta." },
  { step: "05", title: "Resposta", desc: "Gestor registra a resposta institucional e atualiza o status." },
  { step: "06", title: "Conclusão", desc: "Demanda é concluída. Histórico e indicadores são atualizados." },
];

const criteria = [
  "Número de pessoas que indicaram 'Também sou afetado'",
  "Repetição de demandas similares em categorias ou unidades",
  "Impacto estimado na comunidade acadêmica",
  "Urgência e prazo declarado pelo registrante",
  "Alinhamento com objetivos institucionais e ODS",
  "Demandas de grupos vulneráveis ou em situação especial",
];

const sections = [
  {
    icon: Shield,
    title: "Objetivo da governança",
    content:
      "A governança do Voz UnDF define as diretrizes, responsabilidades, práticas de controle e acompanhamento que orientam o funcionamento da plataforma. Diferente da gestão operacional, a governança estabelece o quadro de regras que protege direitos, garante transparência, monitora riscos e orienta a tomada de decisão.",
  },
  {
    icon: GitBranch,
    title: "Diferença entre governança e gestão",
    content:
      "Governança define diretrizes, estabelece responsabilidades, acompanha resultados, protege direitos, garante transparência e monitora riscos. Gestão executa atividades, recebe demandas, encaminha, responde, atualiza status e acompanha prazos. Ambas são necessárias e complementares.",
  },
  {
    icon: BarChart2,
    title: "Critérios de priorização",
    content: "",
    list: criteria,
  },
  {
    icon: Eye,
    title: "Transparência",
    content:
      "Todos os dados públicos da plataforma são acessíveis sem necessidade de login. Indicadores de demandas, status, categorias e prazos são atualizados em tempo real. Dados pessoais e informações sensíveis são protegidos e não compõem os relatórios públicos.",
  },
  {
    icon: ClipboardCheck,
    title: "Auditoria",
    content:
      "O sistema registra o histórico de status de cada demanda com data, responsável e conteúdo da atualização. Administradores têm acesso a logs de operações críticas para fins de auditoria. Registros não podem ser excluídos por usuários comuns.",
  },
  {
    icon: Lock,
    title: "Privacidade e segurança",
    content:
      "O Voz UnDF segue as diretrizes da LGPD (Lei nº 13.709/2018). Dados pessoais são coletados com finalidade definida e armazenados de forma segura. Demandas anônimas não expõem a identidade do autor. Apoios a demandas e propostas são contabilizados sem divulgação pública dos apoiadores.",
  },
  {
    icon: AlertTriangle,
    title: "Moderação",
    content:
      "Conteúdos que violem os Termos de Uso (ameaças, discriminação, dados de terceiros, conteúdo ilegal) podem ser removidos por gestores ou administradores. O usuário que registrou o conteúdo poderá ser notificado. Casos graves poderão ser encaminhados às instâncias competentes da UnDF.",
  },
  {
    icon: MessageSquare,
    title: "Prestação de contas",
    content:
      "A plataforma publica indicadores públicos de atendimento: demandas recebidas, em andamento, respondidas e concluídas. Prazos médios de resposta são monitorados. A transparência dos dados é um compromisso central do Voz UnDF com a comunidade acadêmica.",
  },
];

export default function Governanca() {
  return (
    <div className="flex flex-col w-full bg-[#F2F0EB]">
      {/* Hero */}
      <section className="px-6 md:px-12 pt-16 pb-14 border-b border-[#1B3469]/15">
        <div className="max-w-5xl">
          <span className="text-xs tracking-widest uppercase text-[#5B9A6E] font-semibold">Governança</span>
          <h1
            className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[0.95] tracking-tight text-[#1B3469] mt-4 mb-6"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            governança<br />do Voz UnDF.
          </h1>
          <p className="text-[#1B3469]/60 max-w-2xl text-base leading-relaxed">
            Governança é o conjunto de regras, responsabilidades, práticas de liderança, controle e acompanhamento que orienta o funcionamento da plataforma.
          </p>
        </div>
      </section>

      {/* Sections */}
      <section className="px-6 md:px-12 py-16 border-b border-[#1B3469]/15">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
          {sections.map((sec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-8 border border-[#1B3469]/10"
            >
              <div className="w-10 h-10 border border-[#1B3469]/15 flex items-center justify-center mb-5">
                <sec.icon className="w-5 h-5 text-[#5B9A6E]" />
              </div>
              <h2
                className="font-bold text-[#1B3469] mb-3"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {sec.title}
              </h2>
              {sec.content && (
                <p className="text-sm text-[#1B3469]/60 leading-relaxed">{sec.content}</p>
              )}
              {sec.list && (
                <ul className="space-y-2 mt-1">
                  {sec.list.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-[#1B3469]/60">
                      <span className="text-[#5B9A6E] mt-0.5">—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Flow */}
      <section className="px-6 md:px-12 py-16 border-b border-[#1B3469]/15">
        <h2
          className="text-2xl font-bold text-[#1B3469] mb-10"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Fluxo de atendimento
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1B3469]/10 max-w-5xl">
          {flow.map((f, i) => (
            <div key={i} className="bg-[#F2F0EB] p-6">
              <span
                className="text-3xl font-bold text-[#1B3469]/15"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {f.step}
              </span>
              <h3
                className="font-bold text-[#1B3469] mt-2 mb-2"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {f.title}
              </h3>
              <p className="text-sm text-[#1B3469]/60 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="px-6 md:px-12 py-16">
        <h2
          className="text-2xl font-bold text-[#1B3469] mb-4"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Papéis e responsabilidades
        </h2>
        <p className="text-[#1B3469]/60 text-sm mb-10 max-w-xl">
          Cada participante da plataforma possui um conjunto específico de responsabilidades. Roles administrativas não estão disponíveis para cadastro público.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl">
          {roles.map((r, i) => (
            <div key={i} className="bg-white border border-[#1B3469]/10 p-6">
              <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded border mb-4 ${r.color}`}>
                {r.role}
              </span>
              <ul className="space-y-2">
                {r.responsibilities.map((resp, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-[#1B3469]/60 leading-relaxed">
                    <span className="text-[#5B9A6E] mt-0.5 font-bold">·</span>
                    {resp}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
