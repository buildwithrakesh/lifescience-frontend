import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ShoppingBag, ArrowRight } from "lucide-react";
import { apiFetch, resolveImageUrl } from "../utils/api";

// Instant initial snapshot of live featured posters (overwritten immediately when /api/featured-posters responds)
const DEFAULT_FEATURED_POSTERS = [
  {
    _id: "6afc38bad27beefeebc6c4f0",
    title: "Cal Life DS",
    subtitle: "To Improve Milk Production — Chelated Calcium, Minerals & Vitamins",
    imageUrl: "https://res.cloudinary.com/duqwahasz/image/upload/v1794914836/lifescience/posters/w5ugxossnabeskl3klb8.jpg",
    productId: "6af8215dc8da078613fa509d",
    productSlug: "lifescience-calci-gel",
    productName: "Cal Life DS",
    isActive: true,
    sortOrder: 0,
  },
  {
    _id: "6afd5466924743afcd25c164",
    title: "Min Life",
    subtitle: "Chelated Mineral Mixture for Higher Milk Yield & Reproductive Health",
    imageUrl: "https://res.cloudinary.com/duqwahasz/image/upload/v1794987107/lifescience/posters/f5nvijueym2ubuk89kvv.jpg",
    productId: "6af8215ec8da078613fa50a2",
    productSlug: "lifescience-mineral-mix",
    productName: "Min Life",
    isActive: true,
    sortOrder: 1,
  },
  {
    _id: "6afd5467924743afcd25c165",
    title: "Skin Life Spray",
    subtitle: "100% Ayurvedic Antiseptic & Wound Healing Spray (FMD / LSD & Deep Wounds)",
    imageUrl: "https://res.cloudinary.com/duqwahasz/image/upload/v1794987109/lifescience/posters/wlwpbo7alsjopdkkqp26.jpg",
    productId: "6af8215dc8da078613fa509c",
    productSlug: "lifescience-milk-booster",
    productName: "Skin Life Spray",
    isActive: true,
    sortOrder: 2,
  },
];

export default function FeaturedPostersSection() {
  const rowRef = useRef(null);
  const [posters, setPosters] = useState(() => {
    try {
      const cached = localStorage.getItem("lifescience_featured_posters");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((p) => p.isActive);
        }
      }
    } catch {}
    return DEFAULT_FEATURED_POSTERS;
  });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Load active posters from live API
  useEffect(() => {
    let isMounted = true;
    const fetchPosters = async () => {
      try {
        const res = await apiFetch("/api/featured-posters");
        if (isMounted && res.success && Array.isArray(res.data)) {
          setPosters(res.data);
          localStorage.setItem("lifescience_featured_posters", JSON.stringify(res.data));
        }
      } catch {}
    };

    fetchPosters();
    return () => {
      isMounted = false;
    };
  }, []);

  const checkScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    if (rowRef.current) {
      rowRef.current.scrollLeft = 0;
    }
    checkScroll();
    const el = rowRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [posters]);

  const scroll = (direction) => {
    if (!rowRef.current) return;
    const cardWidth = rowRef.current.querySelector(".featured-poster-card")?.offsetWidth || 390;
    const amount = direction === "left" ? -(cardWidth + 18) : (cardWidth + 18);
    rowRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  // If no active posters are added, cleanly hide the section
  if (!posters || posters.length === 0) return null;

  return (
    <section className="container product-carousel-section featured-posters-section" id="featured-posters">
      <div className="section-title">
        <div>
          <h2>Featured Products</h2>
        </div>
        <div className="title-actions">
          {/* Desktop Carousel Arrows */}
          <div className="desktop-carousel-nav">
            <button
              type="button"
              className={`carousel-arrow ${!canScrollLeft ? "disabled" : ""}`}
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll featured posters left"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              className={`carousel-arrow ${!canScrollRight ? "disabled" : ""}`}
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Scroll featured posters right"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      <div className="product-scroll-wrapper">
        <div className="product-scroll-track featured-posters-scroll-track" ref={rowRef}>
          {posters.map((poster) => {
            const targetSlugOrId = poster.productSlug || poster.productId;
            const targetUrl = `/product/${targetSlugOrId}`;
            return (
              <article key={poster._id || poster.productId} className="featured-poster-card">
                <Link
                  to={targetUrl}
                  state={{
                    product: {
                      _id: poster.productId,
                      id: poster.productSlug || poster.productId,
                      name: poster.productName || poster.title,
                      img: poster.productImage || poster.imageUrl,
                      imageUrl: poster.productImage || poster.imageUrl,
                      price: poster.productPrice,
                      type: poster.productType,
                    },
                  }}
                  className="featured-poster-link"
                  title={`Buy ${poster.productName || poster.title}`}
                >
                  <img
                    src={resolveImageUrl(poster.imageUrl, "", 780)}
                    alt={poster.title || poster.productName || "Featured Formulation"}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="featured-poster-img"
                  />
                  <div className="featured-poster-bottom-fade" aria-hidden="true" />
                  <span className="featured-poster-buy-btn">
                    <ShoppingBag size={14} strokeWidth={2.4} className="featured-poster-buy-bag" />
                    <span className="featured-poster-buy-label">Buy This</span>
                    <span className="featured-poster-buy-arrow-wrap" aria-hidden="true">
                      <ArrowRight size={13} strokeWidth={2.7} />
                    </span>
                  </span>
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
