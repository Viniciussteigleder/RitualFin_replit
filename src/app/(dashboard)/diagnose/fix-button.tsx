"use client";

import { useState } from "react";
import { fixAppCategoryIssues } from "@/lib/actions/fix-rules";
import { Button } from "@/components/ui/button";
import { Loader2, Wrench, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FixButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const router = useRouter();

  const handleFix = async () => {
    if (!confirm("This will attempt to fix missing app category mappings by defaulting unmapped leaves to 'OPEN'. Continue?")) return;
    
    setLoading(true);
    try {
      const res = await fixAppCategoryIssues();
      setResult(res);
      router.refresh();
    } catch (error) {
      console.error(error);
      setResult({ success: false, message: "Failed to execute fix" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button 
          onClick={handleFix} 
          disabled={loading}
          variant="destructive"
          className="gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wrench className="h-4 w-4" />}
          Auto-Fix Issues
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => router.refresh()}
          className="gap-2"
        >
            <RefreshCw className="h-4 w-4" />
            Refresh
        </Button>
      </div>

      {result && (
        <div className={`p-4 rounded-lg border ${result.success ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
          <p className="font-bold">{result.message}</p>
          {result.log && (
            <ul className="list-disc list-inside mt-2 text-sm">
              {result.log.map((l: string, i: number) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
