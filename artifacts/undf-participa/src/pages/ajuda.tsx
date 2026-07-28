import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ChevronDown, ChevronUp, BookOpen, MessageSquare, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTour } from "@/components/GuidedTour";

interface FaqItem {
  q: string;
  a: string;
  category: string;
}

const FAQ: FaqItem[] = [
  // Conta
  {
    category: "conta",
    q: "Como criar uma conta?",
    a: "Acesse a página de login e clique em 'Solicite acesso'. Utilize seu e-mail institucional da UnDF. Após o cadastro, você receberá um e-mail de confirmação.",
  },
  {
    category: "conta",
    q: "Como entrar na plataforma?",
    a: "Na página de login, insira seu e-mail institucional e senha, depois clique em Entrar. Se esqueceu sua senha, clique em Esqueceu? para redefinir.",
  },
  // Demandas
  {
    category: "demandas",
    q: "Como registrar uma demanda?",
    a: "Clique em Nova demanda no menu superior ou na página inicial. Preencha o tipo, categoria e descrição. Você pode optar por enviar de forma anônima. Ao confirmar, um número de protocolo é gerado automaticamente.",
  },
  {
    category: "demandas",
    q: "Como gravar áudio em uma demanda?",
    a: "No formulário de nova demanda, selecione o tipo Áudio. Clique no botão de microfone e fale sua demanda. O áudio será enviado junto com o formulário.",
  },
  {
    category: "demandas",
    q: "Como acompanhar minha demanda?",
    a: "Use o número de protocolo (ex: VUNDF-20260726-4821) na página Consultar protocolo ou acesse Meu painel → Protocolos para ver todas as suas demandas.",
  },
  {
    category: "demandas",
    q: "O que significa cada status?",
    a: "Recebida: sua demanda chegou à equipe. Em Análise: está sendo avaliada. Em Execução: está sendo tratada. Respondida: foi respondida pela gestão. Concluída: foi resolvida. Arquivada: encerrada sem resolução.",
  },
  // Propostas
  {
    category: "propostas",
    q: "Como criar uma proposta?",
    a: "Acesse Propostas no menu e clique em Nova proposta. Descreva sua ideia de melhoria, a categoria e a unidade responsável. Propostas com mais apoios ganham prioridade.",
  },
  {
    category: "propostas",
    q: "Como apoiar uma demanda?",
    a: "Na lista de demandas, clique em Também sou afetado na demanda que também te afeta. Isso ajuda a gestão a identificar e priorizar problemas coletivos.",
  },
  // Privacidade
  {
    category: "privacidade",
    q: "Como funciona o anonimato?",
    a: "Ao marcar Registrar anonimamente, seu nome não será exibido publicamente. A equipe autorizada poderá acessar dados necessários para o tratamento da manifestação, conforme as regras de privacidade e a LGPD.",
  },
  {
    category: "privacidade",
    q: "Meus dados são protegidos?",
    a: "Sim. A plataforma segue a Lei Geral de Proteção de Dados (LGPD). Dados pessoais são armazenados de forma segura e utilizados apenas para o funcionamento do serviço.",
  },
  // Transparência
  {
    category: "transparencia",
    q: "Como funciona a transparência?",
    a: "A página de Transparência exibe indicadores públicos: total de demandas, distribuição por categoria e status, tendências mensais. Os dados são atualizados automaticamente.",
  },
  // Acessibilidade
  {
    category: "acessibilidade",
    q: "Como usar o VLibras?",
    a: "O widget VLibras aparece no canto da tela. Clique nele para ativar a tradução em Língua Brasileira de Sinais (Libras) do conteúdo da página.",
  },
  {
    category: "acessibilidade",
    q: "Como usar o modo de foco?",
    a: "No painel de acessibilidade, ative o Modo de foco para reduzir distrações visuais. Você também pode aumentar o tamanho do texto e ativar alto contraste.",
  },
  // Contato
  {
    category: "contato",
    q: "Como entrar em contato com a equipe?",
    a: "Para dúvidas institucionais, use o canal de demandas da própria plataforma (categoria Comunicação Institucional). Para suporte técnico, envie um e-mail para o setor de TI da UnDF.",
  },
];

