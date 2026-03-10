import imageCompression from "browser-image-compression";

export async function compressImage(file: File): Promise<File> {
  // Configurações do espremedor!
  const options = {
    maxSizeMB: 0.3, // O tamanho máximo será cerca de 300kb (perfeito para web)
    maxWidthOrHeight: 1200, // Limita a resolução para HD (ninguém precisa de 4K no celular)
    useWebWorker: true, // Usa o processador do celular para não travar a tela
  };

  try {
    const compressedBlob = await imageCompression(file, options);

    // O compressor devolve um "Blob" (massa de dados). Vamos transformar de volta em "File"
    return new File([compressedBlob], file.name, {
      type: compressedBlob.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("Erro ao comprimir imagem:", error);
    return file; // Se der algum erro maluco, ele envia a original por segurança
  }
}
