import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Eye,
  Edit3,
  MapPin,
  Heart,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  Zap,
  Phone,
} from "lucide-react";
import ProfileForm from "@/components/ProfileForm";
import SubscriptionAlert from "@/components/SubscriptionAlert";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      businesses: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { favorites: true },
          },
        },
      },
    },
  });

  if (!user) redirect("/login");
  if (user.role === "VISITANTE") redirect("/dashboard/favoritos");

  const isProfileComplete = !!(user.document && user.phone);

  return (
    <div className="min-h-screen font-sans text-slate-900 bg-[#F8FAFC] overflow-x-hidden">
      {/* Background Decorativo */}
      <div className="fixed inset-0 -z-10 bg-[#F8FAFC]">
        <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-indigo-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-7xl mx-auto p-4 md:p-6 pb-24">
        <SubscriptionAlert user={user} />

        {!isProfileComplete ? (
          <div className="max-w-2xl mx-auto mt-10 md:mt-20">
            <div className="bg-white border border-slate-200 rounded-[40px] p-8 md:p-12 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <ShieldCheck size={120} className="text-indigo-600" />
              </div>
              <div className="relative z-10">
                <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">
                  Ação Necessária
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase italic leading-none mb-4">
                  Quase lá, {user.name.split(" ")[0]}!
                </h2>
                <p className="text-slate-500 font-medium mb-8">
                  Para liberar a criação de anúncios, precisamos validar seus
                  dados de segurança.
                </p>
                <ProfileForm user={user} />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 pb-8 border-b border-slate-200/60">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Business Command Center
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                  Gestão de <span className="text-indigo-600">Resultados</span>
                </h1>
              </div>

              <Link
                href="/dashboard/novo"
                className="group w-full md:w-auto bg-slate-900 text-white font-black px-8 py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all text-xs uppercase tracking-widest"
              >
                <Plus
                  size={20}
                  className="group-hover:rotate-90 transition-transform"
                />
                Criar Novo Anúncio
              </Link>
            </div>

            {user.businesses.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-[40px] p-16 text-center">
                <Zap size={40} className="mx-auto text-indigo-200 mb-4" />
                <p className="text-slate-400 font-bold mb-4 uppercase text-xs tracking-widest">
                  Sua vitrine está vazia. Vamos mudar isso?
                </p>
                <Link
                  href="/dashboard/novo"
                  className="text-indigo-600 font-black flex items-center justify-center gap-2 uppercase text-sm hover:gap-4 transition-all"
                >
                  Começar meu primeiro anúncio <ArrowRight size={18} />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                {user.businesses.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-white rounded-[35px] overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col h-full"
                  >
                    {/* Banner do Negócio */}
                    <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden">
                      <img
                        src={
                          item.imageUrl ||
                          "https://images.unsplash.com/photo-1556761175-5973dc0f32e7"
                        }
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        alt={item.name}
                      />
                      <div className="absolute top-4 left-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm border ${item.isActive ? "bg-emerald-500/90 text-white border-emerald-400" : "bg-rose-500/90 text-white border-rose-400"}`}
                        >
                          {item.isActive ? "● Online" : "● Pausado"}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 md:p-8 flex flex-col flex-1">
                      <div className="mb-6">
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 truncate uppercase italic mb-2 group-hover:text-indigo-600 transition-colors">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <MapPin size={12} className="text-indigo-500" />
                          <span className="text-[10px] font-bold uppercase tracking-tight">
                            {item.city}, {item.state}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
                        <MetricBox
                          label="Views"
                          value={item.views}
                          icon={<Eye size={14} />}
                          sub="Alcance"
                        />
                        <MetricBox
                          label="Favs"
                          value={item._count?.favorites || 0}
                          icon={<Heart size={14} className="text-rose-500" />}
                          sub="Fãs"
                        />
                        <MetricBox
                          label="Zap"
                          value={(item as any).whatsapp_clicks || 0}
                          icon={
                            <MessageCircle
                              size={14}
                              className="text-emerald-500"
                            />
                          }
                          sub="Clicks"
                        />
                        <MetricBox
                          label="Fone"
                          value={(item as any).phone_clicks || 0}
                          icon={<Phone size={14} className="text-blue-500" />}
                          sub="Ligou"
                        />
                      </div>

                      <div className="mt-auto flex flex-col gap-3">
                        <Link
                          href={`/dashboard/editar/${item.slug}`}
                          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-lg flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all"
                        >
                          <Edit3 size={16} /> Gerenciar Anúncio
                        </Link>
                        {/* CORREÇÃO AQUI: Link para /site/ */}
                        <Link
                          href={`/site/${item.slug}`}
                          target="_blank"
                          className="w-full bg-slate-50 text-slate-500 py-4 rounded-2xl font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors"
                        >
                          Visualizar na Vitrine
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MetricBox({
  label,
  value,
  icon,
  sub,
}: {
  label: string;
  value: any;
  icon: any;
  sub: string;
}) {
  return (
    <div className="bg-slate-50/50 border border-slate-100 rounded-[20px] p-2 flex flex-col items-center justify-center transition-colors hover:bg-white hover:border-indigo-100 min-h-[70px]">
      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
        {icon}
        <span className="text-[8px] font-black uppercase tracking-tighter">
          {label}
        </span>
      </div>
      <span className="text-lg font-black text-slate-900 leading-none mb-0.5">
        {value}
      </span>
      <span className="text-[6px] md:text-[7px] font-bold uppercase text-slate-400">
        {sub}
      </span>
    </div>
  );
}
