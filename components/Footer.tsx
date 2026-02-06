import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-tafanu-blue text-white border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* BLOCO 1: Marca */}
          <div>
            <h2 className="text-2xl font-bold tracking-wider mb-3 text-white">
              TAFANU
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
              Conectando você aos melhores serviços e comércios da sua região.
              Simples, rápido e local.
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
              className="text-gray-400 hover:text-tafanu-action transition-colors text-sm"
            >
              Termos de Uso
            </Link>
            {/* NOVO LINK AQUI */}
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
              href="mailto:contato@tafanu.com"
              className="text-gray-400 hover:text-tafanu-action transition-colors text-sm flex items-center justify-center md:justify-start gap-2"
            >
              ✉️ contato@tafanu.com
            </a>

            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-tafanu-action transition-colors text-sm flex items-center justify-center md:justify-start gap-2"
            >
              📱 (11) 99999-9999
            </a>

            <div className="pt-4 text-gray-600 text-xs">
              <p>&copy; {currentYear} TAFANU.</p>
              <p>Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
