/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#121212",
        paper: "#f5f2ed",
        cream: "#e9e2d8",
        moss: "#556044",
        orange: "#e87546",
        line: "rgba(18, 18, 18, 0.16)",
      },
      fontFamily: {
        arabic: ['"Noto Kufi Arabic"', 'sans-serif'],
        latin: ['"DM Sans"', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(30%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        marquee: 'marquee 20s linear infinite',
        float: 'float 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
