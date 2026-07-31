import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronRight, Loader2, Video, AlertTriangle,
} from "lucide-react";
import { useCreateDemand, DemandCategory, DemandType } from "@workspace/api-client-react";
import { useAuth } from "@workspace/auth-web";
import { supabase } from "@workspace/auth-web";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { HelpTooltip } from "@/components/HelpTooltip";
import { AudioRecorder } from "@/components/AudioRecorder";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Schema — content required only for text; mediaUrl required for audio/image
// ---------------------------------------------------------------------------

const demandSchema = z.object({
  type: z.nativeEnum(DemandType),
  category: z.nativeEnum(DemandCategory),
  content: z.string().optional(),
  mediaUrl: z.string().optional(),
  targetUnit: z.string().optional(),
  address: z.string().optional(),
  isAnonymous: z.boolean().default(false),
});

type FormValues = z.infer<typeof demandSchema>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEMAND_TYPES: Array<{
  value: string;
  label: string;
  description: string;
  disabled?: boolean;
}> = [
  { value: "text",  label: "Texto",  description: "Descreva sua demanda por escrito" },
  { value: "audio", label: "Áudio",  description: "Grave um relato de voz" },
  { value: "image", label: "Imagem", description: "Envie uma foto da situação" },
  { value: "video", label: "Vídeo",  description: "Em desenvolvimento", disabled: true },
];

const DEMAND_CATEGORIES = [
  "Infraestrutura", "Ensino e Pesquisa", "Assistência Estudantil",
  "Administração", "Tecnologia", "Acessibilidade", "Cultura e Esporte",
  "Sugestão de Melhoria", "Saúde e Bem-estar", "Segurança",
  "Sustentabilidade", "Mobilidade", "Comunicação Institucional",
  "Recursos Humanos", "Biblioteca e Acervo",
] as const;

// ---------------------------------------------------------------------------
// Upload to Supabase Storage
// ---------------------------------------------------------------------------

