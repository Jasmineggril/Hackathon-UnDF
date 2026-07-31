import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { useAuth } from '@workspace/auth-web';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import AccessibilityPanel from '@/components/AccessibilityPanel';
import VLibrasWidget from '@/components/VLibrasWidget';
import CookieBanner from '@/components/CookieBanner';
import { DemoBanner } from '@/components/DemoBanner';
import { GuidedTour, TourProvider } from '@/components/GuidedTour';

import Home from '@/pages/home';
import Demands from '@/pages/demands';
import NewDemand from '@/pages/new-demand';
import ProtocolLookup from '@/pages/protocol-lookup';
import Proposals from '@/pages/proposals';
import NewProposal from '@/pages/new-proposal';
import Transparency from '@/pages/transparency';
import Ods16 from '@/pages/ods16';
import Admin from '@/pages/admin';
import About from '@/pages/about';
import Login from '@/pages/login';
import RecuperarSenha from '@/pages/recuperar-senha';
import RedefinirSenha from '@/pages/redefinir-senha';
import MeuPainel from '@/pages/meu-painel';
import Ajuda from '@/pages/ajuda';
import Cadastro from '@/pages/cadastro';
import Governanca from '@/pages/governanca';
import Termos from '@/pages/termos';
import Privacidade from '@/pages/privacidade';
import Acessibilidade from '@/pages/acessibilidade';
import Demo from '@/pages/demo';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Header />
      <main className="flex-1 bg-background">
        {children}
      </main>
      <Footer />
    </div>
  );
}

/** Tour only shows for authenticated users */
function AuthenticatedTour() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading || !isAuthenticated) return null;
  return <GuidedTour />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/recuperar-senha" component={RecuperarSenha} />
      <Route path="/redefinir-senha" component={RedefinirSenha} />
      <Route path="/demandas/nova" component={NewDemand} />
      <Route path="/demandas" component={Demands} />
      <Route path="/protocolo" component={ProtocolLookup} />
      <Route path="/propostas" component={Proposals} />
      <Route path="/propostas/nova" component={NewProposal} />
      <Route path="/transparencia" component={Transparency} />
      <Route path="/ods16" component={Ods16} />
      <Route path="/admin" component={Admin} />
      <Route path="/sobre" component={About} />
      <Route path="/meu-painel" component={MeuPainel} />
      <Route path="/ajuda" component={Ajuda} />
      <Route path="/cadastro" component={Cadastro} />
      <Route path="/governanca" component={Governanca} />
      <Route path="/termos" component={Termos} />
      <Route path="/privacidade" component={Privacidade} />
      <Route path="/acessibilidade" component={Acessibilidade} />
      <Route path="/demo" component={Demo} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <TourProvider>
            {DEMO_MODE && <DemoBanner visible />}
            <Layout>
              <Router />
            </Layout>
            <AccessibilityPanel />
            <VLibrasWidget />
            <CookieBanner />
            <AuthenticatedTour />
          </TourProvider>
        </WouterRouter>
        <Toaster position="top-right" richColors />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
