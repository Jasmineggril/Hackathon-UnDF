import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import logoImg from "@assets/_Logo_Escuta_DF__1769708916694.jpg";

export default function About() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl" id="main-content">
            <div className="mb-6">
                <Link href="/">
                    <Button variant="ghost" className="pl-0 gap-2 text-slate-600 hover:text-primary hover:bg-transparent">
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para o Início
                    </Button>
                </Link>
            </div>

            <h1 className="text-3xl font-display font-bold text-slate-900 mb-8">Sobre a Instituição</h1>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="space-y-6">
                    <section>
                        <h2 className="text-xl font-semibold text-primary mb-3">Nossa Missão</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Promover a participação cidadã e garantir a transparência na gestão pública do Distrito Federal,
                            oferecendo canais acessíveis e eficientes para que cada voz seja ouvida e considerada
                            na construção de políticas públicas.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-primary mb-3">Nossa Visão</h2>
                        <p className="text-slate-700 leading-relaxed">
                            Ser referência nacional em ouvidoria pública digital, reconhecida pela excelência no atendimento,
                            inovação tecnológica e compromisso real com a resolução das demandas da sociedade.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-primary mb-3">Nossos Valores</h2>
                        <ul className="list-disc pl-5 space-y-2 text-slate-700">
                            <li>Transparência Ativa</li>
                            <li>Acessibilidade Universal</li>
                            <li>Ética e Integridade</li>
                            <li>Inovação Pública</li>
                            <li>Humanização no Atendimento</li>
                        </ul>
                    </section>
                </div>

                <div className="space-y-6">
                    <Card className="p-6 bg-slate-50 border-slate-200">
                        <h3 className="font-semibold text-slate-900 mb-2">Quem Somos</h3>
                        <p className="text-sm text-slate-600 mb-4">
                            O Escuta DF é a plataforma oficial de ouvidoria que conecta você aos órgãos do Distrito Federal.
                            Aqui centralizamos manifestações para agilizar respostas e monitorar a qualidade dos serviços públicos.
                        </p>
                        <div className="h-48 bg-white rounded-md w-full flex items-center justify-center border border-slate-100 p-4">
                            <img
                                src={logoImg}
                                alt="Logo Escuta DF"
                                className="max-h-full max-w-full object-contain"
                            />
                        </div>
                    </Card>
                </div>
            </div>

            <section className="bg-primary/5 p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Estrutura Organizacional</h2>
                <p className="text-slate-700 mb-4">
                    Nossa estrutura é composta por equipes dedicadas à triagem, análise e encaminhamento de demandas.
                    Trabalhamos em conjunto com todas as secretarias para garantir que sua solicitação chegue ao setor responsável.
                </p>
                <div className="grid sm:grid-cols-3 gap-4 text-center mt-8">
                    <div className="p-4 bg-white rounded-lg shadow-sm">
                        <h4 className="font-bold text-primary">Atendimento</h4>
                        <p className="text-sm text-slate-500">Equipe de Triagem</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow-sm">
                        <h4 className="font-bold text-primary">Análise</h4>
                        <p className="text-sm text-slate-500">Gestão de Demandas</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow-sm">
                        <h4 className="font-bold text-primary">Ouvidoria Geral</h4>
                        <p className="text-sm text-slate-500">Diretoria Executiva</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
