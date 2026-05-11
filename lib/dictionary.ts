// lib/dictionary.ts

export const categoryDictionary: Record<string, string> = {
  // --- CATEGORIAS PRINCIPAIS ---
  alimentacao: "Alimentação",
  comercio: "Comércio",
  educacao: "Educação",
  logistica: "Logística",
  saude: "Saúde",
  servicos: "Serviços",

  // --- SUBCATEGORIAS: ALIMENTAÇÃO ---
  "comida saudavel": "Comida Saudável",
  acai: "Açaí",

  // --- SUBCATEGORIAS: AUTOMOTIVO ---
  "oficina mecanica": "Oficina Mecânica",
  "auto eletrica": "Auto Elétrica",
  "lava rapido": "Lava Rápido",
  "estetica automotiva": "Estética Automotiva",
  "som e acessorios": "Som e Acessórios",
  "auto pecas": "Auto Peças",
  "venda de veiculos": "Venda de Veículos",

  // --- SUBCATEGORIAS: BELEZA ---
  "salao de beleza": "Salão de Beleza",
  cilios: "Cílios",
  "clinica de estetica": "Clínica de Estética",
  depilacao: "Depilação",

  // --- SUBCATEGORIAS: COMÉRCIO ---
  acougue: "Açougue",
  "material de construcao": "Material de Construção",
  calcados: "Calçados",
  "assistencia de celular": "Assistência de Celular",
  "moveis e eletro": "Móveis e Eletro",

  // --- SUBCATEGORIAS: EDUCAÇÃO ---
  "reforco escolar": "Reforço Escolar",
  "creche e bercario": "Creche e Berçário",

  // --- SUBCATEGORIAS: EVENTOS ---
  "espaco para festas": "Espaço para Festas",
  "decoracao de festas": "Decoração de Festas",
  "locacao de brinquedos": "Locação de Brinquedos",

  // --- SUBCATEGORIAS: LOGÍSTICA ---
  "fretes e mudancas": "Fretes e Mudanças",
  "locadora de veiculos": "Locadora de Veículos",

  // --- SUBCATEGORIAS: PETS ---
  "clinica veterinaria": "Clínica Veterinária",
  "casa de racao": "Casa de Ração",

  // --- SUBCATEGORIAS: PROFISSIONAIS ---
  imobiliaria: "Imobiliária",
  fotografo: "Fotógrafo",

  // --- SUBCATEGORIAS: SAÚDE ---
  "clinica medica": "Clínica Médica",
  "clinica odontologica": "Clínica Odontológica",
  nutricao: "Nutrição",
  farmacia: "Farmácia",
  otica: "Ótica",
  laboratorio: "Laboratório",

  // --- SUBCATEGORIAS: SERVIÇOS ---
  dedetizacao: "Dedetização",
  vidracaria: "Vidraçaria",
  "assistencia tecnica": "Assistência Técnica",
};

/**
 * Função para formatar a string de exibição no Front-end.
 * Ela recebe o "slug" (feio), converte para minúsculo e procura no dicionário.
 * Se não achar, ela pelo menos capitaliza a primeira letra para não ficar feio.
 */
export function formatDisplayName(slug: string): string {
  if (!slug) return "";

  // Limpa a string recebida para fazer a busca no dicionário
  const lower = slug.toLowerCase().trim();

  // Se a palavra (ou frase) estiver no nosso dicionário, retorna ela formatada com acentos
  if (categoryDictionary[lower]) {
    return categoryDictionary[lower];
  }

  // Se a palavra NÃO estiver no dicionário (ex: "Pizzaria", "Hamburgueria"),
  // ela apenas garante que o texto original seja retornado com a primeira letra maiúscula.
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}
