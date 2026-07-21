import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import logoImg from "@assets/_Logo_Escuta_DF__1769708916694.jpg";

export default function LoginPage() {
    const [, setLocation] = useLocation();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            // Atualiza o acesso ou cria usuário padrão Gov.br se não existir
            const existingUser = localStorage.getItem("escuta_user");
            if (existingUser) {
                const user = JSON.parse(existingUser);
                localStorage.setItem("escuta_user", JSON.stringify({
                    ...user,
                    lastAccess: new Date().toLocaleString('pt-BR')
                }));
            } else {
                localStorage.setItem("escuta_user", JSON.stringify({
                    name: "Cidadão (Gov.br)",
                    email: "acesso@gov.br",
                    profile: "Nível Prata",
                    lastAccess: new Date().toLocaleString('pt-BR')
                }));
            }

            setIsLoading(false);
            setLocation("/dashboard");
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header Simplificado para Login */}
            <header className="bg-white border-b py-4 px-6 md:px-12 flex items-center justify-between">
                <Link href="/">
                    <div className="flex items-center gap-3 cursor-pointer">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full border border-slate-100 shadow-sm">
                            <img src={logoImg} alt="Logo Escuta DF" className="h-full w-full object-cover" />
                        </div>
                        <span className="font-display font-bold text-xl text-primary">Escuta DF</span>
                    </div>
                </Link>
                <Link href="/">
                    <Button variant="ghost" size="sm" className="text-slate-600 gap-2">
                        <ArrowLeft className="w-4 h-4" /> Voltar
                    </Button>
                </Link>
            </header>

            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md space-y-6">

                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Acesse sua conta</h1>
                        <p className="text-slate-500 text-sm">Identifique-se para acessar seus protocolos.</p>
                    </div>

                    <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
                        <CardHeader className="space-y-1 pb-4">
                            <CardTitle className="text-xl text-center">Login</CardTitle>
                            <CardDescription className="text-center">
                                Escolha uma forma de autenticação
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="govbr" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-4">
                                    <TabsTrigger value="govbr">Gov.br</TabsTrigger>
                                    <TabsTrigger value="cpf">CPF / Senha</TabsTrigger>
                                </TabsList>

                                <TabsContent value="govbr">
                                    <div className="space-y-4 py-4 text-center">
                                        <Button
                                            size="lg"
                                            className="w-full bg-[#1351B4] hover:bg-[#0c3d8e] text-white font-bold h-12 rounded-full relative overflow-hidden group"
                                            onClick={() => setLocation("/dashboard")}
                                        >
                                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                            <span className="relative flex items-center justify-center gap-2">
                                                Entrar com gov.br
                                            </span>
                                        </Button>
                                        <p className="text-xs text-slate-500">
                                            Use sua conta nível <strong>Prata</strong> ou <strong>Ouro</strong> para acesso completo.
                                        </p>
                                    </div>
                                </TabsContent>

                                <TabsContent value="cpf">
                                    <form onSubmit={handleLogin} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="cpf">CPF</Label>
                                            <Input id="cpf" placeholder="000.000.000-00" required />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="password">Senha</Label>
                                                <a href="#" className="text-xs text-primary hover:underline">Esqueceu a senha?</a>
                                            </div>
                                            <Input id="password" type="password" required />
                                        </div>
                                        <Button type="submit" className="w-full h-11" disabled={isLoading}>
                                            {isLoading ? "Autenticando..." : "Entrar"}
                                        </Button>
                                    </form>
                                </TabsContent>
                            </Tabs>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-4 border-t bg-slate-50/50 p-6">
                            <div className="text-center text-sm">
                                Não tem uma conta? <Link href="/cadastro" className="font-bold text-primary hover:underline">Cadastre-se</Link>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-2">
                                <Lock className="w-3 h-3" /> Ambiente Seguro e Criptografado
                            </div>
                        </CardFooter>
                    </Card>

                    <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                            <a href="#" className="hover:text-primary transition-colors">Termos de Uso</a>
                            <span>•</span>
                            <a href="#" className="hover:text-primary transition-colors">Política de Privacidade</a>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-6 text-center border-t">
                <p className="text-xs text-slate-400">Escuta DF - GovTech Hackathon © 2026</p>
            </footer>
        </div >
    );
}
