import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useCreateReport } from "@/hooks/use-reports";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Mic, Type, Image as ImageIcon, Video, User, Shield, ArrowLeft, ArrowRight, Send, AlertCircle, Loader2, MapPin } from "lucide-react";
import { AudioRecorder } from "@/components/AudioRecorder";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { InsertReport } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { supabase } from "@/lib/supabase"; // Importação do cliente Supabase

// Definimos os passos do nosso "Wizard" (passo a passo)
const STEPS = [
  { id: 1, title: "Formato & Conteúdo" }, // Passo inicial: escolhe o tipo e insere o conteúdo
  { id: 2, title: "Identificação" },     // Passo intermediário: dados de quem envia e localização
  { id: 3, title: "Envio" }              // Passo final: revisão e confirmação
];

// Schema de validação com Zod
const formSchema = z.object({
  category: z.enum(["Reclamação", "Denúncia", "Elogio", "Sugestão", "Solicitação"]),
  type: z.enum(["text", "audio", "image", "video"]),
  content: z.string().optional(),
  mediaUrl: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  address: z.string().optional(),
  isAnonymous: z.boolean().default(false),
}).superRefine((data, ctx) => {
  // Validações condicionais baseadas no tipo escolhido
  if (data.type === "text" && (!data.content || data.content.trim().length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Por favor, descreva sua manifestação.",
      path: ["content"],
    });
  }
  if (data.type !== "text" && !data.mediaUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Por favor, grave o áudio/vídeo ou anexe a imagem.",
      path: ["mediaUrl"],
    });
  }
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateReport() {
  // Hooks para autenticação e navegação
  const { isLoading: authLoading } = useAuth();

  // Exibe um carregamento enquanto verifica se o usuário está logado
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl min-h-[calc(100vh-80px)] flex flex-col items-center justify-center" id="main-content">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-slate-500 text-lg">Carregando...</p>
      </div>
    );
  }

  // Permite acesso direto, pois a identificação (ou login) será tratada no passo 2
  return <CreateReportForm />;
}

