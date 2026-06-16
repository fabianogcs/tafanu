import imageCompression from "browser-image-compression";

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: "image/webp", // 🚀 Otimização Máxima Adicionada
  };

  try {
    const compressedBlob = await imageCompression(file, options);

    // Precisamos garantir que a extensão do arquivo mude para .webp no nome também
    const newFileName = file.name.replace(/\.[^/.]+$/, ".webp");

    return new File([compressedBlob], newFileName, {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("Erro ao comprimir imagem:", error);
    return file;
  }
}
