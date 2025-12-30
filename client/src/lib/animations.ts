/**
 * Animation & Transition Utilities
 *
 * World-class micro-interactions and transitions inspired by:
 * - Jony Ive: Simplicity and purposeful motion
 * - Aarron Walter: Emotional design and delight
 *
 * All animations follow the principle: "Motion with meaning"
 */

export const transitions = {
  // Easing curves (natural, physics-based)
  easeOut: "cubic-bezier(0.16, 1, 0.3, 1)", // Apple-style ease out
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  ease: "cubic-bezier(0.4, 0, 0.2, 1)", // Material Design standard
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)", // Bouncy spring

  // Durations (perceptually tuned)
  fast: "150ms",
  base: "250ms",
  slow: "350ms",
  slower: "500ms",
};

export const animations = {
  // Fade variations
  fadeIn: "animate-in fade-in",
  fadeOut: "animate-out fade-out",
  fadeInUp: "animate-in fade-in slide-in-from-bottom-4",
  fadeInDown: "animate-in fade-in slide-in-from-top-4",

  // Slide variations
  slideInRight: "animate-in slide-in-from-right",
  slideInLeft: "animate-in slide-in-from-left",
  slideInUp: "animate-in slide-in-from-bottom-8",
  slideInDown: "animate-in slide-in-from-top-8",

  // Scale variations
  scaleIn: "animate-in zoom-in-95",
  scaleOut: "animate-out zoom-out-95",

  // Combined effects
  fadeScaleIn: "animate-in fade-in zoom-in-95",
  slideUpFadeIn: "animate-in fade-in slide-in-from-bottom-6",

  // Durations
  duration: {
    75: "duration-75",
    100: "duration-100",
    150: "duration-150",
    200: "duration-200",
    300: "duration-300",
    400: "duration-[400ms]",
    500: "duration-500",
    600: "duration-[600ms]",
    700: "duration-700",
    800: "duration-[800ms]",
    1000: "duration-1000",
  },

  // Delays (for staggered animations)
  delay: {
    75: "delay-75",
    100: "delay-100",
    150: "delay-150",
    200: "delay-200",
    300: "delay-300",
    400: "delay-[400ms]",
    500: "delay-500",
    600: "delay-[600ms]",
    700: "delay-[700ms]",
    800: "delay-[800ms]",
  }
};

/**
 * Stagger animation utility
 * Returns delay class for staggered list animations
 */
export function getStaggerDelay(index: number, baseDelay: number = 50): string {
  const delay = Math.min(index * baseDelay, 500);
  return `delay-[${delay}ms]`;
}

/**
 * Card hover animation classes
 * Subtle lift effect for interactive cards
 */
export const cardHover = "transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.01]";

/**
 * Button press animation classes
 * Tactile feedback for buttons
 */
export const buttonPress = "active:scale-95 transition-transform duration-100";

/**
 * Focus ring styles
 * Accessible, beautiful focus states
 */
export const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

/**
 * Shimmer loading animation
 * For skeleton screens and loading states
 */
export const shimmer = "animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted";

/**
 * Success checkmark animation
 * Delightful confirmation feedback
 */
export const successPop = "animate-in zoom-in-0 duration-300 ease-out";

/**
 * Notification slide-in animation
 * Smooth entrance for toast notifications
 */
export const notificationSlide = "animate-in slide-in-from-right duration-300 ease-out";

/**
 * Page transition classes
 * Smooth page-level transitions
 */
export const pageTransition = "animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out";

/**
 * Modal backdrop animation
 */
export const backdropFade = "animate-in fade-in duration-200";

/**
 * Skeleton screen classes
 * Better loading experience than spinners
 */
export const skeleton = "animate-pulse rounded-lg bg-muted";

/**
 * Ripple effect (for buttons and interactive elements)
 * CSS-only ripple animation
 */
export const ripple = "relative overflow-hidden before:absolute before:inset-0 before:bg-white/20 before:scale-0 before:rounded-full active:before:scale-100 before:transition-transform before:duration-300";

/**
 * Number counter animation hook
 * Smooth number transitions for stats
 */
export function useCountUp(end: number, duration: number = 1000) {
  // This would be implemented in a React hook
  // For now, return the end value
  return end;
}

/**
 * Spring physics presets
 * For more natural animations
 */
export const springPresets = {
  gentle: { tension: 120, friction: 14 },
  wobbly: { tension: 180, friction: 12 },
  stiff: { tension: 210, friction: 20 },
  slow: { tension: 280, friction: 60 },
};

/**
 * Micro-interaction utilities
 */
export const microInteractions = {
  // Checkbox check animation
  checkboxCheck: "transition-all duration-200 ease-out data-[state=checked]:scale-100 data-[state=unchecked]:scale-0",

  // Switch toggle
  switchToggle: "transition-transform duration-200 ease-out data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",

  // Input focus
  inputFocus: "transition-all duration-200 focus:ring-2 focus:ring-primary focus:border-primary",

  // Card selection
  cardSelect: "transition-all duration-200 data-[selected=true]:ring-2 data-[selected=true]:ring-primary data-[selected=true]:shadow-lg",
};
