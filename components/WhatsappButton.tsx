"use client";

import { MessageCircle, Loader2 } from "lucide-react"; // ⬅️ Trocamos Phone por MessageCircle
import { registerClickEvent } from "@/app/actions";
import { useState } from "react";

export default function WhatsappButton({
  businessId,
  phone,
  businessName,
}: {
  businessId: string;
  phone: string;
  businessName: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleContact = async () => {
    setLoading(true);
    // 1. Avisa o banco que houve um clique
    try {
      await registerClickEvent(businessId, "WHATSAPP");
    } catch (e) {
      console.error("Erro ao contar clique", e);
    }

    // 2. Abre o WhatsApp
    const message = encodeURIComponent(
      "Olá, vi seu anúncio no Tafanu e gostaria de mais informações.",
    );
    const whatsappUrl = `https://wa.me/55${phone.replace(/\D/g, "")}?text=${message}`;

    // Pequeno delay apenas para garantir que o clique foi registrado antes de sair da página
    window.open(whatsappUrl, "_blank");
    setLoading(false);
  };

  return (
    <button
      onClick={handleContact}
      disabled={loading}
      className="w-full h-16 bg-[#25D366] text-white rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:bg-[#20ba5a] transition-all font-black uppercase text-xs tracking-widest italic disabled:opacity-70"
    >
      {loading ? (
        <Loader2 size={20} className="animate-spin" />
      ) : (
        <>
          {/* MessageCircle com preenchimento (fill) fica idêntico ao ícone do App */}
          <MessageCircle size={22} fill="white" className="text-white" />
          Chamar no WhatsApp
        </>
      )}
    </button>
  );
}
