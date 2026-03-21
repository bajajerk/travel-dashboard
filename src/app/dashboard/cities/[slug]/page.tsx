"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getCityCuration,
  addHotelToCuration,
  removeHotelFromCuration,
  reorderCurationHotels,
  searchHotels,
  Hotel,
  CurationDetail,
} from "@/lib/api";
import { useToast } from "@/lib/toast";

type Category = "singles" | "couples" | "families";

const TABS: { key: Category; label: string; icon: string }[] = [
  { key: "singles", label: "Singles", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { key: "couples", label: "Couples", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
  { key: "families", label: "Families", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
];

export default function CityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { toast } = useToast();

  const [data, setData] = useState<CurationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Category>("singles");

  // Search modal
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Hotel[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  // Remove confirmation
  const [removeTarget, setRemoveTarget] = useState<Hotel | null>(null);
  const [removing, setRemoving] = useState(false);

  // Reorder state
  const [reordering, setReordering] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const result = await getCityCuration(slug);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load city");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const result = await searchHotels(searchQuery);
      setSearchResults(result.hotels || []);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Search failed", "error");
    } finally {
      setSearching(false);
    }
  }

  async function handleAddHotel(hotel: Hotel) {
    setAdding(hotel.hotel_id);
    try {
      const hotels = data ? data[activeTab] : [];
      await addHotelToCuration(slug, {
        hotel_id: hotel.hotel_id,
        category: activeTab,
        order: hotels.length + 1,
      });
      toast(`${hotel.name} added to ${activeTab}`);
      setShowSearch(false);
      setSearchQuery("");
      setSearchResults([]);
      setLoading(true);
      await fetchData();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to add hotel", "error");
    } finally {
      setAdding(null);
    }
  }

  async function handleRemoveHotel() {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await removeHotelFromCuration(slug, removeTarget.hotel_id, activeTab);
      toast(`${removeTarget.name} removed`);
      setRemoveTarget(null);
      setLoading(true);
      await fetchData();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to remove hotel", "error");
    } finally {
      setRemoving(false);
    }
  }

  async function handleReorder(index: number, direction: "up" | "down") {
    if (!data) return;
    const hotels = [...(data[activeTab] || [])].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= hotels.length) return;

    // Swap in local array
    const temp = hotels[index];
    hotels[index] = hotels[swapIndex];
    hotels[swapIndex] = temp;

    const hotelIds = hotels.map((h) => h.hotel_id);

    setReordering(true);
    try {
      await reorderCurationHotels(slug, activeTab, hotelIds);
      toast("Order updated");
      setLoading(true);
      await fetchData();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to reorder", "error");
    } finally {
      setReordering(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 text-red-700 px-6 py-4 rounded-lg">
        {error || "City not found"}
        <button onClick={() => router.back()} className="ml-4 underline">
          Go back
        </button>
      </div>
    );
  }

  const hotels = [...(data[activeTab] || [])].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        <Link href="/dashboard/cities" className="hover:text-indigo-600 transition-colors">
          Cities
        </Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-900 font-medium">{data.city.name}</span>
      </div>

      {/* City Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{data.city.name}</h2>
            <p className="text-slate-500 mt-1">
              {data.city.country} &middot; {data.city.continent}
            </p>
            {data.city.tagline && (
              <p className="text-sm text-slate-400 mt-1 italic">{data.city.tagline}</p>
            )}
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center px-4 py-2 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">
                {(data.singles?.length || 0) +
                  (data.couples?.length || 0) +
                  (data.families?.length || 0)}
              </div>
              <div className="text-slate-500 text-xs">Total Hotels</div>
            </div>
            <div className="text-center px-4 py-2 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">
                {data.singles?.length || 0}
              </div>
              <div className="text-slate-500 text-xs">Singles</div>
            </div>
            <div className="text-center px-4 py-2 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-rose-600">
                {data.couples?.length || 0}
              </div>
              <div className="text-slate-500 text-xs">Couples</div>
            </div>
            <div className="text-center px-4 py-2 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">
                {data.families?.length || 0}
              </div>
              <div className="text-slate-500 text-xs">Families</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1 mb-6 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
            </svg>
            {tab.label}
            <span
              className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {data[tab.key]?.length || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Hotels Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Hotels
          </h3>
          <button
            onClick={() => {
              setShowSearch(true);
              setSearchResults([]);
              setSearchQuery("");
            }}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Hotel
          </button>
        </div>

        {hotels.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-slate-500 font-medium">No hotels in this category</p>
            <p className="text-slate-400 text-sm mt-1">Click &quot;Add Hotel&quot; to search and add hotels.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 w-20">
                    Order
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                    Hotel Name
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 w-20">
                    Stars
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 w-20">
                    Rating
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 w-24">
                    Reviews
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 w-24">
                    Rate
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 w-28">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hotels.map((hotel, idx) => (
                  <tr key={hotel.hotel_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleReorder(idx, "up")}
                          disabled={idx === 0 || reordering}
                          className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move up"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <span className="text-sm text-slate-600 font-semibold w-6 text-center">
                          {idx + 1}
                        </span>
                        <button
                          onClick={() => handleReorder(idx, "down")}
                          disabled={idx === hotels.length - 1 || reordering}
                          className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move down"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="text-sm font-semibold text-slate-900">{hotel.name}</div>
                      {hotel.address && (
                        <div className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{hotel.address}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {hotel.stars ? (
                        <span className="inline-flex items-center gap-1 text-sm text-amber-600 font-medium">
                          {hotel.stars}
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {hotel.rating ? (
                        <span className="inline-flex items-center justify-center w-10 h-6 bg-emerald-50 text-emerald-700 rounded text-xs font-bold">
                          {hotel.rating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center text-sm text-slate-600">
                      {hotel.reviews_count || <span className="text-slate-300">-</span>}
                    </td>
                    <td className="px-6 py-3.5 text-right text-sm font-semibold text-slate-900">
                      {hotel.rate ? (
                        <span>${hotel.rate.toLocaleString()}</span>
                      ) : (
                        <span className="text-slate-300 font-normal">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => setRemoveTarget(hotel)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Hotel Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowSearch(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[70vh] flex flex-col">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Add Hotel to {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h3>
                <button
                  onClick={() => setShowSearch(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSearch} className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  placeholder="Search by hotel name or city..."
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {searching ? "..." : "Search"}
                </button>
              </form>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {searchResults.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  {searching
                    ? "Searching..."
                    : searchQuery
                    ? "No results found"
                    : "Enter a search term to find hotels"}
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((hotel) => (
                    <div
                      key={hotel.hotel_id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {hotel.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                          {hotel.stars && <span>{hotel.stars}★</span>}
                          {hotel.rating && <span>Rating: {hotel.rating}</span>}
                          {hotel.city && <span>{hotel.city}</span>}
                          {hotel.address && (
                            <span className="truncate max-w-[200px]">{hotel.address}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddHotel(hotel)}
                        disabled={adding === hotel.hotel_id}
                        className="ml-4 shrink-0 inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                      >
                        {adding === hotel.hotel_id ? (
                          "Adding..."
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation */}
      {removeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setRemoveTarget(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Remove Hotel</h3>
              <p className="text-sm text-slate-500 mb-6">
                Remove <strong>{removeTarget.name}</strong> from {activeTab}?
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setRemoveTarget(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveHotel}
                  disabled={removing}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-colors"
                >
                  {removing ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
