import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";

const f = createUploadthing();

const handleAuth = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UploadThingError(
      "Acesso negado. Você precisa estar logado para fazer upload.",
    );
  }
  return { userId: session.user.id };
};

export const ourFileRouter = {
  // 1. IMAGENS (Galeria) - Agora aceita até 6MB por foto
  imageUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 8 },
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
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
