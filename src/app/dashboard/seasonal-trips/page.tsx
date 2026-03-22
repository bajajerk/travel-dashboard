"use client";

import { useState, useMemo, useCallback } from "react";
import { useToast } from "@/lib/toast";

type Season = "spring" | "summer" | "fall" | "winter" | "holiday";
type TripStatus = "active" | "draft" | "scheduled" | "expired";
type SortKey = "title" | "season" | "destination" | "start_date" | "status" | "bookings";
type SortDir = "asc" | "desc";

interface SeasonalTrip {
  id: string;
  title: string;
  description: string;
  destination: string;
  season: Season;
  status: TripStatus;
  start_date: string;
  end_date: string;
  price_from: number;
  featured: boolean;
  image_url: string;
  tags: string[];
  bookings: number;
  capacity: number;
  created_at: string;
  updated_at: string;
}

const SEASON_CONFIG: Record<Season, { bg: string; text: string; label: string; icon: string }> = {
  spring: { bg: "bg-green-50", text: "text-green-700", label: "Spring", icon: "🌸" },
  summer: { bg: "bg-amber-50", text: "text-amber-700", label: "Summer", icon: "☀️" },
  fall: { bg: "bg-orange-50", text: "text-orange-700", label: "Fall", icon: "🍂" },
  winter: { bg: "bg-blue-50", text: "text-blue-700", label: "Winter", icon: "❄️" },
  holiday: { bg: "bg-purple-50", text: "text-purple-700", label: "Holiday", icon: "🎄" },
};

const STATUS_CONFIG: Record<TripStatus, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Active" },
  draft: { bg: "bg-slate-100", text: "text-slate-600", label: "Draft" },
  scheduled: { bg: "bg-indigo-50", text: "text-indigo-700", label: "Scheduled" },
  expired: { bg: "bg-red-50", text: "text-red-700", label: "Expired" },
};

