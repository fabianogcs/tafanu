"use client";

import { useRouter } from "next/navigation";
import {
  Utensils,
  Stethoscope,
  Scissors,
  Wrench,
  Car,
  Briefcase,
  ShoppingBag,
  Dog,
} from "lucide-react";

const categories = [
  {
    name: "Alimentação",
    icon: Utensils,
    color: "bg-orange-100 text-orange-600",
  },
  {
    name: "Saúde e Bem-estar",
    icon: Stethoscope,
    color: "bg-blue-100 text-blue-600",
  },
  {
    name: "Beleza e Estética",
    icon: Scissors,
    color: "bg-pink-100 text-pink-600",
  },
  {
    name: "Serviços Casa",
    icon: Wrench,
    color: "bg-yellow-100 text-yellow-600",
  },
  { name: "Automotivo", icon: Car, color: "bg-red-100 text-red-600" },
  {
    name: "Profissionais",
    icon: Briefcase,
    color: "bg-purple-100 text-purple-600",
  },
  {
    name: "Comércio Local",
    icon: ShoppingBag,
    color: "bg-green-100 text-green-600",
  },
  { name: "Pets e Animais", icon: Dog, color: "bg-teal-100 text-teal-600" },
];

export default function Categories() {
  const router = useRouter();

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-tafanu-blue mb-4">
          Explore por Categorias
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Tudo está organizado para facilitar sua vida. Escolha uma área e
          encontre o profissional ideal em segundos.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.name}
            onClick={() => router.push(`/busca?category=${cat.name}`)}
            className="group cursor-pointer bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-tafanu-action transition-all duration-300 transform hover:-translate-y-1"
          >
            <div
              className={`w-14 h-14 ${cat.color} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
            >
              <cat.icon size={28} />
            </div>
            <h3 className="font-bold text-gray-800 group-hover:text-tafanu-blue transition-colors">
              {cat.name}
            </h3>
            <p className="text-xs text-gray-400 mt-1">Ver opções &rarr;</p>
          </div>
        ))}
      </div>
    </section>
  );
}
