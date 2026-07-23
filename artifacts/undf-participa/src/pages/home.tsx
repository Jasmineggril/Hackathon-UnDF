import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Lightbulb, MessageSquare, BarChart3, Globe2 } from 'lucide-react';
import { useGetTransparencyStats } from '@workspace/api-client-react';

export default function Home() {
  const { data: stats } = useGetTransparencyStats();

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="bg-primary/5 py-16 md:py-24 border-b">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 flex flex-col items-start gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Globe2 className="w-4 h-4" />
              <span>Gestão Democrática e Transparente</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Sua voz ajuda a construir a UnDF.
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Registre demandas, apresente propostas, acompanhe respostas e participe das decisões que transformam a Universidade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-2 w-full sm:w-auto">
              <Button size="lg" asChild className="gap-2">
                <Link href="/demandas/nova">Registrar demanda <ArrowRight className="w-4 h-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/demandas">Explorar demandas</Link>
              </Button>
            </div>
          </div>
          
          <div className="md:w-1/2 grid grid-cols-2 gap-4">
            <Card className="bg-white border shadow-sm">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg">Demandas</h3>
                <p className="text-sm text-muted-foreground">Relate problemas de infraestrutura ou serviços no campus.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border shadow-sm translate-y-8">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-2">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg">Propostas</h3>
                <p className="text-sm text-muted-foreground">Sugira melhorias acadêmicas ou inovações para a UnDF.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-6">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 text-center">
              <CardContent>
                <h3 className="font-semibold">1. Registre</h3>
                <p className="text-sm text-muted-foreground">Envie uma demanda, sugestão ou proposta por texto, imagem, documento ou áudio.</p>
              </CardContent>
            </Card>
            <Card className="p-6 text-center">
              <CardContent>
                <h3 className="font-semibold">2. Acompanhe</h3>
                <p className="text-sm text-muted-foreground">Receba um protocolo e visualize o andamento da sua manifestação.</p>
              </CardContent>
            </Card>
            <Card className="p-6 text-center">
              <CardContent>
                <h3 className="font-semibold">3. Participe</h3>
                <p className="text-sm text-muted-foreground">Apoie demandas e propostas que também afetam você.</p>
              </CardContent>
            </Card>
            <Card className="p-6 text-center">
              <CardContent>
                <h3 className="font-semibold">4. Transforme</h3>
                <p className="text-sm text-muted-foreground">A gestão usa os dados para planejar ações, responder e prestar contas.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Transparência em Números</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Acompanhe o impacto da participação da comunidade na gestão da universidade.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center p-6 bg-slate-50 rounded-lg border">
              <span className="text-4xl font-bold text-primary mb-2">
                {stats ? stats.totalDemands : '...'}
              </span>
              <span className="text-sm text-muted-foreground text-center font-medium">Demandas Recebidas</span>
            </div>
            <div className="flex flex-col items-center p-6 bg-slate-50 rounded-lg border">
              <span className="text-4xl font-bold text-emerald-600 mb-2">
                {stats ? stats.demandsResolved : '...'}
              </span>
              <span className="text-sm text-muted-foreground text-center font-medium">Demandas Resolvidas</span>
            </div>
            <div className="flex flex-col items-center p-6 bg-slate-50 rounded-lg border">
              <span className="text-4xl font-bold text-amber-600 mb-2">
                {stats ? stats.totalProposals : '...'}
              </span>
              <span className="text-sm text-muted-foreground text-center font-medium">Propostas Abertas</span>
            </div>
            <div className="flex flex-col items-center p-6 bg-slate-50 rounded-lg border">
              <span className="text-4xl font-bold text-blue-600 mb-2">
                {stats ? stats.totalParticipants : '...'}
              </span>
              <span className="text-sm text-muted-foreground text-center font-medium">Participantes Ativos</span>
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <Button variant="ghost" className="text-primary hover:text-primary/80 gap-2" asChild>
              <Link href="/transparencia">
                <BarChart3 className="w-4 h-4" /> Acessar Portal de Transparência
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ODS 16 Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/3 flex justify-center">
            <div className="w-48 h-48 bg-white p-4 rounded-lg flex items-center justify-center flex-col text-center">
              <span className="text-red-600 font-bold text-6xl">16</span>
              <span className="text-slate-900 font-bold text-sm mt-2 leading-tight uppercase">Paz, Justiça e<br/>Instituições<br/>Eficazes</span>
            </div>
          </div>
          <div className="md:w-2/3">
            <h2 className="text-3xl font-bold mb-4">Compromisso com o ODS 16</h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              O Voz UnDF é uma iniciativa alinhada ao Objetivo de Desenvolvimento Sustentável 16 da ONU. 
              Trabalhamos para desenvolver instituições eficazes, responsáveis e transparentes em todos os níveis, 
              garantindo a tomada de decisão responsiva, inclusiva e participativa.
            </p>
            <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-slate-900" asChild>
              <Link href="/ods16">Saiba mais sobre o ODS 16</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
