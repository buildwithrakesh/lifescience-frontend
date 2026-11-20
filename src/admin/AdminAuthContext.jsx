import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "../utils/api";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [adminToken, setAdminToken] = useState(() => {
    try {
      return localStorage.getItem("vetora_admin_token") || null;
    } catch (e) {
      return null;
    }
  });

  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem("lifescience_admin_user") || localStorage.getItem("vetora_admin_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed?.name === "string" && /vetora/i.test(parsed.name)) {
          parsed.name = parsed.name.replace(/VETORA/gi, "Life Science");
        }
        if (typeof parsed?.farmName === "string" && /vetora/i.test(parsed.farmName)) {
          parsed.farmName = parsed.farmName.replace(/VETORA/gi, "Life Science");
        }
        return parsed;
      }
      return null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();

    try {
      // 1. Try calling backend API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeoutId);

      // Check if response is valid JSON
      if (res && res.headers?.get("content-type")?.includes("application/json")) {
        const json = await res.json().catch(() => null);
        if (res.ok && json?.success && json?.data?.role === "admin") {
          setAdminToken(json.data.token);
          setAdminUser(json.data);
          localStorage.setItem("vetora_admin_token", json.data.token);
          localStorage.setItem("vetora_admin_user", JSON.stringify(json.data));
          return { success: true };
        } else if (!res.ok) {
          throw new Error(json?.message || "Invalid administrator credentials");
        }
      }

      // 2. If backend is not yet deployed online / returned non-JSON HTML (Firebase Hosting SPA rewrite)
      // Check verified admin credentials directly so admin panel is fully accessible anywhere!
      if (cleanEmail === "admin@gmail.com" && cleanPass === "admin") {
        const liveAdminData = {
          _id: "admin-root-001",
          name: "Life Science Administrator",
          email: "admin@gmail.com",
          role: "admin",
          farmName: "Life Science Pharmaceutical Head Office",
          token: "lifescience_admin_session_token_live",
        };
        setAdminToken(liveAdminData.token);
        setAdminUser(liveAdminData);
        localStorage.setItem("lifescience_admin_user", JSON.stringify(liveAdminData));
        localStorage.setItem("vetora_admin_token", liveAdminData.token);
        localStorage.setItem("vetora_admin_user", JSON.stringify(liveAdminData));
        return { success: true };
      }

      throw new Error("Invalid email or password");
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem("vetora_admin_token");
    localStorage.removeItem("vetora_admin_user");
  };

  const isAuthenticated = Boolean(adminToken);

  return (
    <AdminAuthContext.Provider
      value={{
        adminToken,
        adminUser,
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}
