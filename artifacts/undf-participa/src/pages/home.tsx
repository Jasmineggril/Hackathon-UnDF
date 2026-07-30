import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Eye, Megaphone, Target, BarChart3, ShieldCheck } from "lucide-react";
import { useGetTransparencyStats } from "@workspace/api-client-react";
import logoPath from "@assets/logo-voz-undf.png";

export default function Home() {
  const { data: stats, isLoading } = useGetTransparencyStats();

  const features = [
    { title: "Demandas Coletivas", desc: "Apoie demandas de outros usuários para dar mais força institucional aos pedidos.", icon: Users },
    { title: "Participação Acessível", desc: "Plataforma construída pensando na acessibilidade plena com suporte a Libras.", icon: Eye },
    { title: "Propostas Formais", desc: "Transforme boas ideias em projetos oficiais avaliados pela gestão universitária.", icon: Megaphone },
    { title: "Transparência Total", desc: "Acompanhe cada etapa do processo e saiba exatamente onde está a sua demanda.", icon: Target },
    { title: "Gestão por Dados", desc: "Painéis e relatórios abertos que guiam as decisões dos gestores da UnDF.", icon: BarChart3 },
    { title: "Inclusão e Segurança", desc: "Anonimato disponível para garantir liberdade de expressão responsável.", icon: ShieldCheck },
  ];

  return (
    <div className="flex flex-col w-full bg-[#F2F0EB]">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="min-h-[92vh] flex flex-col justify-between px-6 md:px-12 pt-12 pb-0 border-b border-[#1B3469]/15">
        {/* top row: label + year */}
        <div className="flex justify-between items-start text-xs tracking-widest text-[#1B3469]/50 uppercase mb-8 md:mb-0">
          <span>Participação · Transparência · Gestão</span>
          <span>UnDF — 2026</span>
        </div>

        {/* main grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 flex-1 items-center py-10 md:py-0">
          {/* left: giant headline */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-7 flex flex-col justify-center"
          >
            <h1
              className="text-[clamp(3.5rem,10vw,9rem)] font-bold leading-[0.9] tracking-tight text-[#1B3469] select-none"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              sua<br />
              voz<br />
              <span className="text-[#5B9A6E]">constrói</span><br />
              a UnDF.
            </h1>
          </motion.div>

          {/* right: logo + desc + cta */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-5 flex flex-col gap-8 md:pl-12 md:border-l border-[#1B3469]/15 py-6 md:py-0"
          >
            <img
              src={logoPath}
              alt="Voz UnDF"
              className="w-36 md:w-44 h-auto object-contain"
            />
            <p className="text-base md:text-lg text-[#1B3469]/70 leading-relaxed max-w-xs">
              Uma plataforma inteligente de participação e gestão colaborativa.
              Estudantes, professores e servidores transformando a universidade juntos.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/demandas/nova">
                <Button
                  data-tour="hero-intro"
                  size="lg"
                  className="w-full bg-[#1B3469] hover:bg-[#1B3469]/90 text-white font-semibold rounded-none px-8 justify-between"
                >
                  Registrar Demanda <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex gap-3">
                <Link href="/demandas" className="flex-1">
                  <Button
                    size="default"
                    variant="outline"
                    className="w-full border-[#1B3469]/30 text-[#1B3469] hover:bg-[#1B3469]/5 rounded-none"
                  >
                    Explorar
                  </Button>
                </Link>
                <Link href="/protocolo" className="flex-1">
                  <Button
                    size="default"
                    variant="outline"
                    className="w-full border-[#1B3469]/30 text-[#1B3469] hover:bg-[#1B3469]/5 rounded-none"
                  >
                    Protocolo
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* bottom bar with stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-[#1B3469]/15 py-6 mt-6">
          {[
            { value: isLoading ? "—" : String(stats?.totalDemands ?? "—"), label: "demandas recebidas" },
            { value: isLoading ? "—" : String(stats?.demandsResolved ?? "—"), label: "demandas resolvidas" },
            { value: isLoading ? "—" : String(stats?.totalProposals ?? "—"), label: "propostas ativas" },
            { value: isLoading ? "—" : String(stats?.totalParticipants ?? "—"), label: "participantes" },
          ].map((s, i) => (
            <div key={i} className={`flex flex-col px-4 ${i > 0 ? "border-l border-[#1B3469]/10" : ""}`}>
              <span
                className="text-4xl md:text-5xl font-bold text-[#1B3469] tabular-nums"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {s.value}
              </span>
              <span className="text-xs uppercase tracking-widest text-[#1B3469]/50 mt-1">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMO FUNCIONA ────────────────────────────────── */}
      <section className="px-6 md:px-12 py-20 md:py-28 border-b border-[#1B3469]/15">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-0">
          {/* big heading */}
          <div className="md:col-span-5">
            <span className="text-xs tracking-widest uppercase text-[#5B9A6E] font-semibold">01</span>
            <h2
              className="text-[clamp(2.8rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-tight text-[#1B3469] mt-4"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              como<br />
              funciona.
            </h2>
            <p className="mt-6 text-[#1B3469]/60 max-w-xs text-sm leading-relaxed">
              Um processo simples, transparente e focado em resultados reais para a comunidade UnDF.
            </p>
          </div>

          {/* steps */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#1B3469]/10">
            {[
              { num: "01", title: "Registre", desc: "Crie uma demanda ou proposta com detalhes e evidências." },
              { num: "02", title: "Acompanhe", desc: "Siga o status em tempo real via número de protocolo." },
              { num: "03", title: "Participe", desc: "Apoie demandas da comunidade para dar força coletiva." },
              { num: "04", title: "Transforme", desc: "Veja as melhorias acontecendo na universidade." },
            ].map((step) => (
              <div key={step.num} className="bg-[#F2F0EB] p-8 flex flex-col gap-4 group hover:bg-[#1B3469] transition-colors duration-300">
                <span
                  className="text-5xl font-bold text-[#1B3469]/10 group-hover:text-white/10 transition-colors"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {step.num}
                </span>
                <div>
                  <h3
                    className="text-xl font-bold text-[#1B3469] group-hover:text-white transition-colors"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#1B3469]/60 group-hover:text-white/70 transition-colors mt-2 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIFERENCIAIS ─────────────────────────────────── */}
      <section className="px-6 md:px-12 py-20 md:py-28 border-b border-[#1B3469]/15">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-xs tracking-widest uppercase text-[#5B9A6E] font-semibold">02</span>
            <h2
              className="text-[clamp(2.8rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-tight text-[#1B3469] mt-4"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              por que<br />
              somos<br />
              diferentes.
            </h2>
          </div>
          <p className="text-[#1B3469]/60 max-w-xs text-sm leading-relaxed md:text-right">
            Não somos uma caixa de sugestões. Somos um ecossistema completo de gestão participativa universitária.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1B3469]/10">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="bg-[#F2F0EB] p-8 flex flex-col gap-4 group hover:bg-[#1B3469] transition-colors duration-300 cursor-default"
            >
              <div className="w-10 h-10 border border-[#1B3469]/20 group-hover:border-white/20 flex items-center justify-center transition-colors">
                <feat.icon className="w-5 h-5 text-[#5B9A6E] group-hover:text-[#7EC49A] transition-colors" />
              </div>
              <h3 className="font-bold text-[#1B3469] group-hover:text-white transition-colors" style={{ fontFamily: "'Syne', sans-serif" }}>
                {feat.title}
              </h3>
              <p className="text-sm text-[#1B3469]/60 group-hover:text-white/70 transition-colors leading-relaxed">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── ODS 16 ───────────────────────────────────────── */}
      <section className="bg-[#1B3469] px-6 md:px-12 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7">
            <span className="text-xs tracking-widest uppercase text-[#5B9A6E] font-semibold">03</span>
            <h2
              className="text-[clamp(3rem,7vw,7rem)] font-bold leading-[0.9] tracking-tight text-white mt-4"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              ods<br />
              <span className="text-[#5B9A6E]">16.</span>
            </h2>
            <p className="text-white/60 mt-6 text-base max-w-md leading-relaxed">
              O Voz UnDF é uma iniciativa direta para o alcance do <strong className="text-white">ODS 16 — Paz, Justiça e Instituições Eficazes</strong> da Agenda 2030 da ONU.
            </p>
            <p className="text-white/40 mt-4 text-sm max-w-md leading-relaxed">
              Além do ODS 16, a plataforma impulsiona os ODS 4 (Educação de Qualidade), 5 (Igualdade de Gênero), 9 (Inovação), 10 (Redução das Desigualdades) e 17 (Parcerias).
            </p>
            <Link href="/ods16" className="inline-block mt-8">
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 rounded-none px-8"
              >
                Saiba mais sobre nosso impacto <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="md:col-span-5 grid grid-cols-3 gap-px bg-white/10">
            <div className="col-span-3 bg-[#5B9A6E] p-8 flex items-center justify-center text-center aspect-[3/1]">
              <span className="text-white font-bold text-lg uppercase tracking-widest" style={{ fontFamily: "'Syne', sans-serif" }}>
                ODS 16<br />
                <span className="text-sm font-normal opacity-80 normal-case tracking-normal">Paz, Justiça e Instituições Eficazes</span>
              </span>
            </div>
            {['ODS 4', 'ODS 5', 'ODS 9', 'ODS 10', 'ODS 17'].map((ods, i) => (
              <div
                key={i}
                className="bg-white/5 hover:bg-white/10 transition-colors p-4 flex items-center justify-center aspect-square text-center font-bold text-white/70 text-sm"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {ods}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-20 md:py-28 border-t border-[#1B3469]/15">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div>
            <span className="text-xs tracking-widest uppercase text-[#5B9A6E] font-semibold">participe.</span>
            <h2
              className="text-[clamp(2.5rem,5vw,5rem)] font-bold leading-[0.95] tracking-tight text-[#1B3469] mt-4"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              entre<br />
              em<br />
              contato.
            </h2>
          </div>
          <div className="flex flex-col gap-4 md:items-end">
            <p className="text-[#1B3469]/60 text-sm max-w-xs md:text-right leading-relaxed">
              Faça parte da comunidade que está construindo a UnDF do futuro. Sua participação importa.
            </p>
            <div className="flex gap-3">
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-[#1B3469] hover:bg-[#1B3469]/90 text-white rounded-none px-8"
                >
                  Criar conta
                </Button>
              </Link>
              <Link href="/sobre">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#1B3469]/30 text-[#1B3469] hover:bg-[#1B3469]/5 rounded-none"
                >
                  Sobre o projeto
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
