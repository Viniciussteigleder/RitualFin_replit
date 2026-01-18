import { auth } from "@/auth";
import { BatchList } from "./batch-list";
import { UploadClient } from "./upload-client";
import { History, Database } from "lucide-react";
import { PageHeader, PageContainer, StatusBadge } from "@/components/ui/page-header";

export default async function UploadsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground font-medium">Por favor, faça login para importar arquivos.</p>
      </div>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        icon={Database}
        iconColor="emerald"
        title="Central de Importação"
        subtitle="Arraste arquivos para alimentar o sistema. Suas faturas são processadas, padronizadas e enriquecidas automaticamente."
        badge={<StatusBadge status="success" label="Operacional" pulse />}
      />

      {/* Upload Area - Full width */}
      <div className="mb-8">
        <UploadClient />
      </div>

      {/* History Area - Below */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <History className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Histórico de Importações
          </h3>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <BatchList />
        </div>
      </div>
    </PageContainer>
  );
}

export const dynamic = 'force-dynamic';
