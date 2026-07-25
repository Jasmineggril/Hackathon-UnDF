import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateProposal } from "@workspace/api-client-react";
import { DemandCategory } from "@workspace/api-client-react";
import { useAuth } from "@workspace/auth-web";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone } from "lucide-react";

const proposalSchema = z.object({
  title: z.string().min(10, "Mínimo de 10 caracteres").max(200, "Máximo de 200 caracteres"),
  description: z.string().min(30, "Mínimo de 30 caracteres").max(5000, "Máximo de 5000 caracteres"),
  category: z.nativeEnum(DemandCategory),
  targetUnit: z.string().optional(),
});

export default function NewProposal() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const createProposal = useCreateProposal();

  const form = useForm<z.infer<typeof proposalSchema>>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Infraestrutura" as DemandCategory,
      targetUnit: "",
    },
  });

  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  const onSubmit = async (values: z.infer<typeof proposalSchema>) => {
    try {
      await createProposal.mutateAsync({ data: values });
      setLocation("/propostas");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
          <Megaphone className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Sugerir Nova Proposta</h1>
        <p className="text-muted-foreground mt-2">
          As propostas são projetos mais estruturados que demandam aprovação e análise da gestão. 
          Descreva sua ideia com clareza para atrair apoio da comunidade.
        </p>
      </div>

      <div className="bg-card border rounded-xl p-6 md:p-8 shadow-sm">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Proposta <span className="text-destructive">*</span></Label>
            <Input 
              id="title"
              placeholder="Ex: Instalação de bicicletários sustentáveis no Campus Norte"
              {...form.register("title")}
              className={form.formState.errors.title ? "border-destructive" : ""}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Categoria <span className="text-destructive">*</span></Label>
              <Select 
                onValueChange={(v) => form.setValue("category", v as DemandCategory)}
                defaultValue={form.getValues("category")}
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
              <Label htmlFor="targetUnit">Unidade de Aplicação</Label>
              <Input 
                id="targetUnit"
                placeholder="Ex: Reitoria, Todos os campi..."
                {...form.register("targetUnit")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição do Projeto <span className="text-destructive">*</span></Label>
            <Textarea 
              id="description"
              placeholder="Descreva a justificativa, o impacto esperado, quem será beneficiado e uma estimativa de viabilidade..."
              className={`min-h-[200px] resize-y ${form.formState.errors.description ? "border-destructive" : ""}`}
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
            )}
            <p className="text-xs text-muted-foreground">Seja claro e objetivo. Propostas bem detalhadas recebem mais apoio.</p>
          </div>

          <div className="flex justify-end pt-6 border-t gap-4">
            <Link href="/propostas">
              <Button type="button" variant="ghost">Cancelar</Button>
            </Link>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90 min-w-[150px]"
              disabled={createProposal.isPending}
            >
              {createProposal.isPending ? "Enviando..." : "Submeter Proposta"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
