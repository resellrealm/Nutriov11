/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7fc7a1',
          50: '#f0faf5',
          100: '#d9f2e5',
          200: '#b6e5cd',
          300: '#8dd4af',
          400: '#7fc7a1',
          500: '#5eb988',
          600: '#479770',
          700: '#39785b',
          800: '#2f5f49',
          900: '#284f3d',
        },
        accent: {
          DEFAULT: '#6bb591',
          50: '#f1f9f5',
          100: '#ddf0e6',
          200: '#bde1ce',
          300: '#93ccb0',
          400: '#6bb591',
          500: '#4a9873',
          600: '#397a5c',
          700: '#2f624b',
          800: '#284e3d',
          900: '#234133',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgb(127, 199, 161, 0.2), 0 0 20px rgb(127, 199, 161, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgb(127, 199, 161, 0.4), 0 0 30px rgb(127, 199, 161, 0.4)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'glass': '0 8px 32px 0 rgba(127, 199, 161, 0.1)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
