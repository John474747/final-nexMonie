import { NextResponse } from 'next/server';

// In-memory cache so we don't hammer CoinGecko on every client poll
let cache: { data: MarketItem[]; ts: number } | null = null;
const CACHE_TTL_MS = 15_000; // 15 seconds — CoinGecko free tier allows ~30 req/min

export interface MarketItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  category: 'Crypto' | 'Stocks';
  marketCap?: number;
  volume?: number;
  image?: string;
  id?: string;
}

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

function buildHeaders(): HeadersInit {
  const key = process.env.COINGECKO_API_KEY;
  return key
    ? { Accept: 'application/json', 'x-cg-demo-api-key': key }
    : { Accept: 'application/json' };
}

async function fetchMarkets(): Promise<MarketItem[]> {
  // Fetch top 100 coins by market cap
  const url = `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`;
  const res = await fetch(url, {
    headers: buildHeaders(),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);

  const coins: any[] = await res.json();

  return coins.map((coin) => ({
    id: coin.id,
    symbol: `${coin.symbol.toUpperCase()}/USDT`,
    name: coin.name,
    price: coin.current_price ?? 0,
    change: parseFloat((coin.price_change_percentage_24h ?? 0).toFixed(2)),
    category: 'Crypto' as const,
    marketCap: coin.market_cap,
    volume: coin.total_volume,
    image: coin.image,
  }));
}

export async function GET() {
  const now = Date.now();

  // Serve from cache if fresh
  if (cache && now - cache.ts < CACHE_TTL_MS) {
    return NextResponse.json(cache.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
        'X-Cache': 'HIT',
      },
    });
  }

  try {
    const data = await fetchMarkets();
    cache = { data, ts: now };

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
        'X-Cache': 'MISS',
      },
    });
  } catch (err: any) {
    console.error('[/api/markets] CoinGecko fetch failed:', err.message);

    // Return stale cache rather than an error — keeps the feed alive
    if (cache) {
      return NextResponse.json(cache.data, {
        headers: { 'X-Cache': 'STALE' },
      });
    }

    return NextResponse.json([], { status: 502 });
  }
}
