import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { supabase } from "@workspace/auth-web";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Informe um e-mail institucional válido"),
});

type FormValues = z.infer<typeof schema>;

export default function RecuperarSenha() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(
        values.email,
        {
          redirectTo: `${window.location.origin}/redefinir-senha`,
        },
      );
      // Nunca revelar se o e-mail existe ou não — resposta sempre positiva
      if (err && err.message.toLowerCase().includes("rate limit")) {
        setError("Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.");
        return;
      }
      setSent(true);
    } catch {
      setError("Não foi possível processar a solicitação. Tente novamente em instantes.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-[#1B3469]/50 hover:text-[#1B3469] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao login
        </Link>

        {sent ? (
          <div className="border border-[#5B9A6E]/30 bg-[#5B9A6E]/5 p-8" role="status">
            <CheckCircle2 className="w-8 h-8 text-[#5B9A6E] mb-4" />
            <h1 className="text-xl font-bold text-[#1B3469] mb-2">
              Verifique seu e-mail
            </h1>
            <p className="text-sm text-[#1B3469]/70 leading-relaxed mb-6">
              Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha em breve. Verifique também a pasta de spam.
            </p>
            <Link href="/login">
              <Button variant="outline" className="border-[#1B3469]/20 text-[#1B3469]">
                Voltar ao login
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <span className="text-xs tracking-widest uppercase text-secondary font-semibold">
                recuperação de acesso
              </span>
              <h1 className="text-3xl font-bold text-foreground mt-2">
                Esqueceu a senha?
              </h1>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                Informe seu e-mail institucional. Se ele estiver cadastrado, enviaremos um link para redefinir sua senha.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 border border-destructive/30 bg-destructive/5 text-destructive flex items-start gap-3 text-sm" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
                  E-mail Institucional
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.nome@undf.edu.br"
                    autoComplete="email"
                    {...form.register("email")}
                    className="pl-10 border-border bg-card"
                    data-testid="input-email-recovery"
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive" role="alert">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white py-5 font-semibold"
                disabled={form.formState.isSubmitting}
                data-testid="button-send-recovery"
              >
                {form.formState.isSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando…</>
                ) : (
                  "Enviar link de recuperação"
                )}
              </Button>
            </form>

            <p className="mt-6 text-xs text-muted-foreground text-center">
              Lembrou a senha?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Voltar ao login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
