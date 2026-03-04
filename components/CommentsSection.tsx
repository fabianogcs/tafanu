"use client";

import { useState, useTransition, useRef } from "react";
import { MessageSquare, Trash2, Flag, Send, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addComment, deleteComment, flagComment } from "@/app/actions";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";

interface CommentsSectionProps {
  businessId: string;
  businessOwnerId: string;
  currentUserId?: string;
  isAdmin?: boolean; // ⬅️ Adicionei para saber se quem vê é o Admin
  emailVerified?: boolean;
  themeColor?: string;
  comments: any[];
}

export default function CommentsSection({
  businessId,
  businessOwnerId,
  currentUserId,
  isAdmin = false,
  emailVerified,
  themeColor = "#0f172a",
  comments = [],
}: CommentsSectionProps) {
  const router = useRouter();
  const commentFormRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const mainComments = comments.filter((c) => !c.parentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return toast.error("Faça login para comentar!");
    if (!emailVerified) return toast.error("Verifique seu e-mail primeiro!");
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    const result = await addComment(
      businessId,
      currentUserId,
      newComment.trim(),
      replyingTo?.id,
    );
    setIsSubmitting(false);

    if (result.success) {
      setNewComment("");
      setReplyingTo(null);
      toast.success("Comentário publicado!");
      router.refresh();
    } else {
      toast.error(result.error || "Erro ao comentar.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja apagar este comentário permanentemente?")) return;
    startTransition(async () => {
      // 🛡️ Versão Segura: O servidor checa se você é dono ou Admin
      const res = await deleteComment(id);
      if (res.success) {
        toast.success("Comentário removido!");
        router.refresh();
      } else {
        toast.error(res.error || "Erro ao remover.");
      }
    });
  };

  const handleFlag = async (id: string) => {
    if (!confirm("Denunciar este comentário para a administração?")) return;
    startTransition(async () => {
      // 🛡️ Versão Segura: Servidor valida a denúncia
      const res = await flagComment(id);
      if (res.success) {
        toast.success("Comentário denunciado!");
        router.refresh();
      } else {
        toast.error("Erro ao enviar denúncia.");
      }
    });
  };

  return (
    <section className="mt-16 w-full max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
            <MessageSquare size={22} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
              Avaliações
            </h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
              {comments.length} depoimentos
            </p>
          </div>
        </div>
      </div>

      {/* CAMPO DE ENVIO */}
      <div
        ref={commentFormRef}
        className="bg-white rounded-[2.5rem] p-4 md:p-6 shadow-xl shadow-slate-200/50 border border-slate-100 mb-12"
      >
        {currentUserId ? (
          emailVerified ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* AVISO DE RESPOSTA (Aparece quando você clica em Responder) */}
              {replyingTo && (
                <div className="flex items-center justify-between bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
                  <p className="text-[10px] font-black text-slate-500 uppercase">
                    Respondendo a:{" "}
                    <span className="text-slate-900">{replyingTo.name}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="text-rose-500 font-bold text-[10px]"
                  >
                    CANCELAR
                  </button>
                </div>
              )}

              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  replyingTo
                    ? "Escreva sua resposta..."
                    : "Como foi sua experiência?"
                }
                className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] p-5 text-sm text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all min-h-[120px] resize-none"
                disabled={isSubmitting}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || isPending || !newComment.trim()}
                  className="flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-black uppercase text-[12px] tracking-[0.2em] transition-all hover:scale-105 active:scale-95 disabled:opacity-30 shadow-xl shadow-orange-900/20"
                  style={{
                    // 🛠️ CORREÇÃO MÁGICA:
                    // Se a cor for uma classe (como text-orange), ou branca, ou vazia...
                    // ...nós usamos uma cor Laranja Viva (#f97316) ou o Azul Escuro (#0f172a)
                    backgroundColor:
                      !themeColor ||
                      themeColor.includes("-") ||
                      themeColor.toLowerCase() === "#ffffff"
                        ? "#f97316" // Um laranja bem bonito e chamativo
                        : themeColor,
                    color: "#ffffff",
                    border: "none",
                  }}
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      {replyingTo ? "ENVIAR RESPOSTA" : "ENVIAR"}
                      <Send size={16} className="ml-1" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="py-6 text-center text-amber-600 font-bold text-xs uppercase tracking-widest bg-amber-50 rounded-2xl border border-amber-100">
              ⚠️ Verifique seu e-mail para comentar
            </div>
          )
        ) : (
          <div className="py-8 text-center">
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">
              Quer deixar sua avaliação?
            </p>
            <button
              onClick={() => router.push("/login")}
              className="text-slate-900 font-black text-sm border-b-2 border-slate-900 pb-1 hover:text-emerald-500 hover:border-emerald-500 transition-all"
            >
              FAÇA LOGIN NA SUA CONTA
            </button>
          </div>
        )}
      </div>

      {/* LISTA DE COMENTÁRIOS */}
      <div className="space-y-8 px-2">
        {mainComments.map((comment) => (
          <div
            key={comment.id}
            className="relative flex gap-4 md:gap-6 items-start group"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0 bg-slate-100">
              {comment.user?.image ? (
                <img
                  src={comment.user.image}
                  className="w-full h-full object-cover"
                  alt="avatar"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <User size={24} />
                </div>
              )}
            </div>

            <div className="flex-1 bg-white p-5 md:p-6 rounded-[2rem] rounded-tl-none border border-slate-100 shadow-sm transition-all group-hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-black text-[13px] md:text-sm text-slate-900 uppercase italic tracking-tight">
                  {comment.user?.name || "Visitante"}
                </h4>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    locale: ptBR,
                    addSuffix: true,
                  })}
                </span>
              </div>

              <div className="text-sm text-slate-600 leading-relaxed font-medium">
                {comment.content}
              </div>

              {/* 🛠️ BOTÕES DE AÇÃO: LÓGICA DE PERMISSÃO ATUALIZADA */}
              <div className="flex gap-4 mt-4 pt-4 border-t border-slate-50 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all">
                {/* BOTÃO RESPONDER: Aparece para o Dono ou Admin em comentários principais */}
                {(currentUserId === businessOwnerId || isAdmin) &&
                  !comment.parentId && (
                    <button
                      onClick={() => {
                        setReplyingTo({
                          id: comment.id,
                          name: comment.user?.name || "Visitante",
                        });

                        // 🚀 O MOTOR NOVO (Suave e preciso):
                        // Ele usa a âncora 'ref' que criamos no passo anterior
                        commentFormRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      }}
                      // 🎨 SEU ESTILO ORIGINAL (Não mexi em nada aqui):
                      className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                    >
                      <MessageSquare size={12} /> Responder
                    </button>
                  )}
                {/* APAGAR: Quem escreveu OU Admin */}
                {(currentUserId === comment.userId || isAdmin) && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={isPending}
                    className="flex items-center gap-1.5 text-[9px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={12} /> {isPending ? "..." : "Apagar"}
                  </button>
                )}

                {/* DENUNCIAR: Admin OU Qualquer um logado (desde que não seja o dono do comentário) */}
                {currentUserId &&
                  currentUserId !== comment.userId &&
                  !comment.isFlagged && (
                    <button
                      onClick={() => handleFlag(comment.id)}
                      disabled={isPending}
                      className="flex items-center gap-1.5 text-[9px] font-black text-amber-500 uppercase tracking-widest hover:text-amber-700 transition-colors"
                    >
                      <Flag size={12} /> {isPending ? "..." : "Denunciar"}
                    </button>
                  )}
              </div>
              {/* --- LISTA DE RESPOSTAS (THREADS) - BLOCO ÚNICO E CORRIGIDO --- */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 ml-6 md:ml-12 space-y-4 border-l-2 border-orange-500/20 pl-4 md:pl-6 animate-in slide-in-from-left-2">
                  {comment.replies.map((reply: any) => (
                    <div
                      key={reply.id}
                      className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 relative group/reply"
                    >
                      {/* Linha conectora visual */}
                      <div className="absolute -left-[1.6rem] top-6 w-4 h-0.5 bg-orange-500/20" />

                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-[10px] text-slate-900 uppercase italic">
                            {reply.user?.name}
                          </span>
                          <span className="px-2 py-0.5 bg-orange-500 text-white text-[7px] rounded-full font-black tracking-widest uppercase">
                            DONO
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[8px] font-bold text-slate-400 uppercase">
                            {formatDistanceToNow(new Date(reply.createdAt), {
                              locale: ptBR,
                              addSuffix: true,
                            })}
                          </span>

                          {/* 🗑️ BOTÃO APAGAR RESPOSTA: Dono da resposta ou Admin podem apagar */}
                          {(currentUserId === reply.userId || isAdmin) && (
                            <button
                              onClick={() => handleDelete(reply.id)}
                              disabled={isPending}
                              className="text-rose-400 hover:text-rose-600 transition-colors opacity-0 group-hover/reply:opacity-100"
                              title="Apagar resposta"
                            >
                              {isPending ? (
                                <Loader2 size={10} className="animate-spin" />
                              ) : (
                                <Trash2 size={12} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
