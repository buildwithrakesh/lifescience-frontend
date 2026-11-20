// Fast smooth scroll — duration ~380ms, ease-out feel
export function smoothScrollTo(targetY, duration = 380) {
  const startY = window.scrollY;
  const diff = targetY - startY;
  let start = null;
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function step(timestamp) {
    if (!start) start = timestamp;
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + diff * easeOutCubic(progress));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

export function handleAnchor(e) {
  const href = e.currentTarget?.getAttribute?.("href");
  if (!href || !href.startsWith("#")) return;
  const id = href.slice(1);
  const el = document.getElementById(id) || (id === "top" ? document.body : null);
  if (!el) return;
  e.preventDefault();
  const offset = id === "top" ? 0 : el.getBoundingClientRect().top + window.scrollY - 78;
  smoothScrollTo(offset, 380);
}

import { optimizeCloudinaryUrl } from "./api";

// Universal photo resolver: handles local assets, imported modules, backend URLs, Cloudinary, and Unsplash IDs
export const photo = (srcOrId, w = 900) => {
  if (!srcOrId) return "";
  if (
    typeof srcOrId === "string" &&
    (srcOrId.startsWith("http://") ||
      srcOrId.startsWith("https://") ||
      srcOrId.startsWith("/") ||
      srcOrId.startsWith("./") ||
      srcOrId.startsWith("../") ||
      srcOrId.startsWith("data:") ||
      srcOrId.startsWith("blob:") ||
      srcOrId.includes("assets"))
  ) {
    if (srcOrId.includes("cloudinary.com")) {
      return optimizeCloudinaryUrl(srcOrId, w);
    }
    return srcOrId;
  }
  return `https://images.unsplash.com/${srcOrId}?auto=format&fit=crop&w=${w}&q=85`;
};
