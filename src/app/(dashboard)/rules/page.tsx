import { auth } from "@/auth";
import { getRules } from "@/lib/actions/rules";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { RulesManager } from "@/components/rules/rules-manager";

export default async function RulesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground font-bold">Por favor, faça login para ver suas regras.</p>
      </div>
    );
  }

  const rules = await getRules();

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 pb-32 px-1 font-sans">
        {/* Page Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight font-display mb-2">Regras de Classificação</h1>
            <p className="text-muted-foreground font-medium max-w-2xl leading-relaxed">Crie automações poderosas para organizar seus gastos automaticamente através de palavras-chave.</p>
          </div>
          {/* Future: Add Create Rule logic here or inside Manager */}
        </div>
      
        <RulesManager initialRules={rules} />
    </div>
  );
}
