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
  // 1. IMAGENS (Galeria)
  imageUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 12 },
  })
    .middleware(handleAuth)
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(`✅ Galeria: Usuário ${metadata.userId} enviou ${file.ufsUrl}`);
      return { uploadedBy: metadata.userId };
    }),

  // 2. LOGO (Perfil) e CAPA
  logoUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(handleAuth)
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId };
    }),

  // 3. MEDIA (Reserva)
  mediaUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(handleAuth)
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId };
    }),

// 4. PDF (Catálogo/Cardápio) - ABERTO E SEGURO (O Garbage Collector limpa o lixo!)
  pdfUploader: f({
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(handleAuth)
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(`✅ PDF Catálogo: Usuário ${metadata.userId} enviou ${file.ufsUrl}`);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;