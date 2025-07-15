import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import HomePage from "@/pages/home";
import MapPage from "@/pages/map";
import AddTreePage from "@/pages/add-tree";
import TreeDataPage from "@/pages/tree-data";
import StatisticsPage from "@/pages/statistics";
import MyPage from "@/pages/my-page";
import Navigation from "@/components/navigation";
import LoginPage from "@/pages/login";
import LogoutPage from "@/pages/logout";


function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={LandingPage} />
      ) : (
        <>
          <Route path="/" component={HomePage} />
          <Route path="/map" component={MapPage} />
          <Route path="/add" component={AddTreePage} />
          <Route path="/data" component={TreeDataPage} />
          <Route path="/stats" component={StatisticsPage} />
          <Route path="/me" component={MyPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/logout" component={LogoutPage} />

        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Navigation />
          <main className="pb-20 md:pb-0">
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;


