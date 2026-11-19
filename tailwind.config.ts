import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        jade: {
          50: "#E3F4F0",
          100: "#C4EFE2",
          400: "#45A38E",
          600: "#157A68",
          700: "#0E7A68",
          800: "#0F5E50",
          900: "#16383C",
        },
        parchment: {
          50: "#FDF9F0",
          100: "#F7EFE1",
          200: "#F4EFE2",
          300: "#EFE6D2",
          border: "#B88E4F",
          hairline: "#DFC696",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Segoe UI", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
