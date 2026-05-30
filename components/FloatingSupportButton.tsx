"use client";

import { usePathname } from "next/navigation";
import { Headset } from "lucide-react";

interface SupportButtonProps {
  supportName: string;
  supportPhone: string;
  userName: string;
  userId: string; // Mantivemos aqui só para não precisar alterar o layout.tsx
}

export default function FloatingSupportButton({
  supportName,
  supportPhone,
  userName,
}: SupportButtonProps) {
  const pathname = usePathname();

  // 🚀 O ESPIÃO: Se a URL contiver '/editar' ou '/novo', o botão não renderiza
  if (pathname.includes("/editar") || pathname.includes("/novo")) {
    return null;
  }

  // 🚀 MENSAGEM LIMPA E HUMANA (Sem aquele ID de banco de dados)
  const encodedMessage = encodeURIComponent(
    `Olá! Meu nome é ${userName}. Preciso de ajuda com a minha vitrine no Tafanu.`,
  );
  const supportLink = `https://wa.me/${supportPhone}?text=${encodedMessage}`;

  return (
    <a
      href={supportLink}
      target="_blank"
      rel="noopener noreferrer"
      title={`Falar com ${supportName}`}
      className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] group flex items-center gap-0"
    >
      <div className="opacity-0 group-hover:opacity-100 max-w-0 group-hover:max-w-xs overflow-hidden transition-all duration-500 ease-in-out">
        <div className="bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest px-4 py-3 rounded-l-2xl border-y border-l border-indigo-500 shadow-lg whitespace-nowrap mr-[-10px] pr-4">
          {supportName}
        </div>
      </div>
      <div className="w-14 h-14 md:w-16 md:h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(79,70,229,0.4)] border-4 border-white group-hover:scale-105 active:scale-95 transition-all relative z-10">
        <Headset size={26} strokeWidth={2} />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
      </div>
    </a>
  );
}
