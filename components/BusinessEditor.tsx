"use client";
// Damos um apelido (UTButton) para evitar conflito com seu componente local
import { toast } from "sonner";
import MobilePreview from "@/components/MobilePreview";
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
  ShoppingCart,
  Instagram,
  Facebook,
  Music2,
  Globe,
  MessageCircle,
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

// --- DADOS ESTÁTICOS ---
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
// 🚀 FUNÇÃO DE MÁSCARA PARA TELEFONE
const formatPhoneNumber = (value: string) => {
  if (!value) return "";
  const numbers = value.replace(/\D/g, ""); // Remove tudo que não é número
  if (numbers.length <= 11) {
    // Formata (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    return numbers
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d)(\d{4})$/, "$1-$2");
  }
  return numbers.slice(0, 11); // Limita ao tamanho máximo de celular com DDD
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
  const slugRef = useRef<HTMLInputElement>(null);
  const [slugError, setSlugError] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const [nameError, setNameError] = useState(false);

  // Memoizações
  const safeBusiness = useMemo(() => normalizeBusiness(business), [business]);
  const categoryKeys = useMemo(() => Object.keys(TAFANU_CATEGORIES).sort(), []);

  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Estados
  const [name, setName] = useState(safeBusiness.name);
  const [slug, setSlug] = useState(safeBusiness.slug);
  const [isPublished, setIsPublished] = useState(safeBusiness.published);
  const [gallery, setGallery] = useState<string[]>(safeBusiness.gallery);
  const [profileImage, setProfileImage] = useState<string>(
    safeBusiness.imageUrl,
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

  // 🚀 APLICANDO MÁSCARA NA LARGADA PARA NÃO CONFUNDIR O RADAR
  const [whatsapp, setWhatsapp] = useState(
    formatPhoneNumber(safeBusiness.whatsapp || ""),
  );
  const [phone, setPhone] = useState(
    formatPhoneNumber(safeBusiness.phone || ""),
  );

  const [description, setDescription] = useState(safeBusiness.description);

  const [layoutText, setLayoutText] = useState(
    safeBusiness.urban_tag ||
      safeBusiness.luxe_quote ||
      safeBusiness.showroom_collection ||
      safeBusiness.comercial_badge ||
      "", // 🚀 GARANTINDO QUE NÃO SEJA UNDEFINED
  );

  const [features, setFeatures] = useState<string[]>(safeBusiness.features);
  const [faqs, setFaqs] = useState<{ q: string; a: string }[]>(
    safeBusiness.faqs,
  );
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>(
    safeBusiness.hours,
  );

  // 🚀 PROTEGENDO OS ENDEREÇOS VAZIOS COM || ""
  const [addressData, setAddressData] = useState({
    address: safeBusiness.address?.split(" - ")[0]?.split(", ")[0] || "",
    cep: safeBusiness.cep || "",
    neighborhood: safeBusiness.neighborhood || "",
    city: safeBusiness.city || "",
    state: safeBusiness.state || "",
    number: safeBusiness.number || "",
  });

  const [socials, setSocials] = useState({
    instagram: cleanHandle(safeBusiness.instagram, /.*instagram\.com\//),
    facebook: cleanHandle(safeBusiness.facebook, /.*facebook\.com\//),
    tiktok: cleanHandle(safeBusiness.tiktok, /.*tiktok\.com\/@?/),
    website: safeBusiness.website || "",
    shopee: safeBusiness.shopee || "",
    mercadoLivre: safeBusiness.mercadoLivre || "",
    shein: safeBusiness.shein || "",
    ifood: safeBusiness.ifood || "",
  });
  // 🚀 RADAR DE ALTERAÇÕES (Verifica se algo mudou para ativar o botão Salvar)
  const hasChanges = useMemo(() => {
    if (isNew) return true;

    const initialLayoutText =
      safeBusiness.urban_tag ||
      safeBusiness.luxe_quote ||
      safeBusiness.showroom_collection ||
      safeBusiness.comercial_badge ||
      "";

    const isBasicDifferent =
      name !== safeBusiness.name ||
      slug !== safeBusiness.slug ||
      isPublished !== safeBusiness.published ||
      profileImage !== safeBusiness.imageUrl ||
      categoria !== safeBusiness.category ||
      selectedTheme !== safeBusiness.theme ||
      selectedLayout !==
        (layoutInfo[
          safeBusiness.layout === "influencer" ? "urban" : safeBusiness.layout
        ]
          ? safeBusiness.layout === "influencer"
            ? "urban"
            : safeBusiness.layout
          : "urban") ||
      description !== safeBusiness.description ||
      layoutText !== initialLayoutText ||
      whatsapp !== formatPhoneNumber(safeBusiness.whatsapp) ||
      phone !== formatPhoneNumber(safeBusiness.phone);

    const isArraysDifferent =
      JSON.stringify(gallery) !== JSON.stringify(safeBusiness.gallery) ||
      JSON.stringify(selectedSubs) !==
        JSON.stringify(safeBusiness.subcategory) ||
      JSON.stringify(keywords) !== JSON.stringify(safeBusiness.keywords) ||
      JSON.stringify(features) !== JSON.stringify(safeBusiness.features) ||
      JSON.stringify(faqs) !== JSON.stringify(safeBusiness.faqs) ||
      JSON.stringify(businessHours) !== JSON.stringify(safeBusiness.hours);

    const isSocialsDifferent =
      socials.instagram !==
        cleanHandle(safeBusiness.instagram, /.*instagram\.com\//) ||
      socials.tiktok !==
        cleanHandle(safeBusiness.tiktok, /.*tiktok\.com\/@?/) ||
      socials.facebook !==
        cleanHandle(safeBusiness.facebook, /.*facebook\.com\//) ||
      socials.shopee !== (safeBusiness.shopee || "") ||
      socials.ifood !== (safeBusiness.ifood || "") ||
      socials.mercadoLivre !== (safeBusiness.mercadoLivre || "") ||
      socials.shein !== (safeBusiness.shein || "") ||
      socials.website !== (safeBusiness.website || "");

    const isAddressDifferent =
      addressData.cep !== (safeBusiness.cep || "") ||
      addressData.number !== (safeBusiness.number || "");

    return (
      isBasicDifferent ||
      isArraysDifferent ||
      isSocialsDifferent ||
      isAddressDifferent
    );
  }, [
    name,
    slug,
    isPublished,
    profileImage,
    categoria,
    selectedTheme,
    selectedLayout,
    description,
    layoutText,
    whatsapp,
    phone,
    gallery,
    selectedSubs,
    keywords,
    features,
    faqs,
    businessHours,
    socials,
    addressData,
    isNew,
    safeBusiness,
  ]);
  const filteredThemeKeys = useMemo(() => {
    return Object.keys(businessThemes).filter(
      (key) => businessThemes[key].layout === selectedLayout,
    );
  }, [selectedLayout]);

  const validGallery = useMemo(
    () => gallery.filter((g) => typeof g === "string" && g.startsWith("http")),
    [gallery],
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const temaAtual = businessThemes[selectedTheme];
    if (temaAtual?.layout !== selectedLayout) {
      const primeiroTemaValido = Object.keys(businessThemes).find(
        (chave) => businessThemes[chave].layout === selectedLayout,
      );
      if (primeiroTemaValido) {
        setSelectedTheme(primeiroTemaValido);
      }
    }
  }, [selectedLayout]);

  useEffect(() => {
    if (!isNew && safeBusiness) {
      setName(safeBusiness.name);
      setSlug(safeBusiness.slug);
      setGallery(safeBusiness.gallery);
      setProfileImage(safeBusiness.imageUrl);
      setIsPublished(safeBusiness.published);

      // 🚀 ADICIONADO: Mantém as máscaras nos telefones ao salvar/recarregar
      setWhatsapp(formatPhoneNumber(safeBusiness.whatsapp || ""));
      setPhone(formatPhoneNumber(safeBusiness.phone || ""));

      setAddressData({
        address: safeBusiness.address?.split(" - ")[0]?.split(", ")[0] || "",
        cep: safeBusiness.cep || "",
        neighborhood: safeBusiness.neighborhood || "",
        city: safeBusiness.city || "",
        state: safeBusiness.state || "",
        number: safeBusiness.number || "",
      });
    }
  }, [safeBusiness, isNew]);

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
    } else {
      setTagInput("");
    }
  };
  const removeTag = (tagToRemove: string) =>
    setKeywords(keywords.filter((tag) => tag !== tagToRemove));

  const handleUpdate = async () => {
    if (isLoading) return;
    if (!name || name.trim() === "") {
      toast.error("Por favor, digite o nome do negócio antes de salvar.", {
        id: "erro-nome-vazio",
      });
      setNameError(true);
      nameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      nameRef.current?.focus();
      setTimeout(() => setNameError(false), 4000);
      return;
    }
    if (!isNew && slug !== safeBusiness.slug) {
      const confirmChange = window.confirm(
        "⚠️ PERIGO: Você alterou o LINK do seu negócio.\n\n" +
          "Isso fará com que seus links compartilhados antigos PAREM DE FUNCIONAR imediatamente.\n\n" +
          "Tem certeza absoluta que deseja mudar de:\n" +
          `"${safeBusiness.slug}" para "${slug}"?`,
      );
      if (!confirmChange) {
        setSlug(safeBusiness.slug);
        return;
      }
    }
    if (isNew && !name) {
      toast.error("Por favor, digite o nome do negócio antes de salvar.");
      return;
    }
    setIsLoading(true);

    try {
      const fullAddress = `${addressData.address}${addressData.number ? ", " + addressData.number : ""}${addressData.neighborhood ? " - " + addressData.neighborhood : ""}${addressData.city ? " - " + addressData.city : ""}${addressData.cep ? " - CEP " + addressData.cep : ""}`;

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
          ? `https://instagram.com/${cleanHandle(socials.instagram, /.*instagram\.com\//)}`
          : "",
        facebook: socials.facebook
          ? `https://facebook.com/${socials.facebook.replace(/.*facebook\.com\//, "")}`
          : "",
        tiktok: socials.tiktok
          ? `https://tiktok.com/@${socials.tiktok.replace(/.*tiktok\.com\/@?/, "")}`
          : "",
        shopee: socials.shopee
          ? socials.shopee.startsWith("http")
            ? socials.shopee
            : `https://${socials.shopee}`
          : "",
        mercadoLivre: socials.mercadoLivre
          ? socials.mercadoLivre.startsWith("http")
            ? socials.mercadoLivre
            : `https://${socials.mercadoLivre}`
          : "",
        shein: socials.shein
          ? socials.shein.startsWith("http")
            ? socials.shein
            : `https://${socials.shein}`
          : "",
        ifood: socials.ifood
          ? socials.ifood.startsWith("http")
            ? socials.ifood
            : `https://${socials.ifood}`
          : "",
        website: socials.website
          ? socials.website.startsWith("http")
            ? socials.website
            : `https://${socials.website}`
          : "",
        videoUrl: "",
        heroImage: "",
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
            setSlugError(true);
            slugRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
            slugRef.current?.focus();
            setTimeout(() => setSlugError(false), 4000);
            return;
          }
          throw new Error(result.error);
        }
      } else {
        payload.faqs = faqs.filter(
          (f) => f.q.trim() !== "" && f.a.trim() !== "",
        );

        const updateResult = await updateFullBusiness(business.slug, payload);

        if (!updateResult.success) {
          toast.warning(
            updateResult.error || "Este nome de link já está em uso.",
          );
          setSlugError(true);
          slugRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          slugRef.current?.focus();
          setTimeout(() => setSlugError(false), 4000);
          return;
        }

        await updateBusinessHours(business.slug, businessHours);

        router.refresh();
        const fireConfetti = (await import("canvas-confetti")).default;
        fireConfetti();
        toast.success("Alterações salvas com sucesso!");

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
    if (isNew) {
      setSlug(toSlug(val));
    }
  };

  const handleSlugChange = (val: string) => {
    const newSlug = toSlug(val);
    setSlug(newSlug);
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
              disabled={isLoading || !hasChanges}
              className={`hidden md:flex items-center gap-3 px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-sm ${
                !hasChanges && !isNew && !isLoading
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                  : "bg-slate-900 text-white hover:bg-indigo-600 shadow-xl"
              }`}
            >
              <Save size={16} />
              {!hasChanges && !isNew && !isLoading ? "Atualizado" : "Salvar"}
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* =========================================================
            SEÇÃO 1: DESIGN & IDENTIDADE
           ========================================================= */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-sm border border-slate-200 flex flex-col items-center text-center">
            {/* FOTO DE PERFIL */}
            <div className="relative w-32 h-32 md:w-36 md:h-36 mb-4 group">
              <div className="w-full h-full rounded-full bg-slate-50 border-8 border-white shadow-2xl overflow-hidden flex items-center justify-center relative">
                {profileImage ? (
                  <img
                    src={profileImage}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UTButton<OurFileRouter, any>
                    endpoint="logoUploader" // 🚀 CORRIGIDO AQUI PARA USAR O LIMITE DE 2MB DO SEU BACKEND
                    onBeforeUploadBegin={(files) => {
                      // 🚀 TRAVA CLIENT-SIDE PARA A LOGO (2MB)
                      const isOverLimit = files.some(
                        (f) => f.size > 2 * 1024 * 1024,
                      );
                      if (isOverLimit) {
                        toast.error(
                          "A imagem é muito pesada! O limite para a Logo é 2MB.",
                        );
                        return []; // Interrompe o envio na hora!
                      }
                      return files;
                    }}
                    onClientUploadComplete={(res) => {
                      if (!res || res.length === 0) return; // 🛡️ ESCUDO: Se não subiu nada, não faz nada e não dá erro!
                      setProfileImage(res[0].ufsUrl);
                    }}
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
            <div className="mb-8 px-4 py-2 bg-indigo-50/50 border border-indigo-100 rounded-full">
              {/* 🚀 TEXTO DE APOIO ATUALIZADO */}
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-indigo-500 text-center">
                💡 Dica: Imagem Quadrada (MÁX: 2MB)
              </p>
            </div>
            {/* NOME DO NEGÓCIO */}
            <div className="w-full relative group mb-2">
              <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1 block opacity-60 group-hover:opacity-100 transition-opacity">
                Nome do Negócio (Clique para editar)
              </label>
              <input
                ref={nameRef}
                value={name}
                onChange={(e) => {
                  handleNameChange(e.target.value);
                  setNameError(false);
                }}
                className={`w-full text-center bg-transparent text-2xl md:text-3xl font-black outline-none border-b-2 py-2 rounded-t-lg italic tracking-tighter placeholder:text-slate-300 transition-all ${
                  nameError
                    ? "border-rose-500 text-rose-600 bg-rose-50 animate-pulse"
                    : "border-dashed border-slate-300 focus:border-indigo-500 hover:bg-slate-50 focus:bg-white text-slate-900"
                }`}
                placeholder="Digite o Nome Aqui..."
              />
            </div>
            {/* LINK DO NEGÓCIO (SLUG) */}
            <div className="w-full relative group mb-8 px-4 mt-4">
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest flex items-center justify-center gap-2">
                <span className="bg-slate-100 px-2 py-1 rounded text-slate-500">
                  Link do seu site: tafanu.com.br/site/
                </span>
              </label>
              <div className="relative">
                <input
                  ref={slugRef}
                  value={slug}
                  onChange={(e) => {
                    handleSlugChange(e.target.value);
                    setSlugError(false);
                  }}
                  onFocus={() => {
                    if (!isNew && slug === safeBusiness.slug) {
                      toast.warning(
                        "Cuidado: Mudar o link quebrará seus links antigos!",
                        { id: "aviso-qr" },
                      );
                    }
                  }}
                  className={`w-full text-center text-sm md:text-base font-bold font-mono outline-none border-2 py-3 rounded-xl transition-all ${
                    slugError
                      ? "bg-rose-50 border-rose-500 text-rose-700 ring-4 ring-rose-200 animate-pulse"
                      : slug !== safeBusiness.slug && !isNew
                        ? "bg-amber-50 border-amber-300 text-amber-700 focus:ring-4 ring-amber-100"
                        : "bg-slate-50 border-slate-200 text-slate-600 focus:border-indigo-400"
                  }`}
                  placeholder="seu-link-aqui"
                />

                {!isNew && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {slug !== safeBusiness.slug ? (
                      <span className="text-amber-500 text-[10px] font-black uppercase animate-pulse">
                        Alterado!
                      </span>
                    ) : (
                      <span className="text-[10px] opacity-50">🔒</span>
                    )}
                  </div>
                )}
              </div>

              {!isNew && slug !== safeBusiness.slug && (
                <p className="text-[10px] text-amber-600 font-bold mt-2 bg-amber-100 p-2 rounded text-center border border-amber-200">
                  ⚠️ Atenção: Se salvar, os links antigos deixarão de funcionar.
                </p>
              )}
            </div>
            {/* SELETOR DE LAYOUT */}
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

            {/* INPUT DE TEXTO ESPECIAL DO LAYOUT */}
            <div className="bg-slate-50 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.2rem] border border-dashed border-slate-200 w-full mt-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[9px] font-black uppercase text-indigo-500 block tracking-widest">
                  {currentLayoutData.label} - Texto Especial
                </label>
                <span
                  className={`text-[9px] font-bold ${layoutText.length >= 35 ? "text-rose-500" : "text-slate-400"}`}
                >
                  {layoutText.length} / 40
                </span>
              </div>

              <input
                value={layoutText}
                onChange={(e) => setLayoutText(e.target.value.slice(0, 40))}
                maxLength={40}
                className={`w-full h-12 md:h-14 px-5 rounded-xl bg-white border font-bold text-xs md:text-sm shadow-sm outline-none transition-all ${
                  layoutText.length >= 40
                    ? "border-rose-300 ring-4 ring-rose-50"
                    : "focus:border-indigo-400"
                }`}
                placeholder={currentLayoutData.placeholder}
              />

              <p className="text-[8px] text-slate-400 mt-2 font-medium uppercase tracking-tighter">
                {layoutText.length >= 40
                  ? "⚠️ Limite atingido! Menos texto = mais impacto no visual."
                  : "Dica: Use palavras fortes que resumam seu diferencial."}
              </p>
            </div>
          </div>

          {/* TEMAS (CORES) */}
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200">
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-6 flex items-center gap-2">
              <Palette size={16} /> Temas Disponíveis
            </h3>
            <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4 p-2 pb-8">
              {filteredThemeKeys.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTheme(t)}
                  title={businessThemes[t].label}
                  className={`aspect-square rounded-full transition-all relative group shadow-sm ${
                    selectedTheme === t
                      ? "ring-2 ring-offset-2 ring-slate-900 scale-90 z-10"
                      : "hover:scale-110 hover:shadow-md border border-slate-100"
                  }`}
                  style={{ background: businessThemes[t].previewColor }}
                >
                  {selectedTheme === t && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_2px_rgba(0,0,0,0.5)]" />
                    </div>
                  )}
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase bg-slate-900 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-xl">
                    {businessThemes[t].label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200 mt-8">
            <MobilePreview
              themeKey={selectedTheme}
              name={name}
              description={description}
              profileImage={profileImage}
              gallery={gallery}
              layoutLabel={currentLayoutData.label}
              comercial_badge={layoutText}
              luxe_quote={layoutText}
              urban_tag={layoutText}
              showroom_collection={layoutText}
            />
          </div>

          {/* SEGMENTAÇÃO E TAGS */}
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200">
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-6 flex items-center gap-2">
              <Tag size={16} /> Segmentação
            </h3>

            {/* 1. SELETOR DE CATEGORIA (PRINCIPAL) */}
            <div className="mb-8">
              <label className="text-[9px] font-black uppercase text-indigo-400 mb-3 block tracking-widest">
                1. Qual seu Ramo Principal?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categoryKeys.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategoria(cat);
                      setSelectedSubs([]);
                    }}
                    className={`h-12 rounded-xl text-[9px] font-black uppercase transition-all border shadow-sm ${
                      categoria === cat
                        ? "bg-slate-900 text-white border-slate-900 ring-2 ring-slate-200 ring-offset-2"
                        : "bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. SELETOR DE SUBCATEGORIAS */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-8">
              <label className="text-[9px] font-black uppercase text-slate-400 mb-3 block tracking-widest flex justify-between">
                <span>2. O que você oferece? (Nichos)</span>
                <span className="text-indigo-400">
                  {selectedSubs.length} Selecionados
                </span>
              </label>

              {!(TAFANU_CATEGORIES as any)[categoria] ? (
                <p className="text-xs text-slate-400 italic py-2">
                  Selecione uma categoria acima primeiro.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(TAFANU_CATEGORIES as any)[categoria]?.map((sub: string) => {
                    const isSelected = selectedSubs.includes(sub);
                    return (
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
                        className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase transition-all border ${
                          isSelected
                            ? "bg-indigo-500 text-white border-indigo-500 shadow-md transform scale-105"
                            : "bg-white text-slate-500 border-slate-200 hover:border-indigo-200"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {sub}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. PALAVRAS-CHAVE */}
            <div className="pt-6 border-t border-slate-100">
              <div className="flex justify-between items-end mb-3">
                <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
                  <Hash size={16} /> Palavras-chave Extras
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
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.endsWith(" ") || val.endsWith(",")) {
                      addTag();
                    } else {
                      setTagInput(val);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  disabled={keywords.length >= 10}
                  className="bg-transparent text-xs font-bold outline-none flex-1 min-w-[120px] h-8 px-2 placeholder:font-normal placeholder:text-slate-400 disabled:cursor-not-allowed"
                  placeholder={
                    keywords.length >= 10
                      ? "Limite atingido"
                      : "Digite e aperte Espaço..."
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            SEÇÃO 2: CONTEÚDO (GALERIA E SOBRE)
           ========================================================= */}
        <div className="space-y-8">
          <div className="flex items-center gap-4 py-4">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-xs font-black text-slate-300 uppercase tracking-widest">
              Conteúdo
            </span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          {/* GALERIA */}
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              {/* 🚀 TEXTO DE APOIO ATUALIZADO (MAX 4MB) */}
              <h2 className="text-[10px] font-black uppercase flex items-center gap-2">
                <Layout size={18} className="text-indigo-500" /> Galeria Vitrine
                <span className="text-[8px] text-slate-400 normal-case tracking-normal ml-1">
                  (Máx: 4MB/foto)
                </span>
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
                      setGallery((prev) => prev.filter((_, idx) => idx !== i))
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
                    onBeforeUploadBegin={(files) => {
                      // 🚀 TRAVA CLIENT-SIDE PARA A GALERIA (4MB)
                      const validFiles = files.filter(
                        (f) => f.size <= 4 * 1024 * 1024,
                      );
                      if (validFiles.length !== files.length) {
                        toast.error(
                          "Algumas imagens excederam o limite de 4MB e foram bloqueadas.",
                        );
                      }
                      return validFiles; // Retorna só as fotos que têm menos de 4MB!
                    }}
                    onClientUploadComplete={(res) => {
                      if (!res || res.length === 0) return; // 🛡️ ESCUDO: Protege contra o erro de 'undefined'
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

          {/* SOBRE O NEGÓCIO */}
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
                <AlignLeft size={16} /> Sobre o Negócio
              </label>
              <span
                className={`text-[10px] font-bold ${description.length >= 550 ? "text-rose-500" : "text-slate-400"}`}
              >
                {description.length} / 600
              </span>
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 600))}
              maxLength={600}
              rows={6}
              className={`w-full bg-slate-50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border text-sm font-medium outline-none transition-all ${
                description.length >= 600
                  ? "border-rose-300 ring-4 ring-rose-50"
                  : "focus:ring-2 ring-indigo-50 focus:border-indigo-200"
              }`}
              placeholder="Conte sua história de forma breve e atraente..."
            />

            <div className="mt-3 flex gap-2 items-start">
              <span className="text-[10px]">💡</span>
              <p className="text-[9px] text-slate-400 font-medium uppercase tracking-tight leading-relaxed">
                {description.length >= 600
                  ? "Limite atingido. Tente ser mais direto para prender a atenção do cliente!"
                  : "Dica: Fale sobre o que você resolve, não apenas o que você vende. Textos curtos convertem mais."}
              </p>
            </div>

            {/* DIFERENCIAIS */}
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

            {/* FAQ */}
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
                    onClick={() => setFaqs(faqs.filter((_, idx) => idx !== i))}
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
        </div>

        {/* =========================================================
    SEÇÃO 3: CONEXÕES, VENDAS E LOCALIZAÇÃO
    ========================================================= */}
        <div className="space-y-8">
          <div className="flex items-center gap-4 py-4">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-xs font-black text-slate-300 uppercase tracking-widest">
              Conexões
            </span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          {/* CONTATOS PRINCIPAIS */}
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              {/* WhatsApp */}
              <div className="flex-1 bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100/50 transition-all focus-within:ring-4 ring-emerald-50 focus-within:border-emerald-200">
                <label className="text-[9px] font-black uppercase text-emerald-600 mb-2 block tracking-widest">
                  WhatsApp Business
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                    <MessageCircle size={20} fill="currentColor" />
                  </div>
                  <input
                    value={whatsapp}
                    onChange={(e) =>
                      setWhatsapp(formatPhoneNumber(e.target.value))
                    } // 🚀 APLICA MÁSCARA AQUI
                    placeholder="(00) 00000-0000"
                    maxLength={15} // Limite visual da máscara
                    className="bg-transparent w-full text-xl md:text-2xl font-mono font-bold text-slate-800 outline-none placeholder:text-emerald-200"
                  />
                </div>
              </div>

              {/* Telefone */}
              <div className="flex-1 bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100/50 transition-all focus-within:ring-4 ring-indigo-50 focus-within:border-indigo-200">
                <label className="text-[9px] font-black uppercase text-indigo-600 mb-2 block tracking-widest">
                  Ligações
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-200">
                    <PhoneCall size={18} />
                  </div>
                  <input
                    value={phone}
                    onChange={(e) =>
                      setPhone(formatPhoneNumber(e.target.value))
                    } // 🚀 APLICA MÁSCARA AQUI
                    placeholder="(00) 0000-0000"
                    maxLength={15}
                    className="bg-transparent w-full text-xl md:text-2xl font-mono font-bold text-slate-800 outline-none placeholder:text-indigo-200"
                  />
                </div>
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  id: "instagram",
                  icon: <Instagram size={16} />,
                  color: "hover:text-pink-500",
                  label: "Instagram",
                },
                {
                  id: "tiktok",
                  icon: <Music2 size={16} />,
                  color: "hover:text-black",
                  label: "TikTok",
                },
                {
                  id: "facebook",
                  icon: <Facebook size={16} />,
                  color: "hover:text-blue-600",
                  label: "Facebook",
                },
                {
                  id: "website",
                  icon: <Globe size={16} />,
                  color: "hover:text-indigo-500",
                  label: "Website",
                },
              ].map((social) => (
                <div
                  key={social.id}
                  className="group bg-slate-50 p-3 rounded-2xl border border-transparent hover:border-slate-200 hover:bg-white transition-all flex items-center gap-3"
                >
                  <div
                    className={`p-2 rounded-lg bg-white shadow-sm text-slate-400 transition-colors ${social.color}`}
                  >
                    {social.icon}
                  </div>
                  <input
                    value={(socials as any)[social.id]}
                    onChange={(e) =>
                      setSocials({ ...socials, [social.id]: e.target.value })
                    }
                    placeholder={contactPlaceholders[social.id]}
                    className="bg-transparent w-full text-xs font-bold text-slate-600 outline-none placeholder:font-normal placeholder:opacity-30"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* CANAIS DE VENDA */}
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200">
            <h2 className="text-[10px] font-black uppercase mb-8 flex items-center gap-2 text-slate-400 tracking-[0.2em]">
              <ShoppingCart size={16} /> Marketplaces & Apps
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  key: "shopee",
                  label: "Shopee",
                  color: "orange",
                  icon: "S",
                  placeholder: "shopee.com.br/sualoja",
                },
                {
                  key: "ifood",
                  label: "iFood",
                  color: "red",
                  icon: "i",
                  placeholder: "ifood.com.br/delivery/...",
                },
                {
                  key: "mercadoLivre",
                  label: "M. Livre",
                  color: "yellow",
                  icon: "M",
                  placeholder: "perfil.mercadolivre.com.br/...",
                },
                {
                  key: "shein",
                  label: "Shein",
                  color: "black",
                  icon: "S",
                  placeholder: "shein.com/br/store/...",
                },
              ].map((store) => {
                const colors: any = {
                  orange: "bg-[#EE4D2D] text-white ring-orange-100",
                  red: "bg-[#EA1D2C] text-white ring-red-100",
                  yellow: "bg-[#FFF159] text-slate-900 ring-yellow-100",
                  black: "bg-black text-white ring-slate-100",
                };
                return (
                  <div
                    key={store.key}
                    className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl border border-slate-100 transition-all focus-within:bg-white focus-within:ring-4 focus-within:border-transparent group"
                  >
                    <div
                      className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center font-black text-xl shadow-sm ${colors[store.color]}`}
                    >
                      {store.icon}
                    </div>
                    <div className="flex-1 pr-4">
                      <label className="text-[8px] font-black uppercase text-slate-400 block mb-0.5">
                        {store.label}
                      </label>
                      <input
                        value={(socials as any)[store.key]}
                        onChange={(e) =>
                          setSocials({
                            ...socials,
                            [store.key]: e.target.value,
                          })
                        }
                        placeholder={store.placeholder}
                        className="bg-transparent w-full text-[11px] font-bold text-slate-700 outline-none placeholder:font-normal placeholder:opacity-30"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LOCALIZAÇÃO */}
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
                          cep: cep,
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

          {/* HORÁRIOS */}
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
        </div>

        {/* BOTÃO FLUTUANTE DE SALVAR */}
        <div className="pt-8 flex flex-col items-center sticky bottom-6 md:bottom-8 z-[60] gap-3 pointer-events-none">
          <div className="pointer-events-auto flex flex-col items-center gap-3 w-full max-w-lg">
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
              disabled={isLoading || !hasChanges}
              className={`w-full h-14 md:h-20 rounded-[1.8rem] md:rounded-[2.5rem] flex items-center justify-center gap-3 font-black uppercase text-[10px] md:text-xs transition-all tracking-[0.2em] italic ${
                isLoading || (!hasChanges && !isNew)
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : !isPublished
                    ? "bg-slate-700 text-slate-300 shadow-xl active:scale-95"
                    : "bg-slate-900 text-white hover:bg-indigo-600 shadow-2xl active:scale-95"
              }`}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : !hasChanges && !isNew ? (
                <CheckCircle2 size={20} className="text-slate-400" />
              ) : isPublished ? (
                <CheckCircle2 size={20} />
              ) : (
                <Power size={20} />
              )}

              {isLoading
                ? "Salvando..."
                : !hasChanges && !isNew
                  ? "Tudo Atualizado"
                  : isPublished
                    ? isNew
                      ? "Criar Perfil"
                      : "Gravar Mudanças"
                    : "Salvar em Modo Offline"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
