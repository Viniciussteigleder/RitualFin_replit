import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OnboardingModal } from "@/components/onboarding-modal";
import { 
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  Car,
  Home,
  Coffee,
  Loader2,
  Sparkles,
  AlertCircle,
  ChevronRight,
  Calendar,
  Clock,
  Lightbulb,
  MoreHorizontal,
  RefreshCw,
  Heart,
  Plane,
  Shirt,
  Smartphone,
  Utensils,
  Zap,
  Wifi,
  GraduationCap,
  Gift,
  Banknote,
  CreditCard,
  Package,
  Film,
  Music,
  Dumbbell,
  PiggyBank
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi, transactionsApi, accountsApi } from "@/lib/api";
import { getAccountIcon } from "@/lib/icons";
import { Link } from "wouter";
import { useMonth } from "@/lib/month-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { dashboardCopy, translateCategory, t } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";

const CATEGORY_ICONS: Record<string, any> = {
  "Moradia": Home,
  "Mercado": ShoppingCart,
  "Transporte": Car,
  "Lazer": Film,
  "Saúde": Heart,
  "Compras Online": Package,
  "Viagem": Plane,
  "Roupas": Shirt,
  "Tecnologia": Smartphone,
  "Alimentação": Utensils,
  "Energia": Zap,
  "Internet": Wifi,
  "Educação": GraduationCap,
  "Presentes": Gift,
  "Receitas": Banknote,
  "Streaming": Music,
  "Academia": Dumbbell,
  "Investimentos": PiggyBank,
  "Outros": CreditCard
};

const CATEGORY_COLORS: Record<string, string> = {
  "Mercado": "#22c55e",
  "Moradia": "#f97316",
  "Transporte": "#3b82f6",
  "Lazer": "#a855f7",
  "Saúde": "#ef4444",
  "Compras Online": "#ec4899",
  "Viagem": "#06b6d4",
  "Alimentação": "#84cc16",
  "Tecnologia": "#6366f1",
  "Educação": "#14b8a6",
  "Streaming": "#f43f5e",
  "Receitas": "#10b981",
  "Outros": "#6b7280",
  "Interno": "#475569"
};

interface Insight {
  id: string;
  type: "positive" | "warning" | "neutral";
  title: string;
  description: string;
  category?: string;
  percentage?: number;
}

const formatMessage = (template: string, vars: Record<string, string | number>) =>
  Object.entries(vars).reduce((result, [key, value]) => result.replace(`{${key}}`, String(value)), template);

