"use client";
import { toast } from "sonner";
import { IdentitySection } from "./business-editor/IdentitySection";
import { TAFANU_CATEGORIES, layoutInfo } from "./business-editor/constants";
import { BusinessHour } from "./business-editor/types";
import MobilePreview from "@/components/MobilePreview";
import ImageCropperModal from "@/components/ImageCropperModal";
import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUploadThing } from "@/lib/uploadthing";
import { AddressSection } from "./business-editor/AddressSection";
import { SegmentationSection } from "./business-editor/SegmentationSection";
import { ContentSection } from "./business-editor/ContentSection";
import { compressImage } from "@/lib/compressImage";
import { ConnectionsSection } from "./business-editor/ConnectionsSection";
import {
  Save,
  Loader2,
  Trash2,
  Clock,
  Power,
  Eye,
  Smartphone,
  CheckCircle2,
} from "lucide-react";

import {
  updateFullBusiness,
  updateBusinessHours,
  createBusiness,
  deleteBusiness,
} from "@/app/actions";
import HoursForm from "@/components/HoursForm";
import { motion, AnimatePresence } from "framer-motion";
import { businessThemes } from "@/lib/themes";
import {
  normalizeBusiness,
  onlyNumbers,
  toSlug,
  cleanHandle,
  formatPhoneNumber,
  normalizeText,
} from "@/lib/normalize";

const isDeepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  if (
    typeof obj1 !== "object" ||
    typeof obj2 !== "object" ||
    obj1 == null ||
    obj2 == null
  )
    return false;
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  for (const key of keys1) {
    if (!keys2.includes(key) || !isDeepEqual(obj1[key], obj2[key]))
      return false;
  }
  return true;
};

