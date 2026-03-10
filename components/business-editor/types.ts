export type BusinessHour = {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
};

export interface SocialLinks {
  instagram: string;
  facebook: string;
  tiktok: string;
  website: string;
  shopee: string;
  mercadoLivre: string;
  shein: string;
  ifood: string;
}

export interface AddressData {
  address: string;
  cep: string;
  neighborhood: string;
  city: string;
  state: string;
  number: string;
}
