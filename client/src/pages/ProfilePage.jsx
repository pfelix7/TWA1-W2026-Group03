import { useState } from "react";
import Card from "../components/Card.jsx";

const API_BASE = "http://localhost:3000/api";

export default function ProfilePage({ user, token, onUserUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch(`${API_BASE}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      // Call the callback to update parent state
      if (onUserUpdate) {
        onUserUpdate({
          firstName: data.user.firstName,
          lastName: data.user.lastName,
        });
      }

      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setError("");
    setIsEditing(false);
  };

  return (
    <Card>
      <h2>My Profile</h2>

      {!isEditing ? (
        <div>
          <p>
            <strong>Name:</strong> {user.firstName} {user.lastName}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: "8px 16px",
              backgroundColor: "var(--accent)",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Edit Name
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              <strong>First Name:</strong>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid var(--border)",
                borderRadius: "5px",
                fontSize: "16px",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              <strong>Last Name:</strong>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid var(--border)",
                borderRadius: "5px",
                fontSize: "16px",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <p style={{ color: "red", marginBottom: "15px" }}>{error}</p>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "8px 16px",
                backgroundColor: "var(--accent)",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              style={{
                padding: "8px 16px",
                backgroundColor: "var(--border)",
                color: "var(--text-h)",
                border: "none",
                borderRadius: "5px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </Card>
  );
}
