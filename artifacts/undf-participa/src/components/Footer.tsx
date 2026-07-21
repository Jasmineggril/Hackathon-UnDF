import { Link } from 'wouter';

export function Footer() {
  return (
    <footer className="w-full border-t bg-background mt-16">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-primary">UnDF Participa</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm">
              Plataforma de gestão participativa da Universidade do Distrito Federal.
              Conectando estudantes, docentes e servidores para construir uma universidade melhor.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Plataforma</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/demandas" className="hover:text-primary transition-colors">Demandas</Link></li>
              <li><Link href="/propostas" className="hover:text-primary transition-colors">Propostas</Link></li>
              <li><Link href="/transparencia" className="hover:text-primary transition-colors">Transparência</Link></li>
              <li><Link href="/protocolo" className="hover:text-primary transition-colors">Consultar Protocolo</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Institucional</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/sobre" className="hover:text-primary transition-colors">Sobre o UnDF Participa</Link></li>
              <li><Link href="/ods16" className="hover:text-primary transition-colors">Nosso compromisso: ODS 16</Link></li>
              <li><a href="https://undf.edu.br" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Portal da UnDF</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Universidade do Distrito Federal. Todos os direitos reservados.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="/sobre" className="hover:text-primary">Termos de Uso</Link>
            <Link href="/sobre" className="hover:text-primary">Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
