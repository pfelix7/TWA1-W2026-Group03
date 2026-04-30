import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ReviewForm from "../components/ReviewForm";
import ReviewsList from "../components/ReviewsList";

export default function ListingDetailPage({ user }) {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Helper function to convert Decimal128 to number
  const getNumericValue = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === "number") return value;
    if (typeof value === "object" && value.$numberDecimal) {
      return parseFloat(value.$numberDecimal);
    }
    return null;
  };

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
      const response = await fetch(`/api/reviews/${id}`);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
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
      <p>${getNumericValue(listing.pricePerNight)?.toFixed(2) || "N/A"}/night</p>

      <p>Type: {listing.room_type}</p>
      <p>Accommodates: {listing.accommodates}</p>
      <p>Bedrooms: {listing.bedrooms}</p>
      <p>Bathrooms: {getNumericValue(listing.bathrooms) ?? "N/A"}</p>

      <p>{listing.summary}</p>

      <div style={{ marginTop: "30px" }}>
        <h2>Reviews</h2>
        <ReviewsList reviews={reviews} user={user} onReviewDeleted={fetchReviews} />
        {user && <ReviewForm listingId={id} onReviewAdded={fetchReviews} user={user} reviews={reviews} />}
      </div>
    </div>
  );
}
