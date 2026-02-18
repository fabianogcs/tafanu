import {
  Check,
  TrendingUp,
  Zap,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Smartphone,
  Globe,
  BarChart3,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

export default async function AnunciarPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  // Se logado: vai pro checkout.
  // Se deslogado: vai pro login e avisa que o destino final (callback) é o checkout.
  const destination = userId
    ? "/checkout"
    : "/login?callbackUrl=/checkout&intent=assinante";
  return (
    <div className="bg-white min-h-screen font-sans selection:bg-tafanu-action selection:text-tafanu-blue">
      {/* --- HERO: DIRETO AO PONTO --- */}
      <section className="relative bg-[#050814] text-white py-24 md:py-36 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-tafanu-action/10 via-transparent to-transparent opacity-50"></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-tafanu-action/10 border border-tafanu-action/20 text-tafanu-action font-bold text-[10px] uppercase tracking-[0.2em] mb-8">
            <Sparkles size={14} /> Lançamento Exclusivo
          </div>

          <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.9] mb-8">
            SUA MARCA NA <br />
            <span className="text-tafanu-action">PALMA DA MÃO.</span>
          </h1>

          <p className="text-lg md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto font-medium leading-tight">
            Crie sua vitrine profissional no Tafanu hoje. Seja encontrado por
            clientes locais e receba contatos direto no seu WhatsApp sem pagar
            comissões.
          </p>

          <Link
            href={destination}
            className="bg-tafanu-action text-[#050814] font-black text-lg px-12 py-6 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter"
          >
            ATIVAR MINHA VITRINE POR R$ 1,00 <ArrowRight size={20} />
          </Link>

          <p className="mt-8 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
            R$ 1,00 no primeiro mês • Depois R$ 29,90/mês
          </p>
        </div>
      </section>

      {/* --- DIFERENCIAIS TÉCNICOS (Baseados no seu Schema) --- */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-5 p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-tafanu-action/50 transition-colors group">
            <div className="w-12 h-12 bg-tafanu-blue text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-tafanu-action group-hover:text-tafanu-blue transition-colors">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-2xl font-black uppercase italic text-slate-900 tracking-tighter leading-none">
              Métricas Reais
            </h3>
            <p className="text-slate-500 font-medium leading-snug">
              Acompanhe visualizações e cliques no seu WhatsApp em tempo real
              pelo seu painel exclusivo.
            </p>
          </div>

          <div className="flex flex-col gap-5 p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-tafanu-action/50 transition-colors group">
            <div className="w-12 h-12 bg-tafanu-blue text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-tafanu-action group-hover:text-tafanu-blue transition-colors">
              <Clock size={24} />
            </div>
            <h3 className="text-2xl font-black uppercase italic text-slate-900 tracking-tighter leading-none">
              Sempre Aberto
            </h3>
            <p className="text-slate-500 font-medium leading-snug">
              Configure horários, galeria de fotos e FAQs. Sua empresa aberta
              24h para consultas no Guia.
            </p>
          </div>

          <div className="flex flex-col gap-5 p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-tafanu-action/50 transition-colors group">
            <div className="w-12 h-12 bg-tafanu-blue text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-tafanu-action group-hover:text-tafanu-blue transition-colors">
              <Globe size={24} />
            </div>
            <h3 className="text-2xl font-black uppercase italic text-slate-900 tracking-tighter leading-none">
              SEO Local
            </h3>
            <p className="text-slate-500 font-medium leading-snug">
              Nossa tecnologia indexa sua página no Google para que você apareça
              nas buscas da sua cidade.
            </p>
          </div>
        </div>
      </section>

      {/* --- CTA PRÁTICO: VALOR TRANSPARENTE --- */}
      <section className="py-20 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white p-8 md:p-16 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-tafanu-action opacity-10 rounded-full blur-3xl"></div>

            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-4 text-slate-900 leading-none">
              ASSINATURA <span className="text-tafanu-blue">TAFANU</span>
            </h2>

            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mb-8">
              Cancele quando quiser • Sem multas • Sem letras miúdas
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
              <div className="text-center">
                <span className="block text-slate-400 font-black text-xs uppercase mb-1">
                  Início
                </span>
                <span className="text-5xl font-black text-tafanu-action tracking-tighter italic">
                  R$ 1,00
                </span>
              </div>
              <div className="hidden md:block w-px h-12 bg-slate-200"></div>
              <div className="text-center">
                <span className="block text-slate-400 font-black text-xs uppercase mb-1">
                  Mensalidade
                </span>
                <span className="text-5xl font-black text-slate-900 tracking-tighter italic">
                  R$ 29,90
                </span>
              </div>
            </div>

            <Link
              href={destination}
              className="w-full bg-[#050814] text-white font-black py-6 rounded-2xl hover:bg-tafanu-blue transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-3 shadow-2xl"
            >
              CRIAR MINHA VITRINE AGORA
            </Link>
          </div>
        </div>
      </section>

      {/* --- FAQ RÁPIDO --- */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <div className="space-y-4">
          {[
            {
              q: "COMO FUNCIONA O PAGAMENTO?",
              a: "O primeiro mês custa apenas R$ 1,00. A partir do segundo mês, o valor de R$ 29,90 é cobrado automaticamente para manter sua vitrine online e ativa.",
            },
            {
              q: "TEM PERÍODO DE FIDELIDADE?",
              a: "Não. O Tafanu é um serviço por assinatura mensal. Você pode suspender ou cancelar o plano a qualquer momento diretamente no seu painel.",
            },
            {
              q: "MINHA PÁGINA FICA PRONTA NA HORA?",
              a: "Sim! Assim que o sistema confirmar o pagamento inicial de R$ 1,00, o Editor Business é liberado para você preencher seus dados e fotos.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-8 rounded-3xl bg-white border border-slate-100 group hover:border-tafanu-blue/30 transition-colors"
            >
              <h4 className="font-black text-sm uppercase italic text-tafanu-blue mb-2 tracking-widest">
                {item.q}
              </h4>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
