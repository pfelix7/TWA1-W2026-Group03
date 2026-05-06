import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card.jsx";

export default function ReviewsPage({ user }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
        setError("");
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/reviews/user/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        } else {
          setError("Failed to fetch reviews. Please try again.");
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching reviews.");
        console.error("Failed to fetch reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserReviews();
    }
  }, [user]);

  return (
    <Card>
      <h2>My Reviews</h2>
      {loading ? (
        <p>Loading reviews...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : reviews.length === 0 ? (
        <p>You haven't written any reviews yet.</p>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review._id} className="review-card">
              <p>
                <strong>{review.rating} stars</strong> - {review.comment}
              </p>
              {review.photo && (
                <img src={review.photo} alt="Review" className="review-image" />
              )}
              {review.listing ? (
                <Link to={`/listings/${review.listing._id}`}>
                  View Listing: {review.listing.name}
                </Link>
              ) : review.listingId ? (
                <Link to={`/listings/${review.listingId}`}>View Listing</Link>
              ) : (
                <p>Listing no longer available</p>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
