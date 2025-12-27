import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Copy, 
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Home,
  Car,
  Coffee,
  Heart,
  Target,
  Sparkles,
  ChevronRight,
  CalendarDays,
  CalendarCheck,
  Package,
  Film,
  CreditCard,
  Lightbulb,
  PenLine
} from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { useMonth } from "@/lib/month-context";
import { Link } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const CATEGORY_ICONS: Record<string, any> = {
  "Moradia": Home,
  "Mercado": ShoppingCart,
  "Transporte": Car,
  "Saúde": Heart,
  "Lazer": Film,
  "Compras Online": Package,
  "Outros": CreditCard
};

const CATEGORY_COLORS: Record<string, string> = {
  "Mercado": "#22c55e",
  "Moradia": "#f97316",
  "Transporte": "#3b82f6",
  "Lazer": "#a855f7",
  "Saúde": "#ef4444",
  "Compras Online": "#ec4899",
  "Outros": "#6b7280"
};

interface CategorySummary {
  category: string;
  label: string;
  currentAmount: number;
  targetAmount: number;
  status: "within" | "exceeded" | "warning";
}

export default function RitualsPage() {
  const { month, formatMonth } = useMonth();
  const { toast } = useToast();
  const [ritualType, setRitualType] = useState<"weekly" | "monthly">("weekly");
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [filter, setFilter] = useState("all");
  const [weeklyNotes, setWeeklyNotes] = useState("");
  const [weeklyGoals, setWeeklyGoals] = useState<string[]>([]);

  const { data: dashboard } = useQuery({
    queryKey: ["dashboard", month],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard?month=${month}`);
      if (!res.ok) return null;
      return res.json();
    }
  });

  const { data: previousMonth } = useQuery({
    queryKey: ["dashboard-previous", getPreviousMonth(month)],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard?month=${getPreviousMonth(month)}`);
      if (!res.ok) return null;
      return res.json();
    }
  });

  function getPreviousMonth(m: string) {
    const [year, mon] = m.split("-").map(Number);
    const d = new Date(year, mon - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  function getNextMonth(m: string) {
    const [year, mon] = m.split("-").map(Number);
    const d = new Date(year, mon, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  const previousMonthName = formatMonth(getPreviousMonth(month));
  const currentMonthName = formatMonth(month);
  const nextMonthName = formatMonth(getNextMonth(month));

  const categorySummaries: CategorySummary[] = (dashboard?.spentByCategory || []).map((cat: any) => {
    const prevCat = previousMonth?.spentByCategory?.find((c: any) => c.category === cat.category);
    const target = prevCat?.amount || cat.amount;
    const percentage = target > 0 ? (cat.amount / target) * 100 : 0;
    
    return {
      category: cat.category,
      label: cat.category === "Mercado" ? "Essenciais" : cat.category === "Lazer" ? "Lazer" : "Essenciais",
      currentAmount: cat.amount,
      targetAmount: target,
      status: percentage > 100 ? "exceeded" : percentage > 80 ? "warning" : "within"
    };
  });

  const totalPlanned = categorySummaries.reduce((sum, c) => sum + c.targetAmount, 0);
  const totalCurrentSpent = categorySummaries.reduce((sum, c) => sum + c.currentAmount, 0);
  const changeFromPrevious = previousMonth?.totalSpent 
    ? Math.round(((totalCurrentSpent - previousMonth.totalSpent) / previousMonth.totalSpent) * 100)
    : 0;

  const copyPreviousGoals = () => {
    toast({ title: `Metas de ${previousMonthName} copiadas para ${currentMonthName}` });
  };

  const startWeeklyRitual = () => {
    setRitualType("weekly");
    setCurrentStep(1);
  };

  const startMonthlyRitual = () => {
    setRitualType("monthly");
    setCurrentStep(1);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const filters = [
    { id: "all", label: "Todas" },
    { id: "essenciais", label: "Essenciais" },
    { id: "lifestyle", label: "Estilo de Vida" },
    { id: "investments", label: "Investimentos" }
  ];

  const today = new Date();
  const weekStart = startOfWeek(today, { locale: ptBR });
  const weekEnd = endOfWeek(today, { locale: ptBR });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Rituais Financeiros</h1>
          <p className="text-muted-foreground mt-1">
            Revisões guiadas para manter suas finanças sob controle
          </p>
        </div>

        <Tabs value={ritualType} onValueChange={(v) => setRitualType(v as any)} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="weekly" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              Semanal
            </TabsTrigger>
            <TabsTrigger value="monthly" className="gap-2">
              <CalendarCheck className="h-4 w-4" />
              Mensal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="mt-6 space-y-6">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <CalendarDays className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-blue-900">Revisão Semanal</h3>
                      <p className="text-blue-700/80 text-sm mt-0.5">
                        Semana de {format(weekStart, "dd", { locale: ptBR })} a {format(weekEnd, "dd 'de' MMMM", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" onClick={startWeeklyRitual}>
                    <Sparkles className="h-4 w-4" />
                    Iniciar Revisão
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gasto esta Semana</span>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {(totalCurrentSpent * 0.25).toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Média diária: € {((totalCurrentSpent * 0.25) / 7).toFixed(0)}</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Transações</span>
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">23</p>
                  <p className="text-xs text-muted-foreground mt-1">14 categorizadas automaticamente</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Objetivo</span>
                    <Target className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">82%</p>
                  <p className="text-xs text-muted-foreground mt-1">do orçamento semanal</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  Reflexões da Semana
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    O que funcionou bem esta semana?
                  </label>
                  <textarea 
                    className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-primary"
                    rows={3}
                    placeholder="Ex: Consegui evitar compras por impulso..."
                    value={weeklyNotes}
                    onChange={(e) => setWeeklyNotes(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Objetivo para próxima semana
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Ex: Limitar delivery a 2x por semana"
                    />
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="mt-6 space-y-6">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-end">
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Passo {currentStep} de {totalSteps}: {currentStep === 1 ? "Revisão" : currentStep === 2 ? "Análise" : currentStep === 3 ? "Planejamento" : "Confirmação"}
                </p>
                <span className="text-xs text-muted-foreground">{Math.round((currentStep / totalSteps) * 100)}% Concluído</span>
              </div>
              <Progress value={(currentStep / totalSteps) * 100} className="h-3" />
            </div>

            <Card className="bg-gradient-to-r from-muted/50 to-primary/5 border-0 shadow-sm">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Quer manter o ritmo?</h3>
                    <p className="text-muted-foreground mt-1">
                      Copie as metas de {previousMonthName} e ajuste apenas o necessário.
                    </p>
                  </div>
                  <Button 
                    className="bg-primary hover:bg-primary/90 gap-2"
                    onClick={copyPreviousGoals}
                  >
                    <Copy className="h-4 w-4" />
                    Copiar Metas de {previousMonthName}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {filters.map(f => (
                <Button
                  key={f.id}
                  variant={filter === f.id ? "default" : "outline"}
                  className={cn(
                    "whitespace-nowrap",
                    filter === f.id ? "bg-primary hover:bg-primary/90" : ""
                  )}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-bold text-foreground">{previousMonthName} (Realizado)</h3>
                </div>

                {categorySummaries.slice(0, 4).map(cat => {
                  const Icon = CATEGORY_ICONS[cat.category] || CreditCard;
                  const color = CATEGORY_COLORS[cat.category] || "#6b7280";
                  const percentage = cat.targetAmount > 0 ? Math.round((cat.currentAmount / cat.targetAmount) * 100) : 0;
                  
                  return (
                    <Card key={cat.category} className="bg-white border-0 shadow-sm">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-xl flex items-center justify-center"
                              style={{ backgroundColor: `${color}15` }}
                            >
                              <Icon className="h-5 w-5" style={{ color }} />
                            </div>
                            <div>
                              <p className="font-bold text-foreground">{cat.category}</p>
                              <p className="text-xs text-muted-foreground">{cat.label}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={cn(
                              "font-bold",
                              cat.status === "exceeded" ? "text-rose-600" : "text-foreground"
                            )}>
                              {cat.currentAmount.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              de {cat.targetAmount.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all",
                                cat.status === "exceeded" ? "bg-rose-500" : cat.status === "warning" ? "bg-amber-500" : "bg-primary"
                              )}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <p className={cn(
                            "text-[10px] font-bold text-right",
                            cat.status === "exceeded" ? "text-rose-500" : cat.status === "within" ? "text-primary" : "text-amber-500"
                          )}>
                            {cat.status === "exceeded" 
                              ? `Ultrapassou ${(cat.currentAmount - cat.targetAmount).toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}`
                              : cat.status === "within" 
                                ? "Dentro da meta!"
                                : "Atenção"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold text-foreground">{currentMonthName} (Planejado)</h3>
                </div>

                {categorySummaries.slice(0, 4).map(cat => {
                  const isAboveAverage = cat.status === "exceeded";
                  
                  return (
                    <Card key={`planned-${cat.category}`} className="bg-white border-0 shadow-md">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Meta para {cat.category}
                          </label>
                          {isAboveAverage && (
                            <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                              Sugestão: Aumentar?
                            </Badge>
                          )}
                        </div>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">€</span>
                          <input 
                            type="text"
                            className="w-full pl-10 pr-4 py-3 bg-muted/30 border-0 rounded-lg text-lg font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                            defaultValue={cat.targetAmount.toFixed(2).replace(".", ",")}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Total Planejado para {currentMonthName}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-3xl font-black text-foreground">
                        {totalPlanned.toLocaleString("pt-BR", { style: "currency", currency: "EUR" })}
                      </span>
                      {changeFromPrevious !== 0 && (
                        <Badge variant="secondary" className={cn(
                          "gap-1",
                          changeFromPrevious > 0 ? "bg-rose-100 text-rose-700" : "bg-green-100 text-green-700"
                        )}>
                          {changeFromPrevious > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {changeFromPrevious > 0 ? "+" : ""}{changeFromPrevious}% vs {previousMonthName}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="gap-2" onClick={prevStep} disabled={currentStep === 1}>
                      Voltar
                    </Button>
                    {currentStep < totalSteps ? (
                      <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={nextStep}>
                        Próximo
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Link href="/goals">
                        <Button className="bg-primary hover:bg-primary/90 gap-2">
                          Confirmar
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function Plus(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14"/><path d="M12 5v14"/>
    </svg>
  );
}
