import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "./firebaseConfig";

const VAPID_KEY =
  import.meta.env.VITE_FIREBASE_VAPID_KEY ||
  "BBafR-4i8gDfOetCC-QOqcwbW4qTszb0qVugairZcJKETtmUds5LCP9R-y0GJRdiWEPoNBMnVIQpxB6b-o8bC9A";

import { API_BASE_URL } from "../utils/api";
const API_BASE = `${API_BASE_URL}/api`;

// ── Pre-warm Service Worker in Background ──
let prewarmPromise = null;
export function prewarmServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (!prewarmPromise) {
    prewarmPromise = navigator.serviceWorker
      .register("/firebase-messaging-sw.js", { scope: "/" })
      .then((reg) => {
        // Also pre-warm messaging SDK
        getFirebaseMessaging();
        return reg;
      })
      .catch((err) => {
        console.warn("[Push SW prewarm warn]:", err);
        return null;
      });
  }
  return prewarmPromise;
}

// ── Save Token to MongoDB Atlas in Background ──
export async function saveTokenToBackend(token, role = "visitor") {
  try {
    const res = await fetch(`${API_BASE}/notifications/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        role,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        platform: "web",
      }),
    });
    return await res.json();
  } catch (err) {
    console.warn("[Push] Background token sync failed:", err);
    return null;
  }
}

// ── Background FCM Worker (Completely Non-Blocking) ──
export async function syncFCMTokenInBackground(role = "visitor") {
  try {
    let registration = null;
    if ("serviceWorker" in navigator) {
      registration =
        (await prewarmServiceWorker()) ||
        (await navigator.serviceWorker.ready).catch(() => null);
    }

    const messaging = await getFirebaseMessaging();
    if (!messaging) return;

    const currentToken = await getToken(messaging, {
      serviceWorkerRegistration: registration,
      vapidKey: VAPID_KEY,
    });

    if (currentToken) {
      localStorage.setItem("life_science_fcm_token", currentToken);
      localStorage.setItem("life_science_notifications_enabled", "true");
      await saveTokenToBackend(currentToken, role);
      console.log("[FCM] Background sync complete. Token registered.");
    }
  } catch (err) {
    console.warn("[FCM Background Sync]:", err.message);
  }
}

// ── Check if Notifications are currently active ──
export function isNotificationsActive() {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  const isGranted = Notification.permission === "granted";
  const userDisabled = localStorage.getItem("life_science_notifications_enabled") === "false";
  return isGranted && !userDisabled;
}

// ── Turn Off / Unsubscribe Notifications ──
export async function turnOffNotifications() {
  try {
    localStorage.setItem("life_science_notifications_enabled", "false");
    const token = localStorage.getItem("life_science_fcm_token");
    if (token) {
      fetch(`${API_BASE}/notifications/unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }).catch((e) => console.warn(e));
    }
    return { success: true };
  } catch (err) {
    console.warn("Error turning off notifications:", err);
    return { success: false, error: err.message };
  }
}

// ── Ultra-Fast Instant Permission Requester ──
export async function requestNotificationPermission(role = "visitor") {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return { success: false, error: "Notifications not supported in this browser" };
  }

  try {
    localStorage.setItem("life_science_notifications_enabled", "true");

    // If permission already granted, just sync token and reactivate
    if (Notification.permission === "granted") {
      syncFCMTokenInBackground(role);
      return { success: true, permission: "granted" };
    }

    // 1. Immediately request browser permission (Must be directly on user gesture)
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return {
        success: false,
        permission,
        message: "Notification permission was denied or dismissed.",
      };
    }

    // 2. Fire FCM registration in background without waiting / blocking the user
    syncFCMTokenInBackground(role);

    // 3. Return instantly
    return { success: true, permission: "granted" };
  } catch (error) {
    console.error("[FCM] Error requesting notification permission:", error);
    return { success: false, error: error.message };
  }
}

// ── Foreground Push Listener ──
export async function listenToForegroundMessages(callback) {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    console.log("[FCM Foreground Message]:", payload);
    if (callback) {
      callback(payload);
    }
  });
}
