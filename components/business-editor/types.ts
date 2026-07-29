export type BusinessHour = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  openTime2?: string | null; // 🚀 NOVO: 2º Turno
  closeTime2?: string | null; // 🚀 NOVO: 2º Turno
  isClosed: boolean;
};

export interface SocialLinks {
  instagram: string;
  facebook: string;
  tiktok: string;
  website: string;
}

export interface AddressData {
  address: string;
  cep: string;
  neighborhood: string;
  city: string;
  state: string;
  number: string;
  complement?: string; // 🚀 Adicionado para evitar furos de tipagem
}

// 🚀 NOVO TIPO: Adicionado para o TypeScript reconhecer o campo de PDF
export interface ContentData {
  catalogPdf?: string | null;
}
