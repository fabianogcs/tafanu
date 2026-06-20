"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, UserPlus } from "lucide-react";
import { criarLeadDireto } from "@/app/dashboard/funil/actions";

export default function CriarLeadForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 🚀 ESTADO NOVO: Guarda só o prefixo do e-mail
  const [emailPrefix, setEmailPrefix] = useState("");

  // 🚀 GERA UMA SENHA ALEATÓRIA AUTOMÁTICA
  const [senhaProvisoria] = useState(() =>
    Math.random().toString(36).slice(-6),
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    const formData = new FormData(event.currentTarget);

    const res = await criarLeadDireto(formData);

    if (res.success) {
      toast.success("Negócio criado e adicionado à Aba 1!");
      (event.target as HTMLFormElement).reset();
      setEmailPrefix(""); // 🚀 Limpa o prefixo do e-mail também
      setIsOpen(false);
    } else {
      toast.error(res.error);
    }
    setIsSaving(false);
  }

  return (
    <div className="mb-8 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 p-4 text-left font-black text-[#023059] hover:bg-gray-50 transition-all uppercase text-sm"
      >
        <Plus
          size={18}
          className={`transition-transform ${isOpen ? "rotate-45" : ""}`}
        />
        Cadastrar Novo Lead (Exclusivo Admin)
      </button>

      {isOpen && (
        <form
          onSubmit={handleSubmit}
          className="p-6 border-t border-gray-100 bg-gray-50/50 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* 🚀 CAMPO DE E-MAIL OTIMIZADO */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase">
              E-mail do Negócio
            </label>
            <div className="flex items-center w-full rounded-xl border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-emerald-400 overflow-hidden transition-all">
              <input
                type="text"
                placeholder="nome.da.loja"
                required
                maxLength={60}
                value={emailPrefix}
                // Se colar algo com @, ele corta e pega só o prefixo
                onChange={(e) =>
                  setEmailPrefix(e.target.value.replace(/@.*/, ""))
                }
                className="w-full p-3 outline-none text-sm font-bold text-[#0F172A] bg-transparent"
              />
              <span className="pr-4 py-3 text-sm font-black text-gray-400 select-none whitespace-nowrap bg-transparent">
                @tafanu.com.br
              </span>
            </div>

            {/* O INPUT ESCONDIDO QUE MANDA O DADO REAL PRO BACKEND */}
            <input
              type="hidden"
              name="email"
              value={emailPrefix ? `${emailPrefix}@tafanu.com.br` : ""}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase">
              Nome da Empresa
            </label>
            <input
              name="name"
              placeholder="Ex: Barbearia do João"
              required
              maxLength={100}
              className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-400 text-sm font-bold text-[#0F172A]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase">
              WhatsApp
            </label>
            <input
              name="phone"
              placeholder="(11) 99999-9999"
              required
              maxLength={20}
              className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-400 text-sm font-bold text-[#0F172A]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase">
              Código Afiliado (Opcional)
            </label>
            <input
              name="affiliateCode"
              placeholder="Ex: JOAO123"
              maxLength={50}
              className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-400 text-sm font-bold text-[#0F172A]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase">
              Senha Provisória (Segura)
            </label>
            <input
              name="password"
              defaultValue={senhaProvisoria}
              required
              maxLength={50}
              className="w-full p-3 rounded-xl border border-gray-200 bg-gray-100 outline-none focus:ring-2 focus:ring-emerald-400 text-sm font-bold text-[#0F172A]"
            />
          </div>

          <div className="md:col-span-3 flex justify-end mt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#0F172A] text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-800 flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <UserPlus size={16} />
              )}
              Gerar e Iniciar Funil
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
