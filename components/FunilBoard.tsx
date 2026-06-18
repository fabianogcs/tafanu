"use client";

import { useState } from "react";
import { MessageCircle, CheckCircle2, RotateCcw, Clock } from "lucide-react";
import { moverEtapaFunil } from "@/app/dashboard/funil/actions";

// Definição das abas e textos (exatamente como você pediu)
const TABS = [
  { id: 1, title: "1. Entrega", daysRule: 30 },
  { id: 2, title: "2. Checagem", daysRule: 27 },
  { id: 3, title: "3. Valor", daysRule: 15 },
  { id: 4, title: "4. Escassez", daysRule: 5 },
  { id: 5, title: "5. Fechamento", daysRule: 1 },
];

export default function FunilBoard({ leads }: { leads: any[] }) {
  const [activeTab, setActiveTab] = useState(1);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleMover = async (id: string, novaEtapa: number) => {
    setLoadingId(id);
    await moverEtapaFunil(id, novaEtapa);
    setLoadingId(null);
  };

  const getWhatsAppLink = (lead: any, etapa: number) => {
    // Puxa exatamente o telefone e o nome do dono
    const phone = lead.user?.phone?.replace(/\D/g, "") || "";
    const name = lead.user?.name?.split(" ")[0] || "Responsável";
    const businessName = lead.name || "seu negócio";
    const email = lead.user?.email || "";
    const slug = lead.slug || "";

    let msg = "";

    if (etapa === 1) {
      msg = `Olá, ${name}! Tudo bem? Aqui é do portal Tafanu.\n\nNossa curadoria mapeou os melhores negócios da região e selecionamos a *${businessName}* para ter um Perfil Oficial na nossa plataforma.\n\nNossa equipe já deixou a sua Vitrine Digital 100% pronta e aprovada. Como cortesia por terem sido selecionados, liberamos 30 dias de acesso VIP gratuito.\n\nVeja como ficou incrível: https://tafanu.com.br/site/${slug}\n\nPoderia clicar no link e me confirmar se o botão do seu WhatsApp está certinho?`;
    } else if (etapa === 2) {
      msg = `Fala, ${name}, tudo bem?\n\nPassando só para avisar que sua vitrine está no ar recebendo visitas! Você conseguiu acessar o seu painel de controle para ver os gráficos?\n\nSeu login é: ${email}\n(Basta clicar em "Esqueci minha senha" para criar sua senha segura).\n\nQualquer dúvida para acessar, me avisa!`;
    } else if (etapa === 3) {
      msg = `Olá, ${name}, bom dia!\n\nTrazendo boas notícias: acompanhando seu painel hoje, vi que a página da *${businessName}* já teve [X] visitas e [Y] cliques no seu WhatsApp nos últimos dias!\n\nO perfil está chamando muita atenção. Desejo excelentes vendas pra vocês essa semana! 🚀`;
    } else if (etapa === 4) {
      msg = `Olá, ${name}! Tudo bem?\n\nO seu período de cortesia VIP no Tafanu encerra nos próximos dias. Nesse período, sua vitrine gerou [X] visualizações para a *${businessName}*.\n\nPara não perdermos esse histórico e mantermos sua loja online recebendo clientes todos os dias, o investimento é de apenas R$ 39,90 por mês (sem fidelidade).\n\nPosso gerar o seu link seguro de renovação para mantermos a vitrine no ar?`;
    } else if (etapa === 5) {
      msg = `Olá, ${name}, como vai?\n\nComo seu período cortesia encerrou e não tivemos retorno, estou arquivando e pausando a vitrine da *${businessName}* no Tafanu hoje, tudo bem?\n\nSeus gráficos de performance ficarão salvos no banco de dados por mais 7 dias. Caso decidam reativar as buscas e voltar para a plataforma por R$ 39,90 mensais, é só me mandar uma mensagem por aqui.\n\nUm abraço e muito sucesso nos negócios!`;
    }

    return `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`;
  };

  // Filtra os leads que estão na etapa atual
  const leadsNaAba = leads.filter((l) => l.etapaFunil === activeTab);

  return (
    <div className="flex flex-col gap-6">
      {/* Menu de Abas */}
      <div className="flex overflow-x-auto gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 scrollbar-hide">
        {TABS.map((tab) => {
          // Verifica se existe algum lead NESTA aba que está em estado de alerta
          const temAlertaNaAba = leads.some((l) => {
            const dias = l.expiresAt
              ? Math.ceil(
                  (new Date(l.expiresAt).getTime() - new Date().getTime()) /
                    (1000 * 3600 * 24),
                )
              : 0;
            return l.etapaFunil === tab.id && dias <= tab.daysRule;
          });

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-sm font-bold transition-all relative ${
                activeTab === tab.id
                  ? "bg-[#0F172A] text-emerald-400 shadow-md"
                  : temAlertaNaAba
                    ? "bg-red-50 text-red-500 border border-red-200" // Fica vermelho se houver pendência
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              }`}
            >
              {tab.title}
              {temAlertaNaAba && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Lista de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {leadsNaAba.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
            Nenhum negócio nesta etapa do funil.
          </div>
        ) : (
          leadsNaAba.map((lead) => {
            const diasRestantes = lead.expiresAt
              ? Math.ceil(
                  (new Date(lead.expiresAt).getTime() - new Date().getTime()) /
                    (1000 * 3600 * 24),
                )
              : 0;

            const isAlerta = diasRestantes <= TABS[activeTab - 1].daysRule;

            return (
              <div
                key={lead.id}
                className={`bg-white p-5 rounded-2xl border-2 transition-all ${
                  isAlerta ? "border-red-400 shadow-sm" : "border-gray-100"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-[#0F172A] truncate max-w-[200px]">
                      {lead.name}
                    </h3>
                    <p className="text-xs text-gray-400">{lead.user?.email}</p>
                    {lead.user?.lastLogin && (
                      <div className="mt-2 inline-flex items-center gap-1 bg-blue-50 text-blue-500 px-2 py-1 rounded-lg text-[10px] font-black uppercase border border-blue-100">
                        <Clock size={12} />
                        Visto:{" "}
                        {new Date(lead.user.lastLogin).toLocaleDateString(
                          "pt-BR",
                        )}{" "}
                        às{" "}
                        {new Date(lead.user.lastLogin).toLocaleTimeString(
                          "pt-BR",
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg text-xs font-bold text-gray-500">
                    <Clock size={14} /> {diasRestantes} dias
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <a
                    href={getWhatsAppLink(lead, activeTab)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all"
                  >
                    <MessageCircle size={18} /> Enviar Mensagem
                  </a>

                  <div className="flex gap-2 mt-2">
                    {activeTab > 1 && (
                      <button
                        onClick={() => handleMover(lead.id, activeTab - 1)}
                        disabled={loadingId === lead.id}
                        className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold text-gray-400 hover:bg-gray-100 rounded-xl transition-all"
                      >
                        <RotateCcw size={14} /> Desfazer
                      </button>
                    )}

                    {activeTab < 5 && (
                      <button
                        onClick={() => handleMover(lead.id, activeTab + 1)}
                        disabled={loadingId === lead.id}
                        className="flex-[2] flex items-center justify-center gap-1 py-2 bg-[#0F172A] text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all"
                      >
                        <CheckCircle2 size={14} className="text-emerald-400" />{" "}
                        Marcar como OK
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
