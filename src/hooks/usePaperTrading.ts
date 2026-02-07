import { useState } from "react";

export const usePaperTrading = () => {
  const [paperBalance, setPaperBalance] = useState(10000);
  const [openPositions, setOpenPositions] = useState<any[]>([]);

  const placeOrder = (order: any) => {
    setOpenPositions((prev) => [...prev, order]);
    if (order.size) setPaperBalance((prev) => prev - order.size);
  };

  return { paperBalance, openPositions, placeOrder };
};
