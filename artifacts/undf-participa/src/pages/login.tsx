import { useState, useEffect } from "react";
import { useAuth } from "@workspace/auth-web";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, FlaskConical, Loader2 } from "lucide-react";
import { supabase } from "@workspace/auth-web";
import { demoLogin } from "@/hooks/use-user-data";
import logoPath from "@assets/WhatsApp_Image_2026-07-27_at_21.33.29_1785198981474.jpeg";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

export default function Login() {
  const { signIn: login, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoEnabled, setDemoEnabled] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (isAuthenticated) window.location.href = "/";
  }, [isAuthenticated]);

  // Verificar se demo está ativo no backend
  useEffect(() => {
    if (!DEMO_MODE) return;
    const BASE = import.meta.env.BASE_URL?.replace(/\/+$/, "") || "";
    fetch(`${BASE}/api/demo/status`)
      .then((r) => r.json())
      .then((data: { enabled?: boolean }) => setDemoEnabled(!!data.enabled))
      .catch(() => {});
  }, []);

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await login(values.email, values.password);
      window.location.href = "/";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao realizar login");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoAccess = async () => {
    setDemoLoading(true);
    setError(null);
    try {
      const session = await demoLogin();
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
      if (sessionError) throw new Error(sessionError.message);
      window.location.href = "/";
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Não foi possível acessar a demonstração.",
      );
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 md:grid-cols-2">

      {/* Left panel — brand */}
      <div className="hidden md:flex flex-col justify-between bg-primary text-primary-foreground px-12 py-16">
        <div className="flex items-center gap-3">
          <img src={logoPath} alt="Voz UnDF" className="h-9 w-auto object-contain rounded-md bg-white/10 p-0.5" />
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
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Autenticando…</>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          {/* Demo access — visível apenas quando habilitado */}
          {DEMO_MODE && demoEnabled && (
            <div className="mt-8 border border-amber-200 bg-amber-50 p-4" data-testid="demo-access-section">
              <div className="flex items-start gap-3">
                <FlaskConical className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-900 text-sm mb-1">
                    Explorar versão de demonstração
                  </p>
                  <p className="text-xs text-amber-700 mb-3 leading-relaxed">
                    Acesse uma conta de demonstração para conhecer as principais funcionalidades do Voz UnDF. Os dados exibidos são fictícios.
                  </p>
                  <Button
                    type="button"
                    onClick={handleDemoAccess}
                    disabled={demoLoading}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white text-sm py-4"
                    data-testid="button-demo-access"
                  >
                    {demoLoading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Acessando…</>
                    ) : (
                      "Acessar demonstração"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

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
