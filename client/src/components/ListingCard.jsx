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
  return (
    <Link to={`/listings/${_id}`}>
      <div>
        <img src={images?.picture_url || "placeholder.jpg"} alt={name} />

        <h3>{name}</h3>
        <p>{address?.suburb}</p>
        <p>${parseFloat(price) || "N/A"}/night</p>
        <p>
          {accommodates} guests • {bedrooms} bedrooms
        </p>
      </div>
    </Link>
  );
}
