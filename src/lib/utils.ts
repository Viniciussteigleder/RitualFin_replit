import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-PT", { 
    style: "currency", 
    currency: "EUR",
    minimumFractionDigits: 2
  }).format(value);
};
