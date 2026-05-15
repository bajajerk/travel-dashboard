"use client";

import { useState, useMemo, useCallback } from "react";
import { useToast } from "@/lib/toast";

// ---------- Types ----------
type Priority = "low" | "medium" | "high";
type ViewMode = "grid" | "list";
type SortKey = "added_desc" | "added_asc" | "price_asc" | "price_desc" | "priority";

interface WishlistItem {
  id: string;
  hotelId: string;
  hotelName: string;
  city: string;
  country: string;
  image: string;
  stars: number;
  rating: number;
  currentPrice: number;
  priceWhenAdded: number;
  currency: string;
  priority: Priority;
  note: string;
  targetDate: string | null;
  priceAlert: number | null;
  addedAt: string;
  collectionId: string;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  emoji: string;
  shared: boolean;
}

const PRIORITY_CONFIG: Record<Priority, { bg: string; text: string; dot: string; label: string }> = {
  low: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400", label: "Low" },
  medium: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Medium" },
  high: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500", label: "High" },
};

const INITIAL_COLLECTIONS: Collection[] = [
  { id: "c-1", name: "Honeymoon Picks", description: "Dreamy stays for our anniversary trip", emoji: "💞", shared: true },
  { id: "c-2", name: "Family Vacation", description: "Kid-friendly resorts with pools", emoji: "👨‍👩‍👧", shared: false },
  { id: "c-3", name: "Business Travel", description: "Quick stays with good wifi & airport access", emoji: "💼", shared: false },
  { id: "c-4", name: "Bucket List", description: "Once-in-a-lifetime properties", emoji: "✨", shared: true },
];

const INITIAL_ITEMS: WishlistItem[] = [
  {
    id: "w-001", hotelId: "h-001", hotelName: "The Oberoi Udaivilas", city: "Udaipur", country: "India",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=480&h=320&fit=crop",
    stars: 5, rating: 4.9, currentPrice: 27200, priceWhenAdded: 29500, currency: "INR",
    priority: "high", note: "Book lake-view suite for the anniversary",
    targetDate: "2026-09-15", priceAlert: 25000, addedAt: "2026-04-12", collectionId: "c-1",
  },
  {
    id: "w-002", hotelId: "h-002", hotelName: "Taj Lake Palace", city: "Udaipur", country: "India",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=480&h=320&fit=crop",
    stars: 5, rating: 4.8, currentPrice: 31500, priceWhenAdded: 31500, currency: "INR",
    priority: "high", note: "Backup option if Udaivilas is booked",
    targetDate: "2026-09-15", priceAlert: null, addedAt: "2026-04-12", collectionId: "c-1",
  },
  {
    id: "w-003", hotelId: "h-020", hotelName: "Taj Falaknuma Palace", city: "Hyderabad", country: "India",
    image: "https://images.unsplash.com/photo-1549294413-26f195200c16?w=480&h=320&fit=crop",
    stars: 5, rating: 4.9, currentPrice: 31500, priceWhenAdded: 34000, currency: "INR",
    priority: "high", note: "Heritage tour + butler service",
    targetDate: null, priceAlert: 30000, addedAt: "2026-03-22", collectionId: "c-4",
  },
  {
    id: "w-004", hotelId: "h-005", hotelName: "Rambagh Palace", city: "Jaipur", country: "India",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=480&h=320&fit=crop",
    stars: 5, rating: 4.9, currentPrice: 24500, priceWhenAdded: 23000, currency: "INR",
    priority: "medium", note: "Check royal-suite availability for December",
    targetDate: "2026-12-22", priceAlert: 22000, addedAt: "2026-02-14", collectionId: "c-4",
  },
  {
    id: "w-005", hotelId: "h-009", hotelName: "The Park Hyatt", city: "Goa", country: "India",
    image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=480&h=320&fit=crop",
    stars: 5, rating: 4.6, currentPrice: 18200, priceWhenAdded: 18200, currency: "INR",
    priority: "medium", note: "Beach access + kids club confirmed",
    targetDate: "2026-06-10", priceAlert: 16000, addedAt: "2026-04-01", collectionId: "c-2",
  },
  {
    id: "w-006", hotelId: "h-012", hotelName: "Novotel Goa Resort", city: "Goa", country: "India",
    image: "https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?w=480&h=320&fit=crop",
    stars: 4, rating: 4.4, currentPrice: 8400, priceWhenAdded: 9200, currency: "INR",
    priority: "low", note: "Cheaper alternative for the kids",
    targetDate: "2026-06-10", priceAlert: null, addedAt: "2026-04-02", collectionId: "c-2",
  },
  {
    id: "w-007", hotelId: "h-008", hotelName: "JW Marriott Aerocity", city: "Delhi", country: "India",
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=480&h=320&fit=crop",
    stars: 5, rating: 4.5, currentPrice: 9900, priceWhenAdded: 9900, currency: "INR",
    priority: "medium", note: "Default for layovers between client meetings",
    targetDate: null, priceAlert: 8500, addedAt: "2026-03-05", collectionId: "c-3",
  },
  {
    id: "w-008", hotelId: "h-011", hotelName: "Radisson Blu", city: "Delhi", country: "India",
    image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=480&h=320&fit=crop",
    stars: 4, rating: 4.3, currentPrice: 6860, priceWhenAdded: 7400, currency: "INR",
    priority: "low", note: "Budget backup near client office",
    targetDate: null, priceAlert: null, addedAt: "2026-03-05", collectionId: "c-3",
  },
  {
    id: "w-009", hotelId: "h-004", hotelName: "The Leela Palace", city: "Bengaluru", country: "India",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=480&h=320&fit=crop",
    stars: 5, rating: 4.8, currentPrice: 15400, priceWhenAdded: 16000, currency: "INR",
    priority: "medium", note: "Spa credit included via Voyagr perks",
    targetDate: null, priceAlert: null, addedAt: "2026-02-28", collectionId: "c-3",
  },
  {
    id: "w-010", hotelId: "h-007", hotelName: "Wildflower Hall", city: "Shimla", country: "India",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=480&h=320&fit=crop",
    stars: 5, rating: 4.7, currentPrice: 22400, priceWhenAdded: 22400, currency: "INR",
    priority: "high", note: "Mountain getaway — December snow",
    targetDate: "2026-12-28", priceAlert: 20000, addedAt: "2026-04-20", collectionId: "c-4",
  },
];

