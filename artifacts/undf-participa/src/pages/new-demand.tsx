import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, ChevronRight, FileText, Image as ImageIcon, MapPin, Mic, Video } from "lucide-react";
import { useCreateDemand } from "@workspace/api-client-react";
import { DemandCategory, DemandType } from "@workspace/api-client-react";
import { useAuth } from "@workspace/auth-web";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";

const demandSchema = z.object({
  type: z.nativeEnum(DemandType),
  category: z.nativeEnum(DemandCategory),
  content: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  targetUnit: z.string().optional(),
  address: z.string().optional(),
  isAnonymous: z.boolean().default(false),
});

export default function NewDemand() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [protocol, setProtocol] = useState<string | null>(null);
  
  const createDemand = useCreateDemand();

  const form = useForm<z.infer<typeof demandSchema>>({
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

  const onSubmit = async (values: z.infer<typeof demandSchema>) => {
    try {
      const response = await createDemand.mutateAsync({ data: values });
      setProtocol(response.protocol);
      setStep(5); // Success step
    } catch (error) {
      console.error(error);
      // handled by global error boundaries / toast if available, or could show inline
    }
  };

  const nextStep = async () => {
    const fieldsByStep: any = {
      1: ["type"],
      2: ["category", "content", "targetUnit"],
      3: ["isAnonymous", "address"],
      4: [] // Review step doesn't validate specific fields here, it submits
    };

    const valid = await form.trigger(fieldsByStep[step]);
    if (valid) {
      if (step === 4) {
        form.handleSubmit(onSubmit)();
      } else {
        setStep(s => s + 1);
      }
    }
  };

  const prevStep = () => setStep(s => s - 1);

  if (step === 5) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
        <div className="bg-card border rounded-xl p-8 shadow-sm">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Demanda Registrada com Sucesso!</h2>
          <p className="text-muted-foreground mb-8">
            Sua manifestação foi enviada para a equipe responsável. Guarde seu protocolo para acompanhar o andamento.
          </p>
          
          <div className="bg-muted p-6 rounded-lg mb-8 inline-block">
            <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Número do Protocolo</p>
            <p className="text-3xl font-mono font-bold tracking-widest text-primary">{protocol}</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/demandas">
              <Button variant="outline" className="w-full sm:w-auto">Ver Todas as Demandas</Button>
            </Link>
            <Link href={`/protocolo?q=${protocol}`}>
              <Button className="w-full sm:w-auto bg-primary">Acompanhar Status</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const values = form.getValues();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Nova Demanda</h1>
        <p className="text-muted-foreground">Siga os passos abaixo para registrar sua manifestação.</p>
        <Progress value={(step / 4) * 100} className="mt-6 h-2" />
        <div className="flex justify-between text-xs text-muted-foreground mt-2 font-medium">
          <span className={step >= 1 ? "text-primary" : ""}>Tipo</span>
          <span className={step >= 2 ? "text-primary" : ""}>Assunto</span>
          <span className={step >= 3 ? "text-primary" : ""}>Detalhes</span>
          <span className={step >= 4 ? "text-primary" : ""}>Revisão</span>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 md:p-8 shadow-sm">
        <form className="space-y-6">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold border-b pb-2">1. Qual o formato da sua demanda?</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { value: "text", icon: FileText, label: "Texto" },
                  { value: "audio", icon: Mic, label: "Áudio" },
                  { value: "image", icon: ImageIcon, label: "Imagem" },
                  { value: "video", icon: Video, label: "Vídeo" },
                ].map((t) => (
                  <div 
                    key={t.value}
                    className={`border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${values.type === t.value ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40 text-muted-foreground"}`}
                    onClick={() => {
                      form.setValue("type", t.value as DemandType);
                      form.trigger("type");
                    }}
                  >
                    <t.icon className="w-8 h-8" />
                    <span className="font-medium">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold border-b pb-2">2. Sobre o que é a demanda?</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select 
                    value={values.category} 
                    onValueChange={(v) => form.setValue("category", v as DemandCategory)}
                  >
                    <SelectTrigger className={form.formState.errors.category ? "border-destructive" : ""}>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(DemandCategory).map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Unidade/Campus (Opcional)</Label>
                  <Input 
                    placeholder="Ex: Campus Norte, Reitoria..." 
                    {...form.register("targetUnit")}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descrição Detalhada</Label>
                  <Textarea 
                    placeholder="Descreva o problema ou sugestão com o máximo de detalhes..."
                    className={`min-h-[120px] resize-y ${form.formState.errors.content ? "border-destructive" : ""}`}
                    {...form.register("content")}
                  />
                  {form.formState.errors.content && (
                    <p className="text-xs text-destructive">{form.formState.errors.content.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold border-b pb-2">3. Detalhes e Privacidade</h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Localização Exata (Opcional)
                  </Label>
                  <Input 
                    placeholder="Ex: Sala 104, Bloco B, ao lado do bebedouro..." 
                    {...form.register("address")}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold">Registro Anônimo</Label>
                    <p className="text-sm text-muted-foreground">
                      Seu nome e e-mail não serão exibidos publicamente nesta demanda.
                    </p>
                  </div>
                  <Switch 
                    checked={values.isAnonymous}
                    onCheckedChange={(v) => form.setValue("isAnonymous", v)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-xl font-bold border-b pb-2">4. Revisão</h2>
              
              <div className="space-y-4 bg-muted/30 p-4 rounded-lg border">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categoria</span>
                  <p className="font-medium text-foreground">{values.category}</p>
                </div>
                {values.targetUnit && (
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unidade</span>
                    <p className="font-medium text-foreground">{values.targetUnit}</p>
                  </div>
                )}
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Descrição</span>
                  <p className="text-sm text-foreground whitespace-pre-wrap mt-1">{values.content}</p>
                </div>
                {values.address && (
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Local</span>
                    <p className="font-medium text-foreground">{values.address}</p>
                  </div>
                )}
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Privacidade</span>
                  <p className="font-medium text-foreground">{values.isAnonymous ? "Anônimo (Dados protegidos)" : "Público (Seu nome aparecerá)"}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t mt-8">
            <Button 
              type="button" 
              variant="outline" 
              onClick={prevStep}
              disabled={step === 1 || createDemand.isPending}
            >
              Voltar
            </Button>
            <Button 
              type="button" 
              className="bg-primary hover:bg-primary/90 min-w-[120px]"
              onClick={nextStep}
              disabled={createDemand.isPending}
            >
              {step === 4 ? (createDemand.isPending ? "Enviando..." : "Enviar Demanda") : (
                <>Próximo <ChevronRight className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
