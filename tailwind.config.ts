import { withUt } from "uploadthing/tw";

export default withUt({
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}", // ESSENCIAL: Onde moram os seus temas!
  ],
  safelist: [
    // Cores originais do Tafanu
    "text-tafanu-action",
    "bg-tafanu-action",
    "bg-tafanu-action/30",
    "bg-tafanu-action/20",
    "border-tafanu-action/30",
    "from-tafanu-action",

    // Suporte para os Temas Dinâmicos (Garante que o Tailwind gere as cores do lib/themes)
    // Mantivemos este pois ele funciona para classes padrão (ex: bg-yellow-500)
    {
      pattern:
        /(bg|text|border)-(yellow|cyan|orange|emerald|rose|blue|slate|zinc|violet|neutral|amber)-(400|500|600|700|800|900|950)/,
    },

    // --- REMOVIDO AS REGRAS DE HEX ([#...]) QUE DAVAM ERRO ---
    // O Tailwind JIT já detecta cores hexadecimais automaticamente se estiverem escritas
    // explicitamente no código (ex: className="bg-[#123456]").
    // Se você usar cores dinâmicas vindas do banco, use style={{ backgroundColor: cor }} no React.

    // Suas cores manuais específicas (Mantidas para segurança)
    "text-amber-500",
    "text-emerald-400",
    "text-blue-400",
    "text-rose-400",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-blue-500",
    "bg-rose-500",
    "to-amber-300",
    "to-yellow-300",
    "to-teal-400",
    "to-cyan-400",
    "to-violet-500",
  ],
  theme: {
    extend: {
      colors: {
        "tafanu-blue": "#0f172a",
        "tafanu-action": "#25d366",
        "tafanu-light": "#f1f5f9",
      },
      animation: {
        shine: "shine 3s infinite",
        ripple: "ripple 1.5s infinite",
        blob: "blob 7s infinite",
        marquee: "marquee 35s linear infinite",
      },
      keyframes: {
        shine: { "100%": { left: "125%" } },
        ripple: {
          "0%": { transform: "scale(1)", opacity: "0.4" },
          "100%": { transform: "scale(1.5)", opacity: "0" },
        },
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
});
