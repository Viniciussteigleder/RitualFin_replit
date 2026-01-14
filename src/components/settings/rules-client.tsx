"use client";

import { useState, useMemo, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Filter,
  ArrowRight,
  Brain,
  Zap,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Tag,
  Hash,
  Layers,
  AlertCircle,
  CheckCircle2,
  X,
  Info,
  Loader2,
  Merge
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { TYPE_STYLES, FIXVAR_STYLES, PRIORITY_INFO, MODE_INFO } from "@/lib/constants/categories";
import { updateRule, deleteRule, consolidateDuplicateRules } from "@/lib/actions/rules";
import { toast } from "sonner";

interface Rule {
  id: string;
  userId: string | null;
  keyWords: string | null;
  keyWordsNegative?: string | null;
  category1: string | null;
  category2?: string | null;
  category3?: string | null;
  type: "Despesa" | "Receita" | null;
  fixVar: "Fixo" | "Variável" | null;
  priority: number;
  strict: boolean;
  active: boolean;
  isSystem: boolean;
  leafId?: string | null;
  appCategoryId?: string | null;
  appCategoryName?: string | null;
  createdAt: Date;
}

interface RulesClientProps {
  initialRules: Rule[];
}

export default function RulesClient({ initialRules }: RulesClientProps) {
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [editKeywords, setEditKeywords] = useState<string>("");
  const [editKeywordsNegative, setEditKeywordsNegative] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [isConsolidating, setIsConsolidating] = useState(false);

  // Intelligent filtering
  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      // Search filter
      const matchesSearch = 
        searchQuery === "" ||
        rule.keyWords?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.category1?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.category2?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.category3?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.appCategoryName?.toLowerCase().includes(searchQuery.toLowerCase());

      // Type filter
      const matchesType = typeFilter === "all" || rule.type === typeFilter;

      // Status filter
      const matchesStatus = 
        statusFilter === "all" ||
        (statusFilter === "active" && rule.active) ||
        (statusFilter === "inactive" && !rule.active) ||
        (statusFilter === "system" && rule.isSystem) ||
        (statusFilter === "user" && !rule.isSystem);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [rules, searchQuery, typeFilter, statusFilter]);

  // Group rules by app_category (leading dimension)
  const groupedRules = useMemo(() => {
    const groups: Record<string, Rule[]> = {};
    filteredRules.forEach((rule) => {
      const key = rule.appCategoryName || "Sem App Category";
      if (!groups[key]) groups[key] = [];
      groups[key].push(rule);
    });
    return groups;
  }, [filteredRules]);

  const toggleExpand = (ruleId: string) => {
    setExpandedRule(expandedRule === ruleId ? null : ruleId);
  };

  const handleEdit = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      setEditKeywords(rule.keyWords || "");
      setEditKeywordsNegative(rule.keyWordsNegative || "");
      setEditingRule(ruleId);
      setExpandedRule(ruleId);
    }
  };

  const handleCancelEdit = () => {
    setEditingRule(null);
    setEditKeywords("");
    setEditKeywordsNegative("");
  };

  const handleSaveEdit = async (ruleId: string) => {
    startTransition(async () => {
      try {
        // Call server action to update in database
        const result = await updateRule(ruleId, {
          keyWords: editKeywords,
          keyWordsNegative: editKeywordsNegative || null
        });

        if (result.success) {
          // Update local state
          setRules(prevRules =>
            prevRules.map(rule =>
              rule.id === ruleId
                ? { ...rule, keyWords: editKeywords, keyWordsNegative: editKeywordsNegative }
                : rule
            )
          );
          toast.success("Regra atualizada com sucesso");
        } else {
          toast.error("Erro ao atualizar regra", { description: result.error });
        }

        setEditingRule(null);
        setEditKeywords("");
        setEditKeywordsNegative("");
      } catch (error) {
        console.error("Failed to save rule:", error);
        toast.error("Erro ao salvar regra");
      }
    });
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta regra?")) return;

    startTransition(async () => {
      try {
        const result = await deleteRule(ruleId);
        if (result.success) {
          setRules(prevRules => prevRules.filter(rule => rule.id !== ruleId));
          toast.success("Regra excluída");
        } else {
          toast.error("Erro ao excluir regra", { description: result.error });
        }
      } catch (error) {
        toast.error("Erro ao excluir regra");
      }
    });
  };

  const handleConsolidateRules = async () => {
    setIsConsolidating(true);
    try {
      const result = await consolidateDuplicateRules();
      if (result.success) {
        toast.success(result.message);
        // Reload page to get updated rules
        window.location.reload();
      } else {
        toast.error("Erro ao consolidar regras", { description: result.error });
      }
    } catch (error) {
      toast.error("Erro ao consolidar regras");
    } finally {
      setIsConsolidating(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-32 font-sans px-1">
        {/* Premium Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/20 dark:via-purple-950/20 dark:to-fuchsia-950/20 p-10 rounded-3xl border border-violet-200/50 dark:border-violet-800/30 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg shadow-violet-500/30">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground tracking-tight font-display">Motor de Regras</h1>
                  <p className="text-sm text-muted-foreground font-medium mt-1">Sistema de Classificação Automática</p>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <Badge className="h-8 px-4 rounded-xl text-sm font-bold bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 border-0">
                  {filteredRules.length} regras ativas
                </Badge>
                <Badge className="h-8 px-4 rounded-xl text-sm font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-0">
                  {Object.keys(groupedRules).length} categorias
                </Badge>
                <Badge className="h-8 px-4 rounded-xl text-sm font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-0">
                  {rules.filter(r => r.isSystem).length} sistema
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Consolidate Duplicates Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={handleConsolidateRules}
                    disabled={isConsolidating}
                    className="h-12 px-6 rounded-xl border-violet-200 hover:bg-violet-50"
                  >
                    {isConsolidating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Merge className="h-4 w-4 mr-2" />
                    )}
                    Consolidar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mesclar regras duplicadas com mesmo leafId</p>
                </TooltipContent>
              </Tooltip>

              {/* Nova Regra - Navigate to Confirm page */}
              <Button
                onClick={() => window.location.href = '/confirm'}
                className="h-14 px-8 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-xl shadow-violet-500/30 gap-2 transition-all"
              >
                <Plus className="h-5 w-5" />
                Nova Regra
              </Button>
            </div>
          </div>
        </div>

      {/* Advanced Filters */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por palavra-chave, categoria, leaf..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 rounded-xl bg-secondary/30 border-border"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-12 rounded-xl bg-secondary/30 border-border">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="Despesa">Despesa</SelectItem>
                <SelectItem value="Receita">Receita</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-12 rounded-xl bg-secondary/30 border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativas</SelectItem>
                <SelectItem value="inactive">Inativas</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || typeFilter !== "all" || statusFilter !== "all") && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Filtros ativos:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Busca: &quot;{searchQuery}&quot;
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                </Badge>
              )}
              {typeFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Tipo: {typeFilter}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setTypeFilter("all")} />
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Status: {statusFilter}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter("all")} />
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rules List - Hierarchical View */}
      <div className="space-y-6">
        {Object.keys(groupedRules).length === 0 ? (
          <Card className="rounded-2xl border-dashed border-2 border-border">
            <CardContent className="p-20 flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Nenhuma regra encontrada</h3>
              <p className="text-muted-foreground max-w-md">
                Tente ajustar os filtros ou criar uma nova regra para começar.
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedRules).map(([category, categoryRules]) => (
            <div key={category} className="space-y-3">
              {/* Category Header */}
              <div className="flex items-center gap-3 px-2">
                <Layers className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                <h3 className="text-lg font-bold text-foreground font-display">{category}</h3>
                <Badge variant="secondary" className="ml-auto">
                  {categoryRules.length} {categoryRules.length === 1 ? "regra" : "regras"}
                </Badge>
              </div>

              {/* Rules in Category */}
              <div className="space-y-2">
                {categoryRules.map((rule) => (
                  <Card
                    key={rule.id}
                    className={`rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                      expandedRule === rule.id
                        ? "border-violet-300 dark:border-violet-700 shadow-md"
                        : "border-border hover:border-violet-200 dark:hover:border-violet-800"
                    }`}
                  >
                    <CardContent className="p-6">
                      {/* Compact View */}
                      <div className="flex items-center justify-between gap-4">
                        {/* Left: Keywords */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <button
                            onClick={() => toggleExpand(rule.id)}
                            className="flex-shrink-0 p-2 hover:bg-secondary rounded-xl transition-colors"
                          >
                            {expandedRule === rule.id ? (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={`h-7 px-3 rounded-lg text-xs font-bold ${
                                rule.type === "Despesa"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                  : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              } border-0`}>
                                {rule.type}
                              </Badge>
                              <Badge className={`h-7 px-3 rounded-lg text-xs font-bold ${
                                rule.fixVar === "Fixo"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                  : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                              } border-0`}>
                                {rule.fixVar}
                              </Badge>
                              {rule.isSystem && (
                                <Badge className="h-7 px-3 rounded-lg text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-0">
                                  Sistema
                                </Badge>
                              )}
                              {rule.strict && (
                                <Badge className="h-7 px-3 rounded-lg text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-0">
                                  Estrito
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <code className="text-sm font-mono font-bold text-foreground bg-secondary/50 px-3 py-1 rounded-lg truncate">
                                {rule.keyWords}
                              </code>
                            </div>
                          </div>
                        </div>

                        {/* Center: Arrow */}
                        <ArrowRight className="h-6 w-6 text-muted-foreground/30 flex-shrink-0" />

                        {/* Right: Category Path with App Category FIRST */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="flex items-center gap-1">
                            {/* App Category - Leading dimension */}
                            {rule.appCategoryName && (
                              <>
                                <Badge className="h-8 px-4 rounded-xl text-sm font-bold bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 border-0">
                                  {rule.appCategoryName}
                                </Badge>
                                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                              </>
                            )}
                            {/* Category 1 */}
                            <Badge className="h-8 px-4 rounded-xl text-sm font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-0">
                              {rule.category1}
                            </Badge>
                            {/* Category 2 */}
                            {rule.category2 && (
                              <>
                                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                                <Badge variant="outline" className="h-8 px-3 rounded-xl text-xs">
                                  {rule.category2}
                                </Badge>
                              </>
                            )}
                            {/* Category 3 */}
                            {rule.category3 && (
                              <>
                                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                                <Badge variant="outline" className="h-8 px-3 rounded-xl text-xs">
                                  {rule.category3}
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Priority with tooltip */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex flex-col items-end mr-2 cursor-help">
                                <span className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                  Prioridade
                                  <Info className="h-3 w-3" />
                                </span>
                                <span className="font-mono font-bold text-sm">{rule.priority}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="font-semibold">{PRIORITY_INFO.title}</p>
                              <p className="text-xs">{PRIORITY_INFO.description}</p>
                            </TooltipContent>
                          </Tooltip>

                          {/* Mode indicator with tooltip */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-help ${
                                rule.strict
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                              }`}>
                                {rule.strict ? "Estrito" : "Flexível"}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="font-semibold">{rule.strict ? MODE_INFO.strict.title : MODE_INFO.flexible.title}</p>
                              <p className="text-xs">{rule.strict ? MODE_INFO.strict.description : MODE_INFO.flexible.description}</p>
                            </TooltipContent>
                          </Tooltip>

                          <div className={`w-3 h-3 rounded-full ${
                            rule.active
                              ? "bg-emerald-500 shadow-lg shadow-emerald-500/50"
                              : "bg-gray-300 dark:bg-gray-700"
                          }`}></div>
                          <Button
                            variant="ghost" 
                            size="sm" 
                            className="h-9 w-9 p-0 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-950/30"
                            onClick={() => handleEdit(rule.id)}
                          >
                            <Edit2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                            onClick={() => handleDeleteRule(rule.id)}
                            disabled={isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Expanded View */}
                      {expandedRule === rule.id && (
                        <div className="mt-6 pt-6 border-t border-border space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Keywords Section */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    Palavras-chave (incluir)
                                  </span>
                                </div>
                                {editingRule === rule.id && (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={handleCancelEdit}
                                      className="h-7 px-3 text-xs"
                                    >
                                      Cancelar
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => handleSaveEdit(rule.id)}
                                      className="h-7 px-3 text-xs bg-violet-600 hover:bg-violet-700"
                                    >
                                      Guardar
                                    </Button>
                                  </div>
                                )}
                              </div>
                              
                              {editingRule === rule.id ? (
                                <textarea
                                  value={editKeywords}
                                  onChange={(e) => setEditKeywords(e.target.value)}
                                  className="w-full min-h-[100px] p-4 rounded-xl bg-secondary/30 border border-border font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-violet-500"
                                  placeholder="Digite as palavras-chave separadas por vírgula..."
                                />
                              ) : (
                                <div className="bg-secondary/30 rounded-xl p-4">
                                  <code className="text-sm font-mono text-foreground break-all">
                                    {rule.keyWords || "Nenhuma palavra-chave definida"}
                                  </code>
                                </div>
                              )}

                              <div className="flex items-center gap-2 mt-4">
                                <X className="h-4 w-4 text-red-600" />
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                  Palavras-chave (excluir)
                                </span>
                              </div>
                              
                              {editingRule === rule.id ? (
                                <textarea
                                  value={editKeywordsNegative}
                                  onChange={(e) => setEditKeywordsNegative(e.target.value)}
                                  className="w-full min-h-[80px] p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-red-500"
                                  placeholder="Digite as palavras-chave negativas separadas por vírgula..."
                                />
                              ) : (
                                <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-4 border border-red-200 dark:border-red-900/30">
                                  <code className="text-sm font-mono text-red-800 dark:text-red-300 break-all">
                                    {rule.keyWordsNegative || "Nenhuma palavra-chave negativa"}
                                  </code>
                                </div>
                              )}
                            </div>

                            {/* Taxonomy Section */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Layers className="h-4 w-4 text-violet-600" />
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                  Hierarquia Taxonômica
                                </span>
                              </div>
                              <div className="space-y-2">
                                {rule.appCategoryName && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground w-24">App Category:</span>
                                    <Badge variant="outline" className="font-mono text-xs">
                                      {rule.appCategoryName}
                                    </Badge>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground w-24">Category 1:</span>
                                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-0">
                                    {rule.category1}
                                  </Badge>
                                </div>
                                {rule.category2 && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground w-24">Category 2:</span>
                                    <Badge variant="outline">{rule.category2}</Badge>
                                  </div>
                                )}
                                {rule.category3 && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground w-24">Category 3:</span>
                                    <Badge variant="outline">{rule.category3}</Badge>
                                  </div>
                                )}
                                {rule.leafId && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground w-24">Leaf ID:</span>
                                    <code className="text-xs font-mono bg-secondary px-2 py-1 rounded">
                                      {rule.leafId}
                                    </code>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="flex items-center gap-6 pt-4 border-t border-border text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Hash className="h-3 w-3" />
                              <span>ID: <code className="font-mono">{rule.id.slice(0, 8)}</code></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Zap className="h-3 w-3" />
                              <span>Prioridade: <strong>{rule.priority}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Filter className="h-3 w-3" />
                              <span>Modo: <strong>{rule.strict ? "Estrito" : "Flexível"}</strong></span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </TooltipProvider>
  );
}