export default function BusinessEditor({
  business,
  isNew = false,
}: {
  business: any;
  isNew?: boolean;
}) {
  const router = useRouter();
  const slugRef = useRef<HTMLInputElement>(null);
  const [slugError, setSlugError] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const [nameError, setNameError] = useState(false);

  const safeBusiness = useMemo(() => normalizeBusiness(business), [business]);
  const categoryKeys = useMemo(() => Object.keys(TAFANU_CATEGORIES).sort(), []);

  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading: isUploadingLogo } = useUploadThing(
    "logoUploader",
    {
      onClientUploadComplete: (res) => {
        if (!res || res.length === 0) return;
        setProfileImage(res[0].ufsUrl);
        toast.success("Logo recortada e atualizada com sucesso!");
      },
      onUploadError: (error) => {
        toast.error(`Erro ao subir imagem: ${error.message}`);
      },
    },
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 6 * 1024 * 1024) {
      toast.error("A imagem é muito pesada! O limite agora é 6MB.");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setRawImageSrc(objectUrl);
    e.target.value = "";
  };

  const handleCropComplete = async (croppedFile: File) => {
    if (rawImageSrc) URL.revokeObjectURL(rawImageSrc);
    setRawImageSrc(null);
    const compressedFile = await compressImage(croppedFile);
    await startUpload([compressedFile]);
  };

  const [name, setName] = useState(safeBusiness.name);
  const [slug, setSlug] = useState(safeBusiness.slug);
  const [isPublished, setIsPublished] = useState(
    isNew ? false : safeBusiness.published,
  );

  const [mediaFeed, setMediaFeed] = useState<any[]>(() => {
    if (safeBusiness.mediaFeed && safeBusiness.mediaFeed.length > 0) {
      return safeBusiness.mediaFeed;
    }
    const oldGallery = (safeBusiness.gallery || []).map((url: string) => ({
      type: "image",
      url,
    }));
    const oldVideos = (safeBusiness.videos || []).map((url: string) => ({
      type: "video",
      url,
    }));
    return [...oldGallery, ...oldVideos];
  });

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
      "",
  );

  const [features, setFeatures] = useState<string[]>(safeBusiness.features);
  const [faqs, setFaqs] = useState<{ q: string; a: string }[]>(
    safeBusiness.faqs,
  );
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>(
    safeBusiness.hours,
  );

  const [addressData, setAddressData] = useState({
    address: safeBusiness.address || "",
    cep: safeBusiness.cep || "",
    neighborhood: safeBusiness.neighborhood || "",
    city: safeBusiness.city || "",
    state: safeBusiness.state || "",
    number: safeBusiness.number || "",
    complement: safeBusiness.complement || "",
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

  const [hasDelivery, setHasDelivery] = useState(
    safeBusiness.hasDelivery || false,
  );

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
      hasDelivery !== (safeBusiness.hasDelivery || false) ||
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
      !isDeepEqual(mediaFeed, safeBusiness.mediaFeed || []) ||
      !isDeepEqual(selectedSubs, safeBusiness.subcategory) ||
      !isDeepEqual(keywords, safeBusiness.keywords) ||
      !isDeepEqual(features, safeBusiness.features) ||
      !isDeepEqual(faqs, safeBusiness.faqs) ||
      !isDeepEqual(businessHours, safeBusiness.hours);

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
      (addressData.cep || "") !== (safeBusiness.cep || "") ||
      (addressData.address || "") !== (safeBusiness.address || "") ||
      (addressData.neighborhood || "") !== (safeBusiness.neighborhood || "") ||
      (addressData.city || "") !== (safeBusiness.city || "") ||
      (addressData.state || "") !== (safeBusiness.state || "") ||
      (addressData.number || "") !== (safeBusiness.number || "") ||
      (addressData.complement || "") !== (safeBusiness.complement || "");

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
    mediaFeed,
    selectedSubs,
    keywords,
    features,
    faqs,
    businessHours,
    socials,
    addressData,
    isNew,
    safeBusiness,
    hasDelivery, // 🚀 Mantido aqui
  ]);

  const filteredThemeKeys = useMemo(() => {
    return Object.keys(businessThemes).filter(
      (key) => businessThemes[key].layout === selectedLayout,
    );
  }, [selectedLayout]);

  useEffect(() => {
    setIsMounted(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, 50);
  }, []);

  useEffect(() => {
    return () => {
      if (rawImageSrc) {
        URL.revokeObjectURL(rawImageSrc);
      }
    };
  }, [rawImageSrc]);

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

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!isNew && safeBusiness && !hasInitialized.current) {
      setName(safeBusiness.name);
      setSlug(safeBusiness.slug);
      setMediaFeed(
        safeBusiness.mediaFeed && safeBusiness.mediaFeed.length > 0
          ? safeBusiness.mediaFeed
          : [
              ...(safeBusiness.gallery || []).map((url: string) => ({
                type: "image",
                url,
              })),
              ...(safeBusiness.videos || []).map((url: string) => ({
                type: "video",
                url,
              })),
            ],
      );
      setProfileImage(safeBusiness.imageUrl);
      setIsPublished(safeBusiness.published);
      setWhatsapp(formatPhoneNumber(safeBusiness.whatsapp || ""));
      setPhone(formatPhoneNumber(safeBusiness.phone || ""));

      setAddressData({
        address: safeBusiness.address || "",
        cep: safeBusiness.cep || "",
        neighborhood: safeBusiness.neighborhood || "",
        city: safeBusiness.city || "",
        state: safeBusiness.state || "",
        number: safeBusiness.number || "",
        complement: safeBusiness.complement || "",
      });
      setHasDelivery(safeBusiness.hasDelivery || false);
      hasInitialized.current = true;
    }
  }, [safeBusiness, isNew]);

  const currentLayoutData = layoutInfo[selectedLayout] || layoutInfo["urban"];

  const handleDeleteAction = async () => {
    const confirmDelete = window.confirm(
      "⚠️ ATENÇÃO: Tem certeza que deseja excluir esta vitrine?\n\n(Se você for um assinante e esta for sua única loja, ela será apenas resetada para proteger sua assinatura).",
    );

    if (!confirmDelete) return;

    setIsLoading(true);
    try {
      const res = await deleteBusiness(safeBusiness.slug);
      if (res.success) {
        toast.success(res.message);
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(res.error || "Erro ao excluir.");
      }
    } catch (error) {
      toast.error("Ops! Algo deu errado ao tentar excluir.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (overridePublished?: boolean) => {
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
      const isGhostOriginal =
        /^vitrine-[a-z0-9]{5}-\d{13}$/i.test(safeBusiness.slug) ||
        /^loja-[a-z0-9]{8}-\d{4}$/i.test(safeBusiness.slug);

      if (!isGhostOriginal) {
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
    }

    setIsLoading(true);

    try {
      const payload: any = {
        slug,
        name,
        description,
        category: categoria,
        subcategory: selectedSubs,
        keywords: keywords.map((k) => normalizeText(k)),
        theme: selectedTheme,
        layout: layoutInfo[selectedLayout] ? selectedLayout : "urban",
        published:
          overridePublished !== undefined ? overridePublished : isPublished,
        urban_tag: layoutText,
        luxe_quote: layoutText,
        showroom_collection: layoutText,
        comercial_badge: layoutText,
        features: features.filter((f) => f.trim() !== ""),
        address: addressData.address,
        cep: addressData.cep,
        city: addressData.city,
        state: addressData.state,
        neighborhood: addressData.neighborhood,
        number: addressData.number,
        complement: addressData.complement,
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

        // 🚀 CORREÇÃO AQUI 1: ENVIAR PARA O BANCO DE DADOS
        hasDelivery: hasDelivery,

        mediaFeed: mediaFeed.filter(
          (m: any) => typeof m.url === "string" && m.url.trim() !== "",
        ),
        imageUrl: profileImage,
        hours: businessHours,
        faqs: faqs.filter((f) => f.q.trim() !== "" && f.a.trim() !== ""),
      };

      if (isNew) {
        const result = await createBusiness(payload);

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
          setIsLoading(false);

          toast.error("Não foi possível salvar", {
            description:
              updateResult.error || "Verifique os dados e tente novamente.",
            duration: 5000,
          });

          const errorMessage = updateResult.error?.toLowerCase() || "";

          if (
            errorMessage.includes("endereço") ||
            errorMessage.includes("mapa")
          ) {
            document.getElementById("address-section")?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }

          if (errorMessage.includes("link") || errorMessage.includes("slug")) {
            setSlugError(true);
            slugRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
            slugRef.current?.focus();
            setTimeout(() => setSlugError(false), 4000);
          }

          return;
        }

        await updateBusinessHours(business.slug, businessHours);

        const fireConfetti = (await import("canvas-confetti")).default;
        fireConfetti();
        toast.success("Alterações salvas com sucesso!");

        hasInitialized.current = false;

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
        router.refresh();
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
    let newSlug = val.replace(/\s+/g, "-");
    newSlug = newSlug.toLowerCase();
    newSlug = newSlug.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    newSlug = newSlug.replace(/[^a-z0-9\-]/g, "");
    setSlug(newSlug);
  };

  const mockGallery = useMemo(() => {
    return mediaFeed.filter((m) => m.type === "image").map((m) => m.url);
  }, [mediaFeed]);

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
                  onClick={() => {
                    const newStatus = !isPublished;
                    setIsPublished(newStatus);
                    handleUpdate(newStatus);
                  }}
                  disabled={isLoading}
                  className={`p-3 rounded-xl border transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-sm ${isPublished ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" : "bg-rose-100 text-rose-600 border-rose-200 hover:bg-rose-200"}`}
                >
                  {isLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Power size={14} />
                  )}
                  {isPublished ? "Online" : "Pausado"}
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteAction();
                  }}
                  title="Excluir Vitrine"
                  className="p-3 text-rose-300 hover:text-rose-500 transition-all shadow-sm bg-white rounded-xl border border-rose-100 hover:bg-rose-50"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
            <button
              onClick={() => handleUpdate()}
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
        <div className="space-y-8">
          <IdentitySection
            name={name}
            handleNameChange={handleNameChange}
            nameError={nameError}
            nameRef={nameRef}
            slug={slug}
            handleSlugChange={handleSlugChange}
            slugError={slugError}
            slugRef={slugRef}
            isNew={isNew}
            safeBusinessSlug={safeBusiness.slug}
            profileImage={profileImage}
            setProfileImage={setProfileImage}
            isUploadingLogo={isUploadingLogo}
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
            selectedLayout={selectedLayout}
            setSelectedLayout={setSelectedLayout}
            layoutText={layoutText}
            setLayoutText={setLayoutText}
            selectedTheme={selectedTheme}
            setSelectedTheme={setSelectedTheme}
            filteredThemeKeys={filteredThemeKeys}
          />

          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200 mt-8">
            <MobilePreview
              themeKey={selectedTheme}
              name={name}
              description={description}
              profileImage={profileImage}
              gallery={mockGallery}
              layoutLabel={currentLayoutData.label}
              comercial_badge={layoutText}
              luxe_quote={layoutText}
              urban_tag={layoutText}
              showroom_collection={layoutText}
            />
          </div>

          <SegmentationSection
            categoria={categoria}
            setCategoria={setCategoria}
            selectedSubs={selectedSubs}
            setSelectedSubs={setSelectedSubs}
            keywords={keywords}
            setKeywords={setKeywords}
            tagInput={tagInput}
            setTagInput={setTagInput}
            categoryKeys={categoryKeys}
          />

          <ContentSection
            mediaFeed={mediaFeed}
            setMediaFeed={setMediaFeed}
            description={description}
            setDescription={setDescription}
            features={features}
            setFeatures={setFeatures}
            faqs={faqs}
            setFaqs={setFaqs}
          />
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-4 py-4">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-xs font-black text-slate-300 uppercase tracking-widest">
              Conexões
            </span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200 relative overflow-hidden">
            <ConnectionsSection
              socials={socials}
              setSocials={setSocials}
              whatsapp={whatsapp}
              setWhatsapp={setWhatsapp}
              phone={phone}
              setPhone={setPhone}
              // 🚀 CORREÇÃO AQUI 2: ENTREGAR AS VARIÁVEIS PRO FILHO NÃO DAR ERRO
              hasDelivery={hasDelivery}
              setHasDelivery={setHasDelivery}
            />
          </div>

          <div id="address-section">
            <AddressSection
              addressData={addressData}
              setAddressData={setAddressData}
            />
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
        </div>

        <div className="pt-8 flex flex-col items-center sticky bottom-6 md:bottom-8 z-[60] gap-3 pointer-events-none">
          <div className="pointer-events-auto flex flex-col items-center gap-3 w-full max-w-lg">
            <AnimatePresence>
              {!isPublished && !isLoading && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  className="w-full bg-rose-50 border border-rose-200 p-5 rounded-[2rem] shadow-lg flex flex-col items-center text-center gap-4"
                >
                  <div className="flex items-center gap-2 text-rose-600 font-black uppercase text-xs tracking-widest">
                    <Power size={18} /> Vitrine Offline
                  </div>
                  <p className="text-xs text-rose-700 font-semibold leading-relaxed px-4">
                    Este negócio está invisível para o público. Deseja
                    reativá-lo para aparecer nas buscas antes de salvar?
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsPublished(true);
                      toast.success(
                        "Marcado para ficar Online! Clique em Gravar Mudanças.",
                      );
                    }}
                    className="w-full md:w-auto px-8 bg-emerald-500 text-white py-3 rounded-xl shadow-md font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all flex justify-center items-center gap-2"
                  >
                    <Eye size={16} /> Deixar Online
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => handleUpdate()}
              disabled={isLoading || !hasChanges}
              className={`w-full h-14 md:h-20 rounded-[1.8rem] md:rounded-[2.5rem] flex items-center justify-center gap-3 font-black uppercase text-[10px] md:text-xs transition-all tracking-[0.2em] italic ${
                isLoading || (!hasChanges && !isNew)
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-slate-900 text-white hover:bg-indigo-600 shadow-2xl active:scale-95"
              }`}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : !hasChanges && !isNew ? (
                <CheckCircle2 size={20} className="text-slate-400" />
              ) : (
                <Save size={20} />
              )}

              {isLoading
                ? "Salvando..."
                : !hasChanges && !isNew
                  ? "Tudo Atualizado"
                  : isNew
                    ? "Criar Perfil"
                    : "Gravar Mudanças"}
            </button>
          </div>
        </div>
        {rawImageSrc && (
          <ImageCropperModal
            imageSrc={rawImageSrc}
            onCropComplete={handleCropComplete}
            onClose={() => {
              if (rawImageSrc) URL.revokeObjectURL(rawImageSrc);
              setRawImageSrc(null);
            }}
          />
        )}
      </main>
    </div>
  );
}
