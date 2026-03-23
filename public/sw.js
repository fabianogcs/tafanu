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
