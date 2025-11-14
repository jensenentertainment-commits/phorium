/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        phorium: {
          dark: "#43f0f0ff",   // bakgrunn
          accent: "#8EA07D", // knapper / highlights
          light: "#ECE8DA",  // lys tekst
          off: "#DCD8CA",    // ekstra lys
        },
      },
    },
  },
  plugins: [],
};
