"use client";

import { useEffect } from "react";

export default function OrderCleanupScript({ orderId }: { orderId: string }) {
  useEffect(() => {
    // 🚀 HACKER FIX: Filtramos apenas o pedido finalizado e mantemos os outros na gaveta
    const stored = localStorage.getItem("tafanu_active_orders");
    if (stored) {
      try {
        const arr = JSON.parse(stored);
        const newArr = arr.filter((id: string) => id !== orderId);

        if (newArr.length === 0) {
          localStorage.removeItem("tafanu_active_orders");
        } else {
          localStorage.setItem("tafanu_active_orders", JSON.stringify(newArr));
        }
        // Dispara evento para a Navbar apagar a bolinha vermelha na hora!
        window.dispatchEvent(new Event("storage"));
      } catch (e) {}
    }
  }, [orderId]);

  return null;
}
