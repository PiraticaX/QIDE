/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'Fira Code', 'monospace'],
      },
      colors: {
        // Light mode
        'bg-primary': '#F7F8FA',
        'bg-secondary': '#FFFFFF',
        'surface': '#FCFCFD',
        'border-light': '#E6E8EC',
        'text-primary': '#0F172A',
        'text-secondary': '#475569',
        'text-muted': '#94A3B8',
        'accent': '#2563EB',
        'success': '#22C55E',
        'warning': '#F59E0B',
        'error': '#EF4444',
        // Dark mode
        'dark-bg': '#0B1020',
        'dark-secondary': '#121826',
        'dark-surface': '#161F31',
        'dark-border': '#253046',
        'dark-text': '#F8FAFC',
        'dark-text-secondary': '#CBD5E1',
        'dark-muted': '#64748B',
        'dark-accent': '#60A5FA',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.22s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card': '0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'elevated': '0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05)',
        'glow-blue': '0 0 20px rgba(37,99,235,0.2)',
        'glow-blue-dark': '0 0 20px rgba(96,165,250,0.2)',
      },
    },
  },
  plugins: [],
}
