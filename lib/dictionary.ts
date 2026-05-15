// lib/dictionary.ts

export const categoryDictionary: Record<string, string> = {
  // --- CATEGORIAS PRINCIPAIS ---
  alimentacao: "Alimentação",
  automotivo: "Automotivo",
  beleza: "Beleza",
  comercio: "Comércio",
  educacao: "Educação",
  eventos: "Eventos",
  logistica: "Logística",
  pets: "Pets",
  profissionais: "Profissionais",
  saude: "Saúde",
  servicos: "Serviços",

  // --- SUBCATEGORIAS: ALIMENTAÇÃO ---
  hamburgueria: "Hamburgueria",
  pizzaria: "Pizzaria",
  restaurante: "Restaurante",
  bares: "Bares",
  "comida japonesa": "Comida Japonesa",
  lanches: "Lanches",
  churrascaria: "Churrascaria",
  marmitex: "Marmitex",
  "comida saudavel": "Comida Saudável",
  acai: "Açaí",
  sorveteria: "Sorveteria",
  doceria: "Doceria",
  bolos: "Bolos",
  cafeteria: "Cafeteria",
  padaria: "Padaria",
  adega: "Adega",

  // --- SUBCATEGORIAS: AUTOMOTIVO ---
  "oficina mecanica": "Oficina Mecânica",
  "auto eletrica": "Auto Elétrica",
  "ar condicionado automotivo": "Ar Condicionado Automotivo",
  "lava rapido": "Lava Rápido",
  "estetica automotiva": "Estética Automotiva",
  pneus: "Pneus",
  borracharia: "Borracharia",
  "centro automotivo": "Centro Automotivo",
  "som e acessorios": "Som e Acessórios",
  "auto pecas": "Auto Peças",
  "funilaria e pintura": "Funilaria e Pintura",
  "venda de veiculos": "Venda de Veículos",
  "oficina de motos": "Oficina de Motos",
  guincho: "Guincho",

  // --- SUBCATEGORIAS: BELEZA ---
  "salao de beleza": "Salão de Beleza",
  barbearia: "Barbearia",
  manicure: "Manicure",
  cilios: "Cílios",
  sobrancelha: "Sobrancelha",
  "clinica de estetica": "Clínica de Estética",
  depilacao: "Depilação",
  massagem: "Massagem",
  podologia: "Podologia",
  "tatuagem e piercing": "Tatuagem e Piercing",
  maquiagem: "Maquiagem",

  // --- SUBCATEGORIAS: COMÉRCIO ---
  supermercado: "Supermercado",
  acougue: "Açougue",
  hortifruti: "Hortifruti",
  "material de construcao": "Material de Construção",
  "distribuidora de bebidas": "Distribuidora de Bebidas",
  "moda feminina": "Moda Feminina",
  "moda masculina": "Moda Masculina",
  "moda infantil": "Moda Infantil",
  calcados: "Calçados",
  "loja de celulares": "Loja de Celulares",
  "assistencia de celular": "Assistência de Celular",
  floricultura: "Floricultura",
  papelaria: "Papelaria",
  "variedades e utilidades": "Variedades e Utilidades",
  suplementos: "Suplementos",
  "moveis e eletro": "Móveis e Eletro",

  // --- SUBCATEGORIAS: EDUCAÇÃO ---
  "escola de idiomas": "Escola de Idiomas",
  autoescola: "Autoescola",
  "cursos profissionalizantes": "Cursos Profissionalizantes",
  "reforco escolar": "Reforço Escolar",
  "escola particular": "Escola Particular",
  "creche e bercario": "Creche e Berçário",
  "ensino superior": "Ensino Superior",

  // --- SUBCATEGORIAS: EVENTOS ---
  buffet: "Buffet",
  "espaco para festas": "Espaço para Festas",
  "decoracao de festas": "Decoração de Festas",
  "locacao de brinquedos": "Locação de Brinquedos",
  "doces e salgados": "Doces e Salgados",
  "dj e som": "DJ e Som",

  // --- SUBCATEGORIAS: LOGÍSTICA ---
  "fretes e mudancas": "Fretes e Mudanças",
  "motoboy e entregas": "Motoboy e Entregas",
  transportadora: "Transportadora",
  "transporte executivo": "Transporte Executivo",
  "locadora de veiculos": "Locadora de Veículos",

  // --- SUBCATEGORIAS: PETS ---
  "pet shop": "Pet Shop",
  "clinica veterinaria": "Clínica Veterinária",
  "banho e tosa": "Banho e Tosa",
  "casa de racao": "Casa de Ração",
  "hospedagem pet": "Hospedagem Pet",
  adestramento: "Adestramento",

  // --- SUBCATEGORIAS: PROFISSIONAIS ---
  advogado: "Advogado",
  contador: "Contador",
  arquiteto: "Arquiteto",
  engenheiro: "Engenheiro",
  imobiliaria: "Imobiliária",
  fotografo: "Fotógrafo",
  marketing: "Marketing",
  designer: "Designer",
  "corretor de seguros": "Corretor de Seguros",
  despachante: "Despachante",

  // --- SUBCATEGORIAS: SAÚDE ---
  "clinica medica": "Clínica Médica",
  "clinica odontologica": "Clínica Odontológica",
  psicologia: "Psicologia",
  nutricao: "Nutrição",
  fisioterapia: "Fisioterapia",
  farmacia: "Farmácia",
  otica: "Ótica",
  academia: "Academia",
  pilates: "Pilates",
  laboratorio: "Laboratório",

  // --- SUBCATEGORIAS: SERVIÇOS ---
  eletricista: "Eletricista",
  encanador: "Encanador",
  "limpeza e faxina": "Limpeza e Faxina",
  pintor: "Pintor",
  marceneiro: "Marceneiro",
  jardinagem: "Jardinagem",
  dedetizacao: "Dedetização",
  "ar condicionado residencial": "Ar Condicionado Residencial",
  vidracaria: "Vidraçaria",
  "marido de aluguel": "Marido de Aluguel",
  serralheria: "Serralheria",
  "assistencia tecnica": "Assistência Técnica",
  chaveiro: "Chaveiro",
};

export function formatDisplayName(slug: string): string {
  if (!slug) return "";
  const lower = slug.toLowerCase().trim();
  if (categoryDictionary[lower]) return categoryDictionary[lower];
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}
