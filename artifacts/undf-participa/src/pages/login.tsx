import { useState, useEffect } from "react";
import { useAuth } from "@workspace/auth-web";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import logoPath from "@assets/Gemini_Generated_Image_lkejrrlkejrrlkej_1785001200344.png";

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

  useEffect(() => {
    if (isAuthenticated) window.location.href = "/";
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
    <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 md:grid-cols-2">

      {/* Left panel — brand */}
      <div className="hidden md:flex flex-col justify-between bg-primary text-primary-foreground px-12 py-16">
        <div className="flex items-center gap-3">
          <img src={logoPath} alt="Voz UnDF" className="h-9 w-auto object-contain brightness-0 invert opacity-90" />
          <span className="font-bold text-base opacity-90">Voz UnDF</span>
        </div>

        <div>
          <h1 className="text-[clamp(3rem,5vw,5rem)] font-bold leading-[0.9] tracking-tight mb-8">
            entre<br />
            com<br />
            <span className="text-secondary">sua<br />voz.</span>
          </h1>
          <p className="text-primary-foreground/60 text-sm leading-relaxed max-w-xs">
            Sua participação constrói a universidade que queremos. Acesse e faça sua voz ser ouvida na UnDF.
          </p>
        </div>

        <div className="text-xs text-primary-foreground/30 uppercase tracking-widest">
          Participação · Transparência · Gestão
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col justify-center px-6 md:px-16 py-16 bg-background">
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-10">
            <span className="text-xs tracking-widest uppercase text-secondary font-semibold">acesso</span>
            <h2 className="text-3xl font-bold text-foreground mt-2">Entrar na plataforma</h2>
            <p className="text-muted-foreground text-sm mt-2">Use suas credenciais institucionais.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 border border-destructive/30 bg-destructive/5 text-destructive flex items-start gap-3 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
                E-mail Institucional
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.nome@undf.edu.br"
                {...form.register("email")}
                data-testid="input-email"
                className="border-border bg-card"
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Senha
                </Label>
                <a href="#" className="text-xs text-primary hover:underline">
                  Esqueceu?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...form.register("password")}
                data-testid="input-password"
                className="border-border bg-card"
              />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-5 font-semibold tracking-wide"
              disabled={isSubmitting}
              data-testid="button-login"
            >
              {isSubmitting ? "Autenticando…" : "Entrar"}
            </Button>
          </form>

          <p className="mt-8 text-xs text-muted-foreground text-center">
            Não tem conta?{" "}
            <a href="#" className="text-primary font-semibold hover:underline">
              Solicite acesso
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
