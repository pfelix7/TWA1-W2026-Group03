import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ListingCard from "../components/ListingCard";

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({ 
    page: parseInt(searchParams.get("page")) || 1, 
    total: 0, 
    limit: 10 
  });
  const [filters, setFilters] = useState({
    city: searchParams.get("city") || "",
    minPrice: parseInt(searchParams.get("price_min")) || 0,
    maxPrice: parseInt(searchParams.get("price_max")) || 10000,
    roomType: searchParams.get("room_type") || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchListings();
  }, [filters, pagination.page]);

  const fetchListings = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        ...(filters.city && { city: filters.city }),
        ...(filters.minPrice && { price_min: filters.minPrice }),
        ...(filters.maxPrice && { price_max: filters.maxPrice }),
        ...(filters.roomType && { room_type: filters.roomType }),
      });

      const response = await fetch(`/api/listings?${params}`);
      if (!response.ok) throw new Error("Failed to fetch listings");
      const data = await response.json();
      setListings(data.listings);
      setPagination({
        page: data.pagination.page,
        total: data.pagination.total,
        limit: data.pagination.limit,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: name === "minPrice" || name === "maxPrice" ? parseInt(value) : value,
    };
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));

    // Update URL with new filters
    const newParams = new URLSearchParams();
    if (newFilters.city) newParams.set("city", newFilters.city);
    if (newFilters.minPrice) newParams.set("price_min", newFilters.minPrice);
    if (newFilters.maxPrice) newParams.set("price_max", newFilters.maxPrice);
    if (newFilters.roomType) newParams.set("room_type", newFilters.roomType);
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    // Update URL with page number
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage);
    setSearchParams(newParams);
  };

  return (
    <div className="browse-page">
      <h1>Browse Listings</h1>

      <div className="filters">
        <input
          type="text"
          name="city"
          placeholder="City"
          value={filters.city}
          onChange={handleFilterChange}
        />
        <div className="price-input-wrapper">
          <span>$</span>
          <input
            type="number"
            name="minPrice"
            placeholder="Min"
            value={filters.minPrice}
            onChange={handleFilterChange}
          />
        </div>
        <div className="price-input-wrapper">
          <span>$</span>
          <input
            type="number"
            name="maxPrice"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={handleFilterChange}
          />
        </div>
        <select name="roomType" value={filters.roomType} onChange={handleFilterChange}>
          <option value="">All Types</option>
          <option value="Entire home/apt">Entire home</option>
          <option value="Private room">Private room</option>
          <option value="Shared room">Shared room</option>
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && listings.length === 0 && <p>No listings found</p>}

      <div className="listings-grid">
        {listings.map((listing) => (
          <ListingCard
            key={listing._id}
            _id={listing._id}
            name={listing.name}
            images={listing.images}
            price={listing.pricePerNight}
            address={listing.address}
            accommodates={listing.accommodates}
            bedrooms={listing.bedrooms}
          />
        ))}
      </div>

      {listings.length > 0 && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p>
            Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)} 
            (Total: {pagination.total} listings)
          </p>
          <button
            onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
            disabled={pagination.page === 1}
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}