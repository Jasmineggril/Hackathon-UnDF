import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleConsent = (level: "all" | "necessary" | "none") => {
    localStorage.setItem("cookie-consent", level);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-50 p-4 md:p-6 animate-in slide-in-from-bottom-full duration-500">
      <div className="container mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="max-w-2xl">
          <h4 className="font-semibold text-foreground mb-1">Privacidade e Cookies</h4>
          <p className="text-sm text-muted-foreground text-balance">
            Utilizamos cookies estritamente necessários para o funcionamento da plataforma Voz UnDF e cookies analíticos para melhorar sua experiência. Nenhuma informação é utilizada para fins publicitários.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" onClick={() => handleConsent("none")}>
            Recusar
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleConsent("necessary")}>
            Aceitar necessários
          </Button>
          <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90" onClick={() => handleConsent("all")}>
            Aceitar todos
          </Button>
        </div>
      </div>
    </div>
  );
}
