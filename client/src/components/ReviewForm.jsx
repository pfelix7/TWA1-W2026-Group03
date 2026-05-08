import { useState, useMemo } from "react";

export default function ReviewForm({
  listingId,
  onReviewAdded,
  user,
  reviews,
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if user has already reviewed this listing
  const userReview = useMemo(() => {
    if (!user || !reviews) return null;
    return reviews.find((review) => review.user?._id === user.id);
  }, [user, reviews]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      // Use FormData to support file upload
      const formData = new FormData();
      formData.append("listingId", listingId);
      formData.append("rating", rating);
      formData.append("comment", comment);
      if (photo) {
        formData.append("photo", photo);
      }

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 409) {
          setError(
            "You have already reviewed this listing. Edit or delete your existing review below.",
          );
        } else {
          setError(data.error || "Failed to submit review");
        }
        return;
      }

      setRating(5);
      setComment("");
      setPhoto(null);
      setPhotoPreview(null);
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
      <div className="review-already-posted">
        <p>
          <strong>You've already reviewed this listing</strong>
        </p>
        <p>
          Your review: {userReview.rating} stars - {userReview.comment}
        </p>
        <p className="review-help-text">
          Edit or delete your review from the reviews list above
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h3>Leave a Review</h3>

      <label>
        Rating:
        <select
          value={rating}
          onChange={(e) => setRating(parseInt(e.target.value))}
        >
          <option value={1}>1 star</option>
          <option value={2}>2 stars</option>
          <option value={3}>3 stars</option>
          <option value={4}>4 stars</option>
          <option value={5}>5 stars</option>
        </select>
      </label>

      <label>
        Comment:
        <textarea
          placeholder="Share your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />
      </label>

      <label>
        Photo (optional):
        <input type="file" accept="image/*" onChange={handlePhotoChange} />
      </label>

      {photoPreview && (
        <div className="photo-preview-container">
          <img src={photoPreview} alt="Preview" className="photo-preview" />
          <button
            type="button"
            onClick={handleRemovePhoto}
            className="remove-photo-btn"
          >
            Remove Photo
          </button>
        </div>
      )}

      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
