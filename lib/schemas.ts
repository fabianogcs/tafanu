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
// 🚀 MOLDE DE SEGURANÇA PARA O CARDÁPIO DIGITAL
const productSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, "O nome do produto é obrigatório")
    .max(60, "Nome muito longo"),
  description: z
    .string()
    .max(250, "A descrição do lanche deve ter no máximo 250 caracteres")
    .optional()
    .or(z.literal("")),
  price: z.coerce.number().min(0, "O preço não pode ser negativo"),
  oldPrice: z.coerce.number().optional().nullable(), // 🚀 LIBERA A ENTRADA DA PROMOÇÃO!
  imageUrl: z.string().max(1000).optional().nullable().or(z.literal("")),
  isActive: z.boolean().default(true),
});
export const businessSchema = z.object({
  // 🚀 BLINDAGEM DO CARDÁPIO: Máximo de 50 itens para não estourar o banco de dados.
  products: z
    .preprocess(
      (val) => {
        if (typeof val === "string") {
          try {
            return JSON.parse(val);
          } catch {
            return [];
          }
        }
        return val || [];
      },
      z.array(productSchema).max(50, "O limite é de 50 produtos no cardápio"),
    )
    .default([]),
  // --- Identificação Básica ---
  // 🚀 BLINDAGEM: Nome não pode ser um livro.
  name: z
    .string()
    .min(3, "O nome deve ter pelo menos 3 letras")
    .max(100, "O nome é muito longo"),

  // 🚀 BLINDAGEM: Slug (URL) não pode ter mais de 60 caracteres.
  slug: z
    .string()
    .min(3, "O endereço (URL) deve ter pelo menos 3 letras")
    .max(60, "URL muito longa"),

  // 🚀 BLINDAGEM: Descrição cravada em 600 caracteres (Igual ao HTML).
  description: z
    .string()
    .max(600, "A descrição deve ter no máximo 600 caracteres")
    .optional()
    .or(z.literal("")),
  category: z.string().min(1, "Selecione uma categoria principal").max(50),

  // --- Estilo e Layout ---
  theme: z.string().default("carbon"),
  layout: z
    .enum(["urban", "editorial", "businessList", "showroom", "influencer"])
    .default("urban"),
  published: z.preprocess((val) => val === "true" || val === true, z.boolean()),
  hasDelivery: z.boolean().default(false).optional(),

  // --- Campos de Texto Especial dos Layouts ---
  // 🚀 BLINDAGEM: O Slogan não pode quebrar o layout da vitrine (Máx 40 caracteres, como no front).
  urban_tag: z.string().max(40).optional().nullable(),
  luxe_quote: z.string().max(40).optional().nullable(),
  showroom_collection: z.string().max(40).optional().nullable(),
  comercial_badge: z.string().max(40).optional().nullable(),

  // --- Localização ---
  // 🚀 BLINDAGEM: Endereços não podem ser textos infinitos.
  address: z.string().max(150).optional().or(z.literal("")),
  number: z.string().max(20).optional().or(z.literal("")),
  complement: z.string().max(100).optional().or(z.literal("")),
  cep: z.string().max(20).optional().or(z.literal("")),
  neighborhood: z.string().max(100).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  state: z.string().max(2).optional().or(z.literal("")), // Estado é sempre a Sigla (SP, RJ, etc)

  // --- Contato ---
  // 🚀 BLINDAGEM: O número máximo de um telefone internacional com formatação.
  whatsapp: z.string().max(20).optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),

  // Redes Sociais
  instagram: z.string().max(255).optional().nullable(),
  facebook: z.string().max(255).optional().nullable(),
  tiktok: z.string().max(255).optional().nullable(),
  website: z.string().max(255).optional().nullable(),

  // --- Novos Canais de Venda ---
  shopee: z.string().max(255).optional().nullable(),
  mercadoLivre: z.string().max(255).optional().nullable(),
  shein: z.string().max(255).optional().nullable(),
  ifood: z.string().max(255).optional().nullable(),
  catalogPdf: z.string().max(1000).optional().nullable().or(z.literal("")),
  menuMode: z.enum(["PDF", "DIGITAL"]).default("PDF"),

  // URLs do UploadThing
  imageUrl: z
    .string()
    .max(1000)
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || val === "" || /^https?:\/\//i.test(val), {
      message: "URL de imagem inválida",
    }),
  coverImage: z
    .string()
    .max(1000)
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || val === "" || /^https?:\/\//i.test(val), {
      message: "URL de capa inválida",
    }),
  gallery: z
    .array(z.string().url().max(1000))
    .max(12, "O limite é de 12 fotos na galeria")
    .default([]),

  mediaFeed: z
    .preprocess(
      (val) => {
        if (typeof val === "string") {
          try {
            return JSON.parse(val);
          } catch {
            return [];
          }
        }
        return val || [];
      },
      z
        .array(
          z.object({
            type: z.string().max(20),
            url: z.string().max(1000).optional().or(z.literal("")),
          }),
        )
        .max(30), // 🚀 BLINDAGEM: Trava o número máximo de itens no feed no Back-end!
    )
    .default([]),

  // --- Listas e Arrays ---
  videos: z.array(z.string().max(1000)).max(5).default([]),
  subcategory: z
    .array(z.string().max(50))
    .max(3, "O limite é de 3 nichos")
    .default([]),

  // 🚀 BLINDAGEM CRÍTICA: Palavras-chave agora têm limite de quantidade (10) E limite de caracteres por palavra (30).
  keywords: z
    .array(z.string().max(30, "Palavra-chave muito longa"))
    .max(10, "Limite de 10 palavras-chave")
    .default([]),

  // 🚀 BLINDAGEM: Diferenciais limitados em quantidade (20) e tamanho do texto (60 letras).
  features: z.array(z.string().max(60)).max(20).default([]),

  faqs: z
    .preprocess(
      (val) => {
        if (typeof val === "string") {
          try {
            return JSON.parse(val);
          } catch {
            return [];
          }
        }
        return val || [];
      },
      z
        .array(
          // 🚀 BLINDAGEM: FAQs com limite de tamanho para a pergunta e resposta!
          z.object({
            q: z
              .string()
              .min(1)
              .max(100, "A pergunta deve ter no máximo 100 caracteres"),
            a: z
              .string()
              .min(1)
              .max(500, "A resposta deve ter no máximo 500 caracteres"),
          }),
        )
        .max(15),
    ) // Máximo de 15 FAQs por loja
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
      return val || [];
    }, z.array(hourSchema).max(7)) // 7 Dias na semana no máximo!
    .default([]),
});
// ==========================================================
// 🛡️ REGRA DE VALIDAÇÃO DO PERFIL DO USUÁRIO
// ==========================================================
export const userProfileSchema = z
  .object({
    name: z
      .string()
      .min(3, "O nome deve ter pelo menos 3 letras")
      .max(100, "O nome é muito longo"),
    email: z.string().email("E-mail inválido").max(100, "E-mail muito longo"),
    phone: z
      .string()
      .min(10, "Telefone inválido (digite com o DDD)")
      .max(20, "Telefone muito longo"),
    document: z
      .string()
      .min(11, "CPF ou CNPJ inválido")
      .max(20, "Documento muito longo"),

    // 🔑 Campo da Nova Senha
    newPassword: z
      .string()
      .min(6, "A nova senha deve ter no mínimo 6 dígitos")
      .max(100, "A senha deve ter no máximo 100 caracteres") // 🚀 PROTEÇÃO ANTI-BCRYPT EXHAUSTION
      .optional()
      .or(z.literal("")),

    // 🔄 Campo de Confirmação
    confirmPassword: z.string().max(100).optional().or(z.literal("")),
  })
  // 🛡️ O PULO DO GATO: Compara os dois campos
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"], // Define que o erro vai aparecer no campo de confirmação
  });
