import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import CreateReport from "@/pages/CreateReport";
import Success from "@/pages/Success";
import StatusCheck from "@/pages/StatusCheck";
import About from "@/pages/About";
import Transparency from "@/pages/Transparency";
import FAQ from "@/pages/FAQ";
import LoginPage from "@/pages/Login";
import RegisterPage from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Legal from "@/pages/Legal"; // Importando a página Legal
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useEffect } from "react";
import { checkSupabaseConnection } from "./lib/supabase";

// Wrapper de layout básico para garantir consistência no Cabeçalho/Rodapé
// Aqui a gente define a estrutura padrão de todas as páginas
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      {/* O Header fica fixo no topo */}
      <Header />
      {/* O main ocupa o espaço que sobrar (flex-1) */}
      <main className="flex-1">
        {children}
      </main>
      {/* O rodapé fica sempre no final */}
      <Footer />
    </div>
  );
}

// Configuração das rotas da aplicação usando a lib 'wouter'
// Cada Route define um caminho URL e qual componente renderizar
function Router() {
  return (
    <Switch>
      {/* Rota da Página Inicial */}
      <Route path="/">
        <Layout><Home /></Layout>
      </Route>

      {/* Rota de Login (Página Inteira, sem Header/Footer padrão) */}
      <Route path="/auth" component={LoginPage} />
      <Route path="/cadastro" component={RegisterPage} />

      {/* Rota do Dashboard (Área Logada - tem Header próprio mas usa Layout para manter estrutura se quiser) */}
      {/* O Dashboard tem estrutura própria, então não usa Layout */}
      <Route path="/dashboard" component={Dashboard} />

      {/* Rota para Criar Nova Manifestação */}
      <Route path="/nova-manifestacao">
        <Layout><CreateReport /></Layout>
      </Route>
      {/* Rota de Sucesso após envio */}
      <Route path="/sucesso">
        <Layout><Success /></Layout>
      </Route>
      {/* Rota para Consultar Status do Protocolo */}
      <Route path="/consultar">
        <Layout><StatusCheck /></Layout>
      </Route>
      {/* Rota Sobre Nós */}
      <Route path="/sobre">
        <Layout><About /></Layout>
      </Route>
      {/* Rota do Portal da Transparência */}
      <Route path="/transparencia">
        <Layout><Transparency /></Layout>
      </Route>
      {/* Rota de Perguntas Frequentes */}
      <Route path="/faq">
        <Layout><FAQ /></Layout>
      </Route>

      {/* Rotas Legais e de Transparência */}
      <Route path="/privacidade">
        <Layout><Legal /></Layout>
      </Route>
      <Route path="/termos">
        <Layout><Legal /></Layout>
      </Route>
      <Route path="/lgpd">
        <Layout><Legal /></Layout>
      </Route>

      {/* Rota 404 para qualquer outro caminho não definido */}
      <Route>
        <Layout><NotFound /></Layout>
      </Route>
    </Switch>
  );
}

// Componente Principal da Aplicação
// Aqui configuramos os Providers globais (Query, Tooltip, Toast)
function App() {
  // Verifica conexão com Supabase ao iniciar
  useEffect(() => {
    checkSupabaseConnection();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

