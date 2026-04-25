"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Filter,
  ChevronRight,
  Check,
  ChevronLeft,
  ArrowRight,
  Clock,
  Zap,
  Navigation,
  Square,
  CheckSquare,
  RotateCcw,
  MapPin,
  CalendarDays,
  Globe, // 🚀 Ícone novo
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export type LocationTree = Record<string, Record<string, string[]>>;

interface FilterModalProps {
  availableCategories?: Record<string, string[]>;
  locationData?: LocationTree;
  currentSort?: string;
  isDisabled?: boolean;
}

export default function FilterModal({
  availableCategories = {},
  locationData = {},
  currentSort,
  isDisabled = false,
}: FilterModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [catStep, setCatStep] = useState<"main" | "sub">("main");
  const [tempCat, setTempCat] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  const isOnlineMode = searchParams.get("modo") === "online"; // 🚀 LÊ SE ESTAMOS NO MODO ONLINE

  const [draftCategory, setDraftCategory] = useState("");
  const [draftSubs, setDraftSubs] = useState<string[]>([]);
  const [draftStatus, setDraftStatus] = useState("all");
  const [draftSort, setDraftSort] = useState("popular");
  const [draftState, setDraftState] = useState("");
  const [draftCity, setDraftCity] = useState("");
  const [draftNeighborhood, setDraftNeighborhood] = useState("");

  useEffect(() => {
    setMounted(true);
    router.prefetch("/busca");
  }, [router]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setDraftCategory(searchParams.get("category") || "");
      const subsParam = searchParams.get("subcategory");
      setDraftSubs(subsParam ? subsParam.split(",") : []);
      setDraftStatus(searchParams.get("status") || "all");
      setDraftSort(currentSort || searchParams.get("sort") || "popular");
      setDraftState(searchParams.get("state") || "");
      setDraftCity(searchParams.get("city") || "");
      setDraftNeighborhood(searchParams.get("neighborhood") || "");
      setCatStep("main");
    }
  }, [isOpen, searchParams, currentSort]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleStateChange = (newState: string) => {
    setDraftState(newState);
    setDraftCity("");
    setDraftNeighborhood("");
  };

  const handleCityChange = (newCity: string) => {
    setDraftCity(newCity);
    setDraftNeighborhood("");
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    if (draftCategory) params.set("category", draftCategory);
    else params.delete("category");

    if (draftSubs.length > 0) params.set("subcategory", draftSubs.join(","));
    else params.delete("subcategory");

    if (draftState && !isOnlineMode) params.set("state", draftState);
    else params.delete("state");

    if (draftCity && !isOnlineMode) params.set("city", draftCity);
    else params.delete("city");

    if (draftNeighborhood && !isOnlineMode)
      params.set("neighborhood", draftNeighborhood);
    else params.delete("neighborhood");

    params.set("status", draftStatus);
    params.set("sort", draftSort);

    setIsOpen(false);
    router.push(`/busca?${params.toString()}`);
  };

  const clearAll = () => {
    setDraftCategory("");
    setDraftSubs([]);
    setDraftStatus("all");
    setDraftSort("popular");
    setDraftState("");
    setDraftCity("");
    setDraftNeighborhood("");
    setCatStep("main");

    const query = searchParams.get("q");
    setIsOpen(false);

    // 🚀 O BOTÃO LIMPAR TAMBÉM DESLIGA O MODO ONLINE, VOLTANDO AO NORMAL
    if (query) router.push(`/busca?q=${query}&page=1`);
    else router.push(`/busca`);
  };

  const isFilterActive =
    !!searchParams.get("category") ||
    !!searchParams.get("state") ||
    searchParams.get("status") !== "all" ||
    (searchParams.get("sort") !== "distance" &&
      searchParams.get("sort") !== "popular");

  const availableStates = Object.keys(locationData).sort();
  const availableCitiesForState = draftState
    ? Object.keys(locationData[draftState] || {}).sort()
    : [];
  const availableNeighborhoodsForCity =
    draftCity && draftState
      ? (locationData[draftState][draftCity] || []).sort()
      : [];

  return (
    <>
      <button
        onClick={() => !isDisabled && setIsOpen(true)}
        disabled={isDisabled}
        className={`w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest border transition-all ${
          isDisabled
            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed shadow-none"
            : "bg-white text-[#0f172a] shadow-xl hover:bg-tafanu-action hover:text-tafanu-blue border-slate-100 group"
        }`}
      >
        <Filter
          size={18}
          className={isDisabled ? "text-slate-400" : "text-tafanu-blue"}
        />
        {isOnlineMode ? "Filtros Online" : "Filtros Avançados"}
        {isFilterActive && !isDisabled && (
          <span className="w-2.5 h-2.5 bg-tafanu-blue rounded-full animate-bounce" />
        )}
      </button>

      {isOpen && mounted && typeof document !== "undefined" && document.body
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="filter-modal-title"
              className="fixed inset-0 z-[99999] flex items-end md:items-center justify-end animate-in fade-in duration-300"
            >
              <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
              />

              <div className="relative bg-white w-full h-[95vh] md:h-full md:max-w-[450px] shadow-2xl flex flex-col md:rounded-l-[2.5rem] overflow-hidden animate-in slide-in-from-right duration-500">
                <div className="bg-[#0f172a] text-white flex justify-between items-center px-8 py-7 shrink-0">
                  <div className="flex flex-col">
                    <span className="font-black uppercase tracking-[0.2em] text-[10px] text-tafanu-action mb-1">
                      {isOnlineMode ? "Modo Shopping" : "Busca Inteligente"}
                    </span>
                    <span
                      id="filter-modal-title"
                      className="text-xl font-black italic uppercase tracking-tighter"
                    >
                      Otimizar Resultados
                    </span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="bg-white/10 p-2.5 rounded-full hover:bg-rose-50 hover:text-white transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10 pb-36 no-scrollbar">
                  {/* 🚀 O SEGREDO DE UX: Se for online, a gente não exibe o filtro de Localização, exibe uma mensagem legal! */}
                  {isOnlineMode ? (
                    <div className="bg-tafanu-action/10 border border-tafanu-action/20 p-5 rounded-2xl flex items-start gap-4">
                      <Globe size={24} className="text-tafanu-blue shrink-0" />
                      <div>
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-tafanu-blue mb-1">
                          Busca Nacional
                        </h4>
                        <p className="text-xs font-medium text-slate-500 leading-relaxed">
                          Você está pesquisando em lojas que entregam em todo o
                          Brasil. Filtros de distância estão desativados.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <section className="space-y-4">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        <MapPin size={14} className="text-rose-500" />
                        Onde você procura?
                      </label>
                      <div className="space-y-3">
                        <select
                          value={draftState}
                          onChange={(e) => handleStateChange(e.target.value)}
                          className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-sm font-bold text-slate-900 focus:border-tafanu-action focus:ring-0 transition-all outline-none appearance-none cursor-pointer"
                        >
                          <option value="">Todos os Estados</option>
                          {availableStates.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>

                        <select
                          value={draftCity}
                          onChange={(e) => handleCityChange(e.target.value)}
                          disabled={!draftState}
                          className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-sm font-bold text-slate-900 focus:border-tafanu-action focus:ring-0 transition-all outline-none appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {draftState
                              ? "Todas as Cidades"
                              : "Selecione um Estado primeiro"}
                          </option>
                          {availableCitiesForState.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>

                        <select
                          value={draftNeighborhood}
                          onChange={(e) => setDraftNeighborhood(e.target.value)}
                          disabled={!draftCity}
                          className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-sm font-bold text-slate-900 focus:border-tafanu-action focus:ring-0 transition-all outline-none appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {draftCity
                              ? "Todos os Bairros"
                              : "Selecione uma Cidade primeiro"}
                          </option>
                          {availableNeighborhoodsForCity.map((neighborhood) => (
                            <option key={neighborhood} value={neighborhood}>
                              {neighborhood}
                            </option>
                          ))}
                        </select>
                      </div>
                    </section>
                  )}

                  <section className="space-y-4">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      <Navigation size={14} className="text-tafanu-blue" />
                      Prioridade de Exibição
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={() => setDraftSort("popular")}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${draftSort === "popular" ? "border-tafanu-action bg-orange-50 text-tafanu-blue" : "border-slate-100 text-slate-400"}`}
                      >
                        <div className="flex items-center gap-3">
                          <Zap size={18} />
                          <div className="text-left">
                            <p className="font-black text-[11px] uppercase">
                              Mais Vistos (Ouro)
                            </p>
                            <p className="text-[9px] font-bold italic opacity-70">
                              Lojas com mais acessos
                            </p>
                          </div>
                        </div>
                        {draftSort === "popular" && <Check size={18} />}
                      </button>

                      <button
                        onClick={() => setDraftSort("recent")}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${draftSort === "recent" ? "border-tafanu-blue bg-blue-50 text-tafanu-blue" : "border-slate-100 text-slate-400"}`}
                      >
                        <div className="flex items-center gap-3">
                          <CalendarDays size={18} />
                          <div className="text-left">
                            <p className="font-black text-[11px] uppercase">
                              Novidades
                            </p>
                            <p className="text-[9px] font-bold italic opacity-70">
                              Adicionados recentemente
                            </p>
                          </div>
                        </div>
                        {draftSort === "recent" && <Check size={18} />}
                      </button>
                    </div>
                  </section>

                  {/* 🚀 Oculta a disponibilidade física se estiver buscando online */}
                  {!isOnlineMode && (
                    <section className="space-y-4">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        <Clock size={14} className="text-emerald-500" />
                        Disponibilidade
                      </label>
                      <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
                        <button
                          onClick={() => setDraftStatus("all")}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${draftStatus === "all" ? "bg-white shadow-sm text-slate-900" : "text-slate-400"}`}
                        >
                          Todos
                        </button>
                        <button
                          onClick={() => setDraftStatus("open")}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${draftStatus === "open" ? "bg-white shadow-sm text-emerald-600" : "text-slate-400"}`}
                        >
                          Abertos
                        </button>
                      </div>
                    </section>
                  )}

                  <section className="space-y-4">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      <Zap size={14} className="text-tafanu-action" /> Segmento
                    </label>

                    {catStep === "main" ? (
                      <div className="grid grid-cols-1 gap-2">
                        {Object.keys(availableCategories).map((cat) => (
                          <button
                            key={cat}
                            onClick={() => {
                              setDraftCategory(cat);
                              setTempCat(cat);
                              setCatStep("sub");
                            }}
                            className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${draftCategory === cat ? "border-tafanu-blue bg-blue-50/50 text-tafanu-blue" : "border-slate-50 bg-slate-50/50 text-slate-600"}`}
                          >
                            <span className="font-black text-[11px] uppercase italic">
                              {cat}
                            </span>
                            <ChevronRight size={16} />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <button
                          onClick={() => setCatStep("main")}
                          className="flex items-center gap-2 text-[10px] font-black text-tafanu-blue uppercase"
                        >
                          <ChevronLeft size={14} /> Voltar
                        </button>
                        <div className="grid grid-cols-1 gap-2">
                          {availableCategories[tempCat]?.map((sub: string) => {
                            const isSelected = draftSubs.includes(sub);
                            return (
                              <button
                                key={sub}
                                onClick={() =>
                                  setDraftSubs((prev) =>
                                    isSelected
                                      ? prev.filter((s) => s !== sub)
                                      : [...prev, sub],
                                  )
                                }
                                className={`w-full text-left p-4 rounded-xl text-xs font-bold transition-all flex items-center gap-3 border-2 ${isSelected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-50 text-slate-500 bg-slate-50/30"}`}
                              >
                                {isSelected ? (
                                  <CheckSquare
                                    size={16}
                                    className="text-tafanu-action"
                                  />
                                ) : (
                                  <Square size={16} />
                                )}
                                {sub}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </section>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 bg-white border-t border-slate-100 flex gap-4">
                  <button
                    onClick={clearAll}
                    className="p-5 bg-slate-100 text-slate-400 rounded-2xl hover:text-rose-500 transition-all"
                  >
                    <RotateCcw size={22} />
                  </button>
                  <button
                    onClick={applyFilters}
                    className="flex-1 py-5 bg-[#0f172a] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-tafanu-blue transition-all flex justify-center items-center gap-3"
                  >
                    Aplicar Filtros <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
