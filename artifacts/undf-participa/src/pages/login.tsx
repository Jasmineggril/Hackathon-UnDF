import { useState, useEffect } from "react";
import { useAuth } from "@workspace/auth-web";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Redirect if already auth
  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated]);

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await login(values.email, values.password);
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "Erro ao realizar login");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border rounded-xl shadow-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Acesso à Plataforma</h1>
          <p className="text-muted-foreground mt-2">
            Faça login com suas credenciais institucionais
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-md bg-destructive/10 text-destructive flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail Institucional</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu.nome@undf.edu.br"
              {...form.register("email")}
              data-testid="input-email"
              className={form.formState.errors.email ? "border-destructive" : ""}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <a href="#" className="text-xs text-primary hover:underline">
                Esqueceu a senha?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...form.register("password")}
              data-testid="input-password"
              className={form.formState.errors.password ? "border-destructive" : ""}
            />
            {form.formState.errors.password && (
              <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isSubmitting}
            data-testid="button-login"
          >
            {isSubmitting ? "Autenticando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Não tem uma conta?{" "}
            <a href="#" className="text-primary font-medium hover:underline">
              Solicite acesso
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
