import { Metadata } from "next"; // 🚀 Adicionado para SEO
import {
  ArrowRight,
  Smartphone,
  Globe,
  BarChart3,
  ShieldCheck,
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

  const destination = session
    ? "/checkout"
    : "/login?callbackUrl=/checkout&intent=assinante";

  // 🚀 SEO AVANÇADO (JSON-LD): O Google lê isso invisivelmente e pode jogar seu FAQ direto nos resultados de busca!
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "COMO FUNCIONA O PERÍODO GRÁTIS E A GARANTIA?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Na sua primeira assinatura do plano Mensal, você tem 7 dias de Teste Grátis e a cobrança de R$ 39,90 só acontece no 8º dia. Nos planos Trimestral e Anual, você ganha um super desconto pagando no ato, mas tem a Garantia Incondicional de 7 Dias: se não gostar, devolvemos 100% do seu dinheiro.",
        },
      },
      {
        "@type": "Question",
        name: "PRECISO DE CARTÃO PARA COMEÇAR?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sim, solicitamos o cartão para garantir a continuidade do seu serviço e evitar interrupções. Na sua primeira assinatura do plano Mensal, nada será cobrado hoje.",
        },
      },
      {
        "@type": "Question",
        name: "POSSO CANCELAR E RECEBER MEU DINHEIRO DE VOLTA?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Com certeza. Se você cancelar o plano Mensal dentro dos 7 dias de teste da sua primeira assinatura, nada será cobrado. Se assinar o Trimestral ou Anual e cancelar em até 7 dias, estornamos 100% do valor pago. Risco zero.",
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

      {/* --- HERO: FOCO NO TESTE GRÁTIS --- */}
      <section className="relative bg-[#050814] text-white py-24 md:py-36 overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50 pointer-events-none"
          aria-hidden="true"
        ></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-8">
            <ShieldCheck size={14} aria-hidden="true" /> Satisfação Garantida ou
            Risco Zero
          </div>

          <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.9] mb-8">
            IMPULSIONE SEU <br />
            <span className="text-emerald-500">NEGÓCIO.</span>
          </h1>

          <p className="text-lg md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto font-medium leading-tight">
            Crie sua vitrine profissional no Tafanu e apareça para clientes que
            estão buscando produtos ou serviços. Receba contatos direto no seu
            WhatsApp.
            <span className="text-white block mt-2">
              Teste o Plano Mensal grátis por 7 dias na sua primeira assinatura.
            </span>
          </p>

          <div className="flex flex-col items-center gap-6">
            <Link
              href={destination}
              aria-label="Começar agora"
              className="bg-emerald-500 text-[#050814] font-black text-lg px-12 py-6 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter"
            >
              CRIAR MINHA VITRINE <ArrowRight size={20} aria-hidden="true" />
            </Link>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
              7 dias grátis na 1ª assinatura do Mensal • Cancele a qualquer
              momento
            </p>
          </div>
        </div>
      </section>

      {/* --- DIFERENCIAIS TÉCNICOS --- */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        {/* 🚀 SEO: H2 invisível apenas para estruturar a página para os robôs */}
        <h2 className="sr-only">Vantagens de Anunciar no Tafanu</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <article className="flex flex-col gap-5 p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-emerald-500/50 transition-colors group">
            <div className="w-12 h-12 bg-[#050814] text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-emerald-500 group-hover:text-[#050814] transition-colors">
              <BarChart3 size={24} aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-black uppercase italic text-slate-900 tracking-tighter leading-none">
              Métricas Reais
            </h3>
            <p className="text-slate-500 font-medium leading-snug">
              Saiba exatamente quantas pessoas viram sua página e clicaram no
              seu botão de vendas.
            </p>
          </article>

          <article className="flex flex-col gap-5 p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-emerald-500/50 transition-colors group">
            <div className="w-12 h-12 bg-[#050814] text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-emerald-500 group-hover:text-[#050814] transition-colors">
              <Smartphone size={24} aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-black uppercase italic text-slate-900 tracking-tighter leading-none">
              Foco no Whats
            </h3>
            <p className="text-slate-500 font-medium leading-snug">
              Sem intermediários. O cliente clica e já cai direto na conversa
              com você para fechar o serviço.
            </p>
          </article>

          <article className="flex flex-col gap-5 p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-emerald-500/50 transition-colors group">
            <div className="w-12 h-12 bg-[#050814] text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-emerald-500 group-hover:text-[#050814] transition-colors">
              <Globe size={24} aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-black uppercase italic text-slate-900 tracking-tighter leading-none">
              SEO Local
            </h3>
            <p className="text-slate-500 font-medium leading-snug">
              Páginas otimizadas para que o Google entenda que seu negócio é a
              melhor opção na sua cidade.
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
              TESTE O PLANO MENSAL GRÁTIS POR 7 DIAS (VÁLIDO NA 1ª ASSINATURA)
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-6">
              <div className="text-center">
                <span className="block text-slate-400 font-black text-xs uppercase mb-1">
                  Hoje (Plano Mensal)
                </span>
                <span className="text-5xl font-black text-emerald-500 tracking-tighter italic">
                  GRÁTIS
                </span>
              </div>
              <div
                className="hidden md:block w-px h-12 bg-slate-200"
                aria-hidden="true"
              ></div>
              <div className="text-center">
                <span className="block text-slate-400 font-black text-xs uppercase mb-1">
                  Após 7 dias
                </span>
                <span className="text-5xl font-black text-slate-900 tracking-tighter italic">
                  R$ 39,90
                </span>
              </div>
            </div>

            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-10">
              Ou escolha os planos Trimestral/Anual com garantia de 7 dias e{" "}
              <span className="text-emerald-500">descontos de até 25%</span>
            </p>

            <Link
              href={destination}
              aria-label="Criar minha vitrine agora"
              className="w-full bg-[#050814] text-white font-black py-6 rounded-2xl hover:bg-emerald-500 hover:text-[#050814] transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-3 shadow-2xl"
            >
              VER TODOS OS PLANOS
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
              q: "COMO FUNCIONA O PERÍODO GRÁTIS E A GARANTIA?",
              a: "Na sua primeira assinatura do plano Mensal, você tem 7 dias de Teste Grátis e a cobrança de R$ 39,90 só acontece no 8º dia. Nos planos Trimestral e Anual, você ganha um super desconto pagando no ato, mas tem a Garantia Incondicional de 7 Dias: se não gostar, devolvemos 100% do seu dinheiro.",
            },
            {
              q: "PRECISO DE CARTÃO PARA COMEÇAR?",
              a: "Sim, solicitamos o cartão para garantir a continuidade do seu serviço e evitar interrupções. Lembrando que na sua primeira assinatura do plano Mensal, nada será cobrado hoje.",
            },
            {
              q: "POSSO CANCELAR E RECEBER MEU DINHEIRO DE VOLTA?",
              a: "Com certeza. Se você cancelar o plano Mensal dentro dos 7 dias de teste da primeira assinatura, a cobrança nem chega a ser feita. Se assinar o Trimestral ou Anual e cancelar em até 7 dias, nós estornamos 100% do valor pago direto no seu cartão. Risco zero.",
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
