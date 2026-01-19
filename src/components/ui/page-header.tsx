import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

/**
 * PageHeader - Standardized header for all dashboard pages
 *
 * Design principles:
 * - Calm, desktop-first financial UX
 * - Icon-led with clear semantics
 * - Minimal decorative elements
 * - Consistent spacing and typography
 */
interface PageHeaderProps {
  /** Page icon from lucide-react */
  icon: LucideIcon;
  /** Icon color variant */
  iconColor?: "primary" | "emerald" | "amber" | "blue" | "violet" | "rose";
  /** Main page title */
  title: string;
  /** Descriptive subtitle (PT-BR) */
  subtitle?: string;
  /** Optional right-side actions */
  actions?: React.ReactNode;
  /** Optional badge/stats to show */
  badge?: React.ReactNode;
  /** Additional className for container */
  className?: string;
}

const iconColorMap = {
  primary: "bg-primary/10 text-primary",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export function PageHeader({
  icon: Icon,
  iconColor = "primary",
  title,
  subtitle,
  actions,
  badge,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col md:flex-row md:items-center justify-between gap-6",
        "bg-card p-6 md:p-8 rounded-2xl border border-border",
        "relative z-10", // Prevent positioning issues
        className
      )}
    >
      <div className="flex flex-col gap-3">
        {/* Icon + Title Row */}
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-xl", iconColorMap[iconColor])}>
            <Icon className="h-6 w-6" strokeWidth={2} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            {title}
          </h1>
          {badge && <div className="ml-2">{badge}</div>}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Actions */}
      {actions && (
        <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>
      )}
    </header>
  );
}

/**
 * PageContainer - Standardized page container
 */
interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        "max-w-7xl mx-auto flex flex-col gap-6 pb-24 px-1",
        "relative", // Establish positioning context
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * EmptyState - Standardized empty state component
 */
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-card border border-border rounded-2xl">
      <div className="w-16 h-16 bg-secondary/50 rounded-2xl flex items-center justify-center mb-6">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">{description}</p>
      {action?.href && (
        <Link
          href={action.href}
          className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

/**
 * SectionCard - Standardized section container
 */
interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

const paddingMap = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function SectionCard({ children, className, padding = "md" }: SectionCardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-2xl",
        paddingMap[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * StatusBadge - Standardized status indicator
 */
interface StatusBadgeProps {
  status: "success" | "warning" | "error" | "info" | "neutral";
  label: string;
  pulse?: boolean;
}

const statusColorMap = {
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  error: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  neutral: "bg-secondary text-muted-foreground",
};

export function StatusBadge({ status, label, pulse }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium",
        statusColorMap[status]
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={cn(
            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
            status === "success" && "bg-emerald-400",
            status === "warning" && "bg-amber-400",
            status === "error" && "bg-rose-400",
            status === "info" && "bg-blue-400",
          )} />
          <span className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            status === "success" && "bg-emerald-500",
            status === "warning" && "bg-amber-500",
            status === "error" && "bg-rose-500",
            status === "info" && "bg-blue-500",
          )} />
        </span>
      )}
      {label}
    </span>
  );
}
