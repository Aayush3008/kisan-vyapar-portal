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
        background: "var(--background)",
        foreground: "var(--foreground)",
        botanical: {
          bg: "#FAFCFA", // warm organic off-white
          sage: "#F3FAF4", // soft sage tint
          text: "#1E2A22", // deep forest charcoal
          muted: "#617064", // slate moss
          emerald: "#2D7A46", // rich agricultural emerald
          sprout: "#6FBF78", // fresh sprout green
          gold: "#B7791F", // warm harvest gold
          border: "rgba(0,0,0,0.06)",
        },
      },
      fontFamily: {
        serif: ["var(--font-dm-serif)", "Playfair Display", "serif"],
        sans: ["var(--font-inter)", "Plus Jakarta Sans", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
        card: "0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)",
      },
    },
  },
  plugins: [],
};
export default config;
