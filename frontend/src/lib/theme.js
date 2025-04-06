/**
 * Centralized theme configuration and color tokens
 */

// Status color configurations
export const statusColors = {
  success: {
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/20',
    hover: 'hover:bg-success/20',
  },
  warning: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning/20',
    hover: 'hover:bg-warning/20',
  },
  error: {
    bg: 'bg-error/10',
    text: 'text-error',
    border: 'border-error/20',
    hover: 'hover:bg-error/20',
  },
  info: {
    bg: 'bg-accent/10',
    text: 'text-accent',
    border: 'border-accent/20',
    hover: 'hover:bg-accent/20',
  },
};

// Role-based color configurations
export const roleColors = {
  admin: {
    bg: 'bg-error/10',
    text: 'text-error',
    border: 'border-error/20',
  },
  manager: {
    bg: 'bg-accent/10',
    text: 'text-accent',
    border: 'border-accent/20',
  },
  user: {
    bg: 'bg-highlight',
    text: 'text-text-primary',
    border: 'border-border',
  },
};

// Common layout color combinations
export const layoutColors = {
  card: 'bg-background border border-border text-text-primary',
  panel: 'bg-background border border-border',
  overlay: 'bg-background/80 backdrop-blur-sm',
  modal: 'bg-background border border-border shadow-lg',
};

// Text color combinations
export const textColors = {
  primary: 'text-text-primary',
  muted: 'text-text-muted',
  accent: 'text-accent',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
};

// Interactive state colors
export const interactiveColors = {
  button: {
    primary: 'bg-accent text-background hover:bg-accent-hover',
    secondary: 'bg-highlight text-text-primary hover:bg-highlight/80',
    outline: 'border border-border bg-background hover:bg-highlight',
    ghost: 'hover:bg-highlight hover:text-text-primary',
    link: 'text-accent hover:underline',
  },
  input: {
    base: 'bg-background border border-border focus:border-accent focus:ring-accent/20',
  },
}; 