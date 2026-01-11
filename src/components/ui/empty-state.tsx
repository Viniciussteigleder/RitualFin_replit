import { LucideIcon } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "secondary" | "outline";
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
  className,
}: EmptyStateProps) {
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
      
      <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || "default"}
          className="min-w-[160px]"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

/**
 * Empty State with Illustration
 * For more prominent empty states with custom illustrations
 */
interface EmptyStateWithIllustrationProps extends Omit<EmptyStateProps, 'icon'> {
  illustration?: React.ReactNode;
}

export function EmptyStateWithIllustration({
  illustration,
  title,
  description,
  action,
  className,
}: EmptyStateWithIllustrationProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 px-4 text-center",
        className
      )}
    >
      {illustration && (
        <div className="mb-8 opacity-60">
          {illustration}
        </div>
      )}
      
      <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
      
      <p className="text-base text-muted-foreground max-w-lg mb-8 leading-relaxed">
        {description}
      </p>

      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || "default"}
          size="lg"
          className="min-w-[200px]"
        >
          {action.label}
        </Button>
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
  className,
}: {
  icon: LucideIcon;
  message: string;
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
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
}
