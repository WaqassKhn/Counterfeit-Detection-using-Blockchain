export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        atlas: {
          ink: "#0f172a",
          steel: "#475569",
          sky: "#3b82f6",
          ember: "#ef4444",
          cream: "#f8fafc",
          mint: "#10b981",
          ocean: "#0f766e"
        }
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["Trebuchet MS", "sans-serif"]
      }
    }
  },
  plugins: []
};
