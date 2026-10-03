import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        darkBg: "#07090e",
        cardBg: "#0f141f",
        cardBgHover: "#161d2d",
        borderColor: "#1e293b",
        cyanGlow: "#00f0ff",
        emeraldGlow: "#10b981",
        textMuted: "#94a3b8",
        textBright: "#f8fafc",
      },
      boxShadow: {
        neonCyan: "0 0 25px rgba(0, 240, 255, 0.25)",
        neonEmerald: "0 0 25px rgba(16, 185, 129, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
