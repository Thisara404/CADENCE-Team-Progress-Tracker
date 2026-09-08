import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#f3f2f2",
        panel: "#eae9e9",
        card: "#ffffff",
        ink: "#201e1d",
        rule: "rgba(32, 30, 29, 0.35)",
        ruleLight: "rgba(32, 30, 29, 0.15)",
        accent: {
          DEFAULT: "#ec3013",
          hover: "#ae1800",
          tint: "#ffe0d9",
        },
        slateText: {
          muted: "#7d7979",
          secondary: "#605d5d",
          subtle: "#9b9797",
        },
      },
      fontFamily: {
        sans: ["var(--font-archivo)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
