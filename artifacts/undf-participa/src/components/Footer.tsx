import { Link } from "wouter";
import logoPath from "@assets/Gemini_Generated_Image_lkejrrlkejrrlkej_1785079924059.png";

export function Footer() {
  return (
    <footer className="bg-[#F2F0EB] border-t border-[#1B3469]/15 mt-auto">
      <div className="px-6 md:px-12 py-16">
        {/* top row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-[#1B3469]/10">
          <div className="md:col-span-5">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <img src={logoPath} alt="Voz UnDF" className="h-10 w-auto object-contain opacity-80 grayscale" />
              <span
                className="font-bold text-base text-[#1B3469]"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Voz UnDF
              </span>
            </Link>
            <p className="text-[#1B3469]/50 text-sm max-w-xs leading-relaxed">
              Sua voz participa. A Universidade transforma.
            </p>
            <p className="text-[#1B3469]/30 text-xs mt-4 leading-relaxed max-w-xs">
              Plataforma de participação e gestão colaborativa da Universidade do Distrito Federal.
            </p>
          </div>

          <div className="md:col-span-3 md:col-start-7">
            <h4
              className="font-bold text-[#1B3469] text-xs uppercase tracking-widest mb-4"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Plataforma
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Demandas", href: "/demandas" },
                { label: "Propostas", href: "/propostas" },
                { label: "Transparência", href: "/transparencia" },
                { label: "Protocolo", href: "/protocolo" },
                { label: "Sobre", href: "/sobre" },
                { label: "ODS 16", href: "/ods16" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#1B3469]/50 hover:text-[#1B3469] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4
              className="font-bold text-[#1B3469] text-xs uppercase tracking-widest mb-4"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Legal
            </h4>
            <ul className="space-y-2.5">
              {["Privacidade", "Termos de Uso", "Acessibilidade", "Cookies", "Governança"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-[#1B3469]/50 hover:text-[#1B3469] transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* bottom row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-8">
          <p className="text-xs text-[#1B3469]/35">
            © {new Date().getFullYear()} Universidade do Distrito Federal — Voz UnDF
          </p>
          <p className="text-xs text-[#1B3469]/35">
            Feito para a comunidade universitária.
          </p>
        </div>
      </div>
    </footer>
  );
}
