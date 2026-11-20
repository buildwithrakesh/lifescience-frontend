// Central SEO settings (also read by vite.config.js to build sitemap.xml / robots.txt and index.html tags).
//
// SITE_URL must be the public address where the website is live (the custom domain). If the address ever
// changes, change it here, rebuild and redeploy -
// canonical URLs, sitemap.xml, robots.txt and social-preview tags all update from this one value.
export const SITE_URL = "https://lifesciencepharmaceutical.in";

export const SITE_NAME = "Life Science Pharmaceutical";

export const DEFAULT_TITLE = "Life Science Pharmaceutical – Veterinary Medicines & Animal Health";

export const DEFAULT_DESCRIPTION =
  "Veterinary medicines & supplements for cows, buffaloes, goats, poultry and pets: calcium gels, mineral mixtures, liver tonics, dewormers. Delivery across India.";

// 1200x630 social-share image (Cloudinary crop of the first home banner).
export const DEFAULT_OG_IMAGE =
  "https://res.cloudinary.com/duqwahasz/image/upload/c_fill,g_auto,w_1200,h_630,f_jpg,q_auto/v1795069481/lifescience/sliders/iyeldcpl7lcwpwfhuhf7.jpg";

export const BUSINESS = {
  name: SITE_NAME,
  email: "Lifesciencepharmaceutical@gmail.com",
  telephone: "+91-8094730645",
  streetAddress: "101, Turning Point 1st, Opposite Rosary School, Viman Nagar",
  addressLocality: "Pune",
  addressRegion: "Maharashtra",
  postalCode: "411014",
  addressCountry: "IN",
};

// Animals offered as product filters (/products?animal=...) - used for sitemap.xml.
export const SITEMAP_ANIMALS = ["Cow", "Buffalo", "Cock", "Dog", "Goats", "Sheep", "Fish"];

// Public, indexable static pages - used for sitemap.xml.
export const SITEMAP_STATIC_PATHS = [
  "/",
  "/products",
  "/animals",
  "/knowledge",
  "/about",
  "/contact",
  "/distributor",
  "/faq",
  "/shipping-and-returns",
  "/privacy-policy",
  "/terms-and-conditions",
];

// Private / non-content pages: kept out of search results (robots.txt + noindex meta).
export const ROBOTS_DISALLOW = ["/admin", "/cart", "/checkout", "/account", "/wishlist", "/search"];
