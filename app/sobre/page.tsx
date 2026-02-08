import Link from "next/link";
import { Users, Target, Rocket, Heart } from "lucide-react";

export default function SobrePage() {
  const stats = [
    {
      label: "Propósito",
      value: "Conectar",
      icon: <Users className="text-blue-500" />,
    },
    {
      label: "Foco",
      value: "Local",
      icon: <Target className="text-red-500" />,
    },
    {
      label: "Visão",
      value: "Crescer",
      icon: <Rocket className="text-amber-500" />,
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section - Abertura */}
      <section className="py-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex p-3 bg-blue-50 rounded-2xl mb-6">
            <Heart
              className="text-tafanu-blue animate-pulse"
              fill="currentColor"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tighter mb-6">
            Mais que um guia, <br />
            <span className="text-tafanu-blue">uma conexão local.</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed font-medium">
            O TAFANU nasceu para simplificar a forma como você encontra serviços
            e comércios na sua região. Nossa missão é fortalecer o empreendedor
            local e facilitar a vida do consumidor.
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
            Por que usar o TAFANU?
          </h2>
          <p>
            Sabemos que o comércio local é o coração da cidade. Muitas vezes, o
            melhor serviço está a poucas quadras de você, mas é difícil de
            encontrar. O TAFANU centraliza essas informações de forma intuitiva,
            moderna e rápida.
          </p>
          <p>
            Para o <strong>anunciante</strong>, oferecemos uma vitrine
            profissional para alcançar novos clientes. Para o{" "}
            <strong>usuário</strong>, entregamos a praticidade de encontrar tudo
            em um só lugar, com sistema de denúncias e compartilhamento
            facilitado.
          </p>
        </div>

        <div className="mt-12 p-8 bg-tafanu-blue rounded-[2.5rem] text-center text-white">
          <h3 className="text-xl font-black uppercase italic mb-4">
            Pronto para começar?
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/anunciar"
              className="px-8 py-3 bg-white text-tafanu-blue rounded-xl font-black uppercase text-xs hover:bg-slate-100 transition-all"
            >
              Quero Anunciar
            </Link>
            <Link
              href="/"
              className="px-8 py-3 bg-tafanu-blue border border-white/30 text-white rounded-xl font-black uppercase text-xs hover:bg-white/10 transition-all"
            >
              Explorar Guia
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
