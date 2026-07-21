import { useLocation } from "wouter";
import { ShieldCheck, FileText, Lock } from "lucide-react";

export default function Legal() {
    const [location] = useLocation();

    let title = "";
    let icon = null;
    let content = null;

    if (location === "/privacidade") {
        title = "Política de Privacidade";
        icon = <Lock className="w-12 h-12 text-primary" />;
        content = (
            <div className="space-y-4 text-left">
                <p>A sua privacidade é importante para nós. É política do Escuta DF respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site Escuta DF, e outros sites que possuímos e operamos.</p>
                <p>Solicitamos informações pessoais, como nome e e-mail, apenas quando realmente precisamos delas para lhe fornecer um serviço (ex: resposta à manifestação). Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento.</p>
                <p>Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis ​​para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.</p>
                <p>Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.</p>
            </div>
        );
    } else if (location === "/termos") {
        title = "Termos de Uso";
        icon = <FileText className="w-12 h-12 text-primary" />;
        content = (
            <div className="space-y-4 text-left">
                <h3 className="font-bold">1. Aceitação dos Termos</h3>
                <p>Ao acessar ao site Escuta DF, concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis ​​e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis.</p>

                <h3 className="font-bold">2. Uso de Licença</h3>
                <p>É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site Escuta DF, apenas para visualização transitória pessoal e não comercial.</p>

                <h3 className="font-bold">3. Isenção de responsabilidade</h3>
                <p>Os materiais no site da Escuta DF são fornecidos 'como estão'. Escuta DF não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual ou outra violação de direitos.</p>
            </div>
        );
    } else if (location === "/lgpd") {
        title = "Lei Geral de Proteção de Dados (LGPD)";
        icon = <ShieldCheck className="w-12 h-12 text-primary" />;
        content = (
            <div className="space-y-4 text-left">
                <p>O Escuta DF está em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>
                <p>Você, como titular dos dados, tem os seguintes direitos:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Confirmação da existência de tratamento;</li>
                    <li>Acesso aos dados;</li>
                    <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
                    <li>Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com o disposto nesta Lei;</li>
                    <li>Portabilidade dos dados a outro fornecedor de serviço ou produto, mediante requisição expressa;</li>
                    <li>Eliminação dos dados pessoais tratados com o consentimento do titular;</li>
                </ul>
                <p className="mt-4 font-semibold">Encarregado de Dados (DPO):</p>
                <p>Para exercer seus direitos, entre em contato através do e-mail: ouvidoria@df.gov.br</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-16 max-w-3xl min-h-[calc(100vh-80px)]">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-primary/10 p-4 rounded-full">
                        {icon}
                    </div>
                </div>
                <h1 className="text-3xl font-display font-bold text-slate-900 mb-8">{title}</h1>
                <div className="text-slate-600 leading-relaxed">
                    {content}
                </div>
            </div>
        </div>
    );
}
