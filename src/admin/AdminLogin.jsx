import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { useAdminAuth } from "./AdminAuthContext";
import mobileLogo from "../assets/vetora-mobile-logo.webp";
import "./adminStyles.css";

export default function AdminLogin() {
  const { login, loading, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState("");

  // If already authenticated, redirect to /admin
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await login(email, password);
    if (res.success) {
      navigate("/admin");
    } else {
      setError(res.error || "Invalid administrator credentials");
    }
  };

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <div className="admin-login-head">
          <img
            src={mobileLogo}
            alt="Life Science"
            style={{
              width: 60,
              height: 60,
              borderRadius: 14,
              objectFit: "contain",
              margin: "0 auto 12px",
              display: "block",
            }}
          />
          <h2>Admin Login</h2>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: 10,
              color: "#b91c1c",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 18,
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="admin-form-group">
            <label>Admin Email</label>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                style={{ width: "100%", paddingLeft: 38 }}
              />
              <Mail
                size={16}
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#889e8f" }}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin"
                style={{ width: "100%", paddingLeft: 38 }}
              />
              <Lock
                size={16}
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#889e8f" }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="admin-btn admin-btn-primary"
            style={{ justifyContent: "center", width: "100%", padding: 12, marginTop: 8 }}
          >
            <span>{loading ? "Signing in..." : "Enter Admin Panel"}</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
