import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const f = createUploadthing();

// 1. O Porteiro Geral (Apenas checa login e permissões básicas)
const handleAuth = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UploadThingError("Acesso negado. Faça login.");
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
