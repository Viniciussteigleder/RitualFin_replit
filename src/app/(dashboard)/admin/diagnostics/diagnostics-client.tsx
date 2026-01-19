"use client";

import { useState, useCallback, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileUp,
  Sparkles,
  Tags,
  DollarSign,
  GitBranch,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  ChevronDown,
  ChevronRight,
  Wrench,
  Activity,
  Shield,
  Zap,
  Clock,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { runFullDiagnostics, autoFixIssue, DiagnosticResult, DiagnosticIssue, Severity } from "@/lib/actions/diagnostics";

/**
 * DIAGNOSTICS CLIENT COMPONENT
 *
 * UX Design Credits:
 * - Health Score Ring: Inspired by Apple Watch Activity Rings
 * - Category Cards: Google Cloud Console monitoring
 * - Issue List: GitHub Security Alerts pattern
 * - Auto-fix Actions: Vercel's one-click fixes
 */

const SEVERITY_CONFIG: Record<Severity, { color: string; bgColor: string; icon: typeof AlertTriangle; label: string }> = {
  critical: { color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-900/30", icon: XCircle, label: "Crítico" },
  high: { color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-900/30", icon: AlertTriangle, label: "Alto" },
  medium: { color: "text-yellow-600", bgColor: "bg-yellow-100 dark:bg-yellow-900/30", icon: AlertTriangle, label: "Médio" },
  low: { color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30", icon: Info, label: "Baixo" },
  info: { color: "text-gray-600", bgColor: "bg-gray-100 dark:bg-gray-900/30", icon: Info, label: "Info" }
};

const CATEGORY_ICONS: Record<string, typeof FileUp> = {
  FileUp,
  Sparkles,
  Tags,
  DollarSign,
  GitBranch
};

export function DiagnosticsClient() {
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isRunning, setIsRunning] = useState(false);
  const [fixingIssue, setFixingIssue] = useState<string | null>(null);
  const [fixResults, setFixResults] = useState<Record<string, { success: boolean; message: string }>>({});

  const runDiagnostics = useCallback(() => {
    setIsRunning(true);
    startTransition(async () => {
      try {
        const data = await runFullDiagnostics();
        setResult(data);
      } catch (error) {
        console.error("Diagnostic failed:", error);
      } finally {
        setIsRunning(false);
      }
    });
  }, []);

  const handleAutoFix = useCallback(async (issueId: string) => {
    setFixingIssue(issueId);
    try {
      const fixResult = await autoFixIssue(issueId);
      setFixResults(prev => ({ ...prev, [issueId]: fixResult }));
      // Re-run diagnostics after fix
      setTimeout(runDiagnostics, 1000);
    } catch (error) {
      setFixResults(prev => ({ ...prev, [issueId]: { success: false, message: "Erro ao corrigir" } }));
    } finally {
      setFixingIssue(null);
    }
  }, [runDiagnostics]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Diagnóstico de Integridade
          </h1>
          <p className="text-muted-foreground mt-1">
            Análise completa de dados, regras e categorização
          </p>
        </div>
        <Button
          onClick={runDiagnostics}
          disabled={isPending || isRunning}
          size="lg"
          className="gap-2"
        >
          {isRunning ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Executar Diagnóstico
            </>
          )}
        </Button>
      </div>

      {/* Initial State */}
      {!result && !isRunning && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Activity className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum diagnóstico executado</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Execute o diagnóstico para verificar a integridade dos seus dados,
              regras de categorização e estrutura taxonômica.
            </p>
            <Button onClick={runDiagnostics} size="lg" className="gap-2">
              <Zap className="h-4 w-4" />
              Iniciar Diagnóstico
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      <AnimatePresence>
        {isRunning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full border-4 border-primary/20 animate-pulse" />
                    <RefreshCw className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
                  </div>
                  <p className="text-lg font-medium mt-6">Executando verificações...</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Analisando importações, regras, categorização, finanças e taxonomia
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {result && !isRunning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Health Score & Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Health Score Card */}
            <Card className="lg:row-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Índice de Saúde
                </CardTitle>
                <CardDescription>
                  Avaliação geral da integridade dos dados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HealthScoreRing score={result.summary.healthScore} />
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Duração</span>
                    <span className="font-mono">{result.duration}ms</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Última execução</span>
                    <span className="font-mono text-xs">
                      {new Date(result.timestamp).toLocaleString("pt-BR")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Issue Summary */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Resumo de Problemas</CardTitle>
                <CardDescription>
                  {result.summary.totalIssues} problemas encontrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <SeverityCard severity="critical" count={result.summary.critical} />
                  <SeverityCard severity="high" count={result.summary.high} />
                  <SeverityCard severity="medium" count={result.summary.medium} />
                  <SeverityCard severity="low" count={result.summary.low} />
                  <SeverityCard severity="info" count={result.summary.info} />
                </div>
              </CardContent>
            </Card>

            {/* Category Status Grid */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Status por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {Object.entries(result.categories).map(([key, cat]) => (
                    <CategoryStatusCard key={key} category={cat} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Issues by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes dos Problemas</CardTitle>
              <CardDescription>
                Clique para expandir e ver detalhes de cada problema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4 flex-wrap h-auto gap-2">
                  <TabsTrigger value="all" className="gap-2">
                    Todos
                    <Badge variant="secondary">{result.issues.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="critical" className="gap-2">
                    <XCircle className="h-3 w-3 text-red-600" />
                    Críticos
                    <Badge variant="destructive">{result.summary.critical}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="high" className="gap-2">
                    <AlertTriangle className="h-3 w-3 text-orange-600" />
                    Altos
                    <Badge className="bg-orange-100 text-orange-800">{result.summary.high}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="medium" className="gap-2">
                    Médios
                    <Badge variant="outline">{result.summary.medium}</Badge>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <IssueList
                    issues={result.issues}
                    fixingIssue={fixingIssue}
                    fixResults={fixResults}
                    onAutoFix={handleAutoFix}
                  />
                </TabsContent>
                <TabsContent value="critical">
                  <IssueList
                    issues={result.issues.filter(i => i.severity === "critical")}
                    fixingIssue={fixingIssue}
                    fixResults={fixResults}
                    onAutoFix={handleAutoFix}
                  />
                </TabsContent>
                <TabsContent value="high">
                  <IssueList
                    issues={result.issues.filter(i => i.severity === "high")}
                    fixingIssue={fixingIssue}
                    fixResults={fixResults}
                    onAutoFix={handleAutoFix}
                  />
                </TabsContent>
                <TabsContent value="medium">
                  <IssueList
                    issues={result.issues.filter(i => i.severity === "medium" || i.severity === "low")}
                    fixingIssue={fixingIssue}
                    fixResults={fixResults}
                    onAutoFix={handleAutoFix}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function HealthScoreRing({ score }: { score: number }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-green-500";
    if (s >= 60) return "text-yellow-500";
    if (s >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return "Excelente";
    if (s >= 60) return "Bom";
    if (s >= 40) return "Atenção";
    return "Crítico";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="200" height="200" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            className="text-muted/20"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${getScoreColor(score)} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
          <span className="text-sm text-muted-foreground">/ 100</span>
        </div>
      </div>
      <Badge variant="outline" className={`mt-4 ${getScoreColor(score)}`}>
        {getScoreLabel(score)}
      </Badge>
    </div>
  );
}

function SeverityCard({ severity, count }: { severity: Severity; count: number }) {
  const config = SEVERITY_CONFIG[severity];
  const Icon = config.icon;

  return (
    <div className={`rounded-lg p-4 ${config.bgColor} transition-all hover:scale-105`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${config.color}`} />
        <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
      </div>
      <p className={`text-2xl font-bold ${config.color}`}>{count}</p>
    </div>
  );
}

function CategoryStatusCard({ category }: { category: any }) {
  const IconComponent = CATEGORY_ICONS[category.icon] || Activity;

  const statusColors = {
    healthy: "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800",
    warning: "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800",
    critical: "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800"
  };

  const statusIcons = {
    healthy: <CheckCircle2 className="h-4 w-4 text-green-600" />,
    warning: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
    critical: <XCircle className="h-4 w-4 text-red-600" />
  };

  return (
    <div className={`rounded-lg p-3 border ${statusColors[category.status as keyof typeof statusColors]}`}>
      <div className="flex items-center gap-2 mb-2">
        <IconComponent className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium truncate">{category.name}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {statusIcons[category.status as keyof typeof statusIcons]}
          <span className="text-xs text-muted-foreground">
            {category.checksPassed}/{category.checksRun}
          </span>
        </div>
        {category.issueCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {category.issueCount}
          </Badge>
        )}
      </div>
    </div>
  );
}

function IssueList({
  issues,
  fixingIssue,
  fixResults,
  onAutoFix
}: {
  issues: DiagnosticIssue[];
  fixingIssue: string | null;
  fixResults: Record<string, { success: boolean; message: string }>;
  onAutoFix: (id: string) => void;
}) {
  if (issues.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <p className="text-lg font-medium">Nenhum problema encontrado</p>
        <p className="text-sm text-muted-foreground">Tudo parece estar em ordem!</p>
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="space-y-2">
      {issues.map((issue) => (
        <IssueCard
          key={issue.id}
          issue={issue}
          isFixing={fixingIssue === issue.id}
          fixResult={fixResults[issue.id]}
          onAutoFix={onAutoFix}
        />
      ))}
    </Accordion>
  );
}

function IssueCard({
  issue,
  isFixing,
  fixResult,
  onAutoFix
}: {
  issue: DiagnosticIssue;
  isFixing: boolean;
  fixResult?: { success: boolean; message: string };
  onAutoFix: (id: string) => void;
}) {
  const config = SEVERITY_CONFIG[issue.severity];
  const Icon = config.icon;

  return (
    <AccordionItem value={issue.id} className="border rounded-lg overflow-hidden">
      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
        <div className="flex items-center gap-3 flex-1">
          <div className={`p-2 rounded-lg ${config.bgColor}`}>
            <Icon className={`h-4 w-4 ${config.color}`} />
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <span className="font-medium">{issue.title}</span>
              <Badge variant="outline" className="text-xs font-mono">
                {issue.id}
              </Badge>
              {issue.autoFixable && !fixResult?.success && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Wrench className="h-3 w-3" />
                  Auto-fix
                </Badge>
              )}
              {fixResult?.success && (
                <Badge className="bg-green-100 text-green-800 text-xs gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Corrigido
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{issue.description}</p>
          </div>
          <Badge variant="secondary" className="ml-auto mr-4">
            {issue.affectedCount} afetados
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4 pt-2">
          {/* Category Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Tags className="h-4 w-4" />
            <span>{issue.category.name}</span>
          </div>

          {/* Recommendation */}
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
              Recomendação
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {issue.recommendation}
            </p>
          </div>

          {/* Samples */}
          {issue.samples.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Exemplos ({Math.min(issue.samples.length, 5)} de {issue.affectedCount})</p>
              <div className="bg-muted rounded-lg p-3 overflow-x-auto">
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  {JSON.stringify(issue.samples, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Auto-fix Button */}
          {issue.autoFixable && !fixResult?.success && (
            <div className="flex items-center gap-4 pt-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => onAutoFix(issue.id)}
                disabled={isFixing}
                className="gap-2"
              >
                {isFixing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Corrigindo...
                  </>
                ) : (
                  <>
                    <Wrench className="h-4 w-4" />
                    Corrigir Automaticamente
                  </>
                )}
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Esta correção será aplicada automaticamente.
                      Recomendamos fazer backup antes de executar.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {/* Fix Result */}
          {fixResult && (
            <div className={`rounded-lg p-3 ${fixResult.success ? 'bg-green-50 dark:bg-green-950/30 border-green-200' : 'bg-red-50 dark:bg-red-950/30 border-red-200'} border`}>
              <div className="flex items-center gap-2">
                {fixResult.success ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${fixResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {fixResult.message}
                </span>
              </div>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
