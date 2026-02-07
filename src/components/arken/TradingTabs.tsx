import React, { useState, useEffect } from "react";
import { usePaperTrading } from "../../hooks/usePaperTrading";
import { useMarketData } from "../../hooks/useMarketData";

interface Market {
  symbol: string;
  price: number;
  change24h: number;
}

interface Position {
  symbol: string;
  side: string;
  entryPrice: number;
  currentPrice: number;
  size: number;
  leverage: number;
  unrealizedPnl: number;
  timestamp: number;
}

const TradingTabs: React.FC = () => {
  const { paperBalance, openPositions, placeOrder } = usePaperTrading();
  const { markets } = useMarketData();

  const safeMarkets: Market[] = markets || [];
  const safePositions: Position[] = openPositions || [];

  const [selectedMarket, setSelectedMarket] = useState<string>(
    safeMarkets?.[0]?.symbol || "BTC-PERP"
  );
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [size, setSize] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [leverage, setLeverage] = useState<number>(1);

  useEffect(() => {
    if (!selectedMarket && safeMarkets.length > 0) {
      setSelectedMarket(safeMarkets[0].symbol);
    }
  }, [safeMarkets, selectedMarket]);

  const handlePlaceOrder = (side: "long" | "short") => {
    if (!selectedMarket || size <= 0) return;
    placeOrder({
      symbol: selectedMarket,
      type: orderType,
      size,
      price: orderType === "limit" ? price : undefined,
      leverage,
      side,
      timestamp: Date.now(), // ensures timestamp exists
    });
    setSize(0);
    setPrice(0);
  };

  return (
    <div className="flex flex-col gap-4 p-4 text-white">
      {/* Market Selector */}
      <div className="flex items-center gap-2">
        <select
          value={selectedMarket}
          onChange={(e) => setSelectedMarket(e.target.value)}
          className="bg-gray-800 text-white p-2 rounded"
        >
          {safeMarkets.map((m) => (
            <option key={m.symbol} value={m.symbol}>
              {m.symbol} | {m.price?.toFixed(2) || "0.00"}
            </option>
          ))}
        </select>
        <span className="text-gray-400">
          {safeMarkets.find((m) => m.symbol === selectedMarket)?.change24h?.toFixed(2) || "0.00"}%
        </span>
      </div>

      {/* Order Panel */}
      <div className="flex flex-col md:flex-row gap-2">
        <select
          value={orderType}
          onChange={(e) => setOrderType(e.target.value as "market" | "limit")}
          className="bg-gray-800 text-white p-2 rounded"
        >
          <option value="market">Market</option>
          <option value="limit">Limit</option>
        </select>

        {orderType === "limit" && (
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="bg-gray-800 text-white p-2 rounded"
          />
        )}

        <input
          type="number"
          placeholder="Size"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="bg-gray-800 text-white p-2 rounded"
        />

        <input
          type="number"
          placeholder="Leverage"
          value={leverage}
          onChange={(e) => setLeverage(Number(e.target.value))}
          className="bg-gray-800 text-white p-2 rounded"
          min={1}
          max={40}
        />

        <button
          onClick={() => handlePlaceOrder("long")}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Long
        </button>

        <button
          onClick={() => handlePlaceOrder("short")}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Short
        </button>
      </div>

      {/* Paper Trading Balance & Positions */}
      <div className="mt-4">
        <h2 className="text-lg">Paper Balance: ${paperBalance?.toFixed(2) || "0.00"}</h2>

        <h3 className="mt-2">Open Positions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr>
                <th className="px-2 py-1">Market</th>
                <th className="px-2 py-1">Side</th>
                <th className="px-2 py-1">Entry</th>
                <th className="px-2 py-1">Price</th>
                <th className="px-2 py-1">Size</th>
                <th className="px-2 py-1">Leverage</th>
                <th className="px-2 py-1">PnL</th>
                <th className="px-2 py-1">Time</th>
              </tr>
            </thead>
            <tbody>
              {safePositions.map((pos, i) => (
                <tr key={i} className="odd:bg-gray-900 even:bg-gray-800">
                  <td className="px-2 py-1">{pos.symbol || "-"}</td>
                  <td className="px-2 py-1">{pos.side || "-"}</td>
                  <td className="px-2 py-1">{pos.entryPrice?.toFixed(2) || "0.00"}</td>
                  <td className="px-2 py-1">{pos.currentPrice?.toFixed(2) || "0.00"}</td>
                  <td className="px-2 py-1">{pos.size || 0}</td>
                  <td className="px-2 py-1">{pos.leverage || 1}x</td>
                  <td className="px-2 py-1">{pos.unrealizedPnl?.toFixed(2) || "0.00"}</td>
                  <td className="px-2 py-1">
                    {pos.timestamp ? new Date(pos.timestamp).toLocaleString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Trading Placeholder */}
      <div className="mt-4 text-gray-400">
        <p>Live Trading: Coming Soon! Join the waitlist in Connect Wallet.</p>
      </div>
    </div>
  );
};

export default TradingTabs;
