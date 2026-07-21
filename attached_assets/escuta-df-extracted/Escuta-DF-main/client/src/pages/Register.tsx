import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Lock, UserPlus } from "lucide-react";
import logoImg from "@assets/_Logo_Escuta_DF__1769708916694.jpg";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        cpf: "",
        phone: "",
        email: ""
    });

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Salvando no LocalStorage para persistir no Dashboard
        localStorage.setItem("escuta_user", JSON.stringify({
            name: formData.name,
            email: formData.email,
            profile: "Cidadão",
            lastAccess: new Date().toLocaleString('pt-BR')
        }));

        // Simulação de cadastro
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Conta criada com sucesso!",
                description: "Você já pode acessar o sistema.",
            });
            // Redireciona para o Dashboard (simulando login automático pós-cadastro)
            setLocation("/dashboard");
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white border-b py-4 px-6 md:px-12 flex items-center justify-between">
                <Link href="/">
                    <div className="flex items-center gap-3 cursor-pointer">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full border border-slate-100 shadow-sm">
                            <img src={logoImg} alt="Logo Escuta DF" className="h-full w-full object-cover" />
                        </div>
                        <span className="font-display font-bold text-xl text-primary">Escuta DF</span>
                    </div>
                </Link>
                <Link href="/auth">
                    <Button variant="ghost" size="sm" className="text-slate-600 gap-2">
                        <ArrowLeft className="w-4 h-4" /> Voltar para Login
                    </Button>
                </Link>
            </header>

            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md space-y-6">

                    <div className="text-center space-y-2">
                        <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Criar uma conta</h1>
                        <p className="text-slate-500 text-sm">Preencha seus dados para ter acesso completo à ouvidoria.</p>
                    </div>

                    <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
                        <CardHeader className="space-y-1 pb-2">
                            <CardTitle className="text-xl text-center">Cadastro de Cidadão</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome Completo</Label>
                                    <Input
                                        id="name"
                                        placeholder="Seu nome"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cpf">CPF</Label>
                                        <Input
                                            id="cpf"
                                            placeholder="000.000.000-00"
                                            required
                                            value={formData.cpf}
                                            onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Celular</Label>
                                        <Input
                                            id="phone"
                                            placeholder="(61) 90000-0000"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">E-mail</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Senha</Label>
                                    <Input id="password" type="password" placeholder="Mínimo 8 caracteres" required />
                                </div>

                                <div className="space-y-4 pt-2">
                                    <div className="flex items-start space-x-2">
                                        <input
                                            type="checkbox"
                                            id="terms"
                                            required
                                            className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                                        />
                                        <label htmlFor="terms" className="text-sm text-slate-600 leading-tight">
                                            Li e concordo com os <Link href="/termos" className="text-primary hover:underline">Termos de Uso</Link> e <Link href="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>.
                                        </label>
                                    </div>

                                    <Button type="submit" className="w-full h-11 font-bold shadow-lg shadow-primary/20" disabled={isLoading}>
                                        {isLoading ? "Criando conta..." : "Cadastrar"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-4 border-t bg-slate-50/50 p-6 text-center">
                            <p className="text-sm text-slate-600">
                                Já tem uma conta? <Link href="/auth" className="text-primary font-bold hover:underline">Fazer Login</Link>
                            </p>
                        </CardFooter>
                    </Card>

                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                            <Lock className="w-3 h-3" /> Seus dados estão protegidos pela LGPD
                        </div>
                    </div>

                </div>
            </main>

            <footer className="py-6 text-center border-t">
                <p className="text-xs text-slate-400">Escuta DF - GovTech Hackathon © 2026</p>
            </footer>
        </div>
    );
}
