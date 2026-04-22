import { Link } from "react-router-dom";

export default function Nav({ user, onLogout }) {
  return (
    <nav style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
      <Link to="/about">About</Link>

      {!user ? (
        <Link to="/login">Login</Link>
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
