import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  // 1. IMAGENS (Galeria)
  imageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 8 },
  }).onUploadComplete(async ({ file }) => {
    console.log("Upload de imagem finalizado:", file.ufsUrl);
    return { uploadedBy: "user" };
  }),

  // 2. LOGO (Perfil)
  logoUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { uploadedBy: "user" };
  }),

  // 3. MEDIA (Reserva - Agora só aceita imagem)
  mediaUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { uploadedBy: "user" };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
