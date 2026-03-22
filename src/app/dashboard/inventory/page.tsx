"use client";

import { useEffect, useState, useMemo } from "react";
import { getCities, getCityCuration, City, Hotel } from "@/lib/api";
import { useToast } from "@/lib/toast";

interface InventoryHotel extends Hotel {
  city_name: string;
  city_slug: string;
  category: string;
  availability: "available" | "limited" | "sold_out";
  total_rooms: number;
  available_rooms: number;
  last_updated: string;
}

// Mock availability data — replace with API call once backend is ready
function generateMockAvailability(hotel: Hotel, cityName: string, citySlug: string, category: string, index: number): InventoryHotel {
  const totalRooms = 20 + ((hotel.name.length * 7 + index * 13) % 180);
  const occupancyRate = 0.3 + ((hotel.name.length * 3 + index * 7) % 60) / 100;
  const availableRooms = Math.max(0, Math.floor(totalRooms * (1 - occupancyRate)));
  const availability: InventoryHotel["availability"] =
    availableRooms === 0 ? "sold_out" : availableRooms <= totalRooms * 0.15 ? "limited" : "available";

  const daysAgo = (index * 3 + hotel.name.length) % 7;
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  return {
    ...hotel,
    city_name: cityName,
    city_slug: citySlug,
    category,
    availability,
    total_rooms: totalRooms,
    available_rooms: availableRooms,
    last_updated: date.toISOString(),
  };
}

const AVAILABILITY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  available: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Available" },
  limited: { bg: "bg-amber-50", text: "text-amber-700", label: "Limited" },
  sold_out: { bg: "bg-red-50", text: "text-red-700", label: "Sold Out" },
};

type SortKey = "name" | "city_name" | "total_rooms" | "available_rooms" | "availability" | "category";
type SortDir = "asc" | "desc";

