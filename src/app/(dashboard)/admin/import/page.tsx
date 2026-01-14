"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { importCSVData } from "@/lib/actions/import-data";
import { applyCategorization } from "@/lib/actions/categorization";
import { Loader2, Upload, CheckCircle2, XCircle, Tags, Check } from "lucide-react";

export default function AdminImportPage() {
  const [loading, setLoading] = useState(false);
  const [categorizingLoading, setCategorizingLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [categorizationResult, setCategorizationResult] = useState<any>(null);

  const handleImport = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await importCSVData();
      setResult(res);
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategorization = async () => {
    setCategorizingLoading(true);
    setCategorizationResult(null);

    try {
      const res = await applyCategorization();
      setCategorizationResult(res);
    } catch (error: any) {
      setCategorizationResult({
        success: false,
        error: error.message,
      });
    } finally {
      setCategorizingLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">Importação de Dados</h1>
        <p className="text-muted-foreground">
          Importar dados reais dos arquivos CSV e aplicar categorização automática
        </p>
      </div>

      {/* CSV Import Card */}
      <Card className="p-8 mb-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">1. Importar Transações (CSV)</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Miles & More Gold Credit Card (374 transações)</li>
              <li>• Sparkasse Girokonto (254 transações)</li>
              <li>• American Express (296 transações)</li>
            </ul>
          </div>

          <Button
            onClick={handleImport}
            disabled={loading}
            size="lg"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Iniciar Importação CSV
              </>
            )}
          </Button>

          {result && (
            <div className={`mt-6 p-6 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className={`font-semibold mb-2 ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                    {result.success ? 'Importação Concluída!' : 'Erro na Importação'}
                  </h3>
                  
                  {result.success && (
                    <div className="space-y-1.5 text-sm text-green-800">
                      <p className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Arquivos processados: {result.filesProcessed}/3</p>
                      <p className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Contas criadas: {result.accountsCreated}</p>
                      <p className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Transações importadas: {result.transactionsImported}</p>
                      <p className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Duplicadas ignoradas: {result.transactionsSkipped}</p>
                    </div>
                  )}

                  {result.error && (
                    <p className="text-sm text-red-800">{result.error}</p>
                  )}

                  {result.errors && result.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-red-900 mb-1">Erros:</p>
                      <ul className="text-sm text-red-800 space-y-1">
                        {result.errors.map((err: string, i: number) => (
                          <li key={i}>• {err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Categorization Card */}
      <Card className="p-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">2. Aplicar Categorização Automática</h2>
            <p className="text-sm text-muted-foreground">
              Aplica regras de categorização a todas as transações importadas usando keywords e aliases.
            </p>
          </div>

          <Button
            onClick={handleCategorization}
            disabled={categorizingLoading}
            size="lg"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {categorizingLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Categorizando...
              </>
            ) : (
              <>
                <Tags className="mr-2 h-5 w-5" />
                Aplicar Categorização
              </>
            )}
          </Button>

          {categorizationResult && (
            <div className={`mt-6 p-6 rounded-lg ${categorizationResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-start gap-3">
                {categorizationResult.success ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className={`font-semibold mb-2 ${categorizationResult.success ? 'text-green-900' : 'text-red-900'}`}>
                    {categorizationResult.success ? 'Categorização Concluída!' : 'Erro na Categorização'}
                  </h3>
                  
                  {categorizationResult.success && (
                    <div className="space-y-1.5 text-sm text-green-800">
                      <p className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Total de transações: {categorizationResult.total}</p>
                      <p className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Categorizadas automaticamente: {categorizationResult.categorized}</p>
                      <p className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Requerem revisão: {categorizationResult.needsReview}</p>
                    </div>
                  )}

                  {categorizationResult.error && (
                    <p className="text-sm text-red-800">{categorizationResult.error}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {(result?.success || categorizationResult?.success) && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Próximos passos:</strong> Navegue para a página de Transações ou Dashboard para ver os dados importados e categorizados.
          </p>
        </div>
      )}
    </div>
  );
}
