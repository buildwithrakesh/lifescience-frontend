import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { preloadStaticPageForPath, prefetchStaticPages } from "./staticPages.jsx";
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

function renderApp() {
  createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Speed: info pages (About, FAQ, Policies, ...) are code-split. If the visitor lands directly on one of
// them, wait for that small chunk before the first render so the page still appears in one go
// (never wait longer than 3s; after that the normal loading placeholder is used).
let hasRendered = false;
const renderOnce = () => {
  if (hasRendered) return;
  hasRendered = true;
  renderApp();
};
const firstPageChunk = preloadStaticPageForPath(window.location.pathname);
if (firstPageChunk) {
  firstPageChunk.then(renderOnce, renderOnce);
  window.setTimeout(renderOnce, 3000);
} else {
  renderOnce();
}

// Then fetch the remaining info pages in the background once the page has loaded,
// so navigating to them later is as instant as before.
const schedulePrefetch = () => {
  const run = () => prefetchStaticPages();
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(run, { timeout: 4000 });
  } else {
    window.setTimeout(run, 2500);
  }
};
if (document.readyState === "complete") {
  schedulePrefetch();
} else {
  window.addEventListener("load", schedulePrefetch, { once: true });
}
