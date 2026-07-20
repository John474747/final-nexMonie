"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  image?: string;
  volume?: number;
  marketCap?: number;
  id?: string;
}

const POLL_INTERVAL_MS = 10_000; // refresh every 10 seconds

// Seed data shown immediately before first fetch completes — no loading flash
const SEED_DATA: MarketItem[] = [
  { symbol: "BTC/USDT",  name: "Bitcoin",    price: 63926.60, change: -0.38, category: "Crypto" },
  { symbol: "ETH/USDT",  name: "Ethereum",   price: 1800.82,  change:  0.06, category: "Crypto" },
  { symbol: "USDT/USDT", name: "Tether",     price: 1.0,      change:  0.01, category: "Crypto" },
  { symbol: "BNB/USDT",  name: "BNB",        price: 590.00,   change: -0.55, category: "Crypto" },
  { symbol: "SOL/USDT",  name: "Solana",     price: 108.45,   change: -1.25, category: "Crypto" },
  { symbol: "XRP/USDT",  name: "XRP",        price: 0.50,     change:  0.80, category: "Crypto" },
  { symbol: "ADA/USDT",  name: "Cardano",    price: 0.44,     change:  1.10, category: "Crypto" },
  { symbol: "AVAX/USDT", name: "Avalanche",  price: 34.20,    change: -2.10, category: "Crypto" },
];

export default function MarketsFeed() {
  const [activeMarketTab, setActiveMarketTab] = useState("Hot");
  const [favoriteSymbols, setFavoriteSymbols] = useState<string[]>(["BTC/USDT", "ETH/USDT"]);
  const [marketData, setMarketData] = useState<MarketItem[]>(SEED_DATA);

  // Track previous prices so rows flash when a price ticks
  const prevPricesRef = useRef<Record<string, number>>({});
  const [flashMap, setFlashMap] = useState<Record<string, "up" | "down" | null>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchMarkets = useCallback(async () => {
    try {
      const res = await fetch("/api/markets", { cache: "no-store" });
      if (!res.ok) return;
      const data: MarketItem[] = await res.json();
      if (!Array.isArray(data) || data.length === 0) return;

      // Compute which symbols changed direction since last fetch
      const newFlash: Record<string, "up" | "down" | null> = {};
      data.forEach((item) => {
        const prev = prevPricesRef.current[item.symbol];
        if (prev !== undefined && prev !== item.price) {
          newFlash[item.symbol] = item.price > prev ? "up" : "down";
        }
        prevPricesRef.current[item.symbol] = item.price;
      });

      setMarketData(data);

      if (Object.keys(newFlash).length > 0) {
        setFlashMap(newFlash);
        // Clear flash after 800 ms
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setFlashMap({}), 800);
      }
    } catch {
      // Silently retain existing data if network fails
    }
  }, []);

  useEffect(() => {
    // Fetch immediately on mount
    fetchMarkets();

    // Then poll every 10 seconds
    const interval = setInterval(fetchMarkets, POLL_INTERVAL_MS);
    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fetchMarkets]);

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
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Markets</h3>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Live" />
          </div>
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
              {getFilteredData().map((row, idx) => {
                const flash = flashMap[row.symbol];
                return (
                  <tr key={row.symbol ?? idx} className="hover:bg-gray-50/50 transition-colors">
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
                    <td className="py-3 font-bold text-right tabular-nums">
                      <span
                        className={`transition-colors duration-300 ${
                          flash === "up"   ? "text-[#008D83]" :
                          flash === "down" ? "text-[#FF8882]" :
                                            "text-slate-800"
                        }`}
                      >
                        ${row.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: row.price < 1 ? 6 : 2 })}
                      </span>
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
