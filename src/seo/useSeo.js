import { useEffect } from "react";
import { SITE_URL, SITE_NAME, DEFAULT_TITLE, DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE } from "./site";

// Small, dependency-free head manager for this single-page app: sets <title>, meta description,
// robots, canonical, Open Graph / Twitter tags and an optional page-level JSON-LD block.
// Google renders JavaScript, so these per-page values are what it indexes.

const PAGE_JSONLD_ID = "seo-page-jsonld";

export function absoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return "";
  try {
    return new URL(pathOrUrl, SITE_URL + "/").href;
  } catch {
    return "";
  }
}

export function clampText(text, max = 160) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:–-]+$/, "") + "…";
}

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!href) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setPageJsonLd(data) {
  let el = document.getElementById(PAGE_JSONLD_ID);
  if (!data) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = PAGE_JSONLD_ID;
    document.head.appendChild(el);
  }
  // "<" escaped so text inside the JSON can never close the script tag
  el.textContent = JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * Apply SEO tags for the current page.
 * @param {object} seo
 * @param {string} [seo.title]        Page title (brand is appended automatically unless fullTitle is given)
 * @param {string} [seo.fullTitle]    Exact <title> to use
 * @param {string} [seo.description]
 * @param {string} [seo.path]         Canonical path, e.g. "/about" (omit for no canonical)
 * @param {string} [seo.image]        Social preview image (absolute or site-relative)
 * @param {string} [seo.type]         og:type ("website", "product", "article")
 * @param {boolean} [seo.noindex]     Keep this page out of search results
 * @param {object|object[]} [seo.jsonLd] Page-level structured data
 */
export function applySeo(seo = {}) {
  if (typeof document === "undefined") return;
  const title = seo.fullTitle || (seo.title ? `${seo.title} | ${SITE_NAME}` : DEFAULT_TITLE);
  const description = clampText(seo.description || DEFAULT_DESCRIPTION, 160);
  const canonical = seo.path ? absoluteUrl(seo.path) : "";
  const image = absoluteUrl(seo.image || DEFAULT_OG_IMAGE);

  document.title = title;
  upsertMeta("name", "description", description);
  upsertMeta(
    "name",
    "robots",
    seo.noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1"
  );
  upsertCanonical(seo.noindex ? "" : canonical);

  upsertMeta("property", "og:title", title);
  upsertMeta("property", "og:description", description);
  upsertMeta("property", "og:type", seo.type || "website");
  upsertMeta("property", "og:image", image);
  upsertMeta("property", "og:url", canonical || absoluteUrl(window.location.pathname));
  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", title);
  upsertMeta("name", "twitter:description", description);
  upsertMeta("name", "twitter:image", image);

  setPageJsonLd(seo.jsonLd || null);
}

// React hook: re-applies whenever the SEO values change.
export function useSeo(seo) {
  const key = seo ? JSON.stringify(seo) : "";
  useEffect(() => {
    if (seo) applySeo(seo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
