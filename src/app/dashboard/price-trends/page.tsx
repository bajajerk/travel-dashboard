"use client";

import { useState, useMemo } from "react";

interface PricePoint {
  date: string;
  retail: number;
  preferred: number;
}

interface PropertyTrend {
  hotel_id: string;
  hotel_name: string;
  city: string;
  stars: number;
  category: "singles" | "couples" | "families";
  currency: string;
  prices: PricePoint[];
}

const MOCK_PRICE_TRENDS: PropertyTrend[] = [
  {
    hotel_id: "h-001",
    hotel_name: "The Ritz-Carlton",
    city: "Dubai",
    stars: 5,
    category: "couples",
    currency: "USD",
    prices: [
      { date: "2025-10-01", retail: 640, preferred: 490 },
      { date: "2025-11-01", retail: 610, preferred: 470 },
      { date: "2025-12-01", retail: 720, preferred: 545 },
      { date: "2026-01-01", retail: 780, preferred: 580 },
      { date: "2026-02-01", retail: 750, preferred: 560 },
      { date: "2026-03-01", retail: 690, preferred: 520 },
    ],
  },
  {
    hotel_id: "h-002",
    hotel_name: "Burj Al Arab",
    city: "Dubai",
    stars: 5,
    category: "singles",
    currency: "USD",
    prices: [
      { date: "2025-10-01", retail: 1250, preferred: 950 },
      { date: "2025-11-01", retail: 1180, preferred: 900 },
      { date: "2025-12-01", retail: 1400, preferred: 1050 },
      { date: "2026-01-01", retail: 1520, preferred: 1120 },
      { date: "2026-02-01", retail: 1450, preferred: 1080 },
      { date: "2026-03-01", retail: 1350, preferred: 1010 },
    ],
  },
  {
    hotel_id: "h-003",
    hotel_name: "Marina Bay Sands",
    city: "Singapore",
    stars: 5,
    category: "families",
    currency: "USD",
    prices: [
      { date: "2025-10-01", retail: 480, preferred: 380 },
      { date: "2025-11-01", retail: 510, preferred: 400 },
      { date: "2025-12-01", retail: 620, preferred: 475 },
      { date: "2026-01-01", retail: 580, preferred: 450 },
      { date: "2026-02-01", retail: 540, preferred: 420 },
      { date: "2026-03-01", retail: 500, preferred: 390 },
    ],
  },
  {
    hotel_id: "h-004",
    hotel_name: "Aman Tokyo",
    city: "Tokyo",
    stars: 5,
    category: "couples",
    currency: "USD",
    prices: [
      { date: "2025-10-01", retail: 700, preferred: 540 },
      { date: "2025-11-01", retail: 680, preferred: 525 },
      { date: "2025-12-01", retail: 750, preferred: 570 },
      { date: "2026-01-01", retail: 810, preferred: 610 },
      { date: "2026-02-01", retail: 770, preferred: 585 },
      { date: "2026-03-01", retail: 720, preferred: 550 },
    ],
  },
  {
    hotel_id: "h-005",
    hotel_name: "Taj Mahal Palace",
    city: "Mumbai",
    stars: 5,
    category: "families",
    currency: "USD",
    prices: [
      { date: "2025-10-01", retail: 320, preferred: 250 },
      { date: "2025-11-01", retail: 340, preferred: 260 },
      { date: "2025-12-01", retail: 410, preferred: 310 },
      { date: "2026-01-01", retail: 450, preferred: 335 },
      { date: "2026-02-01", retail: 420, preferred: 315 },
      { date: "2026-03-01", retail: 380, preferred: 290 },
    ],
  },
  {
    hotel_id: "h-006",
    hotel_name: "The Savoy",
    city: "London",
    stars: 5,
    category: "couples",
    currency: "USD",
    prices: [
      { date: "2025-10-01", retail: 550, preferred: 420 },
      { date: "2025-11-01", retail: 520, preferred: 400 },
      { date: "2025-12-01", retail: 680, preferred: 510 },
      { date: "2026-01-01", retail: 490, preferred: 380 },
      { date: "2026-02-01", retail: 530, preferred: 405 },
      { date: "2026-03-01", retail: 570, preferred: 435 },
    ],
  },
  {
    hotel_id: "h-007",
    hotel_name: "Four Seasons Bali",
    city: "Bali",
    stars: 5,
    category: "families",
    currency: "USD",
    prices: [
      { date: "2025-10-01", retail: 420, preferred: 330 },
      { date: "2025-11-01", retail: 450, preferred: 350 },
      { date: "2025-12-01", retail: 580, preferred: 440 },
      { date: "2026-01-01", retail: 550, preferred: 420 },
      { date: "2026-02-01", retail: 490, preferred: 375 },
      { date: "2026-03-01", retail: 460, preferred: 355 },
    ],
  },
  {
    hotel_id: "h-008",
    hotel_name: "Mandarin Oriental",
    city: "Bangkok",
    stars: 5,
    category: "singles",
    currency: "USD",
    prices: [
      { date: "2025-10-01", retail: 280, preferred: 220 },
      { date: "2025-11-01", retail: 290, preferred: 225 },
      { date: "2025-12-01", retail: 350, preferred: 265 },
      { date: "2026-01-01", retail: 370, preferred: 280 },
      { date: "2026-02-01", retail: 340, preferred: 260 },
      { date: "2026-03-01", retail: 310, preferred: 240 },
    ],
  },
];

