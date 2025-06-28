import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThirdwebProvider } from "thirdweb/react";
import { client, chilizSpicy } from "@/lib/thirdweb";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Home from "@/pages/Home";
import Videos from "@/pages/Videos";
import DAO from "@/pages/DAO";
import Marketplace from "@/pages/Marketplace";
import Courses from "@/pages/Courses";
import AdminTestPanel from "@/pages/AdminTestPanel";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/betting" component={Home} />
        <Route path="/courses" component={Courses} />
        <Route path="/videos" component={Videos} />
        <Route path="/dao" component={DAO} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/admin" component={AdminTestPanel} />
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
