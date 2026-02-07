"use client";
// Damos um apelido (UTButton) para evitar conflito com seu componente local
import { toast } from "sonner";
import { UploadButton as UTButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { useState, useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import {
  Save,
  Loader2,
  MapPin,
  Camera,
  Trash2,
  Clock,
  Sparkles,
  Zap,
  Briefcase,
  Layout,
  ListChecks,
  HelpCircle,
  Plus,
  AlignLeft,
  Power,
  Eye,
  Smartphone,
  Share2,
  Palette,
  Tag,
  Phone,
  PhoneCall,
  CheckCircle2,
  Hash,
  X,
} from "lucide-react";

import {
  updateFullBusiness,
  updateBusinessHours,
  deleteBusiness,
  createBusiness,
} from "@/app/actions";
import HoursForm from "@/components/HoursForm";
import { motion, AnimatePresence } from "framer-motion";
import { businessThemes } from "@/lib/themes";
import { normalizeBusiness, onlyNumbers, toSlug } from "@/lib/normalize";

type BusinessHour = {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
};

// --- DADOS ESTÁTICOS (Fora da função para evitar re-renders) ---
const TAFANU_CATEGORIES = {
  Alimentação: [
    "Açaí & Sorvetes",
    "Adegas",
    "Cafeteria & Brunch",
    "Cervejarias & Bares",
    "Churrasco/Espetinhos",
    "Comida Saudável / Fitness",
    "Docerias & Bolos",
    "Hamburguerias",
    "Marmitas & Quentinhas",
    "Pizzarias",
    "Restaurantes",
    "Sushi & Comida Japonesa",
    "Outros",
  ].sort(),
  Automotivo: [
    "Ar Condicionado Automotivo",
    "Auto Elétrica",
    "Auto Peças",
    "Borracharias",
    "Lava Jato & Estética",
    "Martelinho de Ouro",
    "Oficinas Mecânicas",
    "Pneus & Alinhamento",
    "Som & Acessórios",
    "Venda de Veículos",
    "Outros",
  ].sort(),
  "Beleza e Estética": [
    "Barbearias",
    "Bronzeamento",
    "Cílios & Sobrancelhas",
    "Clínicas de Estética",
    "Depilação a Laser",
    "Maquiagem Profissional",
    "Manicure",
    "Massagem & Spa",
    "Salões de Beleza",
    "Outros",
  ].sort(),
  "Comércio Local": [
    "Açougues",
    "Calçados",
    "Eletrônicos & Celulares",
    "Floriculturas",
    "Hortifruti / Sacolão",
    "Padarias",
    "Papelarias",
    "Presentes & Variedades",
    "Roupas & Acessórios",
    "Supermercados",
    "Suplementos",
    "Tabacaria",
    "Outros",
  ].sort(),
  Pets: [
    "Adestramento",
    "Banho e Tosa",
    "Clínicas Veterinárias",
    "Farmácia Veterinária",
    "Hospedagem Pet",
    "Passeadores (Dog Walker)",
    "Pet Shops / Rações",
    "Outros",
  ].sort(),
  Profissionais: [
    "Advogados",
    "Arquitetos & Engenheiros",
    "Consultoria de Negócios",
    "Contadores",
    "Fotógrafos & Filmagem",
    "Imobiliárias",
    "Marketing & Design",
    "Organizadores de Eventos",
    "Professores Particulares",
    "Seguros",
    "Outros",
  ].sort(),
  "Saúde e Bem-Estar": [
    "Academias",
    "Clínicas Médicas",
    "Dentistas",
    "Farmácias",
    "Fisioterapia",
    "Fonoaudiologia",
    "Nutricionistas",
    "Óticas",
    "Psicologia & Terapia",
    "Yoga & Pilates",
    "Outros",
  ].sort(),
  "Serviços Casa": [
    "Ar Condicionado",
    "Dedetização",
    "Diaristas & Faxina",
    "Eletricistas",
    "Encanadores",
    "Jardinagem / Piscinas",
    "Limpeza de Estofados",
    "Marcenaria",
    "Marido de Aluguel (Reparos)",
    "Pintores",
    "Redes de Proteção",
    "Vidraçaria",
    "Outros",
  ].sort(),
};

const TABS = [
  {
    id: "design",
    label: "Estilo",
    icon: <Palette size={16} />,
    activeClass: "bg-slate-900 text-white",
  },
  {
    id: "content",
    label: "Conteúdo",
    icon: <Camera size={16} />,
    activeClass: "bg-indigo-600 text-white",
  },
  {
    id: "contact",
    label: "Contato",
    icon: <Phone size={16} />,
    activeClass: "bg-emerald-600 text-white",
  },
];

const layoutInfo: any = {
  urban: {
    label: "Urban",
    icon: <Zap size={14} />,
    field: "urban_tag",
    placeholder: "@seu.estilo",
  },
  editorial: {
    label: "Luxe",
    icon: <Sparkles size={14} />,
    field: "luxe_quote",
    placeholder: "Frase elegante...",
  },
  businessList: {
    label: "Comercial",
    icon: <Briefcase size={14} />,
    field: "comercial_badge",
    placeholder: "Slogan Comercial",
  },
  showroom: {
    label: "Showroom",
    icon: <Camera size={14} />,
    field: "showroom_collection",
    placeholder: "Coleção 2026",
  },
};

const contactPlaceholders: any = {
  instagram: "@seu.perfil",
  tiktok: "@seu.perfil",
  facebook: "facebook.com/suapagina",
  website: "www.seusite.com.br",
};

const cleanHandle = (url: string = "", regex: RegExp) => {
  const clean = (url || "").trim();
  return clean.replace(regex, "").replace(/^@+/, "").replace(/\/+$/, "");
};

// --- COMPONENTE PRINCIPAL ---
export default function BusinessEditor({
  business,
  isNew = false,
}: {
  business: any;
  isNew?: boolean;
}) {
  const cepController = useRef<AbortController | null>(null);
  const router = useRouter();

  // Memoizações
  const safeBusiness = useMemo(() => normalizeBusiness(business), [business]);
  const categoryKeys = useMemo(() => Object.keys(TAFANU_CATEGORIES).sort(), []);
  const themeKeys = useMemo(() => Object.keys(businessThemes), []);

  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // <--- A LINHA NOVA É ESTA
  const [activeTab, setActiveTab] = useState("design");

  // Estados
  const [name, setName] = useState(safeBusiness.name);
  const [slug, setSlug] = useState(safeBusiness.slug);
  const [isPublished, setIsPublished] = useState(safeBusiness.published);
  const [gallery, setGallery] = useState<string[]>(safeBusiness.gallery);
  const [profileImage, setProfileImage] = useState<string>(
    safeBusiness.imageUrl,
  );

  const [mediaType, setMediaType] = useState<"image" | "video" | "none">(
    safeBusiness.videoUrl?.trim()
      ? "video"
      : safeBusiness.heroImage?.trim()
        ? "image"
        : "none",
  );
  const [heroMedia, setHeroMedia] = useState<string>(
    safeBusiness.videoUrl?.trim() || safeBusiness.heroImage?.trim() || "",
  );

  const [categoria, setCategoria] = useState(safeBusiness.category);
  const [selectedSubs, setSelectedSubs] = useState<string[]>(
    safeBusiness.subcategory,
  );
  const [keywords, setKeywords] = useState<string[]>(safeBusiness.keywords);
  const [tagInput, setTagInput] = useState("");

  const [selectedLayout, setSelectedLayout] = useState(() => {
    const initial =
      safeBusiness.layout === "influencer" ? "urban" : safeBusiness.layout;
    return layoutInfo[initial] ? initial : "urban";
  });

  const [selectedTheme, setSelectedTheme] = useState(safeBusiness.theme);
  const [whatsapp, setWhatsapp] = useState(safeBusiness.whatsapp);
  const [phone, setPhone] = useState(safeBusiness.phone);
  const [description, setDescription] = useState(safeBusiness.description);
  const [layoutText, setLayoutText] = useState(
    safeBusiness.urban_tag ||
      safeBusiness.luxe_quote ||
      safeBusiness.showroom_collection ||
      safeBusiness.comercial_badge,
  );

  const [features, setFeatures] = useState<string[]>(safeBusiness.features);
  const [faqs, setFaqs] = useState<{ q: string; a: string }[]>(
    safeBusiness.faqs,
  );
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>(
    safeBusiness.hours,
  );

  const [addressData, setAddressData] = useState({
    address: safeBusiness.address?.split(" - ")[0]?.split(", ")[0] || "",
    cep: safeBusiness.cep || "",
    neighborhood: safeBusiness.neighborhood,
    city: safeBusiness.city,
    state: safeBusiness.state,
    number: safeBusiness.number,
  });

  const [socials, setSocials] = useState({
    instagram: cleanHandle(safeBusiness.instagram, /.*instagram\.com\//),
    facebook: cleanHandle(safeBusiness.facebook, /.*facebook\.com\//),
    tiktok: cleanHandle(safeBusiness.tiktok, /.*tiktok\.com\/@?/),
    website: safeBusiness.website || "",
  });

  // Cálculo da galeria válida (apenas fotos reais)
  const validGallery = useMemo(
    () => gallery.filter((g) => typeof g === "string" && g.startsWith("http")),
    [gallery],
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sincroniza os dados locais com o banco quando a página atualiza
  useEffect(() => {
    if (!isNew && safeBusiness) {
      setName(safeBusiness.name);
      setSlug(safeBusiness.slug);
      setGallery(safeBusiness.gallery);
      setProfileImage(safeBusiness.imageUrl);
      setIsPublished(safeBusiness.published);
      setAddressData({
        address: safeBusiness.address?.split(" - ")[0]?.split(", ")[0] || "",
        cep: safeBusiness.cep || "",
        neighborhood: safeBusiness.neighborhood || "",
        city: safeBusiness.city || "",
        state: safeBusiness.state || "",
        number: safeBusiness.number || "",
      });
      // Lógica para recuperar a Capa (Hero) corretamente
      if (safeBusiness.videoUrl?.trim()) {
        setMediaType("video");
        setHeroMedia(safeBusiness.videoUrl);
      } else if (safeBusiness.heroImage?.trim()) {
        setMediaType("image");
        setHeroMedia(safeBusiness.heroImage);
      } else {
        setMediaType("none");
        setHeroMedia("");
      }
    }
  }, [safeBusiness, isNew]); // <--- O SEGREDO ESTÁ AQUI (Observamos o objeto todo)

  const currentLayoutData = layoutInfo[selectedLayout] || layoutInfo["urban"];

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      addTag();
    }
  };
  const addTag = () => {
    const val = tagInput.trim().toLowerCase();
    if (val && !keywords.includes(val) && keywords.length < 10) {
      setKeywords([...keywords, val]);
      setTagInput("");
    } else if (keywords.includes(val)) setTagInput("");
  };
  const removeTag = (tagToRemove: string) =>
    setKeywords(keywords.filter((tag) => tag !== tagToRemove));

  const handleUpdate = async () => {
    if (isLoading) return;
    if (isNew && !name) {
      toast.error("Por favor, digite o nome do negócio antes de salvar.");
      return;
    }
    setIsLoading(true);

    try {
      const fullAddress = `${addressData.address}${addressData.number ? ", " + addressData.number : ""}${addressData.neighborhood ? " - " + addressData.neighborhood : ""}`;
      const finalHero = mediaType === "none" ? "" : heroMedia || "";

      const payload: any = {
        slug,
        name,
        description,
        category: categoria,
        subcategory: selectedSubs,
        keywords,
        theme: selectedTheme,
        layout: layoutInfo[selectedLayout] ? selectedLayout : "urban",
        published: isPublished,
        urban_tag: layoutText,
        luxe_quote: layoutText,
        showroom_collection: layoutText,
        comercial_badge: layoutText,
        features: features.filter((f) => f.trim() !== ""),
        address: fullAddress,
        cep: addressData.cep,
        city: addressData.city,
        state: addressData.state,
        whatsapp: onlyNumbers(whatsapp),
        phone: onlyNumbers(phone),
        instagram: socials.instagram
          ? `https://instagram.com/${socials.instagram}`
          : "",
        facebook: socials.facebook
          ? `https://facebook.com/${socials.facebook}`
          : "",
        tiktok: socials.tiktok ? `https://tiktok.com/@${socials.tiktok}` : "",
        website: socials.website,
        videoUrl: mediaType === "video" ? finalHero : "",
        heroImage: mediaType === "image" ? finalHero : "",
        gallery: validGallery,
        imageUrl: profileImage,
        hours: businessHours,
        faqs: faqs.filter((f) => f.q.trim() !== "" && f.a.trim() !== ""),
      };

      if (isNew) {
        const submission = new FormData();
        Object.entries(payload).forEach(([key, val]) => {
          if (
            [
              "subcategory",
              "features",
              "gallery",
              "keywords",
              "hours",
              "faqs",
            ].includes(key)
          ) {
            // Se for lista ou objeto (como hours/faqs), transformamos em texto para o FormData
            if (key === "hours" || key === "faqs") {
              submission.append(key, JSON.stringify(val));
            } else {
              (val as string[]).forEach((v) => submission.append(key, v));
            }
          } else {
            submission.append(key, String(val));
          }
        });

        const result = await createBusiness(submission);

        if (!result.success) {
          if (result.error?.toLowerCase().includes("slug")) {
            toast.warning("Este nome de link já está em uso. Tente outro.");
            setIsLoading(false);
            return;
          }
          throw new Error(result.error);
        }
      } else {
        payload.faqs = faqs.filter(
          (f) => f.q.trim() !== "" && f.a.trim() !== "",
        );

        // Chamamos a atualização e pegamos o resultado (que tem o newSlug)
        const [updateResult] = await Promise.all([
          updateFullBusiness(business.slug, payload),
          updateBusinessHours(business.slug, businessHours),
        ]);

        const fireConfetti = (await import("canvas-confetti")).default;
        fireConfetti();
        toast.success("Alterações salvas com sucesso!");

        // --- A MÁGICA DO REDIRECIONAMENTO ---
        // Se o link mudou, pulamos para a nova URL do editor para evitar o 404
        if (updateResult.newSlug && updateResult.newSlug !== business.slug) {
          router.push(`/dashboard/editar/${updateResult.newSlug}`);
        } else {
          router.refresh();
        }
      }

      if (isNew) {
        const fireConfetti = (await import("canvas-confetti")).default;
        fireConfetti();
        toast.success("Seu negócio foi criado com sucesso!");
        router.push("/dashboard");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      toast.error(
        `Ops! ${err.message || "Ocorreu um erro desconhecido ao salvar."}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (isNew) setSlug(toSlug(val));
  };
  if (!isMounted) return null;
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-32">
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center text-center px-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
            <p className="font-black text-xs tracking-widest text-slate-400">
              GRAVANDO...
            </p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-6 relative z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
              <Smartphone size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase italic tracking-tighter leading-none">
                {isNew ? "Novo Perfil" : "Editor Business"}
              </h1>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest truncate max-w-[200px]">
                {isNew ? "Tafanu Lançamento" : slug}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isNew && (
              <>
                <button
                  onClick={() =>
                    window.open(`/site/${business.slug}`, "_blank")
                  }
                  className="p-3 bg-white text-slate-400 rounded-xl border border-slate-200 hover:text-indigo-600 transition-all shadow-sm flex items-center justify-center"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => setIsPublished(!isPublished)}
                  className={`p-3 rounded-xl border transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-sm ${isPublished ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-100 text-rose-600 border-rose-200 animate-pulse ring-4 ring-rose-50"}`}
                >
                  <Power size={14} /> {isPublished ? "Online" : "Pausado"}
                </button>
                <button
                  onClick={() => {
                    if (confirm("Deseja realmente excluir?"))
                      deleteBusiness(business.slug).then(() =>
                        router.push("/dashboard"),
                      );
                  }}
                  className="p-3 text-rose-300 hover:text-rose-500 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
            <button
              onClick={handleUpdate}
              disabled={isLoading}
              className="hidden md:flex items-center gap-3 bg-slate-900 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-600 transition-all"
            >
              <Save size={16} /> Salvar
            </button>
          </div>
        </div>
      </div>

      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-[80px] md:top-[96px] z-40 px-4 py-3 shadow-sm">
        <div className="max-w-xl mx-auto flex bg-slate-100 p-1 rounded-2xl gap-1 shadow-inner">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t.id ? t.activeClass + " shadow-md" : "text-slate-400"}`}
            >
              {t.icon} <span className="inline-block">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-10">
        <AnimatePresence mode="wait">
          {activeTab === "design" && (
            <motion.div
              key="design"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-sm border border-slate-200 flex flex-col items-center text-center">
                <div className="relative w-32 h-32 md:w-36 md:h-36 mb-4 group">
                  <div className="w-full h-full rounded-full bg-slate-50 border-8 border-white shadow-2xl overflow-hidden flex items-center justify-center relative">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UTButton<OurFileRouter, any>
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) =>
                          setProfileImage(res[0].ufsUrl)
                        }
                        content={{
                          button: <Plus size={40} className="text-slate-300" />,
                        }}
                        appearance={{
                          button: "w-full h-full bg-transparent",
                          allowedContent: "hidden",
                        }}
                      />
                    )}
                  </div>
                  {profileImage && (
                    <button
                      onClick={() => setProfileImage("")}
                      className="absolute bottom-1 right-1 bg-rose-500 text-white p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <input
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full text-center bg-transparent text-2xl md:text-3xl font-black outline-none border-b-2 border-transparent focus:border-indigo-100 transition-all pb-2 uppercase italic tracking-tighter"
                  placeholder="NOME DO NEGÓCIO"
                />

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full mt-10 pt-8 border-t border-slate-50">
                  {Object.keys(layoutInfo).map((key) => (
                    <button
                      key={key}
                      onClick={() => setSelectedLayout(key)}
                      className={`p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-2 flex flex-col items-center gap-2 transition-all ${selectedLayout === key ? "border-slate-900 bg-slate-50 text-slate-900 shadow-inner" : "border-slate-50 text-slate-300"}`}
                    >
                      {layoutInfo[key].icon}{" "}
                      <span className="text-[9px] md:text-[10px] font-black uppercase">
                        {layoutInfo[key].label}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="bg-slate-50 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.2rem] border border-dashed border-slate-200 w-full mt-6">
                  <label className="text-[9px] font-black uppercase text-indigo-500 mb-2 block tracking-widest">
                    {currentLayoutData.label} - Texto Especial
                  </label>
                  <input
                    value={layoutText}
                    onChange={(e) => setLayoutText(e.target.value)}
                    className="w-full h-12 md:h-14 px-5 rounded-xl bg-white border font-bold text-xs md:text-sm shadow-sm outline-none"
                    placeholder={currentLayoutData.placeholder}
                  />
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200">
                <h3 className="text-[10px] font-black uppercase text-slate-400 mb-6 flex items-center gap-2">
                  <Palette size={16} /> Temas Disponíveis
                </h3>
                <div className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-[200px] overflow-y-auto p-1 custom-scrollbar">
                  {themeKeys.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTheme(t)}
                      title={businessThemes[t].label}
                      className={`aspect-square rounded-xl md:rounded-2xl transition-all relative group ${selectedTheme === t ? "ring-4 ring-slate-900 scale-90 shadow-xl z-10" : "hover:scale-105"}`}
                      style={{ background: businessThemes[t].previewColor }}
                    >
                      {selectedTheme === t && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
                        </div>
                      )}
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase bg-slate-900 text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                        {businessThemes[t].label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200">
                <h3 className="text-[10px] font-black uppercase text-slate-400 mb-6 flex items-center gap-2">
                  <Tag size={16} /> Segmentação
                </h3>
                <select
                  value={categoria}
                  onChange={(e) => {
                    setCategoria(e.target.value);
                    setSelectedSubs([]);
                  }}
                  className="w-full h-14 md:h-16 px-5 bg-slate-50 rounded-xl md:rounded-2xl font-black text-[11px] uppercase border outline-none mb-6"
                >
                  {categoryKeys.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-2">
                  {(TAFANU_CATEGORIES as any)[categoria]?.map((sub: string) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() =>
                        setSelectedSubs((prev) =>
                          prev.includes(sub)
                            ? prev.filter((s) => s !== sub)
                            : [...prev, sub],
                        )
                      }
                      className={`px-4 py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase transition-all ${selectedSubs.includes(sub) ? "bg-slate-900 text-white shadow-lg" : "bg-slate-50 text-slate-400 border border-slate-100"}`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
                <div className="mt-8 pt-8 border-t border-slate-50">
                  <div className="flex justify-between items-end mb-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
                      <Hash size={16} /> Palavras-chave
                    </label>
                    <span className="text-[9px] font-bold text-slate-400">
                      {keywords.length} / 10
                    </span>
                  </div>
                  <div className="w-full min-h-[56px] px-2 py-2 bg-slate-50 rounded-xl border border-slate-200 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50/50 transition-all flex flex-wrap gap-2 items-center">
                    {keywords.map((tag, i) => (
                      <span
                        key={i}
                        className="bg-white border border-slate-200 text-slate-700 text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-rose-500 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      disabled={keywords.length >= 10}
                      className="bg-transparent text-xs font-bold outline-none flex-1 min-w-[120px] h-8 px-2 placeholder:font-normal placeholder:text-slate-400 disabled:cursor-not-allowed"
                      placeholder={
                        keywords.length >= 10
                          ? "Limite atingido"
                          : "Digite e aperte Espaço ou Enter..."
                      }
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "content" && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <h2 className="text-[10px] font-black uppercase flex items-center gap-2">
                    <Camera size={18} className="text-rose-500" /> Banner
                    Principal
                  </h2>
                  <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
                    {["image", "video", "none"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setMediaType(type as any)}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[9px] font-black transition-all ${mediaType === type ? "bg-white text-rose-500 shadow-sm" : "text-slate-400"}`}
                      >
                        {type.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="aspect-video rounded-[1.5rem] md:rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden relative flex items-center justify-center group">
                  {heroMedia && mediaType !== "none" ? (
                    <>
                      {mediaType === "video" ? (
                        <video
                          src={heroMedia}
                          className="w-full h-full object-cover"
                          autoPlay
                          muted
                          loop
                          playsInline
                        />
                      ) : (
                        <img
                          src={heroMedia}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <button
                          onClick={() => setHeroMedia("")}
                          className="bg-white text-rose-500 px-6 py-3 rounded-xl font-black text-[10px] uppercase shadow-2xl"
                        >
                          Mudar Mídia
                        </button>
                      </div>
                    </>
                  ) : (
                    mediaType !== "none" && (
                      // Mude de <UploadButton para:
                      <UTButton<OurFileRouter, any>
                        endpoint={
                          mediaType === "video"
                            ? "videoUploader"
                            : "imageUploader"
                        }
                        onClientUploadComplete={(res) =>
                          setHeroMedia(res[0].ufsUrl)
                        }
                        appearance={{
                          button:
                            "bg-slate-900 text-white text-[10px] font-black px-10 py-4 rounded-2xl shadow-xl",
                          allowedContent: "hidden",
                        }}
                      />
                    )
                  )}
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[10px] font-black uppercase flex items-center gap-2">
                    <Layout size={18} className="text-indigo-500" /> Galeria
                    Vitrine
                  </h2>
                  <span className="text-[10px] font-black text-indigo-600 block uppercase">
                    {validGallery.length} / 8
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {validGallery.map((url, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-xl overflow-hidden relative group border-2 border-white shadow-md"
                    >
                      <img src={url} className="w-full h-full object-cover" />
                      <button
                        onClick={() =>
                          setGallery((prev) =>
                            prev.filter((_, idx) => idx !== i),
                          )
                        }
                        className="absolute top-2 right-2 bg-rose-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  {validGallery.length < 8 && (
                    <div className="aspect-square rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center relative transition-all group overflow-hidden">
                      <Plus
                        size={32}
                        className="text-slate-200 group-hover:text-indigo-200"
                      />
                      <UTButton<OurFileRouter, any>
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                          if (!res) return;
                          setGallery((prev) =>
                            [...prev, ...res.map((f) => f.ufsUrl)].slice(0, 8),
                          );
                        }}
                        appearance={{
                          button:
                            "absolute inset-0 w-full h-full bg-transparent text-transparent",
                          allowedContent: "hidden",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200">
                <label className="text-[10px] font-black uppercase text-slate-400 mb-6 block flex items-center gap-2">
                  <AlignLeft size={16} /> Sobre o Negócio
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full bg-slate-50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border text-sm font-medium outline-none focus:ring-2 ring-indigo-50"
                  placeholder="Conte sua história..."
                />

                <div className="mt-10 pt-10 border-t border-slate-50 space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
                    <ListChecks size={18} /> Diferenciais
                  </label>
                  {features.map((f, i) => (
                    <div key={i} className="flex gap-2">
                      <textarea
                        value={f}
                        onChange={(e) => {
                          const n = [...features];
                          n[i] = e.target.value;
                          setFeatures(n);
                        }}
                        rows={2}
                        className="flex-1 bg-slate-50 p-4 rounded-xl text-xs font-bold border outline-none focus:border-indigo-300"
                        placeholder="Ex: Wi-fi Grátis..."
                      />
                      <button
                        onClick={() =>
                          setFeatures(features.filter((_, idx) => idx !== i))
                        }
                        className="p-3 bg-rose-50 text-rose-400 rounded-xl shrink-0"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setFeatures([...features, ""])}
                    className="w-full h-14 border-2 border-dashed border-slate-200 rounded-xl text-[9px] font-black text-indigo-400 uppercase"
                  >
                    + Diferencial
                  </button>
                </div>

                <div className="mt-10 pt-10 border-t border-slate-50 space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
                    <HelpCircle size={18} /> Perguntas Frequentes (FAQ)
                  </label>
                  {faqs.map((f, i) => (
                    <div
                      key={i}
                      className="bg-slate-50 p-4 rounded-2xl border border-slate-100 relative group"
                    >
                      <input
                        value={f.q}
                        onChange={(e) => {
                          const n = [...faqs];
                          n[i].q = e.target.value;
                          setFaqs(n);
                        }}
                        placeholder="Pergunta"
                        className="w-full h-10 px-4 bg-white rounded-lg text-xs font-black uppercase border mb-2 outline-none"
                      />
                      <textarea
                        value={f.a}
                        onChange={(e) => {
                          const n = [...faqs];
                          n[i].a = e.target.value;
                          setFaqs(n);
                        }}
                        placeholder="Resposta"
                        rows={3}
                        className="w-full p-3 bg-white rounded-lg text-xs text-slate-500 border outline-none resize-none"
                      />
                      <button
                        onClick={() =>
                          setFaqs(faqs.filter((_, idx) => idx !== i))
                        }
                        className="absolute top-2 right-2 p-2 text-red-200 hover:text-rose-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setFaqs([...faqs, { q: "", a: "" }])}
                    className="w-full h-14 border-2 border-dashed border-slate-200 rounded-xl text-[9px] font-black text-indigo-400 uppercase"
                  >
                    + Nova Pergunta
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "contact" && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="bg-slate-900 text-white rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 shrink-0">
                  <Share2 size={120} />
                </div>
                <h2 className="text-[10px] font-black uppercase tracking-widest mb-8 text-emerald-400 flex items-center gap-3 relative z-10">
                  <Phone size={20} /> Conexões Digitais
                </h2>
                <div className="space-y-6 relative z-10">
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/10 shadow-inner">
                    <label className="text-[9px] font-black uppercase text-emerald-400 mb-2 block">
                      WhatsApp Business (Chat)
                    </label>
                    <div className="flex items-center gap-3">
                      <Smartphone className="text-emerald-400/50" size={20} />
                      <input
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="(00) 00000-0000"
                        className="bg-transparent w-full text-2xl md:text-3xl font-mono text-white outline-none"
                      />
                    </div>
                  </div>
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/10 shadow-inner">
                    <label className="text-[9px] font-black uppercase text-indigo-400 mb-2 block">
                      Telefone para Ligações
                    </label>
                    <div className="flex items-center gap-3">
                      <PhoneCall className="text-indigo-400/50" size={20} />
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(00) 0000-0000"
                        className="bg-transparent w-full text-xl md:text-2xl font-mono text-white outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {["instagram", "tiktok", "facebook", "website"].map((s) => (
                      <div
                        key={s}
                        className="bg-white/5 p-4 rounded-xl border border-white/10 focus-within:bg-white/10 transition-all"
                      >
                        <label className="text-[8px] font-black uppercase text-slate-500 mb-1 block">
                          {s.toUpperCase()}
                        </label>
                        <input
                          value={(socials as any)[s]}
                          onChange={(e) =>
                            setSocials({ ...socials, [s]: e.target.value })
                          }
                          className="bg-transparent w-full text-xs font-bold text-white outline-none"
                          placeholder={contactPlaceholders[s]}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200">
                <h2 className="text-[10px] font-black uppercase mb-6 flex items-center gap-2">
                  <MapPin size={18} className="text-rose-500" /> Localização
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* LOCALIZAÇÃO: Por volta da linha 690 */}
                  <input
                    value={addressData.cep} // <--- AGORA ELE MOSTRA O VALOR SALVO
                    onChange={(e) =>
                      setAddressData({ ...addressData, cep: e.target.value })
                    } // <--- PERMITE DIGITAR
                    onBlur={(e) => {
                      const cep = e.target.value.replace(/\D/g, "");
                      if (cep.length !== 8) return;
                      cepController.current?.abort();
                      const controller = new AbortController();
                      cepController.current = controller;
                      fetch(`https://viacep.com.br/ws/${cep}/json/`, {
                        signal: controller.signal,
                      })
                        .then((r) => r.json())
                        .then((d) => {
                          if (!d.erro)
                            setAddressData((p) => ({
                              ...p,
                              cep: cep, // <--- GARANTE QUE O CEP FIQUE SALVO
                              address: d.logradouro || "",
                              neighborhood: d.bairro || "",
                              city: d.localidade || "",
                              state: d.uf || "",
                            }));
                        })
                        .catch(() => {});
                    }}
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

              <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200">
                <h2 className="text-[10px] font-black uppercase mb-6 flex items-center gap-2 text-slate-800">
                  <Clock size={18} className="text-emerald-500" /> Horários de
                  Atendimento
                </h2>
                <HoursForm
                  businessSlug={isNew ? undefined : business.slug}
                  initialHours={businessHours}
                  hideSaveButton={true}
                  onHoursChange={(h: any) => setBusinessHours(h)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-8 flex flex-col items-center sticky bottom-6 md:bottom-8 z-[60] gap-3">
          <AnimatePresence>
            {!isPublished && !isLoading && (
              <motion.div
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 5, opacity: 0 }}
                className="bg-rose-500 text-white px-5 py-2 rounded-full shadow-lg flex items-center gap-2 border border-rose-400"
              >
                <div className="w-2 h-2 bg-white rounded-full animate-pulse shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                  Status: Pausado
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={handleUpdate}
            disabled={isLoading}
            className={`w-full max-w-xs md:max-w-lg h-14 md:h-20 rounded-[1.8rem] md:rounded-[2.5rem] flex items-center justify-center gap-3 font-black uppercase text-[10px] md:text-xs shadow-2xl transition-all active:scale-95 disabled:opacity-50 tracking-[0.2em] italic ${!isPublished ? "bg-slate-700 text-slate-300" : "bg-slate-900 text-white hover:bg-indigo-600"}`}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : isPublished ? (
              <CheckCircle2 size={20} />
            ) : (
              <Power size={20} />
            )}
            {isLoading
              ? "Salvando..."
              : isPublished
                ? isNew
                  ? "Criar Perfil"
                  : "Gravar Mudanças"
                : "Salvar em Modo Offline"}
          </button>
        </div>
      </main>
    </div>
  );
}
