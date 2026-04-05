/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        blush: "#ffd1dc",
        rose: "#ff8fab",
        hotpink: "#ff4d8d",
        softpink: "#fff0f5",
        darkpink: "#d63384",
      },
      boxShadow: {
        pink: "0 10px 30px rgba(255, 77, 141, 0.18)",
      },
    },
  },
  plugins: [],
};
