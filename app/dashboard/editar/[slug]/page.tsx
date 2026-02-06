import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Eye,
  Heart,
  ExternalLink,
  Settings2,
  Sparkles,
  ShieldCheck,
  MessageCircle, // <--- ADICIONADO
  Phone, // <--- ADICIONADO
} from "lucide-react";
import BusinessEditor from "@/components/BusinessEditor";

export default async function EditBusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>; // 👈 Adicionamos o Promise aqui
}) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) redirect("/login");

  const business = await db.business.findUnique({
    where: { slug: slug },
    include: {
      hours: true,
      _count: {
        select: { favorites: true },
      },
    },
  });

  if (!business) return notFound();
  if (business.userId !== userId) {
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

  // Ordenar horários
  business.hours.sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <div className="max-w-5xl mx-auto pb-24 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* HEADER DE NAVEGAÇÃO 3.0 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all text-[10px] font-black uppercase tracking-widest"
          >
            <div className="p-2 bg-white rounded-xl border border-slate-200 group-hover:border-indigo-100 shadow-sm transition-all">
              <ChevronLeft size={14} />
            </div>
            Voltar ao Painel
          </Link>

          <Link
            href={`/site/${business.slug}`}
            target="_blank"
            className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition-all text-[10px] font-black uppercase tracking-widest shadow-sm"
          >
            Ver página ao vivo <ExternalLink size={14} />
          </Link>
        </div>

        {/* BANNER DE STATUS E PERFORMANCE */}
        <div className="bg-white border border-slate-200 rounded-[40px] p-8 md:p-10 mb-10 shadow-sm relative overflow-hidden">
          {/* Decoração sutil */}
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
            <Settings2 size={180} className="rotate-12" />
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-indigo-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Editor de Presença
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 italic uppercase tracking-tighter leading-none">
                {business.name}
              </h1>
            </div>

            {/* --- AQUI ESTÁ A MUDANÇA: ESTATÍSTICAS NOVAS --- */}
            <div className="flex flex-wrap items-center gap-3">
              <StatItem
                icon={<Eye size={16} />}
                label="Visitas"
                value={business.views}
                className="bg-slate-50 text-slate-500 border-slate-100"
              />
              <StatItem
                icon={<Heart size={16} />}
                label="Fãs"
                value={business._count?.favorites || 0}
                className="bg-rose-50 text-rose-500 border-rose-100"
              />

              {/* BLOCO DE WHATSAPP */}
              <StatItem
                icon={<MessageCircle size={16} />}
                label="WhatsApp"
                // Se der erro aqui, é porque você não rodou o passo 1 (Prisma)
                value={(business as any).whatsapp_clicks || 0}
                className="bg-emerald-50 text-emerald-600 border-emerald-100"
              />

              {/* BLOCO DE LIGAÇÕES */}
              <StatItem
                icon={<Phone size={16} />}
                label="Ligações"
                // Se der erro aqui, é porque você não rodou o passo 1 (Prisma)
                value={(business as any).phone_clicks || 0}
                className="bg-blue-50 text-blue-600 border-blue-100"
              />
            </div>
          </div>
        </div>

        {/* O CORAÇÃO DO SISTEMA - BUSINESS EDITOR 3.0 */}
        <div className="relative bg-white rounded-[40px] shadow-sm border border-slate-200 p-2 md:p-4">
          <BusinessEditor business={business} />
        </div>
      </div>
    </div>
  );
}

// Subcomponente de Estatística
function StatItem({ icon, label, value, className }: any) {
  return (
    <div
      className={`flex flex-col items-center min-w-[90px] md:min-w-[100px] px-4 md:px-6 py-3 rounded-[24px] border transition-all ${className}`}
    >
      <div className="flex items-center gap-1.5 opacity-60 mb-1">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-tighter">
          {label}
        </span>
      </div>
      <span className="text-xl md:text-2xl font-black leading-none">
        {value}
      </span>
    </div>
  );
}
