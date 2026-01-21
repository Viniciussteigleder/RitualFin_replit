/**
 * RitualFin Design System Tokens
 * Centralized design values for consistency across the application
 * Based on expert UI/UX recommendations from Helena Zhang, Zach Roszczewski, Michael Flarup, and Brett Calzada
 */

// ============================================================================
// SPACING SCALE (4px base grid)
// ============================================================================
export const spacing = {
  0: '0px',
  1: '4px',    // 0.25rem
  2: '8px',    // 0.5rem
  3: '12px',   // 0.75rem
  4: '16px',   // 1rem
  5: '20px',   // 1.25rem
  6: '24px',   // 1.5rem
  8: '32px',   // 2rem
  10: '40px',  // 2.5rem
  12: '48px',  // 3rem
  16: '64px',  // 4rem
} as const;

// ============================================================================
// BORDER RADIUS SCALE (Reduced from excessive 2.5rem)
// ============================================================================
export const radius = {
  none: '0px',
  sm: '8px',      // 0.5rem - Small elements (badges, tags)
  md: '12px',     // 0.75rem - Medium elements (buttons, inputs)
  lg: '16px',     // 1rem - Large elements (cards, modals)
  xl: '24px',     // 1.5rem - Extra large (hero cards)
  full: '9999px', // Fully rounded (pills, avatars)
} as const;

// ============================================================================
// TYPOGRAPHY SCALE (Consolidated from 11 to 8 sizes)
// ============================================================================
export const fontSize = {
  xs: '10px',    // 0.625rem - Micro labels, badges
  sm: '12px',    // 0.75rem - Secondary text, captions
  base: '14px',  // 0.875rem - Body text, default
  md: '16px',    // 1rem - Emphasized body text
  lg: '18px',    // 1.125rem - Subheadings
  xl: '24px',    // 1.5rem - Section headings
  '2xl': '32px', // 2rem - Page titles
  '3xl': '48px', // 3rem - Hero text, primary metrics
} as const;

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  black: '900',
} as const;

export const lineHeight = {
  tight: '1.2',
  normal: '1.5',
  relaxed: '1.75',
} as const;

export const letterSpacing = {
  tight: '-0.02em',
  normal: '0',
  wide: '0.05em',
  wider: '0.1em',
  widest: '0.15em',
} as const;

// ============================================================================
// ICON SIZES (Standardized to 4 sizes)
// ============================================================================
export const iconSize = {
  sm: '16px',   // Small icons in dense UI
  md: '20px',   // Default icon size
  lg: '24px',   // Large icons in headers
  xl: '32px',   // Hero icons
} as const;

// ============================================================================
// SEMANTIC COLORS (Limited palette for financial apps)
// ============================================================================
export const semanticColors = {
  // Primary - Emerald/Green (RitualFin brand)
  primary: {
    light: 'hsl(142, 71%, 45%)',
    DEFAULT: 'hsl(142, 71%, 45%)',
    dark: 'hsl(142, 71%, 50%)',
  },
  
  // Success - Reserved for positive outcomes
  success: {
    light: 'hsl(142, 71%, 45%)',
    DEFAULT: 'hsl(142, 71%, 45%)',
    dark: 'hsl(142, 71%, 35%)',
  },
  
  // Warning - Orange for spending alerts
  warning: {
    light: 'hsl(38, 92%, 50%)',
    DEFAULT: 'hsl(38, 92%, 50%)',
    dark: 'hsl(38, 92%, 40%)',
  },
  
  // Error - Red for destructive actions
  error: {
    light: 'hsl(0, 84%, 60%)',
    DEFAULT: 'hsl(0, 84%, 60%)',
    dark: 'hsl(0, 63%, 45%)',
  },
  
  // Info - Blue for informational content
  info: {
    light: 'hsl(217, 91%, 60%)',
    DEFAULT: 'hsl(217, 91%, 60%)',
    dark: 'hsl(217, 91%, 50%)',
  },
} as const;

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================
export const buttonVariants = {
  primary: 'bg-primary text-primary-foreground hover:opacity-90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'hover:bg-secondary hover:text-foreground',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  outline: 'border border-border bg-transparent hover:bg-secondary',
} as const;

export const buttonSizes = {
  sm: 'h-9 px-3 text-sm',      // 36px height
  md: 'h-11 px-4 text-base',   // 44px height (minimum touch target)
  lg: 'h-14 px-6 text-md',     // 56px height
  icon: 'h-11 w-11',           // Square icon button
} as const;

export const cardVariants = {
  default: 'bg-card border border-border shadow-sm',
  primary: 'bg-primary/5 border border-primary/20 shadow-sm',
  glass: 'bg-card/90 border border-border/50 shadow-lg',
  elevated: 'bg-card border border-border shadow-lg',
} as const;

export const badgeVariants = {
  default: 'bg-secondary text-secondary-foreground',
  primary: 'bg-primary/10 text-primary border border-primary/20',
  success: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
  warning: 'bg-orange-500/10 text-orange-600 border border-orange-500/20',
  error: 'bg-red-500/10 text-red-600 border border-red-500/20',
  info: 'bg-blue-500/10 text-blue-600 border border-blue-500/20',
} as const;

// ============================================================================
// ANIMATION DURATIONS (Fast for speed-focused UI)
// ============================================================================
export const duration = {
  instant: '0ms',
  fast: '100ms',
  normal: '200ms',
  slow: '300ms',
} as const;

// ============================================================================
// Z-INDEX SCALE
// ============================================================================
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================
export const breakpoints = {
  mobile: '0px',      // 0-639px
  tablet: '640px',    // 640-1023px
  desktop: '1024px',  // 1024px+
  wide: '1280px',     // 1280px+
} as const;

// ============================================================================
// TOUCH TARGETS (Minimum 44x44px for accessibility)
// ============================================================================
export const touchTarget = {
  min: '44px',
  comfortable: '48px',
  large: '56px',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get spacing value by key
 */
export const getSpacing = (key: keyof typeof spacing) => spacing[key];

/**
 * Get radius value by key
 */
export const getRadius = (key: keyof typeof radius) => radius[key];

/**
 * Get font size value by key
 */
export const getFontSize = (key: keyof typeof fontSize) => fontSize[key];

/**
 * Get icon size value by key
 */
export const getIconSize = (key: keyof typeof iconSize) => iconSize[key];

/**
 * Type exports for TypeScript
 */
export type SpacingKey = keyof typeof spacing;
export type RadiusKey = keyof typeof radius;
export type FontSizeKey = keyof typeof fontSize;
export type IconSizeKey = keyof typeof iconSize;
export type ButtonVariant = keyof typeof buttonVariants;
export type ButtonSize = keyof typeof buttonSizes;
export type CardVariant = keyof typeof cardVariants;
export type BadgeVariant = keyof typeof badgeVariants;
