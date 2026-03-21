"use client";

import { useState } from "react";
import {
  searchHotels,
  getHotelReviews,
  createReview,
  deleteReview,
  Hotel,
  Review,
} from "@/lib/api";
import { useToast } from "@/lib/toast";

export default function ReviewsPage() {
  const { toast } = useToast();

  // Hotel search
  const [hotelQuery, setHotelQuery] = useState("");
  const [hotelResults, setHotelResults] = useState<Hotel[]>([]);
  const [searchingHotels, setSearchingHotels] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Add review form
  const [showAddForm, setShowAddForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    author: "",
    rating: 5,
    text: "",
    source: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleHotelSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!hotelQuery.trim()) return;
    setSearchingHotels(true);
    try {
      const result = await searchHotels(hotelQuery);
      setHotelResults(result.hotels || []);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Search failed", "error");
    } finally {
      setSearchingHotels(false);
    }
  }

  async function selectHotel(hotel: Hotel) {
    setSelectedHotel(hotel);
    setHotelResults([]);
    setHotelQuery("");
    setLoadingReviews(true);
    try {
      const result = await getHotelReviews(hotel.hotel_id);
      setReviews(result.reviews || []);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to load reviews", "error");
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }

  async function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedHotel) return;
    setSubmitting(true);
    try {
      await createReview({
        hotel_id: selectedHotel.hotel_id,
        author: reviewForm.author,
        rating: reviewForm.rating,
        text: reviewForm.text,
        source: reviewForm.source || undefined,
      });
      toast("Review added successfully");
      setShowAddForm(false);
      setReviewForm({ author: "", rating: 5, text: "", source: "" });
      // Refresh reviews
      const result = await getHotelReviews(selectedHotel.hotel_id);
      setReviews(result.reviews || []);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to add review", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteReview() {
    if (!deleteTarget || !selectedHotel) return;
    setDeleting(true);
    try {
      await deleteReview(deleteTarget.id);
      toast("Review deleted");
      setDeleteTarget(null);
      const result = await getHotelReviews(selectedHotel.hotel_id);
      setReviews(result.reviews || []);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete review", "error");
    } finally {
      setDeleting(false);
    }
  }

  function renderStars(rating: number) {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? "text-amber-400" : "text-slate-200"}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Reviews</h2>
        <p className="text-slate-500 mt-1">Search for a hotel to manage its reviews.</p>
      </div>

      {/* Hotel Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Find Hotel</h3>
        <form onSubmit={handleHotelSearch} className="flex gap-3">
          <input
            type="text"
            value={hotelQuery}
            onChange={(e) => setHotelQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            placeholder="Search by hotel name..."
          />
          <button
            type="submit"
            disabled={searchingHotels}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {searchingHotels ? "Searching..." : "Search"}
          </button>
        </form>

        {/* Search Results */}
        {hotelResults.length > 0 && (
          <div className="mt-4 border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {hotelResults.map((hotel) => (
              <button
                key={hotel.hotel_id}
                onClick={() => selectHotel(hotel)}
                className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-slate-900">{hotel.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {hotel.city && <span>{hotel.city}</span>}
                    {hotel.stars && <span> &middot; {hotel.stars}★</span>}
                    <span className="text-slate-400 ml-2">ID: {hotel.hotel_id}</span>
                  </div>
                </div>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Hotel & Reviews */}
      {selectedHotel && (
        <>
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedHotel.name}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedHotel.city && `${selectedHotel.city} `}
                  {selectedHotel.stars && `${selectedHotel.stars}★ `}
                  &middot; Hotel ID: {selectedHotel.hotel_id}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedHotel(null);
                    setReviews([]);
                  }}
                  className="text-sm text-slate-500 hover:text-slate-700 font-medium"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Review
                </button>
              </div>
            </div>
          </div>

          {loadingReviews ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-slate-500 font-medium">No reviews yet</p>
              <p className="text-slate-400 text-sm mt-1">Add the first review for this hotel.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-xl border border-slate-200 p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-sm font-bold">
                          {review.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {review.author}
                          </div>
                          <div className="flex items-center gap-2">
                            {renderStars(review.rating)}
                            {review.source && (
                              <span className="text-xs text-slate-400">via {review.source}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 ml-11">{review.text}</p>
                      {review.created_at && (
                        <p className="text-xs text-slate-400 mt-2 ml-11">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setDeleteTarget(review)}
                      className="shrink-0 ml-4 p-2 text-slate-400 hover:text-red-600 transition-colors"
                      title="Delete review"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Review Modal */}
      {showAddForm && selectedHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowAddForm(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Review</h3>
            <p className="text-sm text-slate-500 mb-4">
              Adding review for <strong>{selectedHotel.name}</strong>
            </p>
            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Author</label>
                <input
                  type="text"
                  value={reviewForm.author}
                  onChange={(e) => setReviewForm({ ...reviewForm, author: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  placeholder="Reviewer name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Rating
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="p-0.5"
                    >
                      <svg
                        className={`w-7 h-7 ${
                          star <= reviewForm.rating ? "text-amber-400" : "text-slate-200"
                        } hover:text-amber-300 transition-colors`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  ))}
                  <span className="text-sm text-slate-500 ml-2">{reviewForm.rating}/5</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Review</label>
                <textarea
                  value={reviewForm.text}
                  onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 h-28 resize-none"
                  placeholder="Write the review text..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Source <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={reviewForm.source}
                  onChange={(e) => setReviewForm({ ...reviewForm, source: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  placeholder="e.g. Google, TripAdvisor"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Add Review"}
                </button>
              </div>
            </form>
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
              <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Review</h3>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to delete this review by <strong>{deleteTarget.author}</strong>?
                This cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteReview}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
