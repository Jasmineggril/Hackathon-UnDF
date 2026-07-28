import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CheckCircle2, ChevronRight, Copy, Download, ExternalLink, Loader2,
} from "lucide-react";
import { useCreateDemand, DemandCategory, DemandType } from "@workspace/api-client-react";
import { useAuth } from "@workspace/auth-web";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Mascote } from "@/components/Mascote";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const demandSchema = z.object({
  type: z.nativeEnum(DemandType),
  category: z.nativeEnum(DemandCategory),
  content: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  targetUnit: z.string().optional(),
  address: z.string().optional(),
  isAnonymous: z.boolean().default(false),
});

type FormValues = z.infer<typeof demandSchema>;

interface SuccessData {
  protocol: string;
  category: string;
  type: string;
  registeredAt: Date;
}

// ---------------------------------------------------------------------------
// Comprovante (imprimível)
// ---------------------------------------------------------------------------
function printReceipt(data: SuccessData) {
  const w = window.open("", "_blank", "width=600,height=700");
  if (!w) return;
  w.document.write(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Comprovante Voz UnDF — ${data.protocol}</title>
  <style>
    @media print { body { margin: 0; } .no-print { display: none; } }
    body { font-family: Arial, sans-serif; color: #1B3469; padding: 40px; max-width: 560px; margin: auto; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .subtitle { font-size: 12px; color: #888; margin-bottom: 32px; text-transform: uppercase; letter-spacing: 1px; }
    .section { margin-bottom: 20px; }
    .label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 3px; }
    .value { font-size: 14px; font-weight: bold; }
    .protocol { font-family: monospace; font-size: 24px; color: #1B3469; border: 2px solid #1B3469; padding: 12px 20px; display: inline-block; margin: 12px 0; }
    .notice { font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 16px; margin-top: 24px; line-height: 1.6; }
    .status { display: inline-block; background: #e8f4ef; color: #2d7a52; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: bold; }
    button { background: #1B3469; color: white; border: none; padding: 10px 24px; font-size: 14px; cursor: pointer; margin-top: 20px; }
  </style>
</head>
<body>
  <h1>Voz UnDF</h1>
  <p class="subtitle">Comprovante de Manifestação</p>

  <div class="section">
    <div class="label">Protocolo</div>
    <div class="protocol">${data.protocol}</div>
  </div>

  <div class="section">
    <div class="label">Categoria</div>
    <div class="value">${data.category}</div>
  </div>

  <div class="section">
    <div class="label">Tipo</div>
    <div class="value" style="text-transform:capitalize">${data.type}</div>
  </div>

  <div class="section">
    <div class="label">Data de registro</div>
    <div class="value">${format(data.registeredAt, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</div>
  </div>

  <div class="section">
    <div class="label">Status inicial</div>
    <span class="status">Recebida</span>
  </div>

  <div class="notice">
    <strong>Como acompanhar:</strong> Acesse a plataforma Voz UnDF em /protocolo e insira o número de protocolo acima.<br/><br/>
    <strong>Aviso de privacidade:</strong> Este comprovante é pessoal e não deve ser compartilhado com terceiros. Não contém dados sensíveis além dos aqui explicitados.
  </div>

  <div class="no-print">
    <button onclick="window.print()">Imprimir / Salvar PDF</button>
  </div>
</body>
</html>`);
  w.document.close();
}

// ---------------------------------------------------------------------------
// Success Screen
// ---------------------------------------------------------------------------
function SuccessScreen({ data }: { data: SuccessData }) {
  const [copied, setCopied] = useState(false);

  const copyProtocol = () => {
    navigator.clipboard.writeText(data.protocol);
    setCopied(true);
    toast.success("Protocolo copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Mascote
            message="Seu protocolo foi criado. Guarde esse número para acompanhar o andamento."
            size="md"
            className="mx-auto mb-4"
          />
        </div>

        <div className="border border-border bg-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="w-6 h-6 text-[#5B9A6E] shrink-0" aria-hidden="true" />
            <div>
              <h2 className="text-xl font-bold text-foreground">Demanda registrada com sucesso</h2>
              <p className="text-sm text-muted-foreground">
                Registrada em{" "}
                {format(data.registeredAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>

          {/* Protocol */}
          <div className="bg-[#1B3469]/5 border border-[#1B3469]/10 p-5 mb-6">
            <p className="text-xs uppercase tracking-widest text-[#1B3469]/50 font-semibold mb-2">
              Número do Protocolo
            </p>
            <div className="flex items-center gap-3">
              <code className="text-2xl font-mono font-bold text-[#1B3469] flex-1">
                {data.protocol}
              </code>
              <button
                onClick={copyProtocol}
                className="p-2 text-[#1B3469]/40 hover:text-[#1B3469] transition-colors border border-[#1B3469]/15 hover:border-[#1B3469]/40"
                aria-label="Copiar protocolo"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            {copied && (
              <p className="text-xs text-[#5B9A6E] mt-1" role="status">✓ Copiado!</p>
            )}
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Categoria</p>
              <p className="font-medium text-foreground">{data.category}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Status inicial</p>
              <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                Recebida
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Link href={`/protocolo?q=${data.protocol}`}>
              <Button className="w-full bg-[#1B3469] hover:bg-[#1B3469]/90 text-white">
                <ExternalLink className="w-4 h-4 mr-2" />
                Acompanhar demanda
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full border-[#1B3469]/20 text-[#1B3469]"
              onClick={() => printReceipt(data)}
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar comprovante
            </Button>
            <Link href="/meu-painel" className="sm:col-span-2">
              <Button variant="ghost" className="w-full text-[#1B3469]/60 hover:text-[#1B3469]">
                Voltar ao Meu painel
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main form
// ---------------------------------------------------------------------------

const DEMAND_TYPES = [
  { value: "text", label: "Texto" },
  { value: "audio", label: "Áudio" },
  { value: "image", label: "Imagem" },
  { value: "video", label: "Vídeo" },
] as const;

const DEMAND_CATEGORIES = [
  "Infraestrutura", "Ensino e Pesquisa", "Assistência Estudantil",
  "Administração", "Tecnologia", "Acessibilidade", "Cultura e Esporte",
  "Sugestão de Melhoria", "Saúde e Bem-estar", "Segurança",
  "Sustentabilidade", "Mobilidade", "Comunicação Institucional",
  "Recursos Humanos", "Biblioteca e Acervo",
] as const;

export default function NewDemand() {
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);

  const createDemand = useCreateDemand();

  const form = useForm<FormValues>({
    resolver: zodResolver(demandSchema),
    defaultValues: {
      type: "text" as DemandType,
      category: "Infraestrutura" as DemandCategory,
      content: "",
      targetUnit: "",
      address: "",
      isAnonymous: false,
    },
  });

  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  if (successData) {
    return <SuccessScreen data={successData} />;
  }

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await createDemand.mutateAsync({ data: values });
      setSuccessData({
        protocol: response.protocol,
        category: values.category,
        type: values.type,
        registeredAt: new Date(),
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao enviar demanda. Tente novamente.";
      toast.error(msg);
    }
  };

  const nextStep = async () => {
    const fieldsByStep: Record<number, (keyof FormValues)[]> = {
      1: ["type"],
      2: ["category", "content", "targetUnit"],
      3: ["isAnonymous", "address"],
      4: [],
    };
    const valid = await form.trigger(fieldsByStep[step]);
    if (valid) {
      if (step === 4) {
        form.handleSubmit(onSubmit)();
      } else {
        setStep((s) => s + 1);
      }
    }
  };

  const prevStep = () => setStep((s) => s - 1);

  const values = form.watch();
  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const stepLabels = ["Tipo", "Detalhes", "Privacidade", "Revisão"];

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 md:px-12 pt-12 pb-6 border-b border-border">
        <span className="text-xs tracking-widest uppercase text-secondary font-semibold">
          nova demanda
        </span>
        <h1 className="text-3xl font-bold text-foreground mt-2">Registrar manifestação</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Etapa {step} de {totalSteps} — {stepLabels[step - 1]}
        </p>
        <Progress value={progress} className="mt-4 max-w-sm h-1" aria-label={`Progresso: etapa ${step} de ${totalSteps}`} />
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>

          {/* Step 1 — Tipo */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-3 block">
                  Tipo de manifestação
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {DEMAND_TYPES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => form.setValue("type", value as DemandType)}
                      className={`p-4 border text-sm font-medium text-left transition-colors ${
                        values.type === value
                          ? "bg-[#1B3469] text-white border-[#1B3469]"
                          : "bg-card border-border text-foreground hover:border-[#1B3469]/30"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Detalhes */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  Categoria
                </Label>
                <Select
                  value={values.category}
                  onValueChange={(v) => form.setValue("category", v as DemandCategory)}
                >
                  <SelectTrigger className="border-border bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEMAND_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  Descrição <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  {...form.register("content")}
                  placeholder="Descreva sua manifestação com clareza..."
                  className="border-border bg-card min-h-[120px]"
                />
                {form.formState.errors.content && (
                  <p className="text-xs text-destructive mt-1" role="alert">
                    {form.formState.errors.content.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  Unidade responsável (opcional)
                </Label>
                <Input
                  {...form.register("targetUnit")}
                  placeholder="Ex: Secretaria Acadêmica, TI, Reitoria..."
                  className="border-border bg-card"
                />
              </div>
            </div>
          )}

          {/* Step 3 — Privacidade */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="border border-border p-5 bg-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Label className="text-sm font-semibold text-foreground">
                        Registrar anonimamente
                      </Label>
                      <HelpTooltip
                        title="Anonimato"
                        text="Seu nome não será exibido publicamente. A equipe autorizada poderá acessar informações necessárias para o tratamento da manifestação, conforme as regras de privacidade."
                      />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Sua identidade não aparecerá na listagem pública.
                    </p>
                  </div>
                  <Switch
                    checked={values.isAnonymous}
                    onCheckedChange={(v) => form.setValue("isAnonymous", v)}
                    aria-label="Registrar anonimamente"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                  Local (opcional)
                </Label>
                <Input
                  {...form.register("address")}
                  placeholder="Ex: Bloco A, Laboratório 3..."
                  className="border-border bg-card"
                />
              </div>
            </div>
          )}

          {/* Step 4 — Revisão */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">Revise os dados antes de enviar.</p>
              <div className="border border-border bg-card p-6 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Tipo</p>
                    <p className="font-medium text-foreground capitalize">{values.type}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Categoria</p>
                    <p className="font-medium text-foreground">{values.category}</p>
                  </div>
                </div>
                {values.targetUnit && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Unidade</p>
                    <p className="font-medium text-foreground">{values.targetUnit}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Descrição</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{values.content}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Privacidade</p>
                  <p className="font-medium text-foreground">
                    {values.isAnonymous ? "Anônimo (seu nome não aparecerá)" : "Identificado (seu nome aparecerá)"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-8 border-t mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={step === 1 || createDemand.isPending}
              className="border-border"
            >
              Voltar
            </Button>
            <Button
              type="button"
              className="bg-primary hover:bg-primary/90 text-white min-w-[140px]"
              onClick={nextStep}
              disabled={createDemand.isPending}
            >
              {step === 4 ? (
                createDemand.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando…</>
                ) : (
                  "Enviar demanda"
                )
              ) : (
                <>Próximo <ChevronRight className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
