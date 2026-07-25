import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Scale, Users, Shield, Eye } from 'lucide-react';

export default function Ods16() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header ODS 16 */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="w-40 h-40 bg-white border-2 border-red-200 p-4 rounded-lg flex items-center justify-center flex-col text-center shrink-0">
            <span className="text-red-600 font-bold text-5xl">16</span>
            <span className="text-slate-900 font-bold text-xs mt-2 leading-tight uppercase">
              Paz, Justiça e<br />Instituições Eficazes
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              ODS 16 e o Voz UnDF
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              O Voz UnDF é uma iniciativa alinhada ao Objetivo de Desenvolvimento Sustentável 16 da ONU.
              Trabalhamos para desenvolver instituições eficazes, responsáveis e transparentes em todos os níveis.
            </p>
          </div>
        </div>

        {/* Compromissos */}
        <h2 className="text-2xl font-bold mb-6">Nossos Compromissos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 flex gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Participação Efetiva</h3>
                <p className="text-sm text-muted-foreground">
                  Garantir que estudantes, docentes e servidores participem ativamente
                  das decisões que afetam a comunidade universitária.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Transparência Institucional</h3>
                <p className="text-sm text-muted-foreground">
                  Disponibilizar dados públicos sobre demandas, propostas e respostas
                  da gestão para auditoria cidadã.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Instituições Eficazes</h3>
                <p className="text-sm text-muted-foreground">
                  Fortalecer canais de comunicação institucional para que a gestão
                  universitária seja responsiva e inclusiva.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Privacidade e Segurança</h3>
                <p className="text-sm text-muted-foreground">
                  Proteger dados dos cidadãos e garantir anonimato quando solicitado,
                  conforme boas práticas de governança de dados.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Como o Voz UnDF contribui */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <h2 className="text-xl font-bold mb-4">Como o Voz UnDF Contribui para o ODS 16</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="text-primary font-bold">16.3</span>
                <span>Promovemos decisões responsivas, inclusivas e participativas na gestão universitária.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">16.6</span>
                <span>Desenvolvemos instituições eficazes e transparentes através do portal de transparência.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">16.7</span>
                <span>Garantimos que todas as vozes sejam ouvidas, independentemente de papel ou posição.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">16.10</span>
                <span>Asseguramos acesso à informação通过 dados públicos e protocolos rastreáveis.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button asChild className="gap-2">
            <Link href="/transparencia">
              Acessar Portal de Transparência <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
