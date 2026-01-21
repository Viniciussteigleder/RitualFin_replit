"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, RefreshCw, Save, Loader2, Info, MessageSquare, Settings2, Wand2, Copy } from "lucide-react";
import {
  getAssistantSettings,
  updateAssistantSettings,
  resetAssistantSettings,
} from "@/lib/actions/assistant-settings";
import {
  DEFAULT_DATABASE_CONTEXT,
  DEFAULT_ANALYSIS_PROMPT,
  DEFAULT_ADVICE_PROMPT,
  DEFAULT_SUMMARY_PROMPT,
} from "@/lib/assistant/default-prompts";
import type { AssistantSettings } from "@/lib/db/schema";

export function AssistantSettingsForm() {
  const [isPending, startTransition] = useTransition();
  const [settings, setSettings] = useState<AssistantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form state
  const [databaseContext, setDatabaseContext] = useState("");
  const [analysisPrompt, setAnalysisPrompt] = useState("");
  const [advicePrompt, setAdvicePrompt] = useState("");
  const [summaryPrompt, setSummaryPrompt] = useState("");
  const [responseLanguage, setResponseLanguage] = useState("pt-BR");
  const [responseStyle, setResponseStyle] = useState("professional");
  const [maxResponseLength, setMaxResponseLength] = useState(500);
  const [includeEmojis, setIncludeEmojis] = useState(false);
  const [autoSuggestions, setAutoSuggestions] = useState(true);
  const [contextAware, setContextAware] = useState(true);
  const [includeRecentTransactions, setIncludeRecentTransactions] = useState(true);
  const [includeCategoryBreakdown, setIncludeCategoryBreakdown] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const result = await getAssistantSettings();
    if (result.success && result.data) {
      setSettings(result.data);
      setDatabaseContext(result.data.databaseContext || "");
      setAnalysisPrompt(result.data.analysisPrompt || "");
      setAdvicePrompt(result.data.advicePrompt || "");
      setSummaryPrompt(result.data.summaryPrompt || "");
      setResponseLanguage(result.data.responseLanguage || "pt-BR");
      setResponseStyle(result.data.responseStyle || "professional");
      setMaxResponseLength(result.data.maxResponseLength || 500);
      setIncludeEmojis(result.data.includeEmojis || false);
      setAutoSuggestions(result.data.autoSuggestions !== false);
      setContextAware(result.data.contextAware !== false);
      setIncludeRecentTransactions(result.data.includeRecentTransactions !== false);
      setIncludeCategoryBreakdown(result.data.includeCategoryBreakdown !== false);
    }
    setLoading(false);
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateAssistantSettings({
        databaseContext,
        analysisPrompt,
        advicePrompt,
        summaryPrompt,
        responseLanguage,
        responseStyle,
        maxResponseLength,
        includeEmojis,
        autoSuggestions,
        contextAware,
        includeRecentTransactions,
        includeCategoryBreakdown,
      });

      if (result.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    });
  };

  const handleReset = () => {
    startTransition(async () => {
      await resetAssistantSettings();
      await loadSettings();
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Database Context */}
      <div className="bg-card border border-border rounded-2xl p-10 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Info className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground font-display tracking-tight">Contexto do Banco de Dados</h3>
              <p className="text-sm text-muted-foreground">Explica ao assistente como seus dados estao organizados</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDatabaseContext(DEFAULT_DATABASE_CONTEXT)}
            className="rounded-xl"
          >
            <Copy className="h-4 w-4 mr-2" />
            Usar Padrao
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
              Contexto do Sistema e Dados
            </Label>
	            <Textarea
              value={databaseContext}
              onChange={(e) => setDatabaseContext(e.target.value)}
              placeholder={DEFAULT_DATABASE_CONTEXT.substring(0, 200) + "..."}
	              className="min-h-[200px] bg-secondary/30 border-transparent focus:bg-white dark:focus:bg-card focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-2xl transition-[background-color,border-color,box-shadow,color,opacity] duration-150 resize-none font-mono text-xs"
	            />
            <p className="text-xs text-muted-foreground ml-1">
              Define a estrutura do banco de dados, tabelas, categorias e como o assistente deve interpretar os dados
            </p>
          </div>
        </div>
      </div>

      {/* Custom Prompts */}
      <div className="bg-card border border-border rounded-2xl p-10 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground font-display tracking-tight">Prompts Personalizados</h3>
            <p className="text-sm text-muted-foreground">Instrucoes especificas para cada tipo de pergunta</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                Prompt para Analises
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAnalysisPrompt(DEFAULT_ANALYSIS_PROMPT)}
                className="text-xs h-7"
              >
                <Copy className="h-3 w-3 mr-1" />
                Padrao
              </Button>
            </div>
	            <Textarea
              value={analysisPrompt}
              onChange={(e) => setAnalysisPrompt(e.target.value)}
              placeholder={DEFAULT_ANALYSIS_PROMPT}
	              className="min-h-[120px] bg-secondary/30 border-transparent focus:bg-white dark:focus:bg-card focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-2xl transition-[background-color,border-color,box-shadow,color,opacity] duration-150 resize-none font-mono text-xs"
	            />
            <p className="text-xs text-muted-foreground ml-1">
              Usado quando o usuario pergunta sobre gastos, categorias ou comparacoes
            </p>
          </div>

          <Separator className="bg-border/50" />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                Prompt para Conselhos
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAdvicePrompt(DEFAULT_ADVICE_PROMPT)}
                className="text-xs h-7"
              >
                <Copy className="h-3 w-3 mr-1" />
                Padrao
              </Button>
            </div>
	            <Textarea
              value={advicePrompt}
              onChange={(e) => setAdvicePrompt(e.target.value)}
              placeholder={DEFAULT_ADVICE_PROMPT}
	              className="min-h-[120px] bg-secondary/30 border-transparent focus:bg-white dark:focus:bg-card focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-2xl transition-[background-color,border-color,box-shadow,color,opacity] duration-150 resize-none font-mono text-xs"
	            />
            <p className="text-xs text-muted-foreground ml-1">
              Usado quando o usuario pede sugestoes, dicas ou como economizar
            </p>
          </div>

          <Separator className="bg-border/50" />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                Prompt para Resumos
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSummaryPrompt(DEFAULT_SUMMARY_PROMPT)}
                className="text-xs h-7"
              >
                <Copy className="h-3 w-3 mr-1" />
                Padrao
              </Button>
            </div>
	            <Textarea
              value={summaryPrompt}
              onChange={(e) => setSummaryPrompt(e.target.value)}
              placeholder={DEFAULT_SUMMARY_PROMPT}
	              className="min-h-[120px] bg-secondary/30 border-transparent focus:bg-white dark:focus:bg-card focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-2xl transition-[background-color,border-color,box-shadow,color,opacity] duration-150 resize-none font-mono text-xs"
	            />
            <p className="text-xs text-muted-foreground ml-1">
              Usado quando o usuario pede visao geral, status ou situacao financeira
            </p>
          </div>
        </div>
      </div>

      {/* Behavior Settings */}
      <div className="bg-card border border-border rounded-2xl p-10 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600">
            <Settings2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground font-display tracking-tight">Comportamento</h3>
            <p className="text-sm text-muted-foreground">Ajuste como o assistente responde</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                Idioma das Respostas
              </Label>
              <Select value={responseLanguage} onValueChange={setResponseLanguage}>
                <SelectTrigger className="h-14 bg-secondary/30 border-transparent focus:bg-white dark:focus:bg-card focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Portugues (Brasil)</SelectItem>
                  <SelectItem value="pt-PT">Portugues (Portugal)</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                Estilo de Resposta
              </Label>
              <Select value={responseStyle} onValueChange={setResponseStyle}>
                <SelectTrigger className="h-14 bg-secondary/30 border-transparent focus:bg-white dark:focus:bg-card focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Profissional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="detailed">Detalhado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="bg-border/50" />

          <div className="space-y-3">
            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
              Tamanho Maximo da Resposta (tokens)
            </Label>
	            <Input
              type="number"
              min={100}
              max={2000}
              value={maxResponseLength}
              onChange={(e) => setMaxResponseLength(Number(e.target.value))}
	              className="h-14 bg-secondary/30 border-transparent focus:bg-white dark:focus:bg-card focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-2xl transition-[background-color,border-color,box-shadow,color,opacity] duration-150"
	            />
          </div>

          <Separator className="bg-border/50" />

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl">
              <div className="space-y-1">
                <Label className="font-bold">Incluir Emojis</Label>
                <p className="text-xs text-muted-foreground">Usar emojis nas respostas</p>
              </div>
              <Switch checked={includeEmojis} onCheckedChange={setIncludeEmojis} />
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl">
              <div className="space-y-1">
                <Label className="font-bold">Sugestoes Automaticas</Label>
                <p className="text-xs text-muted-foreground">Mostrar perguntas sugeridas</p>
              </div>
              <Switch checked={autoSuggestions} onCheckedChange={setAutoSuggestions} />
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl">
              <div className="space-y-1">
                <Label className="font-bold">Consciente do Contexto</Label>
                <p className="text-xs text-muted-foreground">Usar informacoes da tela atual</p>
              </div>
              <Switch checked={contextAware} onCheckedChange={setContextAware} />
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl">
              <div className="space-y-1">
                <Label className="font-bold">Incluir Transacoes Recentes</Label>
                <p className="text-xs text-muted-foreground">Enviar ultimas 20 transacoes ao assistente</p>
              </div>
              <Switch checked={includeRecentTransactions} onCheckedChange={setIncludeRecentTransactions} />
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl">
              <div className="space-y-1">
                <Label className="font-bold">Incluir Categorias</Label>
                <p className="text-xs text-muted-foreground">Enviar breakdown de categorias</p>
              </div>
              <Switch checked={includeCategoryBreakdown} onCheckedChange={setIncludeCategoryBreakdown} />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
	        <Button
	          onClick={handleSave}
	          disabled={isPending}
	          className="flex-1 h-14 bg-foreground text-background font-bold rounded-2xl shadow-xl shadow-foreground/5 hover:opacity-95 transition-[background-color,box-shadow,opacity] duration-150"
	        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <Save className="h-5 w-5 mr-2" />
          )}
          {saveSuccess ? "Salvo!" : "Salvar Configuracoes"}
        </Button>

        <Button
          onClick={handleReset}
          disabled={isPending}
          variant="secondary"
          className="h-14 px-8 rounded-2xl font-bold bg-secondary/80 hover:bg-secondary"
        >
          <RefreshCw className="h-5 w-5 mr-2" />
          Resetar Padrao
        </Button>
      </div>
    </div>
  );
}
