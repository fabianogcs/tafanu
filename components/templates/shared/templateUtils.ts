import { toast } from "sonner";

export const handleShare = async (businessName: string) => {
  const url = typeof window !== "undefined" ? window.location.href : "";
  if (navigator.share) {
    try {
      await navigator.share({
        title: businessName,
        text: `Confira o perfil de ${businessName} no Tafanu:`,
        url,
      });
      return;
    } catch (err) {}
  }
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  }
};

export const formatPhoneNumber = (phone?: string | null) => {
  const cleaned = (phone || "").replace(/\D/g, "");
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
  if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;
  const matchFixo = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
  if (matchFixo) return `(${matchFixo[1]}) ${matchFixo[2]}-${matchFixo[3]}`;
  return phone || "";
};

export const formatExternalLink = (url: string) => {
  if (!url) return "";
  const clean = url.trim();
  return /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
};

export const buildWhatsappUrl = (
  rawNumber: string,
  businessName: string,
): string => {
  const cleanNumber = (rawNumber || "").replace(/\D/g, "");
  if (!cleanNumber) return "";
  const numberWithDDI = cleanNumber.startsWith("55")
    ? cleanNumber
    : `55${cleanNumber}`;
  const message = `Olá! Vi o perfil de ${businessName} no Tafanu.`;
  return `https://wa.me/${numberWithDDI}?text=${encodeURIComponent(message)}`;
};