function formatMonth(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function PriceChart({ prices, currency }: { prices: PricePoint[]; currency: string }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const chartW = 600;
  const chartH = 280;
  const padL = 60;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const allValues = prices.flatMap((p) => [p.retail, p.preferred]);
  const minVal = Math.floor(Math.min(...allValues) * 0.9);
  const maxVal = Math.ceil(Math.max(...allValues) * 1.05);
  const range = maxVal - minVal || 1;

  const toX = (i: number) => padL + (i / (prices.length - 1)) * plotW;
  const toY = (v: number) => padT + plotH - ((v - minVal) / range) * plotH;

  const retailPath = prices.map((p, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(p.retail)}`).join(" ");
  const preferredPath = prices.map((p, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(p.preferred)}`).join(" ");

  const savingsPath =
    prices.map((p, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(p.retail)}`).join(" ") +
    " " +
    [...prices].reverse().map((p, i) => `L${toX(prices.length - 1 - i)},${toY(p.preferred)}`).join(" ") +
    " Z";

  const gridLines = 5;
  const gridValues = Array.from({ length: gridLines }, (_, i) => minVal + (range / (gridLines - 1)) * i);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${chartW} ${chartH}`}
        className="w-full max-w-[600px] h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {gridValues.map((v, i) => (
          <g key={i}>
            <line x1={padL} y1={toY(v)} x2={chartW - padR} y2={toY(v)} stroke="#e2e8f0" strokeWidth={1} />
            <text x={padL - 8} y={toY(v) + 4} textAnchor="end" className="text-[10px] fill-slate-400">
              ${Math.round(v)}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {prices.map((p, i) => (
          <text
            key={i}
            x={toX(i)}
            y={chartH - 8}
            textAnchor="middle"
            className="text-[10px] fill-slate-400"
          >
            {formatMonth(p.date)}
          </text>
        ))}

        {/* Savings area fill */}
        <path d={savingsPath} fill="#e0e7ff" opacity={0.4} />

        {/* Retail line */}
        <path d={retailPath} fill="none" stroke="#6366f1" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Preferred line */}
        <path d={preferredPath} fill="none" stroke="#10b981" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {prices.map((p, i) => (
          <g key={i}>
            <circle cx={toX(i)} cy={toY(p.retail)} r={hoveredIdx === i ? 5 : 3.5} fill="#6366f1" className="transition-all" />
            <circle cx={toX(i)} cy={toY(p.preferred)} r={hoveredIdx === i ? 5 : 3.5} fill="#10b981" className="transition-all" />
            {/* Invisible hover target */}
            <rect
              x={toX(i) - plotW / prices.length / 2}
              y={padT}
              width={plotW / prices.length}
              height={plotH}
              fill="transparent"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          </g>
        ))}

        {/* Hover tooltip */}
        {hoveredIdx !== null && (
          <g>
            <line x1={toX(hoveredIdx)} y1={padT} x2={toX(hoveredIdx)} y2={padT + plotH} stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 2" />
            <rect x={toX(hoveredIdx) - 55} y={padT - 2} width={110} height={42} rx={6} fill="white" stroke="#e2e8f0" strokeWidth={1} />
            <text x={toX(hoveredIdx)} y={padT + 13} textAnchor="middle" className="text-[9px] fill-slate-500 font-medium">
              {formatMonth(prices[hoveredIdx].date)}
            </text>
            <text x={toX(hoveredIdx) - 2} y={padT + 25} textAnchor="middle" className="text-[9px] fill-indigo-600 font-medium">
              Retail: {currency}{prices[hoveredIdx].retail}
            </text>
            <text x={toX(hoveredIdx) - 2} y={padT + 36} textAnchor="middle" className="text-[9px] fill-emerald-600 font-medium">
              Preferred: {currency}{prices[hoveredIdx].preferred}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

export default function PriceTrendsPage() {
  const [selectedProperty, setSelectedProperty] = useState(MOCK_PRICE_TRENDS[0].hotel_id);
  const [cityFilter, setCityFilter] = useState("all");

  const cities = useMemo(() => {
    const set = new Set(MOCK_PRICE_TRENDS.map((t) => t.city));
    return Array.from(set).sort();
  }, []);

  const filteredProperties = useMemo(
    () => (cityFilter === "all" ? MOCK_PRICE_TRENDS : MOCK_PRICE_TRENDS.filter((t) => t.city === cityFilter)),
    [cityFilter],
  );

  const property = MOCK_PRICE_TRENDS.find((t) => t.hotel_id === selectedProperty) ?? MOCK_PRICE_TRENDS[0];

  const stats = useMemo(() => {
    const prices = property.prices;
    const latest = prices[prices.length - 1];
    const prev = prices[prices.length - 2];
    const avgRetail = Math.round(prices.reduce((s, p) => s + p.retail, 0) / prices.length);
    const avgPreferred = Math.round(prices.reduce((s, p) => s + p.preferred, 0) / prices.length);
    const avgSavings = Math.round(((avgRetail - avgPreferred) / avgRetail) * 100);
    const retailChange = prev ? ((latest.retail - prev.retail) / prev.retail) * 100 : 0;
    const highestRetail = Math.max(...prices.map((p) => p.retail));
    const lowestPreferred = Math.min(...prices.map((p) => p.preferred));
    return { latest, avgRetail, avgPreferred, avgSavings, retailChange, highestRetail, lowestPreferred };
  }, [property]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Price Trends</h2>
        <p className="text-sm text-slate-500 mt-1">Track retail vs preferred rate trends per property over time</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-xs">
          <label className="block text-xs font-medium text-slate-500 mb-1">City</label>
          <select
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
              const first =
                e.target.value === "all"
                  ? MOCK_PRICE_TRENDS[0]
                  : MOCK_PRICE_TRENDS.find((t) => t.city === e.target.value);
              if (first) setSelectedProperty(first.hotel_id);
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">All Cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 max-w-sm">
          <label className="block text-xs font-medium text-slate-500 mb-1">Property</label>
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {filteredProperties.map((t) => (
              <option key={t.hotel_id} value={t.hotel_id}>
                {t.hotel_name} — {t.city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 10v1" />
              </svg>
            </div>
            <span className="text-xs font-medium text-slate-500">Current Retail</span>
          </div>
          <p className="text-xl font-bold text-slate-900">${stats.latest.retail}<span className="text-xs font-normal text-slate-400">/night</span></p>
          <p className={`text-xs mt-1 ${stats.retailChange >= 0 ? "text-red-500" : "text-emerald-500"}`}>
            {stats.retailChange >= 0 ? "+" : ""}{stats.retailChange.toFixed(1)}% vs last month
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-slate-500">Current Preferred</span>
          </div>
          <p className="text-xl font-bold text-emerald-700">${stats.latest.preferred}<span className="text-xs font-normal text-slate-400">/night</span></p>
          <p className="text-xs text-emerald-500 mt-1">
            Save ${stats.latest.retail - stats.latest.preferred}/night
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-xs font-medium text-slate-500">Avg Savings</span>
          </div>
          <p className="text-xl font-bold text-amber-700">{stats.avgSavings}%</p>
          <p className="text-xs text-slate-400 mt-1">Over 6 months</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            </div>
            <span className="text-xs font-medium text-slate-500">Price Range</span>
          </div>
          <p className="text-xl font-bold text-violet-700">${stats.lowestPreferred}<span className="text-xs font-normal text-slate-400"> — </span>${stats.highestRetail}</p>
          <p className="text-xs text-slate-400 mt-1">Best preferred — peak retail</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{property.hotel_name}</h3>
            <p className="text-xs text-slate-500">{property.city} &middot; {"★".repeat(property.stars)} &middot; {property.category}</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-indigo-500 rounded inline-block" />
              Retail Rate
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-500 rounded inline-block" />
              Preferred Rate
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-indigo-100 rounded inline-block opacity-60" />
              Savings
            </span>
          </div>
        </div>
        <PriceChart prices={property.prices} currency="$" />
      </div>

      {/* Price data table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900">Monthly Price Data</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-6 py-3 font-medium text-slate-500">Month</th>
                <th className="px-6 py-3 font-medium text-slate-500 text-right">Retail Rate</th>
                <th className="px-6 py-3 font-medium text-slate-500 text-right">Preferred Rate</th>
                <th className="px-6 py-3 font-medium text-slate-500 text-right">Savings</th>
                <th className="px-6 py-3 font-medium text-slate-500 text-right">Savings %</th>
                <th className="px-6 py-3 font-medium text-slate-500 text-right">MoM Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {property.prices.map((p, i) => {
                const savings = p.retail - p.preferred;
                const savingsPct = ((savings / p.retail) * 100).toFixed(1);
                const prev = property.prices[i - 1];
                const mom = prev ? ((p.retail - prev.retail) / prev.retail) * 100 : 0;
                return (
                  <tr key={p.date} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-slate-700">{formatMonth(p.date)}</td>
                    <td className="px-6 py-3 text-right text-slate-700">${p.retail}</td>
                    <td className="px-6 py-3 text-right text-emerald-700 font-medium">${p.preferred}</td>
                    <td className="px-6 py-3 text-right text-indigo-700">${savings}</td>
                    <td className="px-6 py-3 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                        {savingsPct}%
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      {i === 0 ? (
                        <span className="text-slate-300">—</span>
                      ) : (
                        <span className={mom >= 0 ? "text-red-500" : "text-emerald-500"}>
                          {mom >= 0 ? "+" : ""}{mom.toFixed(1)}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Price data is indicative and based on sample rate snapshots. All rates in USD per night.
      </p>
    </div>
  );
}
