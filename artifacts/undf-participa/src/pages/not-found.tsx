import { Link } from "wouter";
import { Search, Home, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
        <FileQuestion className="w-10 h-10 text-muted-foreground" />
      </div>
      <h1 className="text-4xl font-bold text-foreground mb-2">Página não encontrada</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md text-balance">
        O endereço que você tentou acessar não existe ou a página foi movida em nossa plataforma.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link href="/">
          <Button variant="default" className="bg-primary flex items-center gap-2">
            <Home className="w-4 h-4" /> Voltar ao Início
          </Button>
        </Link>
        <Link href="/protocolo">
          <Button variant="outline" className="flex items-center gap-2">
            <Search className="w-4 h-4" /> Buscar Protocolo
          </Button>
        </Link>
      </div>
    </div>
  );
}
