import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import logoImg from "@assets/_Logo_Escuta_DF__1769708916694.jpg";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="mb-8">
        <img src={logoImg} alt="Escuta DF" className="h-16 w-16 rounded-full mx-auto mb-4 border shadow-sm" />
      </div>

      <div className="text-center max-w-md space-y-6">
        <div className="inline-flex items-center justify-center p-4 bg-red-100 rounded-full mb-4">
          <AlertCircle className="h-12 w-12 text-red-600" />
        </div>

        <h1 className="text-4xl font-display font-bold text-slate-900">Página não encontrada</h1>

        <p className="text-slate-600 text-lg leading-relaxed">
          Ops! O conteúdo que você procurou não existe ou foi movido.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link href="/" className="w-full">
            <Button className="w-full h-12 gap-2 text-lg shadow-lg shadow-primary/20">
              <Home className="w-5 h-5" /> Início
            </Button>
          </Link>
          <Button variant="outline" className="w-full h-12 gap-2 text-lg" onClick={() => window.history.back()}>
            <ArrowLeft className="w-5 h-5" /> Voltar
          </Button>
        </div>
      </div>
    </div>
  );
}
