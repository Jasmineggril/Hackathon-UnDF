import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, User as UserIcon, LogOut, LayoutDashboard, HelpCircle, BookOpen } from "lucide-react";
import { useAuth } from "@workspace/auth-web";
import { Button } from "@/components/ui/button";
import { useTour } from "@/components/GuidedTour";
import logoPath from "@assets/logo-voz-undf.png";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { reopen: reopenTour } = useTour();

  useEffect(() => { setIsOpen(false); }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const navLinks = [
    { label: "Demandas", href: "/demandas" },
    { label: "Propostas", href: "/propostas" },
    { label: "Transparência", href: "/transparencia" },
    { label: "ODS 16", href: "/ods16" },
    { label: "Sobre", href: "/sobre" },
    { label: "Ajuda", href: "/ajuda" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#F2F0EB]/95 backdrop-blur-md border-b border-[#1B3469]/10 shadow-sm"
          : "bg-[#F2F0EB] border-b border-[#1B3469]/10"
      }`}
    >
      <div className="px-6 md:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <img src={logoPath} alt="Voz UnDF" className="h-9 w-auto object-contain" />
          <span
            className="font-bold text-base text-[#1B3469] hidden sm:inline-block"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Voz UnDF
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Navegação principal">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors tracking-wide ${
                location === link.href
                  ? "text-[#1B3469]"
                  : "text-[#1B3469]/50 hover:text-[#1B3469]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              {(user.role === "gestor" || user.role === "administrador") && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-[#5B9A6E] flex items-center gap-1.5 hover:text-[#4a8059] transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                  Painel da gestão
                </Link>
              )}
              <div className="flex items-center gap-2 relative group cursor-pointer py-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 border border-[#1B3469]/20 flex items-center justify-center text-[#1B3469]">
                    <UserIcon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium text-[#1B3469]">{user.fullName || user.email}</span>
                </div>
                <div className="absolute top-full right-0 mt-1 w-52 bg-[#F2F0EB] border border-[#1B3469]/10 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2 flex flex-col gap-1">
                    <Link href="/meu-painel" className="text-sm px-3 py-2 hover:bg-[#1B3469]/5 text-[#1B3469]/70 font-medium">
                      Meu painel
                    </Link>
                    <Link href="/demandas" className="text-sm px-3 py-2 hover:bg-[#1B3469]/5 text-[#1B3469]/70">
                      Minhas demandas
                    </Link>
                    <Link href="/propostas" className="text-sm px-3 py-2 hover:bg-[#1B3469]/5 text-[#1B3469]/70">
                      Minhas propostas
                    </Link>
                    <Link href="/ajuda" data-tour="ajuda" className="text-sm px-3 py-2 hover:bg-[#1B3469]/5 text-[#1B3469]/70 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      Central de ajuda
                    </Link>
                    <button
                      onClick={reopenTour}
                      className="text-sm px-3 py-2 hover:bg-[#1B3469]/5 text-[#1B3469]/70 text-left flex items-center gap-1.5 w-full"
                    >
                      <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                      Ver tour da plataforma
                    </button>
                    <div className="border-t border-[#1B3469]/10 my-1" />
                    <button
                      onClick={logout}
                      className="text-sm px-3 py-2 hover:bg-[#1B3469]/5 text-red-500 text-left flex items-center gap-2 w-full"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" /> Sair
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/login">
              <Button
                variant="default"
                className="bg-[#1B3469] hover:bg-[#1B3469]/90 text-white rounded-none px-6 text-sm font-semibold"
              >
                Entrar
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-[#1B3469]"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-[#F2F0EB] z-40 flex flex-col border-t border-[#1B3469]/10 overflow-y-auto">
          <nav className="flex flex-col px-6 py-6 gap-1" aria-label="Navegação mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-lg font-semibold py-3 border-b border-[#1B3469]/10 text-[#1B3469]"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && user ? (
              <>
                {(user.role === "gestor" || user.role === "administrador") && (
                  <Link href="/admin" className="text-lg font-semibold py-3 border-b border-[#1B3469]/10 text-[#5B9A6E] flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5" aria-hidden="true" /> Painel da gestão
                  </Link>
                )}
                <Link href="/meu-painel" className="text-lg font-semibold py-3 border-b border-[#1B3469]/10 text-[#1B3469] flex items-center gap-2">
                  <UserIcon className="w-5 h-5" aria-hidden="true" /> Meu painel
                </Link>
                <button
                  onClick={logout}
                  className="text-lg font-semibold py-3 text-red-500 text-left flex items-center gap-2"
                >
                  <LogOut className="w-5 h-5" aria-hidden="true" /> Sair
                </button>
              </>
            ) : (
              <div className="mt-6">
                <Link href="/login">
                  <Button className="w-full bg-[#1B3469] hover:bg-[#1B3469]/90 text-white rounded-none py-6 text-base font-bold">
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
