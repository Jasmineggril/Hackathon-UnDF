import { useEffect } from "react";

export default function VLibrasWidget() {
  useEffect(() => {
    // Only load if not already loaded
    if (!document.getElementById("vlibras-script")) {
      const script = document.createElement("script");
      script.id = "vlibras-script";
      script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
      script.async = true;
      script.onload = () => {
        // @ts-ignore - VLibras is injected globally
        if (window.VLibras) {
          // @ts-ignore
          new window.VLibras.Widget("https://vlibras.gov.br/app");
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const props = (attrs: Record<string, string>) => attrs as any;
  return (
    <div data-tour="libras" {...props({ vw: "true" })} className="enabled">
      <div {...props({ "vw-access-button": "true" })} className="active"></div>
      <div {...props({ "vw-plugin-wrapper": "true" })}>
        <div className="vw-plugin-top-wrapper"></div>
      </div>
    </div>
  );
}
