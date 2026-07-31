import { useParams, Link } from "wouter";
import { CheckCircle2, Copy, Download, ExternalLink, LayoutDashboard, Loader2 } from "lucide-react";
import { useDemandById } from "@/hooks/use-user-data";
import { Button } from "@/components/ui/button";
import { Mascote } from "@/components/Mascote";
import { toast } from "sonner";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_LABELS: Record<string, string> = {
  received: "Recebida",
  in_analysis: "Em Análise",
  processing: "Em Execução",
  awaiting_info: "Aguardando Informações",
  completed: "Concluída",
  rejected: "Não Aprovada",
  archived: "Arquivada",
  escalated: "Escalada",
};

function printReceipt(protocol: string, category: string, type: string, createdAt: string) {
  const w = window.open("", "_blank", "width=600,height=700");
  if (!w) return;
  const dateStr = format(new Date(createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  w.document.write(`<!DOCTYPE html><html lang="pt-BR"><head>
  <meta charset="UTF-8"/>
  <title>Comprovante Voz UnDF — ${protocol}</title>
  <style>
    @media print{body{margin:0}.no-print{display:none}}
    body{font-family:Arial,sans-serif;color:#1B3469;padding:40px;max-width:560px;margin:auto}
    h1{font-size:22px;margin-bottom:4px}.subtitle{font-size:12px;color:#888;margin-bottom:32px;text-transform:uppercase;letter-spacing:1px}
    .section{margin-bottom:20px}.label{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:3px}
    .value{font-size:14px;font-weight:bold}
    .protocol{font-family:monospace;font-size:24px;color:#1B3469;border:2px solid #1B3469;padding:12px 20px;display:inline-block;margin:12px 0}
    .notice{font-size:11px;color:#888;border-top:1px solid #eee;padding-top:16px;margin-top:24px;line-height:1.6}
    .status{display:inline-block;background:#e8f4ef;color:#2d7a52;padding:4px 12px;border-radius:100px;font-size:12px;font-weight:bold}
    button{background:#1B3469;color:white;border:none;padding:10px 24px;font-size:14px;cursor:pointer;margin-top:20px}
  </style></head><body>
  <h1>Voz UnDF</h1><p class="subtitle">Comprovante de Manifestação</p>
  <div class="section"><div class="label">Protocolo</div><div class="protocol">${protocol}</div></div>
  <div class="section"><div class="label">Categoria</div><div class="value">${category}</div></div>
  <div class="section"><div class="label">Tipo</div><div class="value" style="text-transform:capitalize">${type}</div></div>
  <div class="section"><div class="label">Data de registro</div><div class="value">${dateStr}</div></div>
  <div class="section"><div class="label">Status inicial</div><span class="status">Recebida</span></div>
  <div class="notice"><strong>Como acompanhar:</strong> Acesse /protocolo e insira o número de protocolo acima.<br/><br/>
  <strong>Aviso de privacidade:</strong> Este comprovante é pessoal e não deve ser compartilhado com terceiros.</div>
  <div class="no-print"><button onclick="window.print()">Imprimir / Salvar PDF</button></div>
  </body></html>`);
  w.document.close();
}

export default function DemandSuccess() {
  const { id } = useParams<{ id: string }>();
  const demandId = parseInt(id ?? "", 10);
  const [copied, setCopied] = useState(false);

  const { data: demand, isLoading } = useDemandById(isNaN(demandId) ? null : demandId);

  const copyProtocol = () => {
    if (!demand) return;
    navigator.clipboard.writeText(demand.protocol);
    setCopied(true);
    toast.success("Protocolo copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
      </div>
    );
  }

  if (!demand) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-muted-foreground">Demanda não encontrada.</p>
        <Link href="/meu-painel">
          <Button variant="outline">Ir para Meu Painel</Button>
        </Link>
      </div>
    );
  }

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
                {format(new Date(demand.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
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
                {demand.protocol}
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
              <p className="font-medium text-foreground">{demand.category}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Status inicial</p>
              <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                {STATUS_LABELS[demand.status] ?? demand.status}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Link href={`/demandas/${demand.id}`}>
              <Button className="w-full bg-[#1B3469] hover:bg-[#1B3469]/90 text-white">
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver minha demanda
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full border-[#1B3469]/20 text-[#1B3469]"
              onClick={() => printReceipt(demand.protocol, demand.category, demand.type, demand.createdAt)}
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar comprovante
            </Button>
            <Link href={`/protocolo?q=${demand.protocol}`} className="sm:col-span-2">
              <Button variant="outline" className="w-full border-[#1B3469]/20 text-[#1B3469]">
                Acompanhar pelo protocolo
              </Button>
            </Link>
            <Link href="/meu-painel" className="sm:col-span-2">
              <Button variant="ghost" className="w-full text-[#1B3469]/60 hover:text-[#1B3469]">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Ir para Meu Painel
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
