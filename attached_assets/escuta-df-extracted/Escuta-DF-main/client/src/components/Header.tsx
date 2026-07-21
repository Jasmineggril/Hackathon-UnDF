import { Link } from "wouter";
import logoImg from "@assets/_Logo_Escuta_DF__1769708916694.jpg";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogIn, LogOut, User } from "lucide-react";

export function Header() {
  const { user, isLoading, isAuthenticated, logout, isLoggingOut } = useAuth();

  return (
    <header className="bg-white border-b border-border shadow-sm sticky top-0 z-40">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-primary text-white px-4 py-2 rounded-md"
      >
        Pular para conteúdo
      </a>
      <div className="container mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 rounded-lg p-1 transition-colors hover:bg-slate-50">
          <div className="relative h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-full border border-slate-100 shadow-sm">
            <img
              src={logoImg}
              alt="Logo Escuta DF"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg sm:text-xl text-primary leading-tight">Escuta DF</span>
            <span className="text-[10px] sm:text-xs font-medium text-muted-foreground tracking-wide uppercase">Ouvidoria Digital</span>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4" aria-label="Menu principal">
          <div className="hidden md:flex items-center gap-4 mr-4 text-sm font-medium text-slate-700">
            <Link href="/sobre" className="hover:text-primary transition-colors">Sobre</Link>
            <Link href="/transparencia" className="hover:text-primary transition-colors">Transparência</Link>
            <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
          </div>
          {isLoading ? (
            <div className="h-9 w-20 bg-slate-100 rounded-md animate-pulse" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "Usuário"} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-slate-700">
                  {user.firstName || "Cidadão"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout()}
                disabled={isLoggingOut}
                aria-label="Sair da conta"
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          ) : (
            <Button
              asChild
              size="sm"
              data-testid="button-login"
              className="px-6 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            >
              <Link href="/auth" aria-label="Entrar na sua conta">
                <LogIn className="h-4 w-4 mr-2" />
                Entrar
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
