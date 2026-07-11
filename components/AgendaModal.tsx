"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  User,
  MessageCircle,
  ChevronRight,
  Loader2,
  ShieldAlert, // 🚀 NOVO ÍCONE DE SEGURANÇA
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getBookedSlots, createOrderAction } from "@/app/actions";
import LoginModal from "./LoginModal"; // 🚀 IMPORTAMOS O LOGIN

interface AgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: any;
  business: {
    id: string;
    name: string;
    whatsapp: string;
    hours: any[];
    agendaConfig?: any;
  };
}

const timeToMins = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};
const minsToTime = (mins: number) => {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

// 🚀 FORMATADORES DE SEGURANÇA
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

export default function AgendaModal({
  isOpen,
  onClose,
  service,
  business,
}: AgendaModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // 🚀 NOVOS ESTADOS DO CLIENTE
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [documentId, setDocumentId] = useState("");

  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🚀 ESTADOS DE SEGURANÇA E UX
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [dataError, setDataError] = useState(false);
  const [isProfileLocked, setIsProfileLocked] = useState(false); // Trava os campos!

  // 🚀 BUSCA OS DADOS SALVOS ASSIM QUE O MODAL ABRE
  useEffect(() => {
    try {
      const globalProfileStr = localStorage.getItem("tafanu_global_profile");
      if (globalProfileStr) {
        const profile = JSON.parse(globalProfileStr);
        if (profile.clientName) setClientName(profile.clientName);
        if (profile.customerPhone)
          setClientPhone(maskPhone(profile.customerPhone));
        if (profile.documentId) setDocumentId(maskDoc(profile.documentId));

        // Se o cliente já tem os 3 dados, CONGELA OS CAMPOS!
        if (profile.clientName && profile.customerPhone && profile.documentId) {
          setIsProfileLocked(true);
        }
      }
    } catch (e) {}
  }, []);

  const availableDays = useMemo(() => {
    const config = business.agendaConfig || {
      duration: 30,
      hours: business.hours || [],
    };
    const days: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 15; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();
      const dayConfig = config.hours?.find(
        (h: any) => Number(h.dayOfWeek) === dayOfWeek,
      );
      if (dayConfig && !dayConfig.isClosed) days.push(date);
    }
    return days;
  }, [business.hours, business.agendaConfig]);

  useEffect(() => {
    if (availableDays.length > 0 && !selectedDate) {
      setSelectedDate(availableDays[0]);
    }
  }, [availableDays]);

  useEffect(() => {
    if (!selectedDate || !business.id) return;
    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      const ocupados = await getBookedSlots(
        business.id,
        selectedDate.toISOString(),
      );
      setBookedSlots(ocupados);
      setIsLoadingSlots(false);
    };
    fetchSlots();
  }, [selectedDate, business.id]);

  const availableSlots = useMemo(() => {
    const config = business.agendaConfig || {
      duration: 30,
      hours: business.hours || [],
    };
    if (!selectedDate) return [];

    const dayOfWeek = selectedDate.getDay();
    const dayConfig = config.hours?.find(
      (h: any) => Number(h.dayOfWeek) === dayOfWeek,
    );

    if (
      !dayConfig ||
      dayConfig.isClosed ||
      !dayConfig.openTime ||
      !dayConfig.closeTime
    )
      return [];

    // 🚀 Lemos as exceções que o Lojista bloqueou lá no painel!
    const exceptions = dayConfig.exceptions || [];

    const slots: string[] = [];
    let currentMins = timeToMins(dayConfig.openTime);
    const closeMins = timeToMins(dayConfig.closeTime);
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();

    // Calcula os minutos atuais (com uma margem de segurança de 30 min)
    const currentNowMins = now.getHours() * 60 + now.getMinutes();
    const margemSeguranca = 30; // Cliente só agenda se for daqui a pelo menos meia hora

    while (currentMins < closeMins) {
      const timeString = minsToTime(currentMins);

      // 🚀 A GRANDE TRAVA TRIPLA:
      // 1. Já passou do horário de hoje? (Com margem de meia hora pra ele chegar)
      // 2. Alguém já agendou nesse horário? (bookedSlots)
      // 3. O dono da loja riscou esse horário da agenda manualmente? (exceptions)

      const isPastToday =
        isToday && currentMins <= currentNowMins + margemSeguranca;
      const isBooked = bookedSlots.includes(timeString);
      const isManuallyBlockedByOwner = exceptions.includes(timeString);

      if (!isPastToday && !isBooked && !isManuallyBlockedByOwner) {
        slots.push(timeString);
      }

      currentMins += Number(config.duration || 30);
    }
    return slots;
  }, [selectedDate, business.hours, business.agendaConfig, bookedSlots]);

  const handleConfirmBooking = async () => {
    // 1. Só exige a data, hora e o NOME no primeiro clique.
    if (!selectedDate || !selectedTime || !clientName.trim()) {
      alert("Por favor, preencha a data, o horário e o seu nome.");
      return;
    }

    // 2. Só exige WhatsApp e CPF SE o backend acusou que eles faltam (dataError).
    if (dataError && (!clientPhone.trim() || !documentId.trim())) {
      alert("Por favor, preencha seu WhatsApp e CPF para confirmar a reserva.");
      return;
    }

    setIsSubmitting(true);
    setDataError(false);

    try {
      const payload = {
        businessId: business.id,
        businessName: business.name,
        whatsapp: business.whatsapp,
        clientName: clientName,
        customerPhone: clientPhone.replace(/\D/g, ""),
        document: documentId.replace(/\D/g, ""), // 🚀 ENVIA O CPF LIMPO
        deliveryType: "AGENDA",
        address: null,
        paymentMethod: "ON_SITE",
        changeFor: "",
        observation: "Agendamento pelo Tafanu Booking",
        appointmentDate: selectedDate.toISOString(),
        appointmentTime: selectedTime,
        cart: [
          {
            productId: service?.id || "agenda_item",
            productName: service?.name || "Agendamento",
            quantity: 1,
            selectedExtras: [],
          },
        ],
      };

      const res = (await createOrderAction(payload)) as any;

      // 🚀 INTERCEPTADOR DE LOGIN!
      if (res?.error === "AUTH_REQUIRED") {
        setIsLoginModalOpen(true);
        setIsSubmitting(false);
        return;
      }

      // 🚀 INTERCEPTADOR DE PASSAPORTE TAFANU!
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

      // 🚀 SUCESSO! SALVA OS DADOS NO CACHE E TRAVA PROS PRÓXIMOS
      localStorage.setItem(
        "tafanu_global_profile",
        JSON.stringify({
          clientName,
          customerPhone: clientPhone,
          documentId,
        }),
      );

      const dataFormatada = format(selectedDate, "dd/MM/yyyy (EEEE)", {
        locale: ptBR,
      });
      let text = `Olá, fiz uma reserva na vitrine!\n\n*Serviço:* ${service?.name}\n*Data:* ${dataFormatada}\n*Horário:* ${selectedTime}\n*Cliente:* ${clientName}\n\nO pedido já está no seu painel Kanban!`;

      if (res.orderId) {
        const trackingUrl = `${window.location.origin}/pedido/${res.orderId}`;
        text += `\n*🔍 Acompanhe sua reserva aqui:*\n${trackingUrl}`;

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

        const cleanPhone = business.whatsapp?.replace(/\D/g, "");
        if (cleanPhone) {
          window.open(
            `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(text)}`,
            "_blank",
          );
        }

        window.location.href = `/pedido/${res.orderId}`;
      } else {
        onClose();
      }
    } catch (err) {
      alert("Erro ao confirmar reserva. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end md:justify-center items-center md:p-6">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white w-full md:max-w-md h-[90vh] md:h-auto md:max-h-[90vh] rounded-t-[2rem] md:rounded-[2rem] shadow-2xl flex flex-col relative"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-black uppercase text-slate-800 tracking-widest flex items-center gap-2">
              <CalendarIcon size={18} className="text-emerald-500" />{" "}
              Agendamento
            </h2>
            <p className="text-xs font-bold text-slate-400 mt-1 truncate max-w-[250px]">
              {service?.name || "Serviço"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-colors"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          {/* SELEÇÃO DE DIA */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              1. Escolha a Data
            </label>
            {availableDays.length === 0 ? (
              <p className="text-sm font-semibold text-rose-500 bg-rose-50 p-4 rounded-xl">
                Nenhum dia configurado.
              </p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6 snap-x">
                {availableDays.map((date, idx) => {
                  const isSelected =
                    selectedDate?.toDateString() === date.toDateString();
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedTime(null);
                      }}
                      className={`flex flex-col items-center justify-center min-w-[70px] h-[80px] rounded-2xl border transition-all snap-start ${isSelected ? "bg-emerald-500 border-emerald-500 text-white shadow-lg scale-105" : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300"}`}
                    >
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? "text-emerald-100" : "text-slate-400"}`}
                      >
                        {format(date, "EEE", { locale: ptBR }).replace(".", "")}
                      </span>
                      <span className="text-2xl font-black mt-1">
                        {format(date, "dd")}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* SELEÇÃO DE HORÁRIO */}
          <div className="space-y-4 min-h-[120px]">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
              <Clock size={14} /> 2. Escolha o Horário
            </label>
            {isLoadingSlots ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 size={24} className="text-emerald-500 animate-spin" />
              </div>
            ) : availableSlots.length === 0 ? (
              <p className="text-xs font-semibold text-slate-500 bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                Nenhum horário disponível nesta data.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {availableSlots.map((time, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedTime(time)}
                    className={`py-3 rounded-xl text-xs font-black transition-all border ${selectedTime === time ? "bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm ring-2 ring-emerald-500/20 scale-105" : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/30"}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 🚀 DADOS DO CLIENTE (COLETA PREGUIÇOSA) */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
              <User size={14} /> 3. Seus Dados
            </label>

            <input
              type="text"
              placeholder="Seu nome completo"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              maxLength={60}
              className="w-full h-14 px-5 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-200 outline-none focus:ring-2 ring-emerald-500/20 text-slate-800 placeholder:text-slate-400"
            />

            {/* SÓ APARECE SE O SERVIDOR PEDIR O CPF/WHATSAPP */}
            {dataError && (
              <div className="bg-orange-50 border border-orange-200 p-5 rounded-2xl shadow-sm animate-in fade-in zoom-in mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert size={16} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase text-orange-700 tracking-widest">
                    Passaporte Tafanu
                  </span>
                </div>
                <p className="text-[10px] font-bold text-orange-600 mb-4 leading-relaxed">
                  Para sua segurança, informe seu WhatsApp e CPF para
                  confirmarmos a reserva. <br />
                  <span className="opacity-80">
                    🔒 Seu CPF é protegido e não será enviado ao
                    estabelecimento.
                  </span>
                </p>

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Seu WhatsApp (Ex: 11 99999-9999)"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(maskPhone(e.target.value))}
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
        </div>

        <div className="p-6 border-t border-slate-100 bg-white rounded-b-[2rem] shrink-0">
          <button
            onClick={handleConfirmBooking}
            disabled={
              !selectedDate ||
              !selectedTime ||
              !clientName.trim() ||
              (dataError && (!clientPhone.trim() || !documentId.trim())) ||
              isSubmitting
            }
            className="w-full h-16 rounded-2xl flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <MessageCircle size={20} strokeWidth={2.5} />
            )}
            <span className="font-black uppercase tracking-widest text-[11px] md:text-xs">
              {isSubmitting ? "Processando..." : "Confirmar Reserva"}
            </span>
            {!isSubmitting && <ChevronRight size={18} className="opacity-50" />}
          </button>
        </div>
      </motion.div>

      {/* 🚀 LOGIN MODAL SE PRECISAR */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
