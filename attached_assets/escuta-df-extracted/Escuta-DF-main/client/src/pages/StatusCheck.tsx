import { useState } from "react";
import { useReportStatus } from "@/hooks/use-reports";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Loader2, FileText, Calendar, Activity, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function StatusCheck() {
  const [inputProtocol, setInputProtocol] = useState("");
  const [searchProtocol, setSearchProtocol] = useState("");

  const { data, isLoading, error, isError } = useReportStatus(searchProtocol);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchProtocol(inputProtocol.trim());
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl min-h-[calc(100vh-80px)]" id="main-content">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" className="pl-0 gap-2 text-slate-600 hover:text-primary hover:bg-transparent">
            <ArrowLeft className="w-4 h-4" />
            Voltar para o Início
          </Button>
        </Link>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold font-display text-slate-900 mb-3">Consultar Protocolo</h1>
        <p className="text-slate-600">
          Acompanhe o andamento da sua manifestação em tempo real.
        </p>
      </div>

      <Card className="p-6 mb-8 shadow-md">
        <form onSubmit={handleSearch} className="flex gap-4">
          <Input
            placeholder="Digite o número do protocolo (ex: 202410...)"
            className="text-lg h-12"
            value={inputProtocol}
            onChange={(e) => setInputProtocol(e.target.value)}
          />
          <Button type="submit" size="lg" className="px-8 bg-primary hover:bg-primary/90 h-12" disabled={!inputProtocol}>
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </Button>
        </form>
      </Card>

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center animate-in fade-in">
          <p className="text-red-800 font-medium">Protocolo não encontrado</p>
          <p className="text-red-600 text-sm mt-1">Verifique se o número está correto e tente novamente.</p>
        </div>
      )}

      {data && (
        <Card className="overflow-hidden shadow-lg animate-in slide-in-from-bottom-4 duration-500 border-t-4 border-t-primary">
          <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Protocolo</p>
              <p className="text-2xl font-mono font-bold text-slate-900">{data.protocol}</p>
            </div>
            <div className={`
               px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide
               ${data.status === 'received' ? 'bg-blue-100 text-blue-800' : ''}
               ${data.status === 'processing' ? 'bg-amber-100 text-amber-800' : ''}
               ${data.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
             `}>
              {data.status === 'received' && 'Recebido'}
              {data.status === 'processing' && 'Em Análise'}
              {data.status === 'completed' && 'Concluído'}
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                <Calendar className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Data de Envio</p>
                <p className="text-slate-900 font-semibold">
                  {data.createdAt ? format(new Date(data.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR }) : 'Data indisponível'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                <FileText className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Assunto / Tipo</p>
                <p className="text-slate-800 font-semibold">
                  <span className="capitalize">{data.category}</span>
                  <span className="text-slate-400 font-normal ml-2 text-sm">({
                    data.type === 'text' ? 'Texto' :
                      data.type === 'audio' ? 'Áudio' :
                        data.type === 'video' ? 'Vídeo' :
                          data.type === 'image' ? 'Imagem' : data.type
                  })</span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                <Activity className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Última Atualização</p>
                <p className="text-slate-900">
                  {data.status === 'received' && 'Sua manifestação foi recebida e está aguardando triagem.'}
                  {data.status === 'processing' && 'A equipe técnica está analisando sua solicitação.'}
                  {data.status === 'completed' && 'Sua manifestação foi finalizada e respondida.'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
