import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import BusinessEditor from "@/components/BusinessEditor";

export default async function EditBusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const business = await db.business.findUnique({
    where: { slug },
    include: {
      hours: true,
      _count: { select: { favorites: true } },
    },
  });

  if (!business) return notFound();

  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdmin =
    session.user.role === "ADMIN" ||
    (!!adminEmail &&
      session.user.email?.toLowerCase() === adminEmail.toLowerCase());

  // 🚀 Permite a edição se for dono, admin, afiliado OU assinante
  const isOwner = business.userId === userId;
  const isProRole = ["ADMIN", "AFILIADO", "ASSINANTE"].includes(
    session.user.role as string,
  );

  if (!isOwner && !isAdmin && !isProRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-rose-100 text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-xl font-black uppercase italic text-slate-900">
            Acesso Restrito
          </h2>
          <p className="text-slate-400 font-medium text-sm mt-2">
            Este negócio pertence a outra conta.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block bg-slate-900 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest"
          >
            Voltar ao Painel
          </Link>
        </div>
      </div>
    );
  }

  business.hours.sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <div className="max-w-5xl mx-auto pb-24 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* HEADER: Botão de voltar e Aviso de Admin */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all text-[10px] font-black uppercase tracking-widest"
          >
            <div className="p-2 bg-white rounded-xl border border-slate-200 group-hover:border-indigo-100 shadow-sm transition-all">
              <ChevronLeft size={14} />
            </div>
            Voltar ao Painel
          </Link>

          {/* 🛡️ Salvo: Aviso discreto para quando o Admin está editando a loja de um cliente */}
          {isAdmin && business.userId !== userId && (
            <div className="bg-amber-100 text-amber-700 px-4 py-2 text-[10px] font-black uppercase rounded-xl tracking-widest flex items-center gap-2 shadow-sm border border-amber-200">
              Modo Suporte Ativado
            </div>
          )}
        </div>

        {/* COMPONENTE DO EDITOR (Agora ele reina absoluto na tela) */}
        <div className="relative bg-white rounded-[40px] shadow-sm border border-slate-200 p-2 md:p-4">
          <BusinessEditor business={business} />
        </div>
      </div>
    </div>
  );
}
