/**
 * Category definitions with colors, icons, and display names
 * Based on reference design images
 */

export interface CategoryConfig {
  name: string;
  displayName: string;
  icon: string;
  bgColor: string;
  textColor: string;
  progressColor: string;
}

export const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  'Alimentação': {
    name: 'Alimentação',
    displayName: 'Alimentação',
    icon: '🍽️',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-600',
    progressColor: 'bg-orange-500',
  },
  'Moradia': {
    name: 'Moradia',
    displayName: 'Moradia',
    icon: '🏠',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
    progressColor: 'bg-blue-500',
  },
  'Transporte': {
    name: 'Transporte',
    displayName: 'Transporte',
    icon: '🚗',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600',
    progressColor: 'bg-purple-500',
  },
  'Saúde': {
    name: 'Saúde',
    displayName: 'Saúde',
    icon: '💊',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-600',
    progressColor: 'bg-pink-500',
  },
  'Lazer': {
    name: 'Lazer',
    displayName: 'Lazer',
    icon: '🎮',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-600',
    progressColor: 'bg-cyan-500',
  },
  'Tecnologia': {
    name: 'Tecnologia',
    displayName: 'Tecnologia',
    icon: '💻',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-600',
    progressColor: 'bg-indigo-500',
  },
  'Educação': {
    name: 'Educação',
    displayName: 'Educação',
    icon: '📚',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-600',
    progressColor: 'bg-yellow-500',
  },
  'Pets': {
    name: 'Pets',
    displayName: 'Pets',
    icon: '🐾',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-600',
    progressColor: 'bg-amber-500',
  },
  'Telefone': {
    name: 'Telefone',
    displayName: 'Telefone',
    icon: '📱',
    bgColor: 'bg-teal-100',
    textColor: 'text-teal-600',
    progressColor: 'bg-teal-500',
  },
  'Finanças': {
    name: 'Finanças',
    displayName: 'Finanças',
    icon: '💰',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-600',
    progressColor: 'bg-emerald-500',
  },
  'Trabalho': {
    name: 'Trabalho',
    displayName: 'Trabalho',
    icon: '💼',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-600',
    progressColor: 'bg-slate-500',
  },
  'Transferências': {
    name: 'Transferências',
    displayName: 'Transferências',
    icon: '↔️',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    progressColor: 'bg-gray-500',
  },
  'Outros': {
    name: 'Outros',
    displayName: 'Outros',
    icon: '📦',
    bgColor: 'bg-neutral-100',
    textColor: 'text-neutral-600',
    progressColor: 'bg-neutral-500',
  },
};

export function getCategoryConfig(categoryName: string | null): CategoryConfig {
  if (!categoryName) {
    return CATEGORY_CONFIGS['Outros'];
  }
  return CATEGORY_CONFIGS[categoryName] || CATEGORY_CONFIGS['Outros'];
}

export const CATEGORY_LIST = Object.values(CATEGORY_CONFIGS);
