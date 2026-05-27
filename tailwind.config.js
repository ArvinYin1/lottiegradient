/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['index.html', 'js/main.js'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
        },
      },
      boxShadow: {
        soft: '0 2px 15px -3px rgba(0,0,0,0.07)',
      },
    },
  },
  plugins: [],
}
