import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandKey = "amex" | "sparkasse" | "mm";

const BRAND: Record<
  BrandKey,
  { src: string; alt: string; containerRadiusClass: string; imagePaddingClass: string }
> = {
  amex: {
    src: "/logos/amex.png",
    alt: "American Express",
    containerRadiusClass: "rounded-[15px]",
    imagePaddingClass: "p-1.5",
  },
  sparkasse: {
    src: "/logos/sparkasse.png",
    alt: "Sparkasse",
    containerRadiusClass: "rounded-2xl",
    imagePaddingClass: "p-1.5",
  },
  mm: {
    src: "/logos/mm.png",
    alt: "Miles & More",
    containerRadiusClass: "rounded-2xl",
    imagePaddingClass: "p-1",
  },
};

function getBrandKey(input?: string | null): BrandKey | null {
  if (!input) return null;
  const normalized = input.trim().toLowerCase();
  if (normalized.includes("sparkasse")) return "sparkasse";
  if (normalized.includes("amex") || normalized.includes("american express")) return "amex";
  if (normalized.includes("m&m") || normalized.includes("miles")) return "mm";
  return null;
}

export function AccountLogo({
  institution,
  className,
  imageClassName,
  fallback,
}: {
  institution?: string | null;
  className?: string;
  imageClassName?: string;
  fallback?: React.ReactNode;
}) {
  const key = getBrandKey(institution);
  if (!key) return <>{fallback ?? null}</>;

  const brand = BRAND[key];

  return (
    <div
      className={cn(
        "relative overflow-hidden border border-border bg-white/70 dark:bg-white/10 shadow-sm",
        "h-11 w-11",
        brand.containerRadiusClass,
        className
      )}
      aria-hidden="true"
    >
      <Image
        src={brand.src}
        alt={brand.alt}
        fill
        sizes="44px"
        className={cn("object-contain", brand.imagePaddingClass, imageClassName)}
      />
    </div>
  );
}

