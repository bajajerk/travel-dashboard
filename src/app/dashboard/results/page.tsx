"use client";

import { useState, useMemo } from "react";

// ---------- Types ----------
interface HotelResult {
  id: string;
  name: string;
  city: string;
  image: string;
  stars: number;
  rating: number;
  reviewCount: number;
  retailRate: number;
  voyagrRate: number;
  savingsAmount: number;
  savingsPct: number;
  favouriteScore: number;
  amenities: string[];
  perks: string[];
  instantConfirmation: boolean;
  lat: number;
  lng: number;
}

// ---------- Mock Data (24 hotels) ----------
const MOCK_HOTELS: HotelResult[] = [
  { id: "h-001", name: "The Oberoi Udaivilas", city: "Udaipur", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=480&h=320&fit=crop", stars: 5, rating: 4.9, reviewCount: 1243, retailRate: 38500, voyagrRate: 27200, savingsAmount: 11300, savingsPct: 29, favouriteScore: 98, amenities: ["Pool", "Spa", "Gym", "WiFi", "Restaurant"], perks: ["Free Breakfast", "Airport Transfer", "Late Checkout"], instantConfirmation: true, lat: 24.5764, lng: 73.6833 },
  { id: "h-002", name: "Taj Lake Palace", city: "Udaipur", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=480&h=320&fit=crop", stars: 5, rating: 4.8, reviewCount: 987, retailRate: 42000, voyagrRate: 31500, savingsAmount: 10500, savingsPct: 25, favouriteScore: 96, amenities: ["Pool", "Spa", "WiFi", "Restaurant", "Bar"], perks: ["Free Breakfast", "Boat Ride", "Late Checkout"], instantConfirmation: true, lat: 24.5752, lng: 73.6802 },
  { id: "h-003", name: "ITC Grand Chola", city: "Chennai", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=480&h=320&fit=crop", stars: 5, rating: 4.7, reviewCount: 2100, retailRate: 18500, voyagrRate: 12950, savingsAmount: 5550, savingsPct: 30, favouriteScore: 91, amenities: ["Pool", "Spa", "Gym", "WiFi", "Restaurant", "Bar"], perks: ["Free Breakfast", "Airport Transfer"], instantConfirmation: true, lat: 13.0105, lng: 80.2207 },
  { id: "h-004", name: "The Leela Palace", city: "Bengaluru", image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=480&h=320&fit=crop", stars: 5, rating: 4.8, reviewCount: 1890, retailRate: 22000, voyagrRate: 15400, savingsAmount: 6600, savingsPct: 30, favouriteScore: 94, amenities: ["Pool", "Spa", "Gym", "WiFi", "Restaurant", "Bar"], perks: ["Free Breakfast", "Spa Credit", "Late Checkout"], instantConfirmation: true, lat: 12.9611, lng: 77.6497 },
  { id: "h-005", name: "Rambagh Palace", city: "Jaipur", image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=480&h=320&fit=crop", stars: 5, rating: 4.9, reviewCount: 876, retailRate: 35000, voyagrRate: 24500, savingsAmount: 10500, savingsPct: 30, favouriteScore: 97, amenities: ["Pool", "Spa", "Gym", "WiFi", "Restaurant"], perks: ["Free Breakfast", "Heritage Walk", "Late Checkout"], instantConfirmation: true, lat: 26.8984, lng: 75.8062 },
  { id: "h-006", name: "Taj Mahal Palace", city: "Mumbai", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=480&h=320&fit=crop", stars: 5, rating: 4.8, reviewCount: 3200, retailRate: 28000, voyagrRate: 19600, savingsAmount: 8400, savingsPct: 30, favouriteScore: 95, amenities: ["Pool", "Spa", "Gym", "WiFi", "Restaurant", "Bar"], perks: ["Free Breakfast", "Airport Transfer", "Butler Service"], instantConfirmation: true, lat: 18.9217, lng: 72.8332 },
  { id: "h-007", name: "Wildflower Hall", city: "Shimla", image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=480&h=320&fit=crop", stars: 5, rating: 4.7, reviewCount: 654, retailRate: 32000, voyagrRate: 22400, savingsAmount: 9600, savingsPct: 30, favouriteScore: 89, amenities: ["Pool", "Spa", "WiFi", "Restaurant"], perks: ["Free Breakfast", "Nature Walk", "Late Checkout"], instantConfirmation: true, lat: 31.1048, lng: 77.1734 },
  { id: "h-008", name: "JW Marriott Aerocity", city: "Delhi", image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=480&h=320&fit=crop", stars: 5, rating: 4.5, reviewCount: 2800, retailRate: 14500, voyagrRate: 9900, savingsAmount: 4600, savingsPct: 32, favouriteScore: 82, amenities: ["Pool", "Spa", "Gym", "WiFi", "Restaurant", "Bar"], perks: ["Free Breakfast", "Airport Transfer"], instantConfirmation: true, lat: 28.5562, lng: 77.0888 },
  { id: "h-009", name: "The Park Hyatt", city: "Goa", image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=480&h=320&fit=crop", stars: 5, rating: 4.6, reviewCount: 1500, retailRate: 26000, voyagrRate: 18200, savingsAmount: 7800, savingsPct: 30, favouriteScore: 88, amenities: ["Pool", "Spa", "Gym", "WiFi", "Restaurant", "Bar", "Beach Access"], perks: ["Free Breakfast", "Beach Cabana", "Late Checkout"], instantConfirmation: true, lat: 15.3973, lng: 73.8338 },
  { id: "h-010", name: "Lemon Tree Premier", city: "Mumbai", image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=480&h=320&fit=crop", stars: 4, rating: 4.2, reviewCount: 1200, retailRate: 8500, voyagrRate: 5950, savingsAmount: 2550, savingsPct: 30, favouriteScore: 72, amenities: ["Pool", "Gym", "WiFi", "Restaurant"], perks: ["Free Breakfast"], instantConfirmation: true, lat: 19.1176, lng: 72.9060 },
  { id: "h-011", name: "Radisson Blu", city: "Delhi", image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=480&h=320&fit=crop", stars: 4, rating: 4.3, reviewCount: 1680, retailRate: 9800, voyagrRate: 6860, savingsAmount: 2940, savingsPct: 30, favouriteScore: 75, amenities: ["Pool", "Gym", "WiFi", "Restaurant", "Bar"], perks: ["Free Breakfast", "Airport Transfer"], instantConfirmation: true, lat: 28.6329, lng: 77.2195 },
  { id: "h-012", name: "Novotel Goa Resort", city: "Goa", image: "https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?w=480&h=320&fit=crop", stars: 4, rating: 4.4, reviewCount: 920, retailRate: 12000, voyagrRate: 8400, savingsAmount: 3600, savingsPct: 30, favouriteScore: 80, amenities: ["Pool", "Spa", "WiFi", "Restaurant", "Beach Access"], perks: ["Free Breakfast", "Kids Club"], instantConfirmation: true, lat: 15.5134, lng: 73.7695 },
  { id: "h-013", name: "Marriott Suites Pune", city: "Pune", image: "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=480&h=320&fit=crop", stars: 4, rating: 4.3, reviewCount: 780, retailRate: 10500, voyagrRate: 7350, savingsAmount: 3150, savingsPct: 30, favouriteScore: 74, amenities: ["Pool", "Gym", "WiFi", "Restaurant"], perks: ["Free Breakfast", "Late Checkout"], instantConfirmation: true, lat: 18.5596, lng: 73.7798 },
  { id: "h-014", name: "Holiday Inn Express", city: "Bengaluru", image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=480&h=320&fit=crop", stars: 3, rating: 4.0, reviewCount: 560, retailRate: 5500, voyagrRate: 3850, savingsAmount: 1650, savingsPct: 30, favouriteScore: 65, amenities: ["Gym", "WiFi", "Restaurant"], perks: ["Free Breakfast"], instantConfirmation: true, lat: 12.9784, lng: 77.5712 },
  { id: "h-015", name: "Ginger Hotel", city: "Jaipur", image: "https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?w=480&h=320&fit=crop", stars: 3, rating: 3.9, reviewCount: 430, retailRate: 4200, voyagrRate: 2940, savingsAmount: 1260, savingsPct: 30, favouriteScore: 60, amenities: ["WiFi", "Restaurant"], perks: ["Free Breakfast"], instantConfirmation: false, lat: 26.9124, lng: 75.7873 },
  { id: "h-016", name: "Vivanta by Taj", city: "Chennai", image: "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=480&h=320&fit=crop", stars: 5, rating: 4.6, reviewCount: 1340, retailRate: 16000, voyagrRate: 11200, savingsAmount: 4800, savingsPct: 30, favouriteScore: 86, amenities: ["Pool", "Spa", "Gym", "WiFi", "Restaurant", "Bar"], perks: ["Free Breakfast", "Spa Credit"], instantConfirmation: true, lat: 13.0569, lng: 80.2425 },
  { id: "h-017", name: "Treebo Trend Royal", city: "Pune", image: "https://images.unsplash.com/photo-1586611292717-f828b167408c?w=480&h=320&fit=crop", stars: 3, rating: 3.8, reviewCount: 340, retailRate: 3800, voyagrRate: 2660, savingsAmount: 1140, savingsPct: 30, favouriteScore: 55, amenities: ["WiFi", "Restaurant"], perks: [], instantConfirmation: false, lat: 18.5204, lng: 73.8567 },
  { id: "h-018", name: "Hyatt Regency", city: "Kolkata", image: "https://images.unsplash.com/photo-1529290130-4ca3753253ae?w=480&h=320&fit=crop", stars: 5, rating: 4.5, reviewCount: 1100, retailRate: 15000, voyagrRate: 10500, savingsAmount: 4500, savingsPct: 30, favouriteScore: 83, amenities: ["Pool", "Spa", "Gym", "WiFi", "Restaurant", "Bar"], perks: ["Free Breakfast", "Airport Transfer"], instantConfirmation: true, lat: 22.5378, lng: 88.3417 },
  { id: "h-019", name: "Courtyard by Marriott", city: "Goa", image: "https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=480&h=320&fit=crop", stars: 4, rating: 4.4, reviewCount: 890, retailRate: 11000, voyagrRate: 7700, savingsAmount: 3300, savingsPct: 30, favouriteScore: 79, amenities: ["Pool", "Gym", "WiFi", "Restaurant", "Beach Access"], perks: ["Free Breakfast", "Beach Shuttle"], instantConfirmation: true, lat: 15.4870, lng: 73.8188 },
  { id: "h-020", name: "Taj Falaknuma Palace", city: "Hyderabad", image: "https://images.unsplash.com/photo-1549294413-26f195200c16?w=480&h=320&fit=crop", stars: 5, rating: 4.9, reviewCount: 670, retailRate: 45000, voyagrRate: 31500, savingsAmount: 13500, savingsPct: 30, favouriteScore: 99, amenities: ["Pool", "Spa", "Gym", "WiFi", "Restaurant", "Bar"], perks: ["Free Breakfast", "Heritage Tour", "Butler Service", "Late Checkout"], instantConfirmation: true, lat: 17.3315, lng: 78.4673 },
  { id: "h-021", name: "ITC Rajputana", city: "Jaipur", image: "https://images.unsplash.com/photo-1600011689032-26628de3e2af?w=480&h=320&fit=crop", stars: 5, rating: 4.6, reviewCount: 1450, retailRate: 14000, voyagrRate: 9800, savingsAmount: 4200, savingsPct: 30, favouriteScore: 85, amenities: ["Pool", "Spa", "Gym", "WiFi", "Restaurant"], perks: ["Free Breakfast", "City Tour"], instantConfirmation: true, lat: 26.9078, lng: 75.8011 },
  { id: "h-022", name: "OYO Flagship", city: "Delhi", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=480&h=320&fit=crop", stars: 2, rating: 3.5, reviewCount: 210, retailRate: 2200, voyagrRate: 1540, savingsAmount: 660, savingsPct: 30, favouriteScore: 40, amenities: ["WiFi"], perks: [], instantConfirmation: false, lat: 28.6448, lng: 77.2167 },
  { id: "h-023", name: "Crowne Plaza", city: "Kolkata", image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=480&h=320&fit=crop", stars: 4, rating: 4.3, reviewCount: 890, retailRate: 9500, voyagrRate: 6650, savingsAmount: 2850, savingsPct: 30, favouriteScore: 76, amenities: ["Pool", "Gym", "WiFi", "Restaurant", "Bar"], perks: ["Free Breakfast"], instantConfirmation: true, lat: 22.5518, lng: 88.3470 },
  { id: "h-024", name: "Welcomhotel Sheraton", city: "Delhi", image: "https://images.unsplash.com/photo-1587213811864-46e59f6873b1?w=480&h=320&fit=crop", stars: 5, rating: 4.5, reviewCount: 1600, retailRate: 16500, voyagrRate: 11550, savingsAmount: 4950, savingsPct: 30, favouriteScore: 84, amenities: ["Pool", "Spa", "Gym", "WiFi", "Restaurant", "Bar"], perks: ["Free Breakfast", "Airport Transfer", "Late Checkout"], instantConfirmation: true, lat: 28.5863, lng: 77.1688 },
];

const ALL_AMENITIES = ["Pool", "Spa", "Gym", "WiFi", "Restaurant", "Bar", "Beach Access"];
const ALL_PERKS = ["Free Breakfast", "Airport Transfer", "Late Checkout", "Spa Credit", "Butler Service", "Heritage Tour", "City Tour", "Beach Cabana", "Beach Shuttle", "Kids Club", "Nature Walk", "Boat Ride", "Heritage Walk"];
const ALL_CITIES = [...new Set(MOCK_HOTELS.map((h) => h.city))].sort();

type SortOption = "voyagr_rate" | "savings_pct" | "favourites";

// ---------- Star Rating Component ----------
function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i < stars ? "text-amber-400" : "text-slate-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ---------- Filter Checkbox ----------
function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div
        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
          checked
            ? "bg-indigo-600 border-indigo-600"
            : "border-slate-300 group-hover:border-slate-400"
        }`}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}

// ---------- Price Range Slider ----------
function PriceRangeFilter({
  min,
  max,
  value,
  onChange,
}: {
  min: number;
  max: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500">
          {"\u20B9"}{value[0].toLocaleString("en-IN")}
        </span>
        <span className="text-xs text-slate-500">
          {"\u20B9"}{value[1].toLocaleString("en-IN")}
        </span>
      </div>
      <div className="space-y-2">
        <input
          type="range"
          min={min}
          max={max}
          step={500}
          value={value[0]}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v <= value[1]) onChange([v, value[1]]);
          }}
          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-indigo-600 bg-slate-200"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={500}
          value={value[1]}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v >= value[0]) onChange([value[0], v]);
          }}
          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-indigo-600 bg-slate-200"
        />
      </div>
    </div>
  );
}

// ---------- Hotel Card ----------
function HotelCard({ hotel }: { hotel: HotelResult }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Image */}
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        <img
          src={hotel.image}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Savings badge */}
        <div className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
          Save {hotel.savingsPct}%
        </div>
        {/* Favourite score */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
          <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          {hotel.favouriteScore}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* City & Stars */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-indigo-600">{hotel.city}</span>
          <StarRating stars={hotel.stars} />
        </div>

        {/* Hotel Name */}
        <h3 className="font-semibold text-slate-900 text-sm mb-2 truncate">{hotel.name}</h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="bg-indigo-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
            {hotel.rating}
          </span>
          <span className="text-xs text-slate-500">
            ({hotel.reviewCount.toLocaleString("en-IN")} reviews)
          </span>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1 mb-3">
          {hotel.amenities.slice(0, 4).map((a) => (
            <span key={a} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
              {a}
            </span>
          ))}
          {hotel.amenities.length > 4 && (
            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
              +{hotel.amenities.length - 4}
            </span>
          )}
        </div>

        {/* Pricing */}
        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-end justify-between mb-1">
            <div>
              <span className="text-xs text-slate-400 line-through">
                {"\u20B9"}{hotel.retailRate.toLocaleString("en-IN")}
              </span>
              <div className="text-lg font-bold text-slate-900">
                {"\u20B9"}{hotel.voyagrRate.toLocaleString("en-IN")}
                <span className="text-xs font-normal text-slate-500 ml-1">/night</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-emerald-600">
                Save {"\u20B9"}{hotel.savingsAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Instant confirmation badge */}
        {hotel.instantConfirmation && (
          <div className="mt-2 flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
            <svg className="w-3.5 h-3.5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-[11px] font-semibold text-amber-700">
              Instant confirmation via concierge
            </span>
          </div>
        )}

        {/* Perks */}
        {hotel.perks.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {hotel.perks.slice(0, 3).map((p) => (
              <span key={p} className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                {p}
              </span>
            ))}
            {hotel.perks.length > 3 && (
              <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">
                +{hotel.perks.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Mini Map Placeholder ----------
function LocationMap({ hotels }: { hotels: HotelResult[] }) {
  const cities = [...new Set(hotels.map((h) => h.city))];
  return (
    <div className="bg-slate-100 rounded-lg p-3 h-40 flex flex-col items-center justify-center text-center">
      <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span className="text-xs text-slate-500 font-medium">
        {hotels.length} hotels across {cities.length} cities
      </span>
      <div className="flex flex-wrap gap-1 mt-2 justify-center">
        {cities.slice(0, 5).map((c) => (
          <span key={c} className="text-[10px] bg-white text-slate-600 px-1.5 py-0.5 rounded shadow-sm">
            {c}
          </span>
        ))}
        {cities.length > 5 && (
          <span className="text-[10px] bg-white text-slate-500 px-1.5 py-0.5 rounded shadow-sm">
            +{cities.length - 5}
          </span>
        )}
      </div>
    </div>
  );
}

// ---------- Main Page ----------
export default function ResultsPage() {
  // Filter state
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedPerks, setSelectedPerks] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("favourites");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Toggle helpers
  function toggleStar(star: number) {
    setSelectedStars((prev) =>
      prev.includes(star) ? prev.filter((s) => s !== star) : [...prev, star]
    );
  }
  function toggleAmenity(amenity: string) {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  }
  function togglePerk(perk: string) {
    setSelectedPerks((prev) =>
      prev.includes(perk) ? prev.filter((p) => p !== perk) : [...prev, perk]
    );
  }
  function toggleCity(city: string) {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
  }
  function clearAllFilters() {
    setSearch("");
    setPriceRange([0, 50000]);
    setSelectedStars([]);
    setSelectedAmenities([]);
    setSelectedPerks([]);
    setSelectedCities([]);
  }

  // Filtered & sorted
  const filteredHotels = useMemo(() => {
    let results = MOCK_HOTELS.filter((h) => {
      if (search && !h.name.toLowerCase().includes(search.toLowerCase()) && !h.city.toLowerCase().includes(search.toLowerCase())) return false;
      if (h.voyagrRate < priceRange[0] || h.voyagrRate > priceRange[1]) return false;
      if (selectedStars.length > 0 && !selectedStars.includes(h.stars)) return false;
      if (selectedAmenities.length > 0 && !selectedAmenities.every((a) => h.amenities.includes(a))) return false;
      if (selectedPerks.length > 0 && !selectedPerks.every((p) => h.perks.includes(p))) return false;
      if (selectedCities.length > 0 && !selectedCities.includes(h.city)) return false;
      return true;
    });

    results.sort((a, b) => {
      switch (sortBy) {
        case "voyagr_rate":
          return a.voyagrRate - b.voyagrRate;
        case "savings_pct":
          return b.savingsPct - a.savingsPct;
        case "favourites":
          return b.favouriteScore - a.favouriteScore;
        default:
          return 0;
      }
    });

    return results;
  }, [search, priceRange, selectedStars, selectedAmenities, selectedPerks, selectedCities, sortBy]);

  const activeFilterCount =
    (selectedStars.length > 0 ? 1 : 0) +
    (selectedAmenities.length > 0 ? 1 : 0) +
    (selectedPerks.length > 0 ? 1 : 0) +
    (selectedCities.length > 0 ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 50000 ? 1 : 0);

  // ---------- Filter Sidebar Content ----------
  const filterContent = (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search hotels or cities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900"
          />
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Price Range (per night)</h4>
        <PriceRangeFilter min={0} max={50000} value={priceRange} onChange={setPriceRange} />
      </div>

      {/* Star Rating */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Star Rating</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2].map((star) => (
            <label key={star} className="flex items-center gap-2 cursor-pointer group">
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  selectedStars.includes(star)
                    ? "bg-indigo-600 border-indigo-600"
                    : "border-slate-300 group-hover:border-slate-400"
                }`}
              >
                {selectedStars.includes(star) && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: star }).map((_, i) => (
                  <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-slate-500">
                ({MOCK_HOTELS.filter((h) => h.stars === star).length})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Amenities</h4>
        <div className="space-y-2">
          {ALL_AMENITIES.map((amenity) => (
            <FilterCheckbox
              key={amenity}
              label={amenity}
              checked={selectedAmenities.includes(amenity)}
              onChange={() => toggleAmenity(amenity)}
            />
          ))}
        </div>
      </div>

      {/* Perks */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Perks</h4>
        <div className="space-y-2">
          {ALL_PERKS.slice(0, 6).map((perk) => (
            <FilterCheckbox
              key={perk}
              label={perk}
              checked={selectedPerks.includes(perk)}
              onChange={() => togglePerk(perk)}
            />
          ))}
        </div>
      </div>

      {/* Location / City */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Location</h4>
        <LocationMap hotels={filteredHotels} />
        <div className="mt-3 space-y-2">
          {ALL_CITIES.map((city) => (
            <FilterCheckbox
              key={city}
              label={city}
              checked={selectedCities.includes(city)}
              onChange={() => toggleCity(city)}
            />
          ))}
        </div>
      </div>

      {/* Clear All */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearAllFilters}
          className="w-full py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          Clear all filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Browse Hotels</h2>
            <p className="text-sm text-slate-500 mt-1">
              {filteredHotels.length} properties found with exclusive Voyagr rates
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-indigo-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 hidden sm:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 font-medium"
              >
                <option value="favourites">Traveller favourites</option>
                <option value="voyagr_rate">Lowest Voyagr rate</option>
                <option value="savings_pct">Biggest % savings</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Filters + Grid */}
      <div className="flex gap-6">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Filters</h3>
              {activeFilterCount > 0 && (
                <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
                  {activeFilterCount} active
                </span>
              )}
            </div>
            {filterContent}
          </div>
        </aside>

        {/* Mobile Filters Overlay */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-50 overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Filters</h3>
                <button onClick={() => setMobileFiltersOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-5">{filterContent}</div>
            </div>
          </div>
        )}

        {/* Results Grid */}
        <div className="flex-1 min-w-0">
          {filteredHotels.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">No hotels found</h3>
              <p className="text-sm text-slate-500 mb-4">Try adjusting your filters to see more results.</p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredHotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          )}

          {/* Results footer */}
          {filteredHotels.length > 0 && (
            <div className="mt-6 text-center text-sm text-slate-500">
              Showing {filteredHotels.length} of {MOCK_HOTELS.length} properties
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
