import React from "react";
import { usePaperTrading } from "../../hooks/usePaperTrading";
import { useMarketData } from "../../hooks/useMarketData";

const TradingTabs: React.FC = () => {
  const { paperBalance, openPositions, placeOrder } = usePaperTrading() || {};
  const { markets } = useMarketData() || {};

  const safeMarkets = markets || [];
  const safePositions = openPositions || [];

  return (
    <div className="p-4 text-white">
      <h2>Paper Balance: ${paperBalance?.toFixed(2) || "0.00"}</h2>
      <h3>Markets:</h3>
      <ul>
        {safeMarkets.map((m: any) => (
          <li key={m.symbol}>{m.symbol} | {m.price?.toFixed(2) || "0.00"}</li>
        ))}
      </ul>
      <h3>Open Positions:</h3>
      <ul>
        {safePositions.map((pos: any, i: number) => (
          <li key={i}>
            {pos.symbol || "-"} | {pos.side || "-"} | {pos.entryPrice?.toFixed(2) || "0.00"} | {pos.currentPrice?.toFixed(2) || "0.00"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TradingTabs;
