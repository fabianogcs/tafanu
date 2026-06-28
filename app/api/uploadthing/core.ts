import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const f = createUploadthing();

// 🚀 ALTERAÇÃO DE ELITE: Mudança para Token Bucket para proteger o onboarding
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  // 80 fichas de capacidade máxima (cobre todas as fotos + margem)
  // Refila 10 fichas a cada 1 minuto para uso contínuo moderado
  limiter: Ratelimit.tokenBucket(80, "1 m", 10),
  analytics: true,
});

// 1. O Porteiro Geral (Agora com Escudo Anti-Spam)
const handleAuth = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UploadThingError("Acesso negado. Faça login.");
  }

  // 🛡️ TRAVA 1: Rate Limiting Imediato (Antes mesmo de gastar o PostgreSQL)
  const { success } = await ratelimit.limit(`upload_${session.user.id}`);
  if (!success) {
    console.warn(
      `🚨 [DDoS Bloqueado] Usuário ${session.user.id} está fazendo spam de uploads.`,
    );
    throw new UploadThingError(
      "Muitos uploads em sequência. Aguarde um minuto e tente novamente.",
    );
  }

  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!dbUser || dbUser.isBanned) {
    throw new UploadThingError("Conta suspensa ou inválida.");
  }

  if (dbUser.role === "VISITANTE") {
    throw new UploadThingError("Apenas assinantes podem fazer upload.");
  }

  return { userId: session.user.id };
};

export const ourFileRouter = {
  // 1. IMAGENS (Galeria) - 🛡️ BLINDADO: Apenas formatos seguros, sem SVG!
  imageUploader: f({
    "image/jpeg": { maxFileSize: "4MB", maxFileCount: 12 },
    "image/png": { maxFileSize: "4MB", maxFileCount: 12 },
    "image/webp": { maxFileSize: "4MB", maxFileCount: 12 },
  })
    .middleware(handleAuth)
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(
        `✅ Galeria: Usuário ${metadata.userId} enviou ${file.ufsUrl}`,
      );
      return { uploadedBy: metadata.userId };
    }),

  // 2. LOGO (Perfil) e CAPA - 🛡️ BLINDADO
  logoUploader: f({
    "image/jpeg": { maxFileSize: "4MB", maxFileCount: 1 },
    "image/png": { maxFileSize: "4MB", maxFileCount: 1 },
    "image/webp": { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(handleAuth)
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId };
    }),

  // 3. MEDIA (Reserva) - 🛡️ BLINDADO
  mediaUploader: f({
    "image/jpeg": { maxFileSize: "4MB", maxFileCount: 1 },
    "image/png": { maxFileSize: "4MB", maxFileCount: 1 },
    "image/webp": { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(handleAuth)
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId };
    }),
  // ... (mantenha o seu pdfUploader intacto abaixo disso)
  // 4. PDF (Catálogo/Cardápio) - ABERTO E SEGURO (O Garbage Collector limpa o lixo!)
  pdfUploader: f({
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(handleAuth)
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(
        `✅ PDF Catálogo: Usuário ${metadata.userId} enviou ${file.ufsUrl}`,
      );
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
