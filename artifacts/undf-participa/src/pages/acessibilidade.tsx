import { motion } from "framer-motion";
import {
  Monitor,
  MessageCircle,
  Brain,
  Hand,
  FileText,
  Keyboard,
  Volume2,
  ZoomIn,
} from "lucide-react";

const categories = [
  {
    icon: Monitor,
    title: "Acessibilidade digital",
    color: "text-blue-600",
    bg: "bg-blue-50",
    items: [
      "Leitores de tela (compatível com NVDA, VoiceOver e JAWS)",
      "Navegação completa por teclado",
      "Foco visível em todos os elementos interativos",
      "Contraste ajustável entre texto e fundo",
      "Zoom e ampliação pelo navegador sem perda de funcionalidade",
      "Formulários acessíveis com labels e mensagens de erro claras",
      "Hierarquia de títulos semântica (h1, h2, h3…)",
      "Atributos ARIA em componentes dinâmicos",
    ],
  },
  {
    icon: MessageCircle,
    title: "Acessibilidade comunicacional",
    color: "text-[#5B9A6E]",
    bg: "bg-[#5B9A6E]/10",
    items: [
      "Integração com VLibras — tradução para Língua Brasileira de Sinais",
      "Linguagem simples e objetiva em todo o conteúdo",
      "Alternativas textuais para imagens informativas",
      "Legendas e transcrições quando disponíveis",
      "Orientações claras em cada passo dos formulários",
    ],
  },
  {
    icon: Brain,
    title: "Acessibilidade cognitiva",
    color: "text-purple-600",
    bg: "bg-purple-50",
    items: [
      "Modo de foco: reduz distrações, remove animações e amplia espaçamento",
      "Modo de leitura: largura confortável, contraste suave e tipografia legível",
      "Redução de animações respeitando a preferência do sistema operacional",
      "Instruções claras e objetivas em cada etapa",
      "Mensagens de erro explicativas com sugestões de correção",
      "Consistência na navegação e nos padrões visuais",
    ],
  },
  {
    icon: Hand,
    title: "Acessibilidade motora",
    color: "text-orange-600",
    bg: "bg-orange-50",
    items: [
      "Áreas clicáveis com tamanho adequado (mínimo 44×44px)",
      "Todas as ações disponíveis por teclado",
      "Foco gerenciado em modais e painéis",
      "Ausência de gestos obrigatórios — ações alternativas disponíveis",
      "Sem limites de tempo para preenchimento de formulários",
    ],
  },
];

const resources = [
  {
    icon: ZoomIn,
    title: "Tamanho do texto",
    desc: "Aumente ou reduza o tamanho da fonte conforme necessário. A configuração persiste na sua navegação.",
  },
  {
    icon: Monitor,
    title: "Alto contraste",
    desc: "Ative o modo de alto contraste para melhorar a legibilidade em ambientes com muita luz ou para usuários com baixa visão.",
  },
  {
    icon: Brain,
    title: "Modo de foco",
    desc: "Reduz elementos decorativos, remove animações e aumenta o espaçamento para facilitar a concentração.",
  },
  {
    icon: FileText,
    title: "Modo de leitura",
    desc: "Largura confortável, contraste suave e espaçamento ampliado para leitura prolongada.",
  },
  {
    icon: Keyboard,
    title: "Destacar links",
    desc: "Torna links visualmente distintos do restante do texto para facilitar a identificação.",
  },
  {
    icon: Volume2,
    title: "VLibras",
    desc: "Tradução do conteúdo para Língua Brasileira de Sinais por meio do VLibras, recurso oficial do governo brasileiro.",
  },
];

