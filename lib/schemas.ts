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

  // Redes Sociais - 🚀 BLINDAGEM ANTI-JAVASCRIPT
  instagram: z
    .string()
    .max(255)
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^https?:\/\//i.test(val),
      "Deve ser um link válido (https://...)",
    ),
  facebook: z
    .string()
    .max(255)
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^https?:\/\//i.test(val),
      "Deve ser um link válido (https://...)",
    ),
  tiktok: z
    .string()
    .max(255)
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^https?:\/\//i.test(val),
      "Deve ser um link válido (https://...)",
    ),
  website: z
    .string()
    .max(255)
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^https?:\/\//i.test(val),
      "Deve ser um link válido (https://...)",
    ),

  // --- Novos Canais de Venda ---
  shopee: z
    .string()
    .max(255)
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^https?:\/\//i.test(val),
      "Deve ser um link válido",
    ),
  mercadoLivre: z
    .string()
    .max(255)
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^https?:\/\//i.test(val),
      "Deve ser um link válido",
    ),
  shein: z
    .string()
    .max(255)
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^https?:\/\//i.test(val),
      "Deve ser um link válido",
    ),
  ifood: z
    .string()
    .max(255)
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^https?:\/\//i.test(val),
      "Deve ser um link válido",
    ),

  // 🚀 NOVOS CAMPOS: LINK EXTERNO INTELIGENTE (Mantidos para o novo Hub)
  actionLink: z
    .string()
    .max(1000)
    .optional()
    .nullable()
    .or(z.literal(""))
    .refine(
      (val) => !val || val === "" || /^https?:\/\//i.test(val),
      "Cole o link completo começando com https://",
    ),
  isExternalLink: z.boolean().default(false).optional(),
  catalogPdf: z.string().max(1000).optional().nullable().or(z.literal("")),
  menuMode: z.enum(["PDF", "DIGITAL", "AGENDA"]).default("PDF"), // AGENDA mantida aqui para servir de chave de link

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
            // 🚀 BLINDAGEM DE EMBED: Proíbe injeção de HTML no lugar do link do vídeo
            url: z
              .string()
              .max(1000)
              .optional()
              .or(z.literal(""))
              .refine(
                (val) => !val || val === "" || /^https?:\/\//i.test(val),
                "Cole apenas o link da página, não o código do vídeo.",
              ),
          }),
        )
        .max(30),
    )
    .default([]),

  // --- Listas e Arrays ---
  videos: z.array(z.string().max(1000)).max(5).default([]),
  subcategory: z
    .array(z.string().max(50))
    .max(3, "O limite é de 3 nichos")
    .default([]),

  // 🚀 BLINDAGEM CRÍTICA: Palavras-chave limitadas (10) e tamanho (30).
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
    )
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
    }, z.array(hourSchema).max(7))
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
      .max(20, "Documento muito longo")
      .optional()
      .or(z.literal("")), // 🚀 Agora Visitantes podem ter o campo vazio sem o Zod surtar

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
