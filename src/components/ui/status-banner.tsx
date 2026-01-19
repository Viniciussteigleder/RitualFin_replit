import * as React from "react"
import { cn } from "@/lib/utils"
import { Info, AlertCircle, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"

export type StatusType = "info" | "success" | "warning" | "error" | "pending"

interface StatusBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  type: StatusType
  message: string
  payload?: any
  onRetry?: () => void
}

const statusConfig = {
  info: {
    icon: Info,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    iconColor: "text-blue-500",
  },
  success: {
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
    iconColor: "text-emerald-500",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    iconColor: "text-amber-500",
  },
  error: {
    icon: XCircle,
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-800",
    iconColor: "text-rose-500",
  },
  pending: {
    icon: AlertCircle,
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-800",
    iconColor: "text-slate-500",
  },
}

export function StatusBanner({
  type,
  message,
  payload,
  className,
  ...props
}: StatusBannerProps) {
  const config = statusConfig[type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium transition-[opacity,transform] duration-300 animate-in fade-in slide-in-from-top-2",
        config.bg,
        config.border,
        config.text,
        className
      )}
      {...props}
    >
      <Icon className={cn("h-5 w-5 shrink-0", config.iconColor)} />
      <span className="flex-1">{message}</span>
      {payload && (
        <details className="cursor-pointer group">
          <summary className="text-xs opacity-60 hover:opacity-100 transition-opacity list-none uppercase tracking-widest font-bold">
            Debug
          </summary>
          <pre className="mt-2 p-3 bg-black/5 rounded font-mono text-[10px] overflow-auto max-h-32">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}
