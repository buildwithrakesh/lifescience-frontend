import React, { useState } from "react";
import { X, Mail, Lock, User, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ isOpen, onClose }) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let res;
      if (isSignUp) {
        if (!name.trim()) {
          setError("Please enter your name");
          setLoading(false);
          return;
        }
        res = await signUpWithEmail(email, password, name);
      } else {
        res = await signInWithEmail(email, password);
      }

      if (res.success) {
        onClose();
      } else {
        setError(res.error || "Authentication failed. Please check your credentials.");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.success) {
        onClose();
      } else {
        setError(res.error || "Google Sign-in was cancelled or failed.");
      }
    } catch (err) {
      setError(err.message || "Google sign-in error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
        display: "grid",
        placeItems: "center",
        zIndex: 99999,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 420,
          padding: "28px 24px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            background: "#f0f4f1",
            border: "none",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            color: "#12452c",
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h2 style={{ font: "800 22px Manrope, sans-serif", color: "#0d3822", margin: "0 0 6px" }}>
            {isSignUp ? "Create Life Science Account" : "Welcome Back"}
          </h2>
          <p style={{ font: "500 13px 'DM Sans', sans-serif", color: "#617c69", margin: 0 }}>
            {isSignUp
              ? "Join India's trusted animal healthcare platform"
              : "Sign in to access your orders, track shipments & get updates"}
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: 10,
              color: "#b91c1c",
              fontSize: 12.5,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-in Button */}
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={loading}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "11px 16px",
            borderRadius: 12,
            background: "#fff",
            border: "1.5px solid #d4dfd6",
            fontSize: 14,
            fontWeight: 700,
            color: "#1c3826",
            cursor: "pointer",
            transition: "0.2s",
            boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "18px 0",
            color: "#8a9e91",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <div style={{ flex: 1, height: 1, background: "#e2ebd8" }} />
          <span>OR WITH EMAIL</span>
          <div style={{ flex: 1, height: 1, background: "#e2ebd8" }} />
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {isSignUp && (
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#234931", marginBottom: 5 }}>
                Full Name
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 38px",
                    borderRadius: 10,
                    border: "1.5px solid #d4dfd6",
                    fontSize: 13.5,
                    boxSizing: "border-box",
                  }}
                />
                <User size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8a9e91" }} />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#234931", marginBottom: 5 }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px 10px 38px",
                  borderRadius: 10,
                  border: "1.5px solid #d4dfd6",
                  fontSize: 13.5,
                  boxSizing: "border-box",
                }}
              />
              <Mail size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8a9e91" }} />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#234931", marginBottom: 5 }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px 10px 38px",
                  borderRadius: 10,
                  border: "1.5px solid #d4dfd6",
                  fontSize: 13.5,
                  boxSizing: "border-box",
                }}
              />
              <Lock size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8a9e91" }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 6,
              padding: "12px 18px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #12452c, #0a291a)",
              color: "#fff",
              border: "none",
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(18,69,44,0.25)",
            }}
          >
            <span>{loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Toggle Sign in / Sign up */}
        <div style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "#5a7563" }}>
          {isSignUp ? "Already have an account?" : "Don't have an account yet?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#12452c",
              fontWeight: 800,
              cursor: "pointer",
              textDecoration: "underline",
              padding: 0,
            }}
          >
            {isSignUp ? "Sign In" : "Sign Up Free"}
          </button>
        </div>
      </div>
    </div>
  );
}
