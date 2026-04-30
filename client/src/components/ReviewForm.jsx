import { useState, useMemo } from "react";

export default function ReviewForm({ listingId, onReviewAdded, user, reviews }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if user has already reviewed this listing
  const userReview = useMemo(() => {
    if (!user || !reviews) return null;
    return reviews.find((review) => review.user?._id === user.id);
  }, [user, reviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ listingId, rating, comment }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 409) {
          setError("You have already reviewed this listing. Edit or delete your existing review below.");
        } else {
          setError(data.error || "Failed to submit review");
        }
        return;
      }
      
      setRating(5);
      setComment("");
      onReviewAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // If user already reviewed, show message
  if (userReview) {
    return (
      <div style={{ border: "1px solid #ccc", padding: "15px", marginTop: "20px", backgroundColor: "#f0f0f0" }}>
        <p><strong>You've already reviewed this listing</strong></p>
        <p>Your review: {userReview.rating} stars - {userReview.comment}</p>
        <p style={{ fontSize: "0.9em", color: "#666" }}>Edit or delete your review from the reviews list above</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ border: "1px solid #ddd", padding: "15px", marginTop: "20px" }}>
      <h3>Leave a Review</h3>
      
      <label>
        Rating:
        <select value={rating} onChange={(e) => setRating(parseInt(e.target.value))}>
          <option value={1}>1 star</option>
          <option value={2}>2 stars</option>
          <option value={3}>3 stars</option>
          <option value={4}>4 stars</option>
          <option value={5}>5 stars</option>
        </select>
      </label>

      <textarea
        placeholder="Share your experience..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
      />

      {error && <p>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}