"use client";

import { useState, useEffect, useMemo } from "react";
import { Globe, Sparkles, Settings2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { savePreferences, PreferencesData } from "@/lib/actions/settings";
import { toast } from "sonner";

export function PreferencesForm() {
  const [data, setData] = useState<PreferencesData>({
    language: "pt-PT",
    currency: "EUR",
    autoApproval: false,
    confidenceThreshold: "90",
    viewMode: "normal",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save function
  const debouncedSave = useMemo(() => {
    return debounce((newData: PreferencesData) => {
      setIsSaving(true);
      const toastId = toast.loading("Salvando preferências...");

      savePreferences(newData)
        .then(() => {
          toast.success("Preferências salvas", { id: toastId });
          setIsSaving(false);
        })
        .catch(() => {
          toast.error("Erro ao salvar", { id: toastId });
          setIsSaving(false);
        });
    }, 1000);
  }, []);

  const updateField = (field: keyof PreferencesData, value: any) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    debouncedSave(newData);
  };

  return (
      <div className="bg-card border border-border rounded-2xl p-10 shadow-sm space-y-12">
               
       {/* Section: Locality */}
       <section>
        <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Globe className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-2xl font-bold text-foreground font-display tracking-tight">Região e Formato</h3>
              {isSaving && <span className="text-xs text-muted-foreground animate-pulse">Salvando alterações...</span>}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label htmlFor="language" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Idioma</Label>
            <Select 
              value={data.language} 
              onValueChange={(val) => updateField("language", val)}
            >
              <SelectTrigger id="language" className="h-14 bg-secondary/30 border-transparent rounded-2xl focus:ring-4 focus:ring-primary/5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="pt-PT">Português (Portugal)</SelectItem>
                <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                <SelectItem value="en-US">English (US)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label htmlFor="currency" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Moeda Padrão</Label>
            <Select 
              value={data.currency}
              onValueChange={(val) => updateField("currency", val)}
            >
              <SelectTrigger id="currency" className="h-14 bg-secondary/30 border-transparent rounded-2xl focus:ring-4 focus:ring-primary/5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="EUR">Euro (€)</SelectItem>
                <SelectItem value="BRL">Real (R$)</SelectItem>
                <SelectItem value="USD">Dólar ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
       </section>

       <Separator className="bg-border/50" />

       {/* Section: AI Automation */}
       <section>
        <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground font-display tracking-tight">Automação IA</h3>
              <p className="text-sm font-medium text-muted-foreground">Otimize a velocidade de classificação.</p>
            </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between p-6 rounded-2xl bg-secondary/20 border border-border/50">
            <div className="space-y-1">
              <h4 className="font-bold text-sm">Auto-Aprovação</h4>
              <p className="text-xs font-medium text-muted-foreground italic">Confirmar automaticamente quando confiança {'>'} 90%</p>
            </div>
            <Switch 
              checked={data.autoApproval}
              onCheckedChange={(checked) => updateField("autoApproval", checked)}
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-3">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Limiar de Confiança</Label>
              <Select 
                value={data.confidenceThreshold}
                onValueChange={(val) => updateField("confidenceThreshold", val)}
              >
                <SelectTrigger className="h-14 bg-secondary/30 border-transparent rounded-2xl focus:ring-4 focus:ring-primary/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="95">95% (Máximo rigor)</SelectItem>
                  <SelectItem value="90">90% (Padrão sugerido)</SelectItem>
                  <SelectItem value="80">80% (Mais agilidade)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
       </section>

       <Separator className="bg-border/50" />

       {/* Section: UI */}
       <section>
        <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Settings2 className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold text-foreground font-display tracking-tight">Interface</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-3 max-w-sm">
            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Vista Padrão do Extrato</Label>
            <Select 
              value={data.viewMode}
              onValueChange={(val) => updateField("viewMode", val)}
            >
              <SelectTrigger className="h-14 bg-secondary/30 border-transparent rounded-2xl focus:ring-4 focus:ring-primary/5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="normal">Normal (Confortável)</SelectItem>
                <SelectItem value="compact">Compacta (Alta densidade)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
       </section>
    </div>
  );
}

// Simple debounce helper
function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
