/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "ui-sans-serif", "sans-serif"],
        body: ["IBM Plex Sans", "ui-sans-serif", "sans-serif"]
      },
      colors: {
        brand: {
          50: "#eefaf6",
          100: "#d4f3ea",
          200: "#a8e8d6",
          300: "#74d8bd",
          400: "#42c39f",
          500: "#1ea781",
          600: "#118567",
          700: "#106953",
          800: "#105344",
          900: "#104439"
        },
        ink: {
          50: "#f4f7f8",
          100: "#d9e4e7",
          200: "#b8cbd1",
          300: "#90acb6",
          400: "#6a8d9a",
          500: "#527481",
          600: "#415d69",
          700: "#374c56",
          800: "#30414a",
          900: "#2b383f"
        }
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0px rgba(30,167,129,0.15)" },
          "50%": { boxShadow: "0 0 24px rgba(30,167,129,0.35)" }
        }
      },
      animation: {
        rise: "rise 450ms ease-out",
        pulseGlow: "pulseGlow 2.6s ease-in-out infinite"
      }
    }
  },
  plugins: []
};
