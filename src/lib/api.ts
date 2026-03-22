const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://134.122.41.91:5000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function logout() {
  localStorage.removeItem("admin_token");
  window.location.href = "/";
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { "X-Admin-Token": token } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    let message = `Request failed: ${res.status}`;
    try {
      const json = JSON.parse(text);
      message = json.error || json.message || message;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }

  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text);
}

// Auth
export async function login(username: string, password: string) {
  const data = await request<{ token?: string; message?: string }>(
    "/api/admin/login",
    {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }
  );
  localStorage.setItem("admin_token", password);
  return data;
}

// Cities
export async function getCities() {
  return request<{ cities: City[] }>("/api/curations/cities");
}

export async function createCity(city: Partial<City>) {
  return request<City>("/api/admin/cities", {
    method: "POST",
    body: JSON.stringify(city),
  });
}

export async function updateCity(slug: string, city: Partial<City>) {
  return request<City>(`/api/admin/cities/${slug}`, {
    method: "PUT",
    body: JSON.stringify(city),
  });
}

export async function deleteCity(slug: string) {
  return request(`/api/admin/cities/${slug}`, {
    method: "DELETE",
  });
}

// City Curation (Hotels in a city)
export async function getCityCuration(slug: string) {
  return request<CurationDetail>(`/api/curations/${slug}`);
}

export async function addHotelToCuration(
  slug: string,
  data: { hotel_id: string; category: string; order?: number }
) {
  return request(`/api/admin/curations/${slug}/hotels`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function removeHotelFromCuration(
  slug: string,
  hotelId: string,
  category: string
) {
  return request(`/api/admin/curations/${slug}/hotels`, {
    method: "DELETE",
    body: JSON.stringify({ hotel_id: hotelId, category }),
  });
}

export async function reorderCurationHotels(
  slug: string,
  category: string,
  hotelIds: string[]
) {
  return request(`/api/admin/curations/${slug}/reorder`, {
    method: "PUT",
    body: JSON.stringify({ category, hotel_ids: hotelIds }),
  });
}

// Hotel Search
export async function searchHotels(query: string) {
  return request<{ hotels: Hotel[] }>(
    `/api/admin/hotels/search?q=${encodeURIComponent(query)}`
  );
}

// Reviews
export async function getHotelReviews(hotelId: string) {
  return request<{ reviews: Review[] }>(`/api/hotels/${hotelId}/reviews`);
}

export async function createReview(review: {
  hotel_id: string;
  author: string;
  rating: number;
  text: string;
  source?: string;
}) {
  return request<Review>("/api/admin/reviews", {
    method: "POST",
    body: JSON.stringify(review),
  });
}

export async function deleteReview(reviewId: string) {
  return request(`/api/admin/reviews/${reviewId}`, {
    method: "DELETE",
  });
}

// Markup Settings
// TODO: Backend endpoints need to be created:
//   GET    /api/admin/markup-settings         — list all markup settings
//   POST   /api/admin/markup-settings         — create/upsert a markup setting
//   PUT    /api/admin/markup-settings/:id     — update a markup setting
//   DELETE /api/admin/markup-settings/:id     — delete a markup setting
//
// Supabase table:
//   CREATE TABLE IF NOT EXISTS markup_settings (
//     id bigserial PRIMARY KEY,
//     scope text NOT NULL CHECK (scope IN ('global', 'city', 'hotel')),
//     scope_key text, -- null for global, city_slug for city, hotel_id for hotel
//     markup_pct real NOT NULL DEFAULT 25.0,
//     display_name text,
//     updated_at timestamptz DEFAULT now(),
//     UNIQUE(scope, scope_key)
//   );

export async function getMarkupSettings() {
  return request<{ settings: MarkupSetting[] }>("/api/admin/markup-settings");
}

export async function upsertMarkupSetting(setting: {
  scope: "global" | "city" | "hotel";
  scope_key?: string | null;
  markup_pct: number;
  display_name?: string;
}) {
  return request<MarkupSetting>("/api/admin/markup-settings", {
    method: "POST",
    body: JSON.stringify(setting),
  });
}

export async function updateMarkupSetting(
  id: number,
  data: { markup_pct: number; display_name?: string }
) {
  return request<MarkupSetting>(`/api/admin/markup-settings/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteMarkupSetting(id: number) {
  return request(`/api/admin/markup-settings/${id}`, {
    method: "DELETE",
  });
}

// Types
export interface City {
  slug: string;
  name: string;
  country: string;
  continent: string;
  tagline?: string;
  order: number;
  hotels_count?: number;
}

export interface Hotel {
  hotel_id: string;
  name: string;
  stars?: number;
  rating?: number;
  reviews_count?: number;
  rate?: number;
  image_url?: string;
  address?: string;
  city?: string;
  order?: number;
}

export interface CurationDetail {
  city: City;
  singles: Hotel[];
  couples: Hotel[];
  families: Hotel[];
}

export interface Review {
  id: string;
  hotel_id: string;
  author: string;
  rating: number;
  text: string;
  source?: string;
  created_at?: string;
}

export interface MarkupSetting {
  id: number;
  scope: "global" | "city" | "hotel";
  scope_key: string | null;
  markup_pct: number;
  display_name: string | null;
  updated_at: string;
}

export interface Booking {
  id: string;
  guest_name: string;
  guest_email: string;
  hotel_name: string;
  city: string;
  country: string;
  check_in: string;
  check_out: string;
  nights: number;
  rooms: number;
  guests: number;
  status: "confirmed" | "completed" | "cancelled" | "pending" | "no-show";
  total_amount: number;
  currency: string;
  category: "singles" | "couples" | "families";
  created_at: string;
}

// Bookings
// TODO: Backend endpoints need to be created:
//   GET /api/admin/bookings — list bookings with optional filters
//   GET /api/admin/bookings/:id — get single booking detail
export async function getBookings() {
  return request<{ bookings: Booking[] }>("/api/admin/bookings");
}
