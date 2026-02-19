"use client";

import Link from "next/link";
import {
  Utensils,
  Stethoscope,
  Scissors,
  Wrench,
  Car,
  Briefcase,
  ShoppingBag,
  Dog,
  Zap, // Ícone genérico de segurança
} from "lucide-react";

// Mapeamento EXATO com as chaves do seu BusinessEditor (TAFANU_CATEGORIES)
const categoriesData = [
  {
    name: "Alimentação",
    icon: Utensils,
    color: "bg-orange-100 text-orange-600",
  },
  {
    name: "Automotivo",
    icon: Car,
    color: "bg-red-100 text-red-600",
  },
  {
    name: "Beleza e Estética",
    icon: Scissors,
    color: "bg-pink-100 text-pink-600",
  },
  {
    name: "Comércio Local",
    icon: ShoppingBag,
    color: "bg-green-100 text-green-600",
  },
  {
    name: "Pets", // Agora bate com o editor
    icon: Dog,
    color: "bg-teal-100 text-teal-600",
  },
  {
    name: "Profissionais",
    icon: Briefcase,
    color: "bg-purple-100 text-purple-600",
  },
  {
    name: "Saúde e Bem-Estar", // Atenção ao hífen e maiúsculas
    icon: Stethoscope,
    color: "bg-blue-100 text-blue-600",
  },
  {
    name: "Serviços Casa",
    icon: Wrench,
    color: "bg-yellow-100 text-yellow-600",
  },
];

export default function Categories({ activeCats }: { activeCats: string[] }) {
  // Se a lista do banco vier vazia ou nula, não mostra nada
  if (!activeCats || activeCats.length === 0) return null;

  // Filtra para mostrar SÓ o que tem no banco
  const visibleCategories = categoriesData.filter((cat) =>
    activeCats.includes(cat.name),
  );

  // Se depois de filtrar não sobrar nada, esconde a seção
  if (visibleCategories.length === 0) return null;

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-tafanu-blue mb-4 uppercase italic tracking-tighter">
          Explore por Categorias
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Tudo está organizado para facilitar sua vida. Escolha uma área e
          encontre o profissional ideal em segundos.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {visibleCategories.map((cat) => (
          <Link
            key={cat.name}
            href={`/busca?category=${encodeURIComponent(cat.name)}`}
            className="group cursor-pointer bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-tafanu-blue transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center"
          >
            <div
              className={`w-14 h-14 ${cat.color} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner`}
            >
              <cat.icon size={28} />
            </div>
            <h3 className="font-bold text-gray-800 group-hover:text-tafanu-blue transition-colors uppercase text-sm">
              {cat.name}
            </h3>
            <p className="text-xs text-gray-400 mt-2 font-medium bg-gray-50 px-2 py-1 rounded-full group-hover:bg-tafanu-blue/10 group-hover:text-tafanu-blue transition-colors">
              Ver opções &rarr;
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
