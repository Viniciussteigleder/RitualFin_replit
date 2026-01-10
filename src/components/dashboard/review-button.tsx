"use client";

import { Button } from "@/components/ui/button";
import { confirmTransaction } from "@/lib/actions/transactions";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ReviewButton({ transactionId }: { transactionId: string }) {
  const [loading, setLoading] = useState(false);

  const handleReview = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await confirmTransaction(transactionId);
      toast.success("Transação validada!");
    } catch (error) {
      toast.error("Erro ao validar transação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="rounded-xl h-8 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20 hover:bg-primary/10"
      onClick={handleReview}
      disabled={loading}
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Validar"}
    </Button>
  );
}