async function uploadToStorage(fileOrBlob: File | Blob, type: "audio" | "image"): Promise<string> {
  const ext = type === "audio" ? "webm" : ((fileOrBlob as File).name?.split(".").pop() || "jpg");
  const path = `demands/${Date.now()}.${ext}`;
  const contentType = type === "audio" ? "audio/webm" : ((fileOrBlob as File).type || "image/jpeg");

  const { data, error } = await supabase.storage
    .from("media")
    .upload(path, fileOrBlob, { upsert: false, contentType });

  if (error) {
    throw new Error(`Falha no upload: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(data.path);
  return publicUrl;
}

// ---------------------------------------------------------------------------
// Main form
// ---------------------------------------------------------------------------

export default function NewDemand() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const createDemand = useCreateDemand();

  const form = useForm<FormValues>({
    resolver: zodResolver(demandSchema),
    defaultValues: {
      type: "text" as DemandType,
      category: "Infraestrutura" as DemandCategory,
      content: "",
      mediaUrl: "",
      targetUnit: "",
      address: "",
      isAnonymous: false,
    },
  });

  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  const values = form.watch();

  // ---------------------------------------------------------------------------
  // Media upload helpers
  // ---------------------------------------------------------------------------

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo: 10 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    // mediaUrl will be set after upload on submit
  };

  const handleAudioComplete = (blob: Blob) => {
    setAudioBlob(blob);
  };

  const handleAudioClear = () => {
    setAudioBlob(null);
    form.setValue("mediaUrl", "");
  };

  // ---------------------------------------------------------------------------
  // Submission
  // ---------------------------------------------------------------------------

  const onSubmit = async (formValues: FormValues) => {
    let mediaUrl = formValues.mediaUrl || "";

    // Upload audio if recorded
    if (formValues.type === "audio" && audioBlob && !mediaUrl) {
      try {
        setUploading(true);
        mediaUrl = await uploadToStorage(audioBlob, "audio");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao enviar áudio.");
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    // Upload image if selected
    if (formValues.type === "image" && imageInputRef.current?.files?.[0] && !mediaUrl) {
      try {
        setUploading(true);
        mediaUrl = await uploadToStorage(imageInputRef.current.files[0], "image");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao enviar imagem.");
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    // Validate that non-text types have media
    if (formValues.type === "audio" && !mediaUrl) {
      toast.error("Grave um áudio antes de enviar.");
      return;
    }
    if (formValues.type === "image" && !mediaUrl) {
      toast.error("Selecione uma imagem antes de enviar.");
      return;
    }
    if (formValues.type === "text" && !formValues.content?.trim()) {
      toast.error("Descreva sua demanda.");
      return;
    }

    try {
      const response = await createDemand.mutateAsync({
        data: {
          ...formValues,
          content: formValues.content || null,
          mediaUrl: mediaUrl || null,
          targetUnit: formValues.targetUnit || null,
          address: formValues.address || null,
        } as Parameters<typeof createDemand.mutateAsync>[0]["data"],
      });
      navigate(`/demandas/${response.id}/sucesso`);
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Erro ao enviar demanda. Tente novamente.";
      toast.error(msg);
    }
  };

  const nextStep = async () => {
    // Step-specific validation
    if (step === 1) {
      if (!values.type) {
        toast.error("Selecione o tipo de manifestação.");
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (values.type === "text" && (!values.content || values.content.trim().length < 10)) {
        form.setError("content", { message: "A descrição deve ter pelo menos 10 caracteres." });
        return;
      }
      if (values.type === "audio" && !audioBlob) {
        toast.error("Grave um áudio antes de continuar.");
        return;
      }
      if (values.type === "image" && !imageInputRef.current?.files?.[0] && !values.mediaUrl) {
        toast.error("Selecione uma imagem antes de continuar.");
        return;
      }
      setStep(3);
      return;
    }
    if (step === 3) {
      setStep(4);
      return;
    }
    if (step === 4) {
      form.handleSubmit(onSubmit)();
    }
  };

  const prevStep = () => setStep((s) => s - 1);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;
  const stepLabels = ["Tipo", "Detalhes", "Privacidade", "Revisão"];
  const isPending = createDemand.isPending || uploading;

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

          {/* ── Step 1 — Tipo ── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-3 block">
                  Tipo de manifestação
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {DEMAND_TYPES.map(({ value, label, description, disabled }) => {
                    const isVideo = value === "video";
                    return (
                      <button
                        key={value}
                        type="button"
                        disabled={disabled}
                        onClick={() => !disabled && form.setValue("type", value as DemandType)}
                        className={`p-4 border text-sm font-medium text-left transition-colors relative ${
                          disabled
                            ? "bg-muted/50 border-border/50 text-muted-foreground/40 cursor-not-allowed"
                            : values.type === value
                              ? "bg-[#1B3469] text-white border-[#1B3469]"
                              : "bg-card border-border text-foreground hover:border-[#1B3469]/30"
                        }`}
                      >
                        <span className="block font-semibold">{label}</span>
                        <span className="block text-xs mt-0.5 opacity-70">{description}</span>
                        {isVideo && (
                          <span className="absolute top-2 right-2 flex items-center gap-1 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold">
                            <Video className="w-2.5 h-2.5" /> Em breve
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {values.type === "video" && (
                  <div className="mt-3 flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>Manifestações em vídeo estão em desenvolvimento e serão disponibilizadas em breve.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Step 2 — Detalhes ── */}
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

              {/* Texto */}
              {values.type === "text" && (
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
              )}

              {/* Áudio */}
              {values.type === "audio" && (
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                    Gravação de Áudio <span className="text-destructive">*</span>
                  </Label>
                  <AudioRecorder
                    onRecordingComplete={handleAudioComplete}
                    onClear={handleAudioClear}
                  />
                  <div className="mt-4">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                      Descrição complementar (opcional)
                    </Label>
                    <Textarea
                      {...form.register("content")}
                      placeholder="Adicione texto complementar se desejar..."
                      className="border-border bg-card min-h-[80px]"
                    />
                  </div>
                </div>
              )}

              {/* Imagem */}
              {values.type === "image" && (
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                    Imagem <span className="text-destructive">*</span>
                  </Label>
                  <div
                    className="border-2 border-dashed border-border bg-muted/20 p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/40 transition-colors"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Pré-visualização"
                        className="max-h-48 object-contain rounded"
                      />
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <svg className="w-6 h-6 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">Clique para selecionar uma imagem</p>
                        <p className="text-xs text-muted-foreground/60">JPG, PNG, WebP — máx. 10 MB</p>
                      </>
                    )}
                    {imagePreview && (
                      <p className="text-xs text-[#5B9A6E] font-medium">✓ Imagem selecionada — clique para trocar</p>
                    )}
                  </div>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  <div className="mt-4">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                      Descrição complementar (opcional)
                    </Label>
                    <Textarea
                      {...form.register("content")}
                      placeholder="Descreva o que a imagem mostra..."
                      className="border-border bg-card min-h-[80px]"
                    />
                  </div>
                </div>
              )}

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

          {/* ── Step 3 — Privacidade ── */}
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

          {/* ── Step 4 — Revisão ── */}
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
                {values.content && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Descrição</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{values.content}</p>
                  </div>
                )}
                {values.type === "audio" && audioBlob && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Áudio</p>
                    <p className="text-sm text-[#5B9A6E] font-medium">✓ Áudio gravado e pronto para envio</p>
                  </div>
                )}
                {values.type === "image" && imagePreview && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Imagem</p>
                    <img src={imagePreview} alt="Pré-visualização" className="max-h-32 object-contain rounded" />
                  </div>
                )}
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
              disabled={step === 1 || isPending}
              className="border-border"
            >
              Voltar
            </Button>
            <Button
              type="button"
              className="bg-primary hover:bg-primary/90 text-white min-w-[140px]"
              onClick={nextStep}
              disabled={isPending}
            >
              {step === 4 ? (
                isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {uploading ? "Enviando mídia…" : "Registrando…"}</>
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
