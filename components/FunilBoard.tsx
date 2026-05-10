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
    // Puxa exatamente o telefone e o nome do dono cadastrados no ProfileForm
    const phone = lead.user?.phone?.replace(/\D/g, "") || "";
    const name = lead.user?.name?.split(" ")[0] || "Responsável";
    const businessName = lead.name || "seu negócio";
    const email = lead.user?.email || "";
    const slug = lead.slug || "";

    let msg = "";

    if (etapa === 1) {
      msg = `Olá, ${name}. Tudo bem? Aqui é do Tafanu, a nova plataforma de buscas exclusivas da nossa região.\n\nMapeamos os negócios de maior destaque e selecionamos a *${businessName}* como um dos nossos Perfis Fundadores.\n\nPara facilitar, nossa equipe já estruturou uma vitrine premium com as melhores informações do seu perfil. Como cortesia, ela rodará gratuitamente por 30 dias para você testar na prática.\n\nVeja como ficou o resultado: https://tafanu.com.br/site/${slug}\n\n*Seu acesso exclusivo ao painel (para acompanhar visitas e cliques em tempo real):*\nE-mail: ${email}\nSenha: mudar123\n\nPoderia apenas clicar no link e me confirmar se os dados de endereço e contato estão corretos?`;
    } else if (etapa === 2) {
      msg = `Olá, ${name}, tudo bem? Passando rapidamente para confirmar se você conseguiu acessar o painel com o login provisório que enviamos.\n\nJá notamos movimentação de clientes buscando negócios na sua área, e queremos garantir que está tudo certo com seu perfil. Qualquer dúvida sobre o acesso, estou à disposição!`;
    } else if (etapa === 3) {
      msg = `Olá, ${name}, bom dia! Compartilhando uma ótima atualização com você.\n\nAcompanhando nosso sistema hoje, notamos que a página da *${businessName}* já recebeu X visitas de moradores da região e Y cliques diretos para o seu WhatsApp nesta primeira quinzena.\n\nO perfil está performando muito bem! Seguimos à disposição e desejamos excelentes vendas.`;
    } else if (etapa === 4) {
      msg = `Olá, ${name}! Tudo bem?\n\nO período de cortesia do seu Perfil Fundador encerra na próxima semana. Até o momento, vocês já acumularam [X Favoritos] e [Y Visitas].\n\nPara mantermos esse histórico ativo e a vitrine recebendo clientes diariamente, a manutenção é de apenas R$ 39,90 mensais. Gostaria que eu gerasse o link seguro de assinatura para você assumir a titularidade definitiva da página?`;
    } else if (etapa === 5) {
      msg = `Olá, ${name}, tudo bem? Como não tivemos retorno, informo que estamos pausando a vitrine da *${businessName}* no Tafanu hoje.\n\nSeus dados de performance (visitas e favoritos) permanecerão salvos em nosso sistema por mais 7 dias. Caso decidam reativar o perfil e voltar a aparecer nas buscas regionais por R$ 39,90 mensais, basta me avisar por aqui e reativamos imediatamente.\n\nUm abraço e muito sucesso nos negócios!`;
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
