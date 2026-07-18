// public/sw.js

// 1. Instalação: O navegador reconhece que o arquivo existe
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Instalado com sucesso!");
  self.skipWaiting(); // Força a ativação imediata
});

// 2. Ativação: O Service Worker assume o controle
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Ativado e pronto para operar!");
  event.waitUntil(clients.claim());
});
// 3. Interceptação de Rede (Exigência da Google Play Store)
self.addEventListener("fetch", (event) => {
  // Apenas rotas de navegação (HTML)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Retorna uma página de fallback offline estática se a internet cair
        return new Response(
          '<html><body style="background:#0a1425;color:white;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center;padding:20px;"><div><h1>Sem Conexão</h1><p>Verifique sua internet e tente novamente.</p></div></body></html>',
          { headers: { "Content-Type": "text/html" } },
        );
      }),
    );
  }
});
