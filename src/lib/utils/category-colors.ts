/**
 * Category Color Utilities
 * Provides consistent category color application across the app
 */

import { CATEGORY_CONFIGS } from '@/lib/constants/categories';

export type CategoryIntensity = 'strong' | 'medium' | 'soft';

/**
 * Get the canonical hex color for a category
 */
export function getCategoryColor(categoryName: string | null): string {
  if (!categoryName) return '#94A3B8'; // Others/default
  
  const config = CATEGORY_CONFIGS[categoryName];
  if (config) return config.color;
  
  // Fallback: try case-insensitive match
  const normalized = categoryName.toLowerCase();
  for (const [key, value] of Object.entries(CATEGORY_CONFIGS)) {
    if (key.toLowerCase() === normalized) {
      return value.color;
    }
  }
  
  return '#94A3B8'; // Others/default
}

/**
 * Get category color with intensity level
 * - strong: Full opacity (for charts, active states)
 * - medium: 80% mix with white (for badges, small bars)
 * - soft: 12% opacity (for subtle backgrounds)
 */
export function getCategoryColorWithIntensity(
  categoryName: string | null,
  intensity: CategoryIntensity = 'strong'
): string {
  const baseColor = getCategoryColor(categoryName);
  
  if (intensity === 'strong') {
    return baseColor;
  }
  
  // For medium and soft, we return CSS color-mix syntax
  // This requires modern browser support
  if (intensity === 'medium') {
    return `color-mix(in srgb, ${baseColor} 80%, white)`;
  }
  
  // soft
  return `color-mix(in srgb, ${baseColor} 12%, transparent)`;
}

/**
 * Get Tailwind-compatible background class for category
 * Note: For dynamic colors, use inline styles instead
 */
export function getCategoryBgClass(categoryName: string | null, intensity: CategoryIntensity = 'soft'): string {
  // For now, return empty and use inline styles
  // Tailwind can't generate classes for dynamic hex values
  return '';
}

/**
 * Get inline style object for category background
 */
export function getCategoryBgStyle(categoryName: string | null, intensity: CategoryIntensity = 'soft'): React.CSSProperties {
  const color = getCategoryColor(categoryName);
  
  if (intensity === 'strong') {
    return { backgroundColor: color };
  }
  
  if (intensity === 'medium') {
    return { backgroundColor: `color-mix(in srgb, ${color} 80%, white)` };
  }
  
  // soft
  return { backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` };
}

/**
 * Get inline style object for category text color
 */
export function getCategoryTextStyle(categoryName: string | null): React.CSSProperties {
  return { color: getCategoryColor(categoryName) };
}

/**
 * Get data attribute for CSS custom property usage
 */
export function getCategoryDataAttr(categoryName: string | null): string {
  if (!categoryName) return 'others';
  
  const config = CATEGORY_CONFIGS[categoryName];
  return config?.slug || 'others';
}

/**
 * Determine if text should be white on this category color background
 */
export function shouldUseWhiteText(categoryName: string | null, intensity: CategoryIntensity = 'strong'): boolean {
  // Only strong backgrounds need white text
  if (intensity !== 'strong') return false;
  
  const color = getCategoryColor(categoryName);
  
  // Simple luminance check
  // Extract RGB from hex
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // If dark (luminance < 0.5), use white text
  return luminance < 0.5;
}
