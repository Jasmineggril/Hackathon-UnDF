import { useLocation, Link } from "wouter";
import { CheckCircle2, Copy, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Success() {
  const [location] = useLocation();
  const { toast } = useToast();
  
  // Extract protocol from query string
  const protocol = new URLSearchParams(location.split("?")[1]).get("protocol") || "UNKNOWN";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(protocol);
    toast({
      title: "Copiado!",
      description: "Número de protocolo copiado para a área de transferência.",
    });
  };

  return (
    <div className="container mx-auto px-4 min-h-[calc(100vh-80px)] flex items-center justify-center" id="main-content">
      <div className="max-w-md w-full text-center space-y-8 animate-in zoom-in duration-500">
        
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
          <CheckCircle2 className="w-24 h-24 text-green-600 relative z-10 fill-white" />
        </div>

        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-4">Manifestação Recebida!</h1>
          <p className="text-slate-600">
            Sua solicitação foi registrada com sucesso no sistema da Ouvidoria do DF.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Seu Protocolo</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl font-mono font-bold text-slate-900 tracking-wider">{protocol}</span>
            <Button size="icon" variant="ghost" onClick={copyToClipboard} className="hover:bg-slate-200">
              <Copy className="w-5 h-5 text-slate-600" />
            </Button>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            Guarde este número para consultar o andamento.
          </p>
        </div>

        <div className="flex gap-4">
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full h-12 border-slate-300">
              <Home className="w-4 h-4 mr-2" /> Voltar ao Início
            </Button>
          </Link>
          <Link href="/consultar" className="w-full">
            <Button className="w-full h-12 bg-primary hover:bg-primary/90">
              Acompanhar
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
