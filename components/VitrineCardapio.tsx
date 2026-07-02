"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Store,
  MapPin,
  MessageSquare,
  Truck,
  ArrowLeft,
  CreditCard,
  Banknote,
  QrCode,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { ProductData } from "./business-editor/types";
import { createOrderAction } from "@/app/actions";
import LoginModal from "./LoginModal";

interface CartItem {
  id: string;
  product: ProductData;
  selectedExtras: { name: string; price: number }[];
  quantity: number;
}

interface VitrineCardapioProps {
  businessId: string;
  businessName: string;
  whatsapp: string;
  themeColor?: string;
  products: ProductData[];
  onClose: () => void;
  isOpen: boolean;
  hours: any[];
  deliveryFee?: number;
  // 🚀 FASE 3: AS NOVAS VARIÁVEIS AQUI
  deliveryRadius?: number;
  businessLat?: number | null;
  businessLng?: number | null;
}
// 🚀 FASE 3: FÓRMULA DE HAVERSINE (Distância entre dois pontos na Terra em KM)
function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
// 🚀 O MOTOR DO TEMPO BLINDADO
function getStoreStatus(hours: any[]) {
  if (!hours || hours.length === 0)
    return { isReallyOpen: true, nextOpenMsg: "" };

  const now = new Date();
  const brazilDate = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }),
  );
  const currentDay = brazilDate.getDay();
  const previousDay = currentDay === 0 ? 6 : currentDay - 1;
  const currentTime = brazilDate.getHours() * 100 + brazilDate.getMinutes();

  const checkShift = (dayConfig: any, isPreviousDayCheck: boolean) => {
    if (
      !dayConfig ||
      dayConfig.isClosed ||
      !dayConfig.openTime ||
      !dayConfig.closeTime
    )
      return false;
    const [openH, openM] = dayConfig.openTime.split(":").map(Number);
    const [closeH, closeM] = dayConfig.closeTime.split(":").map(Number);
    const openVal = openH * 100 + openM;
    const closeVal = closeH * 100 + closeM;
    const crossesMidnight = closeVal < openVal;

    if (isPreviousDayCheck) return crossesMidnight && currentTime < closeVal;
    return crossesMidnight
      ? currentTime >= openVal || currentTime < closeVal
      : currentTime >= openVal && currentTime < closeVal;
  };

  const todayHours = hours.find((h: any) => h.dayOfWeek === currentDay);
  const yesterdayHours = hours.find((h: any) => h.dayOfWeek === previousDay);

  const isReallyOpen =
    checkShift(todayHours, false) || checkShift(yesterdayHours, true);

  let nextOpenMsg = "em breve";
  if (!isReallyOpen) {
    const diasSemana = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ];
    for (let i = 0; i < 7; i++) {
      const checkDay = (currentDay + i) % 7;
      const dayConfig = hours.find((h: any) => h.dayOfWeek === checkDay);

      if (dayConfig && !dayConfig.isClosed && dayConfig.openTime) {
        const openTimeVal = Number(dayConfig.openTime.replace(":", ""));
        if (i === 0 && currentTime < openTimeVal) {
          nextOpenMsg = `hoje às ${dayConfig.openTime}`;
          break;
        } else if (i === 1) {
          nextOpenMsg = `amanhã às ${dayConfig.openTime}`;
          break;
        } else if (i > 1) {
          nextOpenMsg = `${diasSemana[checkDay]} às ${dayConfig.openTime}`;
          break;
        }
      }
    }
  }

  return { isReallyOpen, nextOpenMsg };
}

const maskPhone = (v: string) => {
  v = v.replace(/\D/g, "");
  if (v.length <= 11) {
    v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
  }
  return v;
};

