/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: { 
    extend: {
      colors: {
        neutral: {
          // Custom neutral colors based on the provided hex values
          200: '#9aaba4', // Primary lighter neutral
          300: '#83928b', // Primary darker neutral
          100: '#adb5ad', // Slightly lighter variation
          400: '#6e7e72', // Even darker variation
          50:  '#c4d1c4', // Very light variation
          500: '#5a6a5e', // Darkest variation
        }
      },
      textColor: {
        neutral: {
          200: '#4fa89f',
          300: '#83928b'
        }
      },
      backgroundImage: {
        'gradient-to-r': 'linear-gradient(to right, var(--tw-gradient-stops))',
        'gradient-to-br': 'linear-gradient(to bottom right, var(--tw-gradient-stops))'
      }
    } 
  },
  plugins: [],
}