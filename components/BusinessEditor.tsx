"use client";
import { toast } from "sonner";
import { IdentitySection } from "./business-editor/IdentitySection";
import { TAFANU_CATEGORIES, layoutInfo } from "./business-editor/constants";
import { BusinessHour } from "./business-editor/types";
import MobilePreview from "@/components/MobilePreview";
import ImageCropperModal from "@/components/ImageCropperModal";
import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { uploadFiles } from "@/lib/uploadthing";
import { AddressSection } from "./business-editor/AddressSection";
import { SegmentationSection } from "./business-editor/SegmentationSection";
import { ContentSection } from "./business-editor/ContentSection";
import { compressImage } from "@/lib/compressImage";
import { ConnectionsSection } from "./business-editor/ConnectionsSection";
import { MenuSection } from "./business-editor/MenuSection";
import {
  Save,
  Loader2,
  Trash2,
  Clock,
  Power,
  Eye,
  Smartphone,
  CheckCircle2,
  X,
  Check,
} from "lucide-react";

import {
  updateFullBusiness,
  updateBusinessHours,
  createBusiness,
  deleteBusiness,
  resetBusiness,
} from "@/app/actions";
import { RefreshCcw } from "lucide-react";
import HoursForm from "@/components/HoursForm";
import { motion, AnimatePresence } from "framer-motion";
import { businessThemes } from "@/lib/themes";
import {
  normalizeBusiness,
  onlyNumbers,
  toSlug,
  cleanHandle,
  cleanSocialHandle,
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
  userRole,
}: {
  business: any;
  isNew?: boolean;
  userRole?: string;
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
  const [showOfflineWarning, setShowOfflineWarning] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  useEffect(() => {
    if (showMobilePreview) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showMobilePreview]);

  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

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

  const handleCropComplete = async (croppedFile: File | Blob) => {
    if (rawImageSrc) URL.revokeObjectURL(rawImageSrc);
    setRawImageSrc(null);
    setIsUploadingLogo(true);

    try {
      const safeFile = new File([croppedFile], "logo-recortada.jpg", {
        type: "image/jpeg",
        lastModified: Date.now(),
      });

      const res = await uploadFiles("logoUploader", {
        files: [safeFile],
      });

      if (res && res.length > 0) {
        setProfileImage(res[0].url || res[0].ufsUrl);
        toast.success("Logo atualizada com sucesso!");
      } else {
        toast.error("O servidor falhou em processar a imagem.");
      }
    } catch (error: any) {
      toast.error(
        `Erro ao subir imagem: ${error?.message || "Erro desconhecido"}`,
      );
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const [name, setName] = useState(safeBusiness.name || "");
  const [slug, setSlug] = useState(safeBusiness.slug || "");
  const [isPublished, setIsPublished] = useState(
    isNew ? false : safeBusiness.published,
  );

  const [mediaFeed, setMediaFeed] = useState<any[]>(() => {
    if (safeBusiness.mediaFeed && safeBusiness.mediaFeed.length > 0) {
      return JSON.parse(JSON.stringify(safeBusiness.mediaFeed));
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
    safeBusiness.imageUrl || "",
  );
  const [coverImage, setCoverImage] = useState<string>(
    safeBusiness.coverImage || "",
  );

  const [catalogPdf, setCatalogPdf] = useState<string | null>(
    safeBusiness.catalogPdf || null,
  );

  const [products, setProducts] = useState<any[]>(() => {
    return safeBusiness.products
      ? JSON.parse(JSON.stringify(safeBusiness.products))
      : [];
  });

  const [menuMode, setMenuMode] = useState<"PDF" | "DIGITAL" | "AGENDA">(
    safeBusiness.menuMode || "DIGITAL",
  );
  // 🚀 O COFRE INDEPENDENTE DA AGENDA
  const [agendaConfig, setAgendaConfig] = useState<any>(() => {
    if (safeBusiness.agendaConfig) return safeBusiness.agendaConfig;
    return {
      duration: 30, // Tempo padrão do serviço
      hours: Array.from({ length: 7 }).map((_, i) => ({
        dayOfWeek: i,
        openTime: "09:00",
        closeTime: "18:00",
        isClosed: i === 0, // Domingo fechado por padrão
      })),
    };
  });
  const [categoria, setCategoria] = useState(() => {
    if (
      isNew ||
      !safeBusiness.category ||
      safeBusiness.category.toLowerCase() === "geral"
    ) {
      return "";
    }
    return safeBusiness.category;
  });

  // 🚀 O CÉREBRO CAMALEÃO: Agora ele reage à Categoria OU ao botão da Agenda!
  const isService = useMemo(() => {
    // 1. Se o dono clicou no botão "Agenda", automaticamente vira um serviço!
    if (menuMode === "AGENDA") return true;

    // 2. Ou se a categoria for de serviços...
    const serviceCategories = [
      "Beleza",
      "Educacao",
      "Eventos",
      "Profissionais",
      "Saude",
      "Servicos",
    ];
    return serviceCategories.includes(categoria);
  }, [categoria, menuMode]); // 🚀 Colocamos o menuMode aqui para ele escutar o clique

  const [selectedSubs, setSelectedSubs] = useState<string[]>(
    safeBusiness.subcategory || [],
  );
  const [keywords, setKeywords] = useState<string[]>(
    safeBusiness.keywords || [],
  );
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

  const [description, setDescription] = useState(
    safeBusiness.description || "",
  );

  const [layoutText, setLayoutText] = useState(
    safeBusiness.urban_tag ||
      safeBusiness.luxe_quote ||
      safeBusiness.showroom_collection ||
      safeBusiness.comercial_badge ||
      "",
  );

  const [features, setFeatures] = useState<string[]>(
    safeBusiness.features || [],
  );

  const [faqs, setFaqs] = useState<{ q: string; a: string }[]>(
    safeBusiness.faqs ? JSON.parse(JSON.stringify(safeBusiness.faqs)) : [],
  );

  const [businessHours, setBusinessHours] = useState<BusinessHour[]>(
    safeBusiness.hours ? JSON.parse(JSON.stringify(safeBusiness.hours)) : [],
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
    instagram: cleanSocialHandle(safeBusiness.instagram),
    facebook: cleanSocialHandle(safeBusiness.facebook),
    tiktok: cleanSocialHandle(safeBusiness.tiktok),
    website: safeBusiness.website || "",
    shopee: safeBusiness.shopee || "",
    mercadoLivre: safeBusiness.mercadoLivre || "",
    shein: safeBusiness.shein || "",
    ifood: safeBusiness.ifood || "",
  });

  const [hasDelivery, setHasDelivery] = useState(
    safeBusiness.hasDelivery || false,
  );
  const [deliveryFee, setDeliveryFee] = useState<number>(
    safeBusiness.deliveryFee || 0,
  );
  const [deliveryRadius, setDeliveryRadius] = useState<number>(
    safeBusiness.deliveryRadius || 0,
  );

  const hasChanges = useMemo(() => {
    if (isNew) return true;

    const initialLayoutText =
      safeBusiness.urban_tag ||
      safeBusiness.luxe_quote ||
      safeBusiness.showroom_collection ||
      safeBusiness.comercial_badge ||
      "";

    const initialCategory =
      !safeBusiness.category || safeBusiness.category.toLowerCase() === "geral"
        ? ""
        : safeBusiness.category;

    const initialLayout = layoutInfo[
      safeBusiness.layout === "influencer" ? "urban" : safeBusiness.layout
    ]
      ? safeBusiness.layout === "influencer"
        ? "urban"
        : safeBusiness.layout
      : "urban";

    const safeMediaFeed =
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
          ];

    // 🚀 A VACINA DA ORDENAÇÃO DE HORÁRIOS
    const mappedSafeHours = (safeBusiness.hours || [])
      .map((h: any) => ({
        dayOfWeek: Number(h.dayOfWeek),
        openTime: h.openTime ? String(h.openTime).slice(0, 5) : "09:00",
        closeTime: h.closeTime ? String(h.closeTime).slice(0, 5) : "18:00",
        isClosed: !!h.isClosed,
      }))
      .sort((a: any, b: any) => a.dayOfWeek - b.dayOfWeek);

    const mappedStateHours = businessHours
      .map((h: any) => ({
        dayOfWeek: Number(h.dayOfWeek),
        openTime: h.openTime ? String(h.openTime).slice(0, 5) : "09:00",
        closeTime: h.closeTime ? String(h.closeTime).slice(0, 5) : "18:00",
        isClosed: !!h.isClosed,
      }))
      .sort((a: any, b: any) => a.dayOfWeek - b.dayOfWeek);

    const mappedSafeProducts = (safeBusiness.products || []).map((p: any) => ({
      name: p.name || "",
      description: p.description || "",
      price: parseFloat(String(p.price || 0).replace(",", ".")) || 0,
      oldPrice: parseFloat(String(p.oldPrice || 0).replace(",", ".")) || 0,
      isActive: p.isActive ?? true,
      imageUrl: p.imageUrl || "",
      extras: p.extras || [],
    }));

    const mappedStateProducts = products.map((p: any) => ({
      name: p.name || "",
      description: p.description || "",
      price: parseFloat(String(p.price || 0).replace(",", ".")) || 0,
      oldPrice: parseFloat(String(p.oldPrice || 0).replace(",", ".")) || 0,
      isActive: p.isActive ?? true,
      imageUrl: p.imageUrl || "",
      extras: p.extras || [],
    }));

    const isBasicDifferent =
      (name || "") !== (safeBusiness.name || "") ||
      (slug || "") !== (safeBusiness.slug || "") ||
      isPublished !== !!safeBusiness.published ||
      (profileImage || "") !== (safeBusiness.imageUrl || "") ||
      (coverImage || "") !== (safeBusiness.coverImage || "") ||
      (catalogPdf || null) !== (safeBusiness.catalogPdf || null) ||
      menuMode !== (safeBusiness.menuMode || "DIGITAL") ||
      categoria !== initialCategory ||
      hasDelivery !== !!safeBusiness.hasDelivery ||
      deliveryFee !== (safeBusiness.deliveryFee || 0) ||
      deliveryRadius !== (safeBusiness.deliveryRadius || 0) ||
      selectedTheme !== safeBusiness.theme ||
      selectedLayout !== initialLayout ||
      (description || "") !== (safeBusiness.description || "") ||
      layoutText !== initialLayoutText ||
      whatsapp !== formatPhoneNumber(safeBusiness.whatsapp || "") ||
      phone !== formatPhoneNumber(safeBusiness.phone || "");

    const isArraysDifferent =
      !isDeepEqual(mediaFeed, safeMediaFeed) ||
      !isDeepEqual(selectedSubs, safeBusiness.subcategory || []) ||
      !isDeepEqual(keywords, safeBusiness.keywords || []) ||
      !isDeepEqual(features, safeBusiness.features || []) ||
      !isDeepEqual(faqs, safeBusiness.faqs || []) ||
      !isDeepEqual(mappedStateHours, mappedSafeHours) ||
      !isDeepEqual(mappedStateProducts, mappedSafeProducts);

    const isSocialsDifferent =
      socials.instagram !== cleanSocialHandle(safeBusiness.instagram) ||
      socials.tiktok !== cleanSocialHandle(safeBusiness.tiktok) ||
      socials.facebook !== cleanSocialHandle(safeBusiness.facebook) ||
      (socials.shopee || "") !== (safeBusiness.shopee || "") ||
      (socials.ifood || "") !== (safeBusiness.ifood || "") ||
      (socials.mercadoLivre || "") !== (safeBusiness.mercadoLivre || "") ||
      (socials.shein || "") !== (safeBusiness.shein || "") ||
      (socials.website || "") !== (safeBusiness.website || "");

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
    coverImage,
    catalogPdf,
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
    hasDelivery,
    deliveryFee,
    deliveryRadius,
    products,
    menuMode,
  ]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges && !isNew) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges, isNew]);

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
      setName(safeBusiness.name || "");
      setSlug(safeBusiness.slug || "");
      setMediaFeed(
        safeBusiness.mediaFeed && safeBusiness.mediaFeed.length > 0
          ? JSON.parse(JSON.stringify(safeBusiness.mediaFeed))
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
      setProfileImage(safeBusiness.imageUrl || "");
      setCoverImage(safeBusiness.coverImage || "");
      setCatalogPdf(safeBusiness.catalogPdf || null);
      setMenuMode(safeBusiness.menuMode || "DIGITAL");
      setProducts(
        safeBusiness.products
          ? JSON.parse(JSON.stringify(safeBusiness.products))
          : [],
      );
      setIsPublished(safeBusiness.published);
      setWhatsapp(formatPhoneNumber(safeBusiness.whatsapp || ""));
      setPhone(formatPhoneNumber(safeBusiness.phone || ""));

      setCategoria(
        !safeBusiness.category ||
          safeBusiness.category.toLowerCase() === "geral"
          ? ""
          : safeBusiness.category,
      );

      setSelectedSubs(
        safeBusiness.subcategory ? [...safeBusiness.subcategory] : [],
      );
      setKeywords(safeBusiness.keywords ? [...safeBusiness.keywords] : []);

      const initialLayout = layoutInfo[
        safeBusiness.layout === "influencer" ? "urban" : safeBusiness.layout
      ]
        ? safeBusiness.layout === "influencer"
          ? "urban"
          : safeBusiness.layout
        : "urban";
      setSelectedLayout(initialLayout);
      setSelectedTheme(safeBusiness.theme);
      setDescription(safeBusiness.description || "");
      setLayoutText(
        safeBusiness.urban_tag ||
          safeBusiness.luxe_quote ||
          safeBusiness.showroom_collection ||
          safeBusiness.comercial_badge ||
          "",
      );

      setFeatures(safeBusiness.features ? [...safeBusiness.features] : []);
      setFaqs(
        safeBusiness.faqs ? JSON.parse(JSON.stringify(safeBusiness.faqs)) : [],
      );
      setBusinessHours(
        safeBusiness.hours
          ? JSON.parse(JSON.stringify(safeBusiness.hours))
          : [],
      );

      setSocials({
        instagram: cleanSocialHandle(safeBusiness.instagram),
        facebook: cleanSocialHandle(safeBusiness.facebook),
        tiktok: cleanSocialHandle(safeBusiness.tiktok),
        website: safeBusiness.website || "",
        shopee: safeBusiness.shopee || "",
        mercadoLivre: safeBusiness.mercadoLivre || "",
        shein: safeBusiness.shein || "",
        ifood: safeBusiness.ifood || "",
      });

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
      setDeliveryFee(safeBusiness.deliveryFee || 0);
      setDeliveryRadius(safeBusiness.deliveryRadius || 0);
      hasInitialized.current = true;
    }
  }, [safeBusiness, isNew]);

  const currentLayoutData = layoutInfo[selectedLayout] || layoutInfo["urban"];

  const handleDeleteAction = async () => {
    const confirmDelete = window.confirm(
      "⚠️ ATENÇÃO: Tem certeza que deseja excluir esta vitrine PERMANENTEMENTE?\n\nIsso apagará todos os dados do banco e cancelará assinaturas vinculadas.",
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

  const handleResetAction = async () => {
    const confirmReset = window.confirm(
      "⚠️ ATENÇÃO: Isso apagará todas as fotos, vídeos e textos desta vitrine para você recomeçar.\n\nO nome do negócio e o seu link atual serão mantidos. Deseja continuar?",
    );
    if (!confirmReset) return;

    setIsLoading(true);
    try {
      const res = await resetBusiness(safeBusiness.slug);
      if (res.success) {
        toast.success(res.message);
        window.location.reload();
      } else {
        toast.error(res.error || "Erro ao resetar.");
      }
    } catch (error) {
      toast.error("Ops! Algo deu errado ao tentar resetar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveClick = () => {
    if (!isPublished) {
      setShowOfflineWarning(true);
    } else {
      handleUpdate();
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

    if (
      !categoria ||
      categoria.trim() === "" ||
      categoria.toLowerCase() === "geral"
    ) {
      toast.error(
        "Por favor, escolha uma Segmentação (Ramo Principal) para o seu anúncio.",
        { id: "erro-categoria-vazia" },
      );
      document
        .getElementById("segmentation-section")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (!selectedSubs || selectedSubs.length === 0) {
      toast.error(
        "Por favor, escolha pelo menos 1 Nicho dentro da sua segmentação.",
        { id: "erro-subcategoria-vazia" },
      );
      document
        .getElementById("segmentation-section")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
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
          ? `https://instagram.com/${socials.instagram}`
          : "",
        facebook: socials.facebook
          ? `https://facebook.com/${socials.facebook}`
          : "",
        tiktok: socials.tiktok ? `https://tiktok.com/@${socials.tiktok}` : "",
        shopee: socials.shopee?.trim()
          ? `https://${socials.shopee.trim().replace(/^(https?:\/\/)+/gi, "")}`
          : "",
        mercadoLivre: socials.mercadoLivre?.trim()
          ? `https://${socials.mercadoLivre.trim().replace(/^(https?:\/\/)+/gi, "")}`
          : "",
        shein: socials.shein?.trim()
          ? `https://${socials.shein.trim().replace(/^(https?:\/\/)+/gi, "")}`
          : "",
        ifood: socials.ifood?.trim()
          ? `https://${socials.ifood.trim().replace(/^(https?:\/\/)+/gi, "")}`
          : "",
        website: socials.website?.trim()
          ? `https://${socials.website.trim().replace(/^(https?:\/\/)+/gi, "")}`
          : "",

        hasDelivery: hasDelivery,
        deliveryFee: deliveryFee,
        deliveryRadius: deliveryRadius,

        mediaFeed: mediaFeed.filter(
          (m: any) => typeof m.url === "string" && m.url.trim() !== "",
        ),
        imageUrl: profileImage,
        coverImage: coverImage,
        catalogPdf: catalogPdf,
        menuMode: menuMode,
        agendaConfig: agendaConfig,
        products: products.filter((p: any) => p.name.trim() !== ""),
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
            return; // 🚀 BARREIRA DE SEGURANÇA: Se der erro, ele PARA AQUI.
          }
          throw new Error(result.error);
        }

        // 🚀 SUCESSO VERDADEIRO (LOJA NOVA)
        const fireConfetti = (await import("canvas-confetti")).default;
        fireConfetti();
        toast.success("Seu negócio foi criado com sucesso!");
        router.push("/dashboard");
        router.refresh();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return; // Finaliza o processo com sucesso real.
      } else {
        // --- FLUXO DE EDIÇÃO DE UMA LOJA JÁ EXISTENTE ---
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
          return; // 🚀 BARREIRA DE SEGURANÇA: Se der erro, ele PARA AQUI. Não tem confete fantasma.
        }

        // 🚀 SUCESSO VERDADEIRO (EDIÇÃO)
        const fireConfetti = (await import("canvas-confetti")).default;
        fireConfetti();
        toast.success("Alterações salvas com sucesso!");

        hasInitialized.current = false;

        if (updateResult.newSlug && updateResult.newSlug !== business.slug) {
          router.push(`/dashboard/editar/${updateResult.newSlug}`);
        } else {
          router.refresh();
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
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
            <button
              type="button"
              onClick={() => {
                const newStatus = !isPublished;
                setIsPublished(newStatus);
                if (!isNew) {
                  handleUpdate(newStatus);
                }
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
                  onClick={(e) => {
                    e.preventDefault();
                    handleResetAction();
                  }}
                  title="Limpar Vitrine (Zerar tudo)"
                  className="p-3 text-amber-500 hover:text-amber-600 transition-all shadow-sm bg-white rounded-xl border border-amber-200 hover:bg-amber-50"
                >
                  <RefreshCcw size={18} />
                </button>
                {userRole === "ADMIN" && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteAction();
                    }}
                    title="Exclusão Definitiva do Banco (Apenas Admin)"
                    className="p-3 text-rose-400 hover:text-rose-600 transition-all shadow-sm bg-white rounded-xl border border-rose-200 hover:bg-rose-50"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </>
            )}
            <button
              onClick={handleSaveClick}
              disabled={
                isLoading ||
                isUploadingLogo ||
                isUploadingGallery ||
                (!hasChanges && !isNew)
              }
              className={`hidden md:flex items-center gap-3 px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-sm ${
                isLoading ||
                isUploadingLogo ||
                isUploadingGallery ||
                (!hasChanges && !isNew)
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
          {/* 🚀 1. IDENTIDADE VISUAL E CORES */}
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
            coverImage={coverImage}
            setCoverImage={setCoverImage}
            isUploadingLogo={isUploadingLogo}
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
            selectedLayout={selectedLayout}
            setSelectedLayout={setSelectedLayout}
            selectedTheme={selectedTheme}
            setSelectedTheme={setSelectedTheme}
            filteredThemeKeys={filteredThemeKeys}
          />

          {/* 🚀 2. SEGMENTAÇÃO (Categorias e Palavras-chave) */}
          <div id="segmentation-section">
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
          </div>

          {/* 🚀 3. CONTEÚDO (Sobre o Negócio, Frase de Impacto, Mídia e FAQ) */}
          <ContentSection
            mediaFeed={mediaFeed}
            setMediaFeed={setMediaFeed}
            description={description}
            setDescription={setDescription}
            features={features}
            setFeatures={setFeatures}
            faqs={faqs}
            setFaqs={setFaqs}
            isUploadingGallery={isUploadingGallery}
            setIsUploadingGallery={setIsUploadingGallery}
            layoutText={layoutText}
            setLayoutText={setLayoutText}
            selectedLayout={selectedLayout}
          />
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-4 py-4">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-xs font-black text-slate-300 uppercase tracking-widest">
              Conexões & Loja
            </span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          {/* 🚀 4. CONEXÕES, FRETE E MARKETPLACES */}
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-200 relative overflow-hidden">
            <ConnectionsSection
              socials={socials}
              setSocials={setSocials}
              whatsapp={whatsapp}
              setWhatsapp={setWhatsapp}
              phone={phone}
              setPhone={setPhone}
              hasDelivery={hasDelivery}
              setHasDelivery={setHasDelivery}
              deliveryFee={deliveryFee}
              setDeliveryFee={setDeliveryFee}
              deliveryRadius={deliveryRadius}
              setDeliveryRadius={setDeliveryRadius}
              isService={isService}
            />
          </div>

          {/* 🚀 5. A LOJA (Cardápio ou PDF) */}
          <MenuSection
            menuMode={menuMode}
            setMenuMode={setMenuMode}
            catalogPdf={catalogPdf}
            setCatalogPdf={setCatalogPdf}
            products={products}
            setProducts={setProducts}
            isService={isService}
            agendaConfig={agendaConfig} // 🚀 ENVIA PARA A TELA
            setAgendaConfig={setAgendaConfig}
          />

          {/* 🚀 6. ENDEREÇO */}
          <div id="address-section">
            <AddressSection
              addressData={addressData}
              setAddressData={setAddressData}
            />
          </div>

          {/* 🚀 7. HORÁRIOS */}
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

        <div className="pt-8 flex flex-col items-center sticky bottom-6 md:bottom-8 z-30 gap-3 pointer-events-none px-4">
          <div className="pointer-events-auto flex flex-col items-center gap-3 w-full max-w-lg relative">
            <AnimatePresence mode="wait">
              {showOfflineWarning && !isLoading ? (
                <motion.div
                  key="warning-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full bg-white border-2 border-rose-200 p-6 md:p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center gap-4 origin-bottom"
                >
                  <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-[-10px]">
                    <Power size={28} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase text-slate-800 tracking-widest">
                      Sua vitrine está oculta
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-2 px-2">
                      Sua loja ainda não aparece nas buscas. Deseja deixá-la
                      online agora junto com suas edições?
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowOfflineWarning(false);
                        handleUpdate(false);
                      }}
                      className="flex-1 px-4 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
                    >
                      Manter Oculta
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsPublished(true);
                        setShowOfflineWarning(false);
                        handleUpdate(true);
                      }}
                      className="flex-1 px-4 py-4 bg-emerald-500 text-white rounded-2xl shadow-md font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all flex justify-center items-center gap-2"
                    >
                      <Eye size={16} /> Publicar e Salvar
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  key="save-button"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  onClick={handleSaveClick}
                  disabled={
                    isLoading ||
                    isUploadingLogo ||
                    isUploadingGallery ||
                    (!hasChanges && !isNew)
                  }
                  className={`w-full h-14 md:h-20 rounded-[1.8rem] md:rounded-[2.5rem] flex items-center justify-center gap-3 font-black uppercase text-[10px] md:text-xs transition-all tracking-[0.2em] italic pointer-events-auto ${
                    isLoading ||
                    isUploadingLogo ||
                    isUploadingGallery ||
                    (!hasChanges && !isNew)
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
                </motion.button>
              )}
            </AnimatePresence>
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
        <div className="hidden lg:flex fixed bottom-8 right-6 2xl:right-16 origin-bottom-right scale-[0.55] hover:scale-[0.85] transition-all duration-500 z-50 flex-col items-center gap-4 bg-white/70 backdrop-blur-2xl p-5 rounded-[3.5rem] shadow-2xl border border-white/80">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white px-4 py-2 rounded-full shadow-sm">
            Visualização Real
          </span>
          <div className="pointer-events-none">
            <MobilePreview
              themeKey={selectedTheme}
              name={name}
              description={description}
              profileImage={profileImage}
              coverImage={coverImage}
              gallery={mockGallery}
              layoutLabel={currentLayoutData.label}
              comercial_badge={layoutText}
              luxe_quote={layoutText}
              urban_tag={layoutText}
              showroom_collection={layoutText}
            />
          </div>
        </div>

        {/* 🚀 FAB MOBILE */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setShowMobilePreview(true);
          }}
          className="flex lg:hidden fixed bottom-28 right-4 z-40 bg-indigo-600 text-white w-14 h-14 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:bg-indigo-700 active:scale-90 transition-all justify-center items-center border-2 border-white/20"
        >
          <Eye size={24} />
        </button>
      </main>

      {/* 🚀 MODAL DO PREVIEW MOBILE */}
      {isMounted && typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {showMobilePreview && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-[999999] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center h-[100dvh] w-screen lg:hidden"
                  onClick={() => setShowMobilePreview(false)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMobilePreview(false);
                    }}
                    className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md text-white transition-all active:scale-90 border border-white/10 z-[10000]"
                  >
                    <X size={24} />
                  </button>

                  <div className="absolute top-8 left-0 right-0 flex justify-center pointer-events-none">
                    <h2 className="text-white font-black uppercase tracking-widest text-[10px] drop-shadow-md flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/10">
                      <Smartphone size={14} /> Visualização Real
                    </h2>
                  </div>

                  <div
                    className="flex flex-row items-center justify-center w-full mt-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="scale-[0.70] sm:scale-[0.75] origin-center pointer-events-none flex-shrink-0 -mr-6 sm:-mr-2 ml-[-1rem]">
                      <MobilePreview
                        themeKey={selectedTheme}
                        name={name}
                        description={description}
                        profileImage={profileImage}
                        coverImage={coverImage}
                        gallery={mockGallery}
                        layoutLabel={currentLayoutData.label}
                        comercial_badge={layoutText}
                        luxe_quote={layoutText}
                        urban_tag={layoutText}
                        showroom_collection={layoutText}
                      />
                    </div>

                    <div className="flex flex-col items-center h-[420px] bg-white rounded-[2rem] py-5 px-2 border border-slate-200 shadow-2xl relative z-50">
                      <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest text-center mb-4">
                        Cores
                      </p>
                      <div className="flex flex-col gap-4 overflow-y-auto w-full flex-1 snap-y no-scrollbar items-center justify-start px-1 pb-4">
                        {filteredThemeKeys.map((key) => {
                          const isActive = selectedTheme === key;
                          const themeData = businessThemes[key];

                          return (
                            <button
                              key={key}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTheme(key);
                              }}
                              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full shrink-0 transition-all relative flex items-center justify-center ${
                                isActive
                                  ? "ring-2 ring-offset-2 ring-slate-900 scale-90"
                                  : "hover:scale-110 shadow-sm"
                              }`}
                              style={{
                                background: themeData?.previewColor || "#ccc",
                              }}
                            >
                              {isActive && (
                                <Check
                                  size={18}
                                  strokeWidth={3}
                                  className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
}
