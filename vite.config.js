import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Copies APP_CACHE_VERSION from src/main.jsx into index.html (placeholder __APP_CACHE_VERSION__) so the
// hero-image preload script in index.html stays in sync with main.jsx automatically when the version is bumped.
function appCacheVersionInHtml() {
  return {
    name: "app-cache-version-in-html",
    transformIndexHtml(html) {
      let version = "";
      try {
        const mainSrc = readFileSync(fileURLToPath(new URL("./src/main.jsx", import.meta.url)), "utf8");
        version = (mainSrc.match(/APP_CACHE_VERSION\s*=\s*["']([^"']+)["']/) || [])[1] || "";
      } catch {
        // If it cannot be read, the preload script simply falls back to the default slides.
      }
      return html.replace(/__APP_CACHE_VERSION__/g, version);
    },
  };
}

// SEO: fills __SITE_URL__ in index.html and generates sitemap.xml + robots.txt at build time.
// Product URLs come from the live API (if reachable within a few seconds) merged with the bundled
// product snapshot, so a slow/asleep backend never breaks or blocks the build.
function seoFiles() {
  const xmlEscape = (s) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

  async function liveProductIds(apiBase) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(`${apiBase}/api/products?limit=500`, { signal: controller.signal });
      const json = await res.json();
      return Array.isArray(json?.data) ? json.data.map((p) => p.id || p.slug).filter(Boolean) : [];
    } catch {
      return [];
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    name: "seo-files",
    transformIndexHtml: {
      order: "pre",
      async handler(html) {
        const { SITE_URL } = await import("./src/seo/site.js");
        return html.replace(/__SITE_URL__/g, SITE_URL.replace(/\/+$/, ""));
      },
    },
    async generateBundle() {
      const site = await import("./src/seo/site.js");
      const base = site.SITE_URL.replace(/\/+$/, "");
      const today = new Date().toISOString().slice(0, 10);

      const { products } = await import("./src/data/products.js");
      const snapshotIds = (products || []).map((p) => p.id || p.slug).filter(Boolean);
      const apiBase = (process.env.VITE_API_URL || "https://api.lifesciencepharmaceutical.in").replace(/\/api\/?$/, "").replace(/\/+$/, "");
      const liveIds = apiBase.includes("localhost") ? [] : await liveProductIds(apiBase);
      const productIds = [...new Set([...liveIds, ...snapshotIds])];

      let articleSlugs = [];
      try {
        const kc = readFileSync(fileURLToPath(new URL("./src/pages/KnowledgeCentre.jsx", import.meta.url)), "utf8");
        articleSlugs = [...kc.matchAll(/slug:\s*["']([^"']+)["']/g)].map((m) => m[1]);
      } catch {}

      const paths = [
        ...site.SITEMAP_STATIC_PATHS,
        ...site.SITEMAP_ANIMALS.map((a) => `/products?animal=${encodeURIComponent(a)}`),
        ...productIds.map((id) => `/product/${encodeURIComponent(id)}`),
        ...articleSlugs.map((slug) => `/knowledge/${encodeURIComponent(slug)}`),
      ];
      const urls = [...new Set(paths)]
        .map((p) => `  <url>\n    <loc>${xmlEscape(base + p)}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
        .join("\n");
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      });

      const robots = [
        "User-agent: *",
        "Allow: /",
        ...site.ROBOTS_DISALLOW.map((p) => `Disallow: ${p}`),
        "",
        `Sitemap: ${base}/sitemap.xml`,
        "",
      ].join("\n");
      this.emitFile({ type: "asset", fileName: "robots.txt", source: robots });

      console.log(
        `\n[seo-files] sitemap.xml: ${paths.length} URLs (${productIds.length} products: ${liveIds.length} from live API, ${snapshotIds.length} from snapshot; ${articleSlugs.length} articles) + robots.txt`
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), appCacheVersionInHtml(), seoFiles()],
  build: {
    target: "es2020",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("firebase") || id.includes("@firebase")) {
            return "firebase";
          }
          if (id.includes("lucide-react")) {
            return "lucide-icons";
          }
          if (
            id.includes("react-dom") ||
            id.includes("react-router") ||
            id.includes("/react/") ||
            id.includes("\\react\\") ||
            id.includes("scheduler")
          ) {
            return "react-vendor";
          }
        },
      },
    },
  },
});
