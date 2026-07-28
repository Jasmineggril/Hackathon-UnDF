import { motion } from "framer-motion";
import { FileText } from "lucide-react";

const sections = [
  {
    title: "1. Finalidade do serviço",
    content:
      "O Voz UnDF é uma plataforma digital de participação e gestão colaborativa da Universidade do Distrito Federal (UnDF). Seu objetivo é oferecer à comunidade acadêmica — estudantes, docentes e servidores — um canal acessível para registrar demandas, apresentar propostas, acompanhar o andamento e participar da melhoria institucional.",
  },
  {
    title: "2. Cadastro e responsabilidade",
    content:
      "O acesso completo à plataforma requer cadastro com dados verídicos. O usuário é responsável pela segurança e confidencialidade de sua senha. Não é permitido criar contas falsas, compartilhar credenciais ou tentar acessar a conta de terceiros. Roles administrativas (gestor e administrador) não estão disponíveis para cadastro público e são atribuídas pela UnDF.",
  },
  {
    title: "3. Condutas permitidas",
    content: "",
    list: [
      "Registrar demandas, sugestões, solicitações, elogios e consultas institucionais",
      "Apresentar propostas de melhoria fundamentadas",
      "Apoiar demandas e propostas publicadas",
      "Consultar protocolos e acompanhar o andamento",
      "Utilizar linguagem respeitosa e construtiva",
      "Escolher a categoria adequada para cada manifestação",
    ],
  },
  {
    title: "4. Condutas proibidas",
    content: "",
    list: [
      "Ameaçar, coagir, ofender ou discriminar qualquer pessoa",
      "Publicar conteúdo ilegal, difamatório ou violador de direitos",
      "Divulgar dados pessoais de terceiros sem consentimento",
      "Enviar documentos contendo informações sensíveis de terceiros",
      "Criar demandas falsas ou duplicadas com intuito de manipulação",
      "Tentar burlar a autenticação ou comprometer a segurança do sistema",
    ],
  },
  {
    title: "5. Moderação",
    content:
      "Conteúdos que violem estes Termos de Uso poderão ser removidos ou ocultados por gestores e administradores da plataforma. O usuário será notificado sempre que possível. Casos graves poderão ser encaminhados às instâncias disciplinares competentes da UnDF.",
  },
  {
    title: "6. Conteúdo enviado",
    content:
      "Ao registrar uma manifestação, o usuário declara que tem o direito de publicar o conteúdo e que ele não viola direitos de terceiros. A UnDF não se responsabiliza por informações incorretas ou conteúdo enviado pelos usuários.",
  },
  {
    title: "7. Disponibilidade e limitações",
    content:
      "O Voz UnDF é disponibilizado da forma como está. A UnDF envidarará esforços para manter a plataforma funcionando, mas não garante disponibilidade contínua e ininterrupta. A plataforma poderá ser suspensa ou alterada para manutenção, segurança ou atualização sem aviso prévio.",
  },
  {
    title: "8. Privacidade",
    content:
      "O uso da plataforma implica o tratamento de dados pessoais conforme a Política de Privacidade do Voz UnDF. Ao criar conta e utilizar os serviços, o usuário consente com o tratamento descrito na Política de Privacidade.",
  },
  {
    title: "9. Atualização dos Termos",
    content:
      "Estes Termos de Uso podem ser atualizados a qualquer momento. Mudanças relevantes serão informadas na plataforma. O uso continuado após a atualização implica aceitação dos novos termos.",
  },
  {
    title: "10. Legislação aplicável",
    content:
      "Estes Termos de Uso são regidos pela legislação brasileira, incluindo a Lei nº 13.709/2018 (LGPD) e a Lei nº 13.146/2015 (Lei Brasileira de Inclusão). Foro e demais definições jurídicas serão estabelecidos pela UnDF antes da publicação oficial da plataforma.",
  },
];

export default function Termos() {
  return (
    <div className="flex flex-col w-full bg-[#F2F0EB]">
      {/* Hero */}
      <section className="px-6 md:px-12 pt-16 pb-14 border-b border-[#1B3469]/15">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 border border-[#1B3469]/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#5B9A6E]" />
            </div>
            <span className="text-xs tracking-widest uppercase text-[#5B9A6E] font-semibold">Legal</span>
          </div>
          <h1
            className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[0.95] tracking-tight text-[#1B3469] mb-6"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            termos<br />de uso.
          </h1>
          <p className="text-[#1B3469]/60 text-sm leading-relaxed max-w-xl">
            Os Termos de Uso definem as regras do serviço e o comportamento esperado dos usuários da plataforma Voz UnDF.
          </p>
          <p className="text-[#1B3469]/40 text-xs mt-4">
            Última revisão: versão inicial — sujeita a revisão institucional pela UnDF antes da publicação oficial.
          </p>
        </div>
      </section>

      {/* Sections */}
      <section className="px-6 md:px-12 py-16">
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
              {sec.content && (
                <p className="text-[#1B3469]/65 text-sm leading-relaxed">{sec.content}</p>
              )}
              {sec.list && (
                <ul className="space-y-2 mt-2">
                  {sec.list.map((item, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-[#1B3469]/65 leading-relaxed">
                      <span className="text-[#5B9A6E] font-bold mt-0.5 flex-shrink-0">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>

        <div className="max-w-3xl mt-16 pt-8 border-t border-[#1B3469]/15">
          <p className="text-[#1B3469]/40 text-xs leading-relaxed">
            Dúvidas sobre estes termos? Consulte a Central de Ajuda ou aguarde a definição do canal institucional oficial de contato da UnDF.
          </p>
        </div>
      </section>
    </div>
  );
}
