/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/features/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: {
          light: "#FAFAFA",
          dark: "#111B2D",
        },
        surface: {
          light: "#FFFFFF",
          dark: "#162235",
          "2-light": "#F1F5F9",
          "2-dark": "#1F2E46",
        },
        accent: {
          blue: "#2563EB",
          emerald: "#059669",
          indigo: "#4F46E5",
          orange: "#D97706",
        },
        text: {
          "primary-light": "#0F172A",
          "primary-dark": "#F8FAFC",
          "secondary-light": "#475569",
          "secondary-dark": "#B7C3D6",
          "muted-light": "#94A3B8",
          "muted-dark": "#64748B",
        },
        border: {
          light: "#E2E8F0",
          dark: "#1E293B",
        },
        danger: "#DC2626",
        success: "#10B981",
        warning: "#F59E0B",
      },
      fontFamily: {
        inter: ["Inter"],
      },
    },
  },
  plugins: [],
};
