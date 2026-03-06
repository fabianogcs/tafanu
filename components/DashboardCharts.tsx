"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function DashboardCharts({ analytics }: { analytics: any[] }) {
  // 1. Lógica do Gráfico de Linha: Visitas dos últimos 7 dias
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  });

  const viewsData = last7Days.map((dateStr) => {
    const count = analytics.filter((e) => {
      if (e.eventType !== "VIEW") return false;
      const eDate = new Date(e.createdAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });
      return eDate === dateStr;
    }).length;
    return { name: dateStr, Visitas: count };
  });

  // 2. Lógica do Gráfico de Pizza: Distribuição de Cliques
  const whatsClicks = analytics.filter(
    (e) => e.eventType === "WHATSAPP",
  ).length;
  const phoneClicks = analytics.filter((e) => e.eventType === "PHONE").length;
  const otherClicks = analytics.filter(
    (e) => !["VIEW", "WHATSAPP", "PHONE"].includes(e.eventType),
  ).length;

  const pieData = [
    { name: "WhatsApp", value: whatsClicks, color: "#10b981" }, // Verde
    { name: "Telefone", value: phoneClicks, color: "#3b82f6" }, // Azul
    { name: "Redes/Lojas", value: otherClicks, color: "#6366f1" }, // Roxo
  ].filter((item) => item.value > 0); // Só renderiza o que tiver mais de 0 cliques

  const hasClicks = pieData.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full mt-6">
      {/* GRÁFICO 1: LINHA (Acessos) */}
      <div className="w-full h-72 flex flex-col">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
          Acessos (Últimos 7 dias)
        </h3>
        <div className="flex-1 w-full min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={viewsData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  fontWeight: "bold",
                }}
                cursor={{
                  stroke: "#cbd5e1",
                  strokeWidth: 1,
                  strokeDasharray: "3 3",
                }}
              />
              <Line
                type="monotone"
                dataKey="Visitas"
                stroke="#6366f1"
                strokeWidth={4}
                dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GRÁFICO 2: PIZZA/DONUT (Origem dos Cliques) */}
      <div className="w-full h-72 flex flex-col">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
          Distribuição de Cliques
        </h3>
        <div className="flex-1 w-full flex items-center justify-center min-h-[200px]">
          {hasClicks ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                    fontWeight: "bold",
                  }}
                  itemStyle={{ color: "#1e293b" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-300">
              <div className="w-32 h-32 rounded-full border-8 border-slate-100 flex items-center justify-center">
                <span className="text-xs font-bold uppercase tracking-widest">
                  Sem Cliques
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
