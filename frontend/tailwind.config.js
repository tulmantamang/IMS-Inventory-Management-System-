/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6", // Professional Blue (blue-500)
        secondary: "#64748b", // Slate Gray (slate-500)
        accent: "#0ea5e9", // Sky Blue (sky-500)
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light"], // Force Light Theme
  },
};
