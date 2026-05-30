"use client";
import Link from "next/link";
import {
  ShieldCheck,
  AlertOctagon,
  Scale,
  Ban,
  FileWarning,
  RefreshCcw,
  Image as ImageIcon,
  Database,
  CreditCard,
} from "lucide-react";

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
              Atualizado em 30 de Maio de 2026
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
              O <strong>TAFANU</strong> atua exclusivamente como um hub de
              tecnologia e guia comercial. Não somos proprietários, vendedores,
              empregadores ou prestadores dos serviços listados nas vitrines.
              Toda e qualquer relação comercial, negociação ou entrega de
              produto ocorre estritamente entre o usuário final e o anunciante.
            </p>
          </section>

          {/* 2. DIREITOS AUTORAIS E RESPONSABILIDADE (MARCO CIVIL) */}
          <section className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
            <div className="flex items-center gap-2 mb-4 text-tafanu-blue">
              <ImageIcon size={20} />
              <h2 className="text-xl font-black uppercase italic m-0 tracking-tight">
                2. Direitos de Imagem e Propriedade Intelectual
              </h2>
            </div>
            <p className="text-slate-700 text-sm mb-4 leading-relaxed">
              Ao realizar o upload de fotos, logos, textos e vídeos na
              plataforma, o anunciante{" "}
              <strong>declara e garante legalmente</strong> ser o titular dos
              direitos autorais e de imagem de todo o conteúdo enviado, ou
              possuir autorização expressa para utilizá-los.
            </p>
            <div className="flex gap-3 items-start bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-lg">⚖️</span>
              <p className="text-[13px] text-slate-600 leading-relaxed text-left">
                Nos termos do{" "}
                <strong>
                  Artigo 19 do Marco Civil da Internet (Lei nº 12.965/2014)
                </strong>
                , o TAFANU atua apenas como provedor de aplicação e{" "}
                <strong>isenta-se totalmente</strong> de qualquer
                responsabilidade civil, penal ou indenizatória por conteúdos
                gerados por terceiros que violem direitos de marca, imagem ou
                patentes.
              </p>
            </div>
          </section>

          {/* 3. CONTEÚDO PROIBIDO */}
          <section className="p-6 bg-red-50 rounded-3xl border border-red-100">
            <div className="flex items-center gap-2 mb-4 text-red-600">
              <Ban size={20} />
              <h2 className="text-xl font-black uppercase italic m-0">
                3. Conteúdos Proibidos
              </h2>
            </div>
            <p className="text-slate-700 text-sm mb-4 font-medium">
              Para manter a integridade do ecossistema, é terminantemente
              proibido publicar conteúdos que envolvam:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px] font-bold text-slate-600 list-none p-0">
              <li className="flex items-center gap-2">
                ❌ Material impróprio, nudez ou ofensivo
              </li>
              <li className="flex items-center gap-2">
                ❌ Plágio ou uso indevido de marca alheia
              </li>
              <li className="flex items-center gap-2">
                ❌ Informações falsas ou enganosas
              </li>
              <li className="flex items-center gap-2">
                ❌ Propaganda política ou eleitoral
              </li>
              <li className="flex items-center gap-2">
                ❌ Spam, golpes ou esquemas ilegais
              </li>
              <li className="flex items-center gap-2">
                ❌ Venda de produtos ilícitos
              </li>
            </ul>
          </section>

          {/* 4. ASSINATURAS E REEMBOLSO (CDC) */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-tafanu-blue">
              <CreditCard size={20} />
              <h2 className="text-xl font-black uppercase italic m-0">
                4. Assinaturas e Direito de Arrependimento
              </h2>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm mb-4">
              A manutenção da vitrine online está condicionada ao pagamento da
              assinatura ativa.
            </p>
            <div className="space-y-4">
              <div className="flex gap-3 items-start bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-lg">✅</span>
                <p className="text-[13px] text-slate-600 leading-relaxed text-left">
                  <strong>Direito de Arrependimento (Art. 49 do CDC):</strong>{" "}
                  Para novas assinaturas, o anunciante possui o prazo de 7
                  (sete) dias corridos a partir da contratação para solicitar o
                  cancelamento com reembolso total.
                </p>
              </div>
              <div className="flex gap-3 items-start bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-lg">❌</span>
                <p className="text-[13px] text-slate-600 leading-relaxed text-left">
                  <strong>Cancelamentos Regulares:</strong> Após os 7 dias, o
                  cancelamento impede as próximas cobranças, mas não gera
                  estorno ou devolução proporcional do período já iniciado.
                </p>
              </div>
              <div className="flex gap-3 items-start bg-red-50 p-4 rounded-2xl border border-red-100">
                <span className="text-lg">⚠️</span>
                <p className="text-[13px] text-red-800 leading-relaxed text-left font-medium">
                  Contas banidas por violação de termos (fraude, plágio, etc.){" "}
                  <strong>não terão direito a reembolso</strong> sob nenhuma
                  circunstância.
                </p>
              </div>
            </div>
          </section>

          {/* 5. DADOS E PRIVACIDADE (LGPD) */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-tafanu-blue">
              <Database size={20} />
              <h2 className="text-xl font-black uppercase italic m-0">
                5. Tratamento de Dados (LGPD)
              </h2>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm">
              Em conformidade com a{" "}
              <strong>
                Lei Geral de Proteção de Dados (Lei nº 13.709/2018)
              </strong>
              , o TAFANU coleta os dados estritamente necessários para a
              prestação do serviço (cadastro, faturamento e analytics).
              Utilizamos tecnologias de rastreamento (como cookies e Meta Pixel)
              para otimização da plataforma, sendo o aceite gerenciado no
              momento do acesso. O usuário anunciante se compromete a não
              inserir dados sensíveis de terceiros na plataforma sem o devido
              consentimento.
            </p>
          </section>

          {/* 6. MODERAÇÃO E DENÚNCIAS */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-tafanu-blue">
              <AlertOctagon size={20} />
              <h2 className="text-xl font-black uppercase italic m-0">
                6. Moderação (Notice and Takedown)
              </h2>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm">
              O TAFANU disponibiliza canais diretos de denúncia nas vitrines.
              Caso haja suspeita de violação de direitos, o conteúdo será
              ocultado preventivamente para análise. Reservamo-nos o direito de
              remover vitrines do ar e rescindir o contrato de prestação de
              serviços unilateralmente para preservar a legalidade do ambiente.
            </p>
          </section>

          {/* 7. DISPONIBILIDADE DO SERVIÇO (SLA) */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-tafanu-blue">
              <FileWarning size={20} />
              <h2 className="text-xl font-black uppercase italic m-0">
                7. Isenção de Garantias de Disponibilidade
              </h2>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm">
              A plataforma é fornecida "no estado em que se encontra".
              Dependemos de infraestruturas de nuvem terceirizadas. Embora
              busquemos a estabilidade máxima, o TAFANU não garante que o
              serviço será ininterrupto, livre de erros ou totalmente imune a
              falhas externas, isentando-se de lucros cessantes decorrentes de
              eventuais instabilidades técnicas temporárias.
            </p>
          </section>

          <div className="pt-10 border-t border-slate-100 flex flex-col items-center gap-4">
            <button
              onClick={() => window.close()}
              className="px-8 py-3 bg-tafanu-blue text-white rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-lg"
            >
              Concordar e Fechar
            </button>
            <p className="text-[10px] text-slate-400 font-bold uppercase">
              &copy; {currentYear} TAFANU
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
