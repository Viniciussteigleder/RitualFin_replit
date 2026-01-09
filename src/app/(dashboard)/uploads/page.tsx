import { BatchList } from "./batch-list";
import { UploadClient } from "./upload-client";
import { History } from "lucide-react";

export default function UploadsPage() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 pb-32">
      <UploadClient />

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <History className="h-5 w-5 text-gray-400" />
          <h2 className="text-xl font-black text-[#111816] dark:text-white tracking-tight">Histórico de Importação</h2>
        </div>
        <BatchList />
      </div>
    </div>
  );
}

