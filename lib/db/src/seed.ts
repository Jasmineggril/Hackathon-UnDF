/**
 * @module seed
 * @description Dados de exemplo para o banco de dados do UnDF Participa.
 *
 * Execução: pnpm --filter @workspace/db run seed
 *
 * Os dados cobrem múltiplas categorias e status para que todas as
 * visualizações do portal de transparência mostrem dados reais
 * desde o primeiro acesso (sem estado vazio no hackathon).
 */

import { db } from "./index";
import { demands, proposals } from "./schema";

const SEED_DEMANDS = [
  {
    protocol: "20260101-0001",
    type: "text" as const,
    category: "Infraestrutura" as const,
    content:
      "A sala de estudos do bloco B apresenta infiltrações no teto há mais de três meses. Parte do forro já cedeu e há risco de queda durante as chuvas. Solicitamos reparo urgente para garantir a segurança dos estudantes.",
    isAnonymous: false,
    status: "processing" as const,
    supportCount: 47,
    adminResponse: "Ordem de serviço aberta com a Divisão de Manutenção Predial. Previsão de conclusão: 30/08/2026.",
    targetUnit: "Divisão de Infraestrutura",
    createdAt: new Date("2026-01-10"),
    updatedAt: new Date("2026-01-25"),
  },
  {
    protocol: "20260115-0002",
    type: "text" as const,
    category: "Assistência Estudantil" as const,
    content:
      "Solicito a ampliação do horário de funcionamento do Restaurante Universitário para incluir o jantar às sextas-feiras. Muitos estudantes que moram em Planaltina não conseguem retornar para o jantar após as aulas das 18h.",
    isAnonymous: false,
    status: "received" as const,
    supportCount: 89,
    targetUnit: "Pró-Reitoria de Assistência Estudantil",
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date("2026-01-15"),
  },
  {
    protocol: "20260120-0003",
    type: "text" as const,
    category: "Tecnologia" as const,
    content:
      "O sistema de matrícula online apresenta erros frequentes nas madrugadas do período de matrículas, justamente quando os alunos tentam garantir vagas. Peço revisão da infraestrutura de servidores e implementação de fila virtual.",
    isAnonymous: false,
    status: "completed" as const,
    supportCount: 134,
    adminResponse: "Migração para infraestrutura em nuvem concluída. Novos servidores com capacidade 3x maior estão ativos desde fevereiro/2026.",
    targetUnit: "Diretoria de Tecnologia da Informação",
    createdAt: new Date("2026-01-20"),
    updatedAt: new Date("2026-02-28"),
  },
  {
    protocol: "20260201-0004",
    type: "text" as const,
    category: "Acessibilidade" as const,
    content:
      "A rampa de acesso ao Bloco C da Faculdade de Educação está com a superfície antiderrapante danificada. Há risco real de quedas, especialmente para cadeirantes e idosos. Solicito reparo imediato e instalação de corrimão duplo.",
    isAnonymous: false,
    status: "processing" as const,
    supportCount: 62,
    targetUnit: "Divisão de Infraestrutura",
    createdAt: new Date("2026-02-01"),
    updatedAt: new Date("2026-02-10"),
  },
  {
    protocol: "20260205-0005",
    type: "text" as const,
    category: "Ensino e Pesquisa" as const,
    content:
      "Solicito a aquisição de novos equipamentos para o laboratório de química. Os espectrofotômetros atuais têm mais de 15 anos e comprometem a qualidade das pesquisas de pós-graduação. A verba do PROAP 2025 pode cobrir parte da demanda.",
    isAnonymous: false,
    status: "received" as const,
    supportCount: 28,
    targetUnit: "Departamento de Química",
    createdAt: new Date("2026-02-05"),
    updatedAt: new Date("2026-02-05"),
  },
  {
    protocol: "20260210-0006",
    type: "text" as const,
    category: "Administração" as const,
    content:
      "O processo de renovação de bolsas de monitoria exige entrega de documentos físicos em três setores diferentes. Proponho a digitalização total do processo com validação pelo SUAP, reduzindo filas e desperdício de papel.",
    isAnonymous: true,
    status: "received" as const,
    supportCount: 41,
    targetUnit: "Pró-Reitoria de Graduação",
    createdAt: new Date("2026-02-10"),
    updatedAt: new Date("2026-02-10"),
  },
  {
    protocol: "20260215-0007",
    type: "text" as const,
    category: "Cultura e Esporte" as const,
    content:
      "A quadra poliesportiva está há 8 meses fechada para manutenção. Não há previsão de reabertura e os grupos de esporte universitário perderam suas atividades. Solicitamos cronograma concreto para a reabertura.",
    isAnonymous: false,
    status: "completed" as const,
    supportCount: 73,
    adminResponse: "Quadra reaberta em 15/03/2026 após conclusão das obras de reforma do piso e iluminação. Agendamentos disponíveis pelo app UnDF.",
    targetUnit: "Divisão de Esporte e Lazer",
    createdAt: new Date("2026-02-15"),
    updatedAt: new Date("2026-03-15"),
  },
  {
    protocol: "20260301-0008",
    type: "text" as const,
    category: "Infraestrutura" as const,
    content:
      "Os bebedouros do campus Planaltina estão com filtros vencidos. Alunos relatam gosto de cloro acentuado e coloração levemente amarelada na água. Solicito substituição imediata dos filtros e implantação de cronograma trimestral de manutenção.",
    isAnonymous: false,
    status: "received" as const,
    supportCount: 95,
    targetUnit: "Divisão de Infraestrutura",
    createdAt: new Date("2026-03-01"),
    updatedAt: new Date("2026-03-01"),
  },
  {
    protocol: "20260310-0009",
    type: "text" as const,
    category: "Sugestão de Melhoria" as const,
    content:
      "Sugiro a criação de salas de estudos individuais silenciosas no modelo de carrel library, no estilo das grandes universidades federais. A biblioteca atual tem apenas mesas coletivas, o que dificulta estudantes com hipersensibilidade auditiva.",
    isAnonymous: false,
    status: "received" as const,
    supportCount: 38,
    targetUnit: "Biblioteca Central",
    createdAt: new Date("2026-03-10"),
    updatedAt: new Date("2026-03-10"),
  },
  {
    protocol: "20260320-0010",
    type: "text" as const,
    category: "Tecnologia" as const,
    content:
      "O portal do aluno não funciona em dispositivos móveis. Botões sobrepõem o conteúdo e o módulo de histórico escolar não carrega no celular. Para estudantes sem computador, o acesso à vida acadêmica fica comprometido.",
    isAnonymous: false,
    status: "processing" as const,
    supportCount: 156,
    targetUnit: "Diretoria de Tecnologia da Informação",
    createdAt: new Date("2026-03-20"),
    updatedAt: new Date("2026-04-01"),
  },
  {
    protocol: "20260401-0011",
    type: "text" as const,
    category: "Ensino e Pesquisa" as const,
    content:
      "Solicito a criação de um curso de extensão em Python e análise de dados para estudantes de áreas não exatas. Com a transformação digital do setor público, essa competência é essencial para egressos de todas as carreiras da UnDF.",
    isAnonymous: false,
    status: "received" as const,
    supportCount: 112,
    targetUnit: "Pró-Reitoria de Extensão",
    createdAt: new Date("2026-04-01"),
    updatedAt: new Date("2026-04-01"),
  },
  {
    protocol: "20260410-0012",
    type: "text" as const,
    category: "Assistência Estudantil" as const,
    content:
      "Vários estudantes do interior do DF têm dificuldade para pagar os passagens de ônibus intermunicipais. A meia-passagem só vale dentro do DF. Solicitamos que a UnDF articule junto ao GDF um benefício de transporte para esses estudantes.",
    isAnonymous: false,
    status: "received" as const,
    supportCount: 203,
    targetUnit: "Pró-Reitoria de Assistência Estudantil",
    createdAt: new Date("2026-04-10"),
    updatedAt: new Date("2026-04-10"),
  },
];

