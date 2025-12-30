/**
 * Onboarding Welcome Modal
 *
 * 3-step wizard for first-time users:
 * 1. Welcome to RitualFin
 * 2. Upload your first CSV
 * 3. Review and confirm
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  FileSpreadsheet,
  Zap,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

const ONBOARDING_KEY = "ritualfin_onboarding_completed";

interface OnboardingModalProps {
  /** Force show (for testing/preview) */
  forceShow?: boolean;
}

export function OnboardingModal({ forceShow = false }: OnboardingModalProps) {
  const [, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed || forceShow) {
      // Small delay for better UX
      setTimeout(() => setIsOpen(true), 500);
    }
  }, [forceShow]);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsOpen(false);

    // Navigate to uploads page
    if (currentStep === 2) {
      navigate("/uploads");
    }
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsOpen(false);
  };

  const steps = [
    {
      icon: Sparkles,
      iconColor: "#10b981",
      title: "Bem-vindo ao RitualFin",
      description: "Sua vida financeira organizada em minutos, não horas.",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            RitualFin usa inteligência artificial para categorizar suas transações automaticamente.
            Você só precisa revisar e confirmar.
          </p>
          <div className="grid grid-cols-3 gap-3 py-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium">Importe CSV</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                <Zap className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-sm font-medium">IA Categoriza</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="h-6 w-6 text-amber-600" />
              </div>
              <p className="text-sm font-medium">Você Confirma</p>
            </div>
          </div>
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm mb-1">Modo Lazy Ativado</p>
                <p className="text-xs text-muted-foreground">
                  O sistema aprende com suas confirmações e melhora a cada mês.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      icon: FileSpreadsheet,
      iconColor: "#3b82f6",
      title: "Bancos Suportados",
      description: "Importe extratos de múltiplos bancos e cartões.",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            RitualFin detecta automaticamente o formato do seu CSV e extrai todas as informações.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Miles & More</p>
                <p className="text-xs text-muted-foreground">Cartão de crédito Lufthansa</p>
              </div>
              <Badge className="bg-primary/10 text-primary border-0 text-xs">Ativo</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">American Express</p>
                <p className="text-xs text-muted-foreground">Multi-cartões suportado</p>
              </div>
              <Badge className="bg-primary/10 text-primary border-0 text-xs">Ativo</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Sparkasse</p>
                <p className="text-xs text-muted-foreground">Conta bancária IBAN</p>
              </div>
              <Badge className="bg-primary/10 text-primary border-0 text-xs">Ativo</Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            <strong>Em breve:</strong> Nubank, Revolut, N26, Wise
          </p>
        </div>
      )
    },
    {
      icon: TrendingUp,
      iconColor: "#10b981",
      title: "Pronto para começar!",
      description: "Vamos importar seu primeiro arquivo CSV.",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Depois de importar, você poderá:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Revisar transações pendentes</p>
                <p className="text-xs text-muted-foreground">
                  Confirme as categorizações sugeridas pela IA
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Criar regras de categorização</p>
                <p className="text-xs text-muted-foreground">
                  Ensine o sistema a reconhecer suas despesas recorrentes
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Visualizar insights financeiros</p>
                <p className="text-xs text-muted-foreground">
                  Dashboard com gastos por categoria e projeções
                </p>
              </div>
            </div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <p className="text-sm text-emerald-800">
              <strong>Dica:</strong> Comece importando o último mês para ver o RitualFin em ação!
            </p>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary/10 to-emerald-100/50 p-8 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${currentStepData.iconColor}15` }}
            >
              <Icon className="w-8 h-8" style={{ color: currentStepData.iconColor }} />
            </div>
            <div className="flex gap-1.5">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    idx === currentStep
                      ? "bg-primary w-6"
                      : idx < currentStep
                      ? "bg-primary/50"
                      : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">{currentStepData.title}</h2>
          <p className="text-muted-foreground">{currentStepData.description}</p>
        </div>

        {/* Content */}
        <div className="p-8 pt-6">
          {currentStepData.content}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 pt-0">
          {currentStep > 0 ? (
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          ) : (
            <Button variant="ghost" onClick={handleSkip}>
              Pular introdução
            </Button>
          )}

          {currentStep < steps.length - 1 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              Próximo
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              className="bg-emerald-600 hover:bg-emerald-700 gap-2"
            >
              Começar
              <Upload className="h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
