import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── SheBloom Design Tokens ───────────────────────────────────────────
      colors: {
        // Primary purple ramp
        bloom: {
          50:  '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        // Pink accent ramp
        petal: {
          50:  '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        // Lavender background
        lavender: {
          50:  '#fdfaff',
          100: '#f7f0fe',
          200: '#ede4fc',
          300: '#ddd0f9',
          400: '#c9b5f5',
          500: '#b49ef0',
        },
        // Cycle calendar states
        cycle: {
          period:    '#ef4444',   // red-500
          fertile:   '#22c55e',   // green-500
          ovulation: '#8b5cf6',   // violet-500
          predicted: '#f97316',   // orange-500
          selected:  '#7c3aed',   // violet-700
        },
        // Semantic / neutral
        surface: '#ffffff',
        'surface-muted': '#f9f5ff',

        // shadcn tokens (keep compatibility)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },

      // ─── Gradients ────────────────────────────────────────────────────────
      backgroundImage: {
        // Core purple→pink gradient used on primary CTAs and headers
        'bloom-gradient':   'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)',
        'bloom-gradient-r': 'linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #7c3aed 100%)',
        'bloom-soft':       'linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%)',
        'bloom-header':     'linear-gradient(180deg, #f9f0fe 0%, #ffffff 100%)',
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':   'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },

      // ─── Typography ───────────────────────────────────────────────────────
      fontFamily: {
        // Script/serif wordmark loaded via standard HTML link
        bloom: ['"Great Vibes"', 'cursive'],
        // Clean UI sans-serif loaded via standard HTML link
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        playfair: ['"Playfair Display"', 'serif'],
      },

      // ─── Spacing (8px grid) ───────────────────────────────────────────────
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
      },

      // ─── Border radius ────────────────────────────────────────────────────
      borderRadius: {
        'xl':  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      // ─── Box shadows ──────────────────────────────────────────────────────
      boxShadow: {
        'bloom-card': '0 2px 16px 0 rgba(124, 58, 237, 0.08)',
        'bloom-btn':  '0 4px 20px 0 rgba(168, 85, 247, 0.35)',
        'bloom-nav':  '0 -2px 20px 0 rgba(124, 58, 237, 0.08)',
      },

      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