const MOCK_TRIPS: SeasonalTrip[] = [
  {
    id: "st-001",
    title: "Cherry Blossom Retreat",
    description: "Experience the magical cherry blossom season in Japan with curated hotel stays in Kyoto and Tokyo.",
    destination: "Kyoto, Japan",
    season: "spring",
    status: "active",
    start_date: "2026-03-15",
    end_date: "2026-04-30",
    price_from: 2499,
    featured: true,
    image_url: "/images/cherry-blossom.jpg",
    tags: ["cultural", "nature", "luxury"],
    bookings: 142,
    capacity: 200,
    created_at: "2026-01-10T08:00:00Z",
    updated_at: "2026-03-18T14:30:00Z",
  },
  {
    id: "st-002",
    title: "Mediterranean Summer Escape",
    description: "Sun-soaked beaches and coastal towns across Greece, Italy, and Spain.",
    destination: "Santorini, Greece",
    season: "summer",
    status: "scheduled",
    start_date: "2026-06-01",
    end_date: "2026-08-31",
    price_from: 3199,
    featured: true,
    image_url: "/images/mediterranean.jpg",
    tags: ["beach", "romantic", "food"],
    bookings: 87,
    capacity: 300,
    created_at: "2026-02-01T10:00:00Z",
    updated_at: "2026-03-15T09:00:00Z",
  },
  {
    id: "st-003",
    title: "New England Fall Foliage",
    description: "Drive through vibrant autumn colors with stays at charming New England inns.",
    destination: "Vermont, USA",
    season: "fall",
    status: "draft",
    start_date: "2026-09-15",
    end_date: "2026-11-15",
    price_from: 1899,
    featured: false,
    image_url: "/images/fall-foliage.jpg",
    tags: ["nature", "roadtrip", "cozy"],
    bookings: 0,
    capacity: 150,
    created_at: "2026-03-01T12:00:00Z",
    updated_at: "2026-03-20T16:00:00Z",
  },
  {
    id: "st-004",
    title: "Swiss Alps Winter Wonderland",
    description: "Ski resorts and mountain lodges in the heart of the Swiss Alps.",
    destination: "Zermatt, Switzerland",
    season: "winter",
    status: "active",
    start_date: "2025-12-01",
    end_date: "2026-03-31",
    price_from: 4299,
    featured: true,
    image_url: "/images/swiss-alps.jpg",
    tags: ["skiing", "adventure", "luxury"],
    bookings: 198,
    capacity: 250,
    created_at: "2025-09-15T08:00:00Z",
    updated_at: "2026-03-10T11:00:00Z",
  },
  {
    id: "st-005",
    title: "Christmas Markets of Europe",
    description: "Visit the most enchanting Christmas markets in Vienna, Prague, and Munich.",
    destination: "Vienna, Austria",
    season: "holiday",
    status: "expired",
    start_date: "2025-11-20",
    end_date: "2025-12-31",
    price_from: 2799,
    featured: false,
    image_url: "/images/christmas-markets.jpg",
    tags: ["cultural", "festive", "family"],
    bookings: 275,
    capacity: 280,
    created_at: "2025-08-01T10:00:00Z",
    updated_at: "2026-01-02T08:00:00Z",
  },
  {
    id: "st-006",
    title: "Tropical Monsoon Getaway",
    description: "Lush green landscapes and discounted rates during the beautiful monsoon season in Bali.",
    destination: "Bali, Indonesia",
    season: "summer",
    status: "active",
    start_date: "2026-05-01",
    end_date: "2026-07-31",
    price_from: 1599,
    featured: false,
    image_url: "/images/bali-monsoon.jpg",
    tags: ["tropical", "budget", "wellness"],
    bookings: 63,
    capacity: 120,
    created_at: "2026-02-15T14:00:00Z",
    updated_at: "2026-03-19T10:00:00Z",
  },
  {
    id: "st-007",
    title: "Tulip Season Netherlands",
    description: "Explore Keukenhof Gardens and Amsterdam during peak tulip blooming season.",
    destination: "Amsterdam, Netherlands",
    season: "spring",
    status: "scheduled",
    start_date: "2026-04-01",
    end_date: "2026-05-15",
    price_from: 1999,
    featured: false,
    image_url: "/images/tulips.jpg",
    tags: ["nature", "cultural", "photography"],
    bookings: 34,
    capacity: 100,
    created_at: "2026-01-20T09:00:00Z",
    updated_at: "2026-03-12T15:00:00Z",
  },
  {
    id: "st-008",
    title: "Northern Lights Adventure",
    description: "Chase the aurora borealis with stays in glass igloos and ice hotels in Finnish Lapland.",
    destination: "Lapland, Finland",
    season: "winter",
    status: "scheduled",
    start_date: "2026-11-01",
    end_date: "2027-02-28",
    price_from: 5199,
    featured: true,
    image_url: "/images/northern-lights.jpg",
    tags: ["adventure", "luxury", "nature"],
    bookings: 15,
    capacity: 80,
    created_at: "2026-03-05T08:00:00Z",
    updated_at: "2026-03-21T12:00:00Z",
  },
  {
    id: "st-009",
    title: "Harvest Wine Tour",
    description: "Join the grape harvest in Napa Valley and Tuscany with exclusive vineyard tours.",
    destination: "Napa Valley, USA",
    season: "fall",
    status: "draft",
    start_date: "2026-09-01",
    end_date: "2026-10-31",
    price_from: 3499,
    featured: false,
    image_url: "/images/wine-harvest.jpg",
    tags: ["food", "luxury", "romantic"],
    bookings: 0,
    capacity: 60,
    created_at: "2026-03-10T11:00:00Z",
    updated_at: "2026-03-18T17:00:00Z",
  },
  {
    id: "st-010",
    title: "New Year's Eve in Dubai",
    description: "Ring in the new year with spectacular fireworks and luxury hotel stays in Dubai.",
    destination: "Dubai, UAE",
    season: "holiday",
    status: "scheduled",
    start_date: "2026-12-28",
    end_date: "2027-01-03",
    price_from: 6999,
    featured: true,
    image_url: "/images/dubai-nye.jpg",
    tags: ["luxury", "festive", "nightlife"],
    bookings: 42,
    capacity: 150,
    created_at: "2026-03-01T09:00:00Z",
    updated_at: "2026-03-20T14:00:00Z",
  },
];

