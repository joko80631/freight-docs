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
  }
};

// Status colors - using grayscale instead of colored variants
export const statusColors = {
  success: {
    bg: 'bg-gray-100',
    text: 'text-black',
    border: 'border-gray-300',
  },
  warning: {
    bg: 'bg-gray-200',
    text: 'text-black',
    border: 'border-gray-400',
  },
  error: {
    bg: 'bg-gray-300',
    text: 'text-black',
    border: 'border-gray-500',
  },
  info: {
    bg: 'bg-gray-100',
    text: 'text-black',
    border: 'border-gray-300',
  },
};

// Role colors - using grayscale instead of colored variants
export const roleColors = {
  admin: {
    bg: 'bg-gray-300',
    text: 'text-black',
    border: 'border-gray-500',
  },
  manager: {
    bg: 'bg-gray-200',
    text: 'text-black',
    border: 'border-gray-400',
  },
  user: {
    bg: 'bg-gray-100',
    text: 'text-black',
    border: 'border-gray-300',
  },
};

// Layout colors
export const layoutColors = {
  card: 'bg-white border border-gray-300 text-black',
  panel: 'bg-white border border-gray-300',
  overlay: 'bg-white/90 backdrop-blur-sm',
  modal: 'bg-white border border-gray-300 shadow-sm',
};

// Text colors
export const textColors = {
  primary: 'text-black',
  muted: 'text-gray-600',
  accent: 'text-black',
  success: 'text-black',
  warning: 'text-black',
  error: 'text-black',
};

// Interactive state colors
export const interactiveColors = {
  button: {
    primary: 'bg-black text-white hover:bg-gray-800',
    secondary: 'bg-gray-100 text-black hover:bg-gray-200',
    outline: 'border border-gray-300 bg-white hover:bg-gray-100',
    ghost: 'hover:bg-gray-100 hover:text-black',
    link: 'text-black hover:underline',
  },
  input: {
    base: 'bg-white border border-gray-300 focus:border-black focus:ring-gray-200',
  },
}; 