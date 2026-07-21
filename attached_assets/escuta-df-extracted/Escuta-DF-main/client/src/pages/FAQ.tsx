import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function FAQ() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl" id="main-content">
            <div className="mb-6">
                <Link href="/">
                    <Button variant="ghost" className="pl-0 gap-2 text-slate-600 hover:text-primary hover:bg-transparent">
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para o Início
                    </Button>
                </Link>
            </div>

            <h1 className="text-3xl font-display font-bold text-slate-900 mb-8 text-center">Perguntas Frequentes (FAQ)</h1>

            <Accordion type="single" collapsible className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-2">
                <AccordionItem value="item-1" className="px-4">
                    <AccordionTrigger className="text-left font-semibold text-slate-800">Como faço para registrar uma denúncia anônima?</AccordionTrigger>
                    <AccordionContent className="text-slate-600">
                        Ao iniciar uma nova manifestação, na etapa de Identificação, você pode marcar a opção "Manter anonimato".
                        Seu relato será registrado sem vincular seus dados pessoais à visualização pública ou ao setor que receberá a demanda,
                        garantindo sua privacidade.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="px-4">
                    <AccordionTrigger className="text-left font-semibold text-slate-800">Qual o prazo para resposta da minha solicitação?</AccordionTrigger>
                    <AccordionContent className="text-slate-600">
                        De acordo com a Lei de Acesso à Informação e normas internas, o prazo padrão para uma primeira resposta é de até 20 dias,
                        podendo ser prorrogado por mais 10 dias mediante justificativa.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="px-4">
                    <AccordionTrigger className="text-left font-semibold text-slate-800">Posso enviar vídeos ou áudios como prova?</AccordionTrigger>
                    <AccordionContent className="text-slate-600">
                        Sim! O Escuta DF permite que você envie arquivos de áudio, vídeo e imagens. Na etapa "Formato" da sua manifestação,
                        selecione o tipo de mídia que deseja enviar e faça o upload ou grave diretamente pelo navegador.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="px-4">
                    <AccordionTrigger className="text-left font-semibold text-slate-800">Como acompanho o andamento do meu protocolo?</AccordionTrigger>
                    <AccordionContent className="text-slate-600">
                        Ao finalizar sua manifestação, você receberá um número de protocolo.
                        Acesse a área "Consultar" no menu principal, digite esse número e veja o status atualizado do seu pedido.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="px-4">
                    <AccordionTrigger className="text-left font-semibold text-slate-800">O que é a Ouvidoria?</AccordionTrigger>
                    <AccordionContent className="text-slate-600">
                        A Ouvidoria é um canal de diálogo entre o cidadão e a Administração Pública.
                        Sua função é receber, examinar e encaminhar manifestações (reclamações, denúncias, elogios, sugestões e solicitações)
                        referentes aos serviços prestados.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
