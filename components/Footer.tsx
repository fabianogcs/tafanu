"use client";

import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-tafanu-blue text-white border-t border-gray-800 mt-auto flex flex-col">
      {/* Container Principal das Colunas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* BLOCO 1: Marca */}
          <div>
            <h2 className="text-2xl font-bold tracking-wider mb-3 text-white">
              TAFANU
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
              "Onde bons negócios encontram grandes oportunidades."
            </p>
          </div>

          {/* BLOCO 2: Navegação */}
          <div className="flex flex-col space-y-3">
            <h3 className="font-bold text-gray-200 mb-1">Menu</h3>
            <Link
              href="/sobre"
              className="text-gray-400 hover:text-tafanu-action transition-colors text-sm"
            >
              Sobre Nós
            </Link>
            <Link
              href="/termos"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-tafanu-action transition-colors text-sm"
            >
              Termos de Uso
            </Link>
            <Link
              href="/privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-tafanu-action transition-colors text-sm"
            >
              Política de Privacidade
            </Link>
            <Link
              href="/login"
              className="text-gray-400 hover:text-tafanu-action transition-colors text-sm"
            >
              Área do Cliente
            </Link>
            <Link
              href="/anunciar"
              className="text-tafanu-action font-bold hover:text-white transition-colors text-sm"
            >
              Quero Anunciar
            </Link>
          </div>

          {/* BLOCO 3: Contato */}
          <div className="flex flex-col space-y-3">
            <h3 className="font-bold text-gray-200 mb-1">Fale Conosco</h3>

            <a
              href="mailto:contato@tafanu.com.br"
              className="text-gray-400 hover:text-tafanu-action transition-colors text-sm flex items-center justify-center md:justify-start gap-2"
            >
              <Mail size={16} className="text-tafanu-action" />
              contato@tafanu.com.br
            </a>

            <a
              href="https://wa.me/5514991406618"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-tafanu-action transition-colors text-sm flex items-center justify-center md:justify-start gap-2"
            >
              <MessageCircle size={16} className="text-tafanu-action" />
              Falar com Atendimento
            </a>
          </div>
        </div>
      </div>

      {/* BLOCO 4: Barra Legal e CNPJ (Fundo mais escuro para contrastar) */}
      <div className="border-t border-gray-800 bg-black/20 w-full mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
          <div className="text-center md:text-left mb-3 md:mb-0 space-y-1">
            <p>&copy; {currentYear} TAFANU. Todos os direitos reservados.</p>
            <p>O seu guia oficial de negócios.</p>
          </div>

          <div className="text-center md:text-right space-y-1">
            <p className="font-medium text-gray-400">
              TAFANU - CNPJ: 63.648.641/0001-77
            </p>
            <p>São Paulo, SP - Brasil</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
