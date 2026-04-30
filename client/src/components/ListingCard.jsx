import { Link } from "react-router-dom";

export default function ListingCard({
  _id,
  name,
  images,
  price,
  address,
  accommodates,
  bedrooms,
}) {
  // Try multiple image URLs in order of preference
  const imageUrl = images?.picture_url || 
                   images?.xl_picture_url || 
                   images?.medium_url || 
                   images?.thumbnail_url;

  return (
    <Link to={`/listings/${_id}`}>
      <div>
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt={name} 
            style={{ width: "100%", height: "200px", objectFit: "cover" }} 
          />
        )}

        <h3>{name}</h3>
        <p>{address?.suburb}</p>
        <p>${typeof price === "number" && price > 0 ? price.toFixed(2) : "N/A"}/night</p>
        <p>
          {accommodates} guests • {bedrooms} bedrooms
        </p>
      </div>
    </Link>
  );
}
