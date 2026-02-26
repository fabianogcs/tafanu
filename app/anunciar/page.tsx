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
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AnunciarPage() {
  // Colocamos o 'as any' aqui para o TypeScript parar de encher o saco!
  const session = (await auth()) as any;
  const userRole = session?.user?.role;
  const expiresAt = session?.user?.expiresAt;

  // O segurança agora sabe ler a data de validade!
  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false;

  // 1. BLOQUEIO DE QUEM JÁ É DE CASA (E COM A MENSALIDADE EM DIA)
  if (userRole === "ADMIN") redirect("/admin");
  if (userRole === "ASSINANTE" && !isExpired) redirect("/dashboard");

  // 2. LÓGICA DE DESTINO
  const destination = session
    ? "/checkout"
    : "/login?callbackUrl=/checkout&intent=assinante";

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-emerald-500 selection:text-white">
      {/* --- HERO: FOCO NO TESTE GRÁTIS --- */}
      <section className="relative bg-[#050814] text-white py-24 md:py-36 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50"></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-8">
            <ShieldCheck size={14} /> Satisfação Garantida ou Risco Zero
          </div>

          <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.9] mb-8">
            IMPULSIONE SEU <br />
            <span className="text-emerald-500">NEGÓCIO LOCAL.</span>
          </h1>

          <p className="text-lg md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto font-medium leading-tight">
            Crie sua vitrine profissional no Tafanu. Seja encontrado por
            clientes da sua região e receba contatos direto no seu WhatsApp.
            <span className="text-white block mt-2">
              Experimente todas as funções PRO por 7 dias.
            </span>
          </p>

          <div className="flex flex-col items-center gap-6">
            <Link
              href={destination}
              className="bg-emerald-500 text-[#050814] font-black text-lg px-12 py-6 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter"
            >
              COMEÇAR MEU TESTE GRÁTIS <ArrowRight size={20} />
            </Link>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
              7 dias grátis • Depois R$ 29,90/mês • Cancele quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* --- DIFERENCIAIS TÉCNICOS --- */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-5 p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-emerald-500/50 transition-colors group">
            <div className="w-12 h-12 bg-[#050814] text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-emerald-500 group-hover:text-[#050814] transition-colors">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-2xl font-black uppercase italic text-slate-900 tracking-tighter leading-none">
              Métricas Reais
            </h3>
            <p className="text-slate-500 font-medium leading-snug">
              Saiba exatamente quantas pessoas viram sua página e clicaram no
              seu botão de vendas.
            </p>
          </div>

          <div className="flex flex-col gap-5 p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-emerald-500/50 transition-colors group">
            <div className="w-12 h-12 bg-[#050814] text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-emerald-500 group-hover:text-[#050814] transition-colors">
              <Smartphone size={24} />
            </div>
            <h3 className="text-2xl font-black uppercase italic text-slate-900 tracking-tighter leading-none">
              Foco no Whats
            </h3>
            <p className="text-slate-500 font-medium leading-snug">
              Sem intermediários. O cliente clica e já cai direto na conversa
              com você para fechar o serviço.
            </p>
          </div>

          <div className="flex flex-col gap-5 p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-emerald-500/50 transition-colors group">
            <div className="w-12 h-12 bg-[#050814] text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-emerald-500 group-hover:text-[#050814] transition-colors">
              <Globe size={24} />
            </div>
            <h3 className="text-2xl font-black uppercase italic text-slate-900 tracking-tighter leading-none">
              SEO Local
            </h3>
            <p className="text-slate-500 font-medium leading-snug">
              Páginas otimizadas para que o Google entenda que seu negócio é a
              melhor opção na sua cidade.
            </p>
          </div>
        </div>
      </section>

      {/* --- CTA PRÁTICO: O QUADRO DE PREÇOS --- */}
      <section className="py-20 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white p-8 md:p-16 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 opacity-10 rounded-full blur-3xl"></div>

            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-4 text-slate-900 leading-none">
              PLANO <span className="text-emerald-500">TAFANU PRO</span>
            </h2>

            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mb-8">
              TESTE COMPLETO POR 7 DIAS SEM COBRANÇA
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
              <div className="text-center">
                <span className="block text-slate-400 font-black text-xs uppercase mb-1">
                  Hoje
                </span>
                <span className="text-5xl font-black text-emerald-500 tracking-tighter italic">
                  GRÁTIS
                </span>
              </div>
              <div className="hidden md:block w-px h-12 bg-slate-200"></div>
              <div className="text-center">
                <span className="block text-slate-400 font-black text-xs uppercase mb-1">
                  Após 7 dias
                </span>
                <span className="text-5xl font-black text-slate-900 tracking-tighter italic">
                  R$ 29,90
                </span>
              </div>
            </div>

            <Link
              href={destination}
              className="w-full bg-[#050814] text-white font-black py-6 rounded-2xl hover:bg-emerald-500 hover:text-[#050814] transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-3 shadow-2xl"
            >
              CRIAR MINHA VITRINE AGORA
            </Link>
          </div>
        </div>
      </section>

      {/* --- FAQ ATUALIZADO --- */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <div className="space-y-4">
          {[
            {
              q: "COMO FUNCIONA O PERÍODO GRÁTIS?",
              a: "Você inicia sua assinatura hoje e não paga nada. Tem 7 dias para usar todas as ferramentas. A primeira cobrança de R$ 29,90 só acontece no 8º dia, caso você decida continuar.",
            },
            {
              q: "PRECISO DE CARTÃO PARA COMEÇAR?",
              a: "Sim, solicitamos o cartão para garantir a continuidade do seu serviço após o período de teste e evitar interrupções no seu anúncio.",
            },
            {
              q: "POSSO CANCELAR ANTES DE SER COBRADO?",
              a: "Com certeza. Se você cancelar dentro dos 7 dias, nada será cobrado do seu cartão. O controle é totalmente seu pelo painel.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-8 rounded-3xl bg-white border border-slate-100 group hover:border-emerald-500/30 transition-colors"
            >
              <h4 className="font-black text-sm uppercase italic text-[#050814] mb-2 tracking-widest">
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
