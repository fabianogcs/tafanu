"use client";

import { useEffect } from "react";

export default function OrderCleanupScript() {
  useEffect(() => {
    // 🚀 O pedido acabou! Apagamos o ticket do celular para sumir o botão da Navbar
    localStorage.removeItem("tafanu_active_order");
  }, []);

  return null;
}
