import { Link } from 'wouter';
import { useAuth } from '@workspace/replit-auth-web';
import { Button } from '@/components/ui/button';
import { Menu, UserCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function Header() {
  const { user, isAuthenticated, login, logout } = useAuth();

  const NavLinks = () => (
    <>
      <Link href="/demandas" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
        Demandas
      </Link>
      <Link href="/propostas" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
        Propostas
      </Link>
      <Link href="/transparencia" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
        Transparência
      </Link>
      <Link href="/ods16" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
        ODS 16
      </Link>
      <Link href="/sobre" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
        Sobre
      </Link>
      {user?.role === 'admin' && (
        <Link href="/admin" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          Admin
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-primary">UnDF Participa</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <NavLinks />
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <UserCircle className="w-5 h-5" />
                    <span>{user?.firstName || user?.email || 'Usuário'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={login} variant="default">
                Entrar
              </Button>
            )}
          </div>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu principal</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-6">
              <Link href="/" className="flex items-center gap-2 mt-4">
                <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <span className="text-lg font-bold tracking-tight text-primary">UnDF Participa</span>
              </Link>
              <nav className="flex flex-col gap-4 mt-2">
                <NavLinks />
              </nav>
              <div className="mt-auto mb-4 border-t pt-4">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm font-medium px-2 mb-2">
                      <UserCircle className="w-5 h-5" />
                      <span>{user?.firstName || user?.email || 'Usuário'}</span>
                    </div>
                    <Button onClick={logout} variant="destructive" className="w-full">
                      Sair
                    </Button>
                  </div>
                ) : (
                  <Button onClick={login} variant="default" className="w-full">
                    Entrar
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
