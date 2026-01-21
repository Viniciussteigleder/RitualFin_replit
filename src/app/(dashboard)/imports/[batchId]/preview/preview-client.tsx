"use client";

import { useState, useMemo } from "react";
import { 
  Database, 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  FileSearch,
  Check,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { commitBatch } from "@/lib/actions/ingest";
import { useRouter } from "next/navigation";

interface PreviewClientProps {
  batchId: string;
  initialItems: any[];
  diagnostics: any;
  canProceed: boolean;
}

type SortField = 'date' | 'description' | 'amount' | 'category';
type SortOrder = 'asc' | 'desc';

export function PreviewClient({ batchId, initialItems, diagnostics, canProceed }: PreviewClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(100);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = initialItems.map(item => ({
      ...item,
      data: item.parsedPayload as any
    }));

    // Filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(item => 
        (item.data.descNorm || item.data.description || "").toLowerCase().includes(lowerSearch) ||
        (item.data.category1 || "").toLowerCase().includes(lowerSearch)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(item => item.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (sortField) {
        case 'date':
          valA = new Date(a.data.paymentDate || a.data.date).getTime();
          valB = new Date(b.data.paymentDate || b.data.date).getTime();
          break;
        case 'description':
          valA = (a.data.descNorm || a.data.description || "").toLowerCase();
          valB = (b.data.descNorm || b.data.description || "").toLowerCase();
          break;
        case 'amount':
          valA = Number(a.data.amount) || 0;
          valB = Number(b.data.amount) || 0;
          break;
        case 'category':
          valA = (a.data.category1 || "").toLowerCase();
          valB = (b.data.category1 || "").toLowerCase();
          break;
        default:
          return 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [initialItems, searchTerm, statusFilter, sortField, sortOrder]);

  const visibleItems = useMemo(() => {
    return filteredAndSortedItems.slice(0, visibleCount);
  }, [filteredAndSortedItems, visibleCount]);

  const hasMore = visibleCount < filteredAndSortedItems.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 100);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const result = await commitBatch(batchId);
      if (result.success) {
        router.push("/transactions");
      } else {
        alert("Erro ao confirmar importação: " + (result.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao processar solicitação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAllDuplicates = diagnostics?.newCount === 0 && diagnostics?.duplicates > 0;

  return (
    <div className="space-y-10">
      
      {/* State Callout for Duplicates */}
      {isAllDuplicates && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-[2rem] p-8 flex items-start gap-6 animate-fade-in">
          <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
            <AlertTriangle className="h-7 w-7 text-white" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-amber-600 font-display">Nenhuma Nova Transação Detectada</h3>
            <p className="text-sm font-medium text-amber-700/80 leading-relaxed max-w-2xl">
              Todas as <strong>{diagnostics.duplicates} linhas</strong> deste arquivo já existem no seu histórico. 
              O RitualFin evita duplicatas automaticamente para manter seu saldo correto. 
              Você pode cancelar esta importação sem prejuízo aos seus dados.
            </p>
          </div>
        </div>
      )}

      {/* Sorting & Filtering Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-6 rounded-[2.5rem] border border-border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Pesquisar nestes registros..." 
            className="pl-12 h-14 bg-secondary/30 border-none rounded-2xl font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px] h-14 rounded-2xl bg-secondary/30 border-none font-bold">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="pending">Novas</SelectItem>
              <SelectItem value="duplicate">Duplicatas</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="h-14 w-14 rounded-2xl border-border bg-secondary/30" onClick={() => {
            setSearchTerm("");
            setStatusFilter("all");
            setSortField('date');
            setSortOrder('desc');
          }}>
            <XCircle className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Preview Grid */}
      <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-8 md:p-10 border-b border-border bg-secondary/10 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <FileSearch className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground font-display tracking-tight">Detalhamento dos Dados</h3>
                <p className="text-xs text-muted-foreground font-medium">Visualizando {visibleItems.length} de {filteredAndSortedItems.length} registros</p>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl">
                {diagnostics?.newCount || 0} Novos
              </Badge>
              <Badge className="bg-orange-500/10 text-orange-600 border-none text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl">
                {diagnostics?.duplicates || 0} Duplicados
              </Badge>
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/5">
                <th 
                  className="text-left p-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest cursor-pointer hover:bg-secondary/10 transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-2">
                    Data {sortField === 'date' ? (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-30" />}
                  </div>
                </th>
                <th 
                  className="text-left p-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest cursor-pointer hover:bg-secondary/10 transition-colors"
                  onClick={() => handleSort('description')}
                >
                  <div className="flex items-center gap-2">
                    Estabelecimento {sortField === 'description' ? (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-30" />}
                  </div>
                </th>
                <th 
                  className="text-right p-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest cursor-pointer hover:bg-secondary/10 transition-colors"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center gap-2 justify-end">
                    Valor {sortField === 'amount' ? (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-30" />}
                  </div>
                </th>
                <th 
                  className="text-left p-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest cursor-pointer hover:bg-secondary/10 transition-colors"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center gap-2">
                    Categoria {sortField === 'category' ? (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-30" />}
                  </div>
                </th>
                <th className="p-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibleItems.map((item, index) => {
                const data = item.data;
                const isNegative = Number(data.amount) < 0;
                const isDuplicate = item.status === "duplicate";

                return (
                  <tr key={item.id} className={cn(
                    "hover:bg-secondary/10 transition-colors group",
                    isDuplicate && "opacity-60 grayscale-[0.5]"
                  )}>
                    <td className="p-6 text-muted-foreground font-medium text-xs whitespace-nowrap">
                      {new Date(data.paymentDate || data.date).toLocaleDateString("pt-PT")}
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-base font-bold text-foreground tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                          {data.descNorm || data.description}
                        </span>
                        {isDuplicate && <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">Já Importado</span>}
                      </div>
                    </td>
                    <td className={cn(
                      "p-6 text-right font-bold text-lg tracking-tighter tabular-nums",
                      isNegative ? "text-destructive" : "text-emerald-500"
                    )}>
                      {formatCurrency(data.amount)}
                    </td>
                    <td className="p-6">
                      <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-secondary/50 border-none rounded-lg text-muted-foreground/70">
                        {data.category1 || "Não Classificado"}
                      </Badge>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex justify-center">
                        {isDuplicate ? (
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center" title="Duplicata ignorada">
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center" title="Nova transação">
                            <Check className="h-4 w-4 text-emerald-500" />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {hasMore && (
            <div className="p-8 border-t border-border bg-secondary/5 flex justify-center">
              <Button 
                variant="outline" 
                className="rounded-xl font-bold gap-2 px-10 h-12 hover:bg-primary/5 hover:text-primary transition-[background-color,color,border-color,box-shadow,opacity] duration-150"
                onClick={handleLoadMore}
              >
                Carregar Mais 100 Registros
              </Button>
            </div>
          )}
          
          {visibleItems.length === 0 && (
            <div className="p-20 text-center space-y-4">
              <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mx-auto">
                <Search className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <p className="text-muted-foreground font-medium">Nenhum registro encontrado para os filtros aplicados.</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-2">
	      <Button variant="secondary" className="h-16 w-full sm:w-auto px-10 rounded-2xl font-bold text-muted-foreground hover:text-foreground transition-[background-color,color,box-shadow,opacity] duration-150" asChild>
	         <Link href="/uploads">
	            ← Sair sem Salvar
	         </Link>
	      </Button>
	        {canProceed && (
	          <Button 
	            onClick={handleConfirm}
	            disabled={isSubmitting || isAllDuplicates}
	            className={cn(
	              "w-full sm:max-w-md h-16 text-white transition-[background-color,box-shadow,transform,opacity] duration-150 rounded-2xl font-bold shadow-2xl gap-3 text-lg border-none",
	              isAllDuplicates 
	                ? "bg-muted cursor-not-allowed opacity-50" 
	                : "bg-primary hover:scale-105 active:scale-95 shadow-primary/20"
	            )}
	          >
            {isSubmitting ? (
              <span className="flex items-center gap-2 animate-pulse">Processando...</span>
            ) : isAllDuplicates ? (
              <>
                <XCircle className="h-6 w-6" />
                Nada a Importar
              </>
            ) : (
              <>
                <CheckCircle2 className="h-6 w-6" />
                Confirmar {diagnostics.newCount} Novas
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
