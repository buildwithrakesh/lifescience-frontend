import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

// Automatically clear stale catalog/banner caches & any legacy non-FCM service workers on new rollout
// (preserves user cart, wishlist, profile & orders)
const APP_CACHE_VERSION = "2026-11-20-pricing-v1";
try {
  if (localStorage.getItem("lifescience_app_version") !== APP_CACHE_VERSION) {
    [
      "lifescience_cached_products",
      "lifescience_featured_posters",
      "lifescience_active_offers",
      "lifescience_hero_sliders",
      "vetora_cached_sliders",
    ].forEach((k) => localStorage.removeItem(k));
    localStorage.setItem("lifescience_app_version", APP_CACHE_VERSION);

    if (typeof window !== "undefined" && "caches" in window) {
      window.caches.keys().then((names) => {
        names.forEach((name) => window.caches.delete(name));
      }).catch(() => {});
    }
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => {
          const scriptUrl = reg.active?.scriptURL || reg.waiting?.scriptURL || reg.installing?.scriptURL || "";
          if (!scriptUrl.includes("firebase-messaging-sw.js")) {
            reg.unregister().catch(() => {});
          }
        });
      }).catch(() => {});
    }
  }
} catch {}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
