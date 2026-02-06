"use client";

import { useState, useEffect } from "react";
import {
  X,
  Filter,
  ChevronRight,
  Check,
  ChevronLeft,
  ArrowRight,
  Map,
  Clock,
  Zap,
  Navigation,
  Square,
  CheckSquare,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface FilterModalProps {
  availableCategories?: Record<string, string[]>;
}

export default function FilterModal({
  availableCategories = {},
}: FilterModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"cat" | "adv">("cat");
  const [catStep, setCatStep] = useState<"main" | "sub">("main");
  const [tempCat, setTempCat] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  // --- ESTADOS (Rascunho) ---
  const [draftCategory, setDraftCategory] = useState("");
  const [draftSubs, setDraftSubs] = useState<string[]>([]);
  const [draftRadius, setDraftRadius] = useState("50");
  const [draftStatus, setDraftStatus] = useState("all");
  const [draftSort, setDraftSort] = useState("newest");
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDraftCategory(searchParams.get("category") || "");
      const subsParam = searchParams.get("subcategory");
      setDraftSubs(subsParam ? subsParam.split(",") : []);
      setDraftRadius(searchParams.get("radius") || "50");
      setDraftStatus(searchParams.get("status") || "all");
      setDraftSort(searchParams.get("sort") || "newest");
      setCatStep("main");
    }
  }, [isOpen, searchParams]);

  // Trava rolagem
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const currentLat = searchParams.get("lat");

  const ensureGPS = (callback: (lat: number, lng: number) => void) => {
    if (!navigator.geolocation) return alert("Navegador sem suporte a GPS.");
    setIsLoadingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLoadingGPS(false);
        callback(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        setIsLoadingGPS(false);
        console.error(error);
        alert("Ative o GPS para usar este filtro.");
      },
    );
  };

  const applyFilters = () => {
    const isRadiusActive = draftRadius !== "9999" && draftRadius !== "50";
    if ((isRadiusActive || draftSort === "newest") && !currentLat) {
      ensureGPS((lat, lng) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("lat", lat.toString());
        params.set("lng", lng.toString());
        pushParams(params);
      });
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    pushParams(params);
  };

  const pushParams = (params: URLSearchParams) => {
    if (draftCategory) params.set("category", draftCategory);
    else params.delete("category");

    if (draftSubs.length > 0) params.set("subcategory", draftSubs.join(","));
    else params.delete("subcategory");

    params.set("radius", draftRadius);
    params.set("status", draftStatus);
    params.set("sort", draftSort);

    setIsOpen(false);
    router.push(`/busca?${params.toString()}`);
  };

  const handleCategorySelect = (cat: string) => {
    setDraftCategory(cat);
    if (cat !== tempCat) setDraftSubs([]);
    setTempCat(cat);
    setCatStep("sub");
  };

  const toggleSub = (sub: string) => {
    setDraftSubs((prev) => {
      if (prev.includes(sub)) return prev.filter((s) => s !== sub);
      return [...prev, sub];
    });
  };

  const clearCategory = () => {
    setDraftCategory("");
    setDraftSubs([]);
  };

  const isFilterActive =
    !!searchParams.get("category") ||
    searchParams.get("status") !== "all" ||
    (searchParams.get("radius") || "50") !== "50";

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full md:w-auto flex items-center justify-center gap-3 px-6 py-4 bg-tafanu-action text-tafanu-blue rounded-xl shadow-xl hover:bg-white hover:text-tafanu-blue transition-all group font-black uppercase text-xs tracking-widest"
      >
        <Filter size={16} />
        Filtros Avançados
        {isFilterActive && (
          <span className="w-2 h-2 bg-white group-hover:bg-rose-500 rounded-full animate-pulse" />
        )}
      </button>

      {isOpen && (
        <>
          {/* Overlay Escuro no Desktop para focar no modal */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[48] hidden md:block animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
          />

          {/* --- CORREÇÃO DE LAYOUT DESKTOP ---
             top-20: Mobile (abaixo do nav)
             md:top-24: Desktop (abaixo do nav)
             md:right-10: Desktop (alinhado à direita com margem)
             md:left-auto: Desktop (não ocupa a esquerda)
             md:w-[450px]: Desktop (largura fixa elegante)
             md:rounded-2xl: Desktop (borda arredondada)
             md:bottom-10: Desktop (margem inferior)
          */}
          <div className="fixed left-0 right-0 bottom-0 top-20 md:top-24 md:left-auto md:right-10 md:bottom-10 md:w-[450px] z-[49] bg-white flex flex-col w-full shadow-2xl overscroll-none border-t md:border border-white/10 animate-in slide-in-from-bottom md:slide-in-from-right duration-300 md:rounded-2xl overflow-hidden">
            {/* HEADER */}
            <div className="bg-[#0f172a] text-white flex justify-between items-center px-6 py-4 shrink-0 shadow-md">
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-tafanu-action" />
                <span className="font-black uppercase tracking-widest text-sm">
                  FILTRAR RESULTADOS
                </span>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="bg-white/10 p-2 rounded-full hover:bg-white/20 active:scale-95 transition-all"
              >
                <X size={24} className="text-white" />
              </button>
            </div>

            {/* ABAS */}
            <div className="flex p-3 bg-gray-100 gap-3 shrink-0 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("cat")}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === "cat"
                    ? "bg-white text-tafanu-blue shadow-sm border border-gray-200"
                    : "text-gray-400 hover:bg-gray-200"
                }`}
              >
                Categorias
              </button>
              <button
                onClick={() => setActiveTab("adv")}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === "adv"
                    ? "bg-tafanu-blue text-white shadow-md"
                    : "text-gray-400 hover:bg-gray-200"
                }`}
              >
                Opções & Local
              </button>
            </div>

            {/* CONTEÚDO */}
            <div className="flex-1 overflow-y-auto p-6 bg-white pb-32 md:pb-6">
              {/* CONTEÚDO CATEGORIAS */}
              {activeTab === "cat" && (
                <>
                  {Object.keys(availableCategories).length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-50 space-y-4">
                      <Filter size={40} />
                      <p className="text-sm font-bold">
                        Sem categorias nesta busca.
                      </p>
                    </div>
                  ) : catStep === "main" ? (
                    <div className="space-y-3">
                      <button
                        onClick={clearCategory}
                        className={`w-full p-4 border-2 rounded-2xl text-xs font-black uppercase transition-all mb-4 ${
                          !draftCategory
                            ? "border-tafanu-action bg-emerald-50 text-emerald-700"
                            : "border-dashed border-gray-300 text-gray-400"
                        }`}
                      >
                        {draftCategory
                          ? "Limpar Seleção"
                          : "Todas as Categorias"}
                      </button>
                      {Object.keys(availableCategories).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => handleCategorySelect(cat)}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                            draftCategory === cat
                              ? "bg-[#0f172a] text-white border-[#0f172a] shadow-lg"
                              : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <span className="font-bold text-sm">{cat}</span>
                          <ChevronRight size={16} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3 animate-in slide-in-from-right-10 duration-200">
                      <button
                        onClick={() => setCatStep("main")}
                        className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase mb-4 hover:text-tafanu-blue"
                      >
                        <ChevronLeft size={14} /> Voltar
                      </button>

                      <h3 className="text-xl font-black text-[#0f172a] uppercase italic mb-4 border-b pb-2">
                        {tempCat}
                      </h3>

                      <button
                        onClick={() => {
                          setDraftCategory(tempCat);
                          setDraftSubs([]);
                        }}
                        className={`w-full p-4 rounded-2xl font-bold text-sm mb-4 flex justify-between items-center transition-all ${
                          draftCategory === tempCat && draftSubs.length === 0
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm"
                            : "bg-gray-50 text-gray-500 border border-transparent"
                        }`}
                      >
                        Selecionar Toda a Categoria
                        {draftCategory === tempCat &&
                          draftSubs.length === 0 && <Check size={18} />}
                      </button>

                      <div className="grid grid-cols-1 gap-2">
                        {availableCategories[tempCat]?.map((sub: string) => {
                          const isSelected = draftSubs.includes(sub);
                          return (
                            <button
                              key={sub}
                              onClick={() => toggleSub(sub)}
                              className={`w-full text-left p-4 rounded-xl text-sm font-medium transition-all flex items-center gap-3 border ${
                                isSelected
                                  ? "bg-[#0f172a] text-white border-[#0f172a] shadow-md"
                                  : "bg-white text-gray-600 border-gray-100 hover:bg-gray-50"
                              }`}
                            >
                              {isSelected ? (
                                <CheckSquare
                                  size={20}
                                  className="text-tafanu-action shrink-0"
                                />
                              ) : (
                                <Square
                                  size={20}
                                  className="text-gray-300 shrink-0"
                                />
                              )}
                              <span className="leading-tight">{sub}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* CONTEÚDO AVANÇADO */}
              {activeTab === "adv" && (
                <div className="space-y-8">
                  {!currentLat && (
                    <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex flex-col items-center text-center">
                      <p className="text-xs text-blue-800 font-bold mb-3 uppercase tracking-wide">
                        📍 Necessário para distância
                      </p>
                      <button
                        onClick={() => ensureGPS(() => {})}
                        disabled={isLoadingGPS}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-blue-700 shadow-lg"
                      >
                        {isLoadingGPS ? "Localizando..." : <>Ativar GPS</>}
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="flex items-center gap-2 text-xs font-black uppercase text-gray-400 mb-4">
                      <Map size={16} className="text-tafanu-action" /> Distância
                      Máxima
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {["5", "10", "25", "50", "100"].map((km) => (
                        <button
                          key={km}
                          onClick={() => setDraftRadius(km)}
                          className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${draftRadius === km ? "border-[#0f172a] bg-[#0f172a] text-white" : "border-gray-100 text-gray-400"}`}
                        >
                          {km} km
                        </button>
                      ))}
                      <button
                        onClick={() => setDraftRadius("9999")}
                        className={`py-3 rounded-xl text-xs font-bold border-2 ${draftRadius === "9999" ? "border-[#0f172a] bg-[#0f172a] text-white" : "border-gray-100 text-gray-400"}`}
                      >
                        Sem Limite
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-black uppercase text-gray-400 mb-4">
                      <Clock size={16} className="text-emerald-500" />{" "}
                      Funcionamento
                    </label>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                      <button
                        onClick={() => setDraftStatus("all")}
                        className={`flex-1 py-3 rounded-lg text-xs font-black uppercase transition-all ${draftStatus === "all" ? "bg-white shadow-sm text-gray-800" : "text-gray-400"}`}
                      >
                        Qualquer
                      </button>
                      <button
                        onClick={() => setDraftStatus("open")}
                        className={`flex-1 py-3 rounded-lg text-xs font-black uppercase transition-all ${draftStatus === "open" ? "bg-white shadow-sm text-emerald-600" : "text-gray-400"}`}
                      >
                        Aberto Agora
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-black uppercase text-gray-400 mb-4">
                      <Zap size={16} className="text-amber-500" /> Ordenar Por
                    </label>
                    <div className="space-y-2">
                      {[
                        { label: "Mais Recentes / Perto", val: "newest" },
                        { label: "Mais Populares (Views)", val: "views" },
                        { label: "Mais Curtidos (Likes)", val: "likes" },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          onClick={() => setDraftSort(opt.val)}
                          className={`w-full flex items-center justify-between p-4 rounded-xl text-sm font-bold border transition-all ${
                            draftSort === opt.val
                              ? "border-[#0f172a] bg-blue-50 text-[#0f172a]"
                              : "border-gray-100 text-gray-500"
                          }`}
                        >
                          {opt.label}
                          {draftSort === opt.val && <Check size={16} />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER FIXO */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0 safe-bottom shadow-[0_-5px_30px_rgba(0,0,0,0.1)] z-50">
              <button
                onClick={applyFilters}
                disabled={isLoadingGPS}
                className="w-full py-4 bg-[#0f172a] text-white rounded-xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-3"
              >
                {isLoadingGPS ? (
                  "Aguarde o GPS..."
                ) : (
                  <>
                    VER RESULTADOS <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