function formatCurrency(amount: number): string {
  return "$" + amount.toLocaleString();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function SeasonalTripsPage() {
  const { toast } = useToast();
  const [trips, setTrips] = useState<SeasonalTrip[]>(MOCK_TRIPS);

  // Filters
  const [search, setSearch] = useState("");
  const [seasonFilter, setSeasonFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>("start_date");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Modals
  const [selectedTrip, setSelectedTrip] = useState<SeasonalTrip | null>(null);
  const [editTrip, setEditTrip] = useState<SeasonalTrip | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Edit form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDestination, setFormDestination] = useState("");
  const [formSeason, setFormSeason] = useState<Season>("summer");
  const [formStatus, setFormStatus] = useState<TripStatus>("draft");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formPrice, setFormPrice] = useState(0);
  const [formCapacity, setFormCapacity] = useState(0);
  const [formFeatured, setFormFeatured] = useState(false);
  const [formTags, setFormTags] = useState("");

  const stats = useMemo(() => {
    const total = trips.length;
    const active = trips.filter((t) => t.status === "active").length;
    const featured = trips.filter((t) => t.featured).length;
    const totalBookings = trips.reduce((s, t) => s + t.bookings, 0);
    const totalCapacity = trips.reduce((s, t) => s + t.capacity, 0);
    const avgFillRate = totalCapacity > 0 ? (totalBookings / totalCapacity) * 100 : 0;
    return { total, active, featured, totalBookings, avgFillRate };
  }, [trips]);

  const filtered = useMemo(() => {
    let list = [...trips];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.destination.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    if (seasonFilter) list = list.filter((t) => t.season === seasonFilter);
    if (statusFilter) list = list.filter((t) => t.status === statusFilter);
    if (featuredOnly) list = list.filter((t) => t.featured);

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "season": {
          const order: Record<Season, number> = { spring: 0, summer: 1, fall: 2, winter: 3, holiday: 4 };
          cmp = order[a.season] - order[b.season];
          break;
        }
        case "destination":
          cmp = a.destination.localeCompare(b.destination);
          break;
        case "start_date":
          cmp = a.start_date.localeCompare(b.start_date);
          break;
        case "status": {
          const order: Record<TripStatus, number> = { active: 0, scheduled: 1, draft: 2, expired: 3 };
          cmp = order[a.status] - order[b.status];
          break;
        }
        case "bookings":
          cmp = a.bookings - b.bookings;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [trips, search, seasonFilter, statusFilter, featuredOnly, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const populateForm = useCallback((trip: SeasonalTrip | null) => {
    if (trip) {
      setFormTitle(trip.title);
      setFormDescription(trip.description);
      setFormDestination(trip.destination);
      setFormSeason(trip.season);
      setFormStatus(trip.status);
      setFormStartDate(trip.start_date);
      setFormEndDate(trip.end_date);
      setFormPrice(trip.price_from);
      setFormCapacity(trip.capacity);
      setFormFeatured(trip.featured);
      setFormTags(trip.tags.join(", "));
    } else {
      setFormTitle("");
      setFormDescription("");
      setFormDestination("");
      setFormSeason("summer");
      setFormStatus("draft");
      setFormStartDate("");
      setFormEndDate("");
      setFormPrice(0);
      setFormCapacity(0);
      setFormFeatured(false);
      setFormTags("");
    }
  }, []);

  function openEdit(trip: SeasonalTrip) {
    populateForm(trip);
    setEditTrip(trip);
  }

  function openCreate() {
    populateForm(null);
    setShowCreateModal(true);
  }

  function handleSave() {
    if (!formTitle.trim() || !formDestination.trim() || !formStartDate || !formEndDate) {
      toast("Please fill in all required fields", "error");
      return;
    }

    const tags = formTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const now = new Date().toISOString();

    if (editTrip) {
      setTrips((prev) =>
        prev.map((t) =>
          t.id === editTrip.id
            ? {
                ...t,
                title: formTitle.trim(),
                description: formDescription.trim(),
                destination: formDestination.trim(),
                season: formSeason,
                status: formStatus,
                start_date: formStartDate,
                end_date: formEndDate,
                price_from: formPrice,
                capacity: formCapacity,
                featured: formFeatured,
                tags,
                updated_at: now,
              }
            : t
        )
      );
      toast("Trip updated successfully");
      setEditTrip(null);
    } else {
      const newTrip: SeasonalTrip = {
        id: `st-${String(trips.length + 1).padStart(3, "0")}`,
        title: formTitle.trim(),
        description: formDescription.trim(),
        destination: formDestination.trim(),
        season: formSeason,
        status: formStatus,
        start_date: formStartDate,
        end_date: formEndDate,
        price_from: formPrice,
        featured: formFeatured,
        image_url: "",
        tags,
        bookings: 0,
        capacity: formCapacity,
        created_at: now,
        updated_at: now,
      };
      setTrips((prev) => [...prev, newTrip]);
      toast("Trip created successfully");
      setShowCreateModal(false);
    }
  }

  function handleDelete(trip: SeasonalTrip) {
    setTrips((prev) => prev.filter((t) => t.id !== trip.id));
    toast("Trip deleted");
    setSelectedTrip(null);
  }

  function toggleFeatured(trip: SeasonalTrip) {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === trip.id ? { ...t, featured: !t.featured, updated_at: new Date().toISOString() } : t
      )
    );
    toast(trip.featured ? "Removed from featured" : "Marked as featured");
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

  function fillPercent(t: SeasonalTrip) {
    return t.capacity > 0 ? Math.round((t.bookings / t.capacity) * 100) : 0;
  }

  // Form modal (shared between create & edit)
  function renderFormModal(isCreate: boolean) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/50" onClick={() => (isCreate ? setShowCreateModal(false) : setEditTrip(null))} />
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">{isCreate ? "Create Seasonal Trip" : "Edit Trip"}</h3>
            <button
              onClick={() => (isCreate ? setShowCreateModal(false) : setEditTrip(null))}
              className="text-slate-400 hover:text-slate-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g., Cherry Blossom Retreat"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                placeholder="Describe the seasonal trip..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Destination *</label>
              <input
                type="text"
                value={formDestination}
                onChange={(e) => setFormDestination(e.target.value)}
                placeholder="e.g., Kyoto, Japan"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Season</label>
                <select
                  value={formSeason}
                  onChange={(e) => setFormSeason(e.target.value as Season)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                >
                  {Object.entries(SEASON_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as TripStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                >
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date *</label>
                <input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Date *</label>
                <input
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price From ($)</label>
                <input
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
                <input
                  type="number"
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
              <input
                type="text"
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="e.g., luxury, beach, cultural (comma-separated)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured-check"
                checked={formFeatured}
                onChange={(e) => setFormFeatured(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="featured-check" className="text-sm font-medium text-slate-700">
                Featured trip
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
            <button
              onClick={() => (isCreate ? setShowCreateModal(false) : setEditTrip(null))}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              {isCreate ? "Create Trip" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Seasonal Trips</h2>
          <p className="text-slate-500 mt-1">Create and manage seasonal travel content and promotions.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Trip
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Trips</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Featured</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.featured}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Bookings</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalBookings.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Avg Fill Rate</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.avgFillRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trips, destinations, tags..."
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>
          <select
            value={seasonFilter}
            onChange={(e) => setSeasonFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
          >
            <option value="">All Seasons</option>
            {Object.entries(SEASON_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 px-3 py-2 cursor-pointer">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => setFeaturedOnly(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-700 font-medium">Featured only</span>
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-500 font-medium">No seasonal trips found</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or create a new trip.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th
                    className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center gap-1">Trip <SortIcon column="title" /></div>
                  </th>
                  <th
                    className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort("destination")}
                  >
                    <div className="flex items-center gap-1">Destination <SortIcon column="destination" /></div>
                  </th>
                  <th
                    className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort("season")}
                  >
                    <div className="flex items-center gap-1">Season <SortIcon column="season" /></div>
                  </th>
                  <th
                    className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort("start_date")}
                  >
                    <div className="flex items-center gap-1">Dates <SortIcon column="start_date" /></div>
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                    Price
                  </th>
                  <th
                    className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort("bookings")}
                  >
                    <div className="flex items-center gap-1">Bookings <SortIcon column="bookings" /></div>
                  </th>
                  <th
                    className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-1">Status <SortIcon column="status" /></div>
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((trip) => {
                  const seasonCfg = SEASON_CONFIG[trip.season];
                  const statusCfg = STATUS_CONFIG[trip.status];
                  const fill = fillPercent(trip);
                  return (
                    <tr key={trip.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold text-slate-900">{trip.title}</p>
                              {trip.featured && (
                                <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              {trip.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{trip.destination}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${seasonCfg.bg} ${seasonCfg.text}`}>
                          <span>{seasonCfg.icon}</span> {seasonCfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-900">{formatDate(trip.start_date)}</p>
                        <p className="text-xs text-slate-400">{formatDate(trip.end_date)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-900">from {formatCurrency(trip.price_from)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                fill >= 90 ? "bg-red-500" : fill >= 70 ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                              style={{ width: `${fill}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-600 font-medium">
                            {trip.bookings}/{trip.capacity}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.bg} ${statusCfg.text}`}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedTrip(trip)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                          <button
                            onClick={() => openEdit(trip)}
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
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
            Showing {filtered.length} of {trips.length} seasonal trips
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedTrip(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{selectedTrip.title}</h3>
                  {selectedTrip.featured && (
                    <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{selectedTrip.destination}</p>
              </div>
              <button onClick={() => setSelectedTrip(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-slate-600 mb-4">{selectedTrip.description}</p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 font-medium">Season</p>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${SEASON_CONFIG[selectedTrip.season].bg} ${SEASON_CONFIG[selectedTrip.season].text} mt-1`}>
                    <span>{SEASON_CONFIG[selectedTrip.season].icon}</span> {SEASON_CONFIG[selectedTrip.season].label}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 font-medium">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[selectedTrip.status].bg} ${STATUS_CONFIG[selectedTrip.status].text} mt-1`}>
                    {STATUS_CONFIG[selectedTrip.status].label}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 font-medium">Start Date</p>
                  <p className="text-sm text-slate-900 mt-0.5">{formatDate(selectedTrip.start_date)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 font-medium">End Date</p>
                  <p className="text-sm text-slate-900 mt-0.5">{formatDate(selectedTrip.end_date)}</p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Booking Performance</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center bg-slate-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-slate-900">{selectedTrip.bookings}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Bookings</p>
                  </div>
                  <div className="text-center bg-slate-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-slate-900">{selectedTrip.capacity}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Capacity</p>
                  </div>
                  <div className="text-center bg-indigo-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-indigo-600">{fillPercent(selectedTrip)}%</p>
                    <p className="text-xs text-indigo-600 mt-0.5">Fill Rate</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Price From</p>
                    <p className="text-lg font-bold text-slate-900 mt-0.5">{formatCurrency(selectedTrip.price_from)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-medium">Last Updated</p>
                    <p className="text-sm text-slate-900 mt-0.5">{formatDate(selectedTrip.updated_at)}</p>
                  </div>
                </div>
              </div>

              {selectedTrip.tags.length > 0 && (
                <div className="border-t border-slate-200 pt-4">
                  <p className="text-xs text-slate-500 font-medium mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTrip.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFeatured(selectedTrip)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    selectedTrip.featured
                      ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill={selectedTrip.featured ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  {selectedTrip.featured ? "Unfeature" : "Feature"}
                </button>
                <button
                  onClick={() => handleDelete(selectedTrip)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedTrip(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedTrip(null);
                    openEdit(selectedTrip);
                  }}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  Edit Trip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && renderFormModal(true)}

      {/* Edit Modal */}
      {editTrip && renderFormModal(false)}
    </div>
  );
}
