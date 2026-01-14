"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Trash2,
  EyeOff,
  LayoutDashboard,
  BarChart3,
  Receipt,
  Calendar,
  Wallet,
  Edit2,
  Check,
  X,
  Loader2,
  Filter
} from "lucide-react";
import {
  createExclusionRule,
  updateExclusionRule,
  deleteExclusionRule,
  toggleExclusionRule
} from "@/lib/actions/exclusions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ExclusionRule } from "@/lib/db/schema";

interface ExclusionsClientProps {
  initialRules: ExclusionRule[];
}

export function ExclusionsClient({ initialRules }: ExclusionsClientProps) {
  const [rules, setRules] = useState(initialRules);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form state for new/edit
  const [formData, setFormData] = useState({
    name: "",
    category1: "",
    category2: "",
    appCategoryName: "",
    isInternal: false,
    excludeFromDashboard: true,
    excludeFromAnalytics: true,
    excludeFromTransactions: false,
    excludeFromCalendar: false,
    excludeFromBudgets: true,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      category1: "",
      category2: "",
      appCategoryName: "",
      isInternal: false,
      excludeFromDashboard: true,
      excludeFromAnalytics: true,
      excludeFromTransactions: false,
      excludeFromCalendar: false,
      excludeFromBudgets: true,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createExclusionRule(formData);
        if (result.success) {
          toast.success("Regra de exclusão criada");
          setRules(prev => [result.data, ...prev]);
          resetForm();
        }
      } catch (error) {
        toast.error("Erro ao criar regra");
      }
    });
  };

  const handleUpdate = async (id: string) => {
    startTransition(async () => {
      try {
        await updateExclusionRule(id, formData);
        toast.success("Regra atualizada");
        setRules(prev => prev.map(r =>
          r.id === id ? { ...r, ...formData } : r
        ));
        resetForm();
      } catch (error) {
        toast.error("Erro ao atualizar");
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta regra?")) return;

    startTransition(async () => {
      try {
        await deleteExclusionRule(id);
        toast.success("Regra excluída");
        setRules(prev => prev.filter(r => r.id !== id));
      } catch (error) {
        toast.error("Erro ao excluir");
      }
    });
  };

  const handleToggle = async (id: string, active: boolean) => {
    startTransition(async () => {
      try {
        await toggleExclusionRule(id, active);
        setRules(prev => prev.map(r =>
          r.id === id ? { ...r, active } : r
        ));
      } catch (error) {
        toast.error("Erro ao alterar status");
      }
    });
  };

  const startEdit = (rule: ExclusionRule) => {
    setEditingId(rule.id);
    setFormData({
      name: rule.name,
      category1: rule.category1 || "",
      category2: rule.category2 || "",
      appCategoryName: rule.appCategoryName || "",
      isInternal: rule.isInternal || false,
      excludeFromDashboard: rule.excludeFromDashboard || false,
      excludeFromAnalytics: rule.excludeFromAnalytics || false,
      excludeFromTransactions: rule.excludeFromTransactions || false,
      excludeFromCalendar: rule.excludeFromCalendar || false,
      excludeFromBudgets: rule.excludeFromBudgets || false,
    });
    setIsAdding(false);
  };

  const screenIcons = [
    { key: "excludeFromDashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "excludeFromAnalytics", label: "Analytics", icon: BarChart3 },
    { key: "excludeFromTransactions", label: "Transações", icon: Receipt },
    { key: "excludeFromCalendar", label: "Calendário", icon: Calendar },
    { key: "excludeFromBudgets", label: "Orçamentos", icon: Wallet },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
            <EyeOff className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Regras de Exclusão</h1>
            <p className="text-sm text-muted-foreground">
              Configure quais categorias excluir de cada tela
            </p>
          </div>
        </div>
        {!isAdding && !editingId && (
          <Button
            onClick={() => setIsAdding(true)}
            className="gap-2 bg-amber-600 hover:bg-amber-700"
          >
            <Plus className="h-4 w-4" />
            Nova Regra
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-4">
          <h3 className="font-semibold text-lg">
            {editingId ? "Editar Regra" : "Nova Regra de Exclusão"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome da regra *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder="Ex: Excluir Interno do Dashboard"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category 1 (match)</label>
              <Input
                value={formData.category1}
                onChange={(e) => setFormData(p => ({ ...p, category1: e.target.value }))}
                placeholder="Ex: Interno"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category 2 (match)</label>
              <Input
                value={formData.category2}
                onChange={(e) => setFormData(p => ({ ...p, category2: e.target.value }))}
                placeholder="Ex: Karlsruhe"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">App Category (match)</label>
              <Input
                value={formData.appCategoryName}
                onChange={(e) => setFormData(p => ({ ...p, appCategoryName: e.target.value }))}
                placeholder="Ex: INTERNO"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="isInternal"
              checked={formData.isInternal}
              onCheckedChange={(checked) =>
                setFormData(p => ({ ...p, isInternal: !!checked }))
              }
            />
            <label htmlFor="isInternal" className="text-sm">
              Transferências internas apenas
            </label>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Excluir das telas:</label>
            <div className="flex flex-wrap gap-3">
              {screenIcons.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setFormData(p => ({ ...p, [key]: !p[key as keyof typeof p] }))
                  }
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
                    formData[key as keyof typeof formData]
                      ? "bg-amber-100 border-amber-300 text-amber-800"
                      : "bg-background border-border text-muted-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <Button
              onClick={editingId ? () => handleUpdate(editingId) : handleCreate}
              disabled={isPending}
              className="gap-2"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {editingId ? "Salvar" : "Criar"}
            </Button>
            <Button variant="ghost" onClick={resetForm}>
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-3">
        {rules.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Filter className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Nenhuma regra de exclusão definida.</p>
            <p className="text-sm">Clique em &quot;Nova Regra&quot; para começar.</p>
          </div>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className={cn(
                "p-4 rounded-xl border bg-card transition-all",
                !rule.active && "opacity-50"
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={rule.active ?? true}
                    onCheckedChange={(checked) => handleToggle(rule.id, checked)}
                  />
                  <div>
                    <h4 className="font-semibold">{rule.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      {rule.category1 && <Badge variant="outline">Cat1: {rule.category1}</Badge>}
                      {rule.category2 && <Badge variant="outline">Cat2: {rule.category2}</Badge>}
                      {rule.appCategoryName && <Badge variant="outline">App: {rule.appCategoryName}</Badge>}
                      {rule.isInternal && <Badge variant="outline">Interno</Badge>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Screen badges */}
                  <div className="flex items-center gap-1">
                    {screenIcons.map(({ key, icon: Icon }) => (
                      <div
                        key={key}
                        className={cn(
                          "p-1.5 rounded",
                          rule[key as keyof typeof rule]
                            ? "bg-amber-100 text-amber-700"
                            : "bg-secondary/30 text-muted-foreground/30"
                        )}
                        title={key.replace("excludeFrom", "")}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(rule)}
                      className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="p-2 hover:bg-red-100 rounded-lg text-muted-foreground hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Help Text */}
      <div className="p-4 bg-secondary/30 rounded-xl text-sm text-muted-foreground">
        <h4 className="font-medium text-foreground mb-2">Como funciona:</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Crie regras para excluir certas categorias ou condições de telas específicas</li>
          <li>Por exemplo: excluir &quot;Interno&quot; do Dashboard para não afetar relatórios</li>
          <li>Ou excluir &quot;Karlsruhe&quot; (casa alugada) dos Analytics para ver apenas gastos locais</li>
          <li>As regras são aplicadas automaticamente quando você abre cada tela</li>
        </ul>
      </div>
    </div>
  );
}
