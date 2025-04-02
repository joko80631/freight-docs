// Breakpoint values in pixels
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

// Common responsive classes
export const responsive = {
  // Container widths
  container: "w-full mx-auto px-4 sm:px-6 lg:px-8",
  containerSm: "max-w-screen-sm",
  containerMd: "max-w-screen-md",
  containerLg: "max-w-screen-lg",
  containerXl: "max-w-screen-xl",
  container2xl: "max-w-screen-2xl",

  // Grid layouts
  grid: "grid gap-4 sm:gap-6 lg:gap-8",
  gridCols: {
    sm: "grid-cols-1 sm:grid-cols-2",
    md: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    lg: "grid-cols-1 lg:grid-cols-2 xl:grid-cols-4",
  },

  // Flex layouts
  flex: "flex flex-col sm:flex-row",
  flexWrap: "flex flex-wrap gap-4",
  flexCenter: "flex items-center justify-center",
  flexBetween: "flex items-center justify-between",

  // Spacing
  section: "py-8 sm:py-12 lg:py-16",
  sectionX: "px-4 sm:px-6 lg:px-8",
  sectionY: "py-4 sm:py-6 lg:py-8",

  // Typography
  heading: "text-2xl sm:text-3xl lg:text-4xl font-bold",
  subheading: "text-xl sm:text-2xl lg:text-3xl font-semibold",
  body: "text-base sm:text-lg",
  small: "text-sm sm:text-base",
};

// Media query helpers
export const mediaQuery = {
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  xl: `@media (min-width: ${breakpoints.xl}px)`,
  "2xl": `@media (min-width: ${breakpoints["2xl"]}px)`,
};

// Responsive utility functions
export function isMobile() {
  if (typeof window === "undefined") return false;
  return window.innerWidth < breakpoints.md;
}

export function isTablet() {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= breakpoints.md && window.innerWidth < breakpoints.lg;
}

export function isDesktop() {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= breakpoints.lg;
} 