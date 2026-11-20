import { SITE_NAME } from "./site";
import { absoluteUrl, clampText } from "./useSeo";

// Builders for schema.org structured data (JSON-LD) used by individual pages.

export function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

// SEO values for a product detail page (title, description, canonical, Product + Breadcrumb JSON-LD).
export function productSeo(product, routeId) {
  const id = String(product.id || product.slug || routeId || "");
  const path = `/product/${encodeURIComponent(id)}`;
  const name = String(product.name || "Product").trim();
  const rawImage = product.images?.main || product.imageUrl || product.img || "";
  const image = /^https?:\/\//.test(rawImage) ? rawImage : rawImage ? absoluteUrl(rawImage) : "";
  const description =
    product.description || product.tagline || product.desc || `${name} by ${SITE_NAME} – veterinary animal health product.`;
  const animals = product.suitableFor?.length
    ? product.suitableFor
    : product.targetAnimals?.length
    ? product.targetAnimals
    : product.animals || [];
  const metaDescription = animals.length
    ? `${clampText(description, 120)} Suitable for ${animals.slice(0, 5).join(", ")}.`
    : description;
  const price = Number(product.price);

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: clampText(description, 500),
    sku: id,
    brand: { "@type": "Brand", name: SITE_NAME },
    url: absoluteUrl(path),
  };
  if (image) productLd.image = [image];
  if (product.category) productLd.category = String(product.category);
  if (price > 0) {
    productLd.offers = {
      "@type": "Offer",
      url: absoluteUrl(path),
      priceCurrency: "INR",
      price: String(price),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE_NAME },
    };
  }

  return {
    title: product.type ? `${name} – ${product.type}` : name,
    description: metaDescription,
    path,
    image: image || undefined,
    type: "product",
    jsonLd: [
      productLd,
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Products", path: "/products" },
        { name, path },
      ]),
    ],
  };
}

function isoDate(text) {
  const d = new Date(text);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
}

// SEO values for a Knowledge Centre article.
export function articleSeo(article) {
  const path = `/knowledge/${article.slug}`;
  const image = article.image ? absoluteUrl(article.image) : undefined;
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: clampText(article.title, 110),
    description: article.excerpt,
    mainEntityOfPage: absoluteUrl(path),
    author: article.author ? { "@type": "Person", name: article.author } : { "@type": "Organization", name: SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: absoluteUrl("/favicon-192x192.png") },
    },
  };
  if (image) articleLd.image = [image];
  const published = isoDate(article.date);
  if (published) articleLd.datePublished = published;

  return {
    title: article.title,
    description: article.excerpt,
    path,
    image,
    type: "article",
    jsonLd: [
      articleLd,
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Knowledge Centre", path: "/knowledge" },
        { name: article.title, path },
      ]),
    ],
  };
}

// FAQPage structured data from [{ q, a }] items.
export function faqJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items
      .filter((item) => item && item.q && item.a)
      .map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
  };
}
