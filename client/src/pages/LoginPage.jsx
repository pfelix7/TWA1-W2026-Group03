import { useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card.jsx";

export default function LoginPage({ onLogin, authError, isSubmitting }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setFormError("Email and password are required.");
      return;
    }

    setFormError("");
    await onLogin(email, password);
  };

  return (
    <Card>
      <h2>Login</h2>
      <p>Please log in to access your portal.</p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: "12px", maxWidth: "360px" }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {formError && <p style={{ color: "crimson" }}>{formError}</p>}
        {authError && <p style={{ color: "crimson" }}>{authError}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>

      <hr />
      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </Card>
  );
}
