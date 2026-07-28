import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const dataTypes = [
  {
    category: "Dados de cadastro",
    items: "Nome completo, e-mail institucional, vínculo com a UnDF (estudante, docente, servidor) e data de criação da conta.",
  },
  {
    category: "Demandas e propostas",
    items: "Título, conteúdo, tipo, categoria, unidade destinatária, status e histórico de tramitação. Quando a manifestação for anônima, a identidade do autor não será vinculada ao registro público.",
  },
  {
    category: "Apoios",
    items: "Registro de demandas e propostas apoiadas, associado ao usuário autenticado. A identidade dos apoiadores não é exibida publicamente.",
  },
  {
    category: "Protocolos",
    items: "Código único no formato VUNDF-AAAAMMDD-XXXX gerado para cada manifestação registrada.",
  },
  {
    category: "Anexos (imagens, documentos, áudios)",
    items: "Armazenados em ambiente seguro com controle de acesso. Arquivos privados acessíveis apenas ao usuário e aos gestores autorizados.",
  },
  {
    category: "Preferências e acessibilidade",
    items: "Configurações visuais (contraste, tamanho de fonte, modo de leitura) salvas localmente no navegador do usuário e não enviadas ao servidor.",
  },
  {
    category: "Cookies",
    items: "Utilizamos cookies estritamente necessários para o funcionamento da plataforma e cookies funcionais. Não utilizamos cookies de rastreamento publicitário.",
  },
];

const rights = [
  { right: "Confirmação do tratamento", desc: "Saber se seus dados pessoais são tratados pela plataforma." },
  { right: "Acesso", desc: "Obter cópia dos dados pessoais que tratamos." },
  { right: "Correção", desc: "Atualizar dados incorretos, incompletos ou desatualizados." },
  { right: "Informação", desc: "Saber com quem seus dados foram compartilhados." },
  { right: "Anonimização", desc: "Solicitar a anonimização de dados desnecessários quando aplicável." },
  { right: "Eliminação", desc: "Solicitar a exclusão de dados tratados com base em consentimento, quando não houver obrigação legal de retenção." },
  { right: "Revogação do consentimento", desc: "Retirar o consentimento para tratamentos baseados nessa base legal." },
];

const sections = [
  {
    title: "Por que coletamos dados",
    content:
      "Os dados pessoais coletados pelo Voz UnDF são utilizados exclusivamente para: (a) autenticação e controle de acesso; (b) registro e acompanhamento de manifestações; (c) geração de protocolos; (d) comunicação institucional pertinente; (e) produção de indicadores agregados e anônimos; (f) melhoria da plataforma.",
  },
  {
    title: "Compartilhamento de dados",
    content:
      "Não vendemos nem compartilhamos dados pessoais com terceiros para fins comerciais. Dados podem ser compartilhados com setores da UnDF responsáveis pelo atendimento de demandas, dentro dos limites necessários. Em caso de obrigação legal, dados poderão ser fornecidos às autoridades competentes.",
  },
  {
    title: "Retenção de dados",
    content:
      "Dados são mantidos pelo período necessário ao cumprimento das finalidades descritas, respeitando obrigações legais e institucionais de guarda de documentos públicos. A simples exclusão de conta não elimina automaticamente registros institucionais.",
  },
  {
    title: "Segurança",
    content:
      "Adotamos medidas técnicas e organizacionais para proteger os dados pessoais contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui autenticação por JWT, URLs assinadas para arquivos, controle de acesso por role e criptografia em trânsito.",
  },
  {
    title: "Anonimato",
    content:
      "O usuário pode optar por registrar demandas de forma anônima. Nesse caso, a identidade do autor não será exibida publicamente. Para fins de moderação e segurança, a associação entre o registro e o usuário é mantida internamente e acessível apenas a administradores autorizados.",
  },
];

export default function Privacidade() {
  return (
    <div className="flex flex-col w-full bg-[#F2F0EB]">
      {/* Hero */}
      <section className="px-6 md:px-12 pt-16 pb-14 border-b border-[#1B3469]/15">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 border border-[#1B3469]/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#5B9A6E]" />
            </div>
            <span className="text-xs tracking-widest uppercase text-[#5B9A6E] font-semibold">Legal</span>
          </div>
          <h1
            className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[0.95] tracking-tight text-[#1B3469] mb-6"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            política de<br />privacidade.
          </h1>
          <p className="text-[#1B3469]/60 text-sm leading-relaxed max-w-xl">
            Privacidade é o direito do usuário de compreender e controlar como suas informações pessoais são utilizadas. Esta política descreve como o Voz UnDF trata dados pessoais.
          </p>
          <p className="text-[#1B3469]/40 text-xs mt-4">
            Última revisão: versão inicial — sujeita a revisão institucional pela UnDF antes da publicação oficial.
          </p>
        </div>
      </section>

      {/* What we collect */}
      <section className="px-6 md:px-12 py-16 border-b border-[#1B3469]/15">
        <div className="max-w-3xl">
          <h2
            className="text-xl font-bold text-[#1B3469] mb-8"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Dados que coletamos
          </h2>
          <div className="space-y-0 border border-[#1B3469]/10 divide-y divide-[#1B3469]/10">
            {dataTypes.map((d, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="bg-white p-6"
              >
                <h3 className="font-semibold text-[#1B3469] text-sm mb-1.5">{d.category}</h3>
                <p className="text-sm text-[#1B3469]/60 leading-relaxed">{d.items}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main sections */}
      <section className="px-6 md:px-12 py-16 border-b border-[#1B3469]/15">
        <div className="max-w-3xl space-y-10">
          {sections.map((sec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <h2
                className="font-bold text-[#1B3469] text-lg mb-3"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {sec.title}
              </h2>
              <p className="text-[#1B3469]/65 text-sm leading-relaxed">{sec.content}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* LGPD Rights */}
      <section className="px-6 md:px-12 py-16 border-b border-[#1B3469]/15">
        <div className="max-w-3xl">
          <h2
            className="text-xl font-bold text-[#1B3469] mb-3"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Seus direitos sob a LGPD
          </h2>
          <p className="text-[#1B3469]/60 text-sm mb-8 leading-relaxed">
            A Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018) assegura os seguintes direitos ao titular de dados:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rights.map((r, i) => (
              <div key={i} className="bg-white border border-[#1B3469]/10 p-5">
                <h3 className="font-semibold text-[#1B3469] text-sm mb-1">{r.right}</h3>
                <p className="text-xs text-[#1B3469]/55 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-[#1B3469]/40 text-xs mt-8 leading-relaxed">
            O canal institucional para exercício dos direitos do titular será definido pela UnDF antes da publicação oficial da plataforma.
          </p>
        </div>
      </section>

      {/* Footer note */}
      <section className="px-6 md:px-12 py-12">
        <div className="max-w-3xl">
          <p className="text-[#1B3469]/40 text-xs leading-relaxed">
            Esta Política de Privacidade é um documento complementar aos Termos de Uso. Dúvidas sobre o tratamento de dados? Aguarde a definição do canal institucional oficial de contato da UnDF.
          </p>
        </div>
      </section>
    </div>
  );
}
