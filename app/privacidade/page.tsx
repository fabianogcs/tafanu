"use client";
import Link from "next/link";
import {
  Lock,
  Eye,
  Database,
  Cookie,
  Trash2,
  Share2,
  ShieldCheck,
} from "lucide-react";

export default function PrivacidadePage() {
  const currentYear = new Date().getFullYear();

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-tafanu-blue rounded-2xl text-white">
            <Lock size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase italic">
              Política de Privacidade
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              Atualizado em 30 de Maio de 2026
            </p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <p className="text-slate-600 leading-relaxed text-sm font-medium">
              O <strong>TAFANU</strong> leva a sua privacidade a sério. Esta
              Política descreve como coletamos, usamos e protegemos suas
              informações pessoais em conformidade com a Lei Geral de Proteção
              de Dados (LGPD - Lei nº 13.709/2018).
            </p>
          </section>

          {/* 1. DADOS COLETADOS */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-tafanu-blue">
              <Database size={20} />
              <h2 className="text-xl font-black uppercase italic m-0">
                1. Quais dados coletamos
              </h2>
            </div>
            <ul className="space-y-2 text-sm text-slate-600 list-disc pl-5">
              <li>
                <strong>Dados de Cadastro:</strong> Nome, e-mail e senha
                criptografada quando você cria uma conta.
              </li>
              <li>
                <strong>Dados de Negócios:</strong> Informações públicas da sua
                vitrine (telefone, endereço, redes sociais e mídias).
              </li>
              <li>
                <strong>Dados de Navegação:</strong> Endereço IP, tipo de
                navegador, páginas visitadas e tempo de permanência (coletados
                via Vercel Analytics e Meta Pixel).
              </li>
            </ul>
          </section>

          {/* 2. COMO USAMOS */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-tafanu-blue">
              <Eye size={20} />
              <h2 className="text-xl font-black uppercase italic m-0">
                2. Como utilizamos seus dados
              </h2>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm mb-4">
              Seus dados são utilizados exclusivamente para:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px] font-bold text-slate-600 list-none p-0">
              <li className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                ✅ Autenticar seu acesso à plataforma
              </li>
              <li className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                ✅ Processar assinaturas e pagamentos
              </li>
              <li className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                ✅ Exibir sua vitrine publicamente
              </li>
              <li className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                ✅ Melhorar a performance e usabilidade
              </li>
            </ul>
          </section>

          {/* 3. COMPARTILHAMENTO */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-tafanu-blue">
              <Share2 size={20} />
              <h2 className="text-xl font-black uppercase italic m-0">
                3. Compartilhamento com Terceiros
              </h2>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm mb-4">
              O TAFANU não vende seus dados. Compartilhamos informações apenas
              com infraestruturas essenciais para o funcionamento do sistema:
            </p>
            <div className="space-y-3">
              <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <strong className="text-slate-900 text-sm block mb-1">
                  Processadores de Pagamento (Mercado Pago):
                </strong>
                <span className="text-[13px] text-slate-500">
                  Dados financeiros transitam diretamente nos servidores deles.
                  O TAFANU não armazena números de cartão de crédito.
                </span>
              </div>
              <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <strong className="text-slate-900 text-sm block mb-1">
                  Armazenamento em Nuvem (UploadThing & Vercel):
                </strong>
                <span className="text-[13px] text-slate-500">
                  Hospedagem segura das fotos, vídeos e banco de dados.
                </span>
              </div>
            </div>
          </section>

          {/* 4. PIXEL E COOKIES */}
          <section className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
            <div className="flex items-center gap-2 mb-4 text-tafanu-blue">
              <Cookie size={20} />
              <h2 className="text-xl font-black uppercase italic m-0 tracking-tight">
                4. Cookies e Meta Pixel
              </h2>
            </div>
            <p className="text-slate-700 text-[13px] leading-relaxed">
              Utilizamos cookies e tecnologias de rastreamento de terceiros,
              como o <strong>Meta Pixel</strong>, para entender o comportamento
              dos visitantes e otimizar nossas campanhas de publicidade. Esses
              rastreadores podem coletar dados sobre as páginas que você visita
              e interações feitas no site. Você pode desativar a coleta não
              essencial recusando o consentimento em nosso banner inicial.
            </p>
          </section>

          {/* 5. SEUS DIREITOS */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-tafanu-blue">
              <ShieldCheck size={20} />
              <h2 className="text-xl font-black uppercase italic m-0">
                5. Seus Direitos (LGPD)
              </h2>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm mb-4">
              Você tem o direito de solicitar a qualquer momento:
            </p>
            <ul className="space-y-2 text-sm text-slate-600 list-disc pl-5">
              <li>A confirmação da existência de tratamento dos seus dados.</li>
              <li>
                A correção de dados incompletos, inexatos ou desatualizados.
              </li>
              <li>
                A anonimização, bloqueio ou eliminação de dados desnecessários.
              </li>
            </ul>
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
