"use client";

import { Share2, Check } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ShareButton() {
  const [state, setState] = useState<"idle" | "copied">("idle");

  const handleShare = async () => {
    const url = window.location.href;
    const title = document.title;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (err) {
        // Se falhar ou cancelar, tentamos a cópia
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch (err) {
      // Plano C: execCommand antigo para compatibilidade máxima
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`backdrop-blur-xl border p-2.5 rounded-full transition-all flex items-center justify-center relative ${
        state === "copied"
          ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
          : "bg-black/40 text-white border-white/20 hover:bg-white/20"
      }`}
    >
      <AnimatePresence mode="wait">
        {state === "copied" ? (
          <motion.div
            key="check"
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -5, opacity: 0 }}
          >
            <Check size={20} />
          </motion.div>
        ) : (
          <motion.div
            key="share"
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -5, opacity: 0 }}
          >
            <Share2 size={20} />
          </motion.div>
        )}
      </AnimatePresence>

      {state === "copied" && (
        <span className="absolute -top-10 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
          Copiado!
        </span>
      )}
    </button>
  );
}
