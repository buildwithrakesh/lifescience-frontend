import React, { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Filter, SlidersHorizontal, ArrowUpDown, X, Check, Search } from "lucide-react";
import { products } from "../data/products";
import { animals } from "../data/animals";
import ProductCard from "../components/ProductCard";
import OffersCarousel from "../components/OffersCarousel";
import { matchesAnimal } from "../utils/filterUtils";
import { apiFetch } from "../utils/api";

export default function AllProducts({ add, onToast }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const animalParam = searchParams.get("animal") || "";
  const categoryParam = searchParams.get("category") || "";
  const queryParam = searchParams.get("q") || "";

  const resolveAnimalName = (raw) => {
    if (!raw || raw === "all") return "all";
    const rawLower = raw.toLowerCase().trim();
    const matched = animals.find(
      (a) =>
        a.name.toLowerCase() === rawLower ||
        ((rawLower.includes("dog") || rawLower.includes("pet") || rawLower.includes("canine")) && a.name.toLowerCase() === "dog") ||
        ((rawLower.includes("cow") || rawLower.includes("cattle") || rawLower.includes("bovine")) && a.name.toLowerCase() === "cow") ||
        ((rawLower.includes("cock") || rawLower.includes("poultry") || rawLower.includes("hen") || rawLower.includes("chicken") || rawLower.includes("broiler") || rawLower.includes("rooster")) && a.name.toLowerCase() === "cock") ||
        ((rawLower.includes("fish") || rawLower.includes("aquaculture") || rawLower.includes("aqua")) && a.name.toLowerCase() === "fish")
    );
    return matched ? matched.name : raw;
  };

  const [selectedAnimal, setSelectedAnimal] = useState(() => resolveAnimalName(animalParam));
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "all");
  const [selectedFormulation, setSelectedFormulation] = useState("all");
  const [maxPrice, setMaxPrice] = useState(2500);
  const [sortBy, setSortBy] = useState("popular");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(queryParam);
  const [productList, setProductList] = useState(() => {
    try {
      const cached = localStorage.getItem("lifescience_cached_products");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return products;
  });

  // Load published products from API
  useEffect(() => {
    let isMounted = true;
    apiFetch("/api/products?limit=200")
      .then((res) => {
        if (isMounted && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const apiProducts = res.data.map((p) => ({
            ...p,
            img: p.images?.main || p.imageUrl || p.img,
            desc: p.description || p.tagline || p.desc,
            animals: p.suitableFor?.length ? p.suitableFor : p.targetAnimals || [],
          }));
          setProductList(apiProducts);
          try {
            localStorage.setItem("lifescience_cached_products", JSON.stringify(apiProducts));
          } catch {}
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync state whenever URL search parameters change (from Header, sidebar, internal links, browser navigation)
  useEffect(() => {
    const urlAnimal = searchParams.get("animal");
    const urlCategory = searchParams.get("category");
    const urlQuery = searchParams.get("q");

    setSelectedAnimal(resolveAnimalName(urlAnimal));
    setSelectedCategory(urlCategory && urlCategory !== "all" ? urlCategory : "all");
    setMobileSearch(urlQuery || "");
  }, [searchParams]);

  // Formulations list
  const formulations = [
    { id: "all", name: "All Formulations" },
    { id: "tonic", name: "Liquid Tonics & Syrups" },
    { id: "powder", name: "Powders & Premixes" },
    { id: "gel", name: "Ionic Gels & Bolus" }
  ];

  // Categories list
  const categories = [
    { id: "all", name: "All Categories" },
    { id: "cattle-dairy", name: "Cow & Dairy Essentials" },
    { id: "liver-digestive", name: "Digestion & Liver Tonics" },
    { id: "poultry-pets", name: "Poultry, Pets & Specialized" }
  ];

  // Handlers that update both local state and URL query params
  const handleSelectAnimal = (animalName) => {
    const val = animalName || "all";
    setSelectedAnimal(val);
    const newParams = new URLSearchParams(searchParams);
    if (!val || val === "all") {
      newParams.delete("animal");
    } else {
      newParams.set("animal", val);
    }
    setSearchParams(newParams);
  };

  const handleSelectCategory = (catId) => {
    const val = catId || "all";
    setSelectedCategory(val);
    const newParams = new URLSearchParams(searchParams);
    if (!val || val === "all") {
      newParams.delete("category");
    } else {
      newParams.set("category", val);
    }
    setSearchParams(newParams);
  };

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return productList
      .filter((p) => {
        // Animal Filter via accurate matching utility
        if (selectedAnimal && selectedAnimal !== "all") {
          if (!matchesAnimal(p, selectedAnimal)) {
            return false;
          }
        }

        // Category Filter
        if (selectedCategory && selectedCategory !== "all") {
          const catMatch =
            p.category === selectedCategory ||
            (selectedCategory === "cattle-dairy" &&
              ["Animal Nutrition & Minerals", "Milk Production & Udder Care", "Reproductive & Pregnancy Care"].includes(p.category)) ||
            (selectedCategory === "liver-digestive" &&
              ["Digestive & Metabolic Health", "Deworming & Parasite Control"].includes(p.category)) ||
            (selectedCategory === "poultry-pets" &&
              (p.category === "Skin & External Care" ||
                ![
                  "cattle-dairy",
                  "liver-digestive",
                  "Animal Nutrition & Minerals",
                  "Milk Production & Udder Care",
                  "Reproductive & Pregnancy Care",
                  "Digestive & Metabolic Health",
                  "Deworming & Parasite Control",
                ].includes(p.category)));
          if (!catMatch) return false;
        }

        // Formulation Filter
        if (selectedFormulation !== "all") {
          const typeLower = (p.type || "").toLowerCase();
          const nameLower = (p.name || "").toLowerCase();
          if (selectedFormulation === "tonic" && !typeLower.includes("tonic") && !typeLower.includes("syrup") && !nameLower.includes("tonic")) {
            return false;
          }
          if (selectedFormulation === "powder" && !typeLower.includes("powder") && !typeLower.includes("mix") && !nameLower.includes("powder")) {
            return false;
          }
          if (selectedFormulation === "gel" && !typeLower.includes("gel") && !typeLower.includes("bolus") && !nameLower.includes("gel")) {
            return false;
          }
        }

        // Price Filter
        if (p.price > maxPrice) return false;

        // Mobile Search Filter
        if (mobileSearch.trim()) {
          const term = mobileSearch.trim().toLowerCase();
          const pName = (p.name || "").toLowerCase();
          const pDesc = (p.desc || "").toLowerCase();
          const pType = (p.type || "").toLowerCase();
          const pTarget = (p.target || "").toLowerCase();
          const pComp = (p.composition || "").toLowerCase();
          const pSpecies = Array.isArray(p.animals) ? p.animals.join(" ").toLowerCase() : (p.animal || "").toLowerCase();

          const matches =
            pName.includes(term) ||
            pDesc.includes(term) ||
            pType.includes(term) ||
            pTarget.includes(term) ||
            pComp.includes(term) ||
            pSpecies.includes(term);

          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        return (a.sortOrder ?? a.displayOrder ?? 999) - (b.sortOrder ?? b.displayOrder ?? 999);
      });
  }, [productList, selectedAnimal, selectedCategory, selectedFormulation, maxPrice, sortBy, mobileSearch]);

  const handleClearMobileSearch = () => {
    setMobileSearch("");
    if (searchParams.has("q")) {
      const next = new URLSearchParams(searchParams);
      next.delete("q");
      setSearchParams(next, { replace: true });
    }
  };

  const resetFilters = () => {
    setSelectedAnimal("all");
    setSelectedCategory("all");
    setSelectedFormulation("all");
    setMaxPrice(2500);
    setSortBy("popular");
    setMobileSearch("");
    setMobileFilterOpen(false);
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters = Boolean(
    (selectedAnimal && selectedAnimal !== "all") ||
    (selectedCategory && selectedCategory !== "all") ||
    selectedFormulation !== "all" ||
    maxPrice < 2500 ||
    mobileSearch.trim()
  );

  return (
    <div className="page-wrap all-products-page">
      {/* ── Redesigned Organic Products Hero Banner with Inline Offers ── */}
      <section className="products-hero-section">
        <div className="container">
          <div className="products-hero-banner-card">
            {/* Decorative Flowing Organic Green Waves */}
            <svg
              className="products-hero-waves"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M0,96 C220,124 410,44 690,82 C910,112 1080,68 1200,32 L1200,120 L0,120 Z"
                fill="url(#phWaveLight)"
              />
              <path
                d="M0,108 C280,132 520,76 820,98 C1010,112 1120,74 1200,52 L1200,120 L0,120 Z"
                fill="url(#phWaveMain)"
              />
              <defs>
                <linearGradient id="phWaveLight" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#bce78b" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#93d656" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#65b836" stopOpacity="0.55" />
                </linearGradient>
                <linearGradient id="phWaveMain" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a2dd6a" stopOpacity="0.65" />
                  <stop offset="55%" stopColor="#77c344" stopOpacity="0.42" />
                  <stop offset="100%" stopColor="#3c9624" stopOpacity="0.82" />
                </linearGradient>
              </defs>
            </svg>

            {/* Subtle Floating Botanical Leaves on Right Edge */}
            <div className="products-hero-leaves" aria-hidden="true">
              <svg className="ph-leaf ph-leaf-1" viewBox="0 0 48 32" fill="none">
                <path d="M4 28 C10 8, 28 2, 44 4 C38 22, 22 30, 4 28 Z" fill="url(#phLeafG1)" />
                <path d="M6 26 C18 18, 30 12, 40 6" stroke="#c8f58e" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
                <defs>
                  <linearGradient id="phLeafG1" x1="4" y1="28" x2="44" y2="4" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#2e7d22" />
                    <stop offset="1" stopColor="#7ed33a" />
                  </linearGradient>
                </defs>
              </svg>
              <svg className="ph-leaf ph-leaf-2" viewBox="0 0 38 26" fill="none">
                <path d="M3 22 C8 6, 22 2, 35 4 C30 18, 18 24, 3 22 Z" fill="url(#phLeafG2)" />
                <defs>
                  <linearGradient id="phLeafG2" x1="3" y1="22" x2="35" y2="4" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3c8f29" />
                    <stop offset="1" stopColor="#94df52" />
                  </linearGradient>
                </defs>
              </svg>
              <svg className="ph-leaf ph-leaf-3" viewBox="0 0 42 28" fill="none">
                <path d="M4 24 C10 8, 25 2, 39 5 C34 19, 20 26, 4 24 Z" fill="url(#phLeafG3)" />
                <defs>
                  <linearGradient id="phLeafG3" x1="4" y1="24" x2="39" y2="5" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#22681a" />
                    <stop offset="1" stopColor="#65b836" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="products-hero-inner">
              <div className="products-hero-left">
                <div className="page-breadcrumbs products-hero-crumbs">
                  <Link to="/">Home</Link>
                  <span>/</span>
                  <b>All Products</b>
                </div>
                <h1>All Products</h1>
                <p>
                  Scientifically formulated veterinary pharmaceuticals, mineral mixtures and wellness tonics.
                </p>
                <span className="products-hero-accent-bar" aria-hidden="true" />
              </div>

              <OffersCarousel inline />
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Catalog Grid & Filter Sidebar ── */}
      <section className="container catalog-container">
        {/* Mobile Search Bar (Phone screens only) */}
        <div className="mobile-products-search-bar">
          <div className="mobile-search-input-wrap">
            <Search size={16} className="mobile-search-icon" />
            <input
              type="text"
              placeholder="Search in all products..."
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              aria-label="Search all products"
            />
            {mobileSearch && (
              <button
                type="button"
                className="mobile-search-clear-btn"
                onClick={handleClearMobileSearch}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          {mobileSearch && (
            <div className="mobile-search-result-count">
              Found {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} matching "{mobileSearch}"
            </div>
          )}
        </div>

        {/* Mobile Filter Toggle */}
        <div className="catalog-mobile-bar">
          <button
            className="catalog-mobile-filter-btn"
            onClick={() => setMobileFilterOpen(true)}
          >
            <SlidersHorizontal size={16} /> Filters {hasActiveFilters && "(Active)"}
          </button>
          <div className="catalog-sort-mobile">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
            >
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="catalog-layout">
          {/* ── Filter Sidebar ── */}
          <aside className={`catalog-sidebar ${mobileFilterOpen ? "mobile-open" : ""}`}>
            <div className="sidebar-header">
              <h3>Filters</h3>
              <div className="sidebar-actions">
                {hasActiveFilters && (
                  <button type="button" className="clear-filter-btn" onClick={resetFilters}>
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  className="sidebar-close-btn"
                  onClick={() => setMobileFilterOpen(false)}
                  aria-label="Close filters"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Filter Section: Animal Species */}
            <div className="filter-group">
              <h4 className="filter-group-title">Target Species</h4>
              <div className="filter-options-list">
                <label className="filter-radio-item">
                  <input
                    type="radio"
                    name="animalSpecies"
                    checked={!selectedAnimal || selectedAnimal === "all"}
                    onChange={() => handleSelectAnimal("all")}
                  />
                  <span>All Species</span>
                </label>
                {animals.map((a) => (
                  <label className="filter-radio-item" key={a.name}>
                    <input
                      type="radio"
                      name="animalSpecies"
                      checked={selectedAnimal.toLowerCase() === a.name.toLowerCase()}
                      onChange={() => handleSelectAnimal(a.name)}
                    />
                    <span>{a.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Section: Category */}
            <div className="filter-group">
              <h4 className="filter-group-title">Product Category</h4>
              <div className="filter-options-list">
                {categories.map((c) => (
                  <label className="filter-radio-item" key={c.id}>
                    <input
                      type="radio"
                      name="categoryFilter"
                      checked={selectedCategory === c.id || (!selectedCategory && c.id === "all")}
                      onChange={() => handleSelectCategory(c.id)}
                    />
                    <span>{c.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Section: Formulation */}
            <div className="filter-group">
              <h4 className="filter-group-title">Formulation</h4>
              <div className="filter-options-list">
                {formulations.map((f) => (
                  <label className="filter-radio-item" key={f.id}>
                    <input
                      type="radio"
                      name="formulationFilter"
                      checked={selectedFormulation === f.id}
                      onChange={() => setSelectedFormulation(f.id)}
                    />
                    <span>{f.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Section: Price Range */}
            <div className="filter-group">
              <h4 className="filter-group-title">Max Price: ₹{maxPrice}</h4>
              <div className="price-slider-wrap">
                <input
                  type="range"
                  min="200"
                  max="2500"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="price-slider"
                />
                <div className="price-slider-labels">
                  <span>₹200</span>
                  <span>₹2,500</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="button button-outline button-sm reset-filter-btn"
              onClick={resetFilters}
              style={{ width: "100%" }}
            >
              Reset Filters
            </button>
          </aside>

          {/* ── Products Column ── */}
          <main className="catalog-products-col">
            <div className="catalog-topbar">
              <div className="catalog-count">
                Showing <b>{filteredProducts.length}</b> {filteredProducts.length === 1 ? "product" : "products"}
                {mobileSearch.trim() && (
                  <span className="active-tag-chip">
                    Search: <b>"{mobileSearch.trim()}"</b>
                    <button
                      onClick={handleClearMobileSearch}
                      aria-label="Clear search query"
                      title="Clear search"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedAnimal && selectedAnimal !== "all" && (
                  <span className="active-tag-chip">
                    Species: <b>{selectedAnimal}</b>
                    <button
                      onClick={() => handleSelectAnimal("all")}
                      aria-label="Remove species filter"
                      title="Clear animal filter"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedCategory && selectedCategory !== "all" && (
                  <span className="active-tag-chip">
                    Category: <b>{categories.find(c => c.id === selectedCategory)?.name || selectedCategory}</b>
                    <button
                      onClick={() => handleSelectCategory("all")}
                      aria-label="Remove category filter"
                      title="Clear category filter"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>
              <div className="catalog-sort-desktop">
                <label>Sort By:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="product-grid catalog-grid">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} p={p} add={add} />
                ))}
              </div>
            ) : (
              <div className="catalog-empty-state">
                <div className="empty-icon-box">
                  <Search size={32} />
                </div>
                <h3>No Products Found</h3>
                <p>
                  {mobileSearch.trim()
                    ? <>We couldn't find any products matching <b>"{mobileSearch.trim()}"</b>.</>
                    : <>We couldn't find any products matching your selected filters.</>}
                </p>
                <button className="button button-lime" onClick={resetFilters}>
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
}
