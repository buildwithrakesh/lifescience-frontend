// Centralized API client with automatic base URL detection, timeout, and caching

const isLocalhost = typeof window !== "undefined" && (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
);

const envApi = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "").replace(/\/$/, "");

// In dev (localhost), connect to localhost:5000. In production, ALWAYS use the live Hostycare backend URL.
export const API_BASE_URL = isLocalhost
  ? (envApi || "http://localhost:5000")
  : (envApi && !envApi.includes("localhost") ? envApi : "https://api.lifesciencepharmaceutical.in");

export const optimizeCloudinaryUrl = (url, width = 1600) => {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("cloudinary.com") || !url.includes("/upload/")) return url;
  if (url.includes("/upload/f_auto") || url.includes("/upload/q_auto")) {
    if (width) {
      return url.replace(/(\/upload\/[^/]*?)w_\d+/, `$1w_${width}`);
    }
    return url;
  }
  const transform = width ? `f_auto,q_auto,w_${width}` : "f_auto,q_auto";
  return url.replace("/upload/", `/upload/${transform}/`);
};

export const resolveImageUrl = (url, fallback, width = 1600) => {
  if (!url) return fallback || "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return optimizeCloudinaryUrl(url, width);
  }
  // If it's a backend upload path
  if (url.startsWith("/uploads/")) {
    return `${API_BASE_URL}${url}`;
  }
  return url;
};

// Generic fetch with generous timeout (handles Render free-tier cold starts) and 1 retry for GET
export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
  const method = (options.method || "GET").toUpperCase();
  const maxAttempts = options.retry === false || method !== "GET" ? 1 : 2;
  const timeoutMs = options.timeout || 45000;

  const token = typeof localStorage !== "undefined" ? localStorage.getItem("vetora_admin_token") : null;
  // Speed: only declare a JSON body when one is actually sent. A plain GET without Content-Type is a
  // CORS "simple request", so the browser no longer sends an extra OPTIONS preflight round trip to the
  // API server before every product/offer/poster request. Requests that send a body are unchanged.
  const hasBody = options.body !== undefined && options.body !== null;
  const headers = {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // Retry transient Render cold-start 502/503/504 responses on GET
      if ([502, 503, 504].includes(res.status) && attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }

      const contentType = res.headers.get("content-type") || "";
      let data = null;
      if (contentType.includes("application/json")) {
        data = await res.json().catch(() => null);
      } else {
        throw new Error("Backend server is not reachable or returning HTML");
      }

      if (!res.ok) {
        throw new Error(data?.message || `HTTP ${res.status}: ${res.statusText}`);
      }
      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }
      throw lastError;
    }
  }
}
