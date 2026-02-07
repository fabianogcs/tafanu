import { getRandomBusinesses } from "@/app/actions";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import Link from "next/link";
import { ArrowRight, Sparkles, Eye, Heart, MapPin, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

// --- FUNÇÃO DE VERIFICAÇÃO DE HORÁRIO ---
function checkIsOpen(hours: any[]) {
  if (!hours || hours.length === 0) return false; // Sem horário = Fechado por segurança

  // 1. Pega a hora atual em SP/Brasil (para não depender do servidor estar nos EUA)
  const now = new Date();
  const spTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }),
  );

  const currentDay = spTime.getDay(); // 0 = Domingo, 1 = Segunda...
  const currentHour = spTime.getHours();
  const currentMin = spTime.getMinutes();

  // Transforma hora atual em string comparável "HH:MM"
  const currentTimeStr = `${String(currentHour).padStart(2, "0")}:${String(
    currentMin,
  ).padStart(2, "0")}`;

  // 2. Acha a regra de hoje
  const todayRule = hours.find((h) => h.dayOfWeek === currentDay);

  // 3. Se não tem regra hoje ou está marcado como fechado o dia todo
  if (!todayRule || todayRule.isClosed) return false;

  // 4. Verifica se está dentro do intervalo
  return (
    currentTimeStr >= todayRule.openTime && currentTimeStr < todayRule.closeTime
  );
}

export default async function Home() {
  const businesses = await getRandomBusinesses();

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <Hero />
      <Categories />

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-tafanu-blue font-black text-[10px] uppercase tracking-[0.3em]">
              Explorar
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
              Destaques de Hoje
            </h2>
          </div>
          <Link
            href="/busca"
            className="text-tafanu-blue font-black text-xs uppercase flex items-center gap-2 hover:underline"
          >
            Ver todos <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {businesses.map((item) => {
            // Calcula se está aberto PARA CADA CARD
            const isOpen = checkIsOpen(item.hours);

            return (
              <div
                key={item.id}
                className="bg-white rounded-[25px] shadow-sm border border-gray-100 overflow-hidden group flex flex-col hover:shadow-xl transition-all duration-300 relative"
              >
                {/* IMAGEM COM EFEITO PRETO E BRANCO SE FECHADO */}
                <div className="aspect-[16/10] w-full relative overflow-hidden bg-gray-100">
                  <img
                    src={item.imageUrl || "/og-default.png"}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      !isOpen ? "grayscale opacity-80" : ""
                    }`}
                    alt={item.name}
                  />

                  {/* ETIQUETA DE FECHADO */}
                  {!isOpen && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                      <div className="bg-slate-900/90 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 border border-white/10">
                        <Clock size={12} /> Fechado
                      </div>
                    </div>
                  )}

                  {/* ETIQUETA DE ABERTO (Opcional, discreta no canto) */}
                  {isOpen && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-wide shadow-sm">
                        Aberto
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3 md:p-5 flex-1 flex flex-col">
                  <h3 className="font-black text-xs md:text-lg text-gray-900 leading-tight uppercase italic truncate mb-1">
                    {item.name}
                  </h3>

                  <div className="flex items-start gap-1 text-gray-400 mb-3">
                    <MapPin
                      size={12}
                      className="text-emerald-500 shrink-0 mt-0.5"
                    />
                    <span className="font-bold text-[8px] md:text-[10px] uppercase italic truncate">
                      {item.city}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-4 opacity-70">
                    <div className="flex items-center gap-1 text-slate-500">
                      <Eye size={12} />
                      <span className="text-[9px] md:text-[11px] font-black">
                        {item.views}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-rose-500">
                      <Heart
                        size={11}
                        fill="currentColor"
                        className="opacity-20"
                      />
                      <span className="text-[9px] md:text-[11px] font-black">
                        {item._count?.favorites || 0}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/site/${item.slug}`}
                    className={`mt-auto text-center py-2.5 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                      !isOpen
                        ? "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        : "bg-gray-50 text-tafanu-blue hover:bg-tafanu-blue hover:text-white"
                    }`}
                  >
                    Ver Perfil <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}

          {businesses.length === 0 && (
            <div className="col-span-full text-center py-10 opacity-50 font-bold italic">
              Ainda não há destaques hoje. Seja o primeiro!
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto bg-[#0f172a] rounded-[40px] p-8 md:p-16 text-center md:text-left flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden border border-white/5">
          <div className="absolute right-0 top-0 w-96 h-96 bg-tafanu-action opacity-10 rounded-full blur-[100px] -mr-32 -mt-32"></div>

          <div className="z-10 mb-8 md:mb-0 max-w-lg">
            <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
              <Sparkles className="text-tafanu-action" size={20} />
              <span className="text-tafanu-action font-black text-xs uppercase tracking-[0.3em]">
                Oportunidade
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase italic tracking-tighter leading-none">
              Sua marca em <br /> destaque hoje.
            </h2>
            <p className="text-slate-400 font-medium">
              Aumente sua visibilidade e atraia clientes qualificados. Crie sua
              vitrine profissional em poucos minutos.
            </p>
          </div>

          <Link
            href="/anunciar"
            className="z-10 bg-tafanu-action text-[#0f172a] font-black py-5 px-10 rounded-2xl hover:bg-white transition-all shadow-xl whitespace-nowrap transform hover:scale-105 duration-200 uppercase text-sm tracking-widest"
          >
            Começar Agora
          </Link>
        </div>
      </section>
    </main>
  );
}
