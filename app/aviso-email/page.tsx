import { MailCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verifique seu E-mail | Tafanu",
  robots: { index: false, follow: false },
};

export default function AvisoEmailPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 selection:bg-tafanu-action selection:text-white">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-700 relative overflow-hidden">
        {/* Glow de fundo sutil */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-tafanu-action/5 blur-[40px] rounded-full pointer-events-none" />

        <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-sm relative">
          <div className="absolute inset-0 bg-tafanu-action/20 rounded-full animate-ping opacity-50" />
          <MailCheck size={32} className="text-tafanu-action relative z-10" />
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-slate-900 italic uppercase tracking-tighter mb-3 relative z-10">
          Link <span className="text-tafanu-action">Enviado!</span>
        </h1>

        <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed mb-8 relative z-10">
          Por questões de segurança, enviamos as instruções de ativação da sua
          vitrine para o seu e-mail cadastrado.
          <br />
          <br />
          Abra o seu e-mail e clique no botão seguro para continuar.
        </p>

        <Link
          href="/"
          className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 border border-slate-200 shadow-sm hover:shadow active:scale-95 relative z-10"
        >
          <ArrowLeft size={16} /> Voltar para o Início
        </Link>
      </div>
    </div>
  );
}
