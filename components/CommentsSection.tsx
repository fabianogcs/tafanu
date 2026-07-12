"use client";

import { useState, useTransition, useRef, useMemo } from "react";
import {
  MessageSquare,
  Trash2,
  Flag,
  Send,
  User,
  Loader2,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { addComment, deleteComment, flagComment } from "@/app/actions";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/LoginModal";

interface CommentsSectionProps {
  businessId: string;
  businessOwnerId: string;
  currentUserId?: string;
  isAdmin?: boolean;
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
  const [rating, setRating] = useState<number>(0); // 🚀 COMEÇA VAZIO (0)
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const mainComments = comments.filter((c) => !c.parentId);

  // 🚀 CÁLCULO DA MÉDIA GERAL DA LOJA
  const averageRating = useMemo(() => {
    const validRatings = mainComments.filter((c) => c.rating && c.rating > 0);
    if (validRatings.length === 0) return 0;
    const sum = validRatings.reduce((acc, curr) => acc + curr.rating!, 0);
    return (sum / validRatings.length).toFixed(1);
  }, [mainComments]);

  // Controle de paginação
  const [visibleCount, setVisibleCount] = useState(5);
  const visibleComments = mainComments.slice(0, visibleCount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      setIsLoginModalOpen(true);
      return toast.error("Faça login para comentar!");
    }
    if (!emailVerified) return toast.error("Verifique seu e-mail primeiro!");

    const isReply = !!replyingTo;
    let finalContent = newComment.trim();

    // 🚀 LÓGICA DE TEXTO OPCIONAL E NOTA OBRIGATÓRIA
    if (isReply) {
      if (!finalContent)
        return toast.warning("A resposta não pode estar vazia.");
    } else {
      if (rating === 0)
        return toast.warning("Selecione uma nota nas estrelas.");
      if (!finalContent) finalContent = "🌟 Avaliação por estrelas"; // Hack para o banco aceitar sem texto
    }

    setIsSubmitting(true);
    try {
      const result = await addComment(
        businessId,
        finalContent,
        replyingTo?.id,
        rating,
      );

      if (result.success) {
        setNewComment("");
        setRating(0); // Reseta a nota para 0
        setReplyingTo(null);
        toast.success("Avaliação publicada!");
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao comentar.");
      }
    } catch (err) {
      toast.error("Ocorreu um erro interno. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja apagar este comentário permanentemente?")) return;
    startTransition(async () => {
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
      const res = await flagComment(id);
      if (res.success) {
        toast.success("Comentário denunciado!");
        router.refresh();
      } else {
        toast.error("Erro ao enviar denúncia.");
      }
    });
  };

  // Renderizador de Estrelas da Lista (Menor e mais limpo)
  const RenderStars = ({ count }: { count: number | null }) => {
    if (!count || count < 1) return null;
    return (
      <div className="flex gap-0.5 items-center ml-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={12}
            className={
              i < count
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-100 text-slate-200"
            }
          />
        ))}
      </div>
    );
  };

  return (
    // 🚀 REDUZIMOS O TAMANHO MÁXIMO (max-w-3xl)
    <section className="w-full max-w-3xl mx-auto">
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* 🚀 REDUZIMOS OS PADDINGS E BORDAS DA CAIXA PRINCIPAL */}
      <div
        ref={commentFormRef}
        className="bg-white rounded-[1.5rem] p-5 sm:p-6 shadow-lg shadow-slate-200/40 border border-slate-100 mb-10 mt-6"
      >
        <div className="flex items-center justify-between mb-5 pb-5 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm shrink-0">
              <MessageSquare size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg md:text-xl font-black text-slate-900 uppercase italic tracking-tight leading-none">
                  Avaliações
                </h3>
                {Number(averageRating) > 0 && (
                  <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100">
                    <Star size={12} className="fill-amber-500 text-amber-500" />
                    <span className="text-xs font-black text-amber-600">
                      {averageRating}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                {mainComments.length} depoimentos
              </p>
            </div>
          </div>
        </div>

        {currentUserId ? (
          emailVerified ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {replyingTo && (
                <div className="flex items-center justify-between bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-500 uppercase">
                    Respondendo:{" "}
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

              {/* 🚀 SELETOR DE ESTRELAS VAZIAS COM OUTLINE */}
              {!replyingTo && (
                <div className="flex flex-col items-start gap-1 p-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Sua nota para este estabelecimento:
                  </span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const starValue = i + 1;
                      const active =
                        hoverRating !== null
                          ? starValue <= hoverRating
                          : starValue <= rating;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setRating(starValue)}
                          onMouseEnter={() => setHoverRating(starValue)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="transition-transform active:scale-90 outline-none p-1"
                        >
                          <Star
                            size={26}
                            strokeWidth={active ? 0 : 1.5}
                            className={
                              active
                                ? "fill-amber-400 text-amber-400 transform scale-110 transition-all"
                                : "text-slate-300 fill-transparent hover:text-amber-200 transition-colors"
                            }
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 🚀 TEXTAREA MENOR E MAIS COMPACTA */}
              <div className="relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  maxLength={500}
                  placeholder={
                    replyingTo
                      ? "Escreva sua resposta..."
                      : "Como foi sua experiência? (Opcional)"
                  }
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all min-h-[80px] pb-8 resize-none"
                  disabled={isSubmitting}
                />
                <span
                  className={`absolute bottom-3 right-4 text-[10px] font-black ${newComment.length >= 500 ? "text-rose-500" : "text-slate-400"}`}
                >
                  {newComment.length} / 500
                </span>
              </div>
              <div className="flex justify-end">
                {/* 🚀 BLOQUEIO INTELIGENTE DO BOTÃO (Blindado com TypeScript) */}
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    isPending ||
                    (replyingTo === null && rating === 0) ||
                    (replyingTo !== null && newComment.trim() === "")
                  }
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-[11px] tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 shadow-md"
                  style={{
                    backgroundColor:
                      !themeColor ||
                      themeColor.includes("-") ||
                      themeColor.toLowerCase() === "#ffffff"
                        ? "#f97316"
                        : themeColor,
                    color: "#ffffff",
                    border: "none",
                  }}
                >
                  {isSubmitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      {replyingTo ? "ENVIAR RESPOSTA" : "ENVIAR"}
                      <Send size={14} className="ml-1" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="py-5 text-center text-amber-600 font-bold text-[11px] uppercase tracking-widest bg-amber-50 rounded-xl border border-amber-100">
              ⚠️ Verifique seu e-mail para avaliar
            </div>
          )
        ) : (
          <div className="py-6 text-center">
            <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mb-2">
              Quer deixar sua avaliação?
            </p>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="text-slate-900 font-black text-xs border-b-2 border-slate-900 pb-0.5 hover:text-emerald-500 hover:border-emerald-500 transition-all"
            >
              FAÇA LOGIN NA SUA CONTA
            </button>
          </div>
        )}
      </div>

      {/* 🚀 LISTA DE COMENTÁRIOS MAIS COMPACTA */}
      <div className="space-y-5 px-1">
        {visibleComments.map((comment) => (
          <div
            key={comment.id}
            className="relative flex gap-3 sm:gap-4 items-start group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-slate-100">
              {comment.user?.image ? (
                <img
                  src={comment.user.image}
                  className="w-full h-full object-cover"
                  alt="avatar"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <User size={20} />
                </div>
              )}
            </div>

            <div className="flex-1 bg-white p-4 sm:p-5 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm transition-all group-hover:shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center flex-wrap gap-1">
                  <h4 className="font-black text-xs sm:text-[13px] text-slate-900 uppercase italic tracking-tight">
                    {comment.user?.name || "Visitante"}
                  </h4>
                  <RenderStars count={comment.rating} />
                </div>
                <span
                  suppressHydrationWarning
                  className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter"
                >
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    locale: ptBR,
                    addSuffix: true,
                  })}
                </span>
              </div>

              <div className="text-[13px] text-slate-600 leading-relaxed font-medium">
                {comment.content}
              </div>

              <div className="flex gap-4 mt-3 pt-3 border-t border-slate-50 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all">
                {(currentUserId === businessOwnerId || isAdmin) &&
                  !comment.parentId && (
                    <button
                      onClick={() => {
                        setReplyingTo({
                          id: comment.id,
                          name: comment.user?.name || "Visitante",
                        });
                        commentFormRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      }}
                      className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                    >
                      <MessageSquare size={10} /> Responder
                    </button>
                  )}

                {(currentUserId === comment.userId || isAdmin) && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={isPending}
                    className="flex items-center gap-1 text-[9px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={10} /> {isPending ? "..." : "Apagar"}
                  </button>
                )}

                {currentUserId &&
                  currentUserId !== comment.userId &&
                  !comment.isFlagged && (
                    <button
                      onClick={() => handleFlag(comment.id)}
                      disabled={isPending}
                      className="flex items-center gap-1 text-[9px] font-black text-amber-500 uppercase tracking-widest hover:text-amber-700 transition-colors"
                    >
                      <Flag size={10} /> {isPending ? "..." : "Denunciar"}
                    </button>
                  )}
              </div>

              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 ml-4 sm:ml-8 space-y-3 border-l-2 border-orange-500/20 pl-3 sm:pl-4">
                  {comment.replies.map((reply: any) => (
                    <div
                      key={reply.id}
                      className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 relative group/reply"
                    >
                      <div className="absolute -left-[0.85rem] sm:-left-[1.1rem] top-4 w-3 h-0.5 bg-orange-500/20" />
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-[9px] text-slate-900 uppercase italic">
                            {reply.user?.name}
                          </span>
                          <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[6px] rounded-sm font-black tracking-widest uppercase">
                            DONO
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            suppressHydrationWarning
                            className="text-[7px] font-bold text-slate-400 uppercase"
                          >
                            {formatDistanceToNow(new Date(reply.createdAt), {
                              locale: ptBR,
                              addSuffix: true,
                            })}
                          </span>
                          {(currentUserId === reply.userId || isAdmin) && (
                            <button
                              onClick={() => handleDelete(reply.id)}
                              disabled={isPending}
                              className="text-rose-400 hover:text-rose-600 transition-colors opacity-0 group-hover/reply:opacity-100"
                            >
                              {isPending ? (
                                <Loader2 size={10} className="animate-spin" />
                              ) : (
                                <Trash2 size={10} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
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

      {mainComments.length > visibleCount && (
        <div className="flex justify-center pt-6 pb-2">
          <button
            onClick={() => setVisibleCount((prev) => prev + 10)}
            className="px-6 py-2.5 rounded-full bg-slate-100 text-slate-600 font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all border border-slate-200 active:scale-95"
          >
            Carregar Mais Avaliações
          </button>
        </div>
      )}
    </section>
  );
}
