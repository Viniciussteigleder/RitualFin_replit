import { BatchList } from "./batch-list";
import { UploadClient } from "./upload-client";
import { History, Database, UploadCloud } from "lucide-react";

export default function UploadsPage() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 pb-32 px-1 font-sans">
       {/* Header Section */}
       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-card p-10 rounded-[3rem] border border-border shadow-sm animate-fade-in-up">
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/10 rounded-2xl transition-transform duration-300 hover:scale-110">
                        <Database className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h1 className="text-4xl font-bold text-foreground tracking-tight font-display">Central de Importação</h1>
                </div>
                <p className="text-muted-foreground font-medium max-w-xl leading-relaxed">
                    Arraste arquivos para alimentar o sistema. Suas faturas são processadas, padronizadas e enriquecidas automaticamente.
                </p>
            </div>

             <div className="flex items-center gap-4 bg-secondary/30 p-4 rounded-3xl border border-border shadow-inner px-6 transition-all duration-300 hover:shadow-md hover:scale-105">
                <div className="flex flex-col items-end mr-2">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Status do Sistema</span>
                    <span className="text-xs font-bold text-emerald-500">Operacional</span>
                </div>
                <div className="h-3 w-3 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981] animate-pulse"></div>
            </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Area - Takes 2/3 */}
        <div className="lg:col-span-2 space-y-8">
            <UploadClient />
        </div>

        {/* History Area - Takes 1/3 */}
        <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
                <History className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest">Timeline de Ingestão</h3>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm min-h-[500px]">
                 <BatchList />
            </div>
        </div>
      </div>
    </div>
  );
}

