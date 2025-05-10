/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      screens: {
        "xxxs-max": { max: "374px" },
        "xxs-max": { max: "767px" },
      },
    },
  },
  plugins: [],
};
