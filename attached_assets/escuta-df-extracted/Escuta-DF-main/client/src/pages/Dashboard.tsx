import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileText, History, LogOut, Megaphone, Settings, User, Shield } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Dashboard() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [user, setUser] = useState<{ name: string, profile: string, email: string, lastAccess: string, cpf?: string, phone?: string } | null>(null);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

    // Estado para o formulário de edição
    const [editFormData, setEditFormData] = useState({
        name: "",
        email: "",
        phone: "",
        cpf: ""
    });

    // Carrega dados do usuário (simulação de persistência)
    useEffect(() => {
        const storedUser = localStorage.getItem("escuta_user");
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            // Preenche o formulário de edição com os dados atuais
            setEditFormData({
                name: userData.name || "",
                email: userData.email || "",
                phone: userData.phone || "",
                cpf: userData.cpf || ""
            });
        } else {
            // Se não encontrar dados no localStorage, redireciona para o login
            // Isso garante segurança na navegação: só entra quem logou.
            setLocation("/auth");
        }
    }, [setLocation]);

    const handleLogout = () => {
        localStorage.removeItem("escuta_user");
        // Força reload para limpar estados ou redireciona
        setLocation("/auth");
    };

    const handleSaveProfile = () => {
        if (!user) return;

        const updatedUser = {
            ...user,
            name: editFormData.name,
            email: editFormData.email,
            phone: editFormData.phone,
            cpf: editFormData.cpf
        };

        // Salva no localStorage para persistir
        localStorage.setItem("escuta_user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditProfileOpen(false);

        toast({
            title: "Dados atualizados!",
            description: "Suas informações foram salvas com sucesso.",
        });
    };

    const [recentReports, setRecentReports] = useState<any[]>([]);

    useEffect(() => {
        // Carrega manifestações reais do localStorage
        const storedReports = localStorage.getItem("reports");
        if (storedReports) {
            try {
                const parsedReports = JSON.parse(storedReports);
                // Ordena por data (mais recente primeiro) e pega os últimos 5
                const sorted = parsedReports.sort((a: any, b: any) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                ).slice(0, 5);
                setRecentReports(sorted);
            } catch (e) {
                console.error("Erro ao ler relatórios locais", e);
            }
        }
    }, []);

    const stats = [
        { label: "Manifestações Abertas", value: recentReports.filter(r => r.status !== 'completed').length, color: "text-blue-600 bg-blue-50" },
        { label: "Respondidas", value: 0, color: "text-amber-600 bg-amber-50" }, // Mock
        { label: "Concluídas", value: recentReports.filter(r => r.status === 'completed').length, color: "text-green-600 bg-green-50" }
    ];

    /* Removemos dados hardcoded antigos */


    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8">

                {/* Cabeçalho do Dashboard */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8"
                >
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-white shadow-lg">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-primary text-white text-xl">
                                {user?.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-display font-bold text-slate-900">Olá, {user?.name}</h1>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Badge variant="outline" className="bg-white">{user?.profile}</Badge>
                                <span>Último acesso: {user?.lastAccess}</span>
                            </div>
                        </div>
                    </div>

                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" /> Sair do Sistema
                    </Button>
                </motion.div>

                {/* Estatísticas Rápidas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: idx * 0.1 }}
                        >
                            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                                    </div>
                                    <div className={`p-3 rounded-xl ${stat.color}`}>
                                        <FileText className="w-6 h-6" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Coluna Principal: Ações e Histórico */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="lg:col-span-2 space-y-8"
                    >

                        {/* Ações Rápidas */}
                        <section>
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Megaphone className="w-5 h-5 text-primary" /> O que deseja fazer?
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Link href="/nova-manifestacao">
                                    <div className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full">
                                        <div className="h-12 w-12 bg-blue-100 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Megaphone className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-bold text-slate-900 mb-1">Nova Manifestação</h3>
                                        <p className="text-sm text-slate-500">Registre reclamações, denúncias ou sugestões.</p>
                                    </div>
                                </Link>

                                <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                                    <DialogTrigger asChild>
                                        <div className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full">
                                            <div className="h-12 w-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <User className="w-6 h-6" />
                                            </div>
                                            <h3 className="font-bold text-slate-900 mb-1">Meus Dados</h3>
                                            <p className="text-sm text-slate-500">Clique para visualizar ou editar seu cadastro.</p>
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Editar Meus Dados</DialogTitle>
                                            <DialogDescription>
                                                Mantenha suas informações atualizadas para contato.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="name">Nome Completo</Label>
                                                <Input
                                                    id="name"
                                                    value={editFormData.name}
                                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="email">E-mail</Label>
                                                <Input
                                                    id="email"
                                                    value={editFormData.email}
                                                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="cpf">CPF</Label>
                                                    <Input
                                                        id="cpf"
                                                        value={editFormData.cpf}
                                                        onChange={(e) => setEditFormData({ ...editFormData, cpf: e.target.value })}
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="phone">Telefone</Label>
                                                    <Input
                                                        id="phone"
                                                        value={editFormData.phone}
                                                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" onClick={handleSaveProfile}>Salvar Alterações</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </section>

                        {/* Histórico Recente */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <History className="w-5 h-5 text-primary" /> Histórico Recente
                                </h2>
                                <Button variant="ghost" className="text-primary p-0 h-auto hover:bg-transparent hover:underline">Ver tudo</Button>
                            </div>

                            <Card className="overflow-hidden border-slate-200">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-4">Protocolo</th>
                                                <th className="px-6 py-4">Assunto</th>
                                                <th className="px-6 py-4">Data</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {recentReports.map((report) => (
                                                <tr key={report.protocol} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => setLocation(`/consultar`)}>
                                                    <td className="px-6 py-4 font-mono font-medium text-primary group-hover:text-primary/80 transition-colors">{report.protocol}</td>
                                                    <td className="px-6 py-4 font-medium text-slate-700 capitalize">{report.category || report.type}</td>
                                                    <td className="px-6 py-4 text-slate-500 text-sm">
                                                        {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : report.date}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border
                                                            ${report.status === 'completed' || report.status === 'Concluído' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                report.status === 'processing' || report.status === 'Em Análise' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                                    'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${report.status === 'completed' || report.status === 'Concluído' ? 'bg-green-500' :
                                                                    report.status === 'processing' || report.status === 'Em Análise' ? 'bg-amber-500' :
                                                                        'bg-blue-500'
                                                                }`}></span>
                                                            {report.status === 'received' ? 'Recebido' :
                                                                report.status === 'processing' ? 'Em Análise' :
                                                                    report.status === 'completed' ? 'Concluído' : report.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 group-hover:text-primary transition-colors">
                                                            <ArrowRight className="w-4 h-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </section>
                    </motion.div>

                    {/* Coluna Lateral: Notificações & Canais */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="space-y-6"
                    >
                        <Card className="bg-gradient-to-br from-primary to-blue-900 text-white border-0 shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 relative z-10 text-lg">
                                    <Shield className="w-5 h-5 text-accent" /> Dicas de Segurança
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 relative z-10">
                                <p className="text-sm text-blue-100 leading-relaxed font-light">
                                    A Ouvidoria <strong>nunca</strong> solicita senhas ou dados bancários por telefone. Mantenha seus contatos atualizados para receber notificações oficiais.
                                </p>
                                <Button size="sm" className="w-full bg-white text-primary hover:bg-blue-50 border-0 font-semibold shadow-sm">
                                    Verificar minha conta
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Megaphone className="w-4 h-4 text-slate-400" /> Canais de Atendimento
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 p-2 rounded-lg -mx-2 transition-colors">
                                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-primary font-bold shadow-sm group-hover:scale-105 transition-transform">162</div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-900 text-sm">Central 162</p>
                                        <p className="text-xs text-slate-500">Ligação gratuita</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                                </li>
                                <li className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 p-2 rounded-lg -mx-2 transition-colors">
                                    <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold shadow-sm group-hover:scale-105 transition-transform">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-900 text-sm">WhatsApp</p>
                                        <p className="text-xs text-slate-500">(61) 99999-9999</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                                </li>
                            </ul>
                        </div>
                    </motion.div>

                </div>
            </main>

            <Footer />
        </div>
    );
}