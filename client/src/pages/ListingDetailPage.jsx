import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ReviewsList from "../components/ReviewsList";
import ReviewForm from "../components/ReviewForm";

export default function ListingDetailPage({ user }) {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchListing();
    fetchReviews();
  }, [id]);

  const fetchListing = async () => {
    try {
      const response = await fetch(`/api/listings/${id}`);
      if (!response.ok) throw new Error("Failed to fetch listing");
      const data = await response.json();
      setListing(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/listings/${id}/reviews`);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!listing) return <p>Listing not found</p>;

  return (
    <div>
      <h1>{listing.name}</h1>

      <img src={listing.images?.picture_url} alt={listing.name} />

      <p>
        {listing.address?.street}, {listing.address?.suburb}
      </p>
      <p>${parseFloat(listing.price)}/night</p>

      <p>Accommodates: {listing.accommodates}</p>
      <p>Bedrooms: {listing.bedrooms}</p>
      <p>Bathrooms: {listing.bathrooms}</p>

      <p>{listing.summary}</p>

      <div>
        <h2>Reviews</h2>
        <ReviewsList
          reviews={reviews}
          user={user}
          onReviewDeleted={fetchReviews}
        />
        {user && <ReviewForm listingId={id} onReviewAdded={fetchReviews} />}
      </div>
    </div>
  );
}
