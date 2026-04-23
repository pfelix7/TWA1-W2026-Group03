import { Link } from "react-router-dom";

export default function Nav({ user, onLogout }) {
  return (
    <nav style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
      {!user ? (
        <Link to="/login"></Link> // Not ready to implement yet
      ) : (
        <>
          <Link to="/">Dashboard</Link>
          <Link to="/">Listings</Link>
          <Link to="/">Reviews</Link>
          <Link to="/">Profile</Link>
          <button onClick={onLogout}>Logout</button>
        </>
      )}
    </nav>
  );
}
