"use client";

import { Phone } from "lucide-react";
import { incrementWhatsappClicks } from "@/app/actions";

export default function WhatsappButton({
  businessId,
  phone,
  businessName,
}: {
  businessId: string;
  phone: string;
  businessName: string;
}) {
  const handleContact = async () => {
    // 1. Avisa o banco que houve um clique (sem travar o usuário)
    try {
      await incrementWhatsappClicks(businessId);
    } catch (e) {
      console.error("Erro ao contar clique", e);
    }

    // 2. Abre o WhatsApp
    const message = encodeURIComponent(
      `Olá! Vi seu anúncio no Tafanu e gostaria de mais informações.`,
    );
    const whatsappUrl = `https://wa.me/55${phone.replace(/\D/g, "")}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <button
      onClick={handleContact}
      className="w-full h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:bg-emerald-600 transition-all font-black uppercase text-xs tracking-widest italic"
    >
      <Phone size={20} fill="white" />
      Chamar no WhatsApp
    </button>
  );
}
