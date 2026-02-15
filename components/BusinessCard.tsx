"use client";

import Link from "next/link";
import { MapPin, ArrowRight, Heart } from "lucide-react";
import FavoriteButton from "./FavoriteButton";
import { motion } from "framer-motion";

export default function BusinessCard({ business, isLoggedIn }: any) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-[25px] overflow-hidden border border-gray-100 shadow-md hover:shadow-xl transition-all group flex flex-col h-full"
    >
      {/* IMAGEM COMPACTA */}
      <div className="relative aspect-[16/10] w-full bg-gray-100 overflow-hidden">
        <img
          src={business.imageUrl || "/og-default.png"}
          alt={business.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2 scale-75 origin-top-right">
          <FavoriteButton
            businessId={business.id}
            initialIsFavorited={true} // Aqui recomendo usar business.isFavorite se o seu banco mandar
            isLoggedIn={isLoggedIn} // ⬅️ A nova trava aqui
          />
        </div>
      </div>

      {/* CONTEÚDO ENXUTO */}
      <div className="p-3 md:p-4 flex flex-col flex-1">
        <span className="text-[8px] md:text-[9px] font-black bg-tafanu-blue/5 text-tafanu-blue px-2 py-0.5 rounded-md uppercase w-fit mb-1">
          {business.category}
        </span>

        <h3 className="text-sm md:text-base font-black text-tafanu-blue mb-1 truncate uppercase italic leading-tight">
          {business.name}
        </h3>

        <div className="flex items-center gap-1 text-gray-400 mb-3">
          <MapPin size={10} className="flex-shrink-0" />
          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-tight truncate">
            {business.neighborhood || business.city}
          </span>
        </div>

        {/* BOTÃO ACESSAR (ESTILO DISCRETO) */}
        <Link
          href={`/site/${business.slug}`}
          className="mt-auto flex items-center justify-between gap-2 bg-gray-50 text-tafanu-blue p-2.5 md:p-3 rounded-xl font-black text-[9px] md:text-[10px] hover:bg-tafanu-blue hover:text-white transition-all uppercase"
        >
          Ver Página <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
}
