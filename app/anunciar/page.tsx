import { Metadata } from "next"; // 🚀 Adicionado para SEO
import {
  ArrowRight,
  Smartphone,
  Globe,
  BarChart3,
  ShieldCheck,
  Store,
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

// 🚀 METADATA DE ALTA CONVERSÃO: O que vai aparecer no Google e WhatsApp
export const metadata: Metadata = {
  title: "Anuncie no Tafanu | Teste 7 Dias Grátis",
  description:
    "Crie sua vitrine profissional no Tafanu. Apareça para quem está buscando seus produtos ou serviços e receba contatos direto no WhatsApp.",
  openGraph: {
    title: "Impulsione seu Negócio com o Tafanu",
    description:
      "Crie sua vitrine profissional e receba contatos direto no seu WhatsApp. Teste todas as funções PRO por 7 dias grátis na sua primeira assinatura.",
    type: "website",
  },
};

export default async function AnunciarPage() {
  const session = (await auth()) as any;
  const userRole = session?.user?.role;

  if (userRole === "ADMIN") redirect("/admin");
  if (userRole === "ASSINANTE") redirect("/dashboard");
  if (userRole === "AFILIADO") redirect("/dashboard");

  const destination = "/checkout";

  // 🚀 SEO AVANÇADO (JSON-LD): Ajustado para focar apenas no MVP Mensal
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
    <main className="bg-white min-h-screen font-sans selection:bg-emerald-500 selection:text-white">
      {/* 🚀 Script invisível do Google (Schema.org) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* --- HERO: FOCO NO TESTE GRÁTIS E PROVA VISUAL --- */}
      <section className="relative bg-[#050814] text-white pt-24 pb-12 md:pt-36 md:pb-24 overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50 pointer-events-none"
          aria-hidden="true"
        ></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-8">
            <ShieldCheck size={14} aria-hidden="true" /> Risco Zero
          </div>

          <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.9] mb-8">
            SUA VITRINE PRONTA EM <br />
            <span className="text-emerald-500">5 MINUTOS.</span>
          </h1>

          <p className="text-lg md:text-2xl text-slate-400 mb-10 max-w-3xl mx-auto font-medium leading-tight">
            Crie sua vitrine profissional no Tafanu, sem programação. Apareça
            para quem busca seus serviços e receba os clientes direto no
            WhatsApp.
            <span className="text-white block mt-2 text-sm md:text-lg">
              Teste todas as funções PRO grátis por 7 dias.
            </span>
          </p>

          <div className="flex flex-col items-center gap-6 mb-16">
            <Link
              href={destination}
              aria-label="Começar agora"
              className="bg-emerald-500 text-[#050814] font-black text-lg px-12 py-5 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter"
            >
              CRIAR MINHA VITRINE <ArrowRight size={20} aria-hidden="true" />
            </Link>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
              7 dias grátis na 1ª assinatura • Cancele a qualquer momento
            </p>
          </div>

          {/* 🚀 O VÍDEO (A PROVA IRREFUTÁVEL) */}
          <div className="relative max-w-5xl mx-auto rounded-2xl md:rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(16,185,129,0.15)] group animate-in slide-in-from-bottom-10 fade-in duration-1000">
            {/* Efeito de brilho na borda superior */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent z-20"></div>

            {/* Mockup Top Bar (Imitando a aba do navegador) */}
            <div className="bg-[#0A0F1E] border-b border-white/5 px-4 py-3 md:py-4 flex items-center gap-2 relative z-20">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-rose-500/80 shadow-sm"></div>
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-amber-500/80 shadow-sm"></div>
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-emerald-500/80 shadow-sm"></div>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 bg-white/5 border border-white/5 rounded-md px-4 py-1 hidden md:block text-[10px] text-white/40 font-mono tracking-widest">
                Editor Tafanu
              </div>
            </div>

            {/* O Vídeo Embutido */}
            <div className="relative aspect-video bg-black">
              {/* Overlay verde sutil que some quando passa o mouse (Efeito Premium) */}
              <div className="absolute inset-0 bg-emerald-500/10 group-hover:bg-transparent transition-colors duration-700 z-10 pointer-events-none"></div>

              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
              >
                <source src="/demo-tafanu.mp4" type="video/mp4" />
                {/* Fallback de texto caso o navegador seja muito antigo */}
                Seu navegador não suporta vídeos.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* --- DIFERENCIAIS TÉCNICOS --- */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        {/* 🚀 SEO: H2 invisível apenas para estruturar a página para os robôs */}
        <h2 className="sr-only">Vantagens de Anunciar no Tafanu</h2>

        {/* 🚀 CIRURGIA DE LAYOUT: Passamos para grid-cols-2 para formar um belo quadrado com 4 artigos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 🚀 O SEU NOVO DESTAQUE DE PORTAL E MÉTRICAS */}
          <article className="flex flex-col gap-5 p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-emerald-500/50 transition-colors group">
            <div className="w-12 h-12 bg-[#050814] text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-emerald-500 group-hover:text-[#050814] transition-colors">
              <Store size={24} aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-black uppercase italic text-slate-900 tracking-tighter leading-none">
              Vitrine e Portal de Buscas
            </h3>
            <p className="text-slate-500 font-medium leading-snug">
              Sua vitrine premium fica disponível no nosso portal para atrair
              novos clientes da sua região. Acompanhe o crescimento do seu
              negócio com métricas exatas de visitas e cliques direto no seu
              painel.
            </p>
          </article>

          <article className="flex flex-col gap-5 p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-emerald-500/50 transition-colors group">
            <div className="w-12 h-12 bg-[#050814] text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-emerald-500 group-hover:text-[#050814] transition-colors">
              <Smartphone size={24} aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-black uppercase italic text-slate-900 tracking-tighter leading-none">
              Venda Direta. Zero Taxas.
            </h3>
            <p className="text-slate-500 font-medium leading-snug">
              Sem aplicativos intermediários cobrando até 27% do seu lucro.
              Exiba seu catálogo de produtos ou portfólio de serviços, e o
              cliente fecha negócio direto no seu WhatsApp ou Painel.
            </p>
          </article>

          <article className="flex flex-col gap-5 p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-emerald-500/50 transition-colors group">
            <div className="w-12 h-12 bg-[#050814] text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-emerald-500 group-hover:text-[#050814] transition-colors">
              <BarChart3 size={24} aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-black uppercase italic text-slate-900 tracking-tighter leading-none">
              Gestão de Excelência
            </h3>
            <p className="text-slate-500 font-medium leading-snug">
              Pare de anotar pedidos e orçamentos no papel. Tenha um sistema
              Kanban em tempo real para organizar seus clientes, imprimir
              comprovantes e acompanhar suas solicitações.
            </p>
          </article>

          <article className="flex flex-col gap-5 p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-emerald-500/50 transition-colors group">
            <div className="w-12 h-12 bg-[#050814] text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-emerald-500 group-hover:text-[#050814] transition-colors">
              <Globe size={24} aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-black uppercase italic text-slate-900 tracking-tighter leading-none">
              O "Ímã" do Google
            </h3>
            <p className="text-slate-500 font-medium leading-snug">
              Aplicamos tecnologia de SEO por trás da sua vitrine. Assim, sempre
              que alguém buscar pelo seu serviço ou produto na sua cidade, o
              Google recomendará a sua página oficial.
            </p>
          </article>
        </div>
      </section>

      {/* --- CTA PRÁTICO: O QUADRO DE PREÇOS --- */}
      <section className="py-20 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white p-8 md:p-16 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
            <div
              className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 opacity-10 rounded-full blur-3xl pointer-events-none"
              aria-hidden="true"
            ></div>
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-4 text-slate-900 leading-none">
              PLANO <span className="text-emerald-500">TAFANU PRO</span>
            </h2>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mb-8">
              TESTE GRÁTIS POR 7 DIAS (VÁLIDO NA 1ª ASSINATURA)
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-10">
              <div className="text-center">
                <span className="block text-slate-400 font-black text-xs uppercase mb-1">
                  Hoje
                </span>
                <span className="text-5xl font-black text-emerald-500 tracking-tighter italic">
                  GRÁTIS
                </span>
              </div>
              <div
                className="hidden md:block w-px h-12 bg-slate-200"
                aria-hidden="true"
              ></div>
              <div className="text-center flex flex-col items-center">
                <span className="block text-slate-400 font-black text-xs uppercase mb-1">
                  Após 7 dias
                </span>
                <span className="text-5xl font-black text-slate-900 tracking-tighter italic">
                  R$ 39,90 <span className="text-xl text-slate-500">/mês</span>
                </span>
                {/* 🚀 ESTRATÉGIA DE ANCORAGEM (Neuromarketing) */}
                <div className="mt-2 inline-flex items-center bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-black uppercase tracking-wider py-1.5 px-4 rounded-full shadow-sm">
                  O equivalente a R$ 1,33 por dia
                </div>
              </div>
            </div>{" "}
            {/* 🚀 AQUI ESTÁ A DIV QUE FALTAVA PARA FECHAR O BLOCO! */}
            <Link
              href={destination}
              aria-label="Ativar meu teste grátis agora"
              className="w-full bg-[#050814] text-white font-black py-6 rounded-2xl hover:bg-emerald-500 hover:text-[#050814] transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-3 shadow-2xl"
            >
              ATIVAR MEU TESTE GRÁTIS
            </Link>
          </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <h2 className="sr-only">Perguntas Frequentes</h2>
        <div className="space-y-4">
          {[
            {
              q: "COMO FUNCIONA O PERÍODO GRÁTIS?",
              a: "Na sua primeira assinatura do plano Tafanu PRO, você tem 7 dias de Teste Grátis. A primeira cobrança de R$ 39,90 só acontece no 8º dia. Se não gostar, basta cancelar antes e nada será cobrado.",
            },
            {
              q: "PRECISO DE CARTÃO PARA COMEÇAR?",
              a: "Sim, solicitamos o cartão para garantir a continuidade do seu serviço e evitar interrupções. Mas fique tranquilo, na sua primeira assinatura, absolutamente nada será cobrado hoje.",
            },
            {
              q: "POSSO CANCELAR A QUALQUER MOMENTO?",
              a: "Com certeza. Se você cancelar dentro dos 7 dias de teste, a cobrança nem chega a ser feita. O cancelamento é feito direto no seu painel, sem multas e sem burocracia.",
            },
          ].map((item, i) => (
            <article
              key={i}
              className="p-8 rounded-3xl bg-white border border-slate-100 group hover:border-emerald-500/30 transition-colors"
            >
              <h3 className="font-black text-sm uppercase italic text-[#050814] mb-2 tracking-widest">
                {item.q}
              </h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                {item.a}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
