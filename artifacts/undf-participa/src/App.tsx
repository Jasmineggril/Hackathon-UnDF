import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

// Pages (we will create these)
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
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/demandas" component={Demands} />
      <Route path="/demandas/nova" component={NewDemand} />
      <Route path="/protocolo" component={ProtocolLookup} />
      <Route path="/propostas" component={Proposals} />
      <Route path="/propostas/nova" component={NewProposal} />
      <Route path="/transparencia" component={Transparency} />
      <Route path="/ods16" component={Ods16} />
      <Route path="/admin" component={Admin} />
      <Route path="/sobre" component={About} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Layout>
            <Router />
          </Layout>
        </WouterRouter>
        <Toaster position="top-right" richColors />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
