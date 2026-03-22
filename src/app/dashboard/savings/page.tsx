"use client";

import { useState, useMemo } from "react";

interface BookingWithSavings {
  id: string;
  guest_name: string;
  guest_email: string;
  hotel_name: string;
  city: string;
  check_in: string;
  check_out: string;
  nights: number;
  status: "confirmed" | "completed" | "cancelled" | "pending" | "no-show";
  total_amount: number;
  retail_amount: number;
  currency: string;
  category: "singles" | "couples" | "families";
}

// Mock bookings with retail vs preferred pricing — replace with API once backend supports it
const MOCK_BOOKINGS_WITH_SAVINGS: BookingWithSavings[] = [
  {
    id: "BK-2026-001",
    guest_name: "Sarah Johnson",
    guest_email: "sarah.j@email.com",
    hotel_name: "The Ritz-Carlton",
    city: "Dubai",
    check_in: "2026-03-25",
    check_out: "2026-03-30",
    nights: 5,
    status: "confirmed",
    total_amount: 2450,
    retail_amount: 3200,
    currency: "USD",
    category: "couples",
  },
  {
    id: "BK-2026-002",
    guest_name: "Michael Chen",
    guest_email: "m.chen@email.com",
    hotel_name: "Burj Al Arab",
    city: "Dubai",
    check_in: "2026-04-01",
    check_out: "2026-04-05",
    nights: 4,
    status: "pending",
    total_amount: 3800,
    retail_amount: 5100,
    currency: "USD",
    category: "singles",
  },
  {
    id: "BK-2026-003",
    guest_name: "Emma Williams",
    guest_email: "emma.w@email.com",
    hotel_name: "Marina Bay Sands",
    city: "Singapore",
    check_in: "2026-03-10",
    check_out: "2026-03-14",
    nights: 4,
    status: "completed",
    total_amount: 1920,
    retail_amount: 2500,
    currency: "USD",
    category: "families",
  },
  {
    id: "BK-2026-004",
    guest_name: "James Rodriguez",
    guest_email: "james.r@email.com",
    hotel_name: "Aman Tokyo",
    city: "Tokyo",
    check_in: "2026-03-20",
    check_out: "2026-03-23",
    nights: 3,
    status: "confirmed",
    total_amount: 2100,
    retail_amount: 2800,
    currency: "USD",
    category: "couples",
  },
  {
    id: "BK-2026-005",
    guest_name: "Priya Patel",
    guest_email: "priya.p@email.com",
    hotel_name: "Raffles Hotel",
    city: "Singapore",
    check_in: "2026-02-15",
    check_out: "2026-02-18",
    nights: 3,
    status: "completed",
    total_amount: 1350,
    retail_amount: 1800,
    currency: "USD",
    category: "singles",
  },
  {
    id: "BK-2026-006",
    guest_name: "Sarah Johnson",
    guest_email: "sarah.j@email.com",
    hotel_name: "Four Seasons Bali",
    city: "Bali",
    check_in: "2026-01-10",
    check_out: "2026-01-17",
    nights: 7,
    status: "completed",
    total_amount: 3150,
    retail_amount: 4100,
    currency: "USD",
    category: "couples",
  },
  {
    id: "BK-2026-007",
    guest_name: "Michael Chen",
    guest_email: "m.chen@email.com",
    hotel_name: "Mandarin Oriental",
    city: "Bangkok",
    check_in: "2026-02-10",
    check_out: "2026-02-14",
    nights: 4,
    status: "completed",
    total_amount: 1080,
    retail_amount: 1440,
    currency: "USD",
    category: "singles",
  },
  {
    id: "BK-2026-008",
    guest_name: "David Kim",
    guest_email: "david.kim@email.com",
    hotel_name: "The Peninsula",
    city: "Hong Kong",
    check_in: "2026-04-10",
    check_out: "2026-04-13",
    nights: 3,
    status: "pending",
    total_amount: 1680,
    retail_amount: 2240,
    currency: "USD",
    category: "singles",
  },
  {
    id: "BK-2026-009",
    guest_name: "Emma Williams",
    guest_email: "emma.w@email.com",
    hotel_name: "Atlantis The Royal",
    city: "Dubai",
    check_in: "2026-02-20",
    check_out: "2026-02-25",
    nights: 5,
    status: "completed",
    total_amount: 4200,
    retail_amount: 5600,
    currency: "USD",
    category: "families",
  },
  {
    id: "BK-2026-010",
    guest_name: "Priya Patel",
    guest_email: "priya.p@email.com",
    hotel_name: "Park Hyatt",
    city: "Tokyo",
    check_in: "2026-03-01",
    check_out: "2026-03-03",
    nights: 2,
    status: "completed",
    total_amount: 980,
    retail_amount: 1300,
    currency: "USD",
    category: "singles",
  },
  {
    id: "BK-2026-011",
    guest_name: "James Rodriguez",
    guest_email: "james.r@email.com",
    hotel_name: "Shangri-La",
    city: "Bangkok",
    check_in: "2026-04-15",
    check_out: "2026-04-20",
    nights: 5,
    status: "confirmed",
    total_amount: 1250,
    retail_amount: 1650,
    currency: "USD",
    category: "couples",
  },
  {
    id: "BK-2026-012",
    guest_name: "Ahmed Hassan",
    guest_email: "ahmed.h@email.com",
    hotel_name: "Taj Mahal Palace",
    city: "Mumbai",
    check_in: "2026-03-18",
    check_out: "2026-03-22",
    nights: 4,
    status: "confirmed",
    total_amount: 1800,
    retail_amount: 2400,
    currency: "USD",
    category: "families",
  },
  {
    id: "BK-2026-013",
    guest_name: "David Kim",
    guest_email: "david.kim@email.com",
    hotel_name: "Conrad Maldives",
    city: "Maldives",
    check_in: "2026-01-20",
    check_out: "2026-01-26",
    nights: 6,
    status: "completed",
    total_amount: 5400,
    retail_amount: 7200,
    currency: "USD",
    category: "couples",
  },
  {
    id: "BK-2026-014",
    guest_name: "Ahmed Hassan",
    guest_email: "ahmed.h@email.com",
    hotel_name: "The Oberoi",
    city: "Mumbai",
    check_in: "2026-01-05",
    check_out: "2026-01-08",
    nights: 3,
    status: "completed",
    total_amount: 1050,
    retail_amount: 1400,
    currency: "USD",
    category: "families",
  },
  {
    id: "BK-2026-015",
    guest_name: "Sarah Johnson",
    guest_email: "sarah.j@email.com",
    hotel_name: "Aman Tokyo",
    city: "Tokyo",
    check_in: "2026-02-05",
    check_out: "2026-02-08",
    nights: 3,
    status: "completed",
    total_amount: 2100,
    retail_amount: 2800,
    currency: "USD",
    category: "couples",
  },
];

