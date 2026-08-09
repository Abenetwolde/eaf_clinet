/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Brand Primary
        primary: {
          DEFAULT: '#0140A7',
          dark:    '#0A4870',
          light:   '#DCEBF6',
          mid:     '#0155CC',
          darker:  '#012E7A',
          border:  '#0A50C2',
        },
        // Brand Secondary / Accent
        secondary: {
          DEFAULT: '#E6A500',
          dark:    '#C98F00',
          light:   '#FFF3CC',
        },
        accent: {
          DEFAULT: '#E6A500',
          light:   '#FFF3CC',
        },
        // Background
        'bg-app':     '#F7F8FA',
        'bg-card':    '#FFFFFF',
        'bg-surface': '#F1F3F5',
        // Text
        'text-main':    '#1D1D1F',
        'text-heading': '#1D1D1F',
        'text-body':    '#555B63',
        'text-muted':   '#8B9098',
        'text-dim':     '#B0B5BB',
        // Status
        'status-success':    '#2E7D32',
        'status-warning':    '#F59E0B',
        'status-error':      '#D32F2F',
        'status-info':       '#0288D1',
        'status-success-bg': '#E8F5E9',
        'status-warning-bg': '#FFF8E1',
        'status-error-bg':   '#FFEBEE',
        'status-info-bg':    '#E1F5FE',
        // Border
        'border-card':  '#D9DEE5',
        // Dark-mode landing vars (reference via CSS vars in components)
        'landing': {
          bg:       'var(--bg-landing)',
          alt:      'var(--bg-landing-alt)',
          surface:  'var(--surface-landing)',
          raised:   'var(--surface-raised-landing)',
          text:     'var(--text-landing)',
          sub:      'var(--text-landing-sub)',
          border:   'var(--border-landing)',
        },
      },
      boxShadow: {
        'gov':    '0 1px 4px rgba(11, 42, 66, 0.05)',
        'gov-lg': '0 4px 16px rgba(11, 87, 142, 0.08)',
        'card':   '0 8px 32px rgba(0,0,0,0.08)',
        'card-dark': '0 8px 32px rgba(0,0,0,0.3)',
        'primary-sm': '0 4px 12px rgba(1, 64, 167, 0.3)',
        'primary-md': '0 6px 18px rgba(1, 64, 167, 0.4)',
      },
      borderRadius: {
        'xl2': '18px',
        'xl3': '24px',
      },
      backdropBlur: {
        xs: '4px',
      },
      animation: {
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in':  'fadeIn 0.4s ease-out',
        'scan':     'scanAnim 2s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scanAnim: {
          '0%':   { top: '0%' },
          '50%':  { top: '90%' },
          '100%': { top: '0%' },
        },
      },
    },
  },
  plugins: [],
}
