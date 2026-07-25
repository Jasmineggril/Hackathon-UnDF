import { Link } from "wouter";
import { ArrowRight, ShieldCheck, Landmark, Scale, BookOpen, Users, Lightbulb, HeartHandshake, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Ods16() {
  const secondaryOds = [
    { num: 4, title: "Educação de Qualidade", desc: "Melhorias no ensino através da participação discente.", icon: BookOpen, color: "bg-red-500 text-white" },
    { num: 5, title: "Igualdade de Gênero", desc: "Canal seguro para denúncias e demandas de inclusão.", icon: Users, color: "bg-orange-500 text-white" },
    { num: 9, title: "Indústria, Inovação e Infraestrutura", desc: "Inovação tecnológica na gestão pública distrital.", icon: Lightbulb, color: "bg-orange-400 text-white" },
    { num: 10, title: "Redução das Desigualdades", desc: "Acessibilidade digital e voz para todos os grupos.", icon: HeartHandshake, color: "bg-pink-500 text-white" },
    { num: 17, title: "Parcerias e Meios de Implementação", desc: "Comunidade e universidade trabalhando juntas.", icon: Globe, color: "bg-blue-800 text-white" },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center justify-center p-4 bg-white rounded-full text-primary font-bold text-xl w-24 h-24">
            ODS 16
          </div>
          <h1 className="text-4xl md:text-5xl font-bold max-w-3xl mb-6">
            Paz, Justiça e Instituições Eficazes
          </h1>
          <p className="text-xl opacity-90 max-w-2xl text-balance">
            Promover sociedades pacíficas e inclusivas para o desenvolvimento sustentável, proporcionar o acesso à justiça para todos e construir instituições eficazes, responsáveis e inclusivas em todos os níveis.
          </p>
        </div>
      </section>

      {/* Voz UnDF Connection */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Como o Voz UnDF aplica o ODS 16?</h2>
            <p className="text-muted-foreground text-lg">
              A plataforma é a materialização direta das metas da Agenda 2030 na universidade.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card border-none shadow-sm">
              <CardContent className="p-6 text-center">
                <Landmark className="w-12 h-12 mx-auto text-secondary mb-4" />
                <h3 className="font-bold text-lg mb-2">Instituições Eficazes</h3>
                <p className="text-sm text-muted-foreground">
                  (Meta 16.6) Desenvolver instituições eficazes, responsáveis e transparentes. O Voz UnDF registra, rastreia e exige resposta para cada demanda.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-none shadow-sm">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 mx-auto text-secondary mb-4" />
                <h3 className="font-bold text-lg mb-2">Decisões Participativas</h3>
                <p className="text-sm text-muted-foreground">
                  (Meta 16.7) Garantir a tomada de decisão responsiva, inclusiva e participativa. Toda a comunidade tem voz ativa na gestão.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-none shadow-sm">
              <CardContent className="p-6 text-center">
                <Scale className="w-12 h-12 mx-auto text-secondary mb-4" />
                <h3 className="font-bold text-lg mb-2">Acesso à Informação</h3>
                <p className="text-sm text-muted-foreground">
                  (Meta 16.10) Assegurar o acesso público à informação. Nosso painel de transparência mostra dados reais sobre o andamento das soluções.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Secondary ODS Grid */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-2">Impacto Sistêmico</h2>
            <p className="text-muted-foreground">O engajamento cívico gera efeitos em cascata em outros objetivos de desenvolvimento sustentável.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {secondaryOds.map((ods) => (
              <Card key={ods.num} className="overflow-hidden border-border group hover:border-primary/50 transition-colors">
                <div className={`p-4 ${ods.color} flex justify-between items-center`}>
                  <span className="font-bold text-xl tracking-tight">ODS {ods.num}</span>
                  <ods.icon className="w-6 h-6 opacity-80" />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-2 text-foreground">{ods.title}</h3>
                  <p className="text-sm text-muted-foreground">{ods.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link href="/transparencia">
              <Button size="lg" className="bg-primary">
                Ver o Painel de Transparência <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
