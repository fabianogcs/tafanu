"use client";

import { Heart, Loader2 } from "lucide-react";
import { useState } from "react";
import { toggleFavorite } from "@/app/actions";
import { motion, AnimatePresence } from "framer-motion";

interface FavoriteButtonProps {
  businessId: string;
  initialIsFavorited?: boolean;
}

export default function FavoriteButton({
  businessId,
  initialIsFavorited = false,
}: FavoriteButtonProps) {
  const [liked, setLiked] = useState(initialIsFavorited);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    if (loading) return;
    setLoading(true);

    try {
      const res = await toggleFavorite(businessId);
      if (res.error) {
        alert(res.error);
      } else {
        setLiked(res.isFavorite);
      }
    } catch (error) {
      console.error("Erro ao favoritar:", error);
    } finally {
      setLoading(false);
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
      className={`backdrop-blur-xl border p-2.5 rounded-full transition-all relative overflow-hidden ${
        liked
          ? "bg-rose-500/20 text-rose-500 border-rose-500/50"
          : "bg-black/40 text-white border-white/20 hover:bg-white/20"
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
            <Loader2 size={20} className="animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            key={liked ? "liked" : "unliked"}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Heart
              size={20}
              className={liked ? "fill-rose-500" : "fill-none"}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
