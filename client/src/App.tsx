import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThirdwebProvider } from "thirdweb/react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Videos from "@/pages/Videos";
import DAO from "@/pages/DAO";
import Marketplace from "@/pages/Marketplace";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/videos" component={Videos} />
        <Route path="/dao" component={DAO} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ThirdwebProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="dark">
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ThirdwebProvider>
  );
}

export default App;
