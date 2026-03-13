/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "sky-blue": "#5DC3EF",
        "dark-blue": "#107DAC",
        "light-blue": "#D8ECF3",
        "slate-gray": "#727272",
        "dark-gray": "#A9A9A9",
        "success-green": "#52c41a",
        "danger-red": "#ED675E",
      },

      screens: { tiny: "140px", xs: "320px", "3xl": "1800px" },
    },
  },
  plugins: [],
}
