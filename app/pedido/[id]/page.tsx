import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { CheckCircle2, ChefHat, FileText, Bike } from "lucide-react";
import OrderCleanupScript from "./OrderCleanupScript"; // 🚀 Injetor de Limpeza

export default async function RastreioPedidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      business: { select: { name: true, whatsapp: true, phone: true } },
    },
  });

  if (!order) return notFound();

  const statuses = ["PENDING", "PREPARING", "DISPATCHED", "COMPLETED"];
  const currentStepIndex = statuses.indexOf(order.status);

  const isCancelled = order.status === "CANCELLED";
  const isFinished =
    order.status === "COMPLETED" || order.status === "CANCELLED";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 pt-12">
      {/* 🚀 O MOTOR QUE APAGA O BOTÃO DA NAVBAR QUANDO ACABA */}
      {isFinished && <OrderCleanupScript />}

      <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-xl border border-slate-200 p-8 md:p-12">
        <div className="text-center mb-10">
          <span className="bg-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">
            Status do Pedido
          </span>
          <h1 className="text-3xl font-black text-slate-900 uppercase italic">
            Pedido #{order.orderNumber}
          </h1>
          <p className="text-sm font-bold text-slate-400 mt-2">
            {order.business.name}
          </p>
        </div>

        {isCancelled ? (
          <div className="bg-rose-50 border-2 border-rose-200 p-6 rounded-2xl text-center mb-8">
            <h2 className="text-lg font-black text-rose-600 uppercase">
              Pedido Cancelado
            </h2>
            <p className="text-xs font-bold text-rose-400 mt-2">
              Infelizmente o estabelecimento precisou cancelar seu pedido. Entre
              em contato para mais detalhes.
            </p>
          </div>
        ) : (
          <div className="relative flex justify-between items-center mb-12">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10" />
            <div
              className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 transition-all duration-1000 -z-10`}
              style={{ width: `${(currentStepIndex / 3) * 100}%` }}
            />

            <Step
              icon={<FileText />}
              label="Recebido"
              active={currentStepIndex >= 0}
            />
            <Step
              icon={<ChefHat />}
              label="Preparando"
              active={currentStepIndex >= 1}
            />
            <Step
              icon={<Bike />}
              label="A Caminho"
              active={currentStepIndex >= 2}
            />
            <Step
              icon={<CheckCircle2 />}
              label="Entregue"
              active={currentStepIndex >= 3}
            />
          </div>
        )}

        <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">
            Resumo
          </h3>
          <ul className="space-y-3">
            {(order.items as any[]).map((item, i) => (
              <li
                key={i}
                className="text-xs font-bold text-slate-700 flex justify-between"
              >
                <span>
                  {item.quantity}x {item.productName}
                </span>
                <span className="text-slate-400">
                  R$ {item.lineTotal.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-slate-200 mt-4 pt-4 flex justify-between items-center">
            <span className="text-xs font-black uppercase text-slate-500">
              Total
            </span>
            <span className="text-lg font-black text-indigo-600">
              R$ {Number(order.totalAmount).toFixed(2)}
            </span>
          </div>
        </div>

        <a
          href={`https://wa.me/55${order.business.whatsapp || order.business.phone}`}
          target="_blank"
          rel="noreferrer"
          className="w-full bg-slate-900 text-white font-black py-4 rounded-xl flex justify-center uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-colors"
        >
          Falar com a Loja
        </a>
      </div>
    </div>
  );
}

function Step({
  icon,
  label,
  active,
}: {
  icon: any;
  label: string;
  active: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2 bg-white px-2">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 shadow-sm border-2 ${active ? "bg-indigo-500 border-indigo-500 text-white scale-110" : "bg-white border-slate-200 text-slate-300"}`}
      >
        {icon}
      </div>
      <span
        className={`text-[9px] font-black uppercase tracking-widest absolute -bottom-6 text-center w-20 -ml-5 ${active ? "text-indigo-600" : "text-slate-400"}`}
      >
        {label}
      </span>
    </div>
  );
}
