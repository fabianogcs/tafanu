import { db } from "@/lib/db";
import { auth } from "@/auth";
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
  Smartphone,
  ShoppingBag,
  Map,
  TrendingUp,
} from "lucide-react";
import ProfileForm from "@/components/ProfileForm";
import SubscriptionAlert from "@/components/SubscriptionAlert";
import DashboardCharts from "@/components/DashboardCharts";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      businesses: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { favorites: true },
          },
          analytics: {
            where: {
              createdAt: {
                gte: new Date(new Date().setDate(new Date().getDate() - 7)),
              },
            },
            select: {
              eventType: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!user) redirect("/login");
  if (user.role === "VISITANTE") redirect("/dashboard/favoritos");

  const isTestAccount = user.email?.endsWith("@tafanu.com.br");

  const isProfileComplete =
    user.role === "ADMIN" ||
    user.role === "AFILIADO" ||
    isTestAccount ||
    (user.role === "ASSINANTE" && !!(user.document && user.phone));

  const canCreateBusiness =
    user.role === "ADMIN" ||
    ((user.role === "AFILIADO" || user.role === "ASSINANTE") &&
      user.businesses.length === 0);

  return (
    <div className="min-h-screen font-sans text-slate-900 bg-slate-50 overflow-x-hidden">
      {/* 🚀 CIRURGIA: Background Decorativo agora usa o verde da marca, bem sutil */}
      <div className="fixed inset-0 -z-10 bg-slate-50">
        <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-tafanu-action/5 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-7xl mx-auto p-4 md:p-6 pb-24">
        <SubscriptionAlert user={user} />

        {!isProfileComplete ? (
          <div className="max-w-2xl mx-auto mt-10 md:mt-20">
            <div className="bg-white border border-slate-200 rounded-[40px] p-8 md:p-12 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                {/* 🚀 CIRURGIA: Ícone com a cor da marca */}
                <ShieldCheck size={120} className="text-tafanu-action" />
              </div>
              <div className="relative z-10">
                <span className="bg-rose-50 text-rose-600 border border-rose-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">
                  Ação Necessária
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase italic leading-none mb-4">
                  Quase lá, {user.name?.split(" ")[0] ?? "Usuário"}!
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 pb-8 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-tafanu-action animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Business Command Center
                  </span>
                </div>
                {/* 🚀 CIRURGIA: Destaque visual usando o Tafanu Action */}
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                  Gestão de{" "}
                  <span className="text-tafanu-action">Resultados</span>
                </h1>
              </div>

              {canCreateBusiness && (
                <Link
                  href="/dashboard/novo"
                  className="group w-full md:w-auto bg-slate-900 text-white font-black px-8 py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 hover:bg-tafanu-action hover:shadow-tafanu-action/30 transition-all duration-300 text-xs uppercase tracking-widest"
                >
                  <Plus
                    size={20}
                    className="group-hover:rotate-90 transition-transform"
                  />
                  Criar Novo Anúncio
                </Link>
              )}
            </div>

            {user.businesses.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-[40px] p-16 text-center shadow-sm">
                <Zap size={40} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-400 font-bold mb-4 uppercase text-xs tracking-widest">
                  Sua vitrine está vazia. Vamos mudar isso?
                </p>
                <Link
                  href="/dashboard/novo"
                  className="text-tafanu-action font-black flex items-center justify-center gap-2 uppercase text-sm hover:gap-4 transition-all"
                >
                  Começar meu primeiro anúncio <ArrowRight size={18} />
                </Link>
              </div>
            ) : (
              <div className="space-y-24">
                {user.businesses.map((business) => {
                  const analytics = business.analytics || [];
                  const views = business.views || 0;
                  const whats = business.whatsapp_clicks || 0;
                  const phone = business.phone_clicks || 0;
                  const map = business.map_clicks || 0;
                  const favs = business._count?.favorites || 0;

                  const socials =
                    (business.instagram_clicks || 0) +
                    (business.facebook_clicks || 0) +
                    (business.tiktok_clicks || 0) +
                    (business.website_clicks || 0);
                  const stores =
                    (business.mercadolivre_clicks || 0) +
                    (business.shopee_clicks || 0) +
                    (business.ifood_clicks || 0) +
                    (business.shein_clicks || 0);
                  return (
                    <div
                      key={business.id}
                      className="flex flex-col lg:flex-row gap-8 items-start relative"
                    >
                      {/* LADO ESQUERDO: CARD DO NEGÓCIO */}
                      <div className="w-full lg:w-1/3 flex flex-col gap-4 lg:sticky lg:top-24 z-10">
                        <div className="bg-white rounded-[40px] overflow-hidden border border-slate-200 shadow-sm flex flex-col">
                          <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                            <img
                              src={business.imageUrl || "/og-default.png"}
                              className="w-full h-full object-cover"
                              alt={business.name}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex flex-col justify-end p-8">
                              <span
                                className={`self-start px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 border ${business.published ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 backdrop-blur-md" : "bg-rose-500/20 text-rose-300 border-rose-500/30 backdrop-blur-md"}`}
                              >
                                {business.published ? "● Online" : "● Pausado"}
                              </span>
                              <h2 className="text-3xl font-black text-white uppercase italic leading-none truncate">
                                {business.name}
                              </h2>
                              <p className="text-xs font-bold text-white/70 uppercase tracking-widest mt-2 flex items-center gap-1.5 truncate">
                                <MapPin size={14} /> {business.city},{" "}
                                {business.state}
                              </p>
                            </div>
                          </div>

                          <div className="p-6 flex flex-col gap-3 bg-white">
                            <Link
                              href={`/dashboard/editar/${business.slug}`}
                              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-md flex items-center justify-center gap-3 hover:bg-tafanu-action transition-all duration-300"
                            >
                              <Edit3 size={16} /> Gerenciar Anúncio
                            </Link>
                            <Link
                              href={`/site/${business.slug}`}
                              target="_blank"
                              className="w-full bg-slate-50 text-slate-600 py-4 rounded-2xl border border-slate-200 font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-slate-100 hover:text-tafanu-action transition-colors"
                            >
                              Visualizar na Vitrine
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* LADO DIREITO: MÉTRICAS PADRONIZADAS */}
                      <div className="w-full lg:w-2/3 flex flex-col gap-6 md:gap-8">
                        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-full px-6 py-4 shadow-sm">
                          <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase italic leading-none">
                              Desempenho Geral
                            </h2>
                          </div>
                          {/* 🚀 CIRURGIA: Ícone em verde Tafanu */}
                          <div className="w-10 h-10 rounded-full bg-emerald-50 text-tafanu-action border border-emerald-100 flex items-center justify-center">
                            <TrendingUp size={20} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <StandardMetricBox
                            label="Visitas no Perfil"
                            value={views}
                            icon={<Eye size={18} />}
                            color="text-blue-500"
                            bg="bg-blue-50"
                          />
                          <StandardMetricBox
                            label="Cliques WhatsApp"
                            value={whats}
                            icon={<MessageCircle size={18} />}
                            color="text-emerald-500"
                            bg="bg-emerald-50"
                          />
                          <StandardMetricBox
                            label="Ligações"
                            value={phone}
                            icon={<Phone size={18} />}
                            color="text-sky-500"
                            bg="bg-sky-50"
                          />
                          <StandardMetricBox
                            label="Redes Sociais"
                            value={socials}
                            icon={<Smartphone size={18} />}
                            color="text-purple-500"
                            bg="bg-purple-50"
                          />
                          <StandardMetricBox
                            label="Lojas Oficiais"
                            value={stores}
                            icon={<ShoppingBag size={18} />}
                            color="text-orange-500"
                            bg="bg-orange-50"
                          />
                          <StandardMetricBox
                            label="Rotas (Mapa)"
                            value={map}
                            icon={<Map size={18} />}
                            color="text-rose-500"
                            bg="bg-rose-50"
                          />
                        </div>

                        {/* Bloco de Favoritos */}
                        <div className="bg-white border border-slate-200 rounded-[30px] p-6 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center">
                              <Heart size={24} fill="currentColor" />
                            </div>
                            <div>
                              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                Total de Favoritos
                              </p>
                              <h4 className="text-2xl font-black text-slate-900 leading-none mt-1">
                                {favs} Fãs
                              </h4>
                            </div>
                          </div>
                          <span className="hidden md:inline-block text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
                            Pessoas que salvaram seu anúncio
                          </span>
                        </div>

                        {/* GRÁFICOS */}
                        <div className="bg-white border border-slate-200 rounded-[35px] p-6 md:p-8 shadow-sm">
                          <DashboardCharts analytics={analytics} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StandardMetricBox({
  label,
  value,
  icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-[24px] p-5 md:p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all h-32 group">
      <div className="flex justify-between items-start mb-2">
        <div
          className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}
        >
          {icon}
        </div>
      </div>
      <div>
        <h4 className="text-2xl font-black text-slate-900 leading-none">
          {value}
        </h4>
        <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5 truncate">
          {label}
        </p>
      </div>
    </div>
  );
}
