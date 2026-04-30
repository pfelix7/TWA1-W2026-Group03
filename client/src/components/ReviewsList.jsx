import { useState } from "react";

export default function ReviewsList({ reviews, user, onReviewDeleted }) {
  const [editingId, setEditingId] = useState(null);
  const [editingRating, setEditingRating] = useState(5);
  const [editingComment, setEditingComment] = useState("");
  const [editError, setEditError] = useState("");

  const isReviewAuthor = (review) => {
    if (!user) return false;
    if (!review.user) return false;

    const reviewUserId = review.user._id || review.user;
    return String(user.id) === String(reviewUserId);
  };

  const handleEdit = (review) => {
    setEditingId(review._id);
    setEditingRating(review.rating);
    setEditingComment(review.comment);
    setEditError("");
  };

  const handleSaveEdit = async (reviewId) => {
    if (!editingComment.trim()) {
      setEditError("Comment cannot be empty");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: editingRating,
          comment: editingComment,
        }),
      });

      if (!response.ok) throw new Error("Failed to update review");
      setEditingId(null);
      setEditError("");
      onReviewDeleted();
    } catch (err) {
      setEditError(err.message);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete review");
      onReviewDeleted();
    } catch (err) {
      console.error(err);
    }
  };

  if (!reviews || reviews.length === 0) {
    return <p>No reviews yet.</p>;
  }

  return (
    <div>
      {reviews.map((review) => (
        <div key={review._id}>
          {editingId === review._id ? (
            <div>
              <label>
                Rating:
                <select
                  value={editingRating}
                  onChange={(e) => setEditingRating(parseInt(e.target.value))}
                >
                  <option value={1}>1 star</option>
                  <option value={2}>2 stars</option>
                  <option value={3}>3 stars</option>
                  <option value={4}>4 stars</option>
                  <option value={5}>5 stars</option>
                </select>
              </label>
              <textarea
                value={editingComment}
                onChange={(e) => setEditingComment(e.target.value)}
              />
              {editError && <p>{editError}</p>}
              <button onClick={() => handleSaveEdit(review._id)}>Save</button>
              <button onClick={() => setEditingId(null)}>Cancel</button>
            </div>
          ) : (
            <>
              <div>
                <strong>
                  {review.user?.firstName} {review.user?.lastName}
                </strong>
                <span> • {review.rating} stars</span>
                {isReviewAuthor(review) && (
                  <>
                    <button onClick={() => handleEdit(review)}>Edit</button>
                    <button onClick={() => handleDelete(review._id)}>
                      Delete
                    </button>
                  </>
                )}
              </div>
              <p>{review.comment}</p>
              {review.photoUrl && <img src={review.photoUrl} alt="Review" />}
              <small>{new Date(review.createdAt).toLocaleDateString()}</small>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
