import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export interface Report {
  id: number;
  protocol: string;
  type: "text" | "audio" | "video" | "image";
  category: string;
  status: "received" | "processing" | "completed";
  content: string;
  mediaUrl: string | null;
  latitude: string | null;
  longitude: string | null;
  address: string | null;
  isAnonymous: boolean;
  createdAt: string;
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: any) => {
      // Simulação de delay de rede
      await new Promise(resolve => setTimeout(resolve, 800));

      // Garante que o array existe
      let reports: Report[] = [];
      try {
        reports = JSON.parse(localStorage.getItem("reports") || "[]");
      } catch (e) {
        reports = [];
      }

      const newReport: Report = {
        id: Date.now(),
        protocol: data.protocol || `DF2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        type: data.type,
        category: data.category || "Solicitação",
        status: "received",
        content: data.content || "",
        mediaUrl: data.mediaUrl || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        address: data.address || null,
        isAnonymous: data.isAnonymous,
        createdAt: new Date().toISOString(),
      };

      reports.push(newReport);
      localStorage.setItem("reports", JSON.stringify(reports));

      // Trigger para atualizar outras abas/componentes
      window.dispatchEvent(new Event('storage'));

      return newReport;
    },
    onSuccess: (data) => {
      toast({
        title: "Sucesso!",
        description: `Manifestação enviada! Protocolo: ${data.protocol}`,
        className: "bg-green-600 text-white border-none",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no envio",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });
}

export function useReportStatus(protocol: string) {
  return useQuery({
    queryKey: ["report", protocol],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 600)); // Delay simulado

      if (!protocol || protocol.length < 5) return null;

      let reports: Report[] = [];
      try {
        reports = JSON.parse(localStorage.getItem("reports") || "[]");
      } catch (e) {
        console.error("Erro no parse", e);
      }

      const report = reports.find(r =>
        r.protocol?.trim().toUpperCase() === protocol?.trim().toUpperCase()
      );

      // Se não achar, vê se tem o mock inicial (opcional, para testes do usuário)
      if (!report && protocol === 'DF2026-TESTE') {
        return {
          id: 1,
          protocol: 'DF2026-TESTE',
          type: 'text',
          category: 'Sugestão',
          status: 'completed',
          content: 'Isso é um teste de protocolo.',
          mediaUrl: null,
          latitude: null,
          longitude: null,
          address: 'Brasília, DF',
          isAnonymous: false,
          createdAt: new Date().toISOString()
        } as Report;
      }

      if (!report) {
        throw new Error("Protocolo não encontrado");
      }

      return report;
    },
    retry: false,
    enabled: !!protocol && protocol.length > 4,
  });
}
