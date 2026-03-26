import Link from "next/link";
import { Users, Globe, Rocket, Zap } from "lucide-react";

export default function SobrePage() {
  const stats = [
    {
      label: "Propósito",
      value: "Conectar",
      icon: <Users className="text-blue-500" />,
    },
    {
      label: "Foco",
      value: "Expansão", // 🚀 Mudou de "Local" para "Expansão"
      icon: <Globe className="text-indigo-500" />,
    },
    {
      label: "Visão",
      value: "Escalar", // 🚀 Mudou de "Crescer" para "Escalar"
      icon: <Rocket className="text-amber-500" />,
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section - Abertura */}
      <section className="py-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex p-3 bg-blue-50 rounded-2xl mb-6">
            {/* 🚀 Troquei o coração por um Raio de energia/tecnologia */}
            <Zap
              className="text-tafanu-blue animate-pulse"
              fill="currentColor"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tighter mb-6">
            Mais que um diretório, <br />
            <span className="text-tafanu-blue">
              o ecossistema do seu negócio.
            </span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed font-medium max-w-2xl mx-auto">
            O TAFANU nasceu para revolucionar a forma como empresas e clientes
            se conectam. Nossa missão é elevar a presença digital de
            empreendedores e centralizar tudo o que o consumidor precisa em uma
            vitrine inteligente e de alto impacto.
          </p>
        </div>
      </section>

      {/* Grid de Valores */}
      <section className="py-16 max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((item, index) => (
            <div
              key={index}
              className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col items-center text-center group hover:border-tafanu-blue transition-all"
            >
              <div className="mb-4 p-4 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {item.label}
              </span>
              <h3 className="text-2xl font-black text-slate-900 uppercase italic">
                {item.value}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* Nossa História/Proposta */}
      <section className="py-16 bg-white max-w-3xl mx-auto px-6">
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <h2 className="text-2xl font-black text-slate-900 uppercase italic">
            Por que estar no TAFANU?
          </h2>
          <p>
            Acreditamos que todo negócio, não importa o tamanho, merece uma
            vitrine de nível profissional. No mercado atual, estar com links
            espalhados e informações fragmentadas não basta; é preciso uma
            presença digital forte, moderna e totalmente centralizada. O TAFANU
            transforma a forma como sua marca é vista.
          </p>
          <p>
            Para o <strong>empreendedor</strong>, oferecemos um hub tecnológico
            que une suas redes sociais, canais de venda (Shopee, Mercado Livre,
            iFood), contatos e portfólio em um layout premium de alta conversão.
            Para o <strong>cliente</strong>, entregamos a praticidade de
            encontrar, interagir e avaliar as melhores marcas em poucos
            segundos, sem fronteiras.
          </p>
        </div>

        <div className="mt-12 p-8 bg-tafanu-blue rounded-[2.5rem] text-center text-white">
          <h3 className="text-xl font-black uppercase italic mb-4">
            Pronto para expandir?
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/anunciar"
              className="px-8 py-3 bg-white text-tafanu-blue rounded-xl font-black uppercase text-xs hover:bg-slate-100 transition-all"
            >
              Criar Minha Vitrine
            </Link>
            <Link
              href="/"
              className="px-8 py-3 bg-tafanu-blue border border-white/30 text-white rounded-xl font-black uppercase text-xs hover:bg-white/10 transition-all"
            >
              Explorar Negócios
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
