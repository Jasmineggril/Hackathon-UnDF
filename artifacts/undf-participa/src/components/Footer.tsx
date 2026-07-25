import { Link } from "wouter";
import logoPath from "@assets/Gemini_Generated_Image_lkejrrlkejrrlkej_1785001200344.png";

export function Footer() {
  return (
    <footer className="bg-muted py-12 mt-auto border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <img src={logoPath} alt="Voz UnDF" className="h-10 w-auto grayscale opacity-80" />
              <span className="font-bold text-lg text-foreground">Voz UnDF</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm">
              Sua voz participa. A Universidade transforma.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Plataforma</h4>
            <ul className="space-y-2">
              <li><Link href="/demandas" className="text-sm text-muted-foreground hover:text-primary transition-colors">Demandas</Link></li>
              <li><Link href="/propostas" className="text-sm text-muted-foreground hover:text-primary transition-colors">Propostas</Link></li>
              <li><Link href="/transparencia" className="text-sm text-muted-foreground hover:text-primary transition-colors">Transparência</Link></li>
              <li><Link href="/protocolo" className="text-sm text-muted-foreground hover:text-primary transition-colors">Protocolo</Link></li>
              <li><Link href="/sobre" className="text-sm text-muted-foreground hover:text-primary transition-colors">Sobre</Link></li>
              <li><Link href="/ods16" className="text-sm text-muted-foreground hover:text-primary transition-colors">ODS 16</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacidade</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Acessibilidade</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Cookies</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Governança</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Universidade do Distrito Federal. Voz UnDF.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            Feito para a comunidade universitária.
          </div>
        </div>
      </div>
    </footer>
  );
}
