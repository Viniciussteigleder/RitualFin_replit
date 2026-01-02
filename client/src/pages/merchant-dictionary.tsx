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
import { merchantDictionaryCopy, t as translate } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";
import * as XLSX from 'xlsx';

export default function MerchantDictionaryPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [manualFilter, setManualFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingAlias, setEditingAlias] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formatMessage = (template: string, vars: Record<string, string | number>) =>
    Object.entries(vars).reduce((result, [key, value]) => result.replace(`{${key}}`, String(value)), template);
  const dateTimeFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
  const columnKeys = {
    source: [translate(locale, merchantDictionaryCopy.sourceLabel), "Fonte"],
    keyDesc: [translate(locale, merchantDictionaryCopy.keyDescLabel), "Descrição Chave"],
    alias: [translate(locale, merchantDictionaryCopy.aliasLabel), "Alias"],
    manual: [translate(locale, merchantDictionaryCopy.manualLabel), "Manual"]
  };

  const getRowValue = (row: Record<string, any>, keys: string[]) => {
    const key = keys.find((k) => Object.prototype.hasOwnProperty.call(row, k));
    return key ? row[key] : undefined;
  };

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
      toast({ title: translate(locale, merchantDictionaryCopy.toastAliasUpdated) });
    },
    onError: (error: any) => {
      toast({ title: translate(locale, merchantDictionaryCopy.toastUpdateError), description: error.message, variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => merchantDictionaryApi.deleteDescription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-descriptions"] });
      toast({ title: translate(locale, merchantDictionaryCopy.toastRemoved) });
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
        throw new Error(error.error || translate(locale, merchantDictionaryCopy.toastSuggestError));
      }
      return res.json();
    },
    onSuccess: (data) => {
      setEditingAlias(data.suggestedAlias);
      toast({ title: translate(locale, merchantDictionaryCopy.toastSuggestionReady), description: translate(locale, merchantDictionaryCopy.toastSuggestionBody) });
    },
    onError: (error: any) => {
      toast({
        title: translate(locale, merchantDictionaryCopy.toastAiError),
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
    if (confirm(translate(locale, merchantDictionaryCopy.confirmDelete))) {
      deleteMutation.mutate(id);
    }
  };

  const handleDownloadExcel = async () => {
    if (descriptions.length === 0) {
      toast({ title: translate(locale, merchantDictionaryCopy.exportEmpty), variant: "destructive" });
      return;
    }

    const excelData = descriptions.map((d: any) => ({
      [translate(locale, merchantDictionaryCopy.sourceLabel)]: d.source,
      [translate(locale, merchantDictionaryCopy.keyDescLabel)]: d.keyDesc,
      [translate(locale, merchantDictionaryCopy.aliasLabel)]: d.aliasDesc,
      [translate(locale, merchantDictionaryCopy.manualLabel)]: d.isManual ? translate(locale, merchantDictionaryCopy.yes) : translate(locale, merchantDictionaryCopy.no),
      [translate(locale, merchantDictionaryCopy.createdAt)]: dateTimeFormatter.format(new Date(d.createdAt)),
      [translate(locale, merchantDictionaryCopy.updatedAt)]: dateTimeFormatter.format(new Date(d.updatedAt))
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

    toast({ title: formatMessage(translate(locale, merchantDictionaryCopy.exportCount), { count: descriptions.length }) });
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
          toast({ title: translate(locale, merchantDictionaryCopy.importEmpty), variant: "destructive" });
          return;
        }

        // Validate and import data
        const toImport: any[] = [];
        const errors: string[] = [];

        jsonData.forEach((row: any, index: number) => {
          const rowNum = index + 2;
          const sourceValue = getRowValue(row, columnKeys.source);
          const keyDescValue = getRowValue(row, columnKeys.keyDesc);
          const aliasValue = getRowValue(row, columnKeys.alias);

          // Validate required fields
          if (!sourceValue || !['Sparkasse', 'Amex', 'M&M'].includes(sourceValue)) {
            errors.push(formatMessage(translate(locale, merchantDictionaryCopy.importSourceError), { row: rowNum }));
            return;
          }
          if (!keyDescValue) {
            errors.push(formatMessage(translate(locale, merchantDictionaryCopy.importKeyError), { row: rowNum }));
            return;
          }
          if (!aliasValue) {
            errors.push(formatMessage(translate(locale, merchantDictionaryCopy.importAliasError), { row: rowNum }));
            return;
          }

          toImport.push({
            source: sourceValue,
            keyDesc: keyDescValue,
            aliasDesc: aliasValue
          });
        });

        if (errors.length > 0) {
          toast({
            title: translate(locale, merchantDictionaryCopy.importErrors),
            description: errors.slice(0, 3).join('; '),
            variant: "destructive"
          });
          return;
        }

        if (toImport.length === 0) {
          toast({ title: translate(locale, merchantDictionaryCopy.importNoneValid), variant: "destructive" });
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
          toast({ title: formatMessage(translate(locale, merchantDictionaryCopy.importSuccess), { count: successCount }) });
        } else {
          toast({
            title: translate(locale, merchantDictionaryCopy.importPartialTitle),
            description: formatMessage(translate(locale, merchantDictionaryCopy.importPartialBody), { success: successCount, fail: failCount })
          });
        }

      } catch (error: any) {
        toast({
          title: translate(locale, merchantDictionaryCopy.importProcessError),
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
            <h1 className="text-2xl font-bold">{translate(locale, merchantDictionaryCopy.headerTitle)}</h1>
            <p className="text-muted-foreground">
              {translate(locale, merchantDictionaryCopy.headerSubtitle)}
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
              {translate(locale, merchantDictionaryCopy.exportLabel)}
            </Button>

            <Button
              variant="outline"
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              {translate(locale, merchantDictionaryCopy.importLabel)}
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
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{translate(locale, merchantDictionaryCopy.statTotal)}</p>
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
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{translate(locale, merchantDictionaryCopy.statManual)}</p>
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
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{translate(locale, merchantDictionaryCopy.statAuto)}</p>
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
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{translate(locale, merchantDictionaryCopy.statSources)}</p>
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
              placeholder={translate(locale, merchantDictionaryCopy.searchPlaceholder)}
              className="pl-9 bg-white border-0 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[180px] bg-white border-0 shadow-sm">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder={translate(locale, merchantDictionaryCopy.filterSource)} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{translate(locale, merchantDictionaryCopy.filterAllSources)}</SelectItem>
              <SelectItem value="Sparkasse">Sparkasse</SelectItem>
              <SelectItem value="Amex">Amex</SelectItem>
              <SelectItem value="M&M">M&M</SelectItem>
            </SelectContent>
          </Select>

          <Select value={manualFilter} onValueChange={setManualFilter}>
            <SelectTrigger className="w-[180px] bg-white border-0 shadow-sm">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder={translate(locale, merchantDictionaryCopy.filterType)} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{translate(locale, merchantDictionaryCopy.filterAll)}</SelectItem>
              <SelectItem value="manual">{translate(locale, merchantDictionaryCopy.filterManualOnly)}</SelectItem>
              <SelectItem value="auto">{translate(locale, merchantDictionaryCopy.filterAutoOnly)}</SelectItem>
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
                <h3 className="text-lg font-semibold mb-2">{translate(locale, merchantDictionaryCopy.emptyTitle)}</h3>
                <p className="text-muted-foreground">
                  {translate(locale, merchantDictionaryCopy.emptyBody)}
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
                              {translate(locale, merchantDictionaryCopy.manualBadge)}
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
                              {translate(locale, merchantDictionaryCopy.suggestAi)}
                            </Button>
                            <Button size="sm" onClick={handleSaveEdit} disabled={updateMutation.isPending}>
                              {translate(locale, merchantDictionaryCopy.save)}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                              {translate(locale, merchantDictionaryCopy.cancel)}
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
