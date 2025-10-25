import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      screens: {
        xs: "410px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
        "3xl": "1536px",
        "4xl": "1700px",
        "5xl": "1900px",
      },

      colors: {
        black: "#000000",
        white: "#FFFFFF",
        transparent: "transparent",
        primary: {
          50: "#EDF8FF",
          75: "#D6EDFF",
          100: "#B5E2FF",
          500: "#0673FF",
          400: "#1E93FF",
          600: "#005EFF",
          700: "#0848C5",
          800: "#0D419B",
          900: "#0E285D",
        },
        grey: {
          50: "#F9FAFB",
          75: "#F7F9FC",
          90: "#F0F2F5",
          100: "#EBEBEB",
          200: "#E4E7EC",
          300: "#D0D5DD",
          400: "#98A2B3",
          500: "#667185",
          600: "#475367",
          700: "#344054",
          800: "#1D2739",
          900: "#101928",
        },
        warning: {
          75: "#FBE2B7",
          300: "#F5B546",
          400: "#F3A218",
          500: "#DD900D",
          700: "#865503",
        },
        error: {
          50: "#FFF1F1",
          75: "#FFC7C7",
          100: "#FFE0E0",
          500: "#F83B3B",
          800: "#F93A3A",
          900: "#E61C1C",
        },
        success: {
          50: "#EFFEF1",
          75: "#D9FFDE",
          100: "#B6FCBF",
          500: "#0AAF24",
          600: "#0C8921",
        },
      },
      fontSize: {
        h1: [
          "56px",
          {
            lineHeight: "56px",
            letterSpacing: "-0.02em",
            fontWeight: "600",
          },
        ],

        h2: [
          "46px",
          {
            lineHeight: "46px",
            letterSpacing: "-0.02em",
            fontWeight: "600",
          },
        ],

        "4xl": [
          "36px",
          {
            lineHeight: "43.2px",
            letterSpacing: "-0.02em",
            fontWeight: "600",
          },
        ],
        h3: [
          "32px",
          {
            lineHeight: "38.4px",
            letterSpacing: "-0.02em",
            fontWeight: "700",
          },
        ],
        h4: [
          "28px",
          {
            lineHeight: "33.6px",
            letterSpacing: "-0.02em",
            fontWeight: "600",
          },
        ],
        h5: [
          "24px",
          {
            lineHeight: "28.6px",
            letterSpacing: "-0.02em",
            fontWeight: "600",
          },
        ],
        h6: [
          "20px",
          {
            lineHeight: "24px",
            letterSpacing: "-0.02em",
            fontWeight: "400",
          },
        ],
        xl: [
          "18px",
          {
            lineHeight: "26.1px",
            letterSpacing: "-0.02em",
            fontWeight: "500",
          },
        ],
        base: [
          "16px",
          {
            lineHeight: "23.2px",
            letterSpacing: "-0.02em",
            fontWeight: "400",
          },
        ],
        sm: [
          "14px",
          {
            lineHeight: "20.3px",
            letterSpacing: "-0.02em",
            fontWeight: "400",
          },
        ],
        xs: [
          "12px",
          {
            lineHeight: "17.4px",
            letterSpacing: "-0.02em",
            fontWeight: "400",
          },
        ],
        "2xs": [
          "10px",
          {
            lineHeight: "15.4px",
            letterSpacing: "-0.02em",
            fontWeight: "400",
          },
        ],
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(-4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.15s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
