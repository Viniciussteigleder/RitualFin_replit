"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, PlayCircle } from "lucide-react";
import { applyCategorization } from "@/lib/actions/categorization";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ReRunRulesButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleReRun = () => {
    toast.info("Re-applying rules...", {
         description: "This may take a moment for large datasets."
    });
    
    startTransition(async () => {
      try {
        const result = await applyCategorization();
        if (result.success) {
          toast.success("Rules Re-applied Successfully", {
            description: `Processed ${result.total} transactions. Categorized: ${result.categorized}.`,
          });
          router.refresh();
        } else {
          toast.error("Failed to re-apply rules", {
            description: result.error,
          });
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
      }
    });
  };

  return (
    <Button 
        variant="secondary" 
        onClick={handleReRun} 
        disabled={isPending}
        className="gap-2 font-medium"
        title="Re-apply all rules to non-manual transactions"
    >
      {isPending ? (
        <RefreshCw className="w-4 h-4 animate-spin" />
      ) : (
        <PlayCircle className="w-4 h-4" />
      )}
      {isPending ? "Processing..." : "Re-run Rules"}
    </Button>
  );
}
