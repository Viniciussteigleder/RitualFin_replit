"use client";

import { LucideIcon, ArrowRight, Lightbulb } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: "default" | "secondary" | "outline";
  };
  hint?: string;
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

/**
 * Reusable Empty State Component
 * Used when lists, tables, or sections have no data
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  hint,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const ActionButton = action ? (
    action.href ? (
      <Link href={action.href}>
        <Button variant={action.variant || "default"} className="min-w-[160px] gap-2">
          {action.label}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    ) : (
      <Button
        onClick={action.onClick}
        variant={action.variant || "default"}
        className="min-w-[160px] gap-2"
      >
        {action.label}
        <ArrowRight className="h-4 w-4" />
      </Button>
    )
  ) : null;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
        <Icon className="h-8 w-8 text-muted-foreground/50" />
      </div>

      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>

      <p className="text-sm text-muted-foreground max-w-md mb-4 leading-relaxed">
        {description}
      </p>

      {hint && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 rounded-xl mb-6 text-left max-w-md">
          <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">{hint}</p>
        </div>
      )}

      <div className="flex flex-col items-center gap-2">
        {ActionButton}
        {secondaryAction && (
          secondaryAction.href ? (
            <Link href={secondaryAction.href}>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                {secondaryAction.label}
              </Button>
            </Link>
          ) : (
            <Button variant="ghost" size="sm" onClick={secondaryAction.onClick} className="text-muted-foreground">
              {secondaryAction.label}
            </Button>
          )
        )}
      </div>
    </div>
  );
}

/**
 * Hero Empty State
 * For prominent empty states on main pages
 */
interface HeroEmptyStateProps extends Omit<EmptyStateProps, "className"> {
  className?: string;
}

export function HeroEmptyState({
  icon: Icon,
  title,
  description,
  action,
  hint,
  secondaryAction,
  className,
}: HeroEmptyStateProps) {
  return (
    <div
      className={cn(
        "py-24 flex flex-col items-center justify-center text-center bg-card border border-border rounded-[3rem] shadow-sm overflow-hidden relative group",
        className
      )}
    >
      {/* Background gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -mt-48 group-hover:bg-primary/10 transition-colors duration-700" />

      <div className="relative z-10 flex flex-col items-center max-w-md px-6">
        {/* Icon */}
        <div className="w-20 h-20 bg-secondary/50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-10 w-10 text-muted-foreground/30" />
        </div>

        {/* Content */}
        <h3 className="text-2xl font-bold text-foreground mb-2 font-display">{title}</h3>
        <p className="text-muted-foreground font-medium leading-relaxed mb-6">{description}</p>

        {/* Hint */}
        {hint && (
          <div className="flex items-start gap-2 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 rounded-xl mb-6 text-left w-full">
            <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">{hint}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col items-center gap-3">
          {action && (
            action.href ? (
              <Link href={action.href}>
                <Button className="h-12 px-8 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-[transform,background-color,color,box-shadow,opacity] duration-150">
                  {action.label}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
                <Button
                  onClick={action.onClick}
                  className="h-12 px-8 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-[transform,background-color,color,box-shadow,opacity] duration-150"
                >
                  {action.label}
                  <ArrowRight className="h-4 w-4" />
                </Button>
            )
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <Link href={secondaryAction.href}>
                <Button variant="ghost" className="text-sm text-muted-foreground hover:text-primary">
                  {secondaryAction.label}
                </Button>
              </Link>
            ) : (
              <Button
                variant="ghost"
                onClick={secondaryAction.onClick}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Empty State with Illustration
 * For more prominent empty states with custom illustrations
 */
interface EmptyStateWithIllustrationProps extends Omit<EmptyStateProps, "icon"> {
  illustration?: React.ReactNode;
}

export function EmptyStateWithIllustration({
  illustration,
  title,
  description,
  action,
  hint,
  className,
}: EmptyStateWithIllustrationProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 px-4 text-center",
        className
      )}
    >
      {illustration && <div className="mb-8 opacity-60">{illustration}</div>}

      <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>

      <p className="text-base text-muted-foreground max-w-lg mb-6 leading-relaxed">
        {description}
      </p>

      {hint && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 rounded-xl mb-6 text-left max-w-md">
          <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">{hint}</p>
        </div>
      )}

      {action && (
        action.href ? (
          <Link href={action.href}>
            <Button variant={action.variant || "default"} size="lg" className="min-w-[200px]">
              {action.label}
            </Button>
          </Link>
        ) : (
          <Button
            onClick={action.onClick}
            variant={action.variant || "default"}
            size="lg"
            className="min-w-[200px]"
          >
            {action.label}
          </Button>
        )
      )}
    </div>
  );
}

/**
 * Compact Empty State
 * For smaller sections or inline empty states
 */
export function CompactEmptyState({
  icon: Icon,
  message,
  action,
  className,
}: {
  icon: LucideIcon;
  message: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-8 px-4 text-center",
        className
      )}
    >
      <Icon className="h-10 w-10 text-muted-foreground/30 mb-3" />
      <p className="text-sm font-medium text-muted-foreground mb-3">{message}</p>
      {action && (
        action.href ? (
          <Link href={action.href}>
            <Button variant="outline" size="sm" className="gap-1.5">
              {action.label}
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" onClick={action.onClick} className="gap-1.5">
            {action.label}
            <ArrowRight className="h-3 w-3" />
          </Button>
        )
      )}
    </div>
  );
}

/**
 * Card Empty State
 * For empty states inside cards
 */
export function CardEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "p-8 rounded-2xl border border-dashed border-border bg-card/50 flex flex-col items-center justify-center text-center",
        className
      )}
    >
      <div className="w-12 h-12 bg-secondary/50 rounded-xl flex items-center justify-center mb-3">
        <Icon className="h-6 w-6 text-muted-foreground/40" />
      </div>
      <h4 className="font-bold text-foreground mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground mb-4">{description}</p>
      {action && (
        action.href ? (
          <Link href={action.href}>
            <Button size="sm" variant="outline" className="rounded-lg gap-1.5">
              {action.label}
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        ) : (
          <Button size="sm" variant="outline" onClick={action.onClick} className="rounded-lg gap-1.5">
            {action.label}
            <ArrowRight className="h-3 w-3" />
          </Button>
        )
      )}
    </div>
  );
}
