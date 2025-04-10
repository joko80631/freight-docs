/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    './public/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Grid layout classes
    'grid',
    'grid-cols-1',
    'grid-cols-2',
    'grid-cols-3',
    'grid-cols-4',
    'col-span-1',
    'col-span-2',
    'col-span-3',
    'col-span-4',
    // Display classes
    'flex',
    'hidden',
    'block',
    // Background classes
    'bg-gray-100',
    'bg-white',
    'bg-black',
    // Text classes
    'text-left',
    'text-center',
    'text-right',
    // Spacing classes
    'p-4',
    'px-4',
    'py-4',
    'm-4',
    'mx-4',
    'my-4',
    'space-x-4',
    'space-y-4',
    'space-x-6',
    'space-y-6',
    'gap-6',
    // Width/height classes
    'w-full',
    'h-full',
    'max-w-7xl',
    // Border classes
    'border',
    'rounded',
    // Responsive variants
    'lg:grid-cols-1',
    'lg:grid-cols-2',
    'lg:grid-cols-3',
    'lg:grid-cols-4',
    'lg:col-span-1',
    'lg:col-span-2',
    'lg:col-span-3',
    'lg:col-span-4',
    'lg:flex',
    'lg:hidden',
    'lg:block',
    'lg:bg-gray-100',
    'lg:bg-white',
    'lg:bg-black',
    'lg:text-left',
    'lg:text-center',
    'lg:text-right',
    'lg:p-4',
    'lg:px-4',
    'lg:py-4',
    'lg:py-6',
    'lg:m-4',
    'lg:mx-4',
    'lg:my-4',
    'lg:space-x-4',
    'lg:space-y-4',
    'lg:space-x-6',
    'lg:space-y-6',
    'lg:gap-6',
    'lg:w-full',
    'lg:h-full',
    'lg:max-w-7xl',
    'lg:border',
    'lg:rounded',
    'lg:justify-between',
    'lg:items-center',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px',
  		},
  	},
  	extend: {
  		colors: {
  			// Base colors - Strict Black/White/Gray
  			background: '#ffffff',
  			foreground: '#000000',
  			'text-primary': '#000000',
  			'text-muted': '#666666',
  			border: '#e5e5e5',
  			card: '#f9f9f9',
  			highlight: '#f0f0f0',
  			
  			// Accent & Status colors
  			accent: {
  				DEFAULT: '#262626',
  				hover: '#404040',
  			},
  			success: '#22c55e',
  			warning: '#ffcc00',
  			error: '#ef4444',
  			
  			// Semantic UI colors - Mapped to strict values
  			primary: {
  				DEFAULT: '#262626',
  				foreground: '#ffffff',
  			},
  			secondary: {
  				DEFAULT: '#f0f0f0',
  				foreground: '#000000',
  			},
  			muted: {
  				DEFAULT: '#f0f0f0',
  				foreground: '#666666',
  			},
  			destructive: {
  				DEFAULT: '#ef4444',
  				foreground: '#ffffff',
  			},
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'sans-serif'
  			]
  		},
  		maxWidth: {
  			container: '800px'
  		},
  		borderRadius: {
  			lg: '0.375rem',
  			md: '0.25rem',
  			sm: '0.125rem',
  			xl: '0.75rem',
  			'2xl': '1rem',
  			full: '9999px',
  		},
  		spacing: {
  			'2': '0.5rem',    /* 8px */
  			'4': '1rem',      /* 16px */
  			'6': '1.5rem',    /* 24px */
  			'8': '2rem',      /* 32px */
  			'12': '3rem',     /* 48px */
  			'16': '4rem',     /* 64px */
  			'24': '6rem',     /* 96px */
  		},
  		boxShadow: {
  			sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  			md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  			lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  			xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  		},
  		transitionDuration: {
  			fast: '150ms',
  			normal: '250ms',
  			slow: '350ms',
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: 0 },
  				to: { height: 'var(--radix-accordion-content-height)' },
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: 0 },
  			},
  			'fade-in': {
  				from: { opacity: 0 },
  				to: { opacity: 1 },
  			},
  			'fade-out': {
  				from: { opacity: 1 },
  				to: { opacity: 0 },
  			},
  			'slide-in': {
  				from: { transform: 'translateY(10px)', opacity: 0 },
  				to: { transform: 'translateY(0)', opacity: 1 },
  			},
  			'slide-out': {
  				from: { transform: 'translateY(0)', opacity: 1 },
  				to: { transform: 'translateY(10px)', opacity: 0 },
  			},
  			'scale-in': {
  				from: { transform: 'scale(0.95)', opacity: 0 },
  				to: { transform: 'scale(1)', opacity: 1 },
  			},
  			'scale-out': {
  				from: { transform: 'scale(1)', opacity: 1 },
  				to: { transform: 'scale(0.95)', opacity: 0 },
  			},
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in': 'fade-in 0.2s ease-out',
  			'fade-out': 'fade-out 0.2s ease-out',
  			'slide-in': 'slide-in 0.2s ease-out',
  			'slide-out': 'slide-out 0.2s ease-out',
  			'scale-in': 'scale-in 0.2s ease-out',
  			'scale-out': 'scale-out 0.2s ease-out',
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
} 