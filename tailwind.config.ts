/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          light: '#e0f2fe',
          medium: '#7dd3fc',
          deep: '#0369a1',
        },
      },
    },
  },
  plugins: [],
}
