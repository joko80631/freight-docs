/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
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
    'lg:m-4',
    'lg:mx-4',
    'lg:my-4',
    'lg:space-x-4',
    'lg:space-y-4',
    'lg:w-full',
    'lg:h-full',
    'lg:max-w-7xl',
    'lg:border',
    'lg:rounded',
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
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))',
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			neutral: {
  				50: 'rgb(var(--color-neutral-50) / <alpha-value>)',
  				100: 'rgb(var(--color-neutral-100) / <alpha-value>)',
  				200: 'rgb(var(--color-neutral-200) / <alpha-value>)',
  				300: 'rgb(var(--color-neutral-300) / <alpha-value>)',
  				400: 'rgb(var(--color-neutral-400) / <alpha-value>)',
  				500: 'rgb(var(--color-neutral-500) / <alpha-value>)',
  				600: 'rgb(var(--color-neutral-600) / <alpha-value>)',
  				700: 'rgb(var(--color-neutral-700) / <alpha-value>)',
  				800: 'rgb(var(--color-neutral-800) / <alpha-value>)',
  				900: 'rgb(var(--color-neutral-900) / <alpha-value>)',
  				950: 'rgb(var(--color-neutral-950) / <alpha-value>)',
  			},
  			success: {
  				100: 'rgb(var(--color-success-100) / <alpha-value>)',
  				500: 'rgb(var(--color-success-500) / <alpha-value>)',
  				600: 'rgb(var(--color-success-600) / <alpha-value>)',
  			},
  			warning: {
  				100: 'rgb(var(--color-warning-100) / <alpha-value>)',
  				500: 'rgb(var(--color-warning-500) / <alpha-value>)',
  				600: 'rgb(var(--color-warning-600) / <alpha-value>)',
  			},
  			error: {
  				100: 'rgb(var(--color-error-100) / <alpha-value>)',
  				500: 'rgb(var(--color-error-500) / <alpha-value>)',
  				600: 'rgb(var(--color-error-600) / <alpha-value>)',
  			},
  			info: {
  				100: 'rgb(var(--color-info-100) / <alpha-value>)',
  				500: 'rgb(var(--color-info-500) / <alpha-value>)',
  				600: 'rgb(var(--color-info-600) / <alpha-value>)',
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
  			1: 'var(--spacing-1)',
  			2: 'var(--spacing-2)',
  			3: 'var(--spacing-3)',
  			4: 'var(--spacing-4)',
  			5: 'var(--spacing-5)',
  			6: 'var(--spacing-6)',
  			8: 'var(--spacing-8)',
  			10: 'var(--spacing-10)',
  			12: 'var(--spacing-12)',
  			16: 'var(--spacing-16)',
  			20: 'var(--spacing-20)',
  			24: 'var(--spacing-24)',
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
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
} 