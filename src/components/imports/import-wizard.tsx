"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Check, Upload, Eye, CheckCircle } from "lucide-react";

type WizardStep = "upload" | "preview" | "confirm";

interface ImportWizardProps {
  onComplete?: (batchId: string) => void;
  children?: React.ReactNode;
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

  const handleUploadComplete = (newBatchId: string) => {
    setBatchId(newBatchId);
    setCurrentStep("preview");
    router.push(`/imports/${newBatchId}/preview`);
  };

  return (
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
  );
}

export function useImportWizard() {
  const [step, setStep] = useState<WizardStep>("upload");
  const [batchId, setBatchId] = useState<string | null>(null);

  return {
    step,
    batchId,
    setStep,
    setBatchId,
    goToPreview: (id: string) => {
      setBatchId(id);
      setStep("preview");
    },
    goToConfirm: () => setStep("confirm"),
    reset: () => {
      setStep("upload");
      setBatchId(null);
    },
  };
}
