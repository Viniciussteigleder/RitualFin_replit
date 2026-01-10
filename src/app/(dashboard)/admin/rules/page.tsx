"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, Plus, Search, Sparkles, ArrowRight, CheckCircle2, RefreshCw } from "lucide-react";
import { getRuleSuggestions, simulateRule, createRule, getRules, reApplyAllRules, type RuleProposal, type SimulationResult } from "@/lib/actions/rules";
import { CATEGORY_CONFIGS } from "@/lib/constants/categories";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function RulesStudioPage() {
  const [suggestions, setSuggestions] = useState<RuleProposal[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [existingRules, setExistingRules] = useState<any[]>([]);
  const [loadingRules, setLoadingRules] = useState(false);

  const categories = Object.keys(CATEGORY_CONFIGS);

  // Load suggestions on mount
  useEffect(() => {
    loadSuggestions();
    loadRules();
  }, []);

  async function loadSuggestions() {
    setSuggestionsLoading(true);
    try {
      const data = await getRuleSuggestions();
      setSuggestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSuggestionsLoading(false);
    }
  }

  async function loadRules() {
    setLoadingRules(true);
    try {
      const data = await getRules();
      setExistingRules(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRules(false);
    }
  }

  async function handleSimulate() {
    if (!keyword) return;
    setSimulating(true);
    setSimulationResult(null); // Clear previous
    try {
      const result = await simulateRule(keyword);
      setSimulationResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  }

  async function handleCreateRule() {
    if (!keyword || !selectedCategory) return;
    setCreating(true);
    try {
      const res = await createRule({
        name: keyword.toUpperCase(), // Default name
        keywords: keyword,
        category1: selectedCategory,
        type: "Despesa", // Default
        fixVar: "Variável" // Default
      });
      
      if (res.success) {
        setSuccessMsg(`Regra criada para "${keyword}"!`);
        setTimeout(() => setSuccessMsg(""), 3000);
        
        // Reset
        setSimulationResult(null);
        // Refresh lists
        loadSuggestions();
        loadRules();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  // Pre-fill simulator when clicking a suggestion
  function selectSuggestion(proposal: RuleProposal) {
    setKeyword(proposal.token);
    setSimulationResult(null);
  }

  return (
    <div className="container max-w-7xl mx-auto p-8 font-sans">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-emerald-500" />
            Estúdio de Regras IA
          </h1>
          <Button 
            variant="outline" 
            className="rounded-xl font-bold gap-2 border-primary/20 text-primary hover:bg-primary/5"
            onClick={async () => {
              if (confirm("Deseja reaplicar todas as regras às transações existentes? Isto não afetará edições manuais.")) {
                const res = await reApplyAllRules();
                if (res.success) alert(`${res.updatedCount} transações atualizadas!`);
              }
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Reaplicar Regras em Massa
          </Button>
        </div>
        <p className="text-muted-foreground text-lg">
          Analise transações não categorizadas e crie regras inteligentes.
        </p>
      </div>

      <Tabs defaultValue="studio" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="studio">Estúdio de Criação</TabsTrigger>
          <TabsTrigger value="list">Regras Ativas ({existingRules.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="studio">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Panel: Suggestions */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="border-border bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    Sugestões Automáticas
                  </CardTitle>
                  <CardDescription>
                    Termos frequentes "Sem Categoria"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {suggestionsLoading ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : suggestions.length === 0 ? (
                    <p className="text-center text-muted-foreground p-4">Nenhuma sugestão encontrada.</p>
                  ) : (
                    <div className="space-y-3">
                      {suggestions.map((s) => (
                        <div 
                          key={s.token}
                          onClick={() => selectSuggestion(s)}
                          className="group flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all"
                        >
                          <div>
                            <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                              {s.token}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Ex: {s.sampleDescription.substring(0, 25)}...
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-secondary/50">
                            {s.count}x
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button 
                    variant="ghost" 
                    className="w-full mt-4 text-muted-foreground hover:text-primary"
                    onClick={loadSuggestions}
                  >
                    Atualizar Lista
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel: Simulator */}
            <div className="lg:col-span-8 space-y-6">
          <Card className="border-border shadow-lg relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <CardHeader>
              <CardTitle>Configurar & Simular</CardTitle>
              <CardDescription>Teste se a regra captura as transações corretas antes de salvar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Keyword (Contém)</Label>
                  <div className="relative">
                    <Input 
                      placeholder="Ex: AMAZON" 
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      className="h-12 text-lg font-medium"
                    />
                    {keyword && (
                      <div className="absolute right-3 top-3 text-xs text-muted-foreground font-mono bg-secondary px-2 py-0.5 rounded">
                        ILIKE %{keyword}%
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Categoria Destino</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          <div className="flex items-center gap-2">
                            <span>{CATEGORY_CONFIGS[cat]?.icon}</span>
                            <span>{cat}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button 
                  onClick={handleSimulate} 
                  disabled={!keyword || simulating}
                  variant="secondary"
                  size="lg"
                  className="w-full md:w-auto min-w-[150px]"
                >
                  {simulating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5 mr-2" />}
                  Simular
                </Button>

                <div className="flex-1 h-px bg-border mx-4" />

                <Button 
                  onClick={handleCreateRule} 
                  disabled={!keyword || !selectedCategory || creating || !simulationResult}
                  size="lg"
                  className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white min-w-[200px]"
                >
                  {creating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-2" />
                      Criar Regra Oficial
                    </>
                  )}
                </Button>
              </div>

              {successMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-emerald-600 animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 className="h-5 w-5" />
                  {successMsg}
                </div>
              )}

            </CardContent>
          </Card>

          {/* Simulation Results */}
          {simulationResult && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  Resultados da Simulação
                  <Badge variant="secondary" className="ml-2 text-primary bg-primary/10">
                    {simulationResult.matchedCount} encontrados
                  </Badge>
                </h3>
                {selectedCategory && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    Serão movidos para: 
                    <Badge className={`${CATEGORY_CONFIGS[selectedCategory]?.bgColor} ${CATEGORY_CONFIGS[selectedCategory]?.textColor} border-none`}>
                      {selectedCategory}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 p-3 bg-secondary/50 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                  <div className="pl-4">Transação</div>
                  <div>Categoria Atual</div>
                  <div className="pr-4 text-right">Valor</div>
                </div>
                
                {simulationResult.samples.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Nenhuma transação encontrada com o termo "{keyword}".
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {simulationResult.samples.map((tx) => (
                      <div key={tx.id} className="grid grid-cols-[1fr_auto_auto] gap-4 p-4 items-center hover:bg-muted/50 transition-colors">
                        <div className="flex flex-col gap-1 pl-2">
                          <span className="font-bold text-foreground">{tx.description}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(tx.date).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div>
                          <Badge variant="outline" className={tx.currentCategory === 'Outros' || !tx.currentCategory ? 'opacity-50' : ''}>
                            {tx.currentCategory || 'Sem Categoria'}
                          </Badge>
                          {selectedCategory && (
                            <span className="mx-2 text-muted-foreground">→</span>
                          )}
                          {selectedCategory && (
                             <Badge className={`${CATEGORY_CONFIGS[selectedCategory]?.bgColor} ${CATEGORY_CONFIGS[selectedCategory]?.textColor} border-none opacity-50`}>
                             {selectedCategory}
                           </Badge>
                          )}
                        </div>

                        <div className="text-right font-mono font-medium pr-2">
                          {formatCurrency(parseFloat(tx.amount))}
                        </div>
                      </div>
                    ))}
                    
                    {simulationResult.matchedCount > 50 && (
                      <div className="p-4 text-center text-sm text-muted-foreground bg-secondary/20">
                        ... e mais {simulationResult.matchedCount - 50} transações.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Regras Ativas</CardTitle>
              <CardDescription>Gerencie suas regras de categorização existentes.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingRules ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : existingRules.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Nenhuma regra criada ainda.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Keywords</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Tipo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {existingRules.map((rule: any) => (
                      <TableRow key={rule.id}>
                        <TableCell>
                          <Badge variant="outline">{rule.priority}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono max-w-[200px] truncate" title={rule.keywords}>
                          {rule.keywords}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                             {CATEGORY_CONFIGS[rule.category1]?.icon}
                             <Badge 
                               variant="secondary"
                               className={`${CATEGORY_CONFIGS[rule.category1]?.bgColor} ${CATEGORY_CONFIGS[rule.category1]?.textColor} border-none`}
                             >
                               {rule.category1}
                             </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{rule.type}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
