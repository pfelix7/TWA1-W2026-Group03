import { useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card.jsx";

export default function RegisterPage({ onRegister, authError, isSubmitting }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [formError, setFormError] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation checks
    if (
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !firstName.trim() ||
      !lastName.trim()
    ) {
      setFormError("All fields are required.");
      return;
    }

    if (!validateEmail(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setFormError("");
    await onRegister(email, password, firstName, lastName);
  };

  return (
    <Card>
      <h2>Create Account</h2>
      <p>Register to start submitting reviews.</p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: "12px", maxWidth: "360px" }}
      >
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

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

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {formError && <p style={{ color: "crimson" }}>{formError}</p>}
        {authError && <p style={{ color: "crimson" }}>{authError}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Register"}
        </button>
      </form>

      <hr />
      <p>
        Already have an account? <Link to="/login">Log in here</Link>
      </p>
    </Card>
  );
}
