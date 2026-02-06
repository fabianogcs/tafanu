import {
  Check,
  TrendingUp,
  Users,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

export default async function AnunciarPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  // Lógica de destino mantida
  const destination = userId ? "/checkout" : "/login?role=ASSINANTE";

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* --- HERO SECTION: IMPACTO TOTAL --- */}
      <section className="relative bg-[#0f172a] text-white py-20 md:py-32 overflow-hidden border-b border-white/5">
        {/* Efeito de luz de fundo */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-tafanu-action opacity-10 rounded-full blur-[120px] -mr-40 -mt-40"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-tafanu-blue opacity-20 rounded-full blur-[100px] -ml-20 -mb-20"></div>

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-white/5 border border-white/10 text-tafanu-action font-black text-[10px] uppercase tracking-[0.3em] mb-8">
            <Sparkles size={14} /> Oferta de Lançamento
          </div>

          <h1 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter leading-none mb-8">
            Domine o mercado <br />
            <span className="text-tafanu-action">da sua região.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Pare de brigar por migalhas nas redes sociais. Tenha uma vitrine
            profissional que converte visitantes em clientes reais.
          </p>

          <Link
            href={destination}
            className="bg-tafanu-action text-[#0f172a] font-black text-sm md:text-lg px-10 py-5 rounded-2xl shadow-2xl shadow-tafanu-action/20 hover:scale-105 transition-all inline-block uppercase tracking-widest"
          >
            Anunciar por R$ 1,00
          </Link>

          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-6 opacity-60">
            *Promoção válida pelos primeiros 30 dias
          </p>
        </div>
      </section>

      {/* --- BENEFÍCIOS: O DIFERENCIAL TAFANU --- */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <span className="text-tafanu-blue font-black text-[10px] uppercase tracking-[0.3em] mb-2 block">
              Diferenciais
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
              Por que escolher <br /> o Tafanu?
            </h2>
          </div>
          <p className="text-slate-500 font-medium max-w-sm">
            Nossa plataforma foi desenhada para quem não tem tempo a perder com
            configurações complexas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-tafanu-blue mb-8 group-hover:bg-tafanu-blue group-hover:text-white transition-all">
              <Users size={28} />
            </div>
            <h3 className="text-xl font-black uppercase italic text-slate-900 mb-4 tracking-tight">
              Foco Local
            </h3>
            <p className="text-slate-500 leading-relaxed text-sm font-medium">
              Sua página é otimizada para aparecer para quem está no seu bairro
              ou cidade. O cliente certo, no lugar certo.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-tafanu-blue mb-8 group-hover:bg-tafanu-blue group-hover:text-white transition-all">
              <MessageCircle size={28} />
            </div>
            <h3 className="text-xl font-black uppercase italic text-slate-900 mb-4 tracking-tight">
              Zero Taxas
            </h3>
            <p className="text-slate-500 leading-relaxed text-sm font-medium">
              Não somos intermediários. O cliente te chama direto no WhatsApp e
              você fecha a venda. Sem comissões ocultas.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-tafanu-blue mb-8 group-hover:bg-tafanu-blue group-hover:text-white transition-all">
              <TrendingUp size={28} />
            </div>
            <h3 className="text-xl font-black uppercase italic text-slate-900 mb-4 tracking-tight">
              SEO de Elite
            </h3>
            <p className="text-slate-500 leading-relaxed text-sm font-medium">
              Sua página profissional já nasce pronta para ser indexada pelos
              buscadores, passando autoridade para sua marca.
            </p>
          </div>
        </div>
      </section>

      {/* --- PRICING: A OFERTA IRRESISTÍVEL --- */}
      <section className="bg-[#0f172a] py-24 px-4">
        <div className="max-w-5xl mx-auto bg-white rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-slate-900 p-10 md:p-16 text-white relative">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-tafanu-blue/20 to-transparent"></div>
            <div className="relative z-10">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-8">
                Plano <br /> Profissional
              </h3>
              <div className="space-y-4">
                {[
                  "Página Slim Exclusiva",
                  "Galeria de Fotos Ultra-Leve",
                  "Botões de Rota e WhatsApp",
                  "Dashboard de Visitas Realtime",
                  "Suporte Prioritário",
                  "Sem Fidelidade (Cancele quando quiser)",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="bg-tafanu-action/20 text-tafanu-action p-1 rounded-full">
                      <Check size={12} strokeWidth={4} />
                    </div>
                    <span className="text-slate-300 text-sm font-bold uppercase tracking-tight">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:w-1/2 p-10 md:p-16 flex flex-col justify-center items-center text-center">
            <span className="text-slate-400 font-black text-xs uppercase tracking-widest line-through mb-2">
              De R$ 59,90
            </span>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-6xl font-black text-slate-900 tracking-tighter">
                R$ 1,00
              </span>
              <span className="text-slate-400 font-bold uppercase text-xs">
                / mês
              </span>
            </div>

            <div className="bg-slate-50 px-6 py-3 rounded-2xl mb-10 border border-slate-100">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Após 30 dias:{" "}
                <span className="text-tafanu-blue">R$ 29,90/mês</span>
              </p>
            </div>

            <Link
              href={destination}
              className="w-full bg-tafanu-blue text-white font-black py-5 rounded-2xl shadow-xl hover:bg-slate-900 transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-3 group"
            >
              Começar Agora{" "}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* --- FAQ COMPACTO --- */}
      {/* --- FAQ ABERTO E LIMPO (Substituindo o antigo) --- */}
      <section className="py-24 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-tafanu-blue font-black text-[10px] uppercase tracking-[0.3em] mb-2 block">
            Transparência
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
            Tudo o que você <br /> precisa saber
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pergunta 1 */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col">
            <h3 className="font-black uppercase italic text-sm text-tafanu-blue mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-tafanu-blue text-white rounded-full flex items-center justify-center text-[10px] not-italic">
                01
              </span>
              Tem fidelidade ou contrato?
            </h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Absolutamente nenhuma. O Tafanu é uma plataforma de assinatura
              mensal. Você pode cancelar o serviço a qualquer momento
              diretamente pelo seu painel, sem multas, sem taxas de saída e sem
              burocracia.
            </p>
          </div>

          {/* Pergunta 2 */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col">
            <h3 className="font-black uppercase italic text-sm text-tafanu-blue mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-tafanu-blue text-white rounded-full flex items-center justify-center text-[10px] not-italic">
                02
              </span>
              Como funciona o valor de R$ 1,00?
            </h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              O primeiro mês é uma oferta especial de boas-vindas para você
              validar a plataforma. A partir do segundo mês, o valor passa para
              R$ 29,90/mês automaticamente no seu cartão ou método de escolha.
            </p>
          </div>

          {/* Pergunta 3 */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col">
            <h3 className="font-black uppercase italic text-sm text-tafanu-blue mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-tafanu-blue text-white rounded-full flex items-center justify-center text-[10px] not-italic">
                03
              </span>
              Preciso ter CNPJ para anunciar?
            </h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Não! Você pode anunciar como Profissional Liberal usando seu CPF
              ou como Empresa usando seu CNPJ. O importante para nós é a
              veracidade dos seus dados para a segurança de quem busca.
            </p>
          </div>

          {/* Pergunta 4 */}
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col">
            <h3 className="font-black uppercase italic text-sm text-tafanu-blue mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-tafanu-blue text-white rounded-full flex items-center justify-center text-[10px] not-italic">
                04
              </span>
              Em quanto tempo minha página fica no ar?
            </h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Imediatamente. Assim que o pagamento for confirmado e você
              preencher os dados do seu negócio, sua página já estará disponível
              para ser acessada e compartilhada com seus clientes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
