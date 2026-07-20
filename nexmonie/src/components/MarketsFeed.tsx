"use client";

import React, { useState } from "react";
import { ChevronRight, Star, TrendingUp, TrendingDown } from "lucide-react";

// Brand Color Palette Mapping:
// Primary Teal-Green: #008D83
// Secondary Coral: #FF8882

interface MarketItem {
  symbol: string;
  name: string;
  price: number;
  change: number; // e.g. -0.38 or 1.12
  category: "Crypto" | "Stocks";
}

export default function MarketsFeed() {
  const [activeMarketTab, setActiveMarketTab] = useState("Hot");
  const [favoriteSymbols, setFavoriteSymbols] = useState<string[]>(["BTC/USDT", "ETH/USDT"]);

  const [marketData] = useState<MarketItem[]>([
    { symbol: "BTC/USDT", name: "Bitcoin", price: 63926.60, change: -0.38, category: "Crypto" },
    { symbol: "USDC/USDT", name: "USD Coin", price: 1.0005, change: -0.02, category: "Crypto" },
    { symbol: "ETH/USDT", name: "Ethereum", price: 1800.82, change: 0.06, category: "Crypto" },
    { symbol: "SOL/USDT", name: "Solana", price: 108.45, change: -1.25, category: "Crypto" },
    { symbol: "MNT/USDT", name: "Mantle", price: 0.4186, change: -2.29, category: "Crypto" },
    { symbol: "AAPL/USDT", name: "Apple Inc.", price: 189.45, change: 1.12, category: "Stocks" },
    { symbol: "TSLA/USDT", name: "Tesla Inc.", price: 175.20, change: -3.45, category: "Stocks" },
    { symbol: "NVDA/USDT", name: "NVIDIA Corp.", price: 875.12, change: 5.67, category: "Stocks" }
  ]);

  const toggleFavorite = (symbol: string) => {
    setFavoriteSymbols(prev => 
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
  };

  const getFilteredData = () => {
    switch(activeMarketTab) {
      case "Favorites":
        return marketData.filter(item => favoriteSymbols.includes(item.symbol));
      case "Hot":
        return marketData.filter(item => item.category === "Crypto" && Math.abs(item.change) > 0.01);
      case "Gainers":
        return [...marketData].sort((a, b) => b.change - a.change).filter(item => item.change > 0);
      case "Losers":
        return [...marketData].sort((a, b) => a.change - b.change).filter(item => item.change < 0);
      default:
        return marketData;
    }
  };

  return (
    <div className="px-4 sm:px-6 mb-10">
      <div className="bg-white rounded-[32px] p-5 sm:p-8 border border-gray-100 shadow-nex-soft w-full">
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Markets</h3>
          <span className="text-[10px] font-bold text-[#008D83] hover:underline cursor-pointer flex items-center gap-0.5">
            Market Overview <ChevronRight className="w-3 h-3" />
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-gray-50 pb-2 mb-3">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide max-w-[75%]">
            {["Favorites", "Hot", "Gainers", "Losers"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveMarketTab(tab)}
                className={`text-[11px] font-bold pb-2 transition-all whitespace-nowrap ${
                  activeMarketTab === tab 
                    ? "text-slate-900 border-b-2 border-[#008D83]" 
                    : "text-slate-400 border-b-2 border-transparent"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="bg-gray-50 border border-gray-100 text-[9px] font-bold text-slate-600 rounded-full px-3 py-1">
            Spot
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-gray-50">
                <th className="pb-2">Trading Pairs</th>
                <th className="pb-2 text-right">Price</th>
                <th className="pb-2 text-right">24H Change</th>
                <th className="pb-2 text-right">Trade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-[11px]">
              {getFilteredData().map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleFavorite(row.symbol)} className="text-slate-300">
                        <Star className={`w-3 h-3 ${favoriteSymbols.includes(row.symbol) ? "fill-amber-400 text-amber-400" : ""}`} />
                      </button>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 tabular-nums">{row.symbol}</span>
                          <span className={`text-[7px] font-black px-1 rounded uppercase ${row.category === "Crypto" ? "bg-teal-50 text-[#008D83]" : "bg-blue-50 text-blue-600"}`}>
                            {row.category}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400 block mt-0.5">{row.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 font-bold text-slate-800 text-right tabular-nums">
                    ${row.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 text-right font-extrabold">
                    <span className={`inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] tabular-nums ${row.change >= 0 ? "text-[#008D83] bg-emerald-50" : "text-[#FF8882] bg-rose-50"}`}>
                      {row.change >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                      {row.change >= 0 ? "+" : ""}{row.change}%
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button className="text-[11px] font-bold text-[#008D83] hover:underline">Trade</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
