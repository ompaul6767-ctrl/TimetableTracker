/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1D6FE2',
          'blue-hover': '#155BC0',
          navy: '#1A2B5F',
          amber: '#F59E0B',
          orange: '#F97316',
        },
        canvas: '#F7F9FC',
        'auth-bg': '#EBF0FA',
        'input-fill': '#EFF4FB',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'card-gradient': 'linear-gradient(180deg, #C7D4F5 0%, #E4EBFC 55%, #FFFFFF 100%)',
      },
    },
  },
  plugins: [],
}
