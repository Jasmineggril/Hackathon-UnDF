import { Link } from "wouter";
import { ArrowRight, ShieldCheck, Landmark, Scale, BookOpen, Users, Lightbulb, HeartHandshake, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const pillars = [
  {
    meta: "16.6",
    title: "Instituições Eficazes",
    desc: "Desenvolver instituições eficazes, responsáveis e transparentes. O Voz UnDF registra, rastreia e exige resposta para cada demanda.",
    icon: Landmark,
  },
  {
    meta: "16.7",
    title: "Decisões Participativas",
    desc: "Garantir a tomada de decisão responsiva, inclusiva e participativa. Toda a comunidade tem voz ativa na gestão.",
    icon: Users,
  },
  {
    meta: "16.10",
    title: "Acesso à Informação",
    desc: "Assegurar o acesso público à informação. Nosso painel de transparência mostra dados reais sobre o andamento das soluções.",
    icon: Scale,
  },
];

const secondaryOds = [
  { num: 4, title: "Educação de Qualidade", desc: "Melhorias no ensino através da participação discente.", icon: BookOpen, bg: "bg-red-600" },
  { num: 5, title: "Igualdade de Gênero", desc: "Canal seguro para denúncias e demandas de inclusão.", icon: Users, bg: "bg-orange-600" },
  { num: 9, title: "Inovação e Infraestrutura", desc: "Inovação tecnológica na gestão pública distrital.", icon: Lightbulb, bg: "bg-orange-500" },
  { num: 10, title: "Redução das Desigualdades", desc: "Acessibilidade digital e voz para todos os grupos.", icon: HeartHandshake, bg: "bg-pink-600" },
  { num: 17, title: "Parcerias", desc: "Comunidade e universidade trabalhando juntas.", icon: Globe, bg: "bg-blue-900" },
];

export default function Ods16() {
  return (
    <div className="min-h-screen bg-background">

      {/* Hero section */}
      <div className="bg-primary px-6 md:px-12 pt-16 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_80%_50%,_white,_transparent_60%)]" />
        <div className="relative z-10 max-w-3xl">
          <span className="text-xs tracking-widest uppercase text-secondary font-semibold">agenda 2030</span>
          <h1 className="text-[clamp(3rem,7vw,6.5rem)] font-bold leading-[0.9] tracking-tight text-white mt-4">
            ods<br />
            <span className="text-secondary">16.</span>
          </h1>
          <h2 className="text-xl md:text-2xl font-semibold text-white/90 mt-6 mb-4 max-w-xl">
            Paz, Justiça e Instituições Eficazes
          </h2>
          <p className="text-white/60 text-base leading-relaxed max-w-lg">
            Promover sociedades pacíficas e inclusivas para o desenvolvimento sustentável, proporcionar acesso à justiça para todos e construir instituições eficazes, responsáveis e inclusivas em todos os níveis.
          </p>
        </div>
      </div>

      {/* How Voz UnDF applies ODS 16 */}
      <div className="px-6 md:px-12 py-16 border-b border-border">
        <div className="flex items-end justify-between mb-12 flex-col md:flex-row gap-6">
          <div>
            <span className="text-xs tracking-widest uppercase text-secondary font-semibold">01</span>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[0.95] tracking-tight text-foreground mt-3">
              como aplicamos<br />o ods 16.
            </h2>
          </div>
          <p className="text-muted-foreground text-sm max-w-xs leading-relaxed md:text-right">
            A plataforma é a materialização direta das metas da Agenda 2030 no contexto universitário.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {pillars.map((p, i) => (
            <motion.div
              key={p.meta}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-background p-8 flex flex-col gap-5 group hover:bg-primary transition-colors duration-300"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold tracking-widest uppercase text-secondary group-hover:text-secondary/80 transition-colors">
                  Meta {p.meta}
                </span>
                <p.icon className="w-5 h-5 text-foreground/20 group-hover:text-white/20 transition-colors" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-white transition-colors mb-3">{p.title}</h3>
                <p className="text-sm text-muted-foreground group-hover:text-white/65 transition-colors leading-relaxed">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Secondary ODS */}
      <div className="px-6 md:px-12 py-16 border-b border-border">
        <div className="mb-12">
          <span className="text-xs tracking-widest uppercase text-secondary font-semibold">02</span>
          <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[0.95] tracking-tight text-foreground mt-3">
            impacto<br />sistêmico.
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md text-sm leading-relaxed">
            O engajamento cívico gera efeitos em cascata em outros objetivos de desenvolvimento sustentável.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {secondaryOds.map((ods, i) => (
            <motion.div
              key={ods.num}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="bg-background overflow-hidden group"
            >
              <div className={`${ods.bg} px-6 py-4 flex items-center justify-between`}>
                <span className="font-bold text-white text-lg tracking-tight">ODS {ods.num}</span>
                <ods.icon className="w-5 h-5 text-white/60" />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-foreground mb-2 text-sm">{ods.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{ods.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 md:px-12 py-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
        <div>
          <span className="text-xs tracking-widest uppercase text-secondary font-semibold">03</span>
          <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[0.95] tracking-tight text-foreground mt-3">
            veja os<br />dados reais.
          </h2>
        </div>
        <div className="flex gap-3">
          <Link href="/transparencia">
            <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-5">
              Painel de Transparência <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/demandas/nova">
            <Button variant="outline" className="border-border text-foreground hover:bg-primary hover:text-white hover:border-primary transition-colors px-6 py-5">
              Registrar Demanda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
