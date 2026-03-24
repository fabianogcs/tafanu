"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function DashboardCharts({ analytics }: { analytics: any[] }) {
  // 🚀 1. GRÁFICO DE LINHAS: EVOLUÇÃO DE ENGAJAMENTO (Cliques Totais)
  // Como as visitas são um número absoluto, vamos mostrar a evolução real de interações nos últimos 7 dias
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      timeZone: "America/Sao_Paulo", // Blindado contra bugs de fuso horário da Vercel
    });
  });

  const interactionsData = last7Days.map((dateStr) => {
    const count = analytics.filter((e) => {
      // Pega TODOS os eventos (cliques) do dia, mostrando o engajamento real
      const eDate = new Date(e.createdAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        timeZone: "America/Sao_Paulo",
      });
      return eDate === dateStr;
    }).length;
    return { name: dateStr, Interações: count };
  });

  // 🚀 2. GRÁFICO DE PIZZA: AGRUPAMENTO EXATO
  // Separado exatamente como no seu DashboardPage
  const whatsClicks = analytics.filter(
    (e) => e.eventType === "WHATSAPP",
  ).length;
  const phoneClicks = analytics.filter((e) => e.eventType === "PHONE").length;
  const mapClicks = analytics.filter((e) => e.eventType === "MAP").length;

  const socialClicks = analytics.filter((e) =>
    ["INSTAGRAM", "FACEBOOK", "TIKTOK", "WEBSITE"].includes(e.eventType),
  ).length;

  const storeClicks = analytics.filter((e) =>
    ["MERCADOLIVRE", "SHOPEE", "IFOOD", "SHEIN"].includes(e.eventType),
  ).length;

  // Montando as fatias da pizza com as cores idênticas às caixinhas de métricas
  const pieData = [
    { name: "WhatsApp", value: whatsClicks, color: "#10b981" }, // emerald-500
    { name: "Ligações", value: phoneClicks, color: "#0ea5e9" }, // sky-500
    { name: "Rotas (Mapa)", value: mapClicks, color: "#f43f5e" }, // rose-500
    { name: "Redes Sociais", value: socialClicks, color: "#a855f7" }, // purple-500
    { name: "Lojas Oficiais", value: storeClicks, color: "#f97316" }, // orange-500
  ].filter((item) => item.value > 0);

  const hasClicks = pieData.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full mt-6">
      {/* GRÁFICO 1: LINHA (Evolução de Interações) */}
      <div className="w-full h-80 flex flex-col bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
          Engajamento Diário (Últimos 7 dias)
        </h3>
        <div className="flex-1 w-full min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={interactionsData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: "bold" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: "bold" }}
                allowDecimals={false}
              />
              <RechartsTooltip
                contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                  fontWeight: "bold",
                  fontSize: "12px",
                }}
                cursor={{
                  stroke: "#e2e8f0",
                  strokeWidth: 2,
                  strokeDasharray: "4 4",
                }}
              />
              <Line
                type="monotone"
                dataKey="Interações"
                stroke="#6366f1"
                strokeWidth={4}
                dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, strokeWidth: 0, fill: "#4f46e5" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GRÁFICO 2: PIZZA/DONUT (Origem dos Cliques) */}
      <div className="w-full h-80 flex flex-col bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          Distribuição de Ações
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
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                    fontWeight: "black",
                    fontSize: "12px",
                    textTransform: "uppercase",
                  }}
                  itemStyle={{ fontWeight: "bold" }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{
                    fontSize: "10px",
                    fontWeight: "bold",
                    paddingTop: "10px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-300">
              <div className="w-32 h-32 rounded-full border-8 border-slate-100 flex items-center justify-center bg-slate-50">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center px-4">
                  Aguardando Ações
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
