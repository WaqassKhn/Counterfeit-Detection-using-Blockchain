export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        atlas: {
          ink: "#0F172A",
          steel: "#334155",
          sky: "#0EA5E9",
          ember: "#EA580C",
          cream: "#F8FAFC",
          mint: "#10B981"
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

