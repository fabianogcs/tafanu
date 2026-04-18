"use client";

import { MapPin, Trash2, Loader2 } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { toast } from "sonner";

// 1. ATUALIZAÇÃO: Adicionado 'complement' na interface
interface AddressData {
  address: string;
  cep: string;
  neighborhood: string;
  city: string;
  state: string;
  number: string;
  complement: string; // ⬅️ NOVO
}

interface AddressSectionProps {
  addressData: AddressData;
  setAddressData: (
    data: AddressData | ((prev: AddressData) => AddressData),
  ) => void;
}

export function AddressSection({
  addressData,
  setAddressData,
}: AddressSectionProps) {
  const [isSearching, setIsSearching] = useState(false);
  const cepController = useRef<AbortController | null>(null);
  const numberInputRef = useRef<HTMLInputElement>(null);

  // 🚀 AQUI: A memória que sabe se é a primeira vez que a tela abre!
  const isFirstRender = useRef(true);

  useEffect(() => {
    const cep = addressData.cep.replace(/\D/g, "");

    const timeoutId = setTimeout(() => {
      if (cep.length === 8) {
        // 🚀 O SEGREDO: Se for a primeira vez (tela carregando), busca sem focar.
        if (isFirstRender.current) {
          fetchAddress(cep, false);
          isFirstRender.current = false; // Desliga a trava
        } else {
          // Se não for a primeira vez (usuário digitando), busca e foca!
          fetchAddress(cep, true);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      cepController.current?.abort();
    };
  }, [addressData.cep]);

  // 🚀 AQUI: Adicionamos o parâmetro shouldFocus (padrão true pra quando ele digitar manual)
  const fetchAddress = async (cep: string, shouldFocus: boolean = true) => {
    setIsSearching(true);
    const controller = new AbortController();
    cepController.current = controller;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
        signal: controller.signal,
      });
      const data = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado. Verifique os números.");
        return;
      }

      setAddressData((prev) => ({
        ...prev,
        address: data.logradouro || "",
        neighborhood: data.bairro || "",
        city: data.localidade || "",
        state: data.uf || "",
      }));

      // 🚀 AQUI: Só foca se a trava estiver liberada
      if (shouldFocus) {
        requestAnimationFrame(() => {
          numberInputRef.current?.focus();
        });
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error("Erro ao buscar CEP:", err);
      toast.error("Erro ao conectar com serviço de CEP.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[10px] font-black uppercase flex items-center gap-2">
          <MapPin size={18} className="text-rose-500" /> Localização
        </h2>
        {(addressData.address || addressData.cep) && (
          <button
            type="button"
            onClick={() =>
              setAddressData({
                address: "",
                cep: "",
                neighborhood: "",
                city: "",
                state: "",
                number: "",
                complement: "", // ⬅️ ATUALIZAÇÃO: Resetando o complemento ao excluir
              })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-500 rounded-lg text-[9px] font-black uppercase hover:bg-rose-100 transition-colors border border-rose-100"
          >
            <Trash2 size={12} /> Excluir Endereço
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* LINHA 1: CEP, Logradouro, Número */}
        <div className="relative">
          <input
            name="cep"
            value={addressData.cep}
            onChange={(e) => {
              // 🚀 SE O USUÁRIO APAGAR E COMEÇAR A DIGITAR, JÁ DESLIGAMOS A TRAVA!
              isFirstRender.current = false;
              setAddressData((prev) => ({ ...prev, cep: e.target.value }));
            }}
            placeholder="00000-000"
            maxLength={9}
            className="w-full h-12 px-5 bg-white rounded-xl font-bold text-xs border-2 border-indigo-100 outline-none focus:border-indigo-500"
          />
          {isSearching && (
            <div className="absolute right-3 top-3">
              <Loader2 className="animate-spin text-indigo-500" size={18} />
            </div>
          )}
        </div>

        <input
          name="address"
          value={addressData.address}
          readOnly
          className="md:col-span-2 h-12 px-5 bg-slate-100 text-slate-400 rounded-xl font-bold text-xs border cursor-not-allowed"
          placeholder="Rua / Logradouro"
        />

        <input
          name="number"
          ref={numberInputRef}
          value={addressData.number}
          onChange={(e) =>
            setAddressData((prev) => ({ ...prev, number: e.target.value }))
          }
          placeholder="Nº"
          className="h-12 px-5 bg-white rounded-xl font-bold text-xs border border-slate-200 outline-none focus:ring-2 ring-indigo-50"
        />

        {/* LINHA 2: Complemento, Bairro, Cidade, UF */}
        <input
          name="complement"
          value={addressData.complement}
          onChange={(e) =>
            setAddressData((prev) => ({ ...prev, complement: e.target.value }))
          }
          placeholder="Complemento (Opcional)"
          className="h-12 px-5 bg-white rounded-xl font-bold text-xs border border-slate-200 outline-none focus:ring-2 ring-indigo-50"
        />

        {/* ATUALIZAÇÃO: Removido o md:col-span-2 do Bairro para caberem 4 itens nesta linha */}
        <input
          name="neighborhood"
          value={addressData.neighborhood}
          readOnly
          className="h-12 px-5 bg-slate-100 text-slate-400 rounded-xl font-bold text-xs border cursor-not-allowed"
          placeholder="Bairro"
        />

        <input
          name="city"
          value={addressData.city}
          readOnly
          className="h-12 px-5 bg-slate-100 text-slate-400 rounded-xl font-bold text-xs border cursor-not-allowed"
          placeholder="Cidade"
        />

        <input
          name="state"
          value={addressData.state}
          readOnly
          className="h-12 px-5 bg-slate-100 text-slate-400 rounded-xl font-bold text-xs border cursor-not-allowed"
          placeholder="UF"
        />
      </div>
    </div>
  );
}
