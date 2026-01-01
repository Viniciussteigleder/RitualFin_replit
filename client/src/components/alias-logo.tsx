import { cn } from "@/lib/utils";

interface AliasLogoProps {
  aliasDesc?: string | null;
  fallbackDesc?: string | null;
  logoUrl?: string | null;
  size?: number;
  showText?: boolean;
  className?: string;
}

export function AliasLogo({
  aliasDesc,
  fallbackDesc,
  logoUrl,
  size = 20,
  showText = false,
  className
}: AliasLogoProps) {
  const label = aliasDesc || fallbackDesc || "";
  return (
    <div className={cn("flex items-center gap-2 min-w-0", className)}>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={label}
          width={size}
          height={size}
          className="rounded-full bg-white object-contain border border-muted"
          style={{ width: size, height: size }}
        />
      ) : null}
      {showText ? <span className="truncate">{label}</span> : null}
    </div>
  );
}
