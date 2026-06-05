/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Warm neutral (replaces slate) — beige-taupe greys
        sand: {
          50: "#f9f6f1",
          100: "#f0ebe3",
          200: "#e3dbce",
          300: "#cfc4b2",
          400: "#ab9d87",
          500: "#847663",
          600: "#6a5d4d",
          700: "#524739",
          800: "#3b3329",
          900: "#2a241c",
          950: "#1a160f"
        },
        // Primary accent (replaces blue/violet/emerald/pink/cyan) — caramel/tan
        clay: {
          50: "#f9f1e8",
          100: "#f1e0cd",
          200: "#e4c5a0",
          300: "#d3a26f",
          400: "#c1854a",
          500: "#ad6e35",
          600: "#935a2b",
          700: "#784829",
          800: "#5f3b24",
          900: "#4d3120",
          950: "#2c1c12"
        }
      },
      fontFamily: {
        sans: ["Inter", "Pretendard", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 18px 45px rgba(42, 36, 28, 0.08)"
      }
    }
  },
  plugins: []
};
