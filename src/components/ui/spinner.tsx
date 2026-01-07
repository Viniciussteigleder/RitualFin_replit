import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useLocale } from "@/hooks/use-locale"
import { spinnerCopy, t as translate } from "@/lib/i18n"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  const locale = useLocale()
  return (
    <Loader2Icon
      role="status"
      aria-label={translate(locale, spinnerCopy.loading)}
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
