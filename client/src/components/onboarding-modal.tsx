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
import { onboardingCopy, t as translate } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";

const ONBOARDING_KEY = "ritualfin_onboarding_completed";

interface OnboardingModalProps {
  /** Force show (for testing/preview) */
  forceShow?: boolean;
}

export function OnboardingModal({ forceShow = false }: OnboardingModalProps) {
  const [, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const locale = useLocale();
  const t = (key: keyof typeof onboardingCopy) => translate(locale, onboardingCopy[key]);

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
      title: t("step1Title"),
      description: t("step1Description"),
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            {t("step1Body")}
          </p>
          <div className="grid grid-cols-3 gap-3 py-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium">{t("step1CardImport")}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                <Zap className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-sm font-medium">{t("step1CardAi")}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="h-6 w-6 text-amber-600" />
              </div>
              <p className="text-sm font-medium">{t("step1CardConfirm")}</p>
            </div>
          </div>
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm mb-1">{t("step1BadgeTitle")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("step1BadgeBody")}
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
      title: t("step2Title"),
      description: t("step2Description"),
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            {t("step2Body")}
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Miles & More</p>
                <p className="text-xs text-muted-foreground">{t("step2MilesDesc")}</p>
              </div>
              <Badge className="bg-primary/10 text-primary border-0 text-xs">{t("statusActive")}</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">American Express</p>
                <p className="text-xs text-muted-foreground">{t("step2AmexDesc")}</p>
              </div>
              <Badge className="bg-primary/10 text-primary border-0 text-xs">{t("statusActive")}</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Sparkasse</p>
                <p className="text-xs text-muted-foreground">{t("step2SparkasseDesc")}</p>
              </div>
              <Badge className="bg-primary/10 text-primary border-0 text-xs">{t("statusActive")}</Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("step2ComingSoon")}
          </p>
        </div>
      )
    },
    {
      icon: TrendingUp,
      iconColor: "#10b981",
      title: t("step3Title"),
      description: t("step3Description"),
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            {t("step3Body")}
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{t("step3BulletReviewTitle")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("step3BulletReviewBody")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{t("step3BulletRulesTitle")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("step3BulletRulesBody")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{t("step3BulletInsightsTitle")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("step3BulletInsightsBody")}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <p className="text-sm text-emerald-800">
              {t("step3Tip")}
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
              {t("back")}
            </Button>
          ) : (
            <Button variant="ghost" onClick={handleSkip}>
              {t("skipIntro")}
            </Button>
          )}

          {currentStep < steps.length - 1 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              {t("next")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              className="bg-emerald-600 hover:bg-emerald-700 gap-2"
            >
              {t("start")}
              <Upload className="h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
