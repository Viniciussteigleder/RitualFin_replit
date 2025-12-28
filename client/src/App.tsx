import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MonthProvider } from "@/lib/month-context";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import UploadsPage from "@/pages/uploads";
import ConfirmPage from "@/pages/confirm";
import RulesPage from "@/pages/rules";
import SettingsPage from "@/pages/settings";
import CalendarPage from "@/pages/calendar";
import EventDetailPage from "@/pages/event-detail";
import GoalsPage from "@/pages/goals";
import RitualsPage from "@/pages/rituals";
import BudgetsPage from "@/pages/budgets";
import AIKeywordsPage from "@/pages/ai-keywords";
import AccountsPage from "@/pages/accounts";
import TransactionsPage from "@/pages/transactions";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/calendar" component={CalendarPage} />
      <Route path="/calendar/:id" component={EventDetailPage} />
      <Route path="/goals" component={GoalsPage} />
      <Route path="/budgets" component={BudgetsPage} />
      <Route path="/rituals" component={RitualsPage} />
      <Route path="/uploads" component={UploadsPage} />
      <Route path="/confirm" component={ConfirmPage} />
      <Route path="/transactions" component={TransactionsPage} />
      <Route path="/rules" component={RulesPage} />
      <Route path="/accounts" component={AccountsPage} />
      <Route path="/ai-keywords" component={AIKeywordsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MonthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </MonthProvider>
    </QueryClientProvider>
  );
}

export default App;
