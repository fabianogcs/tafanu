import { Metadata } from "next";
import {
  Smartphone,
  Store,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  MapPin,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CheckoutButton from "@/components/CheckoutButton";

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
          text: "Sim, solicitamos o cartão para garantir a continuidade do seu serviço. Mas fique tranquilo, na sua primeira assinatura, absolutamente nada será cobrado hoje.",
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
    <main className="bg-slate-50 min-h-screen font-sans selection:bg-tafanu-action selection:text-white pb-20 relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* 🚀 CIRURGIA 1: BOTÃO WHATSAPP FLUTUANTE DE VENDAS */}
      <a
        href="https://wa.me/5514991406618?text=Ol%C3%A1!%20Estou%20na%20p%C3%A1gina%20de%20planos%20do%20Tafanu%20e%20gostaria%20de%20tirar%20uma%20d%C3%BAvida."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 md:bottom-8 right-4 md:right-8 bg-[#25D366] text-white p-4 rounded-full shadow-[0_10px_25px_rgba(37,211,102,0.4)] hover:scale-110 active:scale-95 transition-all z-[100] flex items-center justify-center group"
        title="Falar com Atendimento"
      >
        <MessageCircle size={28} />
        <span className="absolute right-full mr-4 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block">
          Precisa de ajuda?
        </span>
      </a>

      {/* --- HERO BANNER --- */}
      <section className="bg-white pt-24 pb-16 md:pt-28 md:pb-20 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase italic tracking-tighter leading-[1] text-slate-900 mb-6">
            Divulgue sua empresa na <br className="hidden md:block" />
            <span className="text-tafanu-action">Vitrine Inteligente</span> da
            cidade
          </h1>
          <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed mb-10">
            Sem taxas por venda, sem complicação. Mais visibilidade, mais
            contatos no seu WhatsApp e mais oportunidades reais para o seu
            negócio crescer.
          </p>
        </div>
      </section>

      {/* --- A ESTRUTURA DE ANCORAGEM (PLANOS) --- */}
      <section className="max-w-6xl mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center mb-10 shadow-sm max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full text-tafanu-action mb-3 shadow-sm border border-emerald-100">
            <Sparkles size={24} />
          </div>
          <h3 className="text-lg font-black text-emerald-900 uppercase tracking-tight">
            Comece com 7 Dias Grátis para testar
          </h3>
          <p className="text-emerald-700 text-sm font-medium mt-1">
            Cadastre sua loja hoje e teste todos os recursos de conversão sem
            pagar nada agora.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-stretch justify-center">
          <div className="flex-1 bg-white border border-slate-200 rounded-[2rem] p-8 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
            <h3 className="text-xl font-black text-slate-900 uppercase italic mb-2">
              Básico
            </h3>
            <p className="text-slate-500 text-sm font-medium mb-6 min-h-[40px]">
              Para quem quer apenas estar no mapa, sem destaques.
            </p>
            <div className="mb-8">
              <span className="text-4xl font-black text-slate-900 tracking-tighter">
                R$ 29,90
              </span>
              <span className="text-slate-500 font-medium">/mês</span>
            </div>

            <button
              disabled
              className="w-full py-4 bg-slate-100 text-slate-400 font-black rounded-xl uppercase tracking-widest text-xs mb-8"
            >
              Plano Indisponível
            </button>

            <div className="space-y-4 text-sm font-medium text-slate-600">
              <p className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-slate-400" /> Presença
                nas buscas simples
              </p>
              <p className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-slate-400" /> 3 fotos na
                galeria
              </p>
              <p className="flex items-center gap-3 text-slate-400">
                <XCircle size={18} /> Sem painel de métricas
              </p>
              <p className="flex items-center gap-3 text-slate-400">
                <XCircle size={18} /> Sem botão de WhatsApp
              </p>
            </div>
          </div>

          <div className="flex-[1.2] bg-white border-2 border-tafanu-action rounded-[2rem] p-8 shadow-2xl relative transform lg:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-tafanu-action text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
              Plano Recomendado
            </div>

            <div className="text-center mb-8">
              <h3 className="text-3xl font-black text-slate-900 uppercase italic mb-2">
                Tafanu PRO
              </h3>
              <p className="text-slate-500 text-sm font-medium">
                Ecossistema completo de vendas para dominar a sua região.
              </p>
            </div>

            <div className="text-center mb-8 bg-slate-50 py-6 rounded-2xl border border-slate-100">
              <span className="text-5xl font-black text-slate-900 tracking-tighter">
                R$ 39,90
              </span>
              <span className="text-slate-500 font-bold">/mês</span>
            </div>

            <div className="mb-8">
              <CheckoutButton userId={userId} />
            </div>

            <div className="space-y-6 text-sm font-medium text-slate-700">
              {/* 🚀 CIRURGIA 2: TEXTOS MATADORES E ESPECÍFICOS */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-2">
                  Conteúdo e Conversão
                </p>
                <div className="space-y-3">
                  <p className="flex items-center gap-3">
                    <CheckCircle2
                      size={18}
                      className="text-tafanu-action shrink-0"
                    />{" "}
                    Botões para Delivery (iFood, Anota Aí) e Agendamentos
                  </p>
                  <p className="flex items-center gap-3">
                    <CheckCircle2
                      size={18}
                      className="text-tafanu-action shrink-0"
                    />{" "}
                    Envio de Cardápio ou Catálogo em PDF na Vitrine
                  </p>
                  <p className="flex items-center gap-3">
                    <CheckCircle2
                      size={18}
                      className="text-tafanu-action shrink-0"
                    />{" "}
                    Até 12 fotos em alta resolução e Embed de Vídeos
                  </p>
                  <p className="flex items-center gap-3">
                    <CheckCircle2
                      size={18}
                      className="text-tafanu-action shrink-0"
                    />{" "}
                    Logo, Destaques, Horários e FAQ
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-2">
                  Analytics Completo
                </p>
                <div className="space-y-3">
                  <p className="flex items-center gap-3">
                    <CheckCircle2
                      size={18}
                      className="text-tafanu-action shrink-0"
                    />{" "}
                    Painel de Visitas da Vitrine em tempo real
                  </p>
                  <p className="flex items-center gap-3">
                    <CheckCircle2
                      size={18}
                      className="text-tafanu-action shrink-0"
                    />{" "}
                    Cliques no WhatsApp, Site e Mapa
                  </p>
                  <p className="flex items-center gap-3">
                    <CheckCircle2
                      size={18}
                      className="text-tafanu-action shrink-0"
                    />{" "}
                    Cliques no Instagram, TikTok e Facebook
                  </p>
                  <p className="flex items-center gap-3">
                    <CheckCircle2
                      size={18}
                      className="text-tafanu-action shrink-0"
                    />{" "}
                    Quantidade de Pessoas que Favoritaram a Loja
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-2">
                  Busca e Posicionamento
                </p>
                <div className="space-y-3">
                  <p className="flex items-center gap-3">
                    <CheckCircle2
                      size={18}
                      className="text-tafanu-action shrink-0"
                    />{" "}
                    Posicionamento inteligente no mapa (SEO Local)
                  </p>
                  <p className="flex items-center gap-3">
                    <CheckCircle2
                      size={18}
                      className="text-tafanu-action shrink-0"
                    />{" "}
                    Botões flutuantes direto para suas redes
                  </p>
                  <p className="flex items-center gap-3">
                    <CheckCircle2
                      size={18}
                      className="text-tafanu-action shrink-0"
                    />{" "}
                    Sistema de busca semântica completa
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-white border border-slate-200 rounded-[2rem] p-8 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
            <h3 className="text-xl font-black text-slate-900 uppercase italic mb-2">
              Corporate
            </h3>
            <p className="text-slate-500 text-sm font-medium mb-6 min-h-[40px]">
              Para franquias e redes com mais de 5 unidades.
            </p>
            <div className="mb-8">
              <span className="text-4xl font-black text-slate-900 tracking-tighter">
                R$ 199,90
              </span>
              <span className="text-slate-500 font-medium">/mês</span>
            </div>

            <button
              disabled
              className="w-full py-4 bg-slate-100 text-slate-400 font-black rounded-xl uppercase tracking-widest text-xs mb-8"
            >
              Fale com Especialista
            </button>

            <div className="space-y-4 text-sm font-medium text-slate-600">
              <p className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-slate-400" /> Tudo do
                plano PRO
              </p>
              <p className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-slate-400" /> API de
                Integração
              </p>
              <p className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-slate-400" /> Gerente de
                Conta Dedicado
              </p>
              <p className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-slate-400" /> Múltiplos
                CNPJs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- DIFERENCIAIS --- */}
      <section className="py-20 md:py-28 px-6 max-w-6xl mx-auto mt-10 border-t border-slate-200">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black uppercase italic text-slate-900 tracking-tighter mb-4">
            Foco em visibilidade e conexão
          </h2>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto">
            Conecte sua loja a milhares de compradores da sua região prontos
            para fechar negócio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-emerald-50 text-tafanu-action rounded-full flex items-center justify-center mb-6">
              <Store size={24} />
            </div>
            <h4 className="text-lg font-black text-slate-900 mb-3">
              Mais Visibilidade
            </h4>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">
              Sua loja ganha destaque no maior catálogo digital da região,
              alcançando clientes sem depender apenas de panfletos ou anúncios
              caros.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-emerald-50 text-tafanu-action rounded-full flex items-center justify-center mb-6">
              <Smartphone size={24} />
            </div>
            <h4 className="text-lg font-black text-slate-900 mb-3">
              Contatos Diretos
            </h4>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">
              Os interessados entram em contato pelos seus próprios canais —
              WhatsApp, Instagram ou site — sem intermediários e sem taxas.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center flex flex-col items-center lg:col-span-1 md:col-span-2">
            <div className="w-14 h-14 bg-emerald-50 text-tafanu-action rounded-full flex items-center justify-center mb-6">
              <MapPin size={24} />
            </div>
            <h4 className="text-lg font-black text-slate-900 mb-3">
              Fácil de Gerenciar
            </h4>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">
              Crie sua vitrine em minutos: adicione fotos, produtos e contatos
              em um painel simples, intuitivo e no celular.
            </p>
          </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-20 px-6 max-w-3xl mx-auto border-t border-slate-200">
        <h2 className="text-3xl font-black uppercase italic text-slate-900 tracking-tighter mb-10 text-center">
          Perguntas Frequentes
        </h2>

        <div className="space-y-4">
          <details className="group bg-white border border-slate-200 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-slate-800">
              Como funciona o período grátis?
              <span className="transition group-open:rotate-180">
                <svg
                  fill="none"
                  height="24"
                  shapeRendering="geometricPrecision"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path d="M6 9l6 6 6-6"></path>
                </svg>
              </span>
            </summary>
            <div className="px-6 pb-6 text-slate-500 text-sm leading-relaxed">
              Na sua primeira assinatura do plano Tafanu PRO, você tem 7 dias de
              Teste Grátis. A primeira cobrança de R$ 39,90 só acontece no 8º
              dia. Se não gostar, basta cancelar antes e nada será cobrado.
            </div>
          </details>

          <details className="group bg-white border border-slate-200 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-slate-800">
              Posso cancelar a qualquer momento?
              <span className="transition group-open:rotate-180">
                <svg
                  fill="none"
                  height="24"
                  shapeRendering="geometricPrecision"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path d="M6 9l6 6 6-6"></path>
                </svg>
              </span>
            </summary>
            <div className="px-6 pb-6 text-slate-500 text-sm leading-relaxed">
              Com certeza. Se você cancelar dentro dos 7 dias de teste, a
              cobrança nem chega a ser feita. O cancelamento é feito direto no
              seu painel de controle, sem multas e sem burocracia.
            </div>
          </details>

          <details className="group bg-white border border-slate-200 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-slate-800">
              A Plataforma cobra taxas sobre minhas vendas?
              <span className="transition group-open:rotate-180">
                <svg
                  fill="none"
                  height="24"
                  shapeRendering="geometricPrecision"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path d="M6 9l6 6 6-6"></path>
                </svg>
              </span>
            </summary>
            <div className="px-6 pb-6 text-slate-500 text-sm leading-relaxed">
              Não! Nós não somos intermediários. O cliente acha você no Tafanu e
              clica para ir direto para o seu WhatsApp, seu Instagram ou sua
              Maquininha. Você paga apenas a assinatura mensal da vitrine e fica
              com 100% do lucro das suas vendas.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}
