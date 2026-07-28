import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const pillars = [
  {
    num: "01",
    title: "Transparência Ativa",
    desc: "Todos os processos possuem um fluxo visível. Da abertura ao arquivamento, o usuário acompanha via código de protocolo em tempo real.",
  },
  {
    num: "02",
    title: "Acessibilidade Universal",
    desc: "Desenvolvida para ser utilizada por todos. Suporte a VLibras, modos de leitura, controle de contraste e navegação simplificada.",
  },
  {
    num: "03",
    title: "Inteligência de Dados",
    desc: "O painel de transparência agrega as demandas e gera insights para a gestão alocar recursos onde são mais necessários.",
  },
  {
    num: "04",
    title: "Colaboração",
    desc: "Através do recurso \"Também sou afetado\", a comunidade valida e prioriza organicamente as necessidades mais urgentes.",
  },
];

const values = [
  "Participação",
  "Transparência",
  "Inclusão",
  "Acessibilidade",
  "Respeito",
  "Colaboração",
  "Segurança",
  "Privacidade",
  "Responsabilidade",
  "Inovação",
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <div className="px-6 md:px-12 pt-16 pb-16 border-b border-border">
        <span className="text-xs tracking-widest uppercase text-secondary font-semibold">sobre</span>
        <h1 className="text-[clamp(2.8rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-tight text-foreground mt-3 max-w-2xl">
          conheça o<br />
          <span className="text-primary">voz undf.</span>
        </h1>
        <p className="text-muted-foreground mt-6 max-w-xl text-base leading-relaxed">
          A Plataforma Inteligente de Participação e Gestão Colaborativa da Universidade do Distrito Federal.
        </p>
      </div>

      {/* Intro section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border-b border-border">
        <div className="md:col-span-5 px-6 md:px-12 py-14 md:border-r border-border flex items-start">
          <span className="text-[7rem] font-bold leading-none text-foreground/5 select-none">
            ✦
          </span>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="md:col-span-7 px-6 md:px-12 py-14"
        >
          <p className="text-base leading-relaxed text-foreground/80 mb-6">
            O <strong>Voz UnDF</strong> é uma plataforma de participação e gestão colaborativa criada para aproximar a comunidade acadêmica da gestão universitária, organizar demandas, ampliar a transparência e apoiar decisões baseadas em evidências.
          </p>
          <p className="text-base leading-relaxed text-foreground/80">
            Acreditamos que uma universidade de excelência é construída coletivamente. O Voz UnDF empodera estudantes, professores, servidores e gestores a participarem ativamente das decisões que moldam a instituição — garantindo que toda solicitação seja registrada, acompanhada e respondida com total clareza.
          </p>
        </motion.div>
      </div>

      {/* Missão, Visão e Valores */}
      <div className="px-6 md:px-12 py-16 border-b border-border">
        <div className="mb-10">
          <span className="text-xs tracking-widest uppercase text-secondary font-semibold">01</span>
          <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[0.95] tracking-tight text-foreground mt-3">
            missão, visão<br />e valores.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border mb-12">
          {/* Missão */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-background px-8 py-10"
          >
            <span className="text-xs tracking-widest uppercase text-secondary font-semibold block mb-3">Missão</span>
            <p className="text-foreground/80 text-sm leading-relaxed">
              Fortalecer a participação da comunidade acadêmica por meio de um canal acessível, transparente e seguro, transformando demandas e propostas em informações úteis para a melhoria da Universidade.
            </p>
          </motion.div>

          {/* Visão */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="bg-background px-8 py-10"
          >
            <span className="text-xs tracking-widest uppercase text-secondary font-semibold block mb-3">Visão</span>
            <p className="text-foreground/80 text-sm leading-relaxed">
              Ser uma referência em participação universitária digital, promovendo uma UnDF mais aberta, inclusiva, responsiva e conectada com as necessidades de sua comunidade.
            </p>
          </motion.div>
        </div>

        {/* Valores */}
        <div>
          <span className="text-xs tracking-widest uppercase text-secondary font-semibold block mb-4">Valores</span>
          <div className="flex flex-wrap gap-2">
            {values.map((v) => (
              <span
                key={v}
                className="border border-primary/20 text-primary/80 text-xs px-3 py-1.5 font-medium hover:bg-primary hover:text-white transition-colors"
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Objetivo, público, problema */}
      <div className="px-6 md:px-12 py-16 border-b border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {[
            {
              label: "Objetivo",
              text: "Criar um canal institucional acessível para que toda a comunidade UnDF possa registrar demandas, apresentar propostas e acompanhar respostas com transparência.",
            },
            {
              label: "Público atendido",
              text: "Estudantes, docentes, servidores e gestores da Universidade do Distrito Federal, garantindo que todas as vozes sejam ouvidas independentemente de cargo ou função.",
            },
            {
              label: "Problema resolvido",
              text: "A falta de um canal centralizado, acessível e transparente para participação cidadã no ambiente universitário, que transforma demandas individuais em prioridades coletivas.",
            },
          ].map((item) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-background px-8 py-10"
            >
              <span className="text-xs tracking-widest uppercase text-secondary font-semibold block mb-3">
                {item.label}
              </span>
              <p className="text-foreground/80 text-sm leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Hackathon + ODS */}
      <div className="px-6 md:px-12 py-16 border-b border-border">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-px bg-border">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-6 bg-background px-8 py-10"
          >
            <span className="text-xs tracking-widest uppercase text-secondary font-semibold block mb-3">
              Contexto
            </span>
            <h3 className="font-bold text-foreground text-lg mb-3">Hackathon Conecta UnDF</h3>
            <p className="text-foreground/80 text-sm leading-relaxed">
              O Voz UnDF nasceu no contexto do <strong>Hackathon Conecta UnDF</strong>, iniciativa que desafia estudantes e servidores a criarem soluções digitais inovadoras para a gestão universitária. O projeto foi desenvolvido com foco em participação cidadã, acessibilidade e transparência pública.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="md:col-span-6 bg-background px-8 py-10"
          >
            <span className="text-xs tracking-widest uppercase text-secondary font-semibold block mb-3">
              Alinhamento ODS 16
            </span>
            <h3 className="font-bold text-foreground text-lg mb-3">Paz, Justiça e Instituições Eficazes</h3>
            <p className="text-foreground/80 text-sm leading-relaxed mb-4">
              A plataforma contribui diretamente para o ODS 16 da Agenda 2030 ao promover instituições eficazes, inclusivas e transparentes, garantindo acesso à informação e participação pública na tomada de decisões.
            </p>
            <Link href="/ods16">
              <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-primary hover:text-white hover:border-primary transition-colors">
                Ver impacto ODS completo <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Pilares */}
      <div className="px-6 md:px-12 py-16 border-b border-border">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-xs tracking-widest uppercase text-secondary font-semibold">02</span>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[0.95] tracking-tight text-foreground mt-3">
              pilares da<br />plataforma.
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
          {pillars.map((p, i) => (
            <motion.div
              key={p.num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-background px-8 py-10 group hover:bg-primary transition-colors duration-300"
            >
              <span className="text-5xl font-bold text-foreground/8 group-hover:text-white/10 transition-colors block mb-6">
                {p.num}
              </span>
              <h3 className="text-lg font-bold text-foreground group-hover:text-white transition-colors mb-3">
                {p.title}
              </h3>
              <p className="text-sm text-muted-foreground group-hover:text-white/65 transition-colors leading-relaxed">
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 md:px-12 py-16">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div>
            <span className="text-xs tracking-widest uppercase text-secondary font-semibold">03</span>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[0.95] tracking-tight text-foreground mt-3">
              a equipe<br />responsável.
            </h2>
            <p className="text-muted-foreground mt-4 max-w-md text-sm leading-relaxed">
              Projeto concebido por estudantes e gestores focados em inovação pública e transformação digital na Universidade do Distrito Federal.
            </p>
          </div>
          <Link href="/demandas/nova">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-5">
              Junte-se à comunidade <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
