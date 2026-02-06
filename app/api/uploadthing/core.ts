import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  // 1. IMAGENS (Galeria e Perfil)
  // Limite ajustado para 3MB. Economia máxima.
  imageUploader: f({
    image: { maxFileSize: "3MB", maxFileCount: 8 },
  }).onUploadComplete(async ({ metadata, file }) => {
    console.log("Upload de imagem finalizado:", file.ufsUrl);
    return { uploadedBy: "user" };
  }),

  // 2. VÍDEO DE CAPA (Hero)
  // Limite ajustado para 10MB.
  // Obriga o usuário a usar vídeos curtos (loops), ideal para performance.
  videoUploader: f({
    video: { maxFileSize: "10MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ metadata, file }) => {
    console.log("Upload de vídeo finalizado:", file.ufsUrl);
    return { uploadedBy: "user" };
  }),

  // 3. LOGO
  logoUploader: f({
    image: { maxFileSize: "2MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { uploadedBy: "user" };
  }),

  // 4. HÍBRIDO (Reserva)
  mediaUploader: f({
    image: { maxFileSize: "3MB", maxFileCount: 1 },
    video: { maxFileSize: "10MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { uploadedBy: "user" };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
