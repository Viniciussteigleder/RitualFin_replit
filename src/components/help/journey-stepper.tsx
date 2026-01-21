"use client";

import { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface JourneyStep {
  id: string;
  number: number;
  title: string;
  icon: LucideIcon;
  whatHappens: string;
  whatUserDoes: string;
  screenLinks: { name: string; href: string }[];
  checklist: string[];
}

interface JourneyStepperProps {
  steps: JourneyStep[];
}

export function JourneyStepper({ steps }: JourneyStepperProps) {
  const [activeStep, setActiveStep] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* Desktop: Horizontal Stepper */}
      <div className="hidden md:flex items-center justify-between gap-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          const isLast = idx === steps.length - 1;
          
          return (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => setActiveStep(isActive ? null : step.id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all w-full",
                  isActive 
                    ? "border-primary bg-primary/5 shadow-md" 
                    : "border-border bg-card hover:border-primary/50 hover:bg-secondary/30"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
                  isActive ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                )}>
                  {step.number}
                </div>
                <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                <span className={cn(
                  "text-xs font-semibold text-center",
                  isActive ? "text-primary" : "text-foreground"
                )}>
                  {step.title}
                </span>
              </button>
              {!isLast && (
                <ChevronRight className="h-5 w-5 text-muted-foreground mx-1 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: Vertical Stepper */}
      <div className="md:hidden space-y-3">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(isActive ? null : step.id)}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border-2 transition-all w-full text-left",
                isActive 
                  ? "border-primary bg-primary/5 shadow-md" 
                  : "border-border bg-card hover:border-primary/50"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                isActive ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
              )}>
                {step.number}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn(
                    "text-sm font-semibold",
                    isActive ? "text-primary" : "text-foreground"
                  )}>
                    {step.title}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded Step Details */}
      {activeStep && (
        <div className="p-6 rounded-xl border border-primary/30 bg-primary/5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {(() => {
            const step = steps.find(s => s.id === activeStep);
            if (!step) return null;
            const Icon = step.icon;
            
            return (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    {step.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <h3 className="font-bold text-lg text-foreground">{step.title}</h3>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-foreground">O que acontece</h4>
                    <p className="text-sm text-muted-foreground">{step.whatHappens}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-foreground">O que você faz</h4>
                    <p className="text-sm text-muted-foreground">{step.whatUserDoes}</p>
                  </div>
                </div>

                {step.screenLinks.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-foreground">Telas relacionadas</h4>
                    <div className="flex flex-wrap gap-2">
                      {step.screenLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.href}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                        >
                          {link.name}
                          <ChevronRight className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {step.checklist.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                      Checklist rápido
                    </h4>
                    <ul className="space-y-1">
                      {step.checklist.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
