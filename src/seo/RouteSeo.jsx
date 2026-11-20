import { useLocation } from "react-router-dom";
import { useSeo } from "./useSeo";
import { DEFAULT_TITLE, DEFAULT_DESCRIPTION } from "./site";

// Default SEO (title, description, canonical, robots) for every route of the storefront.
// Rendered once in App.jsx before <main>, so pages with richer data (product, article, FAQ)
// can override these values with their own useSeo() call.

const PAGES = {
  "/": { fullTitle: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, path: "/" },
  "/products": {
    title: "All Veterinary Products – Cattle, Poultry & Pet Care",
    description:
      "Browse our full range of veterinary products: calcium & mineral supplements, milk boosters, liver & digestive tonics, dewormers and wound-care sprays for livestock, poultry and pets.",
    path: "/products",
  },
  "/animals": {
    title: "Shop by Animal – Cow, Buffalo, Goat, Sheep, Poultry, Dog & Fish",
    description:
      "Find the right veterinary medicines and supplements for every animal: cows, buffaloes, goats, sheep, poultry, dogs and fish. Quality animal health products delivered across India.",
    path: "/animals",
  },
  "/about": {
    title: "About Us – Veterinary Pharmaceutical Company in Pune, India",
    description:
      "Life Science Pharmaceutical develops quality veterinary medicines, mineral mixtures and nutritional supplements for healthier livestock, poultry and pets across India.",
    path: "/about",
  },
  "/contact": {
    title: "Contact Us – Viman Nagar, Pune",
    description:
      "Call +91 80947 30645 or email Lifesciencepharmaceutical@gmail.com. Visit us at 101, Turning Point, Viman Nagar, Pune, Maharashtra 411014. Mon–Sat, 9 AM–6 PM.",
    path: "/contact",
  },
  "/distributor": {
    title: "Become a Distributor – Veterinary Products Dealership",
    description:
      "Partner with Life Science Pharmaceutical as a distributor or retailer of veterinary medicines and animal health products in your region. Apply online today.",
    path: "/distributor",
  },
  "/faq": {
    title: "FAQs – Products, Orders, Shipping & Returns",
    description:
      "Answers to common questions about Life Science veterinary products, quality standards, payment options, shipping charges, delivery timelines and returns.",
    path: "/faq",
  },
  "/knowledge": {
    title: "Knowledge Centre – Animal Health Tips & Guides",
    description:
      "Expert guides on cattle, poultry, dog, goat and sheep health: preventing milk fever, managing heat stress, trace minerals, joint care and more.",
    path: "/knowledge",
  },
  "/privacy-policy": {
    title: "Privacy Policy",
    description: "How Life Science Pharmaceutical collects, uses and protects your personal information when you use our website.",
    path: "/privacy-policy",
  },
  "/terms-and-conditions": {
    title: "Terms & Conditions",
    description: "Terms and conditions for browsing and purchasing veterinary products on the Life Science Pharmaceutical website.",
    path: "/terms-and-conditions",
  },
  "/shipping-and-returns": {
    title: "Shipping & Returns Policy",
    description:
      "Shipping charges, delivery timelines across India and our return & refund policy for Life Science Pharmaceutical orders.",
    path: "/shipping-and-returns",
  },
};

// Alternate URLs that show the same page -> point search engines at one canonical URL.
const ALIASES = {
  "/shop-by-animal": "/animals",
  "/partner-with-us": "/distributor",
  "/privacy": "/privacy-policy",
  "/terms": "/terms-and-conditions",
  "/shipping-returns": "/shipping-and-returns",
  "/shipping": "/shipping-and-returns",
  "/returns": "/shipping-and-returns",
};

const PRIVATE_PAGES = {
  "/cart": "Shopping Cart",
  "/checkout": "Checkout",
  "/wishlist": "My Wishlist",
  "/search": "Search",
};

export function seoForLocation(pathname, search) {
  const path = String(pathname || "/").toLowerCase().replace(/\/+$/, "") || "/";
  const params = new URLSearchParams(search || "");

  if (path === "/products") {
    const query = params.get("q");
    if (query) {
      return { title: `Search results for "${query}"`, description: PAGES["/products"].description, noindex: true };
    }
    const animal = params.get("animal");
    if (animal) {
      return {
        title: `Veterinary Products for ${animal}`,
        description: `Shop veterinary medicines and supplements for ${animal}: health, nutrition and care products from Life Science Pharmaceutical, delivered across India.`,
        path: `/products?animal=${encodeURIComponent(animal)}`,
      };
    }
    return PAGES["/products"];
  }

  const canonicalPath = ALIASES[path] || path;
  if (PAGES[canonicalPath]) return PAGES[canonicalPath];
  if (PRIVATE_PAGES[path]) return { title: PRIVATE_PAGES[path], noindex: true };
  if (path === "/account" || path.startsWith("/account/")) return { title: "My Account", noindex: true };
  if (path === "/admin" || path.startsWith("/admin/")) return { title: "Admin", noindex: true };

  const product = path.match(/^\/product\/([^/]+)$/);
  if (product) return { title: "Product Details", path: `/product/${product[1]}` };
  const article = path.match(/^\/(?:knowledge|article)\/([^/]+)$/);
  if (article) return { title: "Animal Health Guide", path: `/knowledge/${article[1]}` };
  const category = path.match(/^\/category\/([^/]+)$/);
  if (category) return { title: "Product Category", path: `/category/${category[1]}` };

  // Unknown URL: the app shows the home page there; keep such duplicate URLs out of search results.
  return { fullTitle: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, noindex: true };
}

export default function RouteSeo() {
  const { pathname, search } = useLocation();
  useSeo(seoForLocation(pathname, search));
  return null;
}
