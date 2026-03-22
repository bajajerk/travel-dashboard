"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Booking, getBookings } from "@/lib/api";

// Mock bookings data — replace with API call once backend is ready
const MOCK_BOOKINGS: Booking[] = [
  {
    id: "BK-2026-001",
    guest_name: "Sarah Johnson",
    guest_email: "sarah.j@email.com",
    hotel_name: "The Ritz-Carlton",
    city: "Dubai",
    country: "UAE",
    check_in: "2026-03-25",
    check_out: "2026-03-30",
    nights: 5,
    rooms: 1,
    guests: 2,
    status: "confirmed",
    total_amount: 2450,
    currency: "USD",
    category: "couples",
    created_at: "2026-03-15T10:30:00Z",
  },
  {
    id: "BK-2026-002",
    guest_name: "Michael Chen",
    guest_email: "m.chen@email.com",
    hotel_name: "Burj Al Arab",
    city: "Dubai",
    country: "UAE",
    check_in: "2026-04-01",
    check_out: "2026-04-05",
    nights: 4,
    rooms: 1,
    guests: 1,
    status: "pending",
    total_amount: 3800,
    currency: "USD",
    category: "singles",
    created_at: "2026-03-18T14:20:00Z",
  },
  {
    id: "BK-2026-003",
    guest_name: "Emma Williams",
    guest_email: "emma.w@email.com",
    hotel_name: "Marina Bay Sands",
    city: "Singapore",
    country: "Singapore",
    check_in: "2026-03-10",
    check_out: "2026-03-14",
    nights: 4,
    rooms: 2,
    guests: 4,
    status: "completed",
    total_amount: 1920,
    currency: "USD",
    category: "families",
    created_at: "2026-02-28T09:15:00Z",
  },
  {
    id: "BK-2026-004",
    guest_name: "James Rodriguez",
    guest_email: "james.r@email.com",
    hotel_name: "Aman Tokyo",
    city: "Tokyo",
    country: "Japan",
    check_in: "2026-03-20",
    check_out: "2026-03-23",
    nights: 3,
    rooms: 1,
    guests: 2,
    status: "confirmed",
    total_amount: 2100,
    currency: "USD",
    category: "couples",
    created_at: "2026-03-10T16:45:00Z",
  },
  {
    id: "BK-2026-005",
    guest_name: "Priya Patel",
    guest_email: "priya.p@email.com",
    hotel_name: "Raffles Hotel",
    city: "Singapore",
    country: "Singapore",
    check_in: "2026-02-15",
    check_out: "2026-02-18",
    nights: 3,
    rooms: 1,
    guests: 1,
    status: "completed",
    total_amount: 1350,
    currency: "USD",
    category: "singles",
    created_at: "2026-02-01T11:00:00Z",
  },
  {
    id: "BK-2026-006",
    guest_name: "Oliver Thompson",
    guest_email: "oliver.t@email.com",
    hotel_name: "Four Seasons Bali",
    city: "Bali",
    country: "Indonesia",
    check_in: "2026-03-28",
    check_out: "2026-04-04",
    nights: 7,
    rooms: 1,
    guests: 2,
    status: "confirmed",
    total_amount: 3150,
    currency: "USD",
    category: "couples",
    created_at: "2026-03-12T08:30:00Z",
  },
  {
    id: "BK-2026-007",
    guest_name: "Lisa Park",
    guest_email: "lisa.park@email.com",
    hotel_name: "Mandarin Oriental",
    city: "Bangkok",
    country: "Thailand",
    check_in: "2026-03-05",
    check_out: "2026-03-08",
    nights: 3,
    rooms: 1,
    guests: 2,
    status: "cancelled",
    total_amount: 890,
    currency: "USD",
    category: "couples",
    created_at: "2026-02-20T13:10:00Z",
  },
  {
    id: "BK-2026-008",
    guest_name: "David Kim",
    guest_email: "david.kim@email.com",
    hotel_name: "The Peninsula",
    city: "Hong Kong",
    country: "China",
    check_in: "2026-04-10",
    check_out: "2026-04-13",
    nights: 3,
    rooms: 1,
    guests: 1,
    status: "pending",
    total_amount: 1680,
    currency: "USD",
    category: "singles",
    created_at: "2026-03-20T17:00:00Z",
  },
  {
    id: "BK-2026-009",
    guest_name: "Ana Garcia",
    guest_email: "ana.g@email.com",
    hotel_name: "Atlantis The Royal",
    city: "Dubai",
    country: "UAE",
    check_in: "2026-02-20",
    check_out: "2026-02-25",
    nights: 5,
    rooms: 2,
    guests: 5,
    status: "completed",
    total_amount: 4200,
    currency: "USD",
    category: "families",
    created_at: "2026-02-05T10:00:00Z",
  },
  {
    id: "BK-2026-010",
    guest_name: "Robert Wilson",
    guest_email: "r.wilson@email.com",
    hotel_name: "Park Hyatt",
    city: "Tokyo",
    country: "Japan",
    check_in: "2026-03-01",
    check_out: "2026-03-03",
    nights: 2,
    rooms: 1,
    guests: 1,
    status: "no-show",
    total_amount: 980,
    currency: "USD",
    category: "singles",
    created_at: "2026-02-15T15:30:00Z",
  },
  {
    id: "BK-2026-011",
    guest_name: "Sophie Martin",
    guest_email: "sophie.m@email.com",
    hotel_name: "Shangri-La",
    city: "Bangkok",
    country: "Thailand",
    check_in: "2026-04-15",
    check_out: "2026-04-20",
    nights: 5,
    rooms: 1,
    guests: 2,
    status: "confirmed",
    total_amount: 1250,
    currency: "USD",
    category: "couples",
    created_at: "2026-03-19T12:00:00Z",
  },
  {
    id: "BK-2026-012",
    guest_name: "Ahmed Hassan",
    guest_email: "ahmed.h@email.com",
    hotel_name: "Taj Mahal Palace",
    city: "Mumbai",
    country: "India",
    check_in: "2026-03-18",
    check_out: "2026-03-22",
    nights: 4,
    rooms: 2,
    guests: 4,
    status: "confirmed",
    total_amount: 1800,
    currency: "USD",
    category: "families",
    created_at: "2026-03-05T09:45:00Z",
  },
];

