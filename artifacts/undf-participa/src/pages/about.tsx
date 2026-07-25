import { Link } from "wouter";

export default function About() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
      <div className="space-y-8">
        <header className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">Conheça o Voz UnDF</h1>
          <p className="text-xl text-muted-foreground">
            A Plataforma Inteligente de Participação e Gestão Colaborativa da Universidade do Distrito Federal.
          </p>
        </header>

        <section className="prose prose-lg dark:prose-invert max-w-none text-foreground/90">
          <p>
            O <strong>Voz UnDF</strong> nasceu do compromisso da Universidade do Distrito Federal com a transparência, a inovação e a gestão democrática. Mais do que um canal de comunicação, é uma ferramenta institucional projetada para transformar demandas cotidianas em dados acionáveis e políticas públicas eficazes dentro do ambiente universitário.
          </p>

          <h2>Nosso Propósito</h2>
          <p>
            Acreditamos que uma universidade de excelência é construída coletivamente. O Voz UnDF empodera estudantes, professores, servidores e gestores a participarem ativamente das decisões que moldam a instituição, garantindo que toda solicitação, sugestão ou crítica seja registrada, acompanhada e respondida com total clareza.
          </p>

          <h2>Pilares da Plataforma</h2>
          <ul>
            <li><strong>Transparência Ativa:</strong> Todos os processos possuem um fluxo visível. Da abertura ao arquivamento, o usuário acompanha via código de protocolo.</li>
            <li><strong>Acessibilidade Universal:</strong> Desenvolvida para ser utilizada por todos. Conta com suporte a VLibras, modos de leitura, controle de contraste e navegação simplificada.</li>
            <li><strong>Inteligência de Dados:</strong> O painel de transparência agrega as demandas e gera insights para a gestão universitária alocar recursos onde são mais necessários.</li>
            <li><strong>Colaboração:</strong> As demandas deixam de ser individuais. Através do recurso "Também sou afetado", a comunidade valida e prioriza organicamente as necessidades mais urgentes.</li>
          </ul>

          <h2>Alinhamento Estratégico</h2>
          <p>
            O Voz UnDF é uma iniciativa direta para o cumprimento dos Objetivos de Desenvolvimento Sustentável (ODS) da Agenda 2030 da ONU, com destaque para o <strong>ODS 16: Paz, Justiça e Instituições Eficazes</strong>, promovendo a construção de instituições responsáveis e inclusivas em todos os níveis.
          </p>
        </section>

        <div className="pt-8 border-t">
          <h3 className="text-xl font-bold mb-4">A equipe responsável</h3>
          <p className="text-muted-foreground mb-6">
            Projeto concebido por estudantes e gestores focados em inovação pública e transformação digital no governo do Distrito Federal.
          </p>
          <Link href="/demandas/nova" className="text-primary font-semibold hover:underline">
            Junte-se a nós e faça sua voz ser ouvida na UnDF &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
