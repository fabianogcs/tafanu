"use client";
import Link from "next/link";
import { ShieldCheck, AlertOctagon, Scale, Ban } from "lucide-react";

export default function TermosPage() {
  const currentYear = new Date().getFullYear();

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-tafanu-blue rounded-2xl text-white">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase italic">
              Termos de Uso
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              Atualizado em 08 de Fevereiro de 2026
            </p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none space-y-8">
          {/* 1. SOBRE O SERVIÇO */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-tafanu-blue">
              <Scale size={20} />
              <h2 className="text-xl font-black uppercase italic m-0">
                1. Natureza do Serviço
              </h2>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm">
              O **TAFANU** atua exclusivamente como um guia de anúncios e
              conexões locais. Não somos proprietários, vendedores ou
              prestadores dos serviços listados. A relação comercial ocorre
              diretamente entre o usuário e o anunciante.
            </p>
          </section>

          {/* 2. CONTEÚDO PROIBIDO (BLINDAGEM BASEADA NO SEU MODAL) */}
          <section className="p-6 bg-red-50 rounded-3xl border border-red-100">
            <div className="flex items-center gap-2 mb-4 text-red-600">
              <Ban size={20} />
              <h2 className="text-xl font-black uppercase italic m-0">
                2. Conteúdos Proibidos
              </h2>
            </div>
            <p className="text-slate-700 text-sm mb-4 font-medium">
              Para manter a segurança da comunidade, é terminantemente proibido
              publicar conteúdos que envolvam:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px] font-bold text-slate-600 list-none p-0">
              <li className="flex items-center gap-2">
                ❌ Material impróprio ou ofensivo
              </li>
              <li className="flex items-center gap-2">
                ❌ Plágio ou cópia de outros negócios
              </li>
              <li className="flex items-center gap-2">
                ❌ Informações falsas ou enganosas
              </li>
              <li className="flex items-center gap-2">
                ❌ Spam, golpes ou pirâmides
              </li>
              <li className="flex items-center gap-2">
                ❌ Conteúdo proibido para menores
              </li>
            </ul>
          </section>

          {/* 3. SISTEMA DE DENÚNCIAS */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-tafanu-blue">
              <AlertOctagon size={20} />
              <h2 className="text-xl font-black uppercase italic m-0">
                3. Moderação e Denúncias
              </h2>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm">
              O TAFANU oferece uma <strong>Central de Denúncia</strong> em cada
              perfil. Reservamo-nos o direito de remover, sem aviso prévio,
              anúncios que violem estes termos, podendo resultar no banimento
              definitivo do anunciante da plataforma.
            </p>
          </section>
          {/* 4. PLANOS E CANCELAMENTO - Versão Corrigida */}
          <section className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
            <div className="flex items-center gap-2 mb-4 text-slate-900">
              <Scale size={20} className="text-tafanu-blue" />
              <h2 className="text-xl font-black uppercase italic m-0 tracking-tight">
                4. Planos e Cancelamento
              </h2>
            </div>

            <p className="text-slate-700 text-sm mb-4 leading-relaxed text-left">
              O TAFANU oferece planos de assinatura para anunciantes. Ao
              assinar, o usuário concorda que:
            </p>

            <div className="space-y-4">
              {/* Item de Banimento com destaque correto */}
              <div className="flex gap-3 items-start bg-white p-4 rounded-2xl border border-red-100 shadow-sm">
                <span className="text-lg">⚠️</span>
                <p className="text-[13px] text-slate-600 leading-relaxed text-left">
                  No caso de{" "}
                  <strong className="text-red-600">
                    banimento por violação destes termos
                  </strong>{" "}
                  (como fraude, conteúdo impróprio ou plágio),
                  <strong className="text-slate-900">
                    {" "}
                    NÃO haverá devolução ou estorno
                  </strong>{" "}
                  dos valores pagos referentes à mensalidade vigente.
                </p>
              </div>

              {/* Item de Cancelamento */}
              <div className="flex gap-3 items-start bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-lg">✅</span>
                <p className="text-[13px] text-slate-600 leading-relaxed text-left">
                  O cancelamento da renovação pode ser feito a qualquer momento
                  pelo painel do anunciante, mas não gera reembolso proporcional
                  do mês já iniciado.
                </p>
              </div>
            </div>
          </section>

          <div className="pt-10 border-t border-slate-100 flex flex-col items-center gap-4">
            <button
              onClick={() => window.close()}
              className="px-8 py-3 bg-tafanu-blue text-white rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-lg"
            >
              Concordar e Fechar
            </button>
            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">
              (Após fechar, continue seu cadastro na aba anterior)
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase">
              &copy; {currentYear} TAFANU - Conectando Cidades
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
