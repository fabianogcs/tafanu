"use client";

import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto flex flex-col relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-16 w-full relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 text-center md:text-left">
          <div className="md:col-span-2 flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1.5 shadow-[0_2px_15px_rgba(0,0,0,0.08)] border border-slate-100">
                <img
                  src="/logo.png"
                  alt="Tafanu Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">
                Tafanu
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm font-medium">
              Conectamos pessoas aos melhores serviços, comércios e
              profissionais da região. Onde bons negócios encontram grandes
              oportunidades.
            </p>
          </div>

          <div className="flex flex-col space-y-3">
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-2">
              Plataforma
            </h3>
            <Link
              href="/sobre"
              className="text-slate-500 hover:text-tafanu-action transition-colors text-sm font-medium"
            >
              Sobre Nós
            </Link>
            <Link
              href="/login"
              className="text-slate-500 hover:text-tafanu-action transition-colors text-sm font-medium"
            >
              Área do Cliente
            </Link>
            <Link
              href="/anunciar"
              className="text-tafanu-action font-bold hover:text-emerald-600 transition-colors text-sm flex items-center justify-center md:justify-start gap-1"
            >
              Criar Vitrine Digital &rarr;
            </Link>
          </div>

          <div className="flex flex-col space-y-3">
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-2">
              Suporte & Legal
            </h3>
            <a
              href="https://wa.me/5514991406618"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-tafanu-action transition-colors text-sm font-medium flex items-center justify-center md:justify-start gap-2"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
            <a
              href="mailto:contato@tafanu.com.br"
              className="text-slate-500 hover:text-tafanu-action transition-colors text-sm font-medium flex items-center justify-center md:justify-start gap-2"
            >
              <Mail size={16} /> contato@tafanu.com.br
            </a>
            <div className="pt-2 flex flex-col space-y-2">
              <Link
                href="/termos"
                className="text-slate-400 hover:text-slate-600 transition-colors text-xs"
              >
                Termos de Uso
              </Link>
              <Link
                href="/privacidade"
                className="text-slate-400 hover:text-slate-600 transition-colors text-xs"
              >
                Política de Privacidade
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 w-full py-6 border-t border-slate-200 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-[10px] md:text-xs text-slate-500 font-medium">
          <div className="text-center md:text-left mb-2 md:mb-0">
            &copy; {currentYear} TAFANU TECNOLOGIA. Todos os direitos
            reservados.
          </div>
          <div className="text-center md:text-right flex items-center justify-center gap-2">
            <span>CNPJ: 63.648.641/0001-77</span>
            <span className="hidden md:inline">•</span>
            <span>São Paulo, SP - Brasil</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
