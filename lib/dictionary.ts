// lib/dictionary.ts

export const categoryDictionary: Record<string, string> = {
  // CATEGORIAS PRINCIPAIS
  alimentacao: "Alimentação",
  comercio: "Comércio",
  saude: "Saúde",
  servicos: "Serviços",

  // SUBCATEGORIAS - ALIMENTAÇÃO
  hamburguer: "Hambúrguer",
  "comida saudavel": "Comida Saudável",
  acai: "Açaí",

  // SUBCATEGORIAS - AUTOMOTIVO
  mecanico: "Mecânico",
  "auto eletrica": "Auto Elétrica",
  "estetica automotiva": "Estética Automotiva",
  "auto pecas": "Auto Peças",
  "venda de veiculos": "Venda de Veículos",

  // SUBCATEGORIAS - BELEZA
  salao: "Salão",
  cilios: "Cílios",
  estetica: "Estética",
  depilacao: "Depilação",

  // SUBCATEGORIAS - COMÉRCIO
  acougue: "Açougue",
  calcados: "Calçados",
  eletronicos: "Eletrônicos",

  // SUBCATEGORIAS - PETS
  veterinario: "Veterinário",
  racao: "Ração",

  // SUBCATEGORIAS - PROFISSIONAIS
  imobiliaria: "Imobiliária",
  fotografo: "Fotógrafo",

  // SUBCATEGORIAS - SAÚDE
  clinica: "Clínica",
  medico: "Médico",
  psicologo: "Psicólogo",
  farmacia: "Farmácia",
  otica: "Ótica",

  // SUBCATEGORIAS - SERVIÇOS
  dedetizacao: "Dedetização",
  vidracaria: "Vidraçaria",
};

/**
 * Função para formatar a string de exibição no Front-end.
 * Ela recebe o "slug" (feio), converte para minúsculo e procura no dicionário.
 * Se não achar, ela pelo menos capitaliza a primeira letra para não ficar feio.
 */
export function formatDisplayName(slug: string): string {
  if (!slug) return "";

  // Limpa a string recebida
  const lower = slug.toLowerCase().trim();

  // Se a palavra estiver no nosso dicionário, retorna ela linda
  if (categoryDictionary[lower]) {
    return categoryDictionary[lower];
  }

  // Se a palavra NÃO estiver no dicionário (ex: "Pizza", "Marmita"),
  // ela apenas garante que a primeira letra seja maiúscula.
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}
