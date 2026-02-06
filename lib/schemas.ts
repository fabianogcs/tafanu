import { z } from "zod";

// Molde para uma única pergunta do FAQ
const faqSchema = z.object({
  q: z.string().min(1, "A pergunta não pode estar vazia"),
  a: z.string().min(1, "A resposta não pode estar vazia"),
});

// Molde para um item do horário de funcionamento
const hourSchema = z.object({
  dayOfWeek: z.number(), // Agora o Zod sabe que é um número (0 a 6)
  openTime: z.string().optional().or(z.literal("")),
  closeTime: z.string().optional().or(z.literal("")),
  isClosed: z.boolean().optional(),
});

export const businessSchema = z.object({
  // --- Identificação Básica ---
  name: z.string().min(3, "O nome deve ter pelo menos 3 letras"),
  slug: z.string().min(3, "O endereço (URL) deve ter pelo menos 3 letras"),
  description: z
    .string()
    .min(10, "Conte um pouco mais sobre o seu negócio (min. 10 letras)"),
  category: z.string().min(1, "Selecione uma categoria principal"),

  // --- Estilo e Layout ---
  theme: z.string().default("carbon"),
  layout: z
    .enum(["urban", "editorial", "businessList", "showroom", "influencer"])
    .default("urban"),
  published: z.preprocess((val) => val === "true" || val === true, z.boolean()),

  // --- Campos de Texto Especial dos Layouts ---
  urban_tag: z.string().optional().nullable(),
  luxe_quote: z.string().optional().nullable(),
  showroom_collection: z.string().optional().nullable(),
  comercial_badge: z.string().optional().nullable(),

  // --- Localização ---
  address: z.string().min(5, "O endereço parece estar incompleto"),
  city: z.string().min(1, "Informe a cidade"),
  state: z.string().length(2, "Use a sigla do estado (ex: SP)"),

  // --- Contato ---
  // Aceitamos strings e vamos limpar os números no backend
  whatsapp: z.string().min(10, "WhatsApp inválido (digite com o DDD)"),
  phone: z.string().optional().nullable(),

  // Redes Sociais
  instagram: z.string().optional().nullable(),
  facebook: z.string().optional().nullable(),
  tiktok: z.string().optional().nullable(),
  website: z.string().optional().nullable(),

  // --- Mídia ---
  imageUrl: z.string().optional().or(z.literal("")),
  heroImage: z.string().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  gallery: z
    .array(z.string().url())
    .max(8, "O limite é de 8 fotos na galeria")
    .default([]),

  // --- Listas e Arrays ---
  subcategory: z.array(z.string()).default([]),
  keywords: z
    .array(z.string())
    .max(10, "Limite de 10 palavras-chave")
    .default([]),
  features: z.array(z.string()).default([]),

  faqs: z
    .preprocess((val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return [];
        }
      }
      return val || []; // Se já for lista ou for nada, retorna lista
    }, z.array(faqSchema))
    .default([]),

  hours: z
    .preprocess((val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return [];
        }
      }
      return val || []; // Se já for lista ou for nada, retorna lista
    }, z.array(hourSchema))
    .default([]),
});
// ==========================================================
// 🛡️ REGRA DE VALIDAÇÃO DO PERFIL DO USUÁRIO
// ==========================================================
export const userProfileSchema = z
  .object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 letras"),
    email: z.string().email("E-mail inválido"),
    phone: z.string().min(10, "Telefone inválido (digite com o DDD)"),
    document: z.string().min(11, "CPF ou CNPJ inválido"),

    // 🔑 Campo da Nova Senha
    newPassword: z
      .string()
      .min(6, "A nova senha deve ter no mínimo 6 dígitos")
      .optional()
      .or(z.literal("")),

    // 🔄 Campo de Confirmação
    confirmPassword: z.string().optional().or(z.literal("")),
  })
  // 🛡️ O PULO DO GATO: Compara os dois campos
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"], // Define que o erro vai aparecer no campo de confirmação
  });
