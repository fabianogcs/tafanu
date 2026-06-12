import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";
import { db } from "@/lib/db"; // 🚀 NOVO: Importamos o banco para checar o usuário

const f = createUploadthing();

const handleAuth = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UploadThingError("Acesso negado. Faça login.");
  }

  // 1. Busca o usuário e a loja (para contar quantos arquivos ele já tem)
  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      businesses: {
        select: { gallery: true, catalogPdf: true },
      },
    },
  });

  if (!dbUser || dbUser.isBanned) {
    throw new UploadThingError("Conta suspensa ou inválida.");
  }

  if (dbUser.role === "VISITANTE") {
    throw new UploadThingError("Apenas assinantes podem fazer upload.");
  }

  // 2. Trava de Segurança: Limite de 1 PDF por loja
  // Se ele já tem um PDF e está tentando subir outro, bloqueamos!
  const business = dbUser.businesses[0]; // Assume que o assinante tem apenas 1 vitrine
  if (business?.catalogPdf) {
    throw new UploadThingError(
      "Você já possui um PDF anexado. Remova o anterior antes de subir um novo.",
    );
  }

  return { userId: session.user.id };
};

export const ourFileRouter = {
  // 1. IMAGENS (Galeria) - Agora aceita até 8MB por foto e 12 fotos
  imageUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 12 }, // 🚀 AUMENTADO PARA 12
  })
    .middleware(handleAuth)
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(
        `✅ Galeria: Usuário ${metadata.userId} enviou ${file.ufsUrl}`,
      );
      return { uploadedBy: metadata.userId };
    }),

  // 2. LOGO (Perfil)
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

  // 4. PDF (Catálogo/Cardápio) - AQUI DENTRO!
  pdfUploader: f({
    pdf: { maxFileSize: "8MB", maxFileCount: 1 }, // 🚀 Corrigido para 8MB para satisfazer o TypeScript
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
