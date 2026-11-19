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
        // Palet utama: Shanshui Indigo / Porcelain Slate-Blue
        jade: {
          50: "#EBF2FA",
          100: "#D4E4F5",
          400: "#5D89B8",
          600: "#2D598A",
          700: "#244B78",
          800: "#1B3A5E",
          900: "#16273D",
        },
        parchment: {
          50: "#FDFBF6",
          100: "#F7F3EA",
          200: "#F3EFE5",
          300: "#ECE5D6",
          border: "#B89258",
          hairline: "#DEC99E",
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
