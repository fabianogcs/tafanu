"use client";

import { toast } from "sonner";
import { useState, useEffect } from "react";
import type { BusinessHour } from "./business-editor/types";

interface HoursFormProps {
  businessSlug?: string;
  initialHours: BusinessHour[];
  hideSaveButton?: boolean;
  onHoursChange?: (hours: BusinessHour[]) => void;
}

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const FULL_DAYS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export default function HoursForm({
  initialHours,
  onHoursChange,
}: HoursFormProps) {
  const [hours, setHours] = useState(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const existing = initialHours?.find((h) => h.dayOfWeek === i);
      return (
        existing || {
          dayOfWeek: i,
          openTime: "09:00",
          closeTime: "18:00",
          isClosed: i === 0 || i === 6,
        }
      );
    });
  });

  useEffect(() => {
    if (onHoursChange) onHoursChange(hours);
  }, [hours]);

  // ============================================================================
  // 🚀 MÁSCARA INTELIGENTE SÊNIOR (TRAVA 24H E ANTI-80:90)
  // ============================================================================
  const formatTime = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (!digits) return "";

    // Regra 1: Se digitar 3, 4... até 9 como primeiro número (ex: 8), já vira "08:"
    if (digits.length === 1 && parseInt(digits, 10) >= 3) {
      return `0${digits}:`;
    }

    // Regra 2: Validação das Horas (00 a 23)
    if (digits.length >= 2) {
      let hh = parseInt(digits.slice(0, 2), 10);
      if (hh > 23) hh = 23; // Clampa no máximo 23 horas
      const hhStr = String(hh).padStart(2, "0");

      // Regra 3: Validação dos Minutos (00 a 59)
      if (digits.length === 3) {
        // O primeiro dígito dos minutos não pode ser maior que 5 (pois o máx é 59)
        let m1 = parseInt(digits[2], 10);
        if (m1 > 5) m1 = 5;
        return `${hhStr}:${m1}`;
      }

      if (digits.length === 4) {
        let mm = parseInt(digits.slice(2, 4), 10);
        if (mm > 59) mm = 59; // Clampa no máximo 59 minutos
        const mmStr = String(mm).padStart(2, "0");
        return `${hhStr}:${mmStr}`;
      }

      // Deixa sem os ":" quando tem só 2 dígitos para não travar a tecla Backspace (apagar)
      return hhStr;
    }

    return digits;
  };

  // ============================================================================
  // 🛡️ AUTO-COMPLETAR AO SAIR DO CAMPO (onBlur)
  // ============================================================================
  const handleBlur = (
    index: number,
    field: "openTime" | "closeTime",
    value: string,
  ) => {
    const newHours = [...hours];
    let val = value.trim();

    // Se deixou vazio ou muito curto, coloca um padrão seguro ou preenche com zeros
    if (!val || val.length === 0) {
      val = field === "openTime" ? "09:00" : "18:00";
    } else if (val.length === 1) {
      val = `0${val}:00`;
    } else if (val.length === 2) {
      val = `${val}:00`;
    } else if (val.length === 3) {
      // Ex: "12:" -> "12:00" ou "123" -> "12:30"
      val = val.includes(":")
        ? `${val}00`
        : `${val.slice(0, 2)}:0${val.slice(2)}`;
    } else if (val.length === 4) {
      // Ex: "12:3" -> "12:30"
      val = `${val}0`;
    }

    newHours[index] = { ...newHours[index], [field]: val };
    setHours(newHours);
  };

  const handleChange = (index: number, field: string, value: any) => {
    const newHours = [...hours];
    let val =
      field === "openTime" || field === "closeTime" ? formatTime(value) : value;

    const updatedDay = { ...newHours[index], [field]: val };

    // BLOQUEIO INTELIGENTE: Só valida quando o usuário termina os 5 caracteres (HH:MM)
    if (
      !updatedDay.isClosed &&
      updatedDay.openTime.length === 5 &&
      updatedDay.closeTime.length === 5
    ) {
      const [openH, openM] = updatedDay.openTime.split(":").map(Number);
      const [closeH, closeM] = updatedDay.closeTime.split(":").map(Number);

      const openInMinutes = openH * 60 + openM;
      const closeInMinutes = closeH * 60 + closeM;

      // 🚀 Só bloqueia se o cara colocar exatamente o MESMO horário (ex: 18:00 às 18:00)
      if (closeInMinutes === openInMinutes) {
        toast.error(`Horário inválido de ${DAYS[index]}`, {
          description:
            "O fechamento não pode ser igual ao horário de abertura.",
        });
        return;
      }
    }

    newHours[index] = updatedDay;
    setHours(newHours);
  };

  return (
    <div className="w-full space-y-2">
      {hours.map((day, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 md:p-4 rounded-[1.5rem] bg-white border border-slate-100 shadow-sm w-full gap-1"
        >
          {/* LADO ESQUERDO: Checkbox + Nome do Dia */}
          <div className="flex items-center gap-2 min-w-0">
            <input
              type="checkbox"
              checked={!day.isClosed}
              onChange={(e) =>
                handleChange(index, "isClosed", !e.target.checked)
              }
              className="w-5 h-5 rounded-lg border-slate-200 text-slate-900 focus:ring-slate-900 flex-shrink-0 cursor-pointer"
            />
            <span
              className={`font-black text-[11px] md:text-xs uppercase leading-none ${day.isClosed ? "text-slate-300" : "text-slate-700"}`}
            >
              <span className="hidden lg:inline">{FULL_DAYS[index]}</span>
              <span className="lg:hidden">{DAYS[index]}</span>
            </span>
          </div>

          {/* LADO DIREITO: Inputs de Horário */}
          <div className="flex items-center gap-1 shrink-0">
            {!day.isClosed ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  inputMode="numeric"
                  value={day.openTime}
                  maxLength={5}
                  onChange={(e) =>
                    handleChange(index, "openTime", e.target.value)
                  }
                  onBlur={(e) => handleBlur(index, "openTime", e.target.value)}
                  className="w-[52px] sm:w-16 h-9 bg-slate-50 border border-slate-100 rounded-xl font-black text-center text-[11px] md:text-xs outline-none focus:border-indigo-300 transition-colors"
                  placeholder="09:00"
                />
                <span className="text-[10px] font-black text-slate-300">/</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={day.closeTime}
                  maxLength={5}
                  onChange={(e) =>
                    handleChange(index, "closeTime", e.target.value)
                  }
                  onBlur={(e) => handleBlur(index, "closeTime", e.target.value)}
                  className="w-[52px] sm:w-16 h-9 bg-slate-50 border border-slate-100 rounded-xl font-black text-center text-[11px] md:text-xs outline-none focus:border-indigo-300 transition-colors"
                  placeholder="18:00"
                />
              </div>
            ) : (
              <div className="h-9 flex items-center">
                <span className="text-[9px] font-black text-red-400 bg-red-50 px-3 py-1.5 rounded-xl uppercase">
                  Fechado
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
