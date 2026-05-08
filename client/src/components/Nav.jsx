import { Link } from "react-router-dom";

export default function Nav({ user, onLogout }) {
  return (
    <nav className="nav-bar">
      {!user ? (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      ) : (
        <>
          <Link to="/browse">Listings</Link>
          <Link to="/reviews">Reviews</Link>
          <Link to="/profile">Profile</Link>
          <button onClick={onLogout}>Logout</button>
        </>
      )}
    </nav>
  );
}
