/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brandSky: "#88d8f9",
        brandStone: "#54595F",
        brandText: "#7A7A7A",
        brandAccent: "#68dd97",
        deepOcean: "#014260",
        vividGreen: "#68dd97",
      },
      fontFamily: {
        display: ['"Roboto Slab"', "serif"],
        body: ['"Roboto"', "sans-serif"],
        accent: ['"Roboto"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
