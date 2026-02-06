import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  // 1. IMAGENS (Galeria e Perfil)
  // Mudado de 3MB para 4MB (Valor permitido)
  imageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 8 },
  }).onUploadComplete(async ({ metadata, file }) => {
    console.log("Upload de imagem finalizado:", file.ufsUrl);
    return { uploadedBy: "user" };
  }),

  // 2. VÍDEO DE CAPA (Hero)
  // Mudado de 10MB para 16MB (Valor padrão seguro e permitido)
  videoUploader: f({
    video: { maxFileSize: "16MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ metadata, file }) => {
    console.log("Upload de vídeo finalizado:", file.ufsUrl);
    return { uploadedBy: "user" };
  }),

  // 3. LOGO
  // 2MB já é um valor permitido, pode manter.
  logoUploader: f({
    image: { maxFileSize: "2MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { uploadedBy: "user" };
  }),

  // 4. HÍBRIDO (Reserva)
  // Ajustado para 4MB e 16MB
  mediaUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    video: { maxFileSize: "16MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { uploadedBy: "user" };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
