import { useState, useEffect } from "react";
import ListingCard from "./ListingCard";

export default function BrowsePage() {
  const [listings, setListings] = useState([]);
  const [filters, setFilters] = useState({
    city: "",
    minPrice: 0,
    maxPrice: 10000,
    propertyType: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const fetchListings = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        ...(filters.city && { city: filters.city }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.propertyType && { propertyType: filters.propertyType }),
      });

      const response = await fetch(`/api/listings?${params}`);
      if (!response.ok) throw new Error("Failed to fetch listings");
      const data = await response.json();
      setListings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: name === "minPrice" || name === "maxPrice" ? parseInt(value) : value,
    }));
  };

  return (
    <div>
      <h1>Browse Listings</h1>

      <div>
        <input
          type="text"
          name="city"
          placeholder="City"
          value={filters.city}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          name="minPrice"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          name="maxPrice"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={handleFilterChange}
        />
        <select name="propertyType" value={filters.propertyType} onChange={handleFilterChange}>
          <option value="">All Types</option>
          <option value="Entire home">Entire home</option>
          <option value="Private room">Private room</option>
          <option value="Shared room">Shared room</option>
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && listings.length === 0 && <p>No listings found</p>}

      <div>
        {listings.map((listing) => (
          <ListingCard
            key={listing._id}
            _id={listing._id}
            name={listing.name}
            images={listing.images}
            price={listing.price}
            address={listing.address}
            accommodates={listing.accommodates}
            bedrooms={listing.bedrooms}
          />
        ))}
      </div>
    </div>
  );
}