const SEED_PROPOSALS = [
  {
    title: "Programa de Tutoria entre Pares para Cálculo e Física",
    description:
      "Criar um programa formal de tutoria onde estudantes veteranos de Engenharia e Ciências Exatas prestam suporte aos calouros nas disciplinas de maior reprovação. O programa deve oferecer certificação de horas de extensão para os tutores, sala dedicada no campus e coordenação da Pró-Reitoria de Graduação. Experiências similares no IFB e UnB mostraram redução de 30% na retenção nas disciplinas-gate.",
    category: "Ensino e Pesquisa" as const,
    status: "under_review" as const,
    supportCount: 178,
    targetUnit: "Pró-Reitoria de Graduação",
    createdAt: new Date("2026-01-28"),
    updatedAt: new Date("2026-02-15"),
  },
  {
    title: "Horta Comunitária no Campus como Laboratório Vivo de Agroecologia",
    description:
      "Proposta de implantação de uma horta comunitária de 500m² no campus sede, gerenciada pelos estudantes dos cursos de Agronomia e Meio Ambiente com supervisão docente. A horta serviria como laboratório prático de agroecologia, produziria alimentos para o Restaurante Universitário e funcionaria como espaço de pesquisa aplicada sobre técnicas de cultivo sustentável em clima tropical. Parceria com o EMBRAPA já foi consultada informalmente e há interesse.",
    category: "Sugestão de Melhoria" as const,
    status: "approved" as const,
    supportCount: 241,
    targetUnit: "Pró-Reitoria de Extensão",
    createdAt: new Date("2026-02-03"),
    updatedAt: new Date("2026-03-20"),
  },
  {
    title: "Central de Empréstimo de Equipamentos para Produção Audiovisual",
    description:
      "Criação de uma central de empréstimo de câmeras, microfones e iluminação para projetos acadêmicos. Hoje os estudantes precisam alugar equipamentos de fora, o que eleva o custo dos TCCs e projetos de extensão. A UnDF já possui parte dos equipamentos subutilizados nos departamentos. Uma gestão centralizada com sistema de reservas online tornaria esses recursos acessíveis a toda a comunidade acadêmica.",
    category: "Tecnologia" as const,
    status: "open" as const,
    supportCount: 94,
    targetUnit: "Diretoria de Comunicação",
    createdAt: new Date("2026-03-05"),
    updatedAt: new Date("2026-03-05"),
  },
  {
    title: "Semana de Integração para Calouros com Foco em Saúde Mental",
    description:
      "Proposta de reformulação da semana de recepção de calouros com inclusão obrigatória de atividades sobre saúde mental universitária, identificação de serviços de apoio psicológico, técnicas de estudo e gestão do tempo. A NAPSI (Núcleo de Apoio Psicossocial) da UnDF poderia liderar as atividades. Dados do SIS-2025 indicam que 68% dos trancamentos de matrícula ocorrem nos dois primeiros semestres.",
    category: "Assistência Estudantil" as const,
    status: "open" as const,
    supportCount: 167,
    targetUnit: "Pró-Reitoria de Assistência Estudantil",
    createdAt: new Date("2026-03-15"),
    updatedAt: new Date("2026-03-15"),
  },
  {
    title: "Expansão do Wi-Fi para Áreas Externas e Estacionamentos",
    description:
      "O sinal Wi-Fi da UnDF cobre apenas ambientes internos. Áreas de convivência, pátios e o estacionamento principal — muito usados para estudo e trabalho remoto — ficam sem cobertura. Propomos a instalação de access points externos impermeáveis em 6 pontos estratégicos do campus. O custo estimado é de R$ 18.000, dentro do teto de investimento do REUNI 2026.",
    category: "Tecnologia" as const,
    status: "open" as const,
    supportCount: 88,
    targetUnit: "Diretoria de Tecnologia da Informação",
    createdAt: new Date("2026-04-02"),
    updatedAt: new Date("2026-04-02"),
  },
];

async function seed() {
  console.log("Iniciando seed do banco de dados UnDF Participa...");

  // Inserir demandas (ignorar conflitos de protocolo para idempotência)
  for (const demand of SEED_DEMANDS) {
    await db
      .insert(demands)
      .values(demand)
      .onConflictDoNothing();
  }
  console.log(`${SEED_DEMANDS.length} demandas inseridas`);

  // Inserir propostas
  for (const proposal of SEED_PROPOSALS) {
    await db
      .insert(proposals)
      .values(proposal)
      .onConflictDoNothing();
  }
  console.log(`${SEED_PROPOSALS.length} propostas inseridas`);

  console.log("Seed concluído com sucesso.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Erro durante o seed:", err);
  process.exit(1);
});
