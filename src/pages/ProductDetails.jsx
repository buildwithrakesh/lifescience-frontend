import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  ShieldCheck,
  Truck,
  RefreshCw,
  CheckCircle2,
  Plus,
  Minus,
  ShoppingCart,
  Zap,
  ArrowRight,
  Heart,
  FileText,
  Sparkles,
  Layers,
  HelpCircle,
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useShop } from "../context/ShopContext";
import { apiFetch, resolveImageUrl } from "../utils/api";
import { products as snapshotProducts } from "../data/products";

// Fast in-memory session cache so revisiting or switching products is 0ms
const productMemoryCache = new Map();
let catalogMemoryCache = null;

const readCachedCatalog = () => {
  if (Array.isArray(catalogMemoryCache) && catalogMemoryCache.length > 0) {
    return catalogMemoryCache;
  }
  try {
    const raw = localStorage.getItem("lifescience_cached_products");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        catalogMemoryCache = parsed;
        return parsed;
      }
    }
  } catch {}
  return snapshotProducts || [];
};

const matchesProductId = (p, targetId) => {
  if (!p || !targetId) return false;
  const clean = String(targetId).trim().toLowerCase();
  const pid = String(p.id || "").trim().toLowerCase();
  const pmid = String(p._id || "").trim().toLowerCase();
  const pslug = String(p.slug || "").trim().toLowerCase();
  const pname = String(p.name || "").trim().toLowerCase();
  return (
    pid === clean ||
    pmid === clean ||
    pslug === clean ||
    pname === clean ||
    pid === clean.replace("vetora-", "lifescience-") ||
    pid === clean.replace("lifescience-", "vetora-") ||
    clean === pid.replace("vetora-", "lifescience-") ||
    clean === pid.replace("lifescience-", "vetora-")
  );
};

const getInitialPackAndImage = (prod) => {
  if (!prod) return { pack: "", img: "" };
  const defaultMain = prod.images?.main || prod.imageUrl || prod.img || "";
  const firstPackLabel = prod.packing?.[0] || prod.packSizes?.[0]?.size || "";
  const firstPackObj = (prod.packSizes || []).find(
    (p) =>
      p?.size &&
      String(p.size).trim().toLowerCase() === String(firstPackLabel).trim().toLowerCase()
  );
  return {
    pack: firstPackLabel,
    img: firstPackObj?.image || defaultMain,
  };
};

const resolveInstantProduct = (targetId, routeStateProduct) => {
  if (matchesProductId(routeStateProduct, targetId)) return routeStateProduct;
  if (productMemoryCache.has(targetId)) return productMemoryCache.get(targetId);
  const cachedList = readCachedCatalog();
  const found = cachedList.find((p) => matchesProductId(p, targetId));
  return found || null;
};

