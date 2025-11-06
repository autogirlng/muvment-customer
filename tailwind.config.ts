import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      animation: {
        fadeIn: "fadeIn 0.15s ease-out",
      },
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};

export default config;
