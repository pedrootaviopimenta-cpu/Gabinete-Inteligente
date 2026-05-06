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
          ink: "#1e293b",
          muted: "#64748b",
          line: "#d9e2ec",
          paper: "#f8fafc",
          navy: "#172554",
          teal: "#0f766e",
          amber: "#b45309",
          rose: "#be123c"
        }
      },
      boxShadow: {
        panel: "0 1px 2px rgba(15, 23, 42, 0.08), 0 8px 24px rgba(15, 23, 42, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
