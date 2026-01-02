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
import { startOfWeek, endOfWeek } from "date-fns";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useMonth } from "@/lib/month-context";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ritualsApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { ritualsCopy, t as translate } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";

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

// Helper to get ISO week number
function getISOWeek(date: Date): string {
  const year = date.getFullYear();
  const jan4 = new Date(year, 0, 4);
  const diff = date.getTime() - jan4.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const weekNum = Math.ceil((diff / oneWeek + jan4.getDay() / 7));
  return `${year}-W${String(weekNum).padStart(2, "0")}`;
}

export default function RitualsPage() {
  const { month, formatMonth } = useMonth();
  const { toast } = useToast();
  const locale = useLocale();
  const [location, setLocation] = useLocation();
  const [ritualType, setRitualType] = useState<"weekly" | "monthly">("weekly");
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [filter, setFilter] = useState("all");
  const [weeklyNotes, setWeeklyNotes] = useState("");
  const currencyFormatter = new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" });
  const dateFormatter = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "long", year: "numeric" });
  const timeFormatter = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });
  const dayFormatter = new Intl.DateTimeFormat(locale, { day: "2-digit" });
  const dayMonthFormatter = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "long" });
  const formatMessage = (template: string, vars: Record<string, string | number>) =>
    Object.entries(vars).reduce((result, [key, value]) => result.replace(`{${key}}`, String(value)), template);

  useEffect(() => {
    const search = location.split("?")[1] || "";
    const nextType = new URLSearchParams(search).get("type");
    if (nextType === "weekly" || nextType === "monthly") {
      setRitualType(nextType);
    }
  }, [location]);

  useEffect(() => {
    const search = location.split("?")[1] || "";
    const currentType = new URLSearchParams(search).get("type");
    if (currentType !== ritualType) {
      setLocation(`/rituals?type=${ritualType}`);
    }
  }, [location, ritualType, setLocation]);

  const today = new Date();
  const currentWeek = getISOWeek(today);
  const currentPeriod = ritualType === "weekly" ? currentWeek : month;

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

  // Fetch existing rituals for current period
  const { data: ritualsData } = useQuery({
    queryKey: ["rituals", ritualType, currentPeriod],
    queryFn: () => ritualsApi.list(ritualType, currentPeriod),
  });

  const currentRitual = ritualsData?.rituals?.[0];
  const isCompleted = currentRitual?.completedAt !== null;

  // Create or update ritual
  const startRitual = useMutation({
    mutationFn: async () => {
      if (currentRitual) {
        return currentRitual;
      }
      return ritualsApi.create({
        type: ritualType,
        period: currentPeriod,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rituals", ritualType, currentPeriod] });
      toast({
        title: ritualType === "weekly"
          ? translate(locale, ritualsCopy.toastWeeklyStarted)
          : translate(locale, ritualsCopy.toastMonthlyStarted),
      });
    },
  });

  // Complete ritual with notes
  const completeRitual = useMutation({
    mutationFn: async (notes: string) => {
      if (!currentRitual?.id) {
        throw new Error("No ritual to complete");
      }
      return ritualsApi.complete(currentRitual.id, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rituals", ritualType, currentPeriod] });
      toast({
        title: translate(locale, ritualsCopy.toastCompletedTitle),
        description: translate(locale, ritualsCopy.toastCompletedBody),
      });
      setWeeklyNotes("");
    },
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
    toast({
      title: formatMessage(translate(locale, ritualsCopy.toastCopyGoals), {
        prev: previousMonthName,
        next: currentMonthName
      })
    });
  };

  const startWeeklyRitual = () => {
    setRitualType("weekly");
    setCurrentStep(1);
    startRitual.mutate();
  };

  const startMonthlyRitual = () => {
    setRitualType("monthly");
    setCurrentStep(1);
    startRitual.mutate();
  };

  const saveWeeklyNotes = () => {
    if (weeklyNotes.trim()) {
      completeRitual.mutate(weeklyNotes);
    }
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
    { id: "all", label: translate(locale, ritualsCopy.filterAll) },
    { id: "essenciais", label: translate(locale, ritualsCopy.filterEssentials) },
    { id: "lifestyle", label: translate(locale, ritualsCopy.filterLifestyle) },
    { id: "investments", label: translate(locale, ritualsCopy.filterInvestments) }
  ];

  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{translate(locale, ritualsCopy.title)}</h1>
          <p className="text-muted-foreground mt-1">
            {translate(locale, ritualsCopy.subtitle)}
          </p>
        </div>

        <Tabs value={ritualType} onValueChange={(v) => setRitualType(v as any)} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="weekly" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              {translate(locale, ritualsCopy.tabWeekly)}
            </TabsTrigger>
            <TabsTrigger value="monthly" className="gap-2">
              <CalendarCheck className="h-4 w-4" />
              {translate(locale, ritualsCopy.tabMonthly)}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="mt-6 space-y-6">
            <Card className={cn(
              "bg-gradient-to-r border-blue-200/50",
              isCompleted ? "from-green-50 to-emerald-50" : "from-blue-50 to-indigo-50"
            )}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                      isCompleted ? "bg-green-100" : "bg-blue-100"
                    )}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <CalendarDays className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3 className={cn(
                        "font-bold text-lg",
                        isCompleted ? "text-green-900" : "text-blue-900"
                      )}>
                        {isCompleted ? translate(locale, ritualsCopy.weeklyDone) : translate(locale, ritualsCopy.weeklyTitle)}
                      </h3>
                      <p className={cn(
                        "text-sm mt-0.5",
                        isCompleted ? "text-green-700/80" : "text-blue-700/80"
                      )}>
                        {formatMessage(translate(locale, ritualsCopy.weekRange), {
                          start: dayFormatter.format(weekStart),
                          end: dayMonthFormatter.format(weekEnd)
                        })}
                      </p>
                    </div>
                  </div>
                  {!isCompleted && (
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" onClick={startWeeklyRitual}>
                      <Sparkles className="h-4 w-4" />
                      {translate(locale, ritualsCopy.startReview)}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{translate(locale, ritualsCopy.weeklySpend)}</span>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {currencyFormatter.format(totalCurrentSpent * 0.25)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatMessage(translate(locale, ritualsCopy.dailyAverage), {
                      amount: currencyFormatter.format((totalCurrentSpent * 0.25) / 7)
                    })}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{translate(locale, ritualsCopy.weeklyTransactions)}</span>
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">23</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatMessage(translate(locale, ritualsCopy.weeklyAutoCategorized), { count: 14 })}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{translate(locale, ritualsCopy.weeklyGoal)}</span>
                    <Target className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">82%</p>
                  <p className="text-xs text-muted-foreground mt-1">{translate(locale, ritualsCopy.weeklyBudget)}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  {translate(locale, ritualsCopy.reflectionsTitle)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    {translate(locale, ritualsCopy.reflectionPrompt)}
                  </label>
                  <textarea
                    className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-primary"
                    rows={3}
                    placeholder={translate(locale, ritualsCopy.reflectionPlaceholder)}
                    value={isCompleted && currentRitual?.notes ? currentRitual.notes : weeklyNotes}
                    onChange={(e) => setWeeklyNotes(e.target.value)}
                    disabled={isCompleted}
                  />
                  {isCompleted && currentRitual?.notes && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatMessage(translate(locale, ritualsCopy.completedAt), {
                        date: `${dateFormatter.format(new Date(currentRitual.completedAt!))} ${timeFormatter.format(new Date(currentRitual.completedAt!))}`
                      })}
                    </p>
                  )}
                </div>
                {!isCompleted && (
                  <Button
                    className="bg-primary hover:bg-primary/90 w-full gap-2"
                    onClick={saveWeeklyNotes}
                    disabled={!weeklyNotes.trim() || completeRitual.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {completeRitual.isPending ? translate(locale, ritualsCopy.saving) : translate(locale, ritualsCopy.completeReview)}
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="mt-6 space-y-6">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-end">
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {formatMessage(translate(locale, ritualsCopy.stepLabel), {
                    step: currentStep,
                    total: totalSteps,
                    label:
                      currentStep === 1
                        ? translate(locale, ritualsCopy.stepReview)
                        : currentStep === 2
                          ? translate(locale, ritualsCopy.stepAnalysis)
                          : currentStep === 3
                            ? translate(locale, ritualsCopy.stepPlanning)
                            : translate(locale, ritualsCopy.stepConfirm)
                  })}
                </p>
                <span className="text-xs text-muted-foreground">
                  {formatMessage(translate(locale, ritualsCopy.percentComplete), {
                    percent: Math.round((currentStep / totalSteps) * 100)
                  })}
                </span>
              </div>
              <Progress value={(currentStep / totalSteps) * 100} className="h-3" />
            </div>

            <Card className="bg-gradient-to-r from-muted/50 to-primary/5 border-0 shadow-sm">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{translate(locale, ritualsCopy.keepRhythmTitle)}</h3>
                    <p className="text-muted-foreground mt-1">
                      {formatMessage(translate(locale, ritualsCopy.keepRhythmBody), { month: previousMonthName })}
                    </p>
                  </div>
                  <Button 
                    className="bg-primary hover:bg-primary/90 gap-2"
                    onClick={copyPreviousGoals}
                  >
                    <Copy className="h-4 w-4" />
                    {formatMessage(translate(locale, ritualsCopy.copyGoals), { month: previousMonthName })}
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
                  <h3 className="text-lg font-bold text-foreground">
                    {formatMessage(translate(locale, ritualsCopy.actualLabel), { month: previousMonthName })}
                  </h3>
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
                              {currencyFormatter.format(cat.currentAmount)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {currencyFormatter.format(cat.targetAmount)}
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
                              ? formatMessage(translate(locale, ritualsCopy.statusExceeded), {
                                amount: currencyFormatter.format(cat.currentAmount - cat.targetAmount)
                              })
                              : cat.status === "within" 
                                ? translate(locale, ritualsCopy.statusWithin)
                                : translate(locale, ritualsCopy.statusWarning)}
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
                  <h3 className="text-lg font-bold text-foreground">
                    {formatMessage(translate(locale, ritualsCopy.plannedLabel), { month: currentMonthName })}
                  </h3>
                </div>

                {categorySummaries.slice(0, 4).map(cat => {
                  const isAboveAverage = cat.status === "exceeded";
                  
                  return (
                    <Card key={`planned-${cat.category}`} className="bg-white border-0 shadow-md">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {formatMessage(translate(locale, ritualsCopy.plannedForCategory), { category: cat.category })}
                          </label>
                          {isAboveAverage && (
                            <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                              {translate(locale, ritualsCopy.suggestionIncrease)}
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
                      {formatMessage(translate(locale, ritualsCopy.plannedTotal), { month: currentMonthName })}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-3xl font-black text-foreground">
                        {currencyFormatter.format(totalPlanned)}
                      </span>
                      {changeFromPrevious !== 0 && (
                        <Badge variant="secondary" className={cn(
                          "gap-1",
                          changeFromPrevious > 0 ? "bg-rose-100 text-rose-700" : "bg-green-100 text-green-700"
                        )}>
                          {changeFromPrevious > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {changeFromPrevious > 0 ? "+" : ""}
                          {formatMessage(translate(locale, ritualsCopy.changeVs), {
                            value: changeFromPrevious,
                            month: previousMonthName
                          })}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="gap-2" onClick={prevStep} disabled={currentStep === 1}>
                      {translate(locale, ritualsCopy.back)}
                    </Button>
                    {currentStep < totalSteps ? (
                      <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={nextStep}>
                        {translate(locale, ritualsCopy.next)}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Link href="/goals">
                        <Button className="bg-primary hover:bg-primary/90 gap-2">
                          {translate(locale, ritualsCopy.confirm)}
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
