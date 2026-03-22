"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/lib/toast";

/* ── Types ─────────────────────────────────────────────── */

interface Profile {
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface Preferences {
  currency: string;
  timezone: string;
  dateFormat: string;
  rowsPerPage: number;
  emailNotifications: boolean;
  bookingAlerts: boolean;
  weeklyReport: boolean;
  darkMode: boolean;
}

interface Tier {
  name: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
  minBookings: number;
  benefits: string[];
}

const TIERS: Tier[] = [
  {
    name: "Bronze",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "🥉",
    minBookings: 0,
    benefits: [
      "Access to curated hotel listings",
      "Basic price comparison",
      "Email support",
    ],
  },
  {
    name: "Silver",
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-300",
    icon: "🥈",
    minBookings: 25,
    benefits: [
      "All Bronze benefits",
      "Priority customer support",
      "Exclusive city deals",
      "Rate lock for 48 hours",
    ],
  },
  {
    name: "Gold",
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-300",
    icon: "🥇",
    minBookings: 100,
    benefits: [
      "All Silver benefits",
      "Dedicated account manager",
      "Early access to new cities",
      "Custom markup tiers",
      "API access",
    ],
  },
  {
    name: "Platinum",
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-300",
    icon: "💎",
    minBookings: 500,
    benefits: [
      "All Gold benefits",
      "White-label dashboard",
      "Priority hotel curation",
      "Volume-based discounts",
      "24/7 phone support",
      "Custom integrations",
    ],
  },
];

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "AED", "SGD", "AUD", "CAD"];
const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Australia/Sydney",
];
const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
const ROWS_OPTIONS = [10, 25, 50, 100];

const STORAGE_KEY_PROFILE = "bmr_admin_profile";
const STORAGE_KEY_PREFS = "bmr_admin_prefs";

const DEFAULT_PROFILE: Profile = {
  name: "Admin",
  email: "admin@beatmyrate.com",
  phone: "",
  role: "Super Admin",
};

const DEFAULT_PREFS: Preferences = {
  currency: "USD",
  timezone: "UTC",
  dateFormat: "DD/MM/YYYY",
  rowsPerPage: 25,
  emailNotifications: true,
  bookingAlerts: true,
  weeklyReport: false,
  darkMode: false,
};

/* ── Helpers ───────────────────────────────────────────── */

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ── Component ─────────────────────────────────────────── */

