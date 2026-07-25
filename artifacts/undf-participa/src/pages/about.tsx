import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Users, Shield, Lightbulb, BarChart3, Globe2, Mic } from 'lucide-react';

export default function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">Sobre o Voz UnDF</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Sua voz participa. A Universidade transforma.
          </p>
        </div>

        {/* Missão */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-xl font-bold mb-4">Nossa Missão</h2>
            <p className="text-muted-foreground leading-relaxed">
              Criar uma plataforma que melhore a comunicação institucional, amplie a participação
              estudantil, fortaleça a transparência e aperfeiçoe a gestão universitária da
              Universidade do Distrito Federal (UnDF).
            </p>
          </CardContent>
        </Card>

        {/* Funcionalidades */}
        <h2 className="text-2xl font-bold mb-6">Funcionalidades</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <Card>
            <CardContent className="p-6 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Registro Multimídia</h3>
                <p className="text-sm text-muted-foreground">
                  Registre demandas por texto, áudio, imagem ou vídeo.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Propostas Formais</h3>
                <p className="text-sm text-muted-foreground">
                  Submeta melhorias com ciclo de vida de revisão e aprovação.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Também Sou Afetado</h3>
                <p className="text-sm text-muted-foreground">
                  Apoie demandas que também afetam você e aumente a priorização.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Portal de Transparência</h3>
                <p className="text-sm text-muted-foreground">
                  Dados agregados públicos sobre participação e resolução.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Privacidade por Padrão</h3>
                <p className="text-sm text-muted-foreground">
                  Opção de anonimato e proteção de dados pessoais.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Protocolo Rastreável</h3>
                <p className="text-sm text-muted-foreground">
                  Acompanhe sua demanda pelo número de protocolo único.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stack Técnica */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-xl font-bold mb-4">Stack Técnica</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Frontend</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>React 19</li>
                  <li>TypeScript</li>
                  <li>Tailwind CSS</li>
                  <li>Vite</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Backend</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>Express 5</li>
                  <li>OpenAPI 3.1</li>
                  <li>Drizzle ORM</li>
                  <li>Zod v4</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Banco</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>PostgreSQL 16</li>
                  <li>Drizzle Migrations</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Auth</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>Supabase Auth (JWT)</li>
                  <li>Verificação JWKS / userinfo</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Pronto para participar?
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild className="gap-2">
              <Link href="/demandas/nova">Registrar Demanda <ArrowRight className="w-4 h-4" /></Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/propostas/nova">Enviar Proposta</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