export default function DashboardPage() {
  const locale = useLocale();
  const { month } = useMonth();
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const currencyFormatter = new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" });
  const dateTimeFormatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  const dayMonthTimeFormatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountsApi.list,
  });

  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ["dashboard", month],
    queryFn: () => dashboardApi.get(month),
  });

  const prevMonthStr = (() => {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  })();

  const { data: prevDashboard } = useQuery({
    queryKey: ["dashboard", prevMonthStr],
    queryFn: () => dashboardApi.get(prevMonthStr),
  });

  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ["transactions", month],
    queryFn: () => transactionsApi.list(month),
  });

  const { data: confirmQueue = [] } = useQuery({
    queryKey: ["confirm-queue"],
    queryFn: transactionsApi.confirmQueue,
  });

  const { data: lastUploads = [] } = useQuery({
    queryKey: ["last-uploads-by-account"],
    queryFn: async () => {
      const res = await fetch("/api/uploads/last-by-account");
      if (!res.ok) return [];
      return res.json();
    }
  });

  const { data: calendarEvents = [] } = useQuery({
    queryKey: ["calendar-events"],
    queryFn: async () => {
      const res = await fetch("/api/calendar-events");
      if (!res.ok) return [];
      return res.json();
    }
  });

  const pendingCount = confirmQueue.length;

  // Filter transactions by account
  const filteredTransactions = accountFilter === "all"
    ? transactions
    : transactions.filter((t: any) => t.accountId === accountFilter);

  const recentTransactions = filteredTransactions.slice(0, 5);

  const estimatedIncome = 8500;
  const spent = dashboard?.totalSpent || 0;
  const income = dashboard?.totalIncome || 0;
  
  const today = new Date();
  const [year, monthNum] = month.split("-").map(Number);
  const currentMonthDate = new Date(year, monthNum - 1, 1);
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const daysPassed = today.getMonth() === monthNum - 1 && today.getFullYear() === year ? today.getDate() : daysInMonth;
  const dailyAvg = daysPassed > 0 ? spent / daysPassed : 0;
  const projection = spent + dailyAvg * (daysInMonth - daysPassed);
  const daysRemaining = today.getMonth() === monthNum - 1 && today.getFullYear() === year ? daysInMonth - today.getDate() : 0;

  const upcomingCommitments = calendarEvents.filter((e: any) => e.isActive).slice(0, 3);
  const totalCommitted = upcomingCommitments.reduce((sum: number, e: any) => sum + e.amount, 0);
  const remaining = Math.max(0, estimatedIncome - spent);

  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];
    
    if (prevDashboard && dashboard) {
      dashboard.spentByCategory?.forEach((cat: any) => {
        const prevCat = prevDashboard.spentByCategory?.find((p: any) => p.category === cat.category);
        if (prevCat && prevCat.amount > 0) {
          const change = ((cat.amount - prevCat.amount) / prevCat.amount) * 100;
          if (isFinite(change)) {
            const categoryLabel = translateCategory(locale, cat.category);
            if (change < -10) {
              insights.push({
                id: `save-${cat.category}`,
                type: "positive",
                title: formatMessage(t(locale, dashboardCopy.insightSaveTitle), { category: categoryLabel }),
                description: formatMessage(t(locale, dashboardCopy.insightSaveDescription), {
                  percent: Math.abs(change).toFixed(0),
                  category: categoryLabel
                }),
                category: cat.category,
                percentage: Math.abs(change)
              });
            } else if (change > 20) {
              insights.push({
                id: `warn-${cat.category}`,
                type: "warning",
                title: formatMessage(t(locale, dashboardCopy.insightWarnTitle), { category: categoryLabel }),
                description: formatMessage(t(locale, dashboardCopy.insightWarnDescription), {
                  percent: change.toFixed(0),
                  category: categoryLabel
                }),
                category: cat.category,
                percentage: change
              });
            }
          }
        }
      });
    }

    if (daysRemaining <= 7 && daysRemaining > 0) {
      const projectedOverspend = projection - estimatedIncome;
      if (projectedOverspend > 0) {
        insights.push({
          id: "projection-warning",
          type: "warning",
          title: t(locale, dashboardCopy.projectionWarningTitle),
          description: formatMessage(t(locale, dashboardCopy.projectionWarningDescription), {
            amount: currencyFormatter.format(projectedOverspend)
          })
        });
      }
    }

    if (insights.length === 0) {
      insights.push({
        id: "default",
        type: "neutral",
        title: t(locale, dashboardCopy.defaultInsightTitle),
        description: t(locale, dashboardCopy.defaultInsightDescription)
      });
    }

    return insights.slice(0, 2);
  };

  const insights = generateInsights();
  const mainInsight = insights[0];

  if (dashboardLoading || txLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <>
      <OnboardingModal />
      <AppLayout>
        <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t(locale, dashboardCopy.title)}</h1>
            <p className="text-muted-foreground">
              {t(locale, dashboardCopy.subtitle)}
            </p>
          </div>
          <div className="w-full md:w-64">
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t(locale, dashboardCopy.accountFilterPlaceholder)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t(locale, dashboardCopy.accountFilterPlaceholder)}</SelectItem>
                {accounts.filter((a: any) => a.isActive).map((account: any) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">{t(locale, dashboardCopy.lastUpdateTitle)}</CardTitle>
              </div>
              <Link href="/uploads" className="text-xs font-bold text-primary hover:underline">
                {t(locale, dashboardCopy.viewAllUploads)}
              </Link>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['sparkasse', 'amex', 'miles-more'].map((accountType) => {
              const upload = lastUploads.find((u: any) => u.accountType === accountType);
              const accountInfo = getAccountIcon(accountType, locale);

              return (
                <div key={accountType} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${accountInfo.color}20` }}
                  >
                    <accountInfo.icon className="h-5 w-5" style={{ color: accountInfo.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{accountInfo.label}</p>
                    {upload ? (
                      <>
                        <p className="text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {dateTimeFormatter.format(new Date(upload.lastUploadDate))}
                        </p>
                        {upload.importedThrough && (
                          <p className="text-xs text-primary font-medium">
                            {formatMessage(t(locale, dashboardCopy.importedThrough), {
                              date: dateFormatter.format(new Date(upload.importedThrough))
                            })}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">{t(locale, dashboardCopy.noUpload)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white border-0 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wide mb-2">
                <TrendingUp className="h-5 w-5" />
                {t(locale, dashboardCopy.monthlyProjection)}
              </div>
              <p className="text-4xl lg:text-5xl font-black text-foreground tracking-tight">
                {currencyFormatter.format(projection)}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border">
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">{t(locale, dashboardCopy.remainingMonth)}</p>
                  <p className="text-primary font-bold flex items-center gap-1 text-xl">
                    <ArrowUpRight className="h-5 w-5" />
                    {currencyFormatter.format(remaining)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">{t(locale, dashboardCopy.alreadyCommitted)}</p>
                  <p className="text-rose-600 font-bold flex items-center gap-1 text-xl">
                    <ArrowDownRight className="h-5 w-5" />
                    {currencyFormatter.format(spent)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-sm uppercase tracking-wide">
                  <Calendar className="h-5 w-5" />
                  {t(locale, dashboardCopy.remainingCommitments)}
                </div>
                <Link href="/calendar">
                  <Button variant="ghost" size="sm" className="text-xs text-primary">
                    {t(locale, dashboardCopy.viewAll)}
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
              <p className="text-4xl lg:text-5xl font-black text-foreground tracking-tight">
                {currencyFormatter.format(totalCommitted)}
              </p>
              
              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border">
                {upcomingCommitments.length > 0 ? (
                  <>
                    <div className="flex gap-1">
                      {upcomingCommitments.map((event: any) => {
                        const Icon = CATEGORY_ICONS[event.category1] || CreditCard;
                        const color = CATEGORY_COLORS[event.category1] || "#6b7280";
                        return (
                          <div 
                            key={event.id}
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${color}20` }}
                            title={event.name}
                          >
                            <Icon className="h-4 w-4" style={{ color }} />
                          </div>
                        );
                      })}
                    </div>
                    {upcomingCommitments.length > 0 && (
                      <span className="text-sm text-muted-foreground ml-auto">
                        {formatMessage(t(locale, dashboardCopy.eventsThisMonth), {
                          count: upcomingCommitments.length
                        })}
                      </span>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t(locale, dashboardCopy.noCommitments)}{" "}
                    <Link href="/calendar" className="text-primary underline">{t(locale, dashboardCopy.addAction)}</Link>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {mainInsight && (
          <Card className={cn(
            "border-0 shadow-sm",
            mainInsight.type === "positive" && "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/50",
            mainInsight.type === "warning" && "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/50",
            mainInsight.type === "neutral" && "bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20"
          )}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                    mainInsight.type === "positive" && "bg-green-100 text-green-600",
                    mainInsight.type === "warning" && "bg-amber-100 text-amber-600",
                    mainInsight.type === "neutral" && "bg-primary/20 text-primary"
                  )}>
                    <Lightbulb className="h-5 w-5" />
                  </div>
                  <div>
                    <span className={cn(
                      "text-xs font-bold uppercase tracking-wider",
                    mainInsight.type === "positive" && "text-green-600",
                    mainInsight.type === "warning" && "text-amber-600",
                    mainInsight.type === "neutral" && "text-primary"
                  )}>{t(locale, dashboardCopy.weeklyInsight)}</span>
                    <p className="text-foreground font-semibold mt-1">
                      {mainInsight.description}
                    </p>
                  </div>
                </div>
                <Button variant="secondary" className="bg-white/80 hover:bg-white gap-2">
                  {t(locale, dashboardCopy.viewDetails)}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-white border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">{t(locale, dashboardCopy.spendByCategory)}</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="space-y-4 flex-1 w-full">
                  {(dashboard?.spentByCategory || []).slice(0, 4).map((cat: any) => {
                    const percentage = spent > 0 ? Math.round((cat.amount / spent) * 100) : 0;
                    const color = CATEGORY_COLORS[cat.category] || "#6b7280";
                    const Icon = CATEGORY_ICONS[cat.category] || CreditCard;
                    
                    return (
                      <div key={cat.category} className="flex items-center gap-3">
                        <div 
                          className="w-11 h-11 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${color}15` }}
                        >
                          <Icon className="h-5 w-5" style={{ color }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-semibold text-sm">
                              {translateCategory(locale, cat.category)}
                            </span>
                            <span className="text-sm font-bold" style={{ color }}>{percentage}%</span>
                          </div>
                          <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="relative w-44 h-44 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                    {(dashboard?.spentByCategory || []).reduce((acc: any[], cat: any, idx: number) => {
                      const percentage = spent > 0 ? (cat.amount / spent) * 100 : 0;
                      const circumference = 2 * Math.PI * 40;
                      const offset = acc.length > 0 ? acc[acc.length - 1].endOffset : 0;
                      const dashArray = (percentage / 100) * circumference;
                      const color = CATEGORY_COLORS[cat.category] || "#6b7280";
                      acc.push({
                        ...cat,
                        offset,
                        dashArray,
                        endOffset: offset + dashArray,
                        color
                      });
                      return acc;
                    }, []).map((cat: any, idx: number) => (
                      <circle
                        key={idx}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={cat.color}
                        strokeWidth="12"
                        strokeDasharray={`${cat.dashArray} ${2 * Math.PI * 40}`}
                        strokeDashoffset={-cat.offset}
                        className="transition-all duration-500"
                      />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-foreground">
                      {(spent / 1000).toFixed(1)}k
                    </span>
                    <span className="text-xs text-muted-foreground uppercase font-medium">{t(locale, dashboardCopy.totalSpent)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">{t(locale, dashboardCopy.recentActivity)}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title={t(locale, dashboardCopy.moreOptions)}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/transactions" className="cursor-pointer">
                      {t(locale, dashboardCopy.viewAllTransactions)}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAccountFilter("all")}>
                    {t(locale, dashboardCopy.showAllAccounts)}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/uploads" className="cursor-pointer">
                      {t(locale, dashboardCopy.manageUploads)}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {recentTransactions.length === 0 ? (
                  <div className="px-5 py-8 text-center text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>{t(locale, dashboardCopy.noTransactions)}</p>
                  </div>
                ) : (
                  recentTransactions.map((t: any) => {
                    const Icon = CATEGORY_ICONS[t.category1] || CreditCard;
                    const color = CATEGORY_COLORS[t.category1] || "#6b7280";
                    const isIncome = t.amount > 0;
                    const fallbackDesc = t.simpleDesc || t.descRaw?.split(" -- ")[0]?.replace(/\s+\d{4,}/g, '').trim() || t.descRaw;
                    const merchantName = t.aliasDesc || fallbackDesc;

                    return (
                      <div
                        key={t.id}
                        className="px-5 py-3 hover:bg-muted/30 transition-colors flex items-center gap-3"
                        data-testid={`row-transaction-${t.id}`}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-muted bg-white">
                          {t.logoLocalPath ? (
                            <img src={t.logoLocalPath} alt={merchantName} className="h-5 w-5 object-contain" />
                          ) : (
                            <Icon className="h-4 w-4" style={{ color }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {merchantName.substring(0, 30)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {dayMonthTimeFormatter.format(new Date(t.paymentDate))}
                          </p>
                        </div>
                        <span className={cn(
                          "font-bold text-sm",
                          isIncome ? "text-primary" : "text-foreground"
                        )}>
                          {isIncome ? "+" : "-"} {currencyFormatter.format(Math.abs(t.amount))}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {pendingCount > 0 && (
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/50 shadow-sm">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-900">{t(locale, dashboardCopy.smartCategorizationTitle)}</h3>
                    <p className="text-sm text-amber-700/80 mt-0.5">
                      {formatMessage(t(locale, dashboardCopy.smartCategorizationBody), { count: pendingCount })}
                    </p>
                  </div>
                </div>
                <Link href="/confirm">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20">
                    {t(locale, dashboardCopy.reviewNow)}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
    </>
  );
}
