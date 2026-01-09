"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CSVForm, ScreenshotForm } from "./forms";
import { ImportWizard } from "@/components/imports/import-wizard";
import { FileText, Smartphone, CloudUpload } from "lucide-react";

export function UploadClient() {
  return (
    <div className="flex flex-col gap-10">
      {/* Page Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#111816] dark:text-white tracking-tight font-display mb-1">Importar Dados</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Conecte seus extratos bancários ou faça upload de comprovantes.</p>
        </div>
      </div>

      <ImportWizard>
        <div className="bg-white dark:bg-[#1a2c26] rounded-[32px] p-2 shadow-sm border border-gray-100 dark:border-gray-800">
          <Tabs defaultValue="csv" className="w-full">
            <div className="flex justify-center p-4">
              <TabsList className="bg-gray-100 dark:bg-black/20 p-1.5 h-auto rounded-2xl gap-2">
                <TabsTrigger 
                  value="csv" 
                  className="rounded-xl px-8 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-[#253832] data-[state=active]:shadow-sm text-xs font-black uppercase tracking-widest gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Extrato Bancário
                </TabsTrigger>
                <TabsTrigger 
                  value="screenshot" 
                  className="rounded-xl px-8 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-[#253832] data-[state=active]:shadow-sm text-xs font-black uppercase tracking-widest gap-2"
                >
                  <Smartphone className="h-4 w-4" />
                  Evidência (Print)
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-4 md:p-8">
              <TabsContent value="csv" className="mt-0 focus-visible:outline-none">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary-dark">
                      <CloudUpload className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-[#111816] dark:text-white mb-2">Upload de Extrato CSV</h3>
                      <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                        Arraste seu arquivo CSV ou selecione do seu computador. Nossa IA irá processar e categorizar automaticamente cada transação.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-gray-300">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        Deduplicação Inteligente
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-gray-300">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        Classificação Automática
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-black/10 rounded-2xl p-8 border-2 border-dashed border-gray-200 dark:border-gray-800">
                    <CSVForm />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="screenshot" className="mt-0 focus-visible:outline-none">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                      <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary-dark">
                        <Smartphone className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-[#111816] dark:text-white mb-2">Capturar Evidência</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                          Tirou um print do comprovante? Faça o upload aqui e nós extrairemos o valor, data e estabelecimento para você.
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-black/10 rounded-2xl p-8 border-2 border-dashed border-gray-200 dark:border-gray-800">
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