export default function InventoryPage() {
  const { toast } = useToast();
  const [hotels, setHotels] = useState<InventoryHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Detail modal
  const [selectedHotel, setSelectedHotel] = useState<InventoryHotel | null>(null);

  // Edit availability modal
  const [editHotel, setEditHotel] = useState<InventoryHotel | null>(null);
  const [editRooms, setEditRooms] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const citiesData = await getCities();
        const cities = citiesData.cities || [];

        const allHotels: InventoryHotel[] = [];
        let idx = 0;

        for (const city of cities) {
          try {
            const curation = await getCityCuration(city.slug);
            for (const cat of ["singles", "couples", "families"] as const) {
              for (const hotel of curation[cat] || []) {
                allHotels.push(generateMockAvailability(hotel, city.name, city.slug, cat, idx++));
              }
            }
          } catch {
            // Skip cities that fail to load
          }
        }

        setHotels(allHotels);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load inventory");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const cities = useMemo(() => {
    const unique = new Map<string, string>();
    hotels.forEach((h) => unique.set(h.city_slug, h.city_name));
    return Array.from(unique.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [hotels]);

  const stats = useMemo(() => {
    const totalProperties = hotels.length;
    const totalRooms = hotels.reduce((s, h) => s + h.total_rooms, 0);
    const totalAvailable = hotels.reduce((s, h) => s + h.available_rooms, 0);
    const soldOut = hotels.filter((h) => h.availability === "sold_out").length;
    const limited = hotels.filter((h) => h.availability === "limited").length;
    const avgOccupancy = totalRooms > 0 ? ((totalRooms - totalAvailable) / totalRooms) * 100 : 0;
    return { totalProperties, totalRooms, totalAvailable, soldOut, limited, avgOccupancy };
  }, [hotels]);

  const filtered = useMemo(() => {
    let list = [...hotels];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.city_name.toLowerCase().includes(q) ||
          (h.hotel_id && h.hotel_id.toLowerCase().includes(q))
      );
    }
    if (cityFilter) list = list.filter((h) => h.city_slug === cityFilter);
    if (availabilityFilter) list = list.filter((h) => h.availability === availabilityFilter);
    if (categoryFilter) list = list.filter((h) => h.category === categoryFilter);

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "city_name":
          cmp = a.city_name.localeCompare(b.city_name);
          break;
        case "total_rooms":
          cmp = a.total_rooms - b.total_rooms;
          break;
        case "available_rooms":
          cmp = a.available_rooms - b.available_rooms;
          break;
        case "availability": {
          const order = { sold_out: 0, limited: 1, available: 2 };
          cmp = order[a.availability] - order[b.availability];
          break;
        }
        case "category":
          cmp = a.category.localeCompare(b.category);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [hotels, search, cityFilter, availabilityFilter, categoryFilter, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function openEdit(hotel: InventoryHotel) {
    setEditHotel(hotel);
    setEditRooms(hotel.available_rooms);
  }

  function handleSaveAvailability() {
    if (!editHotel) return;
    const newRooms = Math.max(0, Math.min(editRooms, editHotel.total_rooms));
    const newAvailability: InventoryHotel["availability"] =
      newRooms === 0 ? "sold_out" : newRooms <= editHotel.total_rooms * 0.15 ? "limited" : "available";

    setHotels((prev) =>
      prev.map((h) =>
        h.hotel_id === editHotel.hotel_id && h.category === editHotel.category
          ? { ...h, available_rooms: newRooms, availability: newAvailability, last_updated: new Date().toISOString() }
          : h
      )
    );
    toast("Availability updated successfully");
    setEditHotel(null);
  }

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column)
      return (
        <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    return sortDir === "asc" ? (
      <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function occupancyPercent(h: InventoryHotel) {
    return h.total_rooms > 0 ? Math.round(((h.total_rooms - h.available_rooms) / h.total_rooms) * 100) : 0;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Hotel Inventory & Availability</h2>
          <p className="text-slate-500 mt-1">Monitor room inventory and manage availability across all properties.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
      )}

      {/* Stats Cards */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Properties</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalProperties}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Rooms</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalRooms.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Available</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.totalAvailable.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Occupancy</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.avgOccupancy.toFixed(1)}%</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Limited</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.limited}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sold Out</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.soldOut}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hotels..."
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
          >
            <option value="">All Cities</option>
            {cities.map(([slug, name]) => (
              <option key={slug} value={slug}>{name}</option>
            ))}
          </select>
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
          >
            <option value="">All Availability</option>
            <option value="available">Available</option>
            <option value="limited">Limited</option>
            <option value="sold_out">Sold Out</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
          >
            <option value="">All Categories</option>
            <option value="singles">Singles</option>
            <option value="couples">Couples</option>
            <option value="families">Families</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
            <p className="text-slate-500 mt-3 text-sm">Loading inventory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-slate-500 font-medium">No hotels found</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th
                    className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-1">Hotel <SortIcon column="name" /></div>
                  </th>
                  <th
                    className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort("city_name")}
                  >
                    <div className="flex items-center gap-1">City <SortIcon column="city_name" /></div>
                  </th>
                  <th
                    className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort("category")}
                  >
                    <div className="flex items-center gap-1">Category <SortIcon column="category" /></div>
                  </th>
                  <th
                    className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort("total_rooms")}
                  >
                    <div className="flex items-center gap-1">Total Rooms <SortIcon column="total_rooms" /></div>
                  </th>
                  <th
                    className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort("available_rooms")}
                  >
                    <div className="flex items-center gap-1">Available <SortIcon column="available_rooms" /></div>
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                    Occupancy
                  </th>
                  <th
                    className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort("availability")}
                  >
                    <div className="flex items-center gap-1">Status <SortIcon column="availability" /></div>
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((hotel) => {
                  const occ = occupancyPercent(hotel);
                  const style = AVAILABILITY_STYLES[hotel.availability];
                  return (
                    <tr key={`${hotel.hotel_id}-${hotel.category}`} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{hotel.name}</p>
                          {hotel.stars && (
                            <div className="flex items-center gap-0.5 mt-0.5">
                              {Array.from({ length: hotel.stars }).map((_, i) => (
                                <svg key={i} className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{hotel.city_name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                          {hotel.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium">{hotel.total_rooms}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium">{hotel.available_rooms}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                occ >= 90 ? "bg-red-500" : occ >= 70 ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                              style={{ width: `${occ}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-600 font-medium w-8">{occ}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedHotel(hotel)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Details
                          </button>
                          <button
                            onClick={() => openEdit(hotel)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
            Showing {filtered.length} of {hotels.length} properties
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedHotel(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedHotel.name}</h3>
                <p className="text-sm text-slate-500">{selectedHotel.city_name}</p>
              </div>
              <button onClick={() => setSelectedHotel(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 font-medium">Hotel ID</p>
                  <p className="text-sm text-slate-900 font-mono mt-0.5">{selectedHotel.hotel_id}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 font-medium">Category</p>
                  <p className="text-sm text-slate-900 capitalize mt-0.5">{selectedHotel.category}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 font-medium">Stars</p>
                  <p className="text-sm text-slate-900 mt-0.5">{selectedHotel.stars || "N/A"}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 font-medium">Rating</p>
                  <p className="text-sm text-slate-900 mt-0.5">{selectedHotel.rating ? `${selectedHotel.rating}/10` : "N/A"}</p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Room Availability</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center bg-slate-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-slate-900">{selectedHotel.total_rooms}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Total Rooms</p>
                  </div>
                  <div className="text-center bg-emerald-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-emerald-600">{selectedHotel.available_rooms}</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Available</p>
                  </div>
                  <div className="text-center bg-indigo-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-indigo-600">{occupancyPercent(selectedHotel)}%</p>
                    <p className="text-xs text-indigo-600 mt-0.5">Occupancy</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Status</p>
                    {(() => {
                      const s = AVAILABILITY_STYLES[selectedHotel.availability];
                      return (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text} mt-1`}>
                          {s.label}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-medium">Last Updated</p>
                    <p className="text-sm text-slate-900 mt-0.5">{formatDate(selectedHotel.last_updated)}</p>
                  </div>
                </div>
              </div>

              {selectedHotel.rate && (
                <div className="border-t border-slate-200 pt-4">
                  <p className="text-xs text-slate-500 font-medium">Nightly Rate</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">${selectedHotel.rate.toLocaleString()}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
              <button
                onClick={() => setSelectedHotel(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedHotel(null);
                  openEdit(selectedHotel);
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Edit Availability
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Availability Modal */}
      {editHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setEditHotel(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Edit Availability</h3>
            <p className="text-sm text-slate-500 mb-4">{editHotel.name}</p>

            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Rooms</span>
                  <span className="font-medium text-slate-900">{editHotel.total_rooms}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Available Rooms</label>
                <input
                  type="number"
                  value={editRooms}
                  onChange={(e) => setEditRooms(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  min={0}
                  max={editHotel.total_rooms}
                />
                <p className="text-xs text-slate-400 mt-1">
                  Occupancy: {editHotel.total_rooms > 0 ? Math.round(((editHotel.total_rooms - Math.max(0, Math.min(editRooms, editHotel.total_rooms))) / editHotel.total_rooms) * 100) : 0}%
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditHotel(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAvailability}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
