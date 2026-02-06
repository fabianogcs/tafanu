"use client";

import { motion } from "framer-motion";

export default function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* HEADER SKELETON (Bate com seu título e botão Criar Novo) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-slate-200 pb-8">
        <div className="space-y-4">
          <div className="h-6 w-32 bg-slate-200 rounded-full animate-pulse" />
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-12 w-64 bg-slate-300 rounded-xl"
          />
          <div className="h-5 w-80 bg-slate-100 rounded-lg animate-pulse" />
        </div>
        <div className="h-14 w-44 bg-slate-200 rounded-2xl animate-pulse shadow-sm" />
      </div>

      {/* GRID DE CARDS (Simulando o layout exato dos seus cards de negócio) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-[32px] overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/50 space-y-0"
          >
            {/* Espaço da Imagem (h-56 igual ao seu card real) */}
            <div className="h-56 w-full bg-slate-100 animate-pulse relative">
              <div className="absolute top-4 left-4 h-6 w-20 bg-white/60 rounded-full" />
              <div className="absolute top-4 right-4 h-6 w-20 bg-white/60 rounded-full" />
            </div>

            {/* Conteúdo do Card */}
            <div className="p-6 space-y-6">
              <div>
                <div className="h-7 w-3/4 bg-slate-200 rounded-lg animate-pulse mb-2" />
                {/* Linha do endereço com o ícone do Pin */}
                <div className="h-4 w-1/2 bg-slate-100 rounded-md animate-pulse" />
              </div>

              {/* Grid de Stats (Visitas e Favoritos) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse" />
                <div className="h-16 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse" />
              </div>

              {/* Botões de Ação de baixo */}
              <div className="grid grid-cols-2 gap-3">
                <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
