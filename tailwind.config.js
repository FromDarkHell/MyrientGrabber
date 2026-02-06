/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        highlight: "#FF5F1F",
        background: "#1C2020",
        muted: "#444",
      },
    },
  },
  plugins: [],
};