const maskDoc = (v: string) => {
  v = v.replace(/\D/g, "");
  if (v.length <= 11) {
    return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  } else {
    return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
};

const ProductItem = ({
  product,
  cart,
  onAddToCart,
  onAdjustQuantity,
}: {
  product: ProductData;
  cart: CartItem[];
  onAddToCart: (product: ProductData, extras: any[]) => void;
  onAdjustQuantity: (cartId: string, delta: number) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState<number[]>([]);
  const hasExtras = product.extras && product.extras.length > 0;

  const totalQuantity = cart
    .filter((item) => item.product.name === product.name)
    .reduce((sum, item) => sum + item.quantity, 0);

  const toggleExtra = (idx: number) => {
    if (selectedExtras.includes(idx))
      setSelectedExtras(selectedExtras.filter((e) => e !== idx));
    else setSelectedExtras([...selectedExtras, idx]);
  };

  const handleConfirmAdd = () => {
    const chosenExtras = selectedExtras.map((idx) => product.extras![idx]);
    onAddToCart(product, chosenExtras);
    setIsExpanded(false);
    setSelectedExtras([]);
  };

  const totalItemPrice =
    product.price +
    selectedExtras.reduce(
      (acc, idx) => acc + (product.extras![idx]?.price || 0),
      0,
    );

  return (
    <div
      className={`bg-white p-4 rounded-3xl border transition-all ${isExpanded ? "border-indigo-200 shadow-md ring-4 ring-indigo-500/10" : "border-slate-100 shadow-sm hover:border-slate-200"}`}
    >
      <div className="flex gap-4">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
          ) : (
            <Store size={24} className="text-slate-300" />
          )}
        </div>
        <div className="flex-1 flex flex-col min-w-0 py-1">
          <h3 className="text-xs md:text-sm font-black uppercase text-slate-800 tracking-wide leading-tight truncate">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-[9px] text-slate-400 font-medium line-clamp-2 mt-1">
              {product.description}
            </p>
          )}

          <div className="mt-auto pt-2 flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-[9px] font-black text-rose-400 line-through">
                  R$ {product.oldPrice.toFixed(2)}
                </span>
              )}
              <span className="font-black text-sm text-slate-900 shrink-0">
                R$ {product.price.toFixed(2)}
              </span>
            </div>

            {!isExpanded && (
              <div className="shrink-0">
                {hasExtras ? (
                  <div className="flex items-center gap-2">
                    {totalQuantity > 0 && (
                      <span className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-2 py-1 rounded-lg border border-indigo-100 animate-in zoom-in">
                        {totalQuantity}x
                      </span>
                    )}
                    <button
                      onClick={() => setIsExpanded(true)}
                      className="h-8 px-4 rounded-xl text-[10px] font-black uppercase transition-all bg-slate-900 text-white shadow-md hover:bg-indigo-600 active:scale-95"
                    >
                      Montar
                    </button>
                  </div>
                ) : totalQuantity === 0 ? (
                  <button
                    onClick={() => onAddToCart(product, [])}
                    className="h-8 px-4 rounded-xl text-[10px] font-black uppercase transition-all bg-slate-900 text-white shadow-md hover:bg-indigo-600 active:scale-95"
                  >
                    Add
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl px-1 h-8 border border-slate-200 shadow-inner">
                    <button
                      onClick={() => onAdjustQuantity(`${product.name}__`, -1)}
                      className="text-rose-500 active:scale-90 p-1.5 hover:text-rose-600"
                    >
                      <Minus size={14} strokeWidth={3} />
                    </button>
                    <span className="text-[11px] font-black w-3 text-center text-slate-800">
                      {totalQuantity}
                    </span>
                    <button
                      onClick={() => onAddToCart(product, [])}
                      className="text-emerald-500 active:scale-90 p-1.5 hover:text-emerald-600"
                    >
                      <Plus size={14} strokeWidth={3} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
          {product.description && (
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-4 p-3 bg-slate-50 rounded-xl">
              {product.description}
            </p>
          )}

          <div className="mb-4">
            <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 mb-3">
              Adicionais
            </label>
            <div className="space-y-2">
              {product.extras!.map((extra, idx) => (
                <label
                  key={idx}
                  onClick={() => toggleExtra(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedExtras.includes(idx) ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-100 hover:border-slate-200"}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${selectedExtras.includes(idx) ? "bg-indigo-500 border-indigo-500 text-white" : "bg-white border-slate-300"}`}
                    >
                      {selectedExtras.includes(idx) && (
                        <Plus size={12} strokeWidth={4} />
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-black uppercase ${selectedExtras.includes(idx) ? "text-indigo-900" : "text-slate-600"}`}
                    >
                      {extra.name}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-black ${selectedExtras.includes(idx) ? "text-indigo-600" : "text-emerald-500"}`}
                  >
                    + R$ {extra.price.toFixed(2)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                setIsExpanded(false);
                setSelectedExtras([]);
              }}
              className="h-10 px-4 rounded-xl text-[10px] font-black uppercase bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-all border border-transparent hover:border-rose-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmAdd}
              className="flex-1 h-10 rounded-xl flex items-center justify-between px-4 bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 shadow-md active:scale-95 transition-all"
            >
              <span>Confirmar</span>
              <span className="bg-indigo-800/50 px-2 py-1 rounded-lg">
                R$ {totalItemPrice.toFixed(2)}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function VitrineCardapio({
  businessId,
  businessName,
  whatsapp,
  products,
  onClose,
  isOpen,
  hours,
  deliveryFee = 0,
  deliveryRadius = 0, // 🚀 RECEBE O RAIO
  businessLat, // 🚀 RECEBE A LATITUDE DA LOJA
  businessLng, // 🚀 RECEBE A LONGITUDE DA LOJA
}: VitrineCardapioProps) {
  const { isReallyOpen, nextOpenMsg } = getStoreStatus(hours);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState<"CART" | "CHECKOUT">("CART");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [dataError, setDataError] = useState(false);
  const passaporteRef = useRef<HTMLDivElement>(null);
  const [documentId, setDocumentId] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [deliveryType, setDeliveryType] = useState<"DELIVERY" | "PICKUP">(
    "DELIVERY",
  );
  const [clientName, setClientName] = useState("");
  const [address, setAddress] = useState({
    cep: "",
    street: "",
    number: "",
    neighborhood: "",
    complement: "",
    reference: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<
    "PIX" | "CREDIT" | "DEBIT" | "CASH" | ""
  >("");
  const [changeFor, setChangeFor] = useState("");
  const [observation, setObservation] = useState("");

  useEffect(() => {
    try {
      const pendingDataStr = sessionStorage.getItem("tafanu_pending_checkout");

      if (pendingDataStr) {
        const pendingData = JSON.parse(pendingDataStr);
        setCart(pendingData.cart || []);
        setClientName(pendingData.clientName || "");
        setDeliveryType(pendingData.deliveryType || "DELIVERY");
        setAddress(
          pendingData.address || {
            cep: "",
            street: "",
            number: "",
            neighborhood: "",
            complement: "",
            reference: "",
          },
        );
        setPaymentMethod(pendingData.paymentMethod || "");
        setChangeFor(pendingData.changeFor || "");
        setObservation(pendingData.observation || "");
        setDocumentId(pendingData.documentId || "");
        setCustomerPhone(pendingData.customerPhone || "");

        if (window.location.search.includes("cart=true")) {
          setStep("CHECKOUT");
        }
      } else {
        const globalProfileStr = localStorage.getItem("tafanu_global_profile");
        if (globalProfileStr) {
          const profile = JSON.parse(globalProfileStr);
          if (profile.clientName) setClientName(profile.clientName);
          if (profile.address) setAddress(profile.address);
          if (profile.documentId) setDocumentId(profile.documentId);
          if (profile.customerPhone) setCustomerPhone(profile.customerPhone);
        }
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      sessionStorage.setItem(
        "tafanu_pending_checkout",
        JSON.stringify({
          cart,
          clientName,
          deliveryType,
          address,
          paymentMethod,
          changeFor,
          observation,
          documentId,
          customerPhone,
        }),
      );
    } else {
      sessionStorage.removeItem("tafanu_pending_checkout");
    }
  }, [
    cart,
    clientName,
    deliveryType,
    address,
    paymentMethod,
    changeFor,
    observation,
    documentId,
    customerPhone,
  ]);

  useEffect(() => {
    if (dataError && passaporteRef.current) {
      setTimeout(() => {
        passaporteRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [dataError]);

  const handleCepChange = async (val: string) => {
    const rawCep = val.replace(/\D/g, "");
    setAddress((prev) => ({ ...prev, cep: rawCep }));

    if (rawCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setAddress((prev) => ({
            ...prev,
            street: data.logradouro || prev.street,
            neighborhood: data.bairro || prev.neighborhood,
          }));
        }
      } catch (err) {
        console.error("Erro ao buscar CEP");
      }
    }
  };

  const handleCloseModal = () => {
    if (cart.length > 0) {
      const confirmClose = window.confirm(
        "Você tem itens no carrinho. Deseja mesmo cancelar e esvaziar o pedido atual?",
      );
      if (!confirmClose) return;
    }
    sessionStorage.removeItem("tafanu_pending_checkout");
    setCart([]);
    onClose();
  };

  const handleAddToCart = (
    product: ProductData,
    extras: { name: string; price: number }[],
  ) => {
    const extrasString = extras
      .map((e) => e.name)
      .sort()
      .join("|");
    const cartId = `${product.name}__${extrasString}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === cartId);
      if (existing)
        return prev.map((item) =>
          item.id === cartId ? { ...item, quantity: item.quantity + 1 } : item,
        );
      return [
        ...prev,
        { id: cartId, product, selectedExtras: extras, quantity: 1 },
      ];
    });
  };

  const handleAdjustQuantity = (cartId: string, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === cartId);
      if (!existing) return prev;
      const newQuantity = existing.quantity + delta;
      if (newQuantity <= 0) return prev.filter((item) => item.id !== cartId);
      return prev.map((item) =>
        item.id === cartId ? { ...item, quantity: newQuantity } : item,
      );
    });
  };

  // 🚀 A MATEMÁTICA VITAL DO CARRINHO (Subtotal, Frete e Total)
  const totalCart = cart.reduce((acc, item) => {
    const itemTotal =
      item.product.price +
      item.selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
    return acc + itemTotal * item.quantity;
  }, 0);

  const taxaEntrega = deliveryType === "DELIVERY" ? deliveryFee : 0;
  const totalPedido = totalCart + taxaEntrega;

  const handleSendWhatsApp = async () => {
    if (cart.length === 0) return;

    if (!clientName.trim()) {
      alert("Por favor, preencha o seu nome antes de enviar o pedido.");
      return;
    }

    if (
      deliveryType === "DELIVERY" &&
      (!address.street || !address.number || !address.neighborhood)
    ) {
      alert("Por favor, preencha a Rua, Número e Bairro para entrega.");
      return;
    }
    if (!paymentMethod) {
      alert("Por favor, selecione a forma de pagamento.");
      return;
    }

    setIsSubmitting(true);
    setDataError(false);

    // =========================================================================
    // 🚀 FASE 3: O ESCUDO DE RAIO DE ENTREGA (GPS)
    // =========================================================================
    if (
      deliveryType === "DELIVERY" &&
      deliveryRadius > 0 &&
      businessLat &&
      businessLng
    ) {
      try {
        // Pede a localização do cliente na hora
        const pos = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            });
          },
        );

        const distance = getDistanceFromLatLonInKm(
          businessLat,
          businessLng,
          pos.coords.latitude,
          pos.coords.longitude,
        );

        // Se a distância for maior que o raio permitido pela loja, TRAVA O PEDIDO!
        if (distance > deliveryRadius) {
          alert(
            `❌ Fora da Área de Entrega\n\nNossa distância máxima é de ${deliveryRadius}km, e você está a aproximadamente ${distance.toFixed(1)}km de distância.\n\nPor favor, mude para "Retirar no Local" ou entre em contato pelo WhatsApp.`,
          );
          setIsSubmitting(false);
          return;
        }
      } catch (err) {
        alert(
          "⚠️ Precisamos da sua localização (GPS) para confirmar se você está dentro da nossa área de entrega. Por favor, permita o acesso e tente novamente.",
        );
        setIsSubmitting(false);
        return;
      }
    }
    // =========================================================================

    try {
      const payload = {
        businessId,
        businessName,
        whatsapp,
        clientName,
        deliveryType,
        address,
        paymentMethod,
        changeFor,
        observation,
        document: documentId.replace(/\D/g, ""),
        customerPhone: customerPhone.replace(/\D/g, ""),
        cart: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          selectedExtras: item.selectedExtras.map((e) => e.name),
        })),
      };

      // 🚀 HACKER FIX: 'as any' força o TypeScript a aceitar o retorno dinâmico do servidor sem reclamar de tipagem
      const res = (await createOrderAction(payload)) as any;

      if (res?.error === "AUTH_REQUIRED") {
        sessionStorage.setItem(
          "tafanu_pending_checkout",
          JSON.stringify({
            cart,
            clientName,
            deliveryType,
            address,
            paymentMethod,
            changeFor,
            observation,
            documentId,
            customerPhone,
          }),
        );
        setIsLoginModalOpen(true);
        setIsSubmitting(false);
        return;
      }

      if (res?.error === "MISSING_DATA") {
        setDataError(true);
        setIsSubmitting(false);
        return;
      }

      if (res?.error) {
        alert(res.error);
        setIsSubmitting(false);
        return;
      }

      sessionStorage.removeItem("tafanu_pending_checkout");

      localStorage.setItem(
        "tafanu_global_profile",
        JSON.stringify({
          clientName,
          address,
          documentId,
          customerPhone,
        }),
      );

      let text = `*NOVO PEDIDO #${res.orderNumber} - ${businessName}*\n*👤 Cliente:* ${clientName}\n\n*🛍️ Itens do Pedido:*\n`;

      cart.forEach((item) => {
        const unitTotal =
          item.product.price +
          item.selectedExtras.reduce((s, e) => s + e.price, 0);
        text += `• ${item.quantity}x ${item.product.name} (R$ ${(unitTotal * item.quantity).toFixed(2)})\n`;
        if (item.selectedExtras.length > 0) {
          item.selectedExtras.forEach((e) => {
            text += `   + ${e.name} (R$ ${e.price.toFixed(2)})\n`;
          });
        }
      });

      if (observation.trim() !== "")
        text += `\n*📝 Observações:*\n_${observation}_\n`;

      // 🚀 WHATSAPP COM O TOTAL EXATO E O FRETE DISCRIMINADO
      text += `\n*💰 Subtotal: R$ ${totalCart.toFixed(2)}*\n`;
      if (deliveryType === "DELIVERY") {
        text += `*🛵 Taxa de Entrega: ${deliveryFee > 0 ? `R$ ${deliveryFee.toFixed(2)}` : "Grátis"}*\n`;
      }

      text += `*💵 TOTAL A PAGAR: R$ ${totalPedido.toFixed(2)}*\n`;

      text += `\n*💳 Forma de Pagamento:* ${paymentMethod === "PIX" ? "Pix" : paymentMethod === "CREDIT" ? "Cartão de Crédito" : paymentMethod === "DEBIT" ? "Cartão de Débito" : "Dinheiro"}\n`;
      if (paymentMethod === "CASH" && changeFor)
        text += `*Troco para:* R$ ${changeFor}\n`;

      text += `\n*🛵 Tipo:* ${deliveryType === "DELIVERY" ? "Delivery" : "Retirada no Local"}\n`;

      if (deliveryType === "DELIVERY") {
        text += `*📍 Endereço:* ${address.street}, ${address.number} - ${address.neighborhood}\n`;
        if (address.cep) text += `*CEP:* ${address.cep}\n`;
        if (address.complement)
          text += `*Complemento:* ${address.complement}\n`;
        if (address.reference) text += `*Ref:* ${address.reference}\n`;
      }

      text += `\n✅ *Status:* Registrado no sistema! Gostaria de confirmar este pedido.\n`;

      if (res.orderId) {
        const trackingUrl = `${window.location.origin}/pedido/${res.orderId}`;
        text += `\n*🔍 Acompanhe seu pedido ao vivo aqui:*\n${trackingUrl}`;

        const existingOrdersStr = localStorage.getItem("tafanu_active_orders");
        let activeOrders: string[] = [];
        if (existingOrdersStr) {
          try {
            activeOrders = JSON.parse(existingOrdersStr);
          } catch (e) {}
        }

        if (!activeOrders.includes(res.orderId)) {
          activeOrders.push(res.orderId);
        }
        localStorage.setItem(
          "tafanu_active_orders",
          JSON.stringify(activeOrders),
        );

        const cleanPhone = whatsapp.replace(/\D/g, "");
        if (cleanPhone) {
          window.open(
            `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(text)}`,
            "_blank",
          );
        } else {
          alert("O lojista ainda não cadastrou um WhatsApp.");
        }

        window.location.href = `/pedido/${res.orderId}`;
      }
    } catch (e) {
      alert("Erro de conexão com o servidor. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end md:justify-center md:p-6">
      <div className="bg-[#F8FAFC] w-full md:max-w-2xl md:mx-auto md:h-auto md:max-h-[85vh] h-[92vh] rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl flex flex-col relative overflow-hidden animate-in slide-in-from-bottom-full md:zoom-in-95 duration-300">
        {/* HEADER */}
        <div className="px-6 py-6 bg-white border-b border-slate-100 shadow-sm shrink-0 flex justify-between items-center z-20">
          <div className="flex items-center gap-4">
            {step === "CHECKOUT" ? (
              <button
                onClick={() => setStep("CART")}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all active:scale-90"
              >
                <ArrowLeft size={18} strokeWidth={2.5} />
              </button>
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-inner bg-indigo-50 text-indigo-500">
                <Store size={18} />
              </div>
            )}
            <div>
              <h2 className="text-sm font-black uppercase text-slate-800 tracking-widest leading-none">
                {step === "CART" ? "Menu Digital" : "Checkout"}
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 truncate max-w-[200px] md:max-w-md">
                {step === "CART" ? businessName : "Finalize seu pedido"}
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-rose-100 hover:text-rose-500 transition-all active:scale-90 border border-slate-100"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar">
          {!isReallyOpen && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl mb-6 flex items-center gap-3 shadow-sm animate-in fade-in zoom-in">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Store size={18} className="text-rose-500" />
              </div>
              <div>
                <h3 className="text-[11px] font-black text-rose-700 uppercase tracking-widest">
                  Estamos Fechados
                </h3>
                <p className="text-[10px] font-bold text-rose-600 mt-0.5 leading-tight">
                  Você pode explorar o cardápio, mas os pedidos estão suspensos.
                  Retornaremos <strong>{nextOpenMsg}</strong>.
                </p>
              </div>
            </div>
          )}

          {step === "CART" && (
            <div className="space-y-6">
              <div className="space-y-4">
                {products.filter((p) => p.isActive).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                      Nenhum produto disponível.
                    </p>
                  </div>
                ) : (
                  products
                    .filter((p) => p.isActive)
                    .map((product, idx) => (
                      <ProductItem
                        key={idx}
                        product={product}
                        cart={cart}
                        onAddToCart={handleAddToCart}
                        onAdjustQuantity={handleAdjustQuantity}
                      />
                    ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="mt-8 border-t border-slate-200 pt-8 animate-in fade-in duration-300">
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-widest mb-4 flex items-center gap-2">
                    <ShoppingBag size={16} className="text-indigo-500" /> Seu
                    Pedido
                  </h3>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[11px] font-black uppercase text-slate-700 truncate">
                            {item.product.name}
                          </h4>
                          {item.selectedExtras.length > 0 && (
                            <p className="text-[9px] text-slate-400 font-bold truncate mt-1">
                              Com:{" "}
                              {item.selectedExtras
                                .map((e) => e.name)
                                .join(", ")}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-2 h-8 border border-slate-200 shrink-0">
                          <button
                            onClick={() => handleAdjustQuantity(item.id, -1)}
                            className="text-rose-500 active:scale-90 p-1 hover:text-rose-600"
                          >
                            <Minus size={14} strokeWidth={3} />
                          </button>
                          <span className="text-[11px] font-black w-4 text-center text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleAdjustQuantity(item.id, 1)}
                            className="text-emerald-500 active:scale-90 p-1 hover:text-emerald-600"
                          >
                            <Plus size={14} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "CHECKOUT" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300 pb-10">
              {/* OPÇÕES DE ENTREGA PRIMEIRO! */}
              <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
                  <Truck size={16} /> Como deseja receber?
                </label>
                <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl">
                  <button
                    onClick={() => setDeliveryType("DELIVERY")}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${deliveryType === "DELIVERY" ? "bg-white shadow-sm text-indigo-600 ring-1 ring-black/5" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    Delivery
                  </button>
                  <button
                    onClick={() => setDeliveryType("PICKUP")}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${deliveryType === "PICKUP" ? "bg-white shadow-sm text-indigo-600 ring-1 ring-black/5" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    Retirar no Local
                  </button>
                </div>
              </div>

              {/* ENDEREÇO DE ENTREGA */}
              {deliveryType === "DELIVERY" && (
                <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm space-y-4 animate-in fade-in zoom-in duration-300">
                  <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
                    <MapPin size={16} /> Endereço de Entrega
                  </label>

                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="CEP"
                        maxLength={9}
                        value={address.cep}
                        onChange={(e) => handleCepChange(e.target.value)}
                        className="w-1/3 h-12 px-4 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 outline-none focus:ring-2 ring-indigo-500/20"
                      />
                      <input
                        type="text"
                        placeholder="Bairro"
                        value={address.neighborhood}
                        onChange={(e) =>
                          setAddress({
                            ...address,
                            neighborhood: e.target.value,
                          })
                        }
                        className="w-2/3 h-12 px-4 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 outline-none focus:ring-2 ring-indigo-500/20"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Rua / Avenida"
                      value={address.street}
                      onChange={(e) =>
                        setAddress({ ...address, street: e.target.value })
                      }
                      className="w-full h-12 px-4 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 outline-none focus:ring-2 ring-indigo-500/20"
                    />
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Número"
                        value={address.number}
                        onChange={(e) =>
                          setAddress({ ...address, number: e.target.value })
                        }
                        className="w-1/3 h-12 px-4 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 outline-none focus:ring-2 ring-indigo-500/20"
                      />
                      <input
                        type="text"
                        placeholder="Complemento (Apto, etc)"
                        value={address.complement}
                        onChange={(e) =>
                          setAddress({ ...address, complement: e.target.value })
                        }
                        className="w-2/3 h-12 px-4 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 outline-none focus:ring-2 ring-indigo-500/20"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Ponto de Referência"
                      value={address.reference}
                      onChange={(e) =>
                        setAddress({ ...address, reference: e.target.value })
                      }
                      className="w-full h-12 px-4 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 outline-none focus:ring-2 ring-indigo-500/20"
                    />
                  </div>
                </div>
              )}

              {/* NOME DO CLIENTE */}
              <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
                  👤 Qual seu nome?
                </label>
                <input
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  maxLength={60}
                  className="w-full h-12 px-4 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 outline-none focus:ring-2 ring-indigo-500/20 text-slate-800 placeholder:text-slate-300"
                />
              </div>

              {/* FORMA DE PAGAMENTO */}
              <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
                  <CreditCard size={16} /> Forma de Pagamento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod("PIX")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${paymentMethod === "PIX" ? "bg-indigo-50 border-indigo-200 text-indigo-600 ring-2 ring-indigo-500/20" : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100"}`}
                  >
                    <QrCode size={14} /> Pix
                  </button>
                  <button
                    onClick={() => setPaymentMethod("CASH")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${paymentMethod === "CASH" ? "bg-emerald-50 border-emerald-200 text-emerald-600 ring-2 ring-emerald-500/20" : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100"}`}
                  >
                    <Banknote size={14} /> Dinheiro
                  </button>
                  <button
                    onClick={() => setPaymentMethod("CREDIT")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${paymentMethod === "CREDIT" ? "bg-indigo-50 border-indigo-200 text-indigo-600 ring-2 ring-indigo-500/20" : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100"}`}
                  >
                    <CreditCard size={14} /> Crédito
                  </button>
                  <button
                    onClick={() => setPaymentMethod("DEBIT")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${paymentMethod === "DEBIT" ? "bg-indigo-50 border-indigo-200 text-indigo-600 ring-2 ring-indigo-500/20" : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100"}`}
                  >
                    <CreditCard size={14} /> Débito
                  </button>
                </div>

                {paymentMethod === "CASH" && (
                  <div className="pt-2 animate-in zoom-in duration-200">
                    <input
                      type="text"
                      placeholder="Troco para quanto? (Ex: 100)"
                      value={changeFor}
                      onChange={(e) =>
                        setChangeFor(e.target.value.replace(/[^0-9.,]/g, ""))
                      }
                      className="w-full h-12 px-4 bg-slate-50 rounded-xl text-xs font-bold border border-emerald-200 outline-none focus:ring-2 ring-emerald-500/20 text-emerald-700 placeholder:text-emerald-300"
                    />
                  </div>
                )}
              </div>

              {/* OBSERVAÇÕES */}
              <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
                  <MessageSquare size={16} /> Observações do Pedido
                </label>
                <textarea
                  placeholder="Ex: Tirar a cebola, maionese à parte..."
                  rows={3}
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  className="w-full p-4 bg-slate-50 rounded-xl text-xs font-medium border border-slate-200 outline-none focus:ring-2 ring-indigo-500/20 resize-none"
                />
              </div>

              {/* 🚀 RESUMO FINANCEIRO PREMIUM */}
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 shadow-inner space-y-3 mt-4">
                <div className="flex justify-between text-slate-500 text-xs font-black uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>R$ {totalCart.toFixed(2)}</span>
                </div>
                {deliveryType === "DELIVERY" && (
                  <div className="flex justify-between text-slate-500 text-xs font-black uppercase tracking-widest">
                    <span>Taxa de Entrega</span>
                    <span className={deliveryFee > 0 ? "" : "text-emerald-500"}>
                      {deliveryFee && deliveryFee > 0
                        ? `R$ ${deliveryFee.toFixed(2)}`
                        : "Grátis"}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-800 text-sm font-black pt-3 border-t border-slate-200 mt-3 uppercase tracking-widest">
                  <span>Total a Pagar</span>
                  <span className="text-emerald-600">
                    R$ {totalPedido.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* PASSAPORTE TAFANU */}
              {dataError && (
                <div
                  ref={passaporteRef}
                  className="bg-orange-50 border border-orange-200 p-6 rounded-[2rem] shadow-sm space-y-4 animate-in fade-in zoom-in duration-300"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <ShieldAlert
                      size={20}
                      className="text-orange-500 shrink-0"
                    />
                    <label className="text-[10px] font-black uppercase tracking-widest text-orange-700">
                      Passaporte Tafanu
                    </label>
                  </div>
                  <p className="text-[10px] md:text-xs font-bold text-orange-600 mb-2 leading-relaxed">
                    Falta pouco! Preencha seu WhatsApp e CPF para criarmos sua
                    identificação e liberarmos seu pedido nesta loja.
                  </p>
                  <div className="space-y-3 pt-2">
                    <input
                      type="text"
                      placeholder="Seu WhatsApp (Ex: 11 99999-9999)"
                      value={customerPhone}
                      onChange={(e) =>
                        setCustomerPhone(maskPhone(e.target.value))
                      }
                      maxLength={15}
                      className="w-full h-12 px-4 bg-white rounded-xl text-xs font-bold border border-orange-200 outline-none focus:ring-2 ring-orange-500/20 text-orange-800 placeholder:text-orange-300"
                    />
                    <input
                      type="text"
                      placeholder="Seu CPF (Apenas números)"
                      value={documentId}
                      onChange={(e) => setDocumentId(maskDoc(e.target.value))}
                      maxLength={14}
                      className="w-full h-12 px-4 bg-white rounded-xl text-xs font-bold border border-orange-200 outline-none focus:ring-2 ring-orange-500/20 text-orange-800 placeholder:text-orange-300"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RODAPÉ E FINALIZAÇÃO */}
        {cart.length > 0 && (
          <div className="bg-white p-4 md:p-6 border-t border-slate-100 shrink-0 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] z-30">
            {step === "CART" ? (
              <button
                onClick={() => {
                  if (isReallyOpen) setStep("CHECKOUT");
                }}
                disabled={!isReallyOpen}
                className={`w-full h-16 rounded-2xl flex items-center justify-between px-6 shadow-xl transition-all group overflow-hidden relative ${isReallyOpen ? "bg-slate-900 hover:bg-slate-800 active:scale-95" : "bg-slate-300 cursor-not-allowed"}`}
              >
                <div
                  className={`absolute inset-0 bg-white/5 opacity-0 ${isReallyOpen ? "group-hover:opacity-100" : ""} transition-opacity`}
                />
                <div className="flex items-center gap-3 relative z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 ${isReallyOpen ? "bg-white/10" : "bg-slate-400"}`}
                  >
                    <ShoppingBag size={14} strokeWidth={2.5} />
                  </div>
                  <div
                    className={`font-black uppercase tracking-widest text-[10px] md:text-xs m-0 p-0 ${isReallyOpen ? "text-white" : "text-slate-500"}`}
                  >
                    {isReallyOpen
                      ? `Avançar (${cart.reduce((acc, item) => acc + item.quantity, 0)})`
                      : "Loja Fechada"}
                  </div>
                </div>
                <div
                  className={`text-xs font-black uppercase px-4 py-2 rounded-xl shadow-inner border relative z-10 ${isReallyOpen ? "bg-white/10 border-white/10 text-white" : "bg-slate-200 border-slate-300 text-slate-500"}`}
                >
                  R$ {totalCart.toFixed(2)}
                </div>
              </button>
            ) : (
              <button
                onClick={handleSendWhatsApp}
                disabled={isSubmitting}
                className="w-full h-16 rounded-2xl flex items-center justify-center gap-3 px-6 shadow-xl active:scale-95 transition-all group overflow-hidden relative bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span className="font-black uppercase tracking-widest text-[10px] md:text-xs">
                      Processando...
                    </span>
                  </>
                ) : (
                  <>
                    <MessageSquare size={18} strokeWidth={2.5} />
                    <span className="font-black uppercase tracking-widest text-[10px] md:text-xs">
                      {dataError
                        ? "Validar e Enviar Pedido"
                        : `Enviar Pedido (R$ ${totalPedido.toFixed(2)})`}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
