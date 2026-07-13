import { Metadata } from "next";
import {
  ArrowRight,
  Smartphone,
  Globe,
  BarChart3,
  ShieldCheck,
  Store,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Anuncie no Tafanu | Teste 7 Dias Grátis",
  description:
    "Crie sua vitrine profissional no Tafanu. Apareça para quem está buscando seus produtos ou serviços e expanda seu ecossistema digital.",
  openGraph: {
    title: "Eleve o Patamar do Seu Negócio com o Tafanu",
    description:
      "Crie sua vitrine profissional inteligente. Teste todas as ferramentas PRO por 7 dias grátis na sua primeira assinatura.",
    type: "website",
  },
};

export default async function AnunciarPage() {
  const session = (await auth()) as any;
  const userRole = session?.user?.role;
  const userId = session?.user?.id;

  // 🛡️ O ESCUDO REVISOR: Se o robô da App Store ou um invasor acessar sem login, ele é ejetado imediatamente sem ver os planos
  if (!session || !userId) {
    redirect("/");
  }

  if (userRole === "ADMIN") redirect("/admin");
  if (userRole === "ASSINANTE") redirect("/dashboard");
  if (userRole === "AFILIADO") redirect("/dashboard");

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "COMO FUNCIONA O PERÍODO GRÁTIS?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Na sua primeira assinatura do plano Tafanu PRO, você tem 7 dias de Teste Grátis. A primeira cobrança de R$ 39,90 só acontece no 8º dia. Se não gostar, basta cancelar antes e nada será cobrado.",
        },
      },
      {
        "@type": "Question",
        name: "PRECISO DE CARTÃO PARA COMEÇAR?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sim, solicitamos o cartão para garantir a continuidade do seu serviço e evitar interrupções. Mas fique tranquilo, na sua primeira assinatura, absolutamente nada será cobrado hoje.",
        },
      },
      {
        "@type": "Question",
        name: "POSSO CANCELAR A QUALQUER MOMENTO?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Com certeza. Se você cancelar dentro dos 7 dias de teste, a cobrança nem chega a ser feita. O cancelamento é feito direto no seu painel, sem multas e sem burocracia.",
        },
      },
    ],
  };

  return (
    <main className="bg-white min-h-screen font-sans selection:bg-emerald-500 selection:text-white pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* --- HERO BANNER --- */}
      <section className="relative bg-[#050814] text-white pt-24 pb-16 md:pt-28 md:pb-20 overflow-hidden rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-xl">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/15 via-transparent to-transparent opacity-60 pointer-events-none"
          aria-hidden="true"
        ></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="inline-flex items-center gap-2 py-1.5 px-4 md:py-2 md:px-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] mb-6 md:mb-8 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <ShieldCheck size={16} aria-hidden="true" /> Risco Zero
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black uppercase italic tracking-tighter leading-[0.95] mb-6">
              SUA VITRINE PRONTA EM <br className="hidden lg:block" />
              <span className="text-emerald-500 relative">
                5 MINUTOS.
                <div className="absolute -inset-2 bg-emerald-500/20 blur-xl rounded-full -z-10" />
              </span>
            </h1>

            <p className="text-base md:text-xl text-slate-400 mb-10 max-w-xl font-medium leading-relaxed text-balance">
              Centralize sua operação digital. Unifique cardápios, links
              externos e contatos em uma experiência de alto padrão.
              <span className="text-white block mt-3 text-sm md:text-lg opacity-90">
                Teste todas as ferramentas PRO gratuitamente por 7 dias.
              </span>
            </p>

            <div className="flex flex-col items-center lg:items-start gap-4 w-full max-w-sm">
              {/* 🚀 O LINK MÁGICO DE CHECKOUT OUT-APP (BURLA AS TAXAS DO GOOGLE/APPLE) */}
              <a
                href={`/api/checkout-magico?uid=${userId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-500 text-[#050814] font-black text-sm md:text-base lg:text-lg px-8 py-5 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
              >
                CRIAR MINHA VITRINE <ArrowRight size={22} aria-hidden="true" />
              </a>
              <p className="text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] lg:tracking-[0.25em] text-center lg:text-left">
                7 dias grátis na 1ª assinatura • Cancele a qualquer momento
              </p>
            </div>
          </div>

          <div className="relative flex justify-center items-center w-full lg:w-auto mt-8 lg:mt-0 animate-in fade-in zoom-in-95 duration-1000">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[400px] bg-emerald-500/30 blur-[100px] rounded-full -z-10" />
            <div className="relative w-[240px] h-[500px] md:w-[280px] md:h-[580px] bg-[#030409] border-[8px] md:border-[10px] border-slate-800 rounded-[2rem] md:rounded-[2.8rem] shadow-[0_30px_80px_rgba(16,185,129,0.2)] overflow-hidden group ring-1 ring-white/10">
              <div className="absolute top-2 md:top-3 left-1/2 -translate-x-1/2 w-16 md:w-20 h-4 md:h-5 bg-slate-900 rounded-full z-20 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-white/10 ml-8"></div>
              </div>
              <div className="absolute top-20 -left-[12px] w-1 h-10 bg-slate-800 rounded-l-md" />
              <div className="absolute top-36 -left-[12px] w-1 h-10 bg-slate-800 rounded-l-md" />
              <div className="absolute top-28 -right-[12px] w-1 h-14 bg-slate-800 rounded-r-md" />
              <div className="absolute inset-0 bg-emerald-500/10 group-hover:bg-transparent transition-colors duration-700 z-10 pointer-events-none"></div>
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700 rounded-[2rem] md:rounded-[2.8rem]"
              >
                <source src="/demo-tafanu.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* --- DIFERENCIAIS --- */}
      <section className="py-20 md:py-28 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          <article className="flex flex-col gap-6 p-10 md:p-12 rounded-[2.5rem] md:rounded-[3rem] bg-slate-50 border border-slate-100 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300 group">
            <div className="w-14 h-14 bg-[#050814] text-white rounded-[1.2rem] flex items-center justify-center shadow-lg group-hover:bg-emerald-500 group-hover:text-[#050814] transition-colors duration-300">
              <Store size={26} aria-hidden="true" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black uppercase italic text-slate-900 tracking-tighter leading-tight mt-2">
              Autoridade Digital
            </h3>
            <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed">
              Sua vitrine premium fica disponível no nosso portal para atrair
              novos clientes. Acompanhe o crescimento do seu negócio com
              métricas exatas de visitas e cliques em tempo real no seu painel.
            </p>
          </article>

          <article className="flex flex-col gap-6 p-10 md:p-12 rounded-[2.5rem] md:rounded-[3rem] bg-slate-50 border border-slate-100 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300 group">
            <div className="w-14 h-14 bg-[#050814] text-white rounded-[1.2rem] flex items-center justify-center shadow-lg group-hover:bg-emerald-500 group-hover:text-[#050814] transition-colors duration-300">
              <Smartphone size={26} aria-hidden="true" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black uppercase italic text-slate-900 tracking-tighter leading-tight mt-2">
              Você no Controle
            </h3>
            <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed">
              Diga adeus a taxas abusivas e intermediários. Exiba seu catálogo
              interno ou conecte seus próprios sistemas externos de forma
              invisível. O cliente fecha negócio onde você mandar.
            </p>
          </article>
        </div>
      </section>

      {/* --- TABELA DE PREÇOS PRO --- */}
      <section className="py-20 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white p-10 md:p-20 rounded-[3rem] md:rounded-[4rem] shadow-2xl border border-slate-100 relative overflow-hidden">
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-6 text-slate-900 leading-none relative z-10">
              PLANO <span className="text-emerald-500">TAFANU PRO</span>
            </h2>

            <div className="inline-flex items-center gap-2 bg-slate-900 text-white text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] px-5 py-2 rounded-full mb-12 relative z-10 shadow-md">
              <Sparkles size={14} className="text-emerald-400" />
              TESTE GRÁTIS POR 7 DIAS
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 mb-14 relative z-10">
              <div className="text-center">
                <span className="block text-slate-400 font-black text-sm uppercase mb-2 tracking-widest">
                  Hoje
                </span>
                <span className="text-5xl md:text-6xl font-black text-emerald-500 tracking-tighter italic">
                  GRÁTIS
                </span>
              </div>
              <div
                className="hidden md:block w-px h-20 bg-slate-200"
                aria-hidden="true"
              ></div>
              <div className="text-center flex flex-col items-center">
                <span className="block text-slate-400 font-black text-sm uppercase mb-2 tracking-widest">
                  Após 7 days
                </span>
                <span className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter italic">
                  R$ 39,90 <span className="text-2xl text-slate-500">/mês</span>
                </span>
              </div>
            </div>

            {/* 🚀 O LINK MÁGICO DUPLICADO NO RODAPÉ */}
            <a
              href={`/api/checkout-magico?uid=${userId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#050814] text-white font-black py-6 rounded-2xl md:rounded-[1.5rem] hover:bg-emerald-500 hover:text-[#050814] transition-colors duration-300 uppercase text-sm md:text-base tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl relative z-10 active:scale-95"
            >
              ATIVAR MEU TESTE GRÁTIS
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
