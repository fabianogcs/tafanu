"use client";

import { useState } from "react";
import { UploadDropzone } from "@/lib/uploadthing";
import { X, Video, Image as ImageIcon, Save, Loader2 } from "lucide-react";
import { updateBusinessMedia } from "@/app/actions";
import { useRouter } from "next/navigation";

interface MediaFormProps {
  businessSlug: string;
  initialVideo?: string | null;
  initialGallery?: string[];
}

export default function MediaForm({
  businessSlug,
  initialVideo,
  initialGallery,
}: MediaFormProps) {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState(initialVideo || "");
  const [gallery, setGallery] = useState<string[]>(initialGallery || []);
  const [isSaving, setIsSaving] = useState(false);

  // Função para remover uma foto da lista antes de salvar
  const removeImage = (indexToRemove: number) => {
    setGallery((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  // Função para salvar tudo no banco
  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateBusinessMedia(businessSlug, videoUrl, gallery);
    setIsSaving(false);

    if (result.success) {
      alert("Sucesso! Mídia atualizada.");
      router.refresh(); // Atualiza a tela
    } else {
      alert("Erro ao salvar.");
    }
  };

  return (
    <div className="space-y-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
      {/* --- SEÇÃO 1: VÍDEO --- */}
      <div>
        <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
          <Video className="text-tafanu-blue" size={20} />
          Vídeo de Apresentação
        </h3>
        <input
          type="text"
          placeholder="Cole aqui o link do YouTube (ex: https://youtube.com/watch...)"
          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
        <p className="text-xs text-gray-400 mt-2">
          Recomendamos vídeos curtos (até 2 min) mostrando o ambiente.
        </p>
      </div>

      <hr className="border-gray-100" />

      {/* --- SEÇÃO 2: GALERIA DE FOTOS --- */}
      <div>
        <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
          <ImageIcon className="text-tafanu-blue" size={20} />
          Galeria de Fotos ({gallery.length}/8)
        </h3>

        {/* ÁREA DE UPLOAD (Só aparece se tiver espaço) */}
        {gallery.length < 8 ? (
          <UploadDropzone
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              // ATUALIZADO: Mensagem mais clara e lógica de adição
              const newPhotos = res.map((r) => r.url);
              setGallery((prev) => [...prev, ...newPhotos]);
              alert(
                `${newPhotos.length} foto(s) carregada(s)! Clique em Salvar para confirmar.`
              );
            }}
            onUploadError={(error: Error) => {
              // ATUALIZADO: Tratamento de erro melhorado
              console.error(error);
              alert(
                `Erro no upload: Tente enviar menos fotos por vez ou verifique se são menores que 4MB.`
              );
            }}
            className="ut-label:text-blue-500 ut-button:bg-blue-600 ut-button:hover:bg-blue-700 border-dashed border-2 border-gray-300 bg-gray-50 rounded-xl p-8 transition-all hover:bg-gray-100"
          />
        ) : (
          <p className="text-red-500 text-sm font-medium p-4 bg-red-50 rounded-xl text-center">
            Limite de 8 fotos atingido. Remova alguma para adicionar novas.
          </p>
        )}

        {/* PRÉ-VISUALIZAÇÃO DAS FOTOS (Grid) */}
        {gallery.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {gallery.map((url, index) => (
              <div
                key={index}
                className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square"
              >
                <img
                  src={url}
                  alt="Galeria"
                  className="w-full h-full object-cover"
                />

                {/* Botão de Remover (X) */}
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Remover foto"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <hr className="border-gray-100" />

      {/* --- BOTÃO SALVAR --- */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-100 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? (
          <>
            <Loader2 className="animate-spin" /> Salvando...
          </>
        ) : (
          <>
            <Save size={20} /> Salvar Alterações
          </>
        )}
      </button>
    </div>
  );
}