interface UserSavings {
  guest_name: string;
  guest_email: string;
  total_bookings: number;
  completed_bookings: number;
  total_spent: number;
  total_retail: number;
  total_savings: number;
  savings_pct: number;
  avg_savings_per_booking: number;
  cities: string[];
}

type SortField = "total_savings" | "total_bookings" | "savings_pct" | "total_spent" | "guest_name";
type SortDir = "asc" | "desc";

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function SavingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("total_savings");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  // Aggregate savings per user
  const userSavings = useMemo(() => {
    const map = new Map<string, UserSavings>();

    for (const b of MOCK_BOOKINGS_WITH_SAVINGS) {
      // Skip cancelled bookings for savings calculation
      if (b.status === "cancelled" || b.status === "no-show") continue;

      const key = b.guest_email;
      const existing = map.get(key);
      const savings = b.retail_amount - b.total_amount;

      if (existing) {
        existing.total_bookings += 1;
        if (b.status === "completed") existing.completed_bookings += 1;
        existing.total_spent += b.total_amount;
        existing.total_retail += b.retail_amount;
        existing.total_savings += savings;
        if (!existing.cities.includes(b.city)) existing.cities.push(b.city);
      } else {
        map.set(key, {
          guest_name: b.guest_name,
          guest_email: b.guest_email,
          total_bookings: 1,
          completed_bookings: b.status === "completed" ? 1 : 0,
          total_spent: b.total_amount,
          total_retail: b.retail_amount,
          total_savings: savings,
          savings_pct: 0,
          avg_savings_per_booking: 0,
          cities: [b.city],
        });
      }
    }

    // Calculate derived fields
    for (const user of map.values()) {
      user.savings_pct = user.total_retail > 0 ? (user.total_savings / user.total_retail) * 100 : 0;
      user.avg_savings_per_booking = user.total_bookings > 0 ? user.total_savings / user.total_bookings : 0;
    }

    return Array.from(map.values());
  }, []);

  // Filter
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return userSavings;
    const q = searchQuery.toLowerCase();
    return userSavings.filter(
      (u) =>
        u.guest_name.toLowerCase().includes(q) ||
        u.guest_email.toLowerCase().includes(q) ||
        u.cities.some((c) => c.toLowerCase().includes(q))
    );
  }, [userSavings, searchQuery]);

  // Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "guest_name":
          cmp = a.guest_name.localeCompare(b.guest_name);
          break;
        case "total_savings":
          cmp = a.total_savings - b.total_savings;
          break;
        case "total_bookings":
          cmp = a.total_bookings - b.total_bookings;
          break;
        case "savings_pct":
          cmp = a.savings_pct - b.savings_pct;
          break;
        case "total_spent":
          cmp = a.total_spent - b.total_spent;
          break;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
  }, [filtered, sortField, sortDir]);

  // Summary stats
  const stats = useMemo(() => {
    const totalUsers = userSavings.length;
    const totalSavings = userSavings.reduce((s, u) => s + u.total_savings, 0);
    const totalRetail = userSavings.reduce((s, u) => s + u.total_retail, 0);
    const avgSavingsPct = totalRetail > 0 ? (totalSavings / totalRetail) * 100 : 0;
    const topSaver = userSavings.reduce(
      (max, u) => (u.total_savings > max.total_savings ? u : max),
      userSavings[0] || { guest_name: "-", total_savings: 0 }
    );
    return { totalUsers, totalSavings, avgSavingsPct, topSaver };
  }, [userSavings]);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) {
      return (
        <svg className="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDir === "desc" ? (
      <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    ) : (
      <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    );
  }

  // Get bookings for a specific user
  function getUserBookings(email: string) {
    return MOCK_BOOKINGS_WITH_SAVINGS.filter(
      (b) => b.guest_email === email && b.status !== "cancelled" && b.status !== "no-show"
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Total Savings per User</h2>
        <p className="text-slate-500 mt-1">
          Track how much each user saves with preferred rates vs retail pricing.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-500">Total Users</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalUsers}</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-500">Total Savings</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalSavings)}</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-500">Avg Savings %</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.avgSavingsPct.toFixed(1)}%</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-500">Top Saver</span>
            <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 truncate">{stats.topSaver.guest_name}</div>
          <div className="text-sm text-emerald-600 font-medium">{formatCurrency(stats.topSaver.total_savings)} saved</div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="relative">
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
            placeholder="Search by name, email, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3">
                  <button
                    onClick={() => handleSort("guest_name")}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700"
                  >
                    User
                    <SortIcon field="guest_name" />
                  </button>
                </th>
                <th className="text-left px-5 py-3">
                  <button
                    onClick={() => handleSort("total_bookings")}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700"
                  >
                    Bookings
                    <SortIcon field="total_bookings" />
                  </button>
                </th>
                <th className="text-left px-5 py-3">
                  <button
                    onClick={() => handleSort("total_spent")}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700"
                  >
                    Amount Paid
                    <SortIcon field="total_spent" />
                  </button>
                </th>
                <th className="text-left px-5 py-3">
                  <button
                    onClick={() => handleSort("total_savings")}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700"
                  >
                    Total Savings
                    <SortIcon field="total_savings" />
                  </button>
                </th>
                <th className="text-left px-5 py-3">
                  <button
                    onClick={() => handleSort("savings_pct")}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700"
                  >
                    Savings %
                    <SortIcon field="savings_pct" />
                  </button>
                </th>
                <th className="text-left px-5 py-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cities</span>
                </th>
                <th className="text-left px-5 py-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                sorted.map((user) => (
                  <UserRow
                    key={user.guest_email}
                    user={user}
                    expanded={expandedUser === user.guest_email}
                    onToggle={() =>
                      setExpandedUser(expandedUser === user.guest_email ? null : user.guest_email)
                    }
                    bookings={getUserBookings(user.guest_email)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-5 py-3 bg-slate-50 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            {sorted.length} user{sorted.length !== 1 ? "s" : ""}
          </span>
          <span className="text-sm font-medium text-emerald-600">
            Combined savings: {formatCurrency(sorted.reduce((s, u) => s + u.total_savings, 0))}
          </span>
        </div>
      </div>
    </div>
  );
}

