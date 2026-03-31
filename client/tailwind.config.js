/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          1: "#1a1a2e",
          2: "#16213e",
          3: "#0f3460",
          4: "#202c33",
          5: "#111b21",
          6: "#2a3942",
        },
        chat: {
          bg: "#efeae2",
          incoming: "#ffffff",
          outgoing: "#d9fdd3",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s infinite",
        "bounce-slow": "bounce 2s infinite",
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-in-out",
        "slide-right": "slideRight 0.3s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideRight: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
    },
  },

  // ====== DaisyUI Plugin ======
  plugins: [
    require("daisyui"),
  ],

  // ====== DaisyUI Config ======
  daisyui: {
    themes: [
      {
        chatapp: {
          "primary": "#22c55e",
          "primary-content": "#ffffff",
          "secondary": "#2a3942",
          "secondary-content": "#ffffff",
          "accent": "#4ade80",
          "accent-content": "#ffffff",
          "neutral": "#202c33",
          "neutral-content": "#d1d5db",
          "base-100": "#111b21",
          "base-200": "#202c33",
          "base-300": "#2a3942",
          "base-content": "#ffffff",
          "info": "#3b82f6",
          "info-content": "#ffffff",
          "success": "#22c55e",
          "success-content": "#ffffff",
          "warning": "#f59e0b",
          "warning-content": "#ffffff",
          "error": "#ef4444",
          "error-content": "#ffffff",
        },
      },
      "light",
      "dark",
      "night",
      "forest",
    ],
    darkTheme: "chatapp",
    base: true,
    styled: true,
    utils: true,
    logs: false,
  },
};