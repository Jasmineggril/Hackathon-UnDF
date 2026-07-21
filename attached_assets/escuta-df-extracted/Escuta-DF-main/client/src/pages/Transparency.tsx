import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BarChart, FileText, DollarSign, Users, ArrowLeft } from "lucide-react";

export default function Transparency() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl" id="main-content">
            <div className="mb-4">
                <Link href="/">
                    <Button variant="ghost" className="pl-0 gap-2 text-slate-600 hover:text-primary hover:bg-transparent">
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para o Início
                    </Button>
                </Link>
            </div>

            <div className="mb-10 text-center">
                <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Portal da Transparência</h1>
                <p className="text-slate-600 max-w-2xl mx-auto">
                    Acesso livre às informações sobre a execução orçamentária, financeira e administrativa.
                    Compromisso com a prestação de contas à sociedade.
                </p>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-white hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                        <DollarSign className="w-10 h-10 text-emerald-600 mb-3" />
                        <h3 className="font-bold text-slate-900">Despesas e Receitas</h3>
                    </CardContent>
                </Card>
                <Card className="bg-white hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                        <FileText className="w-10 h-10 text-blue-600 mb-3" />
                        <h3 className="font-bold text-slate-900">Licitações e Contratos</h3>
                    </CardContent>
                </Card>
                <Card className="bg-white hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                        <Users className="w-10 h-10 text-orange-600 mb-3" />
                        <h3 className="font-bold text-slate-900">Servidores e Salários</h3>
                    </CardContent>
                </Card>
                <Card className="bg-white hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                        <BarChart className="w-10 h-10 text-purple-600 mb-3" />
                        <h3 className="font-bold text-slate-900">Relatórios de Gestão</h3>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Últimas Movimentações</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Descrição</TableHead>
                                        <TableHead className="text-right">Valor</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>28/01/2026</TableCell>
                                        <TableCell>Manutenção de Servidores - Cloud</TableCell>
                                        <TableCell className="text-right">R$ 15.400,00</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>25/01/2026</TableCell>
                                        <TableCell>Aquisição de Equipamentos de TI</TableCell>
                                        <TableCell className="text-right">R$ 48.200,50</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>20/01/2026</TableCell>
                                        <TableCell>Serviços de Consultoria em Acessibilidade</TableCell>
                                        <TableCell className="text-right">R$ 12.000,00</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>15/01/2026</TableCell>
                                        <TableCell>Campanha Publicitária "Escuta Mais"</TableCell>
                                        <TableCell className="text-right">R$ 35.000,00</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-slate-50">
                        <CardHeader>
                            <CardTitle className="text-base">Documentos Institucionais</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <a href="#" className="text-sm text-primary hover:underline flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Relatório Anual 2025.pdf
                            </a>
                            <a href="#" className="text-sm text-primary hover:underline flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Planejamento Estratégico 2026-2030.pdf
                            </a>
                            <a href="#" className="text-sm text-primary hover:underline flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Carta de Serviços ao Cidadão.pdf
                            </a>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary text-white">
                        <CardContent className="p-6">
                            <h3 className="font-bold mb-2">Precisa de dados específicos?</h3>
                            <p className="text-sm mb-4 text-blue-100">
                                Se você não encontrou a informação que procurava, solicite através do nosso Serviço de Informação ao Cidadão (e-SIC).
                            </p>
                            <button className="w-full py-2 bg-white text-primary font-bold rounded hover:bg-slate-100 transition-colors">
                                Acessar e-SIC
                            </button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
