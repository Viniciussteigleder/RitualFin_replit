"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Trash2, 
  Download, 
  Edit3, 
  X,
  CheckCircle2
} from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onClassifyAll: () => void;
  onExport: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onClassifyAll,
  onExport,
  onDelete,
  onClearSelection,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-[90%] md:w-auto animate-fade-in-up">
      <div className="bg-[#111816] dark:bg-primary text-white dark:text-[#111816] px-6 py-4 rounded-full shadow-2xl flex items-center justify-between gap-6 md:min-w-[500px]">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 dark:bg-black/10 rounded-full h-7 w-7 flex items-center justify-center text-xs font-black">
            {selectedCount}
          </div>
          <span className="text-sm font-bold whitespace-nowrap hidden sm:inline">Itens selecionados</span>
        </div>
        
        <div className="h-6 w-px bg-white/20 dark:bg-black/10 hidden sm:block" />
        
        <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end md:justify-start">
          <button 
            className="text-xs font-black hover:text-primary dark:hover:text-[#111816]/70 transition-colors uppercase tracking-widest flex items-center gap-2"
            onClick={onClassifyAll}
          >
            <Edit3 className="h-4 w-4 hidden md:block" />
            Classificar
          </button>
          
          <span className="text-white/20 dark:text-black/10 hidden md:block">•</span>
          
          <button 
            className="text-xs font-black hover:text-red-400 transition-colors uppercase tracking-widest flex items-center gap-2"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 hidden md:block" />
            Excluir
          </button>

          <button 
             className="bg-white dark:bg-[#111816] text-[#111816] dark:text-primary px-5 py-2 rounded-full text-xs font-black transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg"
             onClick={onClassifyAll}
          >
            <CheckCircle2 className="h-4 w-4" />
            Aprovar Seleção
          </button>
        </div>

        <button 
          className="p-1 hover:bg-white/10 dark:hover:bg-black/5 rounded-full transition-colors"
          onClick={onClearSelection}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
