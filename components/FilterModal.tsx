"use client";

import { toast } from "sonner";
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
  RotateCcw,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface FilterModalProps {
  availableCategories?: Record<string, string[]>;
  currentSort?: string;
}

export default function FilterModal({
  availableCategories = {},
  currentSort,
}: FilterModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [catStep, setCatStep] = useState<"main" | "sub">("main");
  const [tempCat, setTempCat] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  // --- ESTADOS ---
  const [draftCategory, setDraftCategory] = useState("");
  const [draftSubs, setDraftSubs] = useState<string[]>([]);
  const [draftStatus, setDraftStatus] = useState("all");
  const [draftSort, setDraftSort] = useState("distance");
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDraftCategory(searchParams.get("category") || "");
      const subsParam = searchParams.get("subcategory");
      setDraftSubs(subsParam ? subsParam.split(",") : []);
      setDraftStatus(searchParams.get("status") || "all");
      // Prioriza o currentSort vindo das props, se não houver, usa o da URL ou default
      setDraftSort(currentSort || searchParams.get("sort") || "distance");
      setCatStep("main");
    }
  }, [isOpen, searchParams, currentSort]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const currentLat = searchParams.get("lat");

  const ensureGPS = (callback: () => void) => {
    if (!navigator.geolocation) return toast.error("GPS não suportado.");
    setIsLoadingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLoadingGPS(false);
        const params = new URLSearchParams(searchParams.toString());
        params.set("lat", pos.coords.latitude.toString());
        params.set("lng", pos.coords.longitude.toString());
        // Ajuste para manter o contexto da rota atual
        router.replace(`?${params.toString()}`, { scroll: false });
        callback();
      },
      () => {
        setIsLoadingGPS(false);
        toast.warning("Ative a localização para ordenar por distância.");
      },
    );
  };

  const applyFilters = () => {
    if (draftSort === "distance" && !currentLat) {
      ensureGPS(() => finalizePush());
      return;
    }
    finalizePush();
  };

  const finalizePush = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (draftCategory) params.set("category", draftCategory);
    else params.delete("category");

    if (draftSubs.length > 0) params.set("subcategory", draftSubs.join(","));
    else params.delete("subcategory");

    params.set("radius", "9999");
    params.set("status", draftStatus);
    params.set("sort", draftSort);

    setIsOpen(false);
    router.push(`/busca?${params.toString()}`);
  };

  const clearAll = () => {
    setDraftCategory("");
    setDraftSubs([]);
    setDraftStatus("all");
    setDraftSort("distance");
    setCatStep("main");
  };

  const isFilterActive =
    !!searchParams.get("category") ||
    searchParams.get("status") !== "all" ||
    searchParams.get("sort") === "popular";

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white text-[#0f172a] rounded-2xl shadow-xl hover:bg-tafanu-action hover:text-tafanu-blue transition-all group font-black uppercase text-xs tracking-widest border border-slate-100"
      >
        <Filter size={18} className="text-tafanu-blue" />
        Filtros Avançados
        {isFilterActive && (
          <span className="w-2.5 h-2.5 bg-tafanu-blue rounded-full animate-bounce" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[48]"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed left-0 right-0 bottom-0 top-16 md:top-24 md:left-auto md:right-10 md:bottom-10 md:w-[450px] z-[49] bg-white flex flex-col w-full shadow-2xl animate-in slide-in-from-right duration-300 md:rounded-[2.5rem] overflow-hidden border border-white/20">
            {/* HEADER */}
            <div className="bg-[#0f172a] text-white flex justify-between items-center px-8 py-7 shrink-0">
              <div className="flex flex-col">
                <span className="font-black uppercase tracking-[0.2em] text-[10px] text-tafanu-action mb-1">
                  Busca Inteligente
                </span>
                <span className="text-xl font-black italic uppercase tracking-tighter">
                  Otimizar Resultados
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="bg-white/10 p-2.5 rounded-full hover:bg-rose-500 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 pb-36">
              {/* SEÇÃO ORDENAÇÃO (NOVA) */}
              <section className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <Navigation size={14} className="text-tafanu-blue" />{" "}
                  Prioridade de Exibição
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => setDraftSort("distance")}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                      draftSort === "distance"
                        ? "border-tafanu-blue bg-blue-50 text-tafanu-blue"
                        : "border-slate-100 text-slate-400 opacity-70"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Map size={18} />
                      <div className="text-left">
                        <p className="font-black text-[11px] uppercase">
                          Mais Próximos
                        </p>
                        <p className="text-[9px] font-bold italic opacity-70">
                          Ordem por distância GPS
                        </p>
                      </div>
                    </div>
                    {draftSort === "distance" && <Check size={18} />}
                  </button>

                  <button
                    onClick={() => setDraftSort("popular")}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                      draftSort === "popular"
                        ? "border-tafanu-action bg-orange-50 text-tafanu-blue"
                        : "border-slate-100 text-slate-400 opacity-70"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Zap
                        size={18}
                        className={
                          draftSort === "popular" ? "text-tafanu-action" : ""
                        }
                      />
                      <div className="text-left">
                        <p className="font-black text-[11px] uppercase">
                          Mais Populares
                        </p>
                        <p className="text-[9px] font-bold italic opacity-70">
                          Pela contagem de favoritos
                        </p>
                      </div>
                    </div>
                    {draftSort === "popular" && <Check size={18} />}
                  </button>
                </div>
              </section>

              {/* SEÇÃO STATUS */}
              <section className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <Clock size={14} className="text-emerald-500" />{" "}
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
                    Abertos Agora
                  </button>
                </div>
              </section>

              {/* SEÇÃO CATEGORIAS */}
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
                        className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                          draftCategory === cat
                            ? "border-tafanu-blue bg-blue-50/50 text-tafanu-blue"
                            : "border-slate-50 bg-slate-50/50 text-slate-600 hover:border-slate-100"
                        }`}
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
                      className="flex items-center gap-2 text-[10px] font-black text-tafanu-blue uppercase mb-2 hover:translate-x-1 transition-transform"
                    >
                      <ChevronLeft size={14} /> Voltar
                    </button>
                    <h3 className="text-sm font-black text-slate-900 uppercase italic px-1">
                      {tempCat}
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {availableCategories[tempCat]?.map((sub: string) => {
                        const isSelected = draftSubs.includes(sub);
                        return (
                          <button
                            key={sub}
                            onClick={() => {
                              setDraftSubs((prev) =>
                                isSelected
                                  ? prev.filter((s) => s !== sub)
                                  : [...prev, sub],
                              );
                            }}
                            className={`w-full text-left p-4 rounded-xl text-xs font-bold transition-all flex items-center gap-3 border-2 ${
                              isSelected
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-50 text-slate-500 bg-slate-50/30"
                            }`}
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

            {/* FOOTER */}
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-white border-t border-slate-100 flex gap-4">
              <button
                onClick={clearAll}
                className="p-5 bg-slate-100 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all"
                title="Limpar Filtros"
              >
                <RotateCcw size={22} />
              </button>
              <button
                onClick={applyFilters}
                disabled={isLoadingGPS}
                className="flex-1 py-5 bg-[#0f172a] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-tafanu-blue transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-3"
              >
                {isLoadingGPS ? (
                  "GPS..."
                ) : (
                  <>
                    Aplicar Filtros <ArrowRight size={18} />
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
