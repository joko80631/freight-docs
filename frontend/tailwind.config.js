/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
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
  			// Base colors
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			'text-primary': 'var(--text-primary)',
  			'text-muted': 'var(--text-muted)',
  			border: 'var(--border)',
  			card: 'var(--card)',
  			highlight: 'var(--highlight)',
  			
  			// Accent & Status colors
  			accent: {
  				DEFAULT: 'var(--accent)',
  				hover: 'var(--cta)',
  			},
  			success: 'var(--success)',
  			warning: 'var(--warning)',
  			error: 'var(--error)',
  			
  			// Semantic UI colors
  			primary: {
  				DEFAULT: 'var(--accent)',
  				foreground: 'var(--background)',
  			},
  			secondary: {
  				DEFAULT: 'var(--highlight)',
  				foreground: 'var(--text-primary)',
  			},
  			muted: {
  				DEFAULT: 'var(--highlight)',
  				foreground: 'var(--text-muted)',
  			},
  			destructive: {
  				DEFAULT: 'var(--error)',
  				foreground: 'var(--background)',
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
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			xl: 'var(--radius-xl)',
  			'2xl': 'var(--radius-2xl)',
  			full: 'var(--radius-full)',
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
  			sm: 'var(--shadow-sm)',
  			md: 'var(--shadow-md)',
  			lg: 'var(--shadow-lg)',
  			xl: 'var(--shadow-xl)',
  		},
  		transitionDuration: {
  			fast: 'var(--transition-fast)',
  			normal: 'var(--transition-normal)',
  			slow: 'var(--transition-slow)',
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