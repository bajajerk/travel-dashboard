"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getCities,
  getCityCuration,
  getMarkupSettings,
  City,
  Hotel,
  MarkupSetting,
} from "@/lib/api";

interface CityRateData {
  city: City;
  hotels: (Hotel & { category: string })[];
}

function getEffectiveMarkup(
  hotel: Hotel & { category: string },
  citySlug: string,
  settings: MarkupSetting[]
): number {
  // Hotel-level override takes precedence
  const hotelOverride = settings.find(
    (s) => s.scope === "hotel" && s.scope_key === hotel.hotel_id
  );
  if (hotelOverride) return hotelOverride.markup_pct;

  // City-level override
  const cityOverride = settings.find(
    (s) => s.scope === "city" && s.scope_key === citySlug
  );
  if (cityOverride) return cityOverride.markup_pct;

  // Global default
  const global = settings.find((s) => s.scope === "global");
  return global ? global.markup_pct : 25;
}

function formatRate(rate: number): string {
  return `$${rate.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const categoryLabels: Record<string, string> = {
  singles: "Singles",
  couples: "Couples",
  families: "Families",
};

const categoryColors: Record<string, string> = {
  singles: "bg-violet-100 text-violet-700",
  couples: "bg-pink-100 text-pink-700",
  families: "bg-sky-100 text-sky-700",
};

export default function PreferredRatesPage() {
  const [cityData, setCityData] = useState<CityRateData[]>([]);
  const [markupSettings, setMarkupSettings] = useState<MarkupSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedCity, setExpandedCity] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const citiesRes = await getCities();
      const cities = citiesRes.cities || [];

      // Fetch markup settings (may fail if backend not ready)
      let settings: MarkupSetting[] = [];
      try {
        const settingsRes = await getMarkupSettings();
        settings = settingsRes.settings || [];
      } catch {
        // Markup API may not be available yet — use defaults
      }
      setMarkupSettings(settings);

      // Fetch curations for all cities in parallel
      const curationResults = await Promise.allSettled(
        cities.map((c) => getCityCuration(c.slug))
      );

      const data: CityRateData[] = [];
      curationResults.forEach((result, idx) => {
        if (result.status === "fulfilled") {
          const curation = result.value;
          const hotels: (Hotel & { category: string })[] = [];
          (["singles", "couples", "families"] as const).forEach((cat) => {
            const catHotels = curation[cat] || [];
            catHotels.forEach((h) => hotels.push({ ...h, category: cat }));
          });
          if (hotels.length > 0) {
            data.push({ city: cities[idx], hotels });
          }
        }
      });

      setCityData(data);
      if (data.length > 0) {
        setExpandedCity(data[0].city.slug);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Compute summary stats
  const totalHotels = cityData.reduce((sum, cd) => sum + cd.hotels.length, 0);
  const hotelsWithRates = cityData.flatMap((cd) =>
    cd.hotels.filter((h) => h.rate && h.rate > 0)
  );
  const avgBaseRate =
    hotelsWithRates.length > 0
      ? hotelsWithRates.reduce((s, h) => s + (h.rate || 0), 0) / hotelsWithRates.length
      : 0;
  const avgPreferredRate =
    hotelsWithRates.length > 0
      ? hotelsWithRates.reduce((s, h) => {
          const markup = getEffectiveMarkup(
            h as Hotel & { category: string },
            cityData.find((cd) => cd.hotels.includes(h as Hotel & { category: string }))?.city.slug || "",
            markupSettings
          );
          return s + (h.rate || 0) * (1 - markup / 100);
        }, 0) / hotelsWithRates.length
      : 0;
  const avgSavingsPct =
    avgBaseRate > 0 ? ((avgBaseRate - avgPreferredRate) / avgBaseRate) * 100 : 0;

  // Filter hotels by search + category
  function getFilteredHotels(cd: CityRateData) {
    return cd.hotels.filter((h) => {
      const matchesCategory = filterCategory === "all" || h.category === filterCategory;
      const matchesSearch =
        !searchQuery ||
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (h.address && h.address.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Preferred Rates Overview</h2>
        <p className="text-slate-500 mt-1">
          View curated hotel rates across all cities with markup applied.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
      )}

      {loading ? (
        <div>
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                <div className="h-3 bg-slate-200 rounded w-20 mb-3" />
                <div className="h-7 bg-slate-200 rounded w-16" />
              </div>
            ))}
          </div>
          {/* Table skeleton */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
            <div className="h-5 bg-slate-200 rounded w-40 mb-4" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded mb-2" />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500">Cities</span>
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{cityData.length}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500">Hotels with Rates</span>
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {hotelsWithRates.length}
                <span className="text-sm font-normal text-slate-400 ml-1">/ {totalHotels}</span>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500">Avg Base Rate</span>
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {avgBaseRate > 0 ? formatRate(avgBaseRate) : "—"}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500">Avg Savings</span>
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-emerald-600">
                {avgSavingsPct > 0 ? `${avgSavingsPct.toFixed(1)}%` : "—"}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search hotels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="all">All categories</option>
              <option value="singles">Singles</option>
              <option value="couples">Couples</option>
              <option value="families">Families</option>
            </select>
          </div>

          {/* City accordion */}
          {cityData.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm">No curated hotels found. Add hotels to cities first.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cityData.map((cd) => {
                const filtered = getFilteredHotels(cd);
                if (filtered.length === 0 && (searchQuery || filterCategory !== "all")) return null;
                const isExpanded = expandedCity === cd.city.slug;
                const cityHotelsWithRates = cd.hotels.filter((h) => h.rate && h.rate > 0);
                const cityAvgRate =
                  cityHotelsWithRates.length > 0
                    ? cityHotelsWithRates.reduce((s, h) => s + (h.rate || 0), 0) / cityHotelsWithRates.length
                    : 0;

                return (
                  <div key={cd.city.slug} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    {/* City header */}
                    <button
                      onClick={() => setExpandedCity(isExpanded ? null : cd.city.slug)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {cd.city.name}
                            <span className="text-slate-400 font-normal ml-2 text-sm">{cd.city.country}</span>
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span>{cd.hotels.length} hotels</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span>Avg rate: {cityAvgRate > 0 ? formatRate(cityAvgRate) : "—"}</span>
                          </div>
                        </div>
                      </div>
                      <svg
                        className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Hotel table */}
                    {isExpanded && (
                      <div className="border-t border-slate-200">
                        {filtered.length === 0 ? (
                          <div className="p-6 text-center text-sm text-slate-400">
                            No matching hotels in this city.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-slate-50 text-left">
                                  <th className="px-5 py-3 font-medium text-slate-500">Hotel</th>
                                  <th className="px-5 py-3 font-medium text-slate-500">Category</th>
                                  <th className="px-5 py-3 font-medium text-slate-500">Stars</th>
                                  <th className="px-5 py-3 font-medium text-slate-500 text-right">Base Rate</th>
                                  <th className="px-5 py-3 font-medium text-slate-500 text-right">Markup</th>
                                  <th className="px-5 py-3 font-medium text-slate-500 text-right">Preferred Rate</th>
                                  <th className="px-5 py-3 font-medium text-slate-500 text-right">Savings</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {filtered.map((hotel) => {
                                  const markup = getEffectiveMarkup(hotel, cd.city.slug, markupSettings);
                                  const baseRate = hotel.rate || 0;
                                  const preferredRate = baseRate > 0 ? baseRate * (1 - markup / 100) : 0;
                                  const savings = baseRate - preferredRate;

                                  return (
                                    <tr key={`${hotel.hotel_id}-${hotel.category}`} className="hover:bg-slate-50 transition-colors">
                                      <td className="px-5 py-3">
                                        <div className="font-medium text-slate-900">{hotel.name}</div>
                                        {hotel.address && (
                                          <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[250px]">
                                            {hotel.address}
                                          </div>
                                        )}
                                      </td>
                                      <td className="px-5 py-3">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[hotel.category] || "bg-slate-100 text-slate-600"}`}>
                                          {categoryLabels[hotel.category] || hotel.category}
                                        </span>
                                      </td>
                                      <td className="px-5 py-3">
                                        {hotel.stars ? (
                                          <div className="flex items-center gap-0.5">
                                            {Array.from({ length: hotel.stars }).map((_, i) => (
                                              <svg key={i} className="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                              </svg>
                                            ))}
                                          </div>
                                        ) : (
                                          <span className="text-slate-300">—</span>
                                        )}
                                      </td>
                                      <td className="px-5 py-3 text-right font-mono text-slate-700">
                                        {baseRate > 0 ? formatRate(baseRate) : "—"}
                                      </td>
                                      <td className="px-5 py-3 text-right">
                                        <span className="text-xs font-medium text-slate-500">{markup}%</span>
                                      </td>
                                      <td className="px-5 py-3 text-right font-mono font-semibold text-indigo-600">
                                        {preferredRate > 0 ? formatRate(preferredRate) : "—"}
                                      </td>
                                      <td className="px-5 py-3 text-right">
                                        {savings > 0 ? (
                                          <span className="text-xs font-medium text-emerald-600">
                                            -{formatRate(savings)}
                                          </span>
                                        ) : (
                                          <span className="text-slate-300">—</span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
