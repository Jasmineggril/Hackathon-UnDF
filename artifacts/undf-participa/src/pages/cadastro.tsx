import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, Check, X } from "lucide-react";
import { supabase } from "@workspace/auth-web";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoPath from "@assets/logo-voz-undf.png";

const passwordRequirements = [
  { label: "Pelo menos 8 caracteres", test: (v: string) => v.length >= 8 },
  { label: "Letra maiúscula", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Letra minúscula", test: (v: string) => /[a-z]/.test(v) },
  { label: "Número", test: (v: string) => /[0-9]/.test(v) },
];

const schema = z
  .object({
    fullName: z.string().min(3, "Nome completo obrigatório"),
    email: z
      .string()
      .email("E-mail inválido"),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Precisa de letra maiúscula")
      .regex(/[a-z]/, "Precisa de letra minúscula")
      .regex(/[0-9]/, "Precisa de número"),
    confirmPassword: z.string(),
    vinculo: z.enum(["estudante", "docente", "servidor"], {
      required_error: "Selecione seu vínculo com a UnDF",
    }),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "Você precisa aceitar os Termos de Uso" }),
    }),
    acceptPrivacy: z.literal(true, {
      errorMap: () => ({ message: "Você precisa aceitar a Política de Privacidade" }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem",
  });

type FormData = z.infer<typeof schema>;

export default function Cadastro() {
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const passwordValue = watch("password", "");

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            vinculo: data.vinculo,
            role: "estudante",
          },
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes("already registered") || error.message.toLowerCase().includes("already exists")) {
          setServerError("Este e-mail já está cadastrado. Tente entrar ou recuperar a senha.");
        } else {
          setServerError(error.message);
        }
        return;
      }

      setSuccess(true);
    } catch {
      setServerError("Ocorreu um erro inesperado. Tente novamente.");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F2F0EB] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-[#5B9A6E] mx-auto mb-6" />
          <h1
            className="text-3xl font-bold text-[#1B3469] mb-3"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Cadastro realizado!
          </h1>
          <p className="text-[#1B3469]/70 mb-2">
            Enviamos um e-mail de confirmação para o seu endereço.
          </p>
          <p className="text-[#1B3469]/60 text-sm mb-8">
            Verifique sua caixa de entrada e clique no link de confirmação para ativar sua conta.
          </p>
          <Link href="/login">
            <Button className="bg-[#1B3469] hover:bg-[#1B3469]/90 text-white px-8">
              Ir para o login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F0EB] flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#1B3469] flex-col justify-between p-12 relative overflow-hidden">
        <Link href="/" className="flex items-center gap-3">
          <img src={logoPath} alt="Voz UnDF" className="h-9 w-auto opacity-90" />
          <span className="font-bold text-white text-base" style={{ fontFamily: "'Syne', sans-serif" }}>
            Voz UnDF
          </span>
        </Link>

        <div>
          <p className="text-white/40 text-xs uppercase tracking-widest mb-6">Criar conta</p>
          <h2
            className="text-[clamp(2.5rem,4vw,4rem)] font-bold leading-[0.95] text-white tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            faça parte<br />
            da mudança.
          </h2>
          <p className="text-white/50 text-sm mt-6 max-w-xs leading-relaxed">
            Sua conta no Voz UnDF permite registrar demandas, apresentar propostas e acompanhar como a Universidade responde.
          </p>
        </div>

        <p className="text-white/25 text-xs">
          Sua voz participa. A Universidade transforma.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src={logoPath} alt="Voz UnDF" className="h-8 w-auto" />
            <span className="font-bold text-[#1B3469] text-sm" style={{ fontFamily: "'Syne', sans-serif" }}>
              Voz UnDF
            </span>
          </div>

          <h1
            className="text-2xl font-bold text-[#1B3469] mb-1"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Criar conta
          </h1>
          <p className="text-[#1B3469]/60 text-sm mb-8">
            Preencha os dados para acessar a plataforma.
          </p>

          {serverError && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Full name */}
            <div>
              <Label htmlFor="fullName" className="text-[#1B3469] font-medium text-sm">
                Nome completo
              </Label>
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="Seu nome completo"
                className="mt-1.5 bg-white border-[#1B3469]/20 focus:border-[#1B3469] focus:ring-[#1B3469]/10"
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="text-red-600 text-xs mt-1">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-[#1B3469] font-medium text-sm">
                E-mail institucional
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu.email@undf.edu.br"
                className="mt-1.5 bg-white border-[#1B3469]/20 focus:border-[#1B3469] focus:ring-[#1B3469]/10"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Affiliation */}
            <div>
              <Label htmlFor="vinculo" className="text-[#1B3469] font-medium text-sm">
                Vínculo com a UnDF
              </Label>
              <select
                id="vinculo"
                className="mt-1.5 w-full rounded-md border border-[#1B3469]/20 bg-white px-3 py-2 text-sm text-[#1B3469] focus:border-[#1B3469] focus:outline-none focus:ring-1 focus:ring-[#1B3469]/10"
                {...register("vinculo")}
              >
                <option value="">Selecione seu vínculo</option>
                <option value="estudante">Estudante</option>
                <option value="docente">Docente</option>
                <option value="servidor">Servidor</option>
              </select>
              {errors.vinculo && (
                <p className="text-red-600 text-xs mt-1">{errors.vinculo.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="text-[#1B3469] font-medium text-sm">
                Senha
              </Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Crie uma senha segura"
                  className="bg-white border-[#1B3469]/20 focus:border-[#1B3469] focus:ring-[#1B3469]/10 pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1B3469]/40 hover:text-[#1B3469] transition-colors"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>
              )}

              {/* Password requirements */}
              {passwordValue && (
                <ul className="mt-2 space-y-1">
                  {passwordRequirements.map((req) => {
                    const ok = req.test(passwordValue);
                    return (
                      <li key={req.label} className={`flex items-center gap-1.5 text-xs ${ok ? "text-[#5B9A6E]" : "text-[#1B3469]/40"}`}>
                        {ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {req.label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <Label htmlFor="confirmPassword" className="text-[#1B3469] font-medium text-sm">
                Confirmar senha
              </Label>
              <div className="relative mt-1.5">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repita a senha"
                  className="bg-white border-[#1B3469]/20 focus:border-[#1B3469] focus:ring-[#1B3469]/10 pr-10"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1B3469]/40 hover:text-[#1B3469] transition-colors"
                  aria-label={showConfirm ? "Ocultar confirmação" : "Mostrar confirmação"}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms & Privacy */}
            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="mt-0.5 rounded border-[#1B3469]/30 accent-[#1B3469]"
                  {...register("acceptTerms")}
                />
                <span className="text-xs text-[#1B3469]/70 leading-relaxed">
                  Li e aceito os{" "}
                  <Link href="/termos" className="text-[#1B3469] font-semibold hover:underline" target="_blank">
                    Termos de Uso
                  </Link>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="text-red-600 text-xs -mt-1 ml-6">{errors.acceptTerms.message}</p>
              )}

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="mt-0.5 rounded border-[#1B3469]/30 accent-[#1B3469]"
                  {...register("acceptPrivacy")}
                />
                <span className="text-xs text-[#1B3469]/70 leading-relaxed">
                  Li e aceito a{" "}
                  <Link href="/privacidade" className="text-[#1B3469] font-semibold hover:underline" target="_blank">
                    Política de Privacidade
                  </Link>
                </span>
              </label>
              {errors.acceptPrivacy && (
                <p className="text-red-600 text-xs -mt-1 ml-6">{errors.acceptPrivacy.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1B3469] hover:bg-[#1B3469]/90 text-white py-4 mt-2"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Criando conta…</>
              ) : (
                "Criar conta"
              )}
            </Button>
          </form>

          <p className="mt-6 text-xs text-center text-[#1B3469]/60">
            Já tem conta?{" "}
            <Link href="/login" className="text-[#1B3469] font-semibold hover:underline">
              Entrar
            </Link>
          </p>

          <p className="mt-4 text-xs text-center text-[#1B3469]/40">
            Conta administrativa? Solicite acesso à sua coordenação.
          </p>
        </div>
      </div>
    </div>
  );
}
