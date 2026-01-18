"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CSVForm, ScreenshotForm } from "./forms";
import { ImportWizard } from "@/components/imports/import-wizard";
import { FileText, Smartphone, CloudUpload } from "lucide-react";

export function UploadClient() {
  return (
    <div className="flex flex-col gap-6">
      <ImportWizard>
        <div className="bg-card rounded-[2.5rem] p-2 shadow-sm border border-border">
          <Tabs defaultValue="csv" className="w-full">
            <div className="flex justify-center p-4 md:p-6 pb-2">
              <TabsList className="bg-secondary/50 p-1.5 h-auto rounded-[1.5rem] gap-1 md:gap-2 border border-border flex-wrap justify-center">
                <TabsTrigger
                  value="csv"
                  className="rounded-2xl px-4 py-3 md:px-10 md:py-4 data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] gap-2 md:gap-3 transition-all"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Extrato Bancário</span>
                  <span className="sm:hidden">CSV</span>
                </TabsTrigger>
                <TabsTrigger
                  value="screenshot"
                  className="rounded-2xl px-4 py-3 md:px-10 md:py-4 data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] gap-2 md:gap-3 transition-all"
                >
                  <Smartphone className="h-4 w-4" />
                  <span className="hidden sm:inline">Evidência (Print)</span>
                  <span className="sm:hidden">Print</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-4 md:p-8 lg:p-12">
              <TabsContent value="csv" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 lg:gap-16 items-center">
                  <div className="space-y-8">
                    <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary shadow-inner">
                      <CloudUpload className="h-10 w-10" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-foreground mb-4 font-display tracking-tight">Upload de Extrato CSV</h3>
                      <p className="text-muted-foreground font-medium leading-relaxed text-base">
                        Seu banco, seu controle. Arraste seu arquivo CSV e nossa IA processará e categorizará cada transação com precisão instantânea.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-sm font-bold text-foreground/80">
                        <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,113,227,0.4)]" />
                        Deduplicação Inteligente
                      </div>
                      <div className="flex items-center gap-4 text-sm font-bold text-foreground/80">
                        <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,113,227,0.4)]" />
                        Classificação em Tempo Real
                      </div>
                      <div className="flex items-center gap-4 text-sm font-bold text-foreground/80">
                        <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,113,227,0.4)]" />
                        Vínculo Automático com Contas
                      </div>
                    </div>
                  </div>
                  <div className="bg-secondary/40 rounded-[2rem] p-10 border-2 border-dashed border-border group hover:border-primary/50 transition-colors">
                    <CSVForm />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="screenshot" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 lg:gap-16 items-center">
                    <div className="space-y-8">
                      <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary shadow-inner">
                        <Smartphone className="h-10 w-10" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-foreground mb-4 font-display tracking-tight">Extração de Comprovantes</h3>
                        <p className="text-muted-foreground font-medium leading-relaxed text-base">
                          Capturou um gasto no impulso? Faça o upload do print e nós extrairemos o valor, data e estabelecimento automaticamente.
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 text-sm font-bold text-foreground/80">
                          <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,113,227,0.4)]" />
                          OCR de Alta Precisão
                        </div>
                        <div className="flex items-center gap-4 text-sm font-bold text-foreground/80">
                          <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,113,227,0.4)]" />
                          Detecção de Estabelecimentos
                        </div>
                      </div>
                    </div>
                    <div className="bg-secondary/40 rounded-[2rem] p-10 border-2 border-dashed border-border group hover:border-primary/50 transition-colors">
                      <ScreenshotForm />
                    </div>
                 </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </ImportWizard>
    </div>
  );
}
