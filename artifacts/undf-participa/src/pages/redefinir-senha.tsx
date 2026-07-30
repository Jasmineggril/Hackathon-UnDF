import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import { supabase } from "@workspace/auth-web";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres")
      .regex(/[A-Z]/, "Inclua pelo menos uma letra maiúscula")
      .regex(/[0-9]/, "Inclua pelo menos um número"),
    confirm: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  });

type FormValues = z.infer<typeof schema>;

export default function RedefinirSenha() {
  const [, setLocation] = useLocation();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null); // null = loading

  // Supabase inserts the session from the hash fragment automatically on load
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setTokenValid(true);
      }
    });

    // Give Supabase a moment to process the hash
    const t = setTimeout(() => {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
        }
      });
    }, 500);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(t);
    };
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      const { error: err } = await supabase.auth.updateUser({
        password: values.password,
      });
      if (err) {
        if (err.message.includes("same password")) {
          setError("A nova senha não pode ser igual à senha anterior.");
        } else {
          setError("Não foi possível redefinir a senha. O link pode ter expirado. Solicite um novo.");
        }
        return;
      }
      await supabase.auth.signOut();
      setDone(true);
    } catch {
      setError("Erro inesperado. Tente novamente.");
    }
  };

  // Loading state while checking token
  if (tokenValid === null) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#1B3469]/40" />
      </div>
    );
  }

  // Invalid / expired token
  if (tokenValid === false) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md border border-destructive/20 bg-destructive/5 p-8 text-center">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#1B3469] mb-2">Link inválido ou expirado</h1>
          <p className="text-sm text-[#1B3469]/70 mb-6 leading-relaxed">
            Este link de redefinição de senha não é mais válido. Solicite um novo link para continuar.
          </p>
          <Link href="/recuperar-senha">
            <Button className="bg-primary hover:bg-primary/90 text-white">
              Solicitar novo link
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (done) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md border border-[#5B9A6E]/30 bg-[#5B9A6E]/5 p-8" role="status">
          <CheckCircle2 className="w-8 h-8 text-[#5B9A6E] mb-4" />
          <h1 className="text-xl font-bold text-[#1B3469] mb-2">Senha redefinida!</h1>
          <p className="text-sm text-[#1B3469]/70 mb-6 leading-relaxed">
            Sua senha foi atualizada com sucesso. Você pode entrar na plataforma com a nova senha.
          </p>
          <Button
            className="bg-primary hover:bg-primary/90 text-white"
            onClick={() => setLocation("/login")}
          >
            Ir para o login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <span className="text-xs tracking-widest uppercase text-secondary font-semibold">
            nova senha
          </span>
          <h1 className="text-3xl font-bold text-foreground mt-2">Redefinir senha</h1>
          <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
            Escolha uma senha forte com pelo menos 8 caracteres, uma letra maiúscula e um número.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 border border-destructive/30 bg-destructive/5 text-destructive flex items-start gap-3 text-sm" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Nova senha */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">
              Nova Senha
            </Label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPw ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                {...form.register("password")}
                className="pl-10 pr-10 border-border bg-card"
                data-testid="input-new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPw ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-xs text-destructive" role="alert">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* Confirmar senha */}
          <div className="space-y-1.5">
            <Label htmlFor="confirm" className="text-xs uppercase tracking-wider text-muted-foreground">
              Confirmar Nova Senha
            </Label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="Repita a nova senha"
                autoComplete="new-password"
                {...form.register("confirm")}
                className="pl-10 pr-10 border-border bg-card"
                data-testid="input-confirm-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showConfirm ? "Ocultar confirmação" : "Mostrar confirmação"}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {form.formState.errors.confirm && (
              <p className="text-xs text-destructive" role="alert">
                {form.formState.errors.confirm.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white py-5 font-semibold"
            disabled={form.formState.isSubmitting}
            data-testid="button-reset-password"
          >
            {form.formState.isSubmitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redefinindo…</>
            ) : (
              "Redefinir senha"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
