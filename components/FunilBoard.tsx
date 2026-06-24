"use client";

import { useState } from "react";
import { MessageCircle, CheckCircle2, RotateCcw, Clock } from "lucide-react";
import { moverEtapaFunil } from "@/app/dashboard/funil/actions";

// 🚀 ESTRATÉGIA DE 10 DIAS (Agressiva, mas com fôlego operacional)
const TABS = [
  { id: 1, title: "1. Entrega", daysRule: 10 }, // Manda no dia que criou
  { id: 2, title: "2. Checagem", daysRule: 8 }, // Manda 2 dias depois
  { id: 3, title: "3. Valor", daysRule: 4 }, // Manda no meio do caminho (Dia de pico de views)
  { id: 4, title: "4. Escassez", daysRule: 2 }, // Faltam 48h. Gatilho de perda.
  { id: 5, title: "5. Fechamento", daysRule: 0 }, // Fim da linha. Ou paga ou pausa.
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
    const phone = lead.user?.phone?.replace(/\D/g, "") || "";
    const name = lead.user?.name?.split(" ")[0] || "Responsável";
    const businessName = lead.name || "seu negócio";
    const email = lead.user?.email || "";
    const slug = lead.slug || "";

    let msg = "";

    // 🧠 COPYWRITING AVANÇADO: Efeito Posse, Reciprocidade, Prova Social e Urgência
    if (etapa === 1) {
      msg = `Olá, ${name}! Tudo bem? Aqui é o Fabiano, do portal Tafanu.\n\nNossa curadoria mapeou os melhores negócios de Guarulhos e selecionamos a *${businessName}* para o grupo de Membros Fundadores da plataforma.\n\nMinha equipe já deixou a sua Vitrine Digital 100% pronta de presente. Liberamos 10 dias de acesso VIP grátis pra você testar na prática.\n\nVeja como ficou estética premium da loja: https://tafanu.com.br/site/${slug}\n\nPoderia clicar e me confirmar se o botão do seu WhatsApp está certinho?`;
    } else if (etapa === 2) {
      msg = `Fala, ${name}! Passando pra avisar que sua vitrine já está rodando nas buscas.\n\nVocê conseguiu entrar no painel pra ver o gráfico de acessos?\n\nSeu login é: ${email}\n(Basta clicar em "Esqueci minha senha" para criar uma rapidinho).\n\nSe precisar de ajuda pra acessar, me dá um toque aqui!`;
    } else if (etapa === 3) {
      msg = `Bom dia, ${name}!\n\nFui olhar o relatório hoje e a página da *${businessName}* já teve [X] visitas e [Y] clientes clicaram no botão do seu WhatsApp!\n\nO perfil tá chamando atenção. Desejo excelentes vendas pra vocês essa semana! 🚀`;
    } else if (etapa === 4) {
      msg = `Olá, ${name}! O acesso VIP da *${businessName}* encerra em 48h.\n\nComo você é um Membro Fundador, se efetivarmos a assinatura hoje, sua mensalidade trava em R$ 39,90 pra sempre, imune a qualquer reajuste futuro da plataforma.\n\nPosso gerar o seu link de renovação para não perdermos o histórico de clientes que já estão chegando?`;
    } else if (etapa === 5) {
      msg = `Fala, ${name}. Como o acesso VIP expirou hoje, estou pausando e ocultando a vitrine da *${businessName}* das nossas buscas, tudo bem?\n\nSeus gráficos ficarão salvos por 7 dias. Caso decidam reativar as buscas e voltar para a plataforma pelos R$ 39,90 mensais, é só me mandar uma mensagem.\n\nUm abraço e muito sucesso aí!`;
    }

    return `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`;
  };

  const leadsNaAba = leads.filter((l) => l.etapaFunil === activeTab);

  return (
    <div className="flex flex-col gap-6">
      {/* Menu de Abas */}
      <div className="flex overflow-x-auto gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 scrollbar-hide">
        {TABS.map((tab) => {
          // O Alerta vermelho dispara quando o prazo residual da loja bate com o dia de mandar a mensagem!
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
              className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all relative ${
                activeTab === tab.id
                  ? "bg-[#0F172A] text-emerald-400 shadow-md"
                  : temAlertaNaAba
                    ? "bg-red-50 text-red-500 border border-red-200"
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
          <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl text-xs font-bold uppercase tracking-widest">
            Nenhum negócio aguardando contato nesta etapa.
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
                    <h3 className="font-bold text-[#0F172A] truncate max-w-[200px] uppercase">
                      {lead.name}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400">
                      {lead.user?.email}
                    </p>
                    {lead.user?.lastLogin && (
                      <div className="mt-2 inline-flex items-center gap-1 bg-blue-50 text-blue-500 px-2 py-1 rounded-lg text-[9px] font-black uppercase border border-blue-100">
                        <Clock size={12} />
                        Acessou:{" "}
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
                  <div
                    className={`flex flex-col items-center justify-center min-w-[50px] bg-gray-50 px-2 py-1 rounded-lg border ${isAlerta ? "border-red-200 bg-red-50 text-red-500" : "border-gray-100 text-gray-500"}`}
                  >
                    <span className="text-lg font-black leading-none">
                      {diasRestantes}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-widest">
                      Dias
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <a
                    href={getWhatsAppLink(lead, activeTab)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#1ebd57] transition-all shadow-md shadow-green-900/10"
                  >
                    <MessageCircle size={16} /> Zap{" "}
                    {TABS[activeTab - 1].title.split(". ")[1]}
                  </a>

                  <div className="flex gap-2 mt-2">
                    {activeTab > 1 && (
                      <button
                        onClick={() => handleMover(lead.id, activeTab - 1)}
                        disabled={loadingId === lead.id}
                        className="flex-1 flex items-center justify-center gap-1 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 rounded-xl transition-all border border-gray-100"
                      >
                        <RotateCcw size={12} /> Desfazer
                      </button>
                    )}

                    {activeTab < 5 && (
                      <button
                        onClick={() => handleMover(lead.id, activeTab + 1)}
                        disabled={loadingId === lead.id}
                        className="flex-[2] flex items-center justify-center gap-1.5 py-2 bg-[#0F172A] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all shadow-sm"
                      >
                        <CheckCircle2 size={14} className="text-emerald-400" />{" "}
                        Próxima Etapa
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
