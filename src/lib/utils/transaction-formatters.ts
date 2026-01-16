import { getCategoryConfig } from "@/lib/constants/categories";

// Format date as DD.MM.YY
export const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear().toString().slice(-2);
    return `${day}.${month}.${year}`;
};

// Format currency
export const formatAmount = (amount: number, hideCents: boolean = false) => {
    const absAmount = Math.abs(amount);
    if (hideCents) {
        return new Intl.NumberFormat("pt-PT", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Math.round(absAmount));
    }
    return new Intl.NumberFormat("pt-PT", {
        style: "currency",
        currency: "EUR"
    }).format(absAmount);
};

// Helper to get category style and icon using centralized config
export const getCategoryStyles = (category: string) => {
    const config = getCategoryConfig(category);
    return {
        color: config.textColor,
        bg: config.bgColor,
        border: config.borderColor,
        icon: config.lucideIcon
    };
};
