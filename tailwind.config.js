/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brandSky: "#6EC1E4",
        brandStone: "#54595F",
        brandText: "#7A7A7A",
        brandAccent: "#61CE70",
        deepOcean: "#014260",
        vividGreen: "#00B74A",
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