const CATEGORIES = [
  { id: "all", label: "Todas" },
  { id: "conta", label: "Conta e acesso" },
  { id: "demandas", label: "Demandas" },
  { id: "propostas", label: "Propostas" },
  { id: "privacidade", label: "Privacidade" },
  { id: "transparencia", label: "Transparência" },
  { id: "acessibilidade", label: "Acessibilidade" },
  { id: "contato", label: "Contato" },
];

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  if (!items.length) {
    return (
      <div className="py-12 text-center text-[#1B3469]/40 text-sm">
        Nenhuma pergunta encontrada para sua busca.
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#1B3469]/10">
      {items.map((item, i) => (
        <div key={i}>
          <button
            className="w-full flex items-start justify-between py-4 text-left gap-4 group focus-visible:outline-2 focus-visible:outline-[#1B3469] focus-visible:rounded"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            aria-controls={`faq-answer-${i}`}
          >
            <span className="font-medium text-[#1B3469] text-sm group-hover:text-[#1B3469]/80 transition-colors">
              {item.q}
            </span>
            <span className="shrink-0 mt-0.5 text-[#1B3469]/40">
              {open === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </button>
          <div
            id={`faq-answer-${i}`}
            hidden={open !== i}
            className="pb-4 text-sm text-[#1B3469]/70 leading-relaxed"
          >
            {item.a}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Ajuda() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const { reopen } = useTour();

  const filtered = FAQ.filter((item) => {
    const matchesCat = category === "all" || item.category === category;
    const matchesSearch =
      !search ||
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-6 md:px-12 pt-16 pb-16 border-b border-border">
        <span className="text-xs tracking-widest uppercase text-secondary font-semibold">
          central de ajuda
        </span>
        <h1 className="text-[clamp(2.4rem,5vw,4.5rem)] font-bold leading-[0.95] tracking-tight text-foreground mt-3 mb-4">
          como podemos<br />
          <span className="text-primary">te ajudar?</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-md leading-relaxed mb-8">
          Encontre respostas para as perguntas mais frequentes sobre o Voz UnDF.
        </p>

        {/* Busca */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar pergunta..."
            className="pl-11 h-12 bg-card border-border"
            aria-label="Buscar na central de ajuda"
          />
        </div>
      </div>

      <div className="px-6 md:px-12 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar de categorias */}
        <aside aria-label="Categorias de ajuda">
          <p className="text-xs uppercase tracking-widest text-[#1B3469]/40 font-semibold mb-3">
            Categorias
          </p>
          <nav className="flex flex-col gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`text-left px-3 py-2 text-sm font-medium transition-colors ${
                  category === cat.id
                    ? "bg-[#1B3469] text-white"
                    : "text-[#1B3469]/70 hover:text-[#1B3469] hover:bg-[#1B3469]/5"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </nav>

          {/* Tour guiado */}
          <div className="mt-8 p-4 border border-[#1B3469]/10 bg-white">
            <BookOpen className="w-5 h-5 text-[#1B3469]/50 mb-2" />
            <p className="text-sm font-semibold text-[#1B3469] mb-1">Tour guiado</p>
            <p className="text-xs text-[#1B3469]/60 mb-3 leading-relaxed">
              Reveja os principais recursos da plataforma em um tour interativo.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={reopen}
              className="w-full border-[#1B3469]/15 text-[#1B3469] text-xs"
            >
              Ver tour novamente
            </Button>
          </div>
        </aside>

        {/* FAQ */}
        <main className="md:col-span-3">
          {search && (
            <p className="text-xs text-[#1B3469]/40 mb-4">
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""} para &ldquo;{search}&rdquo;
            </p>
          )}

          <FaqAccordion items={filtered} />

          {/* CTA contato */}
          <div className="mt-12 border border-[#1B3469]/10 bg-white p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <MessageSquare className="w-8 h-8 text-[#1B3469]/30 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-[#1B3469] mb-1 text-sm">Não encontrou sua resposta?</p>
              <p className="text-xs text-[#1B3469]/60">
                Registre uma demanda na plataforma na categoria Comunicação Institucional e nossa equipe responderá.
              </p>
            </div>
            <Link href="/demandas/nova">
              <Button className="bg-[#1B3469] hover:bg-[#1B3469]/90 text-white text-sm shrink-0">
                Abrir chamado
                <ExternalLink className="w-3.5 h-3.5 ml-2" />
              </Button>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
