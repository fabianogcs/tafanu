"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getActiveOrdersByIds } from "@/app/actions";
import {
  Clock,
  Store,
  ChevronRight,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  ArrowLeft,
  Loader2,
} from "lucide-react";

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: Date;
  business: { name: string; imageUrl: string };
}

export default function MeusPedidosPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const existingOrdersStr = localStorage.getItem("tafanu_active_orders");
      if (!existingOrdersStr) {
        setIsLoading(false);
        return;
      }

      try {
        let activeOrdersIds = JSON.parse(existingOrdersStr);
        if (!Array.isArray(activeOrdersIds) || activeOrdersIds.length === 0) {
          setIsLoading(false);
          return;
        }

        const res = await getActiveOrdersByIds(activeOrdersIds);

        if (res.success && res.orders) {
          // Dizemos ao TypeScript: "Confie em mim, esses dados têm o formato OrderData"
          const fetchedOrders = res.orders as unknown as OrderData[];
          setOrders(fetchedOrders);

          // 🚀 O FAXINEIRO FANTASMA (Memory Leak Fix):
          const stillActiveIds = fetchedOrders
            .filter((o) => o.status !== "COMPLETED" && o.status !== "CANCELLED")
            .map((o) => o.id);

          if (stillActiveIds.length === 0) {
            localStorage.removeItem("tafanu_active_orders");
          } else if (stillActiveIds.length !== activeOrdersIds.length) {
            localStorage.setItem(
              "tafanu_active_orders",
              JSON.stringify(stillActiveIds),
            );
          }
        }
      } catch (e) {
        console.error("Erro ao carregar gaveta de pedidos.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-1 rounded border border-amber-100">
            <Clock size={12} /> Aguardando
          </span>
        );
      case "PREPARING":
        return (
          <span className="flex items-center gap-1 text-indigo-500 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
            <Clock size={12} /> Preparando
          </span>
        );
      case "DISPATCHED":
        return (
          <span className="flex items-center gap-1 text-blue-500 bg-blue-50 px-2 py-1 rounded border border-blue-100">
            <Truck size={12} /> A Caminho
          </span>
        );
      case "COMPLETED":
        return (
          <span className="flex items-center gap-1 text-emerald-500 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
            <CheckCircle2 size={12} /> Entregue
          </span>
        );
      case "CANCELLED":
        return (
          <span className="flex items-center gap-1 text-rose-500 bg-rose-50 px-2 py-1 rounded border border-rose-100">
            <XCircle size={12} /> Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-10 pb-20 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 text-slate-500 hover:text-slate-800 transition-all active:scale-90"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase italic tracking-tight">
              Meus Pedidos
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Acompanhamento em tempo real
            </p>
          </div>
        </div>

        {/* LOADING STATE */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 size={32} className="animate-spin mb-4 text-indigo-500" />
            <p className="text-[10px] font-black uppercase tracking-widest">
              Buscando seus pedidos...
            </p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && orders.length === 0 && (
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag size={32} className="text-slate-300" />
            </div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide">
              Nenhum pedido ativo
            </h2>
            <p className="text-xs font-bold text-slate-400 mt-2 max-w-sm">
              Você não possui pedidos em andamento no momento. Que tal explorar
              algumas lojas?
            </p>
            <Link
              href="/"
              className="mt-8 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-xl shadow-lg hover:bg-indigo-600 transition-all active:scale-95"
            >
              Explorar Lojas
            </Link>
          </div>
        )}

        {/* ORDER LIST */}
        {!isLoading && orders.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/pedido/${order.id}`}
                className="block group"
              >
                <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all active:scale-[0.98]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      #{order.orderNumber}
                    </span>
                    <div className="text-[9px] font-black uppercase tracking-wider">
                      {getStatusDisplay(order.status)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {order.business.imageUrl ? (
                        <img
                          src={order.business.imageUrl}
                          alt={order.business.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store size={18} className="text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-black text-slate-800 uppercase truncate group-hover:text-indigo-600 transition-colors">
                        {order.business.name}
                      </h3>
                      <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                        R$ {Number(order.totalAmount).toFixed(2)}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Import temporário do Truck para não dar erro no ícone
function Truck(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size}
      height={props.size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M10 17h4V5H2v12h3" />
      <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />
      <path d="M14 17h1" />
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}
