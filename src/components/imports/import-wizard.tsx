"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Check, Upload, Eye, CheckCircle } from "lucide-react";

type WizardStep = "upload" | "preview" | "confirm";

interface ImportWizardProps {
  onComplete?: (batchId: string) => void;
  children?: React.ReactNode;
}

interface ImportWizardContextValue {
  currentStep: WizardStep;
  batchId: string | null;
  completeUpload: (newBatchId: string) => void;
  goToConfirm: () => void;
  reset: () => void;
}

const ImportWizardContext = createContext<ImportWizardContextValue | null>(null);

export function useImportWizard(): ImportWizardContextValue {
  const ctx = useContext(ImportWizardContext);
  if (!ctx) throw new Error("useImportWizard must be used within <ImportWizard />");
  return ctx;
}

export function useImportWizardOptional(): ImportWizardContextValue | null {
  return useContext(ImportWizardContext);
}

export function ImportWizard({ onComplete, children }: ImportWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>("upload");
  const [batchId, setBatchId] = useState<string | null>(null);
  const router = useRouter();

  const steps = [
    { id: "upload", label: "Upload", icon: Upload },
    { id: "preview", label: "Preview", icon: Eye },
    { id: "confirm", label: "Confirm", icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const completeUpload = useCallback((newBatchId: string) => {
    setBatchId(newBatchId);
    setCurrentStep("preview");
    router.push(`/imports/${newBatchId}/preview`);
  }, [router]);

  const value = useMemo<ImportWizardContextValue>(() => {
    return {
      currentStep,
      batchId,
      completeUpload,
      goToConfirm: () => setCurrentStep("confirm"),
      reset: () => {
        setCurrentStep("upload");
        setBatchId(null);
      },
    };
  }, [batchId, completeUpload, currentStep]);

  return (
    <ImportWizardContext.Provider value={value}>
      <div className="space-y-6">
      {/* Progress Indicator */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;

                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                        isCompleted && "bg-emerald-600 border-emerald-600 text-white",
                        isActive && "bg-indigo-600 border-indigo-600 text-white",
                        !isActive && !isCompleted && "bg-white border-slate-200 text-slate-400"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="ml-3">
                      <div
                        className={cn(
                          "text-sm font-bold",
                          isActive && "text-slate-900",
                          !isActive && "text-slate-400"
                        )}
                      >
                        Step {index + 1}
                      </div>
                      <div
                        className={cn(
                          "text-xs",
                          isActive && "text-slate-600",
                          !isActive && "text-slate-400"
                        )}
                      >
                        {step.label}
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          "w-16 h-0.5 mx-4",
                          isCompleted ? "bg-emerald-600" : "bg-slate-200"
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {children}
      </div>
    </ImportWizardContext.Provider>
  );
}
