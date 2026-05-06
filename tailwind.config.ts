import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        gi: {
          navy: "#0B1F3A",
          "navy-light": "#102E52",
          gold: "#C9A227",
          "gold-soft": "#E7D28A",
          white: "#FFFFFF",
          background: "#F7F8FA",
          ink: "#172033",
          muted: "#64748b",
          line: "#E2E8F0",
          paper: "#F7F8FA",
          teal: "#C9A227",
          amber: "#C9A227",
          rose: "#B42318"
        }
      },
      boxShadow: {
        panel: "0 1px 2px rgba(11, 31, 58, 0.06), 0 12px 32px rgba(11, 31, 58, 0.08)",
        premium: "0 18px 48px rgba(11, 31, 58, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;
