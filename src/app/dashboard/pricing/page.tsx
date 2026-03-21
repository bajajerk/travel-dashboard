"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getMarkupSettings,
  upsertMarkupSetting,
  updateMarkupSetting,
  deleteMarkupSetting,
  getCities,
  searchHotels,
  MarkupSetting,
  City,
  Hotel,
} from "@/lib/api";
import { useToast } from "@/lib/toast";

// TODO: Backend endpoints need to be implemented before this page is fully functional.
// Required endpoints:
//   GET    /api/admin/markup-settings
//   POST   /api/admin/markup-settings
//   PUT    /api/admin/markup-settings/:id
//   DELETE /api/admin/markup-settings/:id
//
// Required Supabase table:
//   CREATE TABLE IF NOT EXISTS markup_settings (
//     id bigserial PRIMARY KEY,
//     scope text NOT NULL CHECK (scope IN ('global', 'city', 'hotel')),
//     scope_key text,
//     markup_pct real NOT NULL DEFAULT 25.0,
//     display_name text,
//     updated_at timestamptz DEFAULT now(),
//     UNIQUE(scope, scope_key)
//   );

export default function PricingPage() {
  const { toast } = useToast();

  const [settings, setSettings] = useState<MarkupSetting[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(true);

  // Global markup
  const [globalMarkup, setGlobalMarkup] = useState(25);
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [globalDirty, setGlobalDirty] = useState(false);

  // City override modal
  const [showCityModal, setShowCityModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [cityMarkup, setCityMarkup] = useState(25);
  const [savingCity, setSavingCity] = useState(false);

  // Hotel override
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [hotelSearchQuery, setHotelSearchQuery] = useState("");
  const [hotelSearchResults, setHotelSearchResults] = useState<Hotel[]>([]);
  const [searchingHotels, setSearchingHotels] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [hotelMarkup, setHotelMarkup] = useState(25);
  const [savingHotel, setSavingHotel] = useState(false);

  // Edit modal
  const [editTarget, setEditTarget] = useState<MarkupSetting | null>(null);
  const [editMarkup, setEditMarkup] = useState(25);
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<MarkupSetting | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [settingsRes, citiesRes] = await Promise.allSettled([
        getMarkupSettings(),
        getCities(),
      ]);

      if (citiesRes.status === "fulfilled") {
        setCities(citiesRes.value.cities || []);
      }

      if (settingsRes.status === "fulfilled") {
        const all = settingsRes.value.settings || [];
        setSettings(all);
        const globalSetting = all.find((s) => s.scope === "global");
        if (globalSetting) {
          setGlobalMarkup(globalSetting.markup_pct);
        }
        setApiAvailable(true);
      } else {
        setApiAvailable(false);
      }
    } catch {
      setApiAvailable(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const cityOverrides = settings.filter((s) => s.scope === "city");
  const hotelOverrides = settings.filter((s) => s.scope === "hotel");

  async function handleSaveGlobal() {
    setSavingGlobal(true);
    try {
      await upsertMarkupSetting({
        scope: "global",
        scope_key: null,
        markup_pct: globalMarkup,
        display_name: "Global Default",
      });
      toast("Global markup updated");
      setGlobalDirty(false);
      await fetchData();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save global markup", "error");
    } finally {
      setSavingGlobal(false);
    }
  }

  async function handleSaveCityOverride(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCity) return;
    setSavingCity(true);
    const city = cities.find((c) => c.slug === selectedCity);
    try {
      await upsertMarkupSetting({
        scope: "city",
        scope_key: selectedCity,
        markup_pct: cityMarkup,
        display_name: city?.name || selectedCity,
      });
      toast("City override saved");
      setShowCityModal(false);
      setSelectedCity("");
      setCityMarkup(25);
      await fetchData();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save city override", "error");
    } finally {
      setSavingCity(false);
    }
  }

  async function handleHotelSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!hotelSearchQuery.trim()) return;
    setSearchingHotels(true);
    try {
      const result = await searchHotels(hotelSearchQuery);
      setHotelSearchResults(result.hotels || []);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Hotel search failed", "error");
    } finally {
      setSearchingHotels(false);
    }
  }

  async function handleSaveHotelOverride() {
    if (!selectedHotel) return;
    setSavingHotel(true);
    try {
      await upsertMarkupSetting({
        scope: "hotel",
        scope_key: selectedHotel.hotel_id,
        markup_pct: hotelMarkup,
        display_name: selectedHotel.name,
      });
      toast("Hotel override saved");
      setShowHotelModal(false);
      setSelectedHotel(null);
      setHotelSearchQuery("");
      setHotelSearchResults([]);
      setHotelMarkup(25);
      await fetchData();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save hotel override", "error");
    } finally {
      setSavingHotel(false);
    }
  }

  async function handleEditSave() {
    if (!editTarget) return;
    setSavingEdit(true);
    try {
      await updateMarkupSetting(editTarget.id, { markup_pct: editMarkup });
      toast("Markup updated");
      setEditTarget(null);
      await fetchData();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update", "error");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMarkupSetting(deleteTarget.id);
      toast("Override removed");
      setDeleteTarget(null);
      await fetchData();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete", "error");
    } finally {
      setDeleting(false);
    }
  }

  function calcExample(markup: number) {
    const b2bRate = 8000;
    const otaPrice = Math.round(b2bRate * (1 + markup / 100));
    const savings = otaPrice - b2bRate;
    return { b2bRate, otaPrice, savings };
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Markup & Pricing Control</h2>
        <p className="text-slate-500 mt-1">
          Control the markup percentage applied to B2B rates. Higher markup = larger perceived savings for customers.
        </p>
      </div>

      {/* API Notice */}
      {!apiAvailable && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-6 text-sm flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <p className="font-semibold">Backend endpoints not yet available</p>
            <p className="mt-1">
              The markup settings API endpoints need to be created on the backend.
              This page is ready and will work once the endpoints are deployed.
              Currently showing the UI in preview mode.
            </p>
          </div>
        </div>
      )}

      {/* How It Works Card */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 p-6 mb-8">
        <h3 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          How Markup Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/70 rounded-lg p-4">
            <div className="text-slate-500 mb-1">B2B Rate (Our Cost)</div>
            <div className="text-xl font-bold text-slate-900">&#8377;8,000</div>
          </div>
          <div className="bg-white/70 rounded-lg p-4">
            <div className="text-slate-500 mb-1">OTA Price (Shown as &quot;Market Rate&quot;)</div>
            <div className="text-xl font-bold text-red-600">&#8377;{calcExample(globalMarkup).otaPrice.toLocaleString()}</div>
            <div className="text-xs text-slate-400 mt-1">{globalMarkup}% markup applied</div>
          </div>
          <div className="bg-white/70 rounded-lg p-4">
            <div className="text-slate-500 mb-1">Customer Sees Savings</div>
            <div className="text-xl font-bold text-emerald-600">&#8377;{calcExample(globalMarkup).savings.toLocaleString()}</div>
            <div className="text-xs text-slate-400 mt-1">Perceived discount</div>
          </div>
        </div>
      </div>

      {/* Global Markup Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Global Markup</h3>
            <p className="text-sm text-slate-500 mt-0.5">Default markup percentage applied to all hotels across all cities.</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-indigo-600">{globalMarkup}%</div>
            <div className="text-xs text-slate-400">markup</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>5%</span>
            <span>Conservative</span>
            <span>Moderate</span>
            <span>Aggressive</span>
            <span>50%</span>
          </div>
          <input
            type="range"
            min={5}
            max={50}
            step={1}
            value={globalMarkup}
            onChange={(e) => {
              setGlobalMarkup(parseInt(e.target.value));
              setGlobalDirty(true);
            }}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex items-center gap-4 mt-4">
            <label className="text-sm font-medium text-slate-700">Exact value:</label>
            <input
              type="number"
              min={5}
              max={50}
              value={globalMarkup}
              onChange={(e) => {
                const val = Math.max(5, Math.min(50, parseInt(e.target.value) || 5));
                setGlobalMarkup(val);
                setGlobalDirty(true);
              }}
              className="w-20 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 text-center"
            />
            <span className="text-sm text-slate-400">%</span>
            {globalDirty && (
              <button
                onClick={handleSaveGlobal}
                disabled={savingGlobal}
                className="ml-auto inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {savingGlobal ? "Saving..." : "Save Global Markup"}
              </button>
            )}
          </div>
        </div>

        {/* Preview grid */}
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Preview at Different Rates</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[3000, 5000, 8000, 15000].map((rate) => {
              const otaPrice = Math.round(rate * (1 + globalMarkup / 100));
              return (
                <div key={rate} className="bg-white rounded-lg p-3 border border-slate-200">
                  <div className="text-xs text-slate-400">B2B: &#8377;{rate.toLocaleString()}</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    OTA: &#8377;{otaPrice.toLocaleString()}
                  </div>
                  <div className="text-xs text-emerald-600 font-medium mt-0.5">
                    Save &#8377;{(otaPrice - rate).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* City Overrides Section */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-slate-900">City Overrides</h3>
            <p className="text-sm text-slate-500 mt-0.5">Set different markup percentages for specific cities.</p>
          </div>
          <button
            onClick={() => {
              setShowCityModal(true);
              setSelectedCity("");
              setCityMarkup(globalMarkup);
            }}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add City Override
          </button>
        </div>

        {cityOverrides.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <p className="text-slate-500 font-medium">No city overrides</p>
            <p className="text-slate-400 text-sm mt-1">All cities use the global markup of {globalMarkup}%.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">City</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 w-32">Markup %</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 w-40">vs Global</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 w-40">Last Updated</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 w-40">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cityOverrides.map((setting) => {
                  const diff = setting.markup_pct - globalMarkup;
                  return (
                    <tr key={setting.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="text-sm font-semibold text-slate-900">{setting.display_name || setting.scope_key}</div>
                        <div className="text-xs text-slate-400">{setting.scope_key}</div>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className="inline-flex items-center justify-center min-w-[3rem] px-2.5 py-1 rounded-full text-sm font-bold bg-indigo-50 text-indigo-700">
                          {setting.markup_pct}%
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`text-xs font-medium ${diff > 0 ? "text-amber-600" : diff < 0 ? "text-emerald-600" : "text-slate-400"}`}>
                          {diff > 0 ? `+${diff}%` : diff < 0 ? `${diff}%` : "same"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-slate-500">
                        {setting.updated_at ? new Date(setting.updated_at).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditTarget(setting);
                              setEditMarkup(setting.markup_pct);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(setting)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove
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
      </div>

      {/* Hotel Overrides Section */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Hotel Overrides</h3>
            <p className="text-sm text-slate-500 mt-0.5">Set markup percentages for individual hotels (e.g., special deals).</p>
          </div>
          <button
            onClick={() => {
              setShowHotelModal(true);
              setSelectedHotel(null);
              setHotelSearchQuery("");
              setHotelSearchResults([]);
              setHotelMarkup(globalMarkup);
            }}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Hotel Override
          </button>
        </div>

        {hotelOverrides.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-slate-500 font-medium">No hotel overrides</p>
            <p className="text-slate-400 text-sm mt-1">All hotels use their city or global markup.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Hotel</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 w-32">Markup %</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 w-40">vs Global</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 w-40">Last Updated</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 w-40">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hotelOverrides.map((setting) => {
                  const diff = setting.markup_pct - globalMarkup;
                  return (
                    <tr key={setting.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="text-sm font-semibold text-slate-900">{setting.display_name || setting.scope_key}</div>
                        <div className="text-xs text-slate-400">ID: {setting.scope_key}</div>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className="inline-flex items-center justify-center min-w-[3rem] px-2.5 py-1 rounded-full text-sm font-bold bg-indigo-50 text-indigo-700">
                          {setting.markup_pct}%
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`text-xs font-medium ${diff > 0 ? "text-amber-600" : diff < 0 ? "text-emerald-600" : "text-slate-400"}`}>
                          {diff > 0 ? `+${diff}%` : diff < 0 ? `${diff}%` : "same"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-slate-500">
                        {setting.updated_at ? new Date(setting.updated_at).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditTarget(setting);
                              setEditMarkup(setting.markup_pct);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(setting)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove
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
      </div>

      {/* Markup Priority Info */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Markup Priority Order</h3>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <span className="text-slate-700 font-medium">Hotel Override</span>
          </div>
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-indigo-400 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <span className="text-slate-700 font-medium">City Override</span>
          </div>
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-indigo-200 text-indigo-800 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <span className="text-slate-700 font-medium">Global Default ({globalMarkup}%)</span>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-3">
          When calculating the display price, the system first checks for a hotel-specific override,
          then a city override, and finally falls back to the global default.
        </p>
      </div>

      {/* Add City Override Modal */}
      {showCityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowCityModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add City Override</h3>
              <button
                onClick={() => setShowCityModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSaveCityOverride} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  required
                >
                  <option value="">Select a city...</option>
                  {cities
                    .filter((c) => !cityOverrides.some((o) => o.scope_key === c.slug))
                    .map((city) => (
                      <option key={city.slug} value={city.slug}>
                        {city.name} ({city.country})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Markup Percentage
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={5}
                    max={50}
                    step={1}
                    value={cityMarkup}
                    onChange={(e) => setCityMarkup(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={5}
                      max={50}
                      value={cityMarkup}
                      onChange={(e) => setCityMarkup(Math.max(5, Math.min(50, parseInt(e.target.value) || 5)))}
                      className="w-16 px-2 py-1.5 border border-slate-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                    />
                    <span className="text-sm text-slate-400">%</span>
                  </div>
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Global default: {globalMarkup}% | Difference: {cityMarkup - globalMarkup > 0 ? "+" : ""}{cityMarkup - globalMarkup}%
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCityModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCity || !selectedCity}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 transition-colors"
                >
                  {savingCity ? "Saving..." : "Save Override"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Hotel Override Modal */}
      {showHotelModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowHotelModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[70vh] flex flex-col">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Add Hotel Override</h3>
                <button
                  onClick={() => setShowHotelModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {selectedHotel ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{selectedHotel.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {selectedHotel.city && `${selectedHotel.city} `}
                        {selectedHotel.stars && `| ${selectedHotel.stars}★ `}
                        | ID: {selectedHotel.hotel_id}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedHotel(null);
                        setHotelSearchResults([]);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Change
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Markup Percentage
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={5}
                        max={50}
                        step={1}
                        value={hotelMarkup}
                        onChange={(e) => setHotelMarkup(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={5}
                          max={50}
                          value={hotelMarkup}
                          onChange={(e) => setHotelMarkup(Math.max(5, Math.min(50, parseInt(e.target.value) || 5)))}
                          className="w-16 px-2 py-1.5 border border-slate-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                        />
                        <span className="text-sm text-slate-400">%</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      Global default: {globalMarkup}% | Difference: {hotelMarkup - globalMarkup > 0 ? "+" : ""}{hotelMarkup - globalMarkup}%
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setShowHotelModal(false)}
                      className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveHotelOverride}
                      disabled={savingHotel}
                      className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 transition-colors"
                    >
                      {savingHotel ? "Saving..." : "Save Override"}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleHotelSearch} className="flex gap-3">
                  <input
                    type="text"
                    value={hotelSearchQuery}
                    onChange={(e) => setHotelSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                    placeholder="Search for a hotel..."
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={searchingHotels}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {searchingHotels ? "..." : "Search"}
                  </button>
                </form>
              )}
            </div>

            {!selectedHotel && (
              <div className="flex-1 overflow-y-auto p-6">
                {hotelSearchResults.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    {searchingHotels
                      ? "Searching..."
                      : hotelSearchQuery
                      ? "No results found"
                      : "Search for a hotel to set a custom markup"}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {hotelSearchResults.map((hotel) => (
                      <button
                        key={hotel.hotel_id}
                        onClick={() => {
                          setSelectedHotel(hotel);
                          setHotelMarkup(globalMarkup);
                        }}
                        className="w-full text-left flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">
                            {hotel.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                            {hotel.stars && <span>{hotel.stars}★</span>}
                            {hotel.city && <span>{hotel.city}</span>}
                            <span className="text-slate-400">ID: {hotel.hotel_id}</span>
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-slate-400 shrink-0 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setEditTarget(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Edit Markup</h3>
            <p className="text-sm text-slate-500 mb-4">
              {editTarget.display_name || editTarget.scope_key}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Markup Percentage
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={5}
                    max={50}
                    step={1}
                    value={editMarkup}
                    onChange={(e) => setEditMarkup(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={5}
                      max={50}
                      value={editMarkup}
                      onChange={(e) => setEditMarkup(Math.max(5, Math.min(50, parseInt(e.target.value) || 5)))}
                      className="w-16 px-2 py-1.5 border border-slate-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                    />
                    <span className="text-sm text-slate-400">%</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setEditTarget(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={savingEdit}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 transition-colors"
                >
                  {savingEdit ? "Saving..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Remove Override</h3>
              <p className="text-sm text-slate-500 mb-6">
                Remove the markup override for <strong>{deleteTarget.display_name || deleteTarget.scope_key}</strong>?
                It will revert to using the {deleteTarget.scope === "hotel" ? "city or " : ""}global default.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-colors"
                >
                  {deleting ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
