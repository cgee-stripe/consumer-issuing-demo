import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dogs R Us custom color palette - uses CSS variable for dynamic customization
        primary: {
          DEFAULT: 'var(--color-primary, #FF6B35)',
          50: '#FFF4F0',
          100: '#FFE8E0',
          200: '#FFD1C2',
          300: '#FFBAA3',
          400: '#FFA385',
          500: 'var(--color-primary, #FF6B35)',
          600: '#FF4500',
          700: '#CC3700',
          800: '#992900',
          900: '#661B00',
        },
        secondary: {
          DEFAULT: '#1A508B',
          50: '#E6EDF5',
          100: '#CCDAEB',
          200: '#99B5D6',
          300: '#6690C2',
          400: '#336BAD',
          500: '#1A508B',
          600: '#15406F',
          700: '#103053',
          800: '#0A2038',
          900: '#05101C',
        },
        accent: {
          DEFAULT: '#A480CF',
          50: '#F5F0FA',
          100: '#EBE1F5',
          200: '#D7C3EB',
          300: '#C3A5E0',
          400: '#AF87D6',
          500: '#A480CF',
          600: '#8A5FC4',
          700: '#6F3FB9',
          800: '#542F8C',
          900: '#391F5E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontFeatureSettings: {
        'tnum': '"tnum"', // Tabular numbers for better alignment
      },
    },
  },
  plugins: [],
};

export default config;
