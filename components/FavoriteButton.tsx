"use client";

import { toast } from "sonner";
import { Heart, Loader2 } from "lucide-react";
import { useState } from "react";
import { toggleFavorite } from "@/app/actions";
import { motion, AnimatePresence } from "framer-motion";

interface FavoriteButtonProps {
  businessId: string;
  initialIsFavorited?: boolean;
  isLoggedIn: boolean;
  emailVerified?: boolean; // ⬅️ Adicionamos essa portinha
}

export default function FavoriteButton({
  businessId,
  initialIsFavorited = false,
  isLoggedIn,
  emailVerified = false, // ⬅️ Se ninguém avisar, a gente assume que não tá verificado por segurança
}: FavoriteButtonProps) {
  const [liked, setLiked] = useState(initialIsFavorited);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    // 1. Checa se tá logado (Sua lógica original)
    if (!isLoggedIn) {
      toast.error("Acesso restrito", {
        description: "Você precisa estar logado para salvar favoritos.",
      });
      return;
    }

    // 2. NOVA TRAVA: Checa se o e-mail é real/verificado
    if (!emailVerified) {
      toast.warning("Confirme seu e-mail", {
        description:
          "Para evitar perfis falsos, confirme seu e-mail para liberar os favoritos.",
      });
      return;
    }

    if (loading) return;

    // 🚀 O PULO DO GATO (Mantido): Muda a cor ANTES de ir no banco
    const novoEstado = !liked;
    setLiked(novoEstado);

    try {
      const res = await toggleFavorite(businessId);

      if (res.error) {
        toast.error(res.error);
        setLiked(!novoEstado); // ⏪ Volta a cor original se der erro
      }
    } catch (error) {
      setLiked(!novoEstado); // ⏪ Volta a cor se a internet cair
      toast.error("Erro ao salvar favorito.");
    }
  }

  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleToggle();
      }}
      disabled={loading}
      className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-black/5 rounded-full transition-all relative overflow-hidden ${
        liked ? "text-rose-500" : "text-slate-700"
      }`}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Loader2 size={20} className="animate-spin text-current" />
          </motion.div>
        ) : (
          <motion.div
            key={liked ? "liked" : "unliked"}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Heart size={20} className={liked ? "fill-current" : "fill-none"} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
