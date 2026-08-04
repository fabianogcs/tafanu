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
  CornerDownRight, // 🚀 NOVO ÍCONE: Para indicar resposta do dono
  Filter, // 🚀 NOVO ÍCONE: Para o cabeçalho de filtros
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
  businessRating?: number;
}

// Mapa de ícones de emoji para as notas
const RATING_EMOJIS = ["😡", "🙁", "😐", "🙂", "😍"];

export default function CommentsSection({
  businessId,
  businessOwnerId,
  currentUserId,
  isAdmin = false,
  emailVerified,
  themeColor = "#0f172a",
  comments = [],
  businessRating = 0,
}: CommentsSectionProps) {
  const router = useRouter();
  const commentFormRef = useRef<HTMLDivElement>(null);

  const [isPending, startTransition] = useTransition();
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 🚀 NOVO ESTADO: Filtro de estrela selecionado
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | null>(
    null,
  );

  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // 🚀 UX PREMIUM: Tema Seguro para botões
  const safeThemeColor = useMemo(() => {
    if (
      !themeColor ||
      themeColor.includes("-") ||
      themeColor.toLowerCase() === "#ffffff"
    ) {
      return "#f97316"; // Laranja Tafanu padrão
    }
    return themeColor;
  }, [themeColor]);

  // 🚀 CTO LOGIC: Cálculo de estatísticas dinâmicas
  const {
    filteredMainComments,
    ratingDistribution,
    totalRatedComments,
    dynamicAverage,
  } = useMemo(() => {
    const mains = comments.filter((c) => !c.parentId);
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRated = 0;
    let sumRating = 0; // 🚀 FIX: Vamos somar as notas reais da tela!

    mains.forEach((c) => {
      if (c.rating && c.rating >= 1 && c.rating <= 5) {
        distribution[c.rating as 5 | 4 | 3 | 2 | 1]++;
        totalRated++;
        sumRating += c.rating;
      }
    });

    let filtered = mains;
    if (selectedStarFilter !== null) {
      filtered = mains.filter((c) => c.rating === selectedStarFilter);
    }

    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // 🚀 FIX: A média agora é baseada na soma real da tela. Se tiver 1 nota 5, a média será 5.0!
    const calculatedAverage =
      totalRated > 0 ? (sumRating / totalRated).toFixed(1) : "0.0";

    return {
      filteredMainComments: filtered,
      ratingDistribution: distribution,
      totalRatedComments: totalRated,
      dynamicAverage: calculatedAverage,
    };
  }, [comments, selectedStarFilter]);

  // Controle de paginação (baseado na lista filtrada)
  const [visibleCount, setVisibleCount] = useState(5);
  const visibleComments = filteredMainComments.slice(0, visibleCount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      setIsLoginModalOpen(true);
      return toast.error("Faça login para comentar!");
    }
    if (!emailVerified) return toast.error("Verifique seu e-mail primeiro!");

    const isReply = !!replyingTo;
    let finalContent = newComment.trim();

    if (isReply) {
      if (!finalContent)
        return toast.warning("A resposta não pode estar vazia.");
    } else {
      if (rating === 0)
        return toast.warning("Selecione uma nota nas estrelas.");
      if (!finalContent) finalContent = "🌟 Avaliação por estrelas";
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
        setRating(0);
        setReplyingTo(null);
        toast.success("Avaliação publicada!");
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao comentar.");
      }
    } catch (err) {
      toast.error("Ocorreu um erro interno.");
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
    if (!confirm("Denunciar este comentário?")) return;
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

  const RenderStars = ({ count }: { count: number | null }) => {
    if (!count || count < 1) return null;
    return (
      <div className="flex gap-0.5 items-center">
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
    // 🚀 UX FIX: Container alinhado com a Hero (max-w-[1500px])
    <section className="w-full max-w-[1500px] mx-auto px-6 lg:px-12 xl:px-16 mt-16 md:mt-24 mb-16 relative z-20 animate-in fade-in duration-700">
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-8 xl:gap-12 mt-8 md:mt-10">
        {/* =========================================================================
            LADO ESQUERDO: LISTA DE COMENTÁRIOS E FILTROS PREMIUM
            ========================================================================= */}
        <div className="order-2 lg:order-1 flex flex-col gap-6">
          {/* 🚀 PAINEL UNIFICADO: CABEÇALHO + FILTROS (Blindado contra fundos escuros!) */}
          <div className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 mb-2">
            {/* CABEÇALHO (Agora protegido pelo fundo branco) */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center text-white shadow-md shrink-0">
                <MessageSquare size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase italic tracking-tight leading-none mb-1">
                  Opinião dos Clientes
                </h2>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">
                  {filteredMainComments.length !== totalRatedComments ? (
                    <>
                      Exibindo {filteredMainComments.length} de{" "}
                      {totalRatedComments} avaliações
                    </>
                  ) : (
                    <>Total de {totalRatedComments} depoimentos reais</>
                  )}
                </p>
              </div>
            </div>

            {/* FILTROS E NOTAS (Só aparece se tiver comentários) */}
            {totalRatedComments > 0 && (
              <>
                <hr className="border-slate-100 my-5 md:my-6" />

                {/* 🚀 UX MOBILE FIX: Mudei para flex-row no mobile, lado a lado para evitar grosseria */}
                <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
                  {/* 🚀 NOTA GRANDE E ESTRELAS FRACIONADAS */}
                  <div className="flex flex-row md:flex-col items-center justify-center md:items-start md:border-r md:border-slate-100 md:pr-8 gap-4 md:gap-1">
                    {/* 🚀 UX FIX: Tamanho reduzido para text-5xl (mobile) e text-6xl (desktop) */}
                    <div className="text-5xl md:text-6xl font-black text-slate-950 leading-none tracking-tighter">
                      {dynamicAverage}
                    </div>

                    <div className="flex flex-col items-start justify-center">
                      <div className="flex items-center gap-1 mb-1">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const currentStar = i + 1;
                          const avg = Number(dynamicAverage);
                          let fillPercent = 0;

                          // Lógica Premium de Preenchimento Fracionado
                          if (avg >= currentStar) fillPercent = 100;
                          else if (avg >= currentStar - 1)
                            fillPercent = (avg % 1) * 100;

                          return (
                            <div
                              key={i}
                              className="relative w-4 h-4 md:w-5 md:h-5"
                            >
                              {/* Estrela Cinza de Fundo */}
                              <Star
                                className="absolute inset-0 text-slate-200 fill-slate-100 w-full h-full"
                                strokeWidth={1.5}
                              />
                              {/* Estrela Dourada Preenchida (Cortada pela porcentagem) */}
                              <div
                                className="absolute top-0 left-0 h-full overflow-hidden"
                                style={{ width: `${fillPercent}%` }}
                              >
                                <Star
                                  className="text-amber-400 fill-amber-400 w-4 h-4 md:w-5 md:h-5"
                                  strokeWidth={1.5}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                        {totalRatedComments}{" "}
                        {totalRatedComments === 1 ? "avaliação" : "avaliações"}
                      </p>
                    </div>
                  </div>

                  {/* Barras de Distribuição Interativas (Os Filtros) */}
                  <div className="flex-1 flex flex-col gap-2 w-full">
                    <div className="flex items-center gap-2 mb-1 text-[13px] md:text-sm font-bold text-slate-800">
                      <Filter size={16} className="text-slate-400" /> Filtrar
                      por nota
                      {selectedStarFilter && (
                        <button
                          onClick={() => setSelectedStarFilter(null)}
                          className="text-[9px] md:text-[10px] text-rose-500 font-black uppercase tracking-widest ml-auto bg-rose-50 px-2 py-1 rounded-md"
                        >
                          Limpar Filtro
                        </button>
                      )}
                    </div>
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count =
                        ratingDistribution[star as 5 | 4 | 3 | 2 | 1];
                      const percentage =
                        totalRatedComments > 0
                          ? (count / totalRatedComments) * 100
                          : 0;
                      const isSelected = selectedStarFilter === star;

                      return (
                        <button
                          key={star}
                          onClick={() =>
                            setSelectedStarFilter(
                              star === selectedStarFilter ? null : star,
                            )
                          }
                          className={`flex items-center gap-3 group text-left w-full rounded-full p-1.5 -m-1.5 transition-colors ${isSelected ? "bg-amber-50/80 border border-amber-100/50" : "hover:bg-slate-50 border border-transparent"}`}
                        >
                          <span className="flex items-center gap-1 w-10 shrink-0 text-xs font-bold text-amber-600">
                            {star}{" "}
                            <Star
                              size={12}
                              className="fill-amber-400 text-amber-400"
                            />
                          </span>
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden relative">
                            <div
                              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${isSelected ? "bg-amber-500" : "bg-amber-400 group-hover:bg-amber-500"}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span
                            className={`w-12 shrink-0 text-right text-xs font-bold transition-colors ${count > 0 ? "text-slate-600" : "text-slate-300"} ${isSelected ? "text-amber-700" : ""}`}
                          >
                            {count} ({percentage.toFixed(0)}%)
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* LISTA DE COMENTÁRIOS */}
          {filteredMainComments.length === 0 ? (
            <div className="text-center bg-slate-50 rounded-2xl p-12 border border-slate-100">
              <Star
                size={32}
                className="mx-auto text-slate-300 mb-4 fill-transparent"
                strokeWidth={1.5}
              />
              <p className="text-slate-500 font-medium text-sm">
                {selectedStarFilter
                  ? `Ainda não existem avaliações com ${selectedStarFilter} estrelas.`
                  : "Seja o primeiro a avaliar este estabelecimento!"}
              </p>
              {selectedStarFilter && (
                <button
                  onClick={() => setSelectedStarFilter(null)}
                  className="mt-4 text-[10px] text-orange-600 font-black uppercase tracking-widest"
                >
                  Ver todas as avaliações
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {visibleComments.map((comment) => (
                <div
                  key={comment.id}
                  className="relative flex gap-4 items-start group"
                >
                  {/* Avatar Circular Premium */}
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-slate-100 group-hover:border-emerald-200 transition-colors">
                    {comment.user?.image ? (
                      <img
                        src={comment.user.image}
                        className="w-full h-full object-cover"
                        alt="avatar"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <User size={22} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 bg-white p-5 rounded-3xl rounded-tl-none border border-slate-100 shadow-sm transition-all group-hover:shadow-md group-hover:border-slate-200">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-x-3 gap-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-black text-[13px] text-slate-900 uppercase italic tracking-tight">
                          {comment.user?.name || "Visitante"}
                        </h4>
                        <RenderStars count={comment.rating} />
                        {comment.rating && (
                          <span className="text-base leading-none relative -top-px">
                            {RATING_EMOJIS[(comment.rating || 1) - 1]}
                          </span>
                        )}
                      </div>
                      <span
                        suppressHydrationWarning
                        className="text-[9px] font-bold text-slate-400 uppercase tracking-tight"
                      >
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          locale: ptBR,
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    <div className="text-sm text-slate-700 leading-relaxed font-medium mb-3">
                      {comment.content}
                    </div>

                    {/* Ações de Comentário */}
                    <div className="flex gap-4 mt-3 pt-3 border-t border-slate-50">
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
                            className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors"
                          >
                            <MessageSquare size={12} /> Responder Cliente
                          </button>
                        )}
                      {(currentUserId === comment.userId || isAdmin) && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          disabled={isPending}
                          className="flex items-center gap-1.5 text-[10px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-600 transition-colors ml-auto"
                        >
                          <Trash2 size={12} /> {isPending ? "..." : "Apagar"}
                        </button>
                      )}
                      {currentUserId &&
                        currentUserId !== comment.userId &&
                        !comment.isFlagged && (
                          <button
                            onClick={() => handleFlag(comment.id)}
                            disabled={isPending}
                            className="flex items-center gap-1.5 text-[10px] font-black text-amber-500 uppercase tracking-widest hover:text-amber-700 transition-colors"
                          >
                            <Flag size={12} /> Denunciar
                          </button>
                        )}
                    </div>

                    {/* RESPOSTA DO DONO (Premium Style) */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {comment.replies.map((reply: any) => (
                          <div
                            key={reply.id}
                            className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 group/reply"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2">
                                <CornerDownRight
                                  size={14}
                                  className="text-emerald-500 shrink-0"
                                />
                                <span className="font-black text-[10px] text-slate-900 uppercase italic">
                                  Resposta de {reply.user?.name}
                                </span>
                                <span
                                  className="px-2 py-0.5 text-white text-[7px] rounded font-black tracking-widest uppercase shadow-sm"
                                  style={{ backgroundColor: safeThemeColor }}
                                >
                                  EMPRESA
                                </span>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <span
                                  suppressHydrationWarning
                                  className="text-[8px] font-bold text-slate-400 uppercase"
                                >
                                  {formatDistanceToNow(
                                    new Date(reply.createdAt),
                                    {
                                      locale: ptBR,
                                      addSuffix: true,
                                    },
                                  )}
                                </span>
                                {(currentUserId === reply.userId ||
                                  isAdmin) && (
                                  <button
                                    onClick={() => handleDelete(reply.id)}
                                    disabled={isPending}
                                    className="text-rose-400 hover:text-rose-600 transition-colors opacity-0 group-hover/reply:opacity-100"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-[13px] text-slate-600 font-medium leading-relaxed pl-5">
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
          )}

          {filteredMainComments.length > visibleCount && (
            <div className="flex justify-center pt-6">
              <button
                onClick={() => setVisibleCount((prev) => prev + 10)}
                className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-black uppercase text-[11px] tracking-widest hover:bg-slate-200 transition-all border border-slate-200 active:scale-95 shadow-sm"
              >
                Carregar Mais Avaliações (
                {filteredMainComments.length - visibleCount} restantes)
              </button>
            </div>
          )}
        </div>

        {/* =========================================================================
            LADO DIREITO: FORMULÁRIO DE AVALIAÇÃO (Sticky)
            ========================================================================= */}
        <div className="order-1 lg:order-2 lg:sticky lg:top-28 lg:self-start">
          <div
            ref={commentFormRef}
            className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight mb-6">
              {replyingTo ? "Responder Cliente" : "Sua Avaliação"}
            </h3>

            {currentUserId ? (
              emailVerified ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {replyingTo && (
                    <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-500 uppercase">
                        Respondendo:{" "}
                        <span className="text-slate-900">
                          {replyingTo.name}
                        </span>
                      </p>
                      <button
                        type="button"
                        onClick={() => setReplyingTo(null)}
                        className="text-rose-500 font-bold text-[10px] bg-rose-50 px-2 py-0.5 rounded"
                      >
                        X
                      </button>
                    </div>
                  )}

                  {!replyingTo && (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block text-center">
                        Sua nota para este estabelecimento:
                      </span>
                      <div className="flex items-center justify-center gap-1.5 relative">
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
                              className="transition-all active:scale-90 outline-none p-1 relative"
                            >
                              <Star
                                size={32}
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
                        {/* 🚀 FIX TS: Usamos ?? 0 para garantir que o TypeScript saiba que estamos lidando com números! */}
                        {(rating > 0 || (hoverRating ?? 0) > 0) && (
                          <span className="text-3xl leading-none absolute -right-12">
                            {RATING_EMOJIS[(hoverRating ?? rating) - 1]}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      maxLength={500}
                      placeholder={
                        replyingTo
                          ? `Diga algo para ${replyingTo.name}...`
                          : "Como foi sua experiência? Conte detalhes..."
                      }
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all min-h-[120px] pb-9 resize-none"
                      disabled={isSubmitting}
                    />
                    <span
                      className={`absolute bottom-3 right-4 text-[10px] font-black ${newComment.length >= 500 ? "text-rose-500" : "text-slate-400"}`}
                    >
                      {newComment.length} / 500
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      isPending ||
                      (replyingTo === null && rating === 0) ||
                      (replyingTo !== null && newComment.trim() === "")
                    }
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-black uppercase text-[11px] tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 shadow-md active:shadow-sm"
                    style={{
                      backgroundColor: safeThemeColor,
                      color: "#ffffff",
                    }}
                  >
                    {isSubmitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        {replyingTo ? "ENVIAR RESPOSTA" : "PUBLICAR AVALIAÇÃO"}{" "}
                        <Send size={14} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="py-6 text-center text-amber-600 font-bold text-xs uppercase tracking-widest bg-amber-50 rounded-2xl border border-amber-100 px-4 leading-relaxed">
                  ⚠️ Verifique seu e-mail para poder avaliar
                </div>
              )
            ) : (
              <div className="py-6 text-center">
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-3">
                  Quer deixar sua avaliação?
                </p>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-slate-900 font-black text-sm border-b-2 border-slate-900 pb-0.5 hover:text-emerald-500 hover:border-emerald-500 transition-all"
                >
                  FAÇA LOGIN NA SUA CONTA
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
