import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, User as UserIcon, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@workspace/auth-web";
import { Button } from "@/components/ui/button";
import logoPath from "@assets/Gemini_Generated_Image_lkejrrlkejrrlkej_1785001200344.png";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const navLinks = [
    { label: "Início", href: "/" },
    { label: "Demandas", href: "/demandas" },
    { label: "Propostas", href: "/propostas" },
    { label: "Transparência", href: "/transparencia" },
    { label: "ODS", href: "/ods16" },
    { label: "Sobre", href: "/sobre" },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img src={logoPath} alt="Voz UnDF" className="h-10 w-auto" />
          <span className="font-bold text-lg text-primary hidden sm:inline-block">
            Voz UnDF
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              {(user.role === "gestor" || user.role === "administrador") && (
                <Link href="/admin" className="text-sm font-medium text-secondary flex items-center gap-1 hover:underline">
                  <LayoutDashboard className="w-4 h-4" /> Painel da gestão
                </Link>
              )}
              <div className="flex items-center gap-2 relative group cursor-pointer py-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{user.fullName || user.email}</span>
                </div>
                {/* Dropdown via group hover */}
                <div className="absolute top-full right-0 mt-1 w-48 bg-card border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-2 flex flex-col gap-1">
                    <Link href="/demandas" className="text-sm px-3 py-2 hover:bg-muted rounded-md text-foreground">
                      Minhas demandas
                    </Link>
                    <Link href="/propostas" className="text-sm px-3 py-2 hover:bg-muted rounded-md text-foreground">
                      Minhas propostas
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-sm px-3 py-2 hover:bg-muted rounded-md text-destructive text-left flex items-center gap-2 w-full"
                    >
                      <LogOut className="w-4 h-4" /> Sair
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="default" className="bg-primary hover:bg-primary/90">
                Entrar
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-background z-40 flex flex-col">
          <nav className="flex flex-col p-4 gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-lg font-medium p-2 border-b text-foreground"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && user ? (
              <>
                {(user.role === "gestor" || user.role === "administrador") && (
                  <Link href="/admin" className="text-lg font-medium p-2 border-b text-secondary flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5" /> Painel da gestão
                  </Link>
                )}
                <Link href="/demandas" className="text-lg font-medium p-2 border-b text-foreground">
                  Minhas demandas
                </Link>
                <Link href="/propostas" className="text-lg font-medium p-2 border-b text-foreground">
                  Minhas propostas
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-lg font-medium p-2 text-left text-destructive flex items-center gap-2"
                >
                  <LogOut className="w-5 h-5" /> Sair
                </button>
              </>
            ) : (
              <div className="mt-4">
                <Link href="/login">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-lg py-6">
                    Entrar
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
