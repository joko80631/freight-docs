/**
 * Minimal black and white theme configuration
 */

// Base colors
export const colors = {
  black: '#000000',
  white: '#FFFFFF',
  gray: {
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  // Status colors with subtle accents
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
};

// Status colors with subtle accents
export const statusColors = {
  success: {
    bg: 'bg-success-50',
    text: 'text-success-700',
    border: 'border-success-200',
  },
  warning: {
    bg: 'bg-warning-50',
    text: 'text-warning-700',
    border: 'border-warning-200',
  },
  error: {
    bg: 'bg-error-50',
    text: 'text-error-700',
    border: 'border-error-200',
  },
  info: {
    bg: 'bg-gray-100',
    text: 'text-gray-900',
    border: 'border-gray-300',
  },
};

// Role colors - using grayscale instead of colored variants
export const roleColors = {
  admin: {
    bg: 'bg-gray-300',
    text: 'text-gray-900',
    border: 'border-gray-500',
  },
  manager: {
    bg: 'bg-gray-200',
    text: 'text-gray-900',
    border: 'border-gray-400',
  },
  user: {
    bg: 'bg-gray-100',
    text: 'text-gray-900',
    border: 'border-gray-300',
  },
};

// Layout colors
export const layoutColors = {
  card: 'bg-white border border-gray-300 text-gray-900 shadow-sm hover:shadow-md transition-shadow duration-200',
  panel: 'bg-white border border-gray-300',
  overlay: 'bg-white/95 backdrop-blur-sm',
  modal: 'bg-white border border-gray-300 shadow-lg',
};

// Text colors
export const textColors = {
  primary: 'text-gray-900',
  muted: 'text-gray-700',
  accent: 'text-gray-900',
  success: 'text-success-700',
  warning: 'text-warning-700',
  error: 'text-error-700',
};

// Interactive state colors
export const interactiveColors = {
  button: {
    primary: 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
    outline: 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-100 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
    ghost: 'text-gray-900 hover:bg-gray-100 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
    link: 'text-gray-900 hover:underline focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
  },
  input: {
    base: 'bg-white border border-gray-300 text-gray-900 focus:border-gray-500 focus:ring-2 focus:ring-gray-500',
  },
}; 