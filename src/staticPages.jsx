import React, { lazy, useState } from "react";

// Speed: the static / information pages are split out of the main JavaScript bundle, so a first-time
// visitor downloads ~20KB (gzip) / ~75KB (raw) less JavaScript before the home page can appear.
//
// Navigation stays exactly as instant as before:
//  - main.jsx waits for the current page's (small) chunk before the very first render, so a hard refresh
//    on e.g. /about still renders the whole page in one go (no loading flash);
//  - all of these chunks are prefetched in the background once the page has finished loading;
//  - once a chunk is in memory the page renders synchronously (no Suspense fallback at all).
function lazyPage(factory) {
  let Loaded = null;
  let pending = null;

  const load = () => {
    if (!pending) {
      pending = factory().then(
        (mod) => {
          Loaded = mod.default;
          return mod;
        },
        (err) => {
          pending = null; // allow a later retry
          throw err;
        }
      );
    }
    return pending;
  };

  const LazyComponent = lazy(load);

  function StaticPage(props) {
    // Decide once per mount, so the page is never re-mounted later (keeps state such as typed form input).
    const [Component] = useState(() => Loaded || LazyComponent);
    return <Component {...props} />;
  }
  StaticPage.preload = load;
  return StaticPage;
}

export const ShopByAnimal = lazyPage(() => import("./pages/ShopByAnimal"));
export const AboutPage = lazyPage(() => import("./pages/AboutPage"));
export const ContactPage = lazyPage(() => import("./pages/ContactPage"));
export const FAQPage = lazyPage(() => import("./pages/FAQPage"));
export const DistributorPage = lazyPage(() => import("./pages/DistributorPage"));
export const KnowledgeCentre = lazyPage(() => import("./pages/KnowledgeCentre"));
export const ArticlePage = lazyPage(() => import("./pages/ArticlePage"));
export const PrivacyPolicy = lazyPage(() => import("./pages/PrivacyPolicy"));
export const TermsAndConditions = lazyPage(() => import("./pages/TermsAndConditions"));
export const ShippingReturnsPage = lazyPage(() => import("./pages/ShippingReturnsPage"));

const ALL_STATIC_PAGES = [
  ShopByAnimal,
  AboutPage,
  ContactPage,
  FAQPage,
  DistributorPage,
  KnowledgeCentre,
  ArticlePage,
  PrivacyPolicy,
  TermsAndConditions,
  ShippingReturnsPage,
];

// Route paths below must stay in sync with the <Route> list in App.jsx.
const PAGE_BY_PATH = {
  "/animals": ShopByAnimal,
  "/shop-by-animal": ShopByAnimal,
  "/about": AboutPage,
  "/contact": ContactPage,
  "/faq": FAQPage,
  "/distributor": DistributorPage,
  "/partner-with-us": DistributorPage,
  "/knowledge": KnowledgeCentre,
  "/privacy-policy": PrivacyPolicy,
  "/privacy": PrivacyPolicy,
  "/terms-and-conditions": TermsAndConditions,
  "/terms": TermsAndConditions,
  "/shipping-and-returns": ShippingReturnsPage,
  "/shipping-returns": ShippingReturnsPage,
  "/shipping": ShippingReturnsPage,
  "/returns": ShippingReturnsPage,
};

// Starts loading the chunk of the static page that will render for `pathname`.
// Returns a promise, or null when the path is not one of the code-split static pages.
export function preloadStaticPageForPath(pathname) {
  const path = String(pathname || "").toLowerCase().replace(/\/+$/, "") || "/";
  let page = PAGE_BY_PATH[path] || null;
  if (!page && /^\/(knowledge|article)\/[^/]+$/.test(path)) page = ArticlePage;
  return page ? page.preload() : null;
}

// Loads every static page chunk in the background (used after the page has finished loading).
export function prefetchStaticPages() {
  ALL_STATIC_PAGES.forEach((page) => {
    page.preload().catch(() => {});
  });
}
