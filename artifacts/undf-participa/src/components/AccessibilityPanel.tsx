import { useState, useEffect } from "react";
import { Eye, X, Type, Contrast, CircleDashed, Link as LinkIcon, BookOpen, Focus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccessibilityState {
  fontSize: number;
  highContrast: boolean;
  grayscale: boolean;
  highlightLinks: boolean;
  focusMode: boolean;
  readMode: boolean;
}

export default function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilityState>({
    fontSize: 100,
    highContrast: false,
    grayscale: false,
    highlightLinks: false,
    focusMode: false,
    readMode: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem('undf-accessibility');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('undf-accessibility', JSON.stringify(settings));
    
    // Apply changes to document
    document.documentElement.style.fontSize = `${settings.fontSize}%`;
    
    const cl = document.documentElement.classList;
    settings.highContrast ? cl.add("alto-contraste") : cl.remove("alto-contraste");
    settings.grayscale ? cl.add("escala-cinza") : cl.remove("escala-cinza");
    settings.highlightLinks ? cl.add("destacar-links") : cl.remove("destacar-links");
    settings.focusMode ? cl.add("modo-foco") : cl.remove("modo-foco");
    settings.readMode ? cl.add("modo-leitura") : cl.remove("modo-leitura");

  }, [settings]);

  const toggleSetting = (key: keyof AccessibilityState) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] as boolean }));
  };

  const adjustFontSize = (amount: number) => {
    setSettings(prev => ({
      ...prev,
      fontSize: Math.max(80, Math.min(150, prev.fontSize + amount))
    }));
  };

  return (
    <>
      <Button
        data-tour="acessibilidade"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 rounded-full w-12 h-12 p-0 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
        aria-label="Opções de Acessibilidade"
        data-testid="button-accessibility"
      >
        <Eye className="w-6 h-6" />
      </Button>

      {isOpen && (
        <div className="fixed bottom-20 left-6 z-50 w-80 bg-card border rounded-lg shadow-xl p-4 data-[state=open]:animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-4 pb-2 border-b">
            <h3 className="font-semibold flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" /> Acessibilidade
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2 text-muted-foreground">Visual</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2 flex items-center justify-between bg-muted p-2 rounded-md">
                  <span className="text-sm flex items-center gap-2"><Type className="w-4 h-4"/> Texto</span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => adjustFontSize(-10)}>-</Button>
                    <span className="text-xs font-mono w-8 text-center">{settings.fontSize}%</span>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => adjustFontSize(10)}>+</Button>
                  </div>
                </div>
                
                <Button 
                  variant={settings.highContrast ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => toggleSetting("highContrast")}
                  className="justify-start text-xs"
                >
                  <Contrast className="w-3 h-3 mr-2" /> Alto Contraste
                </Button>
                <Button 
                  variant={settings.grayscale ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => toggleSetting("grayscale")}
                  className="justify-start text-xs"
                >
                  <CircleDashed className="w-3 h-3 mr-2" /> Tons de Cinza
                </Button>
                <Button 
                  variant={settings.highlightLinks ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => toggleSetting("highlightLinks")}
                  className="justify-start text-xs col-span-2"
                >
                  <LinkIcon className="w-3 h-3 mr-2" /> Destacar Links
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2 text-muted-foreground">Cognitiva</p>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={settings.focusMode ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => toggleSetting("focusMode")}
                  className="justify-start text-xs"
                >
                  <Focus className="w-3 h-3 mr-2" /> Foco (S/ Anim)
                </Button>
                <Button 
                  variant={settings.readMode ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => toggleSetting("readMode")}
                  className="justify-start text-xs"
                >
                  <BookOpen className="w-3 h-3 mr-2" /> Modo Leitura
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
