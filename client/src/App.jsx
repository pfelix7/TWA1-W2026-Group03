import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import Nav from "./components/Nav.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

const API_BASE = "http://localhost:3000/api";

function App() {
  const navigate = useNavigate();

  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Restore session from localStorage token
  useEffect(() => {
    const loadCurrentUser = async () => {
      if (!token) {
        setUser(null);
        setIsCheckingSession(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Invalid session");
        }

        const data = await res.json();
        setUser({
          id: data._id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          role: data.role,
        });
      } catch (err) {
        localStorage.removeItem("token");
        setToken("");
        setUser(null);
      } finally {
        setIsCheckingSession(false);
      }
    };

    loadCurrentUser();
  }, [token]);

  const register = async (email, password, firstName, lastName) => {
    try {
      setIsSubmitting(true);
      setAuthError("");

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      navigate("/login");
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const login = async (email, password) => {
    try {
      setIsSubmitting(true);
      setAuthError("");

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
      navigate("/");
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    navigate("/login");
  };

  if (isCheckingSession) {
    return (
      <div className="container">
        <p>Checking session...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <Nav user={user} onLogout={logout} />

      <Routes>
        <Route
          path="/login"
          element={
            <LoginPage
              onLogin={login}
              authError={authError}
              isSubmitting={isSubmitting}
            />
          }
        />

        <Route
          path="/register"
          element={
            <RegisterPage
              onRegister={register}
              authError={authError}
              isSubmitting={isSubmitting}
            />
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute user={user}>
              <div style={{ padding: "20px" }}>
                <h1>Welcome to Airbnb Explorer</h1>
                <p>Browse listings and share your reviews.</p>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
