"use client";

import { MapPin, Trash2, Loader2 } from "lucide-react";
import { useRef } from "react";

interface AddressData {
  address: string;
  cep: string;
  neighborhood: string;
  city: string;
  state: string;
  number: string;
}

interface AddressSectionProps {
  addressData: AddressData;
  setAddressData: (data: AddressData) => void;
}

export function AddressSection({
  addressData,
  setAddressData,
}: AddressSectionProps) {
  const cepController = useRef<AbortController | null>(null);

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, "");
    if (cep.length !== 8) return;

    // Cancela requisição anterior se o usuário digitar rápido demais
    cepController.current?.abort();
    const controller = new AbortController();
    cepController.current = controller;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
        signal: controller.signal,
      });
      const data = await response.json();

      if (!data.erro) {
        setAddressData({
          ...addressData,
          cep: cep,
          address: data.logradouro || "",
          neighborhood: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "",
        });
      }
    } catch (err) {
      // Ignora erro de abort
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
              })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-500 rounded-lg text-[9px] font-black uppercase hover:bg-rose-100 transition-colors border border-rose-100"
          >
            <Trash2 size={12} /> Excluir Endereço
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          value={addressData.cep}
          onChange={(e) =>
            setAddressData({ ...addressData, cep: e.target.value })
          }
          onBlur={handleCepBlur}
          placeholder="DIGITE O CEP"
          className="h-12 px-5 bg-white rounded-xl font-bold text-xs border-2 border-indigo-100 outline-none focus:border-indigo-500"
        />
        <input
          value={addressData.address}
          readOnly
          className="md:col-span-2 h-12 px-5 bg-slate-100 text-slate-400 rounded-xl font-bold text-xs border cursor-not-allowed"
          placeholder="Rua / Logradouro"
        />
        <input
          value={addressData.number}
          onChange={(e) =>
            setAddressData({ ...addressData, number: e.target.value })
          }
          placeholder="Nº"
          className="h-12 px-5 bg-white rounded-xl font-bold text-xs border border-slate-200 outline-none focus:ring-2 ring-indigo-50"
        />
        <input
          value={addressData.neighborhood}
          readOnly
          className="md:col-span-2 h-12 px-5 bg-slate-100 text-slate-400 rounded-xl font-bold text-xs border cursor-not-allowed"
          placeholder="Bairro"
        />
        <input
          value={addressData.city}
          readOnly
          className="h-12 px-5 bg-slate-100 text-slate-400 rounded-xl font-bold text-xs border cursor-not-allowed"
          placeholder="Cidade"
        />
        <input
          value={addressData.state}
          readOnly
          className="h-12 px-5 bg-slate-100 text-slate-400 rounded-xl font-bold text-xs border cursor-not-allowed"
          placeholder="UF"
        />
      </div>
    </div>
  );
}
