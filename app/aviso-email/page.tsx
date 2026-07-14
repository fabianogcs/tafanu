import { MailCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verifique seu E-mail | Tafanu",
  robots: { index: false, follow: false },
};

export default function AvisoEmailPage() {
  return (
    <div className="min-h-screen bg-[#050B14] flex flex-col items-center justify-center p-6 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-md bg-[#0D172A] border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-700">
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-50" />
          <MailCheck size={32} className="text-emerald-400 relative z-10" />
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter mb-3">
          Link <span className="text-emerald-500">Enviado!</span>
        </h1>

        <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed mb-8">
          Por questões de segurança, enviamos as instruções de ativação da sua
          vitrine para o seu e-mail cadastrado.
          <br />
          <br />
          Abra o seu e-mail e clique no botão seguro para continuar.
        </p>

        <Link
          href="/"
          className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 border border-slate-800 hover:border-slate-700"
        >
          <ArrowLeft size={16} /> Voltar para o Início
        </Link>
      </div>
    </div>
  );
}