const statusConfig: Record<
  Booking["status"],
  { label: string; bg: string; text: string; dot: string }
> = {
  confirmed: { label: "Confirmed", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  completed: { label: "Completed", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  cancelled: { label: "Cancelled", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  pending: { label: "Pending", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  "no-show": { label: "No Show", bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
};

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

type SortField = "created_at" | "check_in" | "total_amount" | "guest_name";
type SortDir = "asc" | "desc";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Sorting
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Detail modal
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      // Try API first, fall back to mock data
      try {
        const res = await getBookings();
        setBookings(res.bookings || []);
      } catch {
        // API not available yet — use mock data
        setBookings(MOCK_BOOKINGS);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Unique cities for filter dropdown
  const cities = useMemo(
    () => [...new Set(bookings.map((b) => b.city))].sort(),
    [bookings]
  );

  // Filtered + sorted bookings
  const filtered = useMemo(() => {
    let result = bookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (categoryFilter !== "all" && b.category !== categoryFilter) return false;
      if (cityFilter !== "all" && b.city !== cityFilter) return false;
      if (dateFrom && b.check_in < dateFrom) return false;
      if (dateTo && b.check_out > dateTo) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          b.id.toLowerCase().includes(q) ||
          b.guest_name.toLowerCase().includes(q) ||
          b.guest_email.toLowerCase().includes(q) ||
          b.hotel_name.toLowerCase().includes(q)
        );
      }
      return true;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "total_amount") {
        cmp = a.total_amount - b.total_amount;
      } else if (sortField === "guest_name") {
        cmp = a.guest_name.localeCompare(b.guest_name);
      } else {
        cmp = a[sortField].localeCompare(b[sortField]);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [bookings, searchQuery, statusFilter, categoryFilter, cityFilter, dateFrom, dateTo, sortField, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, categoryFilter, cityFilter, dateFrom, dateTo]);

  // Summary stats
  const totalRevenue = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((s, b) => s + b.total_amount, 0);
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;
  const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) {
      return (
        <svg className="w-3.5 h-3.5 text-slate-300 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return (
      <svg className="w-3.5 h-3.5 text-indigo-500 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDir === "asc" ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
      </svg>
    );
  }

  const activeFilterCount = [
    statusFilter !== "all",
    categoryFilter !== "all",
    cityFilter !== "all",
    !!dateFrom,
    !!dateTo,
  ].filter(Boolean).length;

  function clearFilters() {
    setSearchQuery("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setCityFilter("all");
    setDateFrom("");
    setDateTo("");
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Booking History</h2>
        <p className="text-slate-500 mt-1">
          View and filter all booking records across hotels and cities.
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
                <span className="text-sm font-medium text-slate-500">Total Bookings</span>
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{bookings.length}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500">Revenue</span>
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500">Confirmed / Completed</span>
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {confirmedCount}
                <span className="text-sm font-normal text-slate-400 mx-1">/</span>
                {completedCount}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500">Cancelled</span>
                <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-red-600">{cancelledCount}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
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
                  placeholder="Search by ID, guest, email, or hotel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="all">All statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>

              {/* Category filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="all">All categories</option>
                <option value="singles">Singles</option>
                <option value="couples">Couples</option>
                <option value="families">Families</option>
              </select>

              {/* City filter */}
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="all">All cities</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Date range row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-3">
              <span className="text-xs font-medium text-slate-500 shrink-0">Check-in range:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium ml-auto"
                >
                  Clear all filters ({activeFilterCount})
                </button>
              )}
            </div>
          </div>

          {/* Results info */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-500">
              Showing {filtered.length === 0 ? 0 : (page - 1) * perPage + 1}–
              {Math.min(page * perPage, filtered.length)} of {filtered.length} bookings
            </span>
          </div>

          {/* Bookings table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {filtered.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm">No bookings match your filters.</p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left">
                      <th className="px-5 py-3 font-medium text-slate-500">Booking ID</th>
                      <th
                        className="px-5 py-3 font-medium text-slate-500 cursor-pointer select-none hover:text-slate-700"
                        onClick={() => handleSort("guest_name")}
                      >
                        Guest <SortIcon field="guest_name" />
                      </th>
                      <th className="px-5 py-3 font-medium text-slate-500">Hotel</th>
                      <th className="px-5 py-3 font-medium text-slate-500">City</th>
                      <th
                        className="px-5 py-3 font-medium text-slate-500 cursor-pointer select-none hover:text-slate-700"
                        onClick={() => handleSort("check_in")}
                      >
                        Check-in <SortIcon field="check_in" />
                      </th>
                      <th className="px-5 py-3 font-medium text-slate-500">Nights</th>
                      <th className="px-5 py-3 font-medium text-slate-500">Category</th>
                      <th className="px-5 py-3 font-medium text-slate-500">Status</th>
                      <th
                        className="px-5 py-3 font-medium text-slate-500 text-right cursor-pointer select-none hover:text-slate-700"
                        onClick={() => handleSort("total_amount")}
                      >
                        Amount <SortIcon field="total_amount" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginated.map((booking) => {
                      const sc = statusConfig[booking.status];
                      return (
                        <tr
                          key={booking.id}
                          className="hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <td className="px-5 py-3 font-mono text-xs text-indigo-600 font-medium">
                            {booking.id}
                          </td>
                          <td className="px-5 py-3">
                            <div className="font-medium text-slate-900">{booking.guest_name}</div>
                            <div className="text-xs text-slate-400">{booking.guest_email}</div>
                          </td>
                          <td className="px-5 py-3 text-slate-700">{booking.hotel_name}</td>
                          <td className="px-5 py-3">
                            <span className="text-slate-700">{booking.city}</span>
                            <span className="text-xs text-slate-400 ml-1">{booking.country}</span>
                          </td>
                          <td className="px-5 py-3 text-slate-700 whitespace-nowrap">
                            {formatDate(booking.check_in)}
                          </td>
                          <td className="px-5 py-3 text-slate-700 text-center">{booking.nights}</td>
                          <td className="px-5 py-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[booking.category] || "bg-slate-100 text-slate-600"}`}
                            >
                              {categoryLabels[booking.category] || booking.category}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                              {sc.label}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right font-mono font-semibold text-slate-900">
                            {formatCurrency(booking.total_amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium ${
                        p === page
                          ? "bg-indigo-600 text-white"
                          : "text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Booking detail modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedBooking(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Booking Details</h3>
                <span className="font-mono text-sm text-indigo-600">{selectedBooking.id}</span>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Status badge */}
              <div className="flex items-center gap-3">
                {(() => {
                  const sc = statusConfig[selectedBooking.status];
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${sc.bg} ${sc.text}`}>
                      <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                  );
                })()}
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${categoryColors[selectedBooking.category]}`}>
                  {categoryLabels[selectedBooking.category]}
                </span>
              </div>

              {/* Guest info */}
              <div>
                <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Guest</h4>
                <p className="font-medium text-slate-900">{selectedBooking.guest_name}</p>
                <p className="text-sm text-slate-500">{selectedBooking.guest_email}</p>
              </div>

              {/* Hotel & location */}
              <div>
                <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Hotel</h4>
                <p className="font-medium text-slate-900">{selectedBooking.hotel_name}</p>
                <p className="text-sm text-slate-500">
                  {selectedBooking.city}, {selectedBooking.country}
                </p>
              </div>

              {/* Stay details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Check-in</h4>
                  <p className="text-sm font-medium text-slate-900">{formatDate(selectedBooking.check_in)}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Check-out</h4>
                  <p className="text-sm font-medium text-slate-900">{formatDate(selectedBooking.check_out)}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Nights</h4>
                  <p className="text-sm font-medium text-slate-900">{selectedBooking.nights}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Rooms</h4>
                  <p className="text-sm font-medium text-slate-900">{selectedBooking.rooms}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Guests</h4>
                  <p className="text-sm font-medium text-slate-900">{selectedBooking.guests}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Booked on</h4>
                  <p className="text-sm font-medium text-slate-900">{formatDate(selectedBooking.created_at)}</p>
                </div>
              </div>

              {/* Total */}
              <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Total Amount</span>
                <span className="text-xl font-bold text-slate-900">
                  {formatCurrency(selectedBooking.total_amount)}
                  <span className="text-xs font-normal text-slate-400 ml-1">{selectedBooking.currency}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
