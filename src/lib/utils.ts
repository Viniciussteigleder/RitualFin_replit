import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number, options?: { hideDecimals?: boolean }) => {
  return new Intl.NumberFormat("pt-PT", { 
    style: "currency", 
    currency: "EUR",
    minimumFractionDigits: options?.hideDecimals ? 0 : 2,
    maximumFractionDigits: options?.hideDecimals ? 0 : 2,
  }).format(value);
};
