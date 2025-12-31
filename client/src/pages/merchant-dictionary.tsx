import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Edit2, Trash2, BookOpen, Filter, Download, Upload, Sparkles, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { merchantDictionaryApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import * as XLSX from 'xlsx';

export default function MerchantDictionaryPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [manualFilter, setManualFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingAlias, setEditingAlias] = useState("");
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [editedSuggestions, setEditedSuggestions] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importPreview, setImportPreview] = useState<{
    rows: Array<{ source: string; keyDesc: string; aliasDesc: string }>;
    errors: string[];
  } | null>(null);

  // Fetch descriptions with filters
  const { data: descriptions = [], isLoading } = useQuery({
    queryKey: ["merchant-descriptions", sourceFilter, search, manualFilter],
    queryFn: () => {
      const filters: any = {};
      if (sourceFilter !== "all") filters.source = sourceFilter;
      if (search) filters.search = search;
      if (manualFilter !== "all") filters.isManual = manualFilter === "manual";
      return merchantDictionaryApi.listDescriptions(filters);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, aliasDesc }: { id: string; aliasDesc: string }) =>
      merchantDictionaryApi.updateDescription(id, { aliasDesc }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-descriptions"] });
      setEditingId(null);
      setEditingAlias("");
      toast({ title: "Alias atualizado com sucesso" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => merchantDictionaryApi.deleteDescription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-descriptions"] });
      toast({ title: "Mapeamento removido" });
    },
  });

  const suggestionsMutation = useMutation({
    mutationFn: merchantDictionaryApi.suggestAliases,
    onSuccess: (data) => {
      const suggestions = data?.suggestions || [];
      setSelectedSuggestions(new Set(suggestions.map((s: any) => s.id)));
      toast({ title: `${suggestions.length} sugestões geradas` });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao gerar sugestões", description: error.message, variant: "destructive" });
    },
  });

  const applySuggestionsMutation = useMutation({
    mutationFn: async (items: any[]) => {
      for (const item of items) {
        await merchantDictionaryApi.updateDescription(item.id, { aliasDesc: item.suggestedAlias });
      }
      return items.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["merchant-descriptions"] });
      toast({ title: `${count} sugestões aplicadas` });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao aplicar sugestões", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (desc: any) => {
    setEditingId(desc.id);
    setEditingAlias(desc.aliasDesc);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editingAlias.trim()) return;
    updateMutation.mutate({ id: editingId, aliasDesc: editingAlias });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingAlias("");
  };

  const handleDelete = (id: string) => {
    if (confirm("Remover este mapeamento?")) {
      deleteMutation.mutate(id);
    }
  };

  const suggestions = suggestionsMutation.data?.suggestions || [];

  const toggleSuggestion = (id: string) => {
    const next = new Set(selectedSuggestions);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedSuggestions(next);
  };

  const updateSuggestion = (id: string, value: string) => {
    setEditedSuggestions((prev) => ({ ...prev, [id]: value }));
  };

  const applySelected = () => {
    const toApply = suggestions
      .filter((s: any) => selectedSuggestions.has(s.id))
      .map((s: any) => ({
        ...s,
        suggestedAlias: editedSuggestions[s.id] || s.suggestedAlias
      }));
    if (toApply.length === 0) {
      toast({ title: "Selecione ao menos uma sugestão", variant: "destructive" });
      return;
    }
    applySuggestionsMutation.mutate(toApply);
  };

  const handleDownloadExcel = async () => {
    const exportData = await merchantDictionaryApi.exportDescriptions();
    if (!exportData || exportData.length === 0) {
      toast({ title: "Nenhum dado para exportar", variant: "destructive" });
      return;
    }

    const excelData = exportData.map((d: any) => ({
      'Fonte': d.Source,
      'Descrição Chave': d['Key Description'],
      'Alias': d.Alias,
      'Manual': d.Manual === 'Yes' ? 'Sim' : 'Não',
      'Criado em': new Date(d.Created).toLocaleString('pt-BR'),
      'Atualizado em': new Date(d.Updated).toLocaleString('pt-BR')
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    ws['!cols'] = [
      { wch: 15 }, // Fonte
      { wch: 50 }, // Descrição Chave
      { wch: 30 }, // Alias
      { wch: 10 }, // Manual
      { wch: 20 }, // Criado em
      { wch: 20 }  // Atualizado em
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Merchant Aliases');

    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `ritualfin_merchant_aliases_${date}.xlsx`);

    toast({ title: `${excelData.length} registros exportados` });
  };

  const handleDownloadTemplate = () => {
    const excelData = [{
      'Fonte': 'Sparkasse',
      'Descrição Chave': 'Exemplo de descrição do banco',
      'Alias': 'Exemplo de alias amigável'
    }];

    const ws = XLSX.utils.json_to_sheet(excelData);
    ws['!cols'] = [
      { wch: 15 },
      { wch: 50 },
      { wch: 30 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Merchant Aliases');

    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `ritualfin_merchant_aliases_modelo_${date}.xlsx`);
  };

  const handleUploadExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          toast({ title: "Arquivo vazio", variant: "destructive" });
          return;
        }

        // Validate and import data
        const toImport: any[] = [];
        const errors: string[] = [];

        jsonData.forEach((row: any, index: number) => {
          const rowNum = index + 2;

          // Validate required fields
          if (!row['Fonte'] || !['Sparkasse', 'Amex', 'M&M'].includes(row['Fonte'])) {
            errors.push(`Linha ${rowNum}: Fonte deve ser "Sparkasse", "Amex" ou "M&M"`);
            return;
          }
          if (!row['Descrição Chave']) {
            errors.push(`Linha ${rowNum}: Descrição Chave é obrigatória`);
            return;
          }
          if (!row['Alias']) {
            errors.push(`Linha ${rowNum}: Alias é obrigatório`);
            return;
          }

          toImport.push({
            source: row['Fonte'],
            keyDesc: row['Descrição Chave'],
            aliasDesc: row['Alias']
          });
        });

        if (toImport.length === 0) {
          toast({ title: "Nenhum registro válido para importar", variant: "destructive" });
          return;
        }

        setImportPreview({ rows: toImport, errors });

      } catch (error: any) {
        toast({
          title: "Erro ao processar arquivo",
          description: error.message,
          variant: "destructive"
        });
      }
    };

    reader.readAsBinaryString(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview) return;

    try {
      const result = await merchantDictionaryApi.bulkUpsertDescriptions(importPreview.rows);
      queryClient.invalidateQueries({ queryKey: ["merchant-descriptions"] });
      setImportPreview(null);

      const created = result?.created || 0;
      const updated = result?.updated || 0;
      const failed = result?.failed || 0;
      const baseMessage = `${created} novos, ${updated} atualizados`;
      if (failed > 0) {
        toast({
          title: "Importação concluída com alertas",
          description: `${baseMessage} • ${failed} com erro`
        });
      } else {
        toast({ title: "Importação concluída", description: baseMessage });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao importar",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const SOURCE_COLORS: Record<string, string> = {
    "Sparkasse": "bg-blue-100 text-blue-700",
    "Amex": "bg-green-100 text-green-700",
    "M&M": "bg-purple-100 text-purple-700"
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dicionário de Comerciantes</h1>
            <p className="text-muted-foreground">
              Gerencie aliases padronizados para descrições de transações
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              className="gap-2"
              onClick={handleDownloadTemplate}
            >
              <Download className="h-4 w-4" />
              Baixar modelo
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleDownloadExcel}
              disabled={descriptions.length === 0}
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>

            <Button
              variant="outline"
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Importar
            </Button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadExcel}
              accept=".xlsx,.xls"
              className="hidden"
            />
          </div>
        </div>

        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Sugestões IA para Aliases
                </h2>
                <p className="text-sm text-muted-foreground">
                  Gere aliases amigáveis com base nas keywords do dicionário.
                </p>
              </div>
              <Button
                className="gap-2"
                onClick={() => suggestionsMutation.mutate()}
                disabled={suggestionsMutation.isPending}
              >
                {suggestionsMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Gerar sugestões
              </Button>
            </div>

            {suggestions.length > 0 && (
              <div className="space-y-3">
                {suggestions.map((s: any) => (
                  <div key={s.id} className="flex flex-col md:flex-row md:items-center gap-3 border rounded-lg p-3 bg-white/70">
                    <div className="flex items-start gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedSuggestions.has(s.id)}
                        onChange={() => toggleSuggestion(s.id)}
                        className="mt-1"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{s.keyDesc}</p>
                        <p className="text-xs text-muted-foreground">
                          Atual: {s.currentAlias || "—"}
                        </p>
                        {s.reason && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {s.reason}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        className="h-8 w-[220px]"
                        value={editedSuggestions[s.id] ?? s.suggestedAlias}
                        onChange={(e) => updateSuggestion(s.id, e.target.value)}
                      />
                      <Badge variant="secondary" className="text-[10px]">
                        {s.confidence ?? 0}%
                      </Badge>
                    </div>
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button
                    className="gap-2"
                    onClick={applySelected}
                    disabled={applySuggestionsMutation.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Aplicar sugestões
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total</p>
                  <p className="text-3xl font-bold mt-1">{descriptions.length}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Manual</p>
                  <p className="text-3xl font-bold mt-1 text-amber-600">
                    {descriptions.filter((d: any) => d.isManual).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Auto</p>
                  <p className="text-3xl font-bold mt-1 text-gray-600">
                    {descriptions.filter((d: any) => !d.isManual).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Fontes</p>
                  <p className="text-3xl font-bold mt-1">
                    {new Set(descriptions.map((d: any) => d.source)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por descrição ou alias..."
              className="pl-9 bg-white border-0 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[180px] bg-white border-0 shadow-sm">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Fonte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Fontes</SelectItem>
              <SelectItem value="Sparkasse">Sparkasse</SelectItem>
              <SelectItem value="Amex">Amex</SelectItem>
              <SelectItem value="M&M">M&M</SelectItem>
            </SelectContent>
          </Select>

          <Select value={manualFilter} onValueChange={setManualFilter}>
            <SelectTrigger className="w-[180px] bg-white border-0 shadow-sm">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="auto">Auto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-0">
            {descriptions.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-primary/50" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhum alias encontrado</h3>
                <p className="text-muted-foreground">
                  Os aliases serão criados automaticamente ao importar transações.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {descriptions.map((desc: any) => (
                  <div key={desc.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`text-xs ${SOURCE_COLORS[desc.source]}`}>
                            {desc.source}
                          </Badge>
                          {desc.isManual && (
                            <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">
                              Manual
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-2 truncate" title={desc.keyDesc}>
                          {desc.keyDesc}
                        </p>

                        {editingId === desc.id ? (
                          <div className="flex gap-2 items-center">
                            <Input
                              value={editingAlias}
                              onChange={(e) => setEditingAlias(e.target.value)}
                              className="max-w-md"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit();
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                            />
                            <Button size="sm" onClick={handleSaveEdit} disabled={updateMutation.isPending}>
                              Salvar
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <p className="font-medium">{desc.aliasDesc}</p>
                        )}
                      </div>

                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(desc)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                          onClick={() => handleDelete(desc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!importPreview} onOpenChange={(open) => !open && setImportPreview(null)}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Pré-visualizar importação</DialogTitle>
          </DialogHeader>
          {importPreview && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/20 p-3 text-sm">
                <div className="flex flex-wrap gap-3">
                  <span>
                    <strong>{importPreview.rows.length}</strong> válidos
                  </span>
                  <span>
                    <strong>{importPreview.errors.length}</strong> com erro
                  </span>
                </div>
                {importPreview.errors.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Corrija os erros no arquivo e reimporte para máxima precisão.
                  </p>
                )}
              </div>

              {importPreview.errors.length > 0 && (
                <div className="rounded-lg border p-3 text-xs text-rose-700 bg-rose-50">
                  <p className="font-semibold mb-2">Erros encontrados</p>
                  <ul className="space-y-1">
                    {importPreview.errors.slice(0, 5).map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                  {importPreview.errors.length > 5 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      +{importPreview.errors.length - 5} erros adicionais
                    </p>
                  )}
                </div>
              )}

              <div className="rounded-lg border p-3 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground mb-2">Amostra</p>
                <div className="space-y-2">
                  {importPreview.rows.slice(0, 3).map((row, index) => (
                    <div key={`${row.keyDesc}-${index}`}>
                      <p className="font-medium text-foreground">{row.aliasDesc}</p>
                      <p>{row.source} • {row.keyDesc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportPreview(null)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmImport}>
              Importar agora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
