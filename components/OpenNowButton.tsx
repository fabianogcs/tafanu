"use client";

import { CheckSquare, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OpenNowButton() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Verifica se o filtro de abertos está ativo na URL
  const isOpenFilterActive = searchParams.get("status") === "open";

  // Se não estiver ativo, o botão/checkbox desaparece!
  if (!isOpenFilterActive) return null;

  const handleRemoveFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("status"); // Remove o filtro 'open'
    params.set("page", "1"); // Volta para a primeira página

    router.push(`/busca?${params.toString()}`);
  };

  return (
    <button
      onClick={handleRemoveFilter}
      title="Clique para desativar e ver todas as lojas"
      className="h-12 md:h-[56px] px-4 md:px-5 bg-emerald-500 text-white hover:bg-emerald-600 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all shrink-0 animate-in fade-in zoom-in duration-300 group cursor-pointer"
    >
      <CheckSquare size={18} className="shrink-0" />
      <span className="whitespace-nowrap">Apenas Abertos</span>
      <X
        size={16}
        className="opacity-60 group-hover:opacity-100 transition-opacity ml-1"
      />
    </button>
  );
}
