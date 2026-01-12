"use client";

import { useState } from "react";
import { diagnoseRuleMatch } from "@/lib/actions/diagnose-rule";
import { Button } from "@/components/ui/button";
import { Bug } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DebugRuleSection() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleDebug = async () => {
    setLoading(true);
    setLogs([]);
    try {
      const res = await diagnoseRuleMatch();
      setLogs(res.logs || ["No logs returned."]);
    } catch (error: any) {
      setLogs([`Error: ${error.message}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
            <Bug className="w-4 h-4" />
            Debug Rule
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Rule Diagnosis</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto bg-slate-950 text-slate-50 p-4 rounded-md font-mono text-xs space-y-1">
            {loading && <div className="text-yellow-400">Running diagnosis...</div>}
            {!loading && logs.length === 0 && <div className="text-gray-400">Click Run Debug to start.</div>}
            {logs.map((log, i) => (
                <div key={i} className="break-all whitespace-pre-wrap">{log}</div>
            ))}
        </div>

        <div className="flex justify-end pt-4">
            <Button onClick={handleDebug} disabled={loading}>
                {loading ? "Running..." : "Run Diagnosis"}
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
