"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import ReportOrderButton from "@/components/ReportOrderButton";
import { getStoreOrders, updateOrderStatus } from "@/app/actions";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Truck,
  Clock,
  XCircle,
  Volume2,
  VolumeX,
  Phone,
  MapPin,
  Search,
  Archive,
  LayoutDashboard,
  MessageCircle,
  Printer,
} from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  extras: { name: string; price: number }[];
}

interface Order {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone?: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryType: string;
  address?: any;
  paymentMethod: string;
  changeFor?: string;
  observation?: string;
  status: string;
  createdAt: string;
}

export default function OrderBoard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // 🚀 NOVOS ESTADOS PARA PESQUISA E ABAS
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "ARCHIVED">("ACTIVE");
  const [search, setSearch] = useState("");

  // Controle de Áudio e Sincronização (iFood Level)
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 🚀 NOVOS ESTADOS DE CONFIANÇA DO LOJISTA
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  // 🚀 REFERÊNCIA INVISÍVEL: Guarda o horário exato da última batida no servidor
  const lastSyncRef = useRef<string | null>(null);

  useEffect(() => {
    // Carrega o áudio e prepara o loop
    audioRef.current = new Audio("/siren.mp3");
    if (audioRef.current) {
      audioRef.current.loop = true;
    }
  }, []);

  const fetchOrders = useCallback(async (isSilent = false) => {
    if (isSilent) setIsSyncing(true);
    try {
      // 🚀 Se for silencioso (Polling), enviamos a data da última checagem!
      const syncParam =
        isSilent && lastSyncRef.current ? lastSyncRef.current : undefined;
      const res = await getStoreOrders(syncParam);

      if (res.success && res.orders) {
        const fetchedOrders = res.orders as unknown as Order[];

        if (isSilent) {
          // 🚀 MERGE INTELIGENTE: Se chegaram pacotes novos, a gente atualiza apenas os cards modificados
          if (fetchedOrders.length > 0) {
            setOrders((prev) => {
              const map = new Map(prev.map((o) => [o.id, o]));
              fetchedOrders.forEach((o) => map.set(o.id, o));
              // Devolve a lista inteira atualizada e ordenada
              return Array.from(map.values()).sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              );
            });
          }
        } else {
          // Carga inicial pesada (Lota a tela de primeira)
          setOrders(fetchedOrders);
        }

        // Atualiza a memória de sincronização
        if (res.serverTime) {
          lastSyncRef.current = res.serverTime;
          setLastSync(new Date(res.serverTime));
        }
      }
    } catch (e) {
      console.error("Erro no Polling de Pedidos");
    } finally {
      if (!isSilent) setIsLoading(false);
      setIsSyncing(false);
    }
  }, []);

  // 🚀 GATILHO DO ALARME + ALERTA VISUAL NA ABA DO NAVEGADOR (Blinking Title)
  useEffect(() => {
    const hasPending = orders.some((o) => o.status === "PENDING");
    let titleInterval: NodeJS.Timeout;

    if (hasPending) {
      // Faz a aba do navegador piscar para chamar o lojista
      titleInterval = setInterval(() => {
        document.title =
          document.title === "Tafanu" ? "🔴 NOVO PEDIDO!" : "Tafanu";
      }, 1000);

      // Toca o som
      if (soundEnabled && audioRef.current) {
        audioRef.current
          .play()
          .catch(() => console.log("O navegador bloqueou o áudio."));
      }
    } else {
      // Se não tem pedido pendente (ou o lojista aceitou), para tudo e volta o título normal
      document.title = "Tafanu";
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }

    return () => {
      if (titleInterval) clearInterval(titleInterval);
    };
  }, [orders, soundEnabled]);

  // POLLING INTELIGENTE: Poupando o seu bolso na Vercel
  useEffect(() => {
    fetchOrders(); // Busca inicial
    let interval: NodeJS.Timeout;

    const startPolling = () => {
      interval = setInterval(() => fetchOrders(true), 15000);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        clearInterval(interval);
      } else {
        fetchOrders(true);
        startPolling();
      }
    };

    startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setIsUpdating(orderId);
    try {
      const res = await updateOrderStatus(orderId, newStatus);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
        );
        toast.success(`Status atualizado!`);
      } else {
        toast.error(res.error || "Erro ao mudar status.");
      }
    } catch (e) {
      toast.error("Falha na comunicação.");
    } finally {
      setIsUpdating(null);
    }
  };

  // 🚀 LÓGICA DE FILTRO: Abas e Barra de Pesquisa
  const filteredOrders = orders.filter((o) => {
    const isArchived = o.status === "COMPLETED" || o.status === "CANCELLED";
    const matchTab = activeTab === "ARCHIVED" ? isArchived : !isArchived;
    const matchSearch =
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      String(o.orderNumber).includes(search);
    return matchTab && matchSearch;
  });

  const pendingOrders = filteredOrders.filter((o) => o.status === "PENDING");
  const preparingOrders = filteredOrders.filter(
    (o) => o.status === "PREPARING",
  );
  const dispatchedOrders = filteredOrders.filter(
    (o) => o.status === "DISPATCHED",
  );

  // Formatadores
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentName = (method: string) => {
    const map: any = {
      PIX: "Pix",
      CASH: "Dinheiro",
      CREDIT: "C. Crédito",
      DEBIT: "C. Débito",
    };
    return map[method] || method;
  };

  const getDeliveryName = (type: string) => {
    return type === "DELIVERY" ? "Entrega" : "Retirada";
  };

  // 🚀 MOTOR DE IMPRESSÃO TÉRMICA (58mm / 80mm)
  const handlePrintReceipt = (order: Order) => {
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) {
      toast.error(
        "O navegador bloqueou a aba de impressão. Permita os pop-ups!",
      );
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Pedido #${order.orderNumber}</title>
        <style>
          @page { margin: 0; }
          body {
            font-family: 'Courier New', Courier, monospace;
            width: 58mm; /* Tamanho exato da bobina térmica */
            margin: 0 auto;
            padding: 10px;
            font-size: 12px;
            color: #000;
            background: #fff;
          }
          h2, p { margin: 0; padding: 2px 0; text-align: center; }
          .divider { border-top: 1px dashed #000; margin: 5px 0; }
          .left { text-align: left; }
          .bold { font-weight: bold; }
          .flex { display: flex; justify-content: space-between; }
          .item { margin-bottom: 5px; }
          .item-name { text-align: left; font-weight: bold; }
          .item-details { display: flex; justify-content: space-between; font-size: 11px; }
          .extras { font-size: 10px; margin-left: 10px; }
        </style>
      </head>
      <body>
        <h2>PEDIDO #${order.orderNumber}</h2>
        <p>${new Date(order.createdAt).toLocaleString("pt-BR")}</p>
        <div class="divider"></div>
        
        <div class="left bold">CLIENTE:</div>
        <div class="left">${order.customerName}</div>
        ${order.customerPhone ? `<div class="left">${order.customerPhone}</div>` : ""}
        
        <div class="divider"></div>
        <div class="left bold">TIPO: ${order.deliveryType === "DELIVERY" ? "ENTREGA" : "RETIRADA"}</div>
        ${
          order.deliveryType === "DELIVERY" && order.address
            ? `
          <div class="left">
            ${order.address.street}, ${order.address.number}<br>
            ${order.address.neighborhood}<br>
            ${order.address.complement ? `Comp: ${order.address.complement}<br>` : ""}
            ${order.address.reference ? `Ref: ${order.address.reference}` : ""}
          </div>
        `
            : ""
        }
        
        <div class="divider"></div>
        <div class="left bold">ITENS:</div>
        <div class="items" style="margin-top: 5px;">
          ${order.items
            .map(
              (item) => `
            <div class="item">
              <div class="item-name">${item.quantity}x ${item.productName}</div>
              ${
                item.extras.length > 0
                  ? `<div class="left extras">+ ${item.extras.map((e) => e.name).join(", ")}</div>`
                  : ""
              }
              <div class="item-details">
                <span>R$ ${item.unitPrice.toFixed(2)}</span>
                <span>R$ ${item.lineTotal.toFixed(2)}</span>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
        
        <div class="divider"></div>
        ${
          order.observation
            ? `<div class="left bold">OBS: ${order.observation}</div><div class="divider"></div>`
            : ""
        }
        
        <div class="flex bold">
          <span>TOTAL:</span>
          <span>R$ ${order.totalAmount.toFixed(2)}</span>
        </div>
        <div class="left">Pagamento: ${getPaymentName(order.paymentMethod)}</div>
        ${order.changeFor ? `<div class="left bold">Troco para: R$ ${order.changeFor}</div>` : ""}
        
        <div class="divider"></div>
        <p>Gerado por Tafanu.com.br</p>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // 🚀 CARD DO PEDIDO (Agora com o botão do WhatsApp!)
  const OrderCard = ({ order, isNew }: { order: Order; isNew?: boolean }) => (
    <div
      className={`bg-white rounded-2xl border p-4 shadow-sm relative overflow-hidden transition-all flex flex-col h-full ${isNew ? "border-rose-300 ring-4 ring-rose-500/10 animate-pulse" : "border-slate-200"}`}
    >
      {isNew && (
        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
      )}

      <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-xs font-black uppercase text-slate-800">
            #{order.orderNumber} - {order.customerName}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-slate-400">
            <span className="flex items-center gap-1">
              <Clock size={10} /> {formatDate(order.createdAt)}
            </span>
            <span>•</span>
            <span className="text-indigo-500">
              {getDeliveryName(order.deliveryType)}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-black text-emerald-600">
            R$ {order.totalAmount.toFixed(2)}
          </p>
          <p className="text-[9px] font-bold uppercase text-slate-400 mt-1">
            {getPaymentName(order.paymentMethod)}
          </p>
        </div>
      </div>

      {/* 🚀 BOTÕES DE AÇÃO RÁPIDA (WhatsApp e Impressora térmica) */}
      <div className="flex gap-2 mb-3">
        {order.customerPhone && (
          <a
            href={`https://wa.me/55${order.customerPhone}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex justify-center items-center gap-1.5 text-[10px] font-black uppercase bg-[#25D366]/10 text-[#25D366] px-3 py-2 rounded-lg hover:bg-[#25D366] hover:text-white transition-colors border border-[#25D366]/20"
          >
            <MessageCircle size={14} /> WhatsApp
          </a>
        )}
        <button
          onClick={() => handlePrintReceipt(order)}
          className="flex-1 flex justify-center items-center gap-1.5 text-[10px] font-black uppercase bg-slate-100 text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors border border-slate-200"
        >
          <Printer size={14} /> Imprimir
        </button>
      </div>

      <div className="space-y-2 mb-3 flex-1">
        {order.items.map((item, idx) => (
          <div key={idx} className="text-[11px] text-slate-600 font-medium">
            <span className="font-black text-slate-800">{item.quantity}x</span>{" "}
            {item.productName}
            {item.extras.length > 0 && (
              <p className="text-[9px] text-slate-400 font-bold ml-4">
                + {item.extras.map((e) => e.name).join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>

      {order.observation && (
        <div className="bg-amber-50 text-amber-700 p-2 rounded-lg text-[10px] font-bold mb-3 border border-amber-100">
          ⚠️ {order.observation}
        </div>
      )}

      {order.deliveryType === "DELIVERY" && order.address && (
        <div className="bg-slate-50 text-slate-600 p-3 rounded-lg text-[10px] font-medium mb-3 border border-slate-100 shadow-sm">
          <p className="font-black uppercase mb-1.5 flex items-center gap-1 text-slate-800 border-b border-slate-200 pb-1">
            <MapPin size={12} className="text-indigo-500" /> Endereço de Entrega
          </p>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-700">
              {order.address.street}, {order.address.number}
            </p>
            <p>
              {order.address.neighborhood}
              {order.address.complement && (
                <span className="italic text-slate-500">
                  {" "}
                  ({order.address.complement})
                </span>
              )}
            </p>
            {/* 🚀 CEP E REFERÊNCIA AQUI */}
            <div className="flex flex-wrap gap-2 pt-1 mt-1 border-t border-slate-100 border-dashed">
              {order.address.cep && (
                <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-black tracking-widest">
                  CEP: {order.address.cep}
                </span>
              )}
              {order.address.reference && (
                <span className="text-slate-500 font-bold">
                  <span className="text-slate-400">Ref:</span>{" "}
                  {order.address.reference}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {order.paymentMethod === "CASH" && order.changeFor && (
        <p className="text-[10px] font-black text-rose-500 mb-3 uppercase">
          💵 Levar troco para R$ {order.changeFor}
        </p>
      )}

      {/* 🚀 BOTÃO DE DENÚNCIA DO LOJISTA */}
      <div className="-mt-1 mb-3">
        <ReportOrderButton orderId={order.id} />
      </div>

      <div className="flex flex-wrap gap-2 mt-auto pt-3 border-t border-slate-100">
        {order.status === "PENDING" && (
          <>
            <button
              disabled={isUpdating === order.id}
              onClick={() => handleStatusChange(order.id, "PREPARING")}
              className="flex-1 bg-indigo-600 text-white text-[10px] font-black uppercase py-2.5 rounded-xl hover:bg-indigo-700 transition flex justify-center items-center gap-2"
            >
              {isUpdating === order.id ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle2 size={14} />
              )}{" "}
              Aceitar
            </button>
            <button
              disabled={isUpdating === order.id}
              onClick={() => {
                if (window.confirm("Recusar este pedido?"))
                  handleStatusChange(order.id, "CANCELLED");
              }}
              className="px-3 bg-rose-50 text-rose-500 border border-rose-200 text-[10px] font-black uppercase py-2.5 rounded-xl hover:bg-rose-100 transition flex justify-center items-center"
            >
              <XCircle size={14} />
            </button>
          </>
        )}

        {order.status === "PREPARING" && (
          <button
            disabled={isUpdating === order.id}
            onClick={() => handleStatusChange(order.id, "DISPATCHED")}
            className="w-full bg-emerald-500 text-white text-[10px] font-black uppercase py-2.5 rounded-xl hover:bg-emerald-600 transition flex justify-center items-center gap-2"
          >
            {isUpdating === order.id ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Truck size={14} />
            )}{" "}
            {order.deliveryType === "DELIVERY"
              ? "Despachar"
              : "Pronto p/ Retirar"}
          </button>
        )}

        {order.status === "DISPATCHED" && (
          <button
            disabled={isUpdating === order.id}
            onClick={() => handleStatusChange(order.id, "COMPLETED")}
            className="w-full bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-black uppercase py-2.5 rounded-xl hover:bg-slate-200 hover:text-slate-800 transition flex justify-center items-center gap-2"
          >
            {isUpdating === order.id ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CheckCircle2 size={14} />
            )}{" "}
            Finalizar (Arquivar)
          </button>
        )}

        {activeTab === "ARCHIVED" && (
          <div className="w-full text-center text-[10px] font-black uppercase tracking-widest text-slate-400 py-2">
            {order.status === "COMPLETED" ? "✅ Finalizado" : "❌ Cancelado"}
          </div>
        )}
      </div>
    </div>
  );

  // 🚀 O DESTRAVADOR DE ÁUDIO (Bypassa o bloqueio do Chrome/Safari)
  const toggleSound = () => {
    if (!soundEnabled && audioRef.current) {
      // O truque de mestre: Toca e pausa instantaneamente no clique para ganhar a permissão eterna do navegador
      audioRef.current
        .play()
        .then(() => {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
        })
        .catch(() => {});
    }
    setSoundEnabled(!soundEnabled);
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Carregando Pedidos...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* 🚀 INDICADOR DE CONEXÃO AO VIVO (Paz de espírito para o lojista) */}
      <div className="flex items-center justify-end gap-2 mb-4 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
        {isSyncing ? (
          <>
            <Loader2 size={12} className="animate-spin text-indigo-500" />{" "}
            Sincronizando...
          </>
        ) : (
          <>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />{" "}
            Ao Vivo • Última sync{" "}
            {lastSync.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </>
        )}
      </div>

      {/* 🚀 BANNER DE ALERTA SONORO OBRIGATÓRIO (Só aparece se o som estiver mutado) */}
      {!soundEnabled && (
        <div className="mb-6 bg-amber-50 border border-amber-200 p-4 lg:px-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-500 shrink-0">
              <VolumeX size={20} />
            </div>
            <div>
              <p className="text-[11px] font-black text-amber-700 uppercase tracking-widest">
                Aviso: Sirene Desligada!
              </p>
              <p className="text-xs font-medium text-amber-600">
                Seu navegador bloqueou o alerta sonoro. Ative para ouvir quando
                novos pedidos chegarem.
              </p>
            </div>
          </div>
          <button
            onClick={toggleSound}
            className="w-full md:w-auto px-6 py-3.5 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shrink-0 shadow-md animate-pulse flex items-center justify-center gap-2"
          >
            <Volume2 size={16} /> Destravar Som
          </button>
        </div>
      )}

      {/* 🚀 TOPO: ABAS, PESQUISA E ÁUDIO */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-full xl:w-auto">
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`flex-1 xl:px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "ACTIVE" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400"}`}
          >
            <LayoutDashboard size={16} className="inline mr-2" /> Em Andamento
          </button>
          <button
            onClick={() => setActiveTab("ARCHIVED")}
            className={`flex-1 xl:px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "ARCHIVED" ? "bg-white shadow-sm text-slate-800" : "text-slate-400"}`}
          >
            <Archive size={16} className="inline mr-2" /> Histórico
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="relative w-full md:w-80 shrink-0">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar cliente ou #número..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border outline-none focus:ring-2 ring-indigo-500/20 text-sm font-bold text-slate-700"
            />
          </div>

          <button
            onClick={toggleSound}
            className={`flex justify-center w-full md:w-auto items-center gap-2 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${soundEnabled ? "bg-indigo-50 text-indigo-600 border-indigo-200" : "bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200"}`}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {soundEnabled ? "Som Ligado" : "Ativar Alarme"}
          </button>
        </div>
      </div>

      {/* 🚀 O KANBAN MÁGICO (SÓ MOSTRA NA ABA ATIVO) */}
      {activeTab === "ACTIVE" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="bg-slate-100/50 rounded-[2rem] p-4 min-h-[500px] border border-slate-200">
            <div className="flex items-center justify-between mb-2 px-2">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                <AlertCircle size={14} className="text-rose-500" /> Novos
                Pedidos
              </h2>
              <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-full">
                {pendingOrders.length}
              </span>
            </div>

            {/* 🚀 GATILHO DE URGÊNCIA (Aviso do botão de cancelar) */}
            {pendingOrders.length > 0 && (
              <div className="mx-2 mb-4 bg-rose-100/50 border border-rose-200 p-2.5 rounded-xl text-center shadow-sm">
                <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest leading-tight">
                  ⚠️ Aceite Rápido!
                  <br />
                  <span className="font-bold text-rose-500">
                    O cliente pode cancelar enquanto estiver aqui.
                  </span>
                </p>
              </div>
            )}

            <div className="flex flex-col gap-4">
              {pendingOrders.length === 0 ? (
                <p className="text-[10px] font-bold text-center text-slate-400 uppercase py-10">
                  Vazio
                </p>
              ) : (
                pendingOrders.map((order) => (
                  <OrderCard key={order.id} order={order} isNew={true} />
                ))
              )}
            </div>
          </div>

          <div className="bg-slate-100/50 rounded-[2rem] p-4 min-h-[500px] border border-slate-200">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                <Clock size={14} className="text-amber-500" /> Em Preparo
              </h2>
              <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded-full">
                {preparingOrders.length}
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {preparingOrders.length === 0 ? (
                <p className="text-[10px] font-bold text-center text-slate-400 uppercase py-10">
                  Vazio
                </p>
              ) : (
                preparingOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))
              )}
            </div>
          </div>

          <div className="bg-slate-100/50 rounded-[2rem] p-4 min-h-[500px] border border-slate-200">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                <Truck size={14} className="text-emerald-500" /> Despachados
              </h2>
              <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-full">
                {dispatchedOrders.length}
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {dispatchedOrders.length === 0 ? (
                <p className="text-[10px] font-bold text-center text-slate-400 uppercase py-10">
                  Vazio
                </p>
              ) : (
                dispatchedOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* 🚀 ABA DE HISTÓRICO (ARQUIVADOS) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">
              Nenhum pedido no histórico.
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
