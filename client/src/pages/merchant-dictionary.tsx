import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Edit2, Trash2, BookOpen, Filter, Download, Upload, Sparkles } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // AI suggestion mutation
  const aiSuggestMutation = useMutation({
    mutationFn: async ({ keyDesc, source }: { keyDesc: string; source: string }) => {
      const res = await fetch("/api/merchant-descriptions/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyDesc, source })
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erro ao sugerir alias");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setEditingAlias(data.suggestedAlias);
      toast({ title: "Sugestão recebida!", description: "Revise e salve se aprovar" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na sugestão AI",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const handleEdit = (desc: any) => {
    setEditingId(desc.id);
    setEditingAlias(desc.aliasDesc);
  };

  const handleAISuggest = (keyDesc: string, source: string) => {
    aiSuggestMutation.mutate({ keyDesc, source });
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

  const handleDownloadExcel = async () => {
    if (descriptions.length === 0) {
      toast({ title: "Nenhum dado para exportar", variant: "destructive" });
      return;
    }

    const excelData = descriptions.map((d: any) => ({
      'Fonte': d.source,
      'Descrição Chave': d.keyDesc,
      'Alias': d.aliasDesc,
      'Manual': d.isManual ? 'Sim' : 'Não',
      'Criado em': new Date(d.createdAt).toLocaleString('pt-BR'),
      'Atualizado em': new Date(d.updatedAt).toLocaleString('pt-BR')
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

    toast({ title: `${descriptions.length} registros exportados` });
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

        if (errors.length > 0) {
          toast({
            title: "Erros encontrados no arquivo",
            description: errors.slice(0, 3).join('; '),
            variant: "destructive"
          });
          return;
        }

        if (toImport.length === 0) {
          toast({ title: "Nenhum registro válido para importar", variant: "destructive" });
          return;
        }

        // Import records one by one
        let successCount = 0;
        let failCount = 0;

        for (const record of toImport) {
          try {
            await merchantDictionaryApi.createDescription(record);
            successCount++;
          } catch (error) {
            failCount++;
          }
        }

        // Refresh list
        queryClient.invalidateQueries({ queryKey: ["merchant-descriptions"] });

        if (failCount === 0) {
          toast({ title: `${successCount} registros importados com sucesso` });
        } else {
          toast({
            title: "Importação concluída com erros",
            description: `${successCount} importados, ${failCount} falharam`
          });
        }

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

          <div className="flex gap-2">
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
                          <div className="flex gap-2 items-center flex-wrap">
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
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAISuggest(desc.keyDesc, desc.source)}
                              disabled={aiSuggestMutation.isPending}
                              className="gap-1.5"
                            >
                              {aiSuggestMutation.isPending ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Sparkles className="h-3.5 w-3.5" />
                              )}
                              Sugerir com IA
                            </Button>
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
    </AppLayout>
  );
}