export default function ProfilePage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "tiers">("profile");
  const [loading, setLoading] = useState(true);

  // Profile state
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState<Profile>(DEFAULT_PROFILE);

  // Preferences state
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);

  // Tier state
  const [currentTier, setCurrentTier] = useState(0); // index into TIERS
  const [totalBookings, setTotalBookings] = useState(42);

  useEffect(() => {
    const p = loadFromStorage(STORAGE_KEY_PROFILE, DEFAULT_PROFILE);
    const pr = loadFromStorage(STORAGE_KEY_PREFS, DEFAULT_PREFS);
    setProfile(p);
    setProfileDraft(p);
    setPrefs(pr);

    // Determine tier from bookings
    const bookings = 42; // simulated
    setTotalBookings(bookings);
    const tierIdx = TIERS.reduce(
      (best, t, i) => (bookings >= t.minBookings ? i : best),
      0
    );
    setCurrentTier(tierIdx);
    setLoading(false);
  }, []);

  /* ── Profile handlers ── */

  const saveProfile = useCallback(() => {
    setProfile(profileDraft);
    saveToStorage(STORAGE_KEY_PROFILE, profileDraft);
    setEditingProfile(false);
    toast("Profile updated successfully", "success");
  }, [profileDraft, toast]);

  const cancelProfileEdit = useCallback(() => {
    setProfileDraft(profile);
    setEditingProfile(false);
  }, [profile]);

  /* ── Preference handlers ── */

  const updatePref = useCallback(
    <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
      setPrefs((prev) => {
        const next = { ...prev, [key]: value };
        saveToStorage(STORAGE_KEY_PREFS, next);
        return next;
      });
    },
    []
  );

  /* ── Tabs ── */

  const tabs = [
    { id: "profile" as const, label: "Profile" },
    { id: "preferences" as const, label: "Preferences" },
    { id: "tiers" as const, label: "Tier View" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48 animate-pulse" />
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Profile & Preferences</h2>
        <p className="text-slate-500 mt-1">Manage your account settings and view tier status.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Profile Tab ── */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* Avatar + Name Banner */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600 shrink-0">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold text-slate-900">{profile.name}</h3>
                <p className="text-sm text-slate-500">{profile.role}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${TIERS[currentTier].bg} ${TIERS[currentTier].color} ${TIERS[currentTier].border} border`}
                  >
                    {TIERS[currentTier].icon} {TIERS[currentTier].name}
                  </span>
                </div>
              </div>
              {!editingProfile && (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Profile Fields */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h4 className="text-base font-semibold text-slate-900 mb-4">Account Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                {editingProfile ? (
                  <input
                    type="text"
                    value={profileDraft.name}
                    onChange={(e) => setProfileDraft({ ...profileDraft, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                ) : (
                  <p className="text-sm text-slate-900 py-2">{profile.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                {editingProfile ? (
                  <input
                    type="email"
                    value={profileDraft.email}
                    onChange={(e) => setProfileDraft({ ...profileDraft, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                ) : (
                  <p className="text-sm text-slate-900 py-2">{profile.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Phone</label>
                {editingProfile ? (
                  <input
                    type="tel"
                    value={profileDraft.phone}
                    onChange={(e) => setProfileDraft({ ...profileDraft, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                ) : (
                  <p className="text-sm text-slate-900 py-2">{profile.phone || "Not set"}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Role</label>
                <p className="text-sm text-slate-900 py-2">{profile.role}</p>
              </div>
            </div>

            {editingProfile && (
              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={saveProfile}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={cancelProfileEdit}
                  className="px-4 py-2 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h4 className="text-base font-semibold text-slate-900 mb-4">Security</h4>
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-900">Password</p>
                <p className="text-xs text-slate-500">Last changed: Never</p>
              </div>
              <button className="px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors">
                Change Password
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">Two-Factor Authentication</p>
                <p className="text-xs text-slate-500">Add an extra layer of security</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-500 rounded-full">
                Not Enabled
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Preferences Tab ── */}
      {activeTab === "preferences" && (
        <div className="space-y-6">
          {/* Display Settings */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h4 className="text-base font-semibold text-slate-900 mb-4">Display Settings</h4>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Currency</label>
                  <select
                    value={prefs.currency}
                    onChange={(e) => updatePref("currency", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Timezone</label>
                  <select
                    value={prefs.timezone}
                    onChange={(e) => updatePref("timezone", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Date Format</label>
                  <select
                    value={prefs.dateFormat}
                    onChange={(e) => updatePref("dateFormat", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                  >
                    {DATE_FORMATS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Rows Per Page
                  </label>
                  <select
                    value={prefs.rowsPerPage}
                    onChange={(e) => updatePref("rowsPerPage", Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                  >
                    {ROWS_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n} rows
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h4 className="text-base font-semibold text-slate-900 mb-4">Notifications</h4>
            <div className="space-y-4">
              <ToggleRow
                label="Email Notifications"
                description="Receive email updates about system changes"
                checked={prefs.emailNotifications}
                onChange={(v) => updatePref("emailNotifications", v)}
              />
              <ToggleRow
                label="Booking Alerts"
                description="Get notified when new bookings come in"
                checked={prefs.bookingAlerts}
                onChange={(v) => updatePref("bookingAlerts", v)}
              />
              <ToggleRow
                label="Weekly Report"
                description="Receive a weekly summary of dashboard activity"
                checked={prefs.weeklyReport}
                onChange={(v) => updatePref("weeklyReport", v)}
              />
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h4 className="text-base font-semibold text-slate-900 mb-4">Appearance</h4>
            <ToggleRow
              label="Dark Mode"
              description="Switch to dark theme (coming soon)"
              checked={prefs.darkMode}
              onChange={(v) => updatePref("darkMode", v)}
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                setPrefs(DEFAULT_PREFS);
                saveToStorage(STORAGE_KEY_PREFS, DEFAULT_PREFS);
                toast("Preferences reset to defaults", "success");
              }}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}

      {/* ── Tier View Tab ── */}
      {activeTab === "tiers" && (
        <div className="space-y-6">
          {/* Current Tier Summary */}
          <div
            className={`rounded-xl border-2 p-6 ${TIERS[currentTier].bg} ${TIERS[currentTier].border}`}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{TIERS[currentTier].icon}</span>
                  <h3 className={`text-2xl font-bold ${TIERS[currentTier].color}`}>
                    {TIERS[currentTier].name} Tier
                  </h3>
                </div>
                <p className="text-sm text-slate-600">
                  You have completed <span className="font-semibold">{totalBookings}</span> bookings.
                  {currentTier < TIERS.length - 1 && (
                    <>
                      {" "}
                      Reach{" "}
                      <span className="font-semibold">{TIERS[currentTier + 1].minBookings}</span>{" "}
                      bookings to unlock{" "}
                      <span className="font-semibold">{TIERS[currentTier + 1].name}</span>.
                    </>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 mb-1">Progress to Next Tier</p>
                <p className="text-lg font-bold text-slate-900">
                  {currentTier < TIERS.length - 1
                    ? `${totalBookings} / ${TIERS[currentTier + 1].minBookings}`
                    : "Max Tier"}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            {currentTier < TIERS.length - 1 && (
              <div className="mt-4">
                <div className="w-full bg-white/60 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        ((totalBookings - TIERS[currentTier].minBookings) /
                          (TIERS[currentTier + 1].minBookings - TIERS[currentTier].minBookings)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* All Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TIERS.map((tier, idx) => {
              const isCurrent = idx === currentTier;
              const isLocked = idx > currentTier;
              return (
                <div
                  key={tier.name}
                  className={`rounded-xl border p-5 transition-shadow ${
                    isCurrent
                      ? `${tier.border} ${tier.bg} shadow-md border-2`
                      : isLocked
                        ? "border-slate-200 bg-white opacity-60"
                        : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{tier.icon}</span>
                      <h4 className={`font-semibold ${isCurrent ? tier.color : "text-slate-900"}`}>
                        {tier.name}
                      </h4>
                    </div>
                    {isCurrent && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-indigo-600 text-white rounded-full">
                        Current
                      </span>
                    )}
                    {isLocked && (
                      <svg
                        className="w-4 h-4 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    {tier.minBookings === 0
                      ? "Starting tier"
                      : `${tier.minBookings}+ bookings required`}
                  </p>
                  <ul className="space-y-1.5">
                    {tier.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-slate-700">
                        <svg
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            isLocked ? "text-slate-300" : "text-emerald-500"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Tier History */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h4 className="text-base font-semibold text-slate-900 mb-4">Tier History</h4>
            <div className="space-y-3">
              {[
                { date: "Mar 2026", event: "Silver tier achieved", bookings: 25 },
                { date: "Jan 2026", event: "Account created — Bronze tier", bookings: 0 },
              ].map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 py-2 border-b border-slate-100 last:border-0"
                >
                  <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{entry.event}</p>
                    <p className="text-xs text-slate-500">{entry.date}</p>
                  </div>
                  <span className="text-xs text-slate-400">{entry.bookings} bookings</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Toggle Row subcomponent ── */

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? "bg-indigo-600" : "bg-slate-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
