
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-300 py-8 px-4 border-t-4 border-accent">
      <div className="container mx-auto max-w-4xl text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="h-px w-12 bg-slate-700"></span>
          <span className="text-sm font-semibold uppercase tracking-widest text-slate-500">Sobre</span>
          <span className="h-px w-12 bg-slate-700"></span>
        </div>

        <p className="text-sm leading-relaxed max-w-2xl mx-auto">
          O <strong>Escuta DF</strong> é uma iniciativa para tornar a ouvidoria pública acessível a todos os cidadãos, independente de suas limitações.
        </p>

        <div className="pt-6 mt-6 border-t border-slate-800 flex flex-col items-center gap-2">
          <div className="grid md:grid-cols-2 gap-8 w-full text-left mb-6">
            <div>
              <h4 className="font-bold text-white mb-2">Contato</h4>
              <p className="text-xs text-slate-400">Ouvidoria Geral do Distrito Federal</p>
              <p className="text-xs text-slate-400">Telefone: 162</p>
              <p className="text-xs text-slate-400">E-mail: ouvidoria@df.gov.br</p>
            </div>
            <div className="text-right">
              <h4 className="font-bold text-white mb-2">Endereço</h4>
              <p className="text-xs text-slate-400">Anexo do Palácio do Buriti, 10º Andar, Sala 1004</p>
              <p className="text-xs text-slate-400">Zona Cívico-Administrativa</p>
              <p className="text-xs text-slate-400">Brasília - DF, CEP: 70075-900</p>
            </div>
          </div>

          <div className="flex gap-6 text-xs text-blue-400 font-semibold mb-4">
            <Link href="/privacidade" className="hover:underline">Política de Privacidade</Link>
            <Link href="/termos" className="hover:underline">Termos de Uso</Link>
            <Link href="/lgpd" className="hover:underline">Lei Geral de Proteção de Dados (LGPD)</Link>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            Desenvolvido por Jasmine de Sá Araújo
          </p>
          <p className="text-[10px] text-slate-600 flex items-center gap-1">
            Estudante de Engenharia de Software (4º semestre) da UNDF
          </p>
        </div>
      </div>
    </footer>
  );
}