function CreateReportForm() {
  // Estado para controlar em qual passo do formulário o usuário está
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createReport = useCreateReport();
  const { user, isAuthenticated } = useAuth();
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Inicializa o react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isAnonymous: false,
      category: "Solicitação",
      type: "text",
      content: "",
      mediaUrl: "",
      latitude: "",
      longitude: "",
      address: ""
    }
  });

  // Observa valores do formulário para renderização condicional
  const watchType = form.watch("type");
  const watchCategory = form.watch("category");
  const watchIsAnonymous = form.watch("isAnonymous");
  const watchMediaUrl = form.watch("mediaUrl");
  const watchLatitude = form.watch("latitude");
  const watchLongitude = form.watch("longitude");
  const watchAddress = form.watch("address");

  // Hook useEffect: Tenta pegar a geolocalização automaticamente ao carregar
  useEffect(() => {
    if (navigator.geolocation && !watchLatitude) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setValue("latitude", position.coords.latitude.toString());
          form.setValue("longitude", position.coords.longitude.toString());
        },
        (error) => {
          // console.log("Erro ao obter localização automática", error);
        }
      );
    }
  }, []);

  // Função disparada pelo botão "Usar GPS"
  const getLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Erro", description: "Geolocalização não suportada no seu navegador.", variant: "destructive" });
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsGettingLocation(false);
        form.setValue("latitude", position.coords.latitude.toString());
        form.setValue("longitude", position.coords.longitude.toString());
        toast({ title: "Localização Capturada!", description: "Coordenadas anexadas com sucesso." });
      },
      (error) => {
        setIsGettingLocation(false);
        toast({ title: "Erro", description: "Não foi possível obter sua localização.", variant: "destructive" });
      }
    );
  }

  // Avança para o próximo passo com validações
  const handleNext = async () => {
    // Valida apenas os campos relevantes para o passo atual
    let isValid = false;

    if (currentStep === 1) {
      // Trigger validação dos campos do passo 1
      isValid = await form.trigger(["category", "type", "content", "mediaUrl"]);

      // Validações extras manuais se necessário (o schema já cobre)
      if (!isValid) {
        const errors = form.formState.errors;
        if (errors.content) toast({ title: "Atenção", description: errors.content.message, variant: "destructive" });
        if (errors.mediaUrl) toast({ title: "Atenção", description: errors.mediaUrl.message, variant: "destructive" });
      }
    } else {
      isValid = true;
    }

    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  // Volta um passo
  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const [isCientSubmitting] = useState(false); // Mantido apenas para compatibilidade, o hook gerencia o estado pending

  const onSubmit = async (data: FormValues) => {
    const protocolo = "DF2026-" + Math.random().toString(36).substring(2, 7).toUpperCase();

    // Adiciona o protocolo aos dados para persistência
    const payload = { ...data, protocol: protocolo };

    createReport.mutate(payload, {
      onSuccess: () => {
        setLocation(`/sucesso?protocol=${protocolo}`);
      }
    });
  };

  // Simulação de upload de arquivo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      form.setValue("mediaUrl", url, { shouldValidate: true });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl min-h-[calc(100vh-80px)] flex flex-col justify-center" id="main-content">
      <div className="mb-4 self-start">
        <Button asChild variant="ghost" className="pl-0 gap-2 text-slate-600 hover:text-primary hover:bg-transparent">
          <Link href="/">
            <ArrowLeft className="w-4 h-4" />
            Voltar para o Início
          </Link>
        </Button>
      </div>

      {/* Progress Bar Simplificada */}
      <div className="mb-6">
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${(currentStep / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="p-6 sm:p-8 shadow-xl border-slate-100 rounded-2xl bg-white">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* --- PASSO 1: FORMATO E CONTEÚDO --- */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold font-display text-slate-900">Como você quer se manifestar?</h2>
                      <p className="text-slate-500 mt-1">Escolha a melhor forma para relatar sua demanda.</p>
                    </div>

                    {/* Seletor de Categoria */}
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <Label className="text-base font-semibold">Qual o assunto?</Label>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full text-lg h-12">
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Solicitação">Solicitação</SelectItem>
                              <SelectItem value="Reclamação">Reclamação</SelectItem>
                              <SelectItem value="Denúncia">Denúncia</SelectItem>
                              <SelectItem value="Elogio">Elogio</SelectItem>
                              <SelectItem value="Sugestão">Sugestão</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Botões de Tipo de Mídia */}
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <div className="grid grid-cols-2 gap-4">
                            <button
                              type="button"
                              onClick={() => {
                                field.onChange("audio");
                                form.setValue("content", "");
                                form.setValue("mediaUrl", "");
                              }}
                              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all gap-3 ${field.value === 'audio' ? 'border-primary bg-blue-50 text-primary' : 'border-slate-200 hover:bg-slate-50'}`}
                            >
                              <Mic className="w-8 h-8" />
                              <span className="font-bold">Áudio</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                field.onChange("video");
                                form.setValue("content", "");
                                form.setValue("mediaUrl", "");
                              }}
                              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all gap-3 ${field.value === 'video' ? 'border-primary bg-blue-50 text-primary' : 'border-slate-200 hover:bg-slate-50'}`}
                            >
                              <Video className="w-8 h-8" />
                              <span className="font-bold">Vídeo/Libras</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                field.onChange("image");
                                form.setValue("content", "");
                                form.setValue("mediaUrl", "");
                              }}
                              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all gap-3 ${field.value === 'image' ? 'border-primary bg-blue-50 text-primary' : 'border-slate-200 hover:bg-slate-50'}`}
                            >
                              <ImageIcon className="w-8 h-8" />
                              <span className="font-bold">Foto</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                field.onChange("text");
                                form.setValue("content", "");
                                form.setValue("mediaUrl", "");
                              }}
                              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all gap-3 ${field.value === 'text' ? 'border-primary bg-blue-50 text-primary' : 'border-slate-200 hover:bg-slate-50'}`}
                            >
                              <Type className="w-8 h-8" />
                              <span className="font-bold">Texto</span>
                            </button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Inputs dependendo do tipo */}
                    <div className="mt-6 pt-6 border-t border-slate-100">
                      {watchType === 'text' && (
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Descreva aqui sua manifestação..."
                                  className="min-h-[150px] text-lg p-4"
                                  {...field}
                                  autoFocus
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {watchType === 'audio' && (
                        <div className="space-y-4">
                          <p className="text-center text-sm text-slate-500 mb-4">Seu áudio será transcrito automaticamente pela nossa IA.</p>
                          <AudioRecorder
                            hasRecording={!!watchMediaUrl}
                            onRecordingComplete={(url) => form.setValue("mediaUrl", url, { shouldValidate: true })}
                            onDelete={() => form.setValue("mediaUrl", "", { shouldValidate: true })}
                          />
                        </div>
                      )}

                      {(watchType === 'image' || watchType === 'video') && (
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50">
                          {!watchMediaUrl ? (
                            <>
                              <input
                                type="file"
                                accept={watchType === "image" ? "image/*" : "video/*"}
                                onChange={handleFileUpload}
                                className="hidden"
                                id="file-upload"
                                aria-label="Upload de arquivo de mídia"
                              />
                              <Label htmlFor="file-upload" className="cursor-pointer block w-full h-full">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-primary mb-2">
                                  {watchType === 'image' ? <ImageIcon /> : <Video />}
                                </div>
                                <p className="font-bold text-slate-700">Clique para anexar</p>
                              </Label>
                            </>
                          ) : (
                            <div className="relative">
                              {watchType === 'image' ? (
                                <img src={watchMediaUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                              ) : (
                                <video src={watchMediaUrl} controls className="max-h-64 mx-auto rounded-lg bg-black" />
                              )}
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                className="mt-4"
                                onClick={() => form.setValue("mediaUrl", "", { shouldValidate: true })}
                              >
                                Remover Arquivo
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* --- PASSO 2: IDENTIFICAÇÃO --- */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold font-display text-slate-900">Identificação</h2>
                      <p className="text-slate-500 mt-1">Como deseja prosseguir com sua manifestação?</p>
                    </div>

                    <FormField
                      control={form.control}
                      name="isAnonymous"
                      render={({ field }) => (
                        <FormItem>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div
                              onClick={() => field.onChange(true)}
                              className={`cursor-pointer border-2 rounded-xl p-6 text-center transition-all ${field.value ? 'border-primary bg-blue-50 ring-2 ring-primary/20' : 'border-slate-200 hover:bg-slate-50'}`}
                            >
                              <Shield className={`w-12 h-12 mx-auto mb-3 ${field.value ? 'text-primary' : 'text-slate-400'}`} />
                              <h3 className="font-bold text-lg text-slate-900">Anônimo</h3>
                              <p className="text-sm text-slate-500">Sua identidade será preservada.</p>
                            </div>

                            <div
                              onClick={() => field.onChange(false)}
                              className={`cursor-pointer border-2 rounded-xl p-6 text-center transition-all ${!field.value ? 'border-primary bg-blue-50 ring-2 ring-primary/20' : 'border-slate-200 hover:bg-slate-50'}`}
                            >
                              <User className={`w-12 h-12 mx-auto mb-3 ${!field.value ? 'text-primary' : 'text-slate-400'}`} />
                              <h3 className="font-bold text-lg text-slate-900">Identificado</h3>
                              <p className="text-sm text-slate-500">Receba retorno nominal.</p>
                              {!isAuthenticated && !field.value && (
                                <p className="text-xs text-amber-600 mt-2 font-semibold">Necessário login</p>
                              )}
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Geolocalização */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-bold flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> Localização do Fato
                        </Label>
                        {watchLatitude && <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded">Capturada</span>}
                      </div>

                      <div className="bg-slate-50 p-4 rounded-lg flex flex-col gap-4 border border-slate-200">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <p className="text-sm text-slate-600">
                              {watchLatitude
                                ? `Lat: ${watchLatitude.substring(0, 8)}, Long: ${watchLongitude?.substring(0, 8)}`
                                : "Nenhuma localização de GPS capturada."
                              }
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={getLocation}
                            disabled={isGettingLocation}
                          >
                            {isGettingLocation ? <Loader2 className="animate-spin w-4 h-4" /> : <MapPin className="w-4 h-4 mr-2" />}
                            {watchLatitude ? "Atualizar GPS" : "Usar GPS"}
                          </Button>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-200">
                          <Label htmlFor="address" className="text-sm font-semibold text-slate-700">Ou digite o endereço/ponto de referência</Label>
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    id="address"
                                    placeholder="Ex: Rua das Flores, 123 - Em frente ao mercado..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- PASSO 3: CONFIRMAÇÃO --- */}
                {currentStep === 3 && (
                  <div className="space-y-6 text-center">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Tudo pronto?</h2>
                    <p className="text-slate-600 max-w-md mx-auto">
                      Sua manifestação de <strong>{watchCategory}</strong> via <strong>{watchType === 'text' ? 'Texto' : 'Arquivo de Mídia'}</strong> será processada imediatamente.
                    </p>

                    <div className="bg-slate-50 p-4 rounded-lg text-left text-sm space-y-2 border border-slate-200 mt-4">
                      <p><strong>Identificação:</strong> {watchIsAnonymous ? "Anônima" : (user?.firstName || "Identificada")}</p>
                      <p><strong>Localização:</strong> {watchLatitude ? "Georreferenciada" : "Não informada"}</p>
                      <p className="text-xs text-slate-400 mt-2 italic">* Ao enviar, você concorda com nossos <Link href="/termos" className="underline hover:text-primary">Termos de Uso</Link> e processamento de dados conforme a <Link href="/lgpd" className="underline hover:text-primary">LGPD</Link>.</p>
                      <p className="text-xs text-slate-400 mt-1 italic">* Será gerado um protocolo único para acompanhamento.</p>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1 border-slate-200 h-12 text-lg"
                      disabled={createReport.isPending}
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Voltar
                    </Button>
                  )}

                  <Button
                    type={currentStep === 3 ? "submit" : "button"}
                    onClick={currentStep === 3 ? undefined : handleNext}
                    className="flex-[2] bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 h-12 text-lg"
                    disabled={createReport.isPending || isCientSubmitting}
                  >
                    {(createReport.isPending || isCientSubmitting) ? (
                      <>Enviando... <Loader2 className="w-5 h-5 ml-2 animate-spin" /></>
                    ) : currentStep === 3 ? (
                      <>Enviar Manifestação <Send className="w-5 h-5 ml-2" /></>
                    ) : (
                      <>Continuar <ArrowRight className="w-5 h-5 ml-2" /></>
                    )}
                  </Button>
                </div>

              </form>
            </Form>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
