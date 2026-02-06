import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart } from "lucide-react";
import BusinessCard from "@/components/BusinessCard";

export default async function FavoritosPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) redirect("/login");

  // Busca os favoritos e inclui a contagem total de favoritos que aquele negócio possui
  const favorites = await db.favorite.findMany({
    where: { userId: userId },
    include: {
      business: {
        include: {
          _count: {
            select: { favorites: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 pb-24 animate-in fade-in duration-700">
      {/* HEADER COMPACTO E LIMPO */}
      <div className="mb-8 md:mb-12">
        <h1 className="text-2xl md:text-4xl font-black text-tafanu-blue tracking-tighter uppercase italic flex items-center gap-3">
          <Heart className="text-rose-500 fill-rose-500" size={28} /> Meus
          Favoritos
        </h1>
        <p className="text-gray-400 text-xs md:text-sm font-medium mt-1 uppercase tracking-widest">
          Sua curadoria particular de lugares e serviços.
        </p>
      </div>

      {/* GRID OTIMIZADA: 2 COLUNAS NO MOBILE */}
      {favorites.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-100 rounded-[30px] p-12 text-center">
          <p className="text-gray-400 font-bold mb-4 uppercase text-xs tracking-widest">
            Sua lista está vazia.
          </p>
          <Link
            href="/busca"
            className="bg-tafanu-blue text-white px-8 py-3 rounded-xl font-black text-xs inline-block uppercase hover:scale-105 transition-all shadow-lg shadow-tafanu-blue/20"
          >
            Explorar agora
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {favorites.map((fav) => (
            <BusinessCard key={fav.id} business={fav.business} />
          ))}
        </div>
      )}
    </div>
  );
}