function UserRow({
  user,
  expanded,
  onToggle,
  bookings,
}: {
  user: UserSavings;
  expanded: boolean;
  onToggle: () => void;
  bookings: BookingWithSavings[];
}) {
  return (
    <>
      <tr className="hover:bg-slate-50 transition-colors">
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm shrink-0">
              {user.guest_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-slate-900 truncate">{user.guest_name}</div>
              <div className="text-xs text-slate-400 truncate">{user.guest_email}</div>
            </div>
          </div>
        </td>
        <td className="px-5 py-4">
          <span className="text-sm text-slate-700">{user.total_bookings}</span>
          {user.completed_bookings > 0 && (
            <span className="text-xs text-slate-400 ml-1">
              ({user.completed_bookings} completed)
            </span>
          )}
        </td>
        <td className="px-5 py-4">
          <div className="text-sm font-medium text-slate-900">{formatCurrency(user.total_spent)}</div>
          <div className="text-xs text-slate-400">
            Retail: {formatCurrency(user.total_retail)}
          </div>
        </td>
        <td className="px-5 py-4">
          <span className="text-sm font-semibold text-emerald-600">
            {formatCurrency(user.total_savings)}
          </span>
        </td>
        <td className="px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${Math.min(user.savings_pct * 2, 100)}%` }}
              />
            </div>
            <span className="text-sm text-slate-700">{user.savings_pct.toFixed(1)}%</span>
          </div>
        </td>
        <td className="px-5 py-4">
          <div className="flex flex-wrap gap-1">
            {user.cities.map((city) => (
              <span
                key={city}
                className="inline-block px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded"
              >
                {city}
              </span>
            ))}
          </div>
        </td>
        <td className="px-5 py-4">
          <button
            onClick={onToggle}
            className="text-slate-400 hover:text-indigo-600 transition-colors"
            title={expanded ? "Collapse" : "Expand bookings"}
          >
            <svg
              className={`w-5 h-5 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7} className="bg-slate-50/70 px-5 py-3">
            <div className="ml-12">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Booking Breakdown
              </div>
              <div className="space-y-2">
                {bookings.map((b) => {
                  const savings = b.retail_amount - b.total_amount;
                  const pct = b.retail_amount > 0 ? (savings / b.retail_amount) * 100 : 0;
                  return (
                    <div
                      key={b.id}
                      className="flex items-center justify-between bg-white rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="text-slate-400 text-xs font-mono">{b.id}</span>
                        <span className="font-medium text-slate-900 truncate">{b.hotel_name}</span>
                        <span className="text-slate-400">{b.city}</span>
                        <span className="text-xs text-slate-400">
                          {b.check_in} &rarr; {b.check_out} ({b.nights}n)
                        </span>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="text-slate-500">
                          <span className="line-through text-slate-300 mr-1">
                            {formatCurrency(b.retail_amount)}
                          </span>
                          {formatCurrency(b.total_amount)}
                        </span>
                        <span className="font-medium text-emerald-600">
                          -{formatCurrency(savings)} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
