/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'astro-gold': '#D4AF37',
        'astro-gold-light': '#F59E0B',
        'astro-purple': '#6B46C1',
        'astro-purple-dark': '#4C1D95',
        'astro-dark': '#0F0F23',
        'astro-dark-light': '#1F2937',
        'astro-light': '#F9FAFB',
        'cosmic-blue': '#1E40AF',
        'cosmic-pink': '#EC4899',
        'mystic-indigo': '#4338CA',
        'divine-orange': '#EA580C',
      },
      fontFamily: {
        'cinzel': ['Cinzel', 'serif'],
        'poppins': ['Poppins', 'sans-serif'],
        'hindi': ['Devanagari Sangam MN', 'serif'],
      },
      backgroundImage: {
        'mandala-pattern': "url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2240%22 fill=%22none%22 stroke=%22%23D4AF37%22 stroke-width=%220.5%22 opacity=%220.1%22/><circle cx=%2750%22 cy=%2750%22 r=%2730%22 fill=%22none%22 stroke=%22%239333EA%22 stroke-width=%220.3%22 opacity=%220.1%22/></svg>')",
        'celestial-gradient': 'linear-gradient(135deg, #0F0F23 0%, #1E1B4B 25%, #312E81 50%, #1E1B4B 75%, #0F0F23 100%)',
        'cosmic-gradient': 'radial-gradient(ellipse at center, #1E1B4B 0%, #0F0F23 70%)',
        'yantra-pattern': "url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22><polygon points=%22100,20 180,180 20,180%22 fill=%22none%22 stroke=%22%23D4AF37%22 stroke-width=%220.5%22 opacity=%220.05%22/><circle cx=%22100%22 cy=%22100%22 r=%2260%22 fill=%22none%22 stroke=%22%239333EA%22 stroke-width=%220.3%22 opacity=%220.05%22/></svg>')",
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        goldenShimmer: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
        celestialFloat: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-10px) rotate(2deg)' },
          '75%': { transform: 'translateY(10px) rotate(-2deg)' },
        },
        zodiacRotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      },
      animation: {
        'shimmer': 'shimmer 2.5s infinite linear',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'celestial': 'celestialFloat 20s ease-in-out infinite',
        'zodiac-rotate': 'zodiacRotate 60s linear infinite',
        'golden-shimmer': 'goldenShimmer 3s ease-in-out infinite',
      },
      boxShadow: {
        'mystical': '0 0 20px rgba(212, 175, 55, 0.2), 0 0 40px rgba(147, 51, 234, 0.1)',
        'divine': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
    },
  },
  plugins: [],
}