export default function ProductDetails({ add, onToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") || "overview";

  const routeStateProduct = location.state?.product || null;

  const [product, setProduct] = useState(() =>
    resolveInstantProduct(id, routeStateProduct)
  );
  const [loading, setLoading] = useState(() => !resolveInstantProduct(id, routeStateProduct));
  const [notFound, setNotFound] = useState(false);
  const [allCatalogProducts, setAllCatalogProducts] = useState(() => readCachedCatalog());
  const [activeImg, setActiveImg] = useState(
    () => getInitialPackAndImage(resolveInstantProduct(id, routeStateProduct)).img
  );
  const [selectedPack, setSelectedPack] = useState(
    () => getInitialPackAndImage(resolveInstantProduct(id, routeStateProduct)).pack || "500ml"
  );

  const { addToCart, toggleWishlist, isInWishlist } = useShop();
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState(tabParam);

  // Sync instantly when switching between products (/product/a -> /product/b), then revalidate live DB data
  useEffect(() => {
    let isMounted = true;
    setQty(1);
    setActiveTab(tabParam);
    setNotFound(false);

    const instant = resolveInstantProduct(id, routeStateProduct);
    if (instant) {
      const init = getInitialPackAndImage(instant);
      setProduct(instant);
      setActiveImg(init.img);
      if (init.pack) setSelectedPack(init.pack);
      setLoading(false);
    } else {
      // Never show a dummy or previous product while cold-loading
      setProduct(null);
      setActiveImg("");
      setLoading(true);
    }

    apiFetch(`/api/products/${id}`)
      .then((res) => {
        if (isMounted && res.success && res.data) {
          const loaded = res.data;
          productMemoryCache.set(id, loaded);
          if (loaded.id) productMemoryCache.set(loaded.id, loaded);
          setProduct(loaded);
          const init = getInitialPackAndImage(loaded);
          if (init.pack) setSelectedPack(init.pack);
          setActiveImg(init.img);
          setLoading(false);
          setNotFound(false);
        } else if (isMounted && !instant) {
          setLoading(false);
          setNotFound(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoading(false);
          if (!instant) setNotFound(true);
        }
      });

    // Only fetch full catalog for Related Products if not already cached in memory/localStorage
    const cachedCatalog = readCachedCatalog();
    if (cachedCatalog.length > 0) {
      setAllCatalogProducts(cachedCatalog);
    } else {
      apiFetch("/api/products?limit=200")
        .then((res) => {
          if (isMounted && res.success && Array.isArray(res.data) && res.data.length > 0) {
            const normalized = res.data.map((p) => ({
              ...p,
              img: p.images?.main || p.imageUrl || p.img,
            }));
            catalogMemoryCache = normalized;
            setAllCatalogProducts(normalized);
            try {
              localStorage.setItem("lifescience_cached_products", JSON.stringify(normalized));
            } catch {}
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Preload alternate pack-size images on idle so switching packs swaps image in 0ms
  useEffect(() => {
    if (!product?.packSizes?.length) return;
    const urls = product.packSizes
      .map((p) => p?.image)
      .filter(Boolean)
      .map((u) => resolveImageUrl(u, "", 720));
    if (urls.length <= 1) return;

    const timer = window.setTimeout(() => {
      urls.forEach((src) => {
        const img = new Image();
        img.decoding = "async";
        img.src = src;
      });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [product?.id]);

  const isSaved = product ? isInWishlist(product) : false;

  const handleTabChange = (t) => {
    setActiveTab(t);
    setSearchParams(t === "overview" ? {} : { tab: t }, {
      replace: true,
      preventScrollReset: true,
    });
  };

  // Memoize pack sizes & related products
  const {
    defaultMainImage,
    availablePackSizes,
    activePackObj,
    currentPrice,
    mrpPrice,
    packImageThumbs,
    galleryImages,
    showThumbStrip,
    highlights,
    relatedProducts,
  } = useMemo(() => {
    if (!product) {
      return {
        defaultMainImage: "",
        availablePackSizes: [],
        activePackObj: null,
        currentPrice: 0,
        mrpPrice: 0,
        packImageThumbs: [],
        galleryImages: [],
        showThumbStrip: false,
        highlights: [],
        relatedProducts: [],
      };
    }

    const defMain = product.images?.main || product.imageUrl || product.img || "";
    const packMetaMap = new Map(
      (Array.isArray(product.packSizes) ? product.packSizes : [])
        .filter((p) => p && p.size)
        .map((p) => [String(p.size).trim().toLowerCase(), p])
    );

    const rawPackLabels =
      product.packing && product.packing.length > 0
        ? product.packing
        : Array.isArray(product.packSizes) && product.packSizes.length > 0
        ? product.packSizes.map((p) => p.size).filter(Boolean)
        : ["100ml", "250ml", "500ml", "1 Litre"];

    const packs = rawPackLabels.map((label, idx) => {
      const clean = String(label || "").trim();
      const meta = packMetaMap.get(clean.toLowerCase());
      return {
        size: clean,
        priceMultiplier:
          meta && typeof meta.priceMultiplier === "number" && meta.priceMultiplier > 0
            ? meta.priceMultiplier
            : idx === 0
            ? 1
            : Number((1 + idx * 0.4).toFixed(2)),
        price:
          meta && typeof meta.price === "number" && meta.price > 0 ? meta.price : null,
        mrp:
          meta && typeof meta.mrp === "number" && meta.mrp > 0 ? meta.mrp : null,
        image: meta?.image ? String(meta.image).trim() : "",
      };
    });

    const activePack = packs.find((p) => p.size === selectedPack) || packs[0];
    const mult = activePack?.priceMultiplier || 1;
    const baseMrp = product.mrp || (product.price ? Math.round(product.price * 1.25) : 750);
    const calculatedPackMrp = activePack?.mrp || (mult !== 1 ? Math.round(baseMrp * mult) : baseMrp);
    const mrp = calculatedPackMrp;
    const currPrice = activePack?.price
      ? Math.round(activePack.price)
      : Math.round(mrp * 0.8);

    const packThumbs = packs.filter((p) => Boolean(p.image));
    const galImgs = Array.isArray(product.images?.gallery)
      ? product.images.gallery.filter(Boolean)
      : [];

    const rawH = [
      ...(product.featuresAndBenefits || []),
      ...(product.advantages || []),
      ...(product.recommendations || []),
      ...(product.actions || []),
      ...(product.indications || []),
      ...(product.benefits || []),
    ]
      .map((x) => String(x || "").trim())
      .filter(Boolean);
    const uniqH = [...new Set(rawH)];
    const finalHighlights =
      uniqH.length > 0
        ? uniqH.slice(0, 6)
        : [
            "Targeted organ revitalization and metabolic balance",
            "Clinically backed bioavailability & rapid therapeutic uptake",
            "Improves appetite, vigor, and production yield",
            "Manufactured in GMP-certified veterinary facilities",
          ];

    const sameCat = allCatalogProducts.filter(
      (p) => p.id !== product.id && p.category === product.category
    );
    const related = (
      sameCat.length >= 4
        ? sameCat
        : [
            ...sameCat,
            ...allCatalogProducts.filter(
              (p) => p.id !== product.id && !sameCat.some((r) => r.id === p.id)
            ),
          ]
    ).slice(0, 4);

    return {
      defaultMainImage: defMain,
      availablePackSizes: packs,
      activePackObj: activePack,
      currentPrice: currPrice,
      mrpPrice: mrp,
      packImageThumbs: packThumbs,
      galleryImages: galImgs,
      showThumbStrip: packThumbs.length > 0 || galImgs.length > 0,
      highlights: finalHighlights,
      relatedProducts: related,
    };
  }, [product, selectedPack, allCatalogProducts]);

  // Clean skeleton when cold-loading a direct URL (zero dummy image flash!)
  if (loading || !product) {
    if (notFound) {
      return (
        <div className="page-wrap product-details-page">
          <div className="container" style={{ padding: "80px 16px", textAlign: "center" }}>
            <h2 style={{ color: "#12452c", marginBottom: 12 }}>Product Not Found</h2>
            <p style={{ color: "#4f6858", marginBottom: 20 }}>
              The product you are looking for may have been moved or updated.
            </p>
            <Link to="/products" className="button button-lime">
              Browse All Products
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="page-wrap product-details-page" aria-busy="true">
        <div className="container product-breadcrumb-wrap">
          <div className="page-breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/products">Products</Link>
            <span>/</span>
            <span
              style={{
                display: "inline-block",
                width: 110,
                height: 14,
                background: "#e5eee7",
                borderRadius: 6,
                verticalAlign: "middle",
              }}
            />
          </div>
        </div>
        <section className="container product-main-section">
          <div className="product-detail-layout">
            <div className="product-gallery-col">
              <div
                className="product-image-display"
                style={{
                  minHeight: 380,
                  background: "linear-gradient(90deg, #f1f5f2 25%, #e6efe8 50%, #f1f5f2 75%)",
                  borderRadius: 18,
                }}
              />
            </div>
            <div className="product-info-col" style={{ gap: 14 }}>
              <div style={{ height: 34, width: "65%", background: "#e9f0eb", borderRadius: 10 }} />
              <div style={{ height: 18, width: "45%", background: "#eef4f0", borderRadius: 8 }} />
              <div style={{ height: 64, width: "55%", background: "#eef4f0", borderRadius: 12, marginTop: 8 }} />
              <div style={{ height: 42, width: "80%", background: "#eef4f0", borderRadius: 10, marginTop: 12 }} />
              <div style={{ height: 48, width: "90%", background: "#e4ede7", borderRadius: 12, marginTop: 16 }} />
            </div>
          </div>
        </section>
      </div>
    );
  }

  const handleSelectPack = (packObj) => {
    setSelectedPack(packObj.size);
    setActiveImg(packObj.image || defaultMainImage);
  };

  const handleAddToCart = () => {
    const packImage = activePackObj?.image || defaultMainImage;
    const itemToAdd = {
      ...product,
      name: `${product.name} (${selectedPack})`,
      price: currentPrice,
      img: packImage,
      imageUrl: packImage,
      images: { ...(product.images || {}), main: packImage },
    };
    if (add) {
      add(itemToAdd);
    } else {
      addToCart(itemToAdd, qty);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/checkout");
  };

  // Optimized responsive Cloudinary width (w_720) for super-fast LCP on main product display
  const mainImageSrc = resolveImageUrl(activeImg || defaultMainImage, "", 720);

  return (
    <div className="page-wrap product-details-page">
      {/* ── Breadcrumb Bar ── */}
      <div className="container product-breadcrumb-wrap">
        <div className="page-breadcrumbs">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Products</Link>
          <span>/</span>
          <b>{product.name}</b>
        </div>
      </div>

      {/* ── Main Details Layout ── */}
      <section className="container product-main-section">
        <div className="product-detail-layout">
          {/* Left Column: Image Gallery */}
          <div className="product-gallery-col">
            <div className="product-image-display">
              <img
                src={mainImageSrc}
                alt={product.name}
                fetchPriority="high"
                decoding="sync"
              />
            </div>

            {/* Pack-Wise & Gallery Thumbnails */}
            {showThumbStrip && (
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 14,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                {packImageThumbs.length > 0 ? (
                  packImageThumbs.map((p) => {
                    const isActive =
                      selectedPack === p.size &&
                      (activeImg || defaultMainImage) === p.image;
                    return (
                      <button
                        key={`pack-thumb-${p.size}`}
                        type="button"
                        onClick={() => handleSelectPack(p)}
                        title={`View ${p.size} pack`}
                        style={{
                          border: isActive ? "2px solid #12452c" : "1px solid #d5e2d8",
                          borderRadius: 10,
                          padding: "4px 6px",
                          background: isActive ? "#f2f8f4" : "#fff",
                          minWidth: 64,
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <img
                          src={resolveImageUrl(p.image, "", 140)}
                          alt={`${product.name} ${p.size}`}
                          style={{ width: 52, height: 52, objectFit: "contain" }}
                        />
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            color: isActive ? "#12452c" : "#4b6355",
                            lineHeight: 1.1,
                          }}
                        >
                          {p.size}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveImg(defaultMainImage)}
                    style={{
                      border:
                        (activeImg || defaultMainImage) === defaultMainImage
                          ? "2px solid #12452c"
                          : "1px solid #ddd",
                      borderRadius: 8,
                      padding: 2,
                      background: "#fff",
                      width: 56,
                      height: 56,
                      cursor: "pointer",
                    }}
                  >
                    <img
                      src={resolveImageUrl(defaultMainImage, "", 120)}
                      alt="Main view"
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  </button>
                )}

                {galleryImages.map((gImg, idx) => (
                  <button
                    key={`gal-${idx}`}
                    type="button"
                    onClick={() => setActiveImg(gImg)}
                    style={{
                      border:
                        (activeImg || defaultMainImage) === gImg
                          ? "2px solid #12452c"
                          : "1px solid #ddd",
                      borderRadius: 10,
                      padding: 4,
                      background: "#fff",
                      width: 60,
                      height: packImageThumbs.length > 0 ? 74 : 56,
                      cursor: "pointer",
                    }}
                  >
                    <img
                      src={resolveImageUrl(gImg, "", 120)}
                      alt={`Angle ${idx + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="product-trust-badges">
              <div className="trust-badge-item">
                <ShieldCheck size={18} />
                <span>100% Genuine Pharma</span>
              </div>
              <div className="trust-badge-item">
                <Truck size={18} />
                <span>Fast Nationwide Delivery</span>
              </div>
              <div className="trust-badge-item">
                <RefreshCw size={18} />
                <span>Quality Tested</span>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Options & Buy Buttons */}
          <div className="product-info-col">
            <h1 className="product-detail-title">{product.name}</h1>
            <p className="product-detail-type">
              {product.tagline || product.type || "Veterinary Formulation"}
            </p>

            {/* Price Row */}
            <div className="product-price-box">
              <div className="price-main-line">
                <span className="price-curr">₹{currentPrice}</span>
                <span className="price-mrp">₹{mrpPrice}</span>
                <span className="price-discount">20% OFF</span>
              </div>
              <small className="price-tax-note">Inclusive of all taxes • Free shipping above ₹999</small>
            </div>

            {/* Pack Size Selector */}
            <div className="product-option-group">
              <label className="option-label">Select Pack Size:</label>
              <div className="pack-size-pills">
                {availablePackSizes.map((p) => (
                  <button
                    key={p.size}
                    type="button"
                    className={`pack-pill ${selectedPack === p.size ? "active" : ""}`}
                    onClick={() => handleSelectPack(p)}
                  >
                    {p.size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="product-qty-row">
              <label className="option-label">Quantity:</label>
              <div className="qty-counter">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span>{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* CTA Action Buttons */}
            <div className="product-cta-actions">
              <button
                type="button"
                className="button button-outline add-to-cart-cta"
                onClick={handleAddToCart}
              >
                <ShoppingCart size={18} /> Add to Cart
              </button>
              <button
                type="button"
                className="button button-lime buy-now-cta"
                onClick={handleBuyNow}
              >
                <Zap size={18} /> Buy Now
              </button>
              <button
                type="button"
                className={`button button-outline product-wishlist-btn ${isSaved ? "saved" : ""}`}
                onClick={() => toggleWishlist(product)}
                aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
                title={isSaved ? "Saved in wishlist" : "Save to wishlist"}
              >
                <Heart
                  size={18}
                  fill={isSaved ? "#bd4c4c" : "none"}
                  color={isSaved ? "#bd4c4c" : "currentColor"}
                />
                {isSaved ? "Saved" : "Wishlist"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tabbed Content Section ── */}
      <section className="container product-tabs-section">
        <div className="product-tabs-header">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => handleTabChange("overview")}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === "composition" ? "active" : ""}`}
            onClick={() => handleTabChange("composition")}
          >
            Composition
          </button>
          <button
            className={`tab-btn ${activeTab === "benefits" ? "active" : ""}`}
            onClick={() => handleTabChange("benefits")}
          >
            Clinical Benefits
          </button>
          <button
            className={`tab-btn ${activeTab === "dosage" ? "active" : ""}`}
            onClick={() => handleTabChange("dosage")}
          >
            Dosage
          </button>
          {product.images?.poster && (
            <button
              className={`tab-btn ${activeTab === "poster" ? "active" : ""}`}
              onClick={() => handleTabChange("poster")}
            >
              Product Poster
            </button>
          )}
          <button
            className={`tab-btn ${activeTab === "precautions" ? "active" : ""}`}
            onClick={() => handleTabChange("precautions")}
          >
            Storage & Precautions
          </button>
        </div>

        <div className="product-tab-body">
          {/* Tab 1: Overview */}
          {activeTab === "overview" && (
            <div className="tab-pane tab-overview">
              <h3>Product Description</h3>
              <p>
                <b>{product.name}</b>{" "}
                {product.description ||
                  product.tagline ||
                  "is an advanced veterinary formulation designed to deliver balanced nutritional therapy and therapeutic organ support. Produced in GMP-certified facilities with pharmaceutical-grade standards, it offers consistent purity and high biological availability."}
              </p>
              {product.suitableFor?.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <b>Indicated For: </b>
                  <span style={{ color: "var(--admin-primary)", fontWeight: 700 }}>
                    {product.suitableFor.join(", ")}
                  </span>
                </div>
              )}
              {product.usages?.filter(Boolean).length > 0 && (
                <div className="overview-features-box" style={{ marginTop: 16 }}>
                  {product.usages.filter(Boolean).map((u, i) => (
                    <div key={i} className="feature-item">
                      <b>Usage:</b> {u}
                    </div>
                  ))}
                </div>
              )}

              {/* Key Benefits & Clinical Highlights */}
              {highlights.length > 0 && (
                <div
                  className="product-key-benefits-down"
                  style={{
                    marginTop: 24,
                    padding: "20px 22px",
                    background: "#f4f8f3",
                    borderRadius: 16,
                    border: "1.5px solid #dce8d6",
                  }}
                >
                  <h4
                    style={{
                      font: "800 15px Manrope",
                      color: "#0c3820",
                      margin: "0 0 14px",
                    }}
                  >
                    Key Benefits & Highlights
                  </h4>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {highlights.map((pt, idx) => (
                      <li
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          background: "#ffffff",
                          padding: "11px 14px",
                          borderRadius: 10,
                          border: "1px solid #e1ebd8",
                          fontSize: 13,
                          color: "#274a34",
                          lineHeight: 1.45,
                          fontWeight: 500,
                        }}
                      >
                        <CheckCircle2 size={16} color="#166534" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Composition */}
          {activeTab === "composition" && (
            <div className="tab-pane tab-composition">
              <h3>Composition & Active Ingredients</h3>
              <p className="tab-sub-note">
                Each standard dose / container contains pharmaceutical-grade actives:
              </p>

              {product.compositionTable && product.compositionTable.length > 0 ? (
                <div className="composition-table-wrap">
                  <table className="composition-table">
                    <thead>
                      <tr>
                        <th>Active Ingredient</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.compositionTable.map((row, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 700 }}>{row.ingredient}</td>
                          <td>{row.quantity}</td>
                          <td>{row.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : product.composition ? (
                <div
                  style={{
                    background: "#f0f6f2",
                    padding: 18,
                    borderRadius: 12,
                    fontSize: 14.5,
                    lineHeight: 1.6,
                    color: "#1c2e22",
                  }}
                >
                  <b>Composition: </b> {product.composition}
                </div>
              ) : (
                <div className="composition-table-wrap">
                  <table className="composition-table">
                    <thead>
                      <tr>
                        <th>Active Ingredient</th>
                        <th>Quantity</th>
                        <th>Function</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Active Phyto-Herbal Complex</td>
                        <td>Standardized</td>
                        <td>Therapeutic physiological support</td>
                      </tr>
                      <tr>
                        <td>Excipients</td>
                        <td>q.s.</td>
                        <td>Aqueous palatable vehicle</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Benefits & Clinical Info */}
          {activeTab === "benefits" && (
            <div className="tab-pane tab-benefits">
              <h3>Clinical Benefits & Indications</h3>

              {/* Features & Benefits */}
              {product.featuresAndBenefits?.filter(Boolean).length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ color: "#12452c", marginBottom: 10 }}>Features & Benefits:</h4>
                  <ul className="benefits-checklist">
                    {product.featuresAndBenefits.filter(Boolean).map((pt, idx) => (
                      <li key={idx}>
                        <CheckCircle2 size={18} />
                        <div>{pt}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Advantages */}
              {product.advantages?.filter(Boolean).length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ color: "#12452c", marginBottom: 10 }}>Advantages:</h4>
                  <ul className="benefits-checklist">
                    {product.advantages.filter(Boolean).map((pt, idx) => (
                      <li key={idx}>
                        <Sparkles size={18} color="#6ca338" />
                        <div>{pt}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {product.recommendations?.filter(Boolean).length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ color: "#12452c", marginBottom: 10 }}>Recommendations:</h4>
                  <ul className="benefits-checklist">
                    {product.recommendations.filter(Boolean).map((pt, idx) => (
                      <li key={idx}>
                        <CheckCircle2 size={18} />
                        <div>{pt}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              {product.actions?.filter(Boolean).length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ color: "#12452c", marginBottom: 10 }}>Mechanism of Action:</h4>
                  <ul className="benefits-checklist">
                    {product.actions.filter(Boolean).map((pt, idx) => (
                      <li key={idx}>
                        <Layers size={18} color="#12452c" />
                        <div>{pt}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Indications */}
              {product.indications?.filter(Boolean).length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ color: "#12452c", marginBottom: 10 }}>Clinical Indications:</h4>
                  <ul className="benefits-checklist">
                    {product.indications.filter(Boolean).map((pt, idx) => (
                      <li key={idx}>
                        <CheckCircle2 size={18} />
                        <div>{pt}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Dosage */}
          {activeTab === "dosage" && (
            <div className="tab-pane tab-dosage">
              <h3>Dosage & Administration Guidelines</h3>
              <p className="tab-sub-note">
                Administer orally once daily, mixed in feed or drinking water, or as directed by a
                registered veterinarian:
              </p>

              {product.dosage ? (
                <div
                  style={{
                    background: "#f7faf8",
                    border: "1px solid #d8eadc",
                    borderRadius: 14,
                    padding: 20,
                    marginBottom: 16,
                  }}
                >
                  <p style={{ fontSize: 15, margin: "0 0 10px", lineHeight: 1.6, fontWeight: 700 }}>
                    {product.dosage}
                  </p>
                  {product.dosageNotes && (
                    <p style={{ fontSize: 13.5, color: "#4f6858", margin: 0, fontStyle: "italic" }}>
                      <b>Clinical Note:</b> {product.dosageNotes}
                    </p>
                  )}
                </div>
              ) : (
                <div className="dosage-grid">
                  <div className="dosage-card">
                    <span className="species-name">Cattle & Buffaloes</span>
                    <b className="dosage-amount">40 – 50 ml daily</b>
                    <p>During early lactation or post-illness for 7 to 10 consecutive days.</p>
                  </div>
                  <div className="dosage-card">
                    <span className="species-name">Calves, Sheep & Goats</span>
                    <b className="dosage-amount">15 – 20 ml daily</b>
                    <p>For young stock growth enhancement and digestion support.</p>
                  </div>
                  <div className="dosage-card">
                    <span className="species-name">Poultry</span>
                    <b className="dosage-amount">10 – 20 ml per 100 birds</b>
                    <p>In drinking water for 5 days during periods of stress.</p>
                  </div>
                  <div className="dosage-card">
                    <span className="species-name">Pets & Dogs</span>
                    <b className="dosage-amount">5 – 10 ml daily</b>
                    <p>Administer with meal for health and vigor.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Product Poster */}
          {activeTab === "poster" && product.images?.poster && (
            <div className="tab-pane tab-poster">
              <h3>Product Information Poster</h3>
              <p className="tab-sub-note">
                Official pharmaceutical product overview brochure and specifications:
              </p>
              <div
                style={{
                  borderRadius: 14,
                  overflow: "hidden",
                  border: "1px solid #d8eadc",
                  background: "#fff",
                  display: "flex",
                  justifyContent: "center",
                  padding: 12,
                }}
              >
                <img
                  src={resolveImageUrl(product.images.poster, "", 1200)}
                  alt={`${product.name} Poster`}
                  style={{ maxWidth: "100%", maxHeight: 700, objectFit: "contain" }}
                />
              </div>
            </div>
          )}

          {/* Tab 6: Precautions & Storage */}
          {activeTab === "precautions" && (
            <div className="tab-pane tab-precautions">
              <h3>Precautions & Storage Advisory</h3>
              <div className="precautions-list">
                <div className="precaution-item">
                  <b>Veterinary Use Only:</b> Not intended for human medicinal use. Keep out of reach of children.
                </div>
                <div className="precaution-item">
                  <b>Storage:</b>{" "}
                  {product.storage ||
                    "Store in a cool, dry place away from direct sunlight. Do not freeze."}
                </div>
                <div className="precaution-item">
                  <b>Shake Well:</b> Shake container thoroughly before each administration for uniform consistency.
                </div>
                <div className="precaution-item">
                  <b>Container Seal:</b> Close cap tightly after every use to preserve sterility and potency.
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Related Products Row ── */}
      <section className="container related-products-section">
        <div className="section-title">
          <div>
            <h2>Related Products</h2>
          </div>
          <Link to="/products" className="text-link">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="product-grid">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} p={p} add={add} />
          ))}
        </div>
      </section>
    </div>
  );
}
