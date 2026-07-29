"use client";

import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react"; // 🚀 ADICIONAMOS OS ÍCONES
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
  const [hours, setHours] = useState<any[]>(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const existing = initialHours?.find((h) => h.dayOfWeek === i);
      return (
        existing || {
          dayOfWeek: i,
          openTime: "09:00",
          closeTime: "18:00",
          openTime2: null,
          closeTime2: null,
          isClosed: i === 0 || i === 6,
        }
      );
    });
  });

  useEffect(() => {
    if (onHoursChange) onHoursChange(hours);
  }, [hours]);

  // ============================================================================
  // 🚀 MÁSCARA INTELIGENTE SÊNIOR
  // ============================================================================
  const formatTime = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (!digits) return "";

    if (digits.length === 1 && parseInt(digits, 10) >= 3) {
      return `0${digits}:`;
    }

    if (digits.length >= 2) {
      let hh = parseInt(digits.slice(0, 2), 10);
      if (hh > 23) hh = 23;
      const hhStr = String(hh).padStart(2, "0");

      if (digits.length === 3) {
        let m1 = parseInt(digits[2], 10);
        if (m1 > 5) m1 = 5;
        return `${hhStr}:${m1}`;
      }

      if (digits.length === 4) {
        let mm = parseInt(digits.slice(2, 4), 10);
        if (mm > 59) mm = 59;
        const mmStr = String(mm).padStart(2, "0");
        return `${hhStr}:${mmStr}`;
      }
      return hhStr;
    }
    return digits;
  };

  const handleBlur = (
    index: number,
    field: "openTime" | "closeTime" | "openTime2" | "closeTime2",
    value: string,
  ) => {
    const newHours = [...hours];
    let val = value?.trim() || "";

    if (!val || val.length === 0) {
      if (field === "openTime") val = "09:00";
      else if (field === "closeTime") val = "18:00";
      else if (field === "openTime2") val = "18:00";
      else if (field === "closeTime2") val = "23:00";
    } else if (val.length === 1) {
      val = `0${val}:00`;
    } else if (val.length === 2) {
      val = `${val}:00`;
    } else if (val.length === 3) {
      val = val.includes(":")
        ? `${val}00`
        : `${val.slice(0, 2)}:0${val.slice(2)}`;
    } else if (val.length === 4) {
      val = `${val}0`;
    }

    newHours[index] = { ...newHours[index], [field]: val };
    setHours(newHours);
  };

  const handleChange = (index: number, field: string, value: any) => {
    const newHours = [...hours];
    let val = field.includes("Time") ? formatTime(value) : value;

    const updatedDay = { ...newHours[index], [field]: val };

    if (
      !updatedDay.isClosed &&
      updatedDay.openTime?.length === 5 &&
      updatedDay.closeTime?.length === 5
    ) {
      const [openH, openM] = updatedDay.openTime.split(":").map(Number);
      const [closeH, closeM] = updatedDay.closeTime.split(":").map(Number);
      if (closeH * 60 + closeM === openH * 60 + openM) {
        toast.error(`Horário inválido de ${DAYS[index]}`, {
          description: "O fechamento não pode ser igual à abertura.",
        });
        return;
      }
    }

    newHours[index] = updatedDay;
    setHours(newHours);
  };

  // 🚀 A MÁGICA DO SEGUNDO TURNO
  const toggleSecondShift = (index: number, active: boolean) => {
    const newHours = [...hours];
    if (active) {
      newHours[index] = {
        ...newHours[index],
        openTime2: "18:00",
        closeTime2: "23:00",
      };
    } else {
      newHours[index] = {
        ...newHours[index],
        openTime2: null,
        closeTime2: null,
      };
    }
    setHours(newHours);
  };

  return (
    <div className="w-full space-y-2">
      {hours.map((day, index) => (
        <div
          key={index}
          className="flex items-start justify-between p-3 md:p-4 rounded-[1.5rem] bg-white border border-slate-100 shadow-sm w-full gap-1"
        >
          {/* LADO ESQUERDO */}
          <div className="flex items-center gap-2 min-w-0 mt-2">
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

          {/* LADO DIREITO (OS TURNOS) */}
          <div className="flex flex-col gap-2 shrink-0">
            {!day.isClosed ? (
              <>
                {/* 1º TURNO */}
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={day.openTime || ""}
                    maxLength={5}
                    onChange={(e) =>
                      handleChange(index, "openTime", e.target.value)
                    }
                    onBlur={(e) =>
                      handleBlur(index, "openTime", e.target.value)
                    }
                    className="w-[52px] sm:w-16 h-9 bg-slate-50 border border-slate-100 rounded-xl font-black text-center text-[11px] md:text-xs outline-none focus:border-indigo-300 transition-colors"
                    placeholder="09:00"
                  />
                  <span className="text-[10px] font-black text-slate-300">
                    /
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={day.closeTime || ""}
                    maxLength={5}
                    onChange={(e) =>
                      handleChange(index, "closeTime", e.target.value)
                    }
                    onBlur={(e) =>
                      handleBlur(index, "closeTime", e.target.value)
                    }
                    className="w-[52px] sm:w-16 h-9 bg-slate-50 border border-slate-100 rounded-xl font-black text-center text-[11px] md:text-xs outline-none focus:border-indigo-300 transition-colors"
                    placeholder="18:00"
                  />
                  {/* BOTÃO + (Aparece se não tiver 2º turno) */}
                  {day.openTime2 === null || day.openTime2 === undefined ? (
                    <button
                      onClick={() => toggleSecondShift(index, true)}
                      type="button"
                      className="w-7 h-9 flex items-center justify-center bg-slate-50 hover:bg-emerald-50 text-slate-300 hover:text-emerald-500 rounded-xl border border-transparent hover:border-emerald-100 transition-all"
                      title="Adicionar pausa/2º turno"
                    >
                      <Plus size={16} strokeWidth={3} />
                    </button>
                  ) : (
                    <div className="w-7 h-9" />
                  )}
                </div>

                {/* 2º TURNO */}
                {day.openTime2 !== null && day.openTime2 !== undefined && (
                  <div className="flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-300">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={day.openTime2 || ""}
                      maxLength={5}
                      onChange={(e) =>
                        handleChange(index, "openTime2", e.target.value)
                      }
                      onBlur={(e) =>
                        handleBlur(index, "openTime2", e.target.value)
                      }
                      className="w-[52px] sm:w-16 h-9 bg-emerald-50/50 border border-emerald-100/50 rounded-xl font-black text-center text-[11px] md:text-xs outline-none focus:border-emerald-300 transition-colors"
                      placeholder="18:00"
                    />
                    <span className="text-[10px] font-black text-slate-300">
                      /
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={day.closeTime2 || ""}
                      maxLength={5}
                      onChange={(e) =>
                        handleChange(index, "closeTime2", e.target.value)
                      }
                      onBlur={(e) =>
                        handleBlur(index, "closeTime2", e.target.value)
                      }
                      className="w-[52px] sm:w-16 h-9 bg-emerald-50/50 border border-emerald-100/50 rounded-xl font-black text-center text-[11px] md:text-xs outline-none focus:border-emerald-300 transition-colors"
                      placeholder="23:00"
                    />
                    {/* BOTÃO X */}
                    <button
                      onClick={() => toggleSecondShift(index, false)}
                      type="button"
                      className="w-7 h-9 flex items-center justify-center bg-slate-50 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-xl border border-transparent hover:border-rose-100 transition-all"
                      title="Remover 2º turno"
                    >
                      <X size={16} strokeWidth={3} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="h-9 mt-2 flex items-center">
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
