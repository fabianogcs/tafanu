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
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getBookedSlots, createOrderAction } from "@/app/actions"; // 🚀 IMPORTAMOS AS AÇÕES REAIS

interface AgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: any;
  business: {
    id: string; // 🚀 O NOVO ID
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

export default function AgendaModal({
  isOpen,
  onClose,
  service,
  business,
}: AgendaModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState(""); // Pegar o telefone é vital para o lojista

  const [bookedSlots, setBookedSlots] = useState<string[]>([]); // 🚀 Guarda os ocupados
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Gera 15 dias abertos
  const availableDays = useMemo(() => {
    // 🚀 Usa a agenda independente. Se não existir (legado), usa o horário da loja.
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

  // 🚀 2. O RADAR: Sempre que o usuário clica num dia, pergunta pro banco quem já comprou!
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

  // 3. Gera as horas com o tempo dinâmico (Excluindo os ocupados!)
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
    if (!dayConfig || !dayConfig.openTime || !dayConfig.closeTime) return [];

    const slots: string[] = [];
    let currentMins = timeToMins(dayConfig.openTime);
    const closeMins = timeToMins(dayConfig.closeTime);
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    const currentNowMins = now.getHours() * 60 + now.getMinutes();

    while (currentMins < closeMins) {
      const timeString = minsToTime(currentMins);
      // Só mostra se for no futuro e NÃO estiver no banco!
      if (
        (!isToday || currentMins > currentNowMins + 60) &&
        !bookedSlots.includes(timeString)
      ) {
        slots.push(timeString);
      }
      currentMins += Number(config.duration || 30); // 🚀 O PULO DO GATO QUE GERA 45, 60, 90 MINUTOS AUTOMATICAMENTE!
    }
    return slots;
  }, [selectedDate, business.hours, business.agendaConfig, bookedSlots]);

  // 🚀 4. A GRAVAÇÃO REAL DO PEDIDO NO KANBAN DO LOJISTA
  const handleConfirmBooking = async () => {
    if (
      !selectedDate ||
      !selectedTime ||
      !clientName.trim() ||
      !clientPhone.trim()
    ) {
      alert("Por favor, preencha todos os dados.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        businessId: business.id,
        businessName: business.name,
        whatsapp: business.whatsapp,
        clientName: clientName,
        customerPhone: clientPhone.replace(/\D/g, ""), // Limpa o telefone
        deliveryType: "AGENDA", // 🚀 Diz pro sistema que não tem frete nem rua
        address: null,
        paymentMethod: "ON_SITE", // Paga lá na hora
        changeFor: "",
        observation: "Agendamento pelo Tafanu Booking",
        document: "",
        appointmentDate: selectedDate.toISOString(), // 🚀 SALVA O DIA
        appointmentTime: selectedTime, // 🚀 SALVA A HORA
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

      if (res?.error) {
        alert(res.error);
        setIsSubmitting(false);
        return;
      }

      // SUCESSO! Dispara pro WhatsApp avisando o lojista
      const dataFormatada = format(selectedDate, "dd/MM/yyyy (EEEE)", {
        locale: ptBR,
      });
      const text = `Olá, fiz uma reserva na vitrine!\n\n*Serviço:* ${service?.name}\n*Data:* ${dataFormatada}\n*Horário:* ${selectedTime}\n*Cliente:* ${clientName}\n\nO pedido já está no seu painel Kanban!`;

      const cleanPhone = business.whatsapp?.replace(/\D/g, "");
      if (cleanPhone) {
        window.open(
          `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(text)}`,
          "_blank",
        );
      }

      onClose(); // Fecha o modal
      // Se quiser, pode redirecionar para a tela de acompanhamento: window.location.href = `/pedido/${res.orderId}`;
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

          {/* DADOS DO CLIENTE */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
              <User size={14} /> 3. Seus Dados
            </label>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Seu nome completo"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full h-14 px-5 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-200 outline-none focus:ring-2 ring-emerald-500/20 text-slate-800 placeholder:text-slate-400"
              />
              <input
                type="text"
                placeholder="Seu WhatsApp (Ex: 11 99999-9999)"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full h-14 px-5 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-200 outline-none focus:ring-2 ring-emerald-500/20 text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-white rounded-b-[2rem] shrink-0">
          <button
            onClick={handleConfirmBooking}
            disabled={
              !selectedDate ||
              !selectedTime ||
              !clientName.trim() ||
              !clientPhone.trim() ||
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
    </div>
  );
}
