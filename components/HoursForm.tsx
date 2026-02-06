"use client";

import { useState, useEffect } from "react";

interface HoursFormProps {
  businessSlug: string;
  initialHours: any[];
  hideSaveButton?: boolean;
  onHoursChange?: (hours: any[]) => void;
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

  const formatTime = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`.slice(0, 5);
  };

  const handleChange = (index: number, field: string, value: any) => {
    const newHours = [...hours];
    let val =
      field === "openTime" || field === "closeTime" ? formatTime(value) : value;
    newHours[index] = { ...newHours[index], [field]: val };
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
              className="w-5 h-5 rounded-lg border-slate-200 text-slate-900 focus:ring-slate-900 flex-shrink-0"
            />
            <span
              className={`font-black text-[11px] md:text-xs uppercase leading-none ${day.isClosed ? "text-slate-300" : "text-slate-700"}`}
            >
              {/* Prioriza o nome curto no mobile para evitar quebras */}
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
                  onChange={(e) =>
                    handleChange(index, "openTime", e.target.value)
                  }
                  className="w-[52px] sm:w-16 h-9 bg-slate-50 border border-slate-100 rounded-xl font-black text-center text-[11px] md:text-xs outline-none focus:border-indigo-300"
                  placeholder="00:00"
                />
                <span className="text-[10px] font-black text-slate-300">/</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={day.closeTime}
                  onChange={(e) =>
                    handleChange(index, "closeTime", e.target.value)
                  }
                  className="w-[52px] sm:w-16 h-9 bg-slate-50 border border-slate-100 rounded-xl font-black text-center text-[11px] md:text-xs outline-none focus:border-indigo-300"
                  placeholder="00:00"
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
