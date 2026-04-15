"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { updateUserNameInline } from "@/app/actions";
import { toast } from "sonner";

export default function EditableUserName({
  initialName,
  canEdit = false, // Só vamos liberar para visitantes
}: {
  initialName: string;
  canEdit?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Foco automático no input quando entra no modo edição
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (name.trim() === initialName) {
      setIsEditing(false);
      return;
    }

    if (name.trim().length < 3) {
      toast.error("O nome deve ter pelo menos 3 letras.");
      return;
    }

    setIsSaving(true);
    const result = await updateUserNameInline(name);

    if (result.success) {
      toast.success("Nome atualizado!");
      setIsEditing(false);
    } else {
      toast.error(result.error || "Erro ao salvar.");
      setName(initialName); // Reseta se der erro
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    setName(initialName);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 mt-1">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          className="w-32 bg-slate-800 text-white text-sm font-bold px-2 py-1 rounded outline-none focus:ring-2 focus:ring-emerald-500 transition-all border border-slate-700"
          placeholder="Seu nome"
        />
        {isSaving ? (
          <Loader2 size={16} className="text-emerald-500 animate-spin" />
        ) : (
          <div className="flex gap-1">
            <button
              onClick={handleSave}
              className="text-emerald-400 hover:text-emerald-300"
            >
              <Check size={16} />
            </button>
            <button
              onClick={handleCancel}
              className="text-rose-400 hover:text-rose-300"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2 mt-1 cursor-default w-full">
      <h1
        className={`text-lg font-bold text-white leading-tight truncate max-w-[140px] ${canEdit ? "cursor-pointer hover:text-emerald-400 transition-colors" : ""}`}
        onClick={() => canEdit && setIsEditing(true)}
        title={canEdit ? "Clique para alterar seu nome" : ""}
      >
        {name}
      </h1>
      {canEdit && (
        <button
          onClick={() => setIsEditing(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-emerald-400 p-1"
          title="Alterar nome"
        >
          <Pencil size={14} />
        </button>
      )}
    </div>
  );
}
