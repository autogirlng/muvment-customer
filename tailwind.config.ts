import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    screens: {
      md: { max: "1020px" }, // any screen ≤ 1020px is considered 'md'
      lg: "1021px", // larger screens start after 1020px
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      animation: {
        fadeIn: "fadeIn 0.15s ease-out",
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        "slide-up": {
          from: {
            opacity: "0",
            transform: "translateY(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
