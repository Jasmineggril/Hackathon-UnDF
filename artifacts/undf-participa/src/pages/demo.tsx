/**
 * Página de boas-vindas ao modo de demonstração do Voz UnDF.
 * Acessível mesmo sem autenticação Supabase funcional.
 */

import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTour } from "@/components/GuidedTour";
import logoPath from "@assets/logo-voz-undf.png";
import {
  BookOpen,
  FileText,
  Lightbulb,
  BarChart3,
  HandshakeIcon,
  Search,
  User,
  ArrowRight,
  FlaskConical,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Registrar demanda",
    description:
      "Registre problemas, solicitações, sugestões, elogios ou denúncias. Cada registro gera um protocolo único para acompanhamento.",
    href: "/demandas/nova",
    cta: "Nova demanda",
    color: "bg-[#1B3469]",
  },
  {
    icon: Lightbulb,
    title: "Propostas de melhoria",
    description:
      "Apresente ideias formais à gestão universitária. Propostas com mais apoios ganham prioridade na avaliação.",
    href: "/propostas",
    cta: "Ver propostas",
    color: "bg-[#5B9A6E]",
  },
  {
    icon: HandshakeIcon,
    title: "Apoio coletivo",
    description:
      "Indique que uma demanda também te afeta. Isso ajuda a gestão a identificar prioridades da comunidade.",
    href: "/demandas",
    cta: "Explorar demandas",
    color: "bg-[#1B3469]",
  },
  {
    icon: Search,
    title: "Consulta de protocolo",
    description:
      "Acompanhe o andamento de qualquer demanda pelo número de protocolo, sem precisar estar logado.",
    href: "/protocolo",
    cta: "Consultar protocolo",
    color: "bg-[#5B9A6E]",
  },
  {
    icon: BarChart3,
    title: "Transparência",
    description:
      "Indicadores públicos sobre demandas, categorias e respostas da gestão. Dados abertos para toda a comunidade.",
    href: "/transparencia",
    cta: "Ver transparência",
    color: "bg-[#1B3469]",
  },
  {
    icon: User,
    title: "Painel do usuário",
    description:
      "Gerencie suas demandas, propostas, apoios e protocolos em um painel pessoal completo.",
    href: "/meu-painel",
    cta: "Meu painel",
    color: "bg-[#5B9A6E]",
  },
];

const mockStats = [
  { label: "Demandas registradas", value: "127" },
  { label: "Propostas ativas", value: "34" },
  { label: "Apoios coletivos", value: "489" },
  { label: "Demandas respondidas", value: "91" },
];

export default function Demo() {
  const { reopen } = useTour();

  // Clear tour flag so the tour can be triggered fresh for demo users
  useEffect(() => {
    // Don't auto-show tour here — user can click the button
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F0EB]">
      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="bg-[#1B3469] text-white px-6 md:px-12 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-8">
            <img
              src={logoPath}
              alt="Voz UnDF"
              className="h-10 w-auto rounded-md bg-white/10 p-1"
            />
            <span className="font-bold text-lg opacity-90">Voz UnDF</span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <FlaskConical className="w-4 h-4 text-amber-300" />
            <span className="text-xs uppercase tracking-widest text-amber-300 font-semibold">
              Modo de demonstração
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 tracking-tight">
            Explore a plataforma
            <br />
            <span className="text-[#5B9A6E]">Voz UnDF</span>
          </h1>

          <p className="text-white/70 text-lg leading-relaxed max-w-2xl mb-10">
            Você está em uma conta de demonstração. Explore as funcionalidades da
            plataforma de participação e gestão colaborativa da Universidade do
            Distrito Federal.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={reopen}
              className="bg-white text-[#1B3469] hover:bg-white/90 font-semibold px-6 py-5"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Iniciar tour guiado
            </Button>
            <Link href="/demandas">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-6 py-5"
              >
                Explorar demandas
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────── */}
      <section className="border-b border-[#1B3469]/10 bg-white">
        <div className="max-w-4xl mx-auto px-6 md:px-12 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {mockStats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-[#1B3469] tabular-nums">
                {s.value}
              </div>
              <div className="text-xs text-[#1B3469]/50 mt-1 uppercase tracking-wide">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 md:px-12 py-16">
        <div className="mb-10">
          <span className="text-xs uppercase tracking-widest text-[#5B9A6E] font-semibold">
            O que você pode fazer
          </span>
          <h2 className="text-3xl font-bold text-[#1B3469] mt-2">
            Explore todas as funcionalidades
          </h2>
          <p className="text-[#1B3469]/60 mt-2 text-sm leading-relaxed max-w-xl">
            Os dados exibidos são fictícios. Esta conta foi preparada exclusivamente
            para demonstração da plataforma.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.07 * i, duration: 0.4 }}
              className="bg-white border border-[#1B3469]/10 p-6 flex flex-col gap-4 hover:border-[#1B3469]/25 transition-colors"
            >
              <div className={`w-9 h-9 ${f.color} flex items-center justify-center`}>
                <f.icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#1B3469] mb-2">{f.title}</h3>
                <p className="text-sm text-[#1B3469]/60 leading-relaxed">
                  {f.description}
                </p>
              </div>
              <Link href={f.href}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#1B3469]/15 text-[#1B3469] w-full"
                >
                  {f.cta}
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TOUR CTA ────────────────────────────────────────────── */}
      <section className="bg-[#1B3469]/5 border-t border-[#1B3469]/10">
        <div className="max-w-4xl mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-[#1B3469]/50" />
              <span className="text-xs uppercase tracking-widest text-[#1B3469]/50 font-semibold">
                Tour interativo
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#1B3469] mb-1">
              Prefere um guia passo a passo?
            </h3>
            <p className="text-sm text-[#1B3469]/60">
              O tour guiado apresenta cada funcionalidade em poucos minutos.
            </p>
          </div>
          <Button
            onClick={reopen}
            className="bg-[#1B3469] hover:bg-[#1B3469]/90 text-white px-8 py-5 shrink-0"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Ver tour guiado
          </Button>
        </div>
      </section>

      {/* ── NOTE ────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 md:px-12 py-8">
        <div className="flex items-start gap-3 p-4 border border-[#1B3469]/10 bg-white text-sm">
          <ShieldCheck className="w-4 h-4 text-[#5B9A6E] shrink-0 mt-0.5" />
          <p className="text-[#1B3469]/60 leading-relaxed">
            Você está usando uma conta de demonstração com role <strong>estudante</strong>.
            Todos os dados exibidos são fictícios e não representam informações reais da UnDF.
            Para acessar a plataforma com sua conta institucional,{" "}
            <Link href="/login" className="text-[#1B3469] font-semibold hover:underline">
              faça login aqui
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
