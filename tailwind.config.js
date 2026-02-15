/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			},
  			'float': {
  				'0%, 100%': { transform: 'translateY(0px)' },
  				'50%': { transform: 'translateY(-12px)' },
  			},
  			'float-slow': {
  				'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
  				'50%': { transform: 'translateY(-20px) rotate(2deg)' },
  			},
  			'fadeInUp': {
  				from: { opacity: '0', transform: 'translateY(40px)' },
  				to: { opacity: '1', transform: 'translateY(0)' },
  			},
  			'fadeInScale': {
  				from: { opacity: '0', transform: 'scale(0.92)' },
  				to: { opacity: '1', transform: 'scale(1)' },
  			},
  			'pulse-glow': {
  				'0%, 100%': { boxShadow: '0 0 20px rgba(0,0,0,0.15), 0 0 40px rgba(0,0,0,0.05)' },
  				'50%': { boxShadow: '0 0 30px rgba(0,0,0,0.25), 0 0 60px rgba(0,0,0,0.1)' },
  			},
  			'blob-drift': {
  				'0%, 100%': { transform: 'translate(0,0) scale(1)' },
  				'25%': { transform: 'translate(30px,-20px) scale(1.05)' },
  				'50%': { transform: 'translate(-20px,20px) scale(0.95)' },
  				'75%': { transform: 'translate(15px,10px) scale(1.02)' },
  			},
  			'icon-bounce': {
  				'0%, 100%': { transform: 'translateY(0) scale(1)' },
  				'50%': { transform: 'translateY(-4px) scale(1.08)' },
  			},
  			'shimmer': {
  				'0%': { backgroundPosition: '-200% 0' },
  				'100%': { backgroundPosition: '200% 0' },
  			},
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'float': 'float 6s ease-in-out infinite',
  			'float-slow': 'float-slow 8s ease-in-out infinite',
  			'fadeInUp': 'fadeInUp 0.8s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
  			'fadeInScale': 'fadeInScale 0.6s cubic-bezier(0.25,0.46,0.45,0.94) forwards',
  			'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
  			'blob-drift': 'blob-drift 20s ease-in-out infinite',
  			'icon-bounce': 'icon-bounce 2s ease-in-out infinite',
  			'shimmer': 'shimmer 2s linear infinite',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
