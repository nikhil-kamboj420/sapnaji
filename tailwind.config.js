export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        blush: "#F8D7E3",
        lavender: "#C8B4F2",
        lilac: "#A57CFF",
        velvet: "#5D3B8D",
        pearl: "#FDF8FB",
        peach: "#F8B29D",
      },
      boxShadow: {
        glow: "0 15px 45px rgba(193, 150, 255, 0.22)",
        soft: "0 12px 35px rgba(91, 49, 139, 0.16)",
      },
      dropShadow: {
        soft: "0 20px 50px rgba(120, 84, 175, 0.18)",
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        drift: "drift 14s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        drift: {
          "0%": { transform: "translateX(0px)" },
          "100%": { transform: "translateX(18px)" },
        },
      },
    },
  },
  plugins: [],
};