export default function Acessibilidade() {
  return (
    <div className="flex flex-col w-full bg-[#F2F0EB]">
      {/* Hero */}
      <section className="px-6 md:px-12 pt-16 pb-14 border-b border-[#1B3469]/15">
        <div className="max-w-3xl">
          <span className="text-xs tracking-widest uppercase text-[#5B9A6E] font-semibold">Acessibilidade</span>
          <h1
            className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[0.95] tracking-tight text-[#1B3469] mt-4 mb-6"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            acessibilidade<br />no Voz UnDF.
          </h1>
          <p className="text-[#1B3469]/60 text-sm leading-relaxed max-w-2xl">
            Acessibilidade significa remover barreiras para garantir autonomia, segurança e participação de todas as pessoas — independentemente de deficiência, condição ou contexto de uso.
          </p>
          <p className="text-[#1B3469]/50 text-sm mt-4 leading-relaxed max-w-2xl">
            O Voz UnDF busca seguir boas práticas de acessibilidade digital. A plataforma é desenvolvida com atenção às diretrizes WCAG e à Lei Brasileira de Inclusão (Lei nº 13.146/2015).
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="px-6 md:px-12 py-16 border-b border-[#1B3469]/15">
        <h2
          className="text-xl font-bold text-[#1B3469] mb-10"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Dimensões de acessibilidade
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="bg-white border border-[#1B3469]/10 p-8"
            >
              <div className={`w-10 h-10 ${cat.bg} flex items-center justify-center mb-5 rounded`}>
                <cat.icon className={`w-5 h-5 ${cat.color}`} />
              </div>
              <h3
                className="font-bold text-[#1B3469] mb-4"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {cat.title}
              </h3>
              <ul className="space-y-2">
                {cat.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-[#1B3469]/60 leading-relaxed">
                    <span className="text-[#5B9A6E] font-bold mt-0.5 flex-shrink-0">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Built-in resources */}
      <section className="px-6 md:px-12 py-16 border-b border-[#1B3469]/15">
        <h2
          className="text-xl font-bold text-[#1B3469] mb-4"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Recursos disponíveis na plataforma
        </h2>
        <p className="text-[#1B3469]/60 text-sm mb-10 max-w-xl leading-relaxed">
          Acesse o painel de acessibilidade (botão flutuante ou atalho <kbd className="px-1.5 py-0.5 text-xs bg-[#1B3469]/10 rounded font-mono">Alt+P</kbd>) para ativar:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
          {resources.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-[#1B3469]/10 p-6"
            >
              <div className="w-9 h-9 border border-[#1B3469]/15 flex items-center justify-center mb-4">
                <r.icon className="w-4 h-4 text-[#5B9A6E]" />
              </div>
              <h3 className="font-semibold text-[#1B3469] text-sm mb-1.5">{r.title}</h3>
              <p className="text-xs text-[#1B3469]/55 leading-relaxed">{r.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* VLibras note */}
      <section className="px-6 md:px-12 py-16 border-b border-[#1B3469]/15">
        <div className="max-w-3xl bg-white border border-[#1B3469]/10 p-8">
          <h2
            className="font-bold text-[#1B3469] mb-3"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Sobre o VLibras
          </h2>
          <p className="text-sm text-[#1B3469]/65 leading-relaxed mb-3">
            O VLibras é um recurso de tradução automática para Língua Brasileira de Sinais (Libras), disponibilizado pelo governo federal por meio do Ministério da Gestão e da Inovação em Serviços Públicos.
          </p>
          <p className="text-sm text-[#1B3469]/50 leading-relaxed">
            O VLibras é um recurso complementar de acessibilidade comunicacional e não substitui a construção acessível da plataforma como um todo. Para usuários Surdos, recomendamos também utilizar as funcionalidades nativas de acessibilidade digital do Voz UnDF.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="px-6 md:px-12 py-14">
        <div className="max-w-3xl">
          <h2
            className="font-bold text-[#1B3469] mb-3"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Encontrou uma barreira?
          </h2>
          <p className="text-sm text-[#1B3469]/60 leading-relaxed">
            Se você encontrou alguma barreira de acessibilidade na plataforma, registre uma demanda ou sugestão pelo Voz UnDF. Sua colaboração é fundamental para tornar a plataforma mais acessível a todas as pessoas da comunidade acadêmica.
          </p>
          <p className="text-xs text-[#1B3469]/40 mt-4 leading-relaxed">
            O canal institucional específico para reportar barreiras de acessibilidade será definido pela UnDF antes da publicação oficial da plataforma.
          </p>
        </div>
      </section>
    </div>
  );
}
