import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, Users, Eye, Megaphone, Target, FileText, 
  Search, MessageSquare, BarChart3, Fingerprint, ShieldCheck
} from "lucide-react";
import { useGetTransparencyStats } from "@workspace/api-client-react";

export default function Home() {
  const { data: stats, isLoading } = useGetTransparencyStats();

  const features = [
    { title: "Demandas Coletivas", desc: "Apoie demandas de outros usuários para dar mais força institucional aos pedidos.", icon: Users },
    { title: "Participação Acessível", desc: "Plataforma construída pensando na acessibilidade plena com suporte a Libras.", icon: Eye },
    { title: "Propostas Formais", desc: "Transforme boas ideias em projetos oficiais avaliados pela gestão universitária.", icon: Megaphone },
    { title: "Transparência Total", desc: "Acompanhe cada etapa do processo e saiba exatamente onde está a sua demanda.", icon: Target },
    { title: "Gestão por Dados", desc: "Painéis e relatórios abertos que guiam as decisões dos gestores da UnDF.", icon: BarChart3 },
    { title: "Inclusão e Segurança", desc: "Possibilidade de anonimato para garantir liberdade de expressão responsável.", icon: ShieldCheck },
  ];

  const steps = [
    { title: "Registre", desc: "Crie uma demanda ou proposta", icon: FileText },
    { title: "Acompanhe", desc: "Siga o status via protocolo", icon: Search },
    { title: "Participe", desc: "Apoie demandas da comunidade", icon: MessageSquare },
    { title: "Transforme", desc: "Veja as melhorias na universidade", icon: Fingerprint },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground py-24 md:py-32">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl mb-6"
          >
            Sua voz ajuda a construir a UnDF.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mb-10 text-balance"
          >
            Uma plataforma inteligente de participação e gestão colaborativa. 
            Estudantes, professores e servidores transformando a universidade juntos.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link href="/demandas/nova" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold">
                Registrar Demanda <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/demandas" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                Explorar Demandas
              </Button>
            </Link>
            <Link href="/protocolo" className="w-full sm:w-auto">
              <Button size="lg" variant="ghost" className="w-full text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10">
                Acompanhar Protocolo
              </Button>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Link href="/sobre" className="text-sm underline underline-offset-4 opacity-80 hover:opacity-100 transition-opacity">
              Conhecer o Voz UnDF
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Live Stats Bar */}
      <section className="bg-card border-b py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-border">
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-primary">
                {isLoading ? "—" : stats?.totalDemands ?? "—"}
              </span>
              <span className="text-sm text-muted-foreground font-medium mt-1">Demandas Recebidas</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-secondary">
                {isLoading ? "—" : stats?.demandsResolved ?? "—"}
              </span>
              <span className="text-sm text-muted-foreground font-medium mt-1">Demandas Resolvidas</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-primary">
                {isLoading ? "—" : stats?.totalProposals ?? "—"}
              </span>
              <span className="text-sm text-muted-foreground font-medium mt-1">Propostas Ativas</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-foreground">
                {isLoading ? "—" : stats?.totalParticipants ?? "—"}
              </span>
              <span className="text-sm text-muted-foreground font-medium mt-1">Participantes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Como funciona</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Um processo simples, transparente e focado em resultados.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 relative">
            {/* Connecting line for md and up */}
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-border -z-10" />
            
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-card border-4 border-background shadow-sm flex items-center justify-center mb-6 relative">
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </span>
                  <step.icon className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Por que o Voz UnDF é diferente?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Não somos apenas uma caixa de sugestões. Somos um ecossistema de gestão participativa.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <Card key={i} className="border-border bg-card hover:border-primary/20 transition-colors">
                <CardContent className="p-6 flex flex-col items-start text-left">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ODS Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-4">Compromisso com os ODS</h2>
            <p className="text-primary-foreground/80 mb-6 text-lg">
              A plataforma Voz UnDF é uma iniciativa direta para o alcance do <strong>ODS 16 - Paz, Justiça e Instituições Eficazes</strong> da Agenda 2030 da ONU.
            </p>
            <p className="text-primary-foreground/70 mb-8">
              Além do ODS 16, a plataforma também impulsiona os objetivos 4 (Educação de Qualidade), 5 (Igualdade de Gênero), 9 (Inovação e Infraestrutura), 10 (Redução das Desigualdades) e 17 (Parcerias).
            </p>
            <Link href="/ods16">
              <Button variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                Saiba mais sobre nosso impacto
              </Button>
            </Link>
          </div>
          <div className="md:w-1/2 grid grid-cols-3 gap-4">
            <div className="col-span-3 bg-secondary rounded-lg p-6 flex items-center justify-center text-center aspect-[2/1]">
              <span className="text-2xl font-bold text-secondary-foreground uppercase tracking-wider">ODS 16<br/>Paz, Justiça e Instituições Eficazes</span>
            </div>
            {['ODS 4', 'ODS 5', 'ODS 9', 'ODS 10', 'ODS 17'].map((ods, i) => (
              <div key={i} className="bg-primary-foreground/10 rounded-lg p-4 flex items-center justify-center aspect-square text-center font-semibold">
                {ods}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