function formatINR(amount: number) {
  return "₹" + amount.toLocaleString("en-IN");
}

function relativeDate(iso: string) {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const days = Math.round((now - then) / (1000 * 60 * 60 * 24));
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.round(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-3 h-3 ${i < stars ? "text-amber-400" : "text-slate-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function PriceTrendBadge({ current, original }: { current: number; original: number }) {
  if (current === original) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14" />
        </svg>
        unchanged
      </span>
    );
  }
  const dropped = current < original;
  const pct = Math.round(Math.abs(current - original) / original * 100);
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
        dropped ? "text-emerald-600" : "text-rose-600"
      }`}
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {dropped ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        )}
      </svg>
      {pct}% {dropped ? "off" : "up"}
    </span>
  );
}

export default function WishlistPage() {
  const { toast } = useToast();
  const [collections, setCollections] = useState<Collection[]>(INITIAL_COLLECTIONS);
  const [items, setItems] = useState<WishlistItem[]>(INITIAL_ITEMS);
  const [activeCollection, setActiveCollection] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("added_desc");
  const [view, setView] = useState<ViewMode>("grid");
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDesc, setNewCollectionDesc] = useState("");

  const totalValue = useMemo(
    () => items.reduce((sum, i) => sum + i.currentPrice, 0),
    [items]
  );
  const totalSavings = useMemo(
    () => items.reduce((sum, i) => sum + Math.max(0, i.priceWhenAdded - i.currentPrice), 0),
    [items]
  );
  const alertsTriggered = useMemo(
    () => items.filter((i) => i.priceAlert !== null && i.currentPrice <= i.priceAlert).length,
    [items]
  );

  const filteredItems = useMemo(() => {
    let list = items.filter((i) => {
      if (activeCollection !== "all" && i.collectionId !== activeCollection) return false;
      if (priorityFilter !== "all" && i.priority !== priorityFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !i.hotelName.toLowerCase().includes(q) &&
          !i.city.toLowerCase().includes(q) &&
          !i.note.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sortKey) {
        case "added_desc":
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        case "added_asc":
          return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
        case "price_asc":
          return a.currentPrice - b.currentPrice;
        case "price_desc":
          return b.currentPrice - a.currentPrice;
        case "priority": {
          const order = { high: 0, medium: 1, low: 2 };
          return order[a.priority] - order[b.priority];
        }
        default:
          return 0;
      }
    });
    return list;
  }, [items, activeCollection, priorityFilter, search, sortKey]);

  const collectionCount = useCallback(
    (id: string) => items.filter((i) => i.collectionId === id).length,
    [items]
  );

  function removeItem(id: string) {
    const item = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast(`Removed ${item?.hotelName ?? "item"} from wishlist`);
  }

  function moveToCollection(itemId: string, collectionId: string) {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, collectionId } : i))
    );
    const c = collections.find((c) => c.id === collectionId);
    toast(`Moved to ${c?.name ?? "collection"}`);
  }

  function updateItem(updated: WishlistItem) {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    setEditingItem(null);
    toast("Wishlist item updated");
  }

  function createCollection() {
    const name = newCollectionName.trim();
    if (!name) {
      toast("Name is required", "error");
      return;
    }
    const id = `c-${Date.now()}`;
    setCollections((prev) => [
      ...prev,
      { id, name, description: newCollectionDesc.trim(), emoji: "📁", shared: false },
    ]);
    setNewCollectionName("");
    setNewCollectionDesc("");
    setShowNewCollection(false);
    setActiveCollection(id);
    toast(`Created "${name}"`);
  }

  function deleteCollection(id: string) {
    if (collectionCount(id) > 0) {
      toast("Move items out before deleting", "error");
      return;
    }
    setCollections((prev) => prev.filter((c) => c.id !== id));
    if (activeCollection === id) setActiveCollection("all");
    toast("Collection removed");
  }

  function toggleShared(id: string) {
    setCollections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, shared: !c.shared } : c))
    );
  }

  function setPriority(itemId: string, priority: Priority) {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, priority } : i))
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Wishlist</h2>
          <p className="text-sm text-slate-500 mt-1">
            Organise saved hotels, track price drops, and plan upcoming trips.
          </p>
        </div>
        <button
          onClick={() => setShowNewCollection(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New collection
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Saved hotels</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{items.length}</div>
          <div className="text-xs text-slate-500 mt-1">{collections.length} collections</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total value</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{formatINR(totalValue)}</div>
          <div className="text-xs text-slate-500 mt-1">at current Voyagr rates</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Price drops</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{formatINR(totalSavings)}</div>
          <div className="text-xs text-slate-500 mt-1">since added to wishlist</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Alerts triggered</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{alertsTriggered}</div>
          <div className="text-xs text-slate-500 mt-1">at or below target price</div>
        </div>
      </div>

      {/* Layout */}
      <div className="flex gap-6">
        {/* Collections sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-24">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3">
              Collections
            </h3>
            <button
              onClick={() => setActiveCollection("all")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
                activeCollection === "all"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>🗂</span>
                All hotels
              </span>
              <span className="text-xs text-slate-400">{items.length}</span>
            </button>
            <div className="my-2 border-t border-slate-100" />
            <div className="space-y-1">
              {collections.map((c) => (
                <div key={c.id} className="group flex items-center">
                  <button
                    onClick={() => setActiveCollection(c.id)}
                    className={`flex-1 text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${
                      activeCollection === c.id
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span>{c.emoji}</span>
                      <span className="truncate">{c.name}</span>
                      {c.shared && (
                        <svg className="w-3 h-3 text-indigo-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                      )}
                    </span>
                    <span className="text-xs text-slate-400 shrink-0">{collectionCount(c.id)}</span>
                  </button>
                  <button
                    onClick={() => deleteCollection(c.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 p-1 transition-opacity"
                    title="Delete collection"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowNewCollection(true)}
              className="mt-3 w-full text-left px-3 py-2 rounded-lg text-sm text-indigo-600 hover:bg-indigo-50 font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New collection
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 mb-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search wishlist..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
              />
            </div>

            {/* Mobile collection picker */}
            <select
              value={activeCollection}
              onChange={(e) => setActiveCollection(e.target.value)}
              className="lg:hidden px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All hotels ({items.length})</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name} ({collectionCount(c.id)})
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as Priority | "all")}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="added_desc">Newest first</option>
              <option value="added_asc">Oldest first</option>
              <option value="price_asc">Price (low → high)</option>
              <option value="price_desc">Price (high → low)</option>
              <option value="priority">Priority</option>
            </select>

            <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
              <button
                onClick={() => setView("grid")}
                className={`p-1.5 rounded ${
                  view === "grid" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"
                }`}
                title="Grid view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-1.5 rounded ${
                  view === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"
                }`}
                title="List view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Active collection banner */}
          {activeCollection !== "all" && (() => {
            const c = collections.find((c) => c.id === activeCollection);
            if (!c) return null;
            return (
              <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl p-4 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl shadow-sm shrink-0">
                    {c.emoji}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{c.name}</div>
                    <div className="text-xs text-slate-500 truncate">
                      {c.description || "No description"}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleShared(c.id)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    c.shared
                      ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  {c.shared ? "Shared" : "Share"}
                </button>
              </div>
            );
          })()}

          {/* Items */}
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Nothing here yet</h3>
              <p className="text-sm text-slate-500">
                {search || priorityFilter !== "all"
                  ? "Try adjusting filters or search to see more results."
                  : "Save hotels from Browse Hotels to start building your wishlist."}
              </p>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <WishlistCard
                  key={item.id}
                  item={item}
                  collections={collections}
                  onMove={(cid) => moveToCollection(item.id, cid)}
                  onRemove={() => removeItem(item.id)}
                  onEdit={() => setEditingItem(item)}
                  onSetPriority={(p) => setPriority(item.id, p)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold">Hotel</th>
                      <th className="text-left px-4 py-3 font-semibold">Collection</th>
                      <th className="text-left px-4 py-3 font-semibold">Priority</th>
                      <th className="text-left px-4 py-3 font-semibold">Current price</th>
                      <th className="text-left px-4 py-3 font-semibold">Alert</th>
                      <th className="text-left px-4 py-3 font-semibold">Added</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => {
                      const collection = collections.find((c) => c.id === item.collectionId);
                      const alertHit =
                        item.priceAlert !== null && item.currentPrice <= item.priceAlert;
                      return (
                        <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={item.image}
                                alt={item.hotelName}
                                className="w-12 h-12 rounded-lg object-cover shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900 truncate">{item.hotelName}</div>
                                <div className="text-xs text-slate-500 truncate">
                                  {item.city} · ⭐ {item.rating}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                            {collection?.emoji} {collection?.name}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded ${PRIORITY_CONFIG[item.priority].bg} ${PRIORITY_CONFIG[item.priority].text}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_CONFIG[item.priority].dot}`} />
                              {PRIORITY_CONFIG[item.priority].label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900">{formatINR(item.currentPrice)}</div>
                            <PriceTrendBadge current={item.currentPrice} original={item.priceWhenAdded} />
                          </td>
                          <td className="px-4 py-3">
                            {item.priceAlert === null ? (
                              <span className="text-xs text-slate-400">—</span>
                            ) : alertHit ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
                                🔔 {formatINR(item.priceAlert)}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-500">≤ {formatINR(item.priceAlert)}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                            {relativeDate(item.addedAt)}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <button
                              onClick={() => setEditingItem(item)}
                              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium px-2"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Collection Modal */}
      {showNewCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">New collection</h3>
              <button
                onClick={() => setShowNewCollection(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g. Anniversary trip 2026"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={newCollectionDesc}
                  onChange={(e) => setNewCollectionDesc(e.target.value)}
                  placeholder="Optional — what is this list for?"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowNewCollection(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={createCollection}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <EditItemModal
          item={editingItem}
          collections={collections}
          onSave={updateItem}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}

// ---------- Wishlist Card ----------
function WishlistCard({
  item,
  collections,
  onMove,
  onRemove,
  onEdit,
  onSetPriority,
}: {
  item: WishlistItem;
  collections: Collection[];
  onMove: (collectionId: string) => void;
  onRemove: () => void;
  onEdit: () => void;
  onSetPriority: (p: Priority) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const collection = collections.find((c) => c.id === item.collectionId);
  const alertHit = item.priceAlert !== null && item.currentPrice <= item.priceAlert;
  const dropped = item.currentPrice < item.priceWhenAdded;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="relative h-40 bg-slate-100">
        <img
          src={item.image}
          alt={item.hotelName}
          className="w-full h-full object-cover"
        />
        {dropped && (
          <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            PRICE DROP
          </div>
        )}
        {alertHit && (
          <div className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 mt-6">
            🔔 ALERT
          </div>
        )}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="bg-white/90 backdrop-blur-sm w-7 h-7 rounded-full text-slate-700 hover:text-slate-900 flex items-center justify-center shadow-sm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute top-9 right-0 w-52 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-20">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit details
                </button>
                <div className="border-t border-slate-100 my-1" />
                <div className="px-3 py-1 text-[10px] uppercase text-slate-400 font-semibold">
                  Move to
                </div>
                {collections.map((c) => (
                  <button
                    key={c.id}
                    disabled={c.id === item.collectionId}
                    onClick={() => {
                      setMenuOpen(false);
                      onMove(c.id);
                    }}
                    className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>{c.emoji}</span>
                    <span className="truncate">{c.name}</span>
                    {c.id === item.collectionId && (
                      <span className="ml-auto text-[10px] text-slate-400">current</span>
                    )}
                  </button>
                ))}
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onRemove();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
                  </svg>
                  Remove from wishlist
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-indigo-600">
            {collection?.emoji} {collection?.name}
          </span>
          <StarRating stars={item.stars} />
        </div>
        <h3 className="font-semibold text-slate-900 text-sm truncate">{item.hotelName}</h3>
        <div className="text-xs text-slate-500 mb-2">
          {item.city}, {item.country}
        </div>

        {item.note && (
          <p className="text-xs text-slate-600 bg-slate-50 rounded-lg px-2.5 py-1.5 mb-3 line-clamp-2">
            “{item.note}”
          </p>
        )}

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {(["high", "medium", "low"] as const).map((p) => (
            <button
              key={p}
              onClick={() => onSetPriority(p)}
              className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                item.priority === p
                  ? `${PRIORITY_CONFIG[p].bg} ${PRIORITY_CONFIG[p].text} border-current`
                  : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
              }`}
            >
              {PRIORITY_CONFIG[p].label}
            </button>
          ))}
        </div>

        <div className="mt-auto border-t border-slate-100 pt-3">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-lg font-bold text-slate-900">
                {formatINR(item.currentPrice)}
                <span className="text-xs font-normal text-slate-500 ml-1">/night</span>
              </div>
              <PriceTrendBadge current={item.currentPrice} original={item.priceWhenAdded} />
            </div>
            <div className="text-right text-xs text-slate-500 space-y-0.5">
              {item.targetDate && (
                <div>
                  <svg className="inline w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(item.targetDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </div>
              )}
              {item.priceAlert && (
                <div className={alertHit ? "text-rose-600 font-semibold" : ""}>
                  🔔 ≤ {formatINR(item.priceAlert)}
                </div>
              )}
              <div className="text-slate-400">added {relativeDate(item.addedAt)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Edit Item Modal ----------
function EditItemModal({
  item,
  collections,
  onSave,
  onClose,
}: {
  item: WishlistItem;
  collections: Collection[];
  onSave: (item: WishlistItem) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<WishlistItem>(item);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-900 truncate">{item.hotelName}</h3>
            <p className="text-xs text-slate-500 truncate">{item.city}, {item.country}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Collection</label>
            <select
              value={draft.collectionId}
              onChange={(e) => setDraft({ ...draft, collectionId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
            >
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Priority</label>
            <div className="flex gap-2">
              {(["high", "medium", "low"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setDraft({ ...draft, priority: p })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    draft.priority === p
                      ? `${PRIORITY_CONFIG[p].bg} ${PRIORITY_CONFIG[p].text} border-current`
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {PRIORITY_CONFIG[p].label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Note</label>
            <textarea
              value={draft.note}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              placeholder="Why is this on your wishlist?"
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Target date</label>
              <input
                type="date"
                value={draft.targetDate ?? ""}
                onChange={(e) => setDraft({ ...draft, targetDate: e.target.value || null })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Price alert (≤ {"₹"})
              </label>
              <input
                type="number"
                value={draft.priceAlert ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    priceAlert: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                placeholder="No alert"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
              />
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Current rate</span>
              <span className="font-semibold text-slate-900">{formatINR(item.currentPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>Price when added</span>
              <span>{formatINR(item.priceWhenAdded)}</span>
            </div>
            <div className="flex justify-between">
              <span>Added</span>
              <span>{relativeDate(item.addedAt)}</span>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-5 py-3 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(draft)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
