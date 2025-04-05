/**
 * Animation utility classes for consistent motion throughout the UI
 */

export const animationClasses = {
  // Base transition for all interactive elements
  base: "transition-all duration-300 ease-in-out",
  
  // Hover effects
  hover: {
    lift: "hover:scale-105 transition-transform duration-200",
    glow: "hover:shadow-lg transition-shadow duration-200",
  },
  
  // Focus effects
  focus: {
    ring: "focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",
  },
  
  // Sidebar animations
  sidebar: {
    collapse: "transition-all duration-300 ease-in-out",
    mobile: "transition-transform duration-300 ease-in-out",
  },
  
  // Dropdown and modal animations
  dropdown: {
    enter: "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  },
  
  // Button click effects
  button: {
    click: "active:scale-95 transition-transform duration-150 ease-in-out",
  },
  
  // Loading animations
  loading: {
    pulse: "animate-pulse",
    spin: "animate-spin",
  },
  
  transition: {
    fade: "transition-opacity duration-200",
    slide: "transition-transform duration-200",
    scale: "transition-transform duration-200",
  },
  
  enter: {
    fadeIn: "animate-fade-in",
    slideIn: "animate-slide-in",
    scaleIn: "animate-scale-in",
  },
  
  exit: {
    fadeOut: "animate-fade-out",
    slideOut: "animate-slide-out",
    scaleOut: "animate-scale-out",
  },
};

/**
 * Combines multiple animation classes
 */
export function combineAnimations(...classes: string[]): string {
  return classes.join(" ");
}

export const keyframes = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },
  slideIn: {
    from: { transform: "translateY(10px)", opacity: 0 },
    to: { transform: "translateY(0)", opacity: 1 },
  },
  slideOut: {
    from: { transform: "translateY(0)", opacity: 1 },
    to: { transform: "translateY(10px)", opacity: 0 },
  },
  scaleIn: {
    from: { transform: "scale(0.95)", opacity: 0 },
    to: { transform: "scale(1)", opacity: 1 },
  },
  scaleOut: {
    from: { transform: "scale(1)", opacity: 1 },
    to: { transform: "scale(0.95)", opacity: 0 },
  },
} as const; 