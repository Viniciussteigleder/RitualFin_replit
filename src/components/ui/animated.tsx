"use client";

import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useState } from "react";

interface AnimatedProps {
  children: ReactNode;
  className?: string;
  animation?:
    | "fade-in"
    | "fade-in-up"
    | "fade-in-down"
    | "fade-in-left"
    | "fade-in-right"
    | "scale-in"
    | "none";
  delay?: number;
  duration?: "fast" | "normal" | "slow";
  once?: boolean;
}

/**
 * Animated wrapper component for premium entrance animations
 * Use sparingly to enhance key UI elements
 */
export function Animated({
  children,
  className,
  animation = "fade-in-up",
  delay = 0,
  duration = "normal",
  once = true,
}: AnimatedProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const durationClasses = {
    fast: "duration-200",
    normal: "duration-400",
    slow: "duration-600",
  };

  const animationClasses = {
    "fade-in": "animate-fade-in",
    "fade-in-up": "animate-fade-in-up",
    "fade-in-down": "animate-fade-in-down",
    "fade-in-left": "animate-fade-in-left",
    "fade-in-right": "animate-fade-in-right",
    "scale-in": "animate-scale-in",
    none: "",
  };

  if (animation === "none") {
    return <>{children}</>;
  }

  return (
    <div
      className={cn(
        isVisible ? animationClasses[animation] : "opacity-0",
        durationClasses[duration],
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

/**
 * Container that staggers children animations
 * Great for lists of cards or items
 */
export function StaggerContainer({
  children,
  className,
  staggerDelay = 50,
}: StaggerContainerProps) {
  return (
    <div
      className={cn("list-stagger", className)}
      style={{ "--stagger-delay": `${staggerDelay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

interface CardWithAnimationProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: "lift" | "scale" | "glow" | "none";
}

/**
 * Card with built-in hover animations
 */
export function AnimatedCard({
  children,
  className,
  hoverEffect = "lift",
}: CardWithAnimationProps) {
  const hoverClasses = {
    lift: "card-lift",
    scale: "hover:scale-[1.02] transition-transform duration-300",
    glow: "hover-glow",
    none: "",
  };

  return (
    <div className={cn(hoverClasses[hoverEffect], className)}>
      {children}
    </div>
  );
}

interface ButtonWithAnimationProps {
  children: ReactNode;
  className?: string;
  pressEffect?: boolean;
}

/**
 * Button with press animation
 */
export function AnimatedButton({
  children,
  className,
  pressEffect = true,
}: ButtonWithAnimationProps) {
  return (
    <div className={cn(pressEffect && "btn-press", className)}>
      {children}
    </div>
  );
}

interface NumberAnimatedProps {
  value: number;
  className?: string;
  format?: (n: number) => string;
}

/**
 * Animated number that pops when value changes
 */
export function AnimatedNumber({
  value,
  className,
  format = (n) => n.toLocaleString("pt-BR"),
}: NumberAnimatedProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setIsAnimating(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [value, displayValue]);

  return (
    <span
      className={cn(
        "inline-block transition-transform duration-150",
        isAnimating && "scale-110",
        className
      )}
    >
      {format(displayValue)}
    </span>
  );
}

interface ProgressAnimatedProps {
  value: number;
  className?: string;
  barClassName?: string;
  animate?: boolean;
}

/**
 * Animated progress bar that grows from 0
 */
export function AnimatedProgress({
  value,
  className,
  barClassName,
  animate = true,
}: ProgressAnimatedProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setWidth(value), 100);
      return () => clearTimeout(timer);
    } else {
      setWidth(value);
    }
  }, [value, animate]);

  return (
    <div className={cn("h-2 bg-secondary rounded-full overflow-hidden", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-all duration-700 ease-out",
          barClassName || "bg-primary"
        )}
        style={{ width: `${Math.min(width, 100)}%` }}
      />
    </div>
  );
}

interface ShimmerProps {
  className?: string;
  width?: string;
  height?: string;
}

/**
 * Shimmer loading placeholder
 */
export function Shimmer({ className, width = "100%", height = "1rem" }: ShimmerProps) {
  return (
    <div
      className={cn("shimmer rounded", className)}
      style={{ width, height }}
    />
  );
}

interface FadeInViewProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
}

/**
 * Fade in when element enters viewport
 * Uses Intersection Observer for performance
 */
export function FadeInView({
  children,
  className,
  threshold = 0.1,
}: FadeInViewProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return (
    <div
      ref={setRef}
      className={cn(
        "transition-all duration-500 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
    >
      {children}
    </div>
  );
}
