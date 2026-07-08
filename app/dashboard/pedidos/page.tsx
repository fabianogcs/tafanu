import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import OrderBoard from "@/components/OrderBoard";

export const metadata = {
  title: "Gestão de Pedidos | Tafanu",
};

export default async function PedidosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Garante que o usuário tem uma loja para ver os pedidos e lê o modo da vitrine
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { businesses: { select: { id: true, menuMode: true } } }, // 🚀 LER O MENUMODE AQUI
  });

  if (!user || user.businesses.length === 0) {
    // 🚀 Se ele não tem vitrine ainda, manda ele direto pro criador de lojas!
    redirect("/dashboard/novo");
  }

  // 🚀 O MOTOR INTEGRADO DE CÓPIA: Descobre se o assinante atual usa Agenda
  const isAgenda = user.businesses[0]?.menuMode === "AGENDA";

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-slate-800">
          {isAgenda ? (
            <>
              Gestão de <span className="text-emerald-500">Agendamentos</span>
            </>
          ) : (
            <>
              Gestão de <span className="text-indigo-600">Pedidos</span>
            </>
          )}
        </h1>
        <p className="text-xs md:text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">
          {isAgenda
            ? "Acompanhe e gerencie seus horários e clientes em tempo real"
            : "Acompanhe e despache suas vendas em tempo real"}
        </p>
      </div>

      <OrderBoard />
    </div>
  );
}
