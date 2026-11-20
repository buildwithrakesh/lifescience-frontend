import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import slider1 from "../assets/sliders/slider1.webp";
import slider2 from "../assets/sliders/slider2.webp";
import slider3 from "../assets/sliders/slider3.webp";
import { API_BASE_URL, resolveImageUrl, optimizeCloudinaryUrl } from "../utils/api";

// Local bundled fallbacks to guarantee 0ms instant first load
const localFallbackMap = {
  "slider1.png": slider1,
  "slider2.png": slider2,
  "slider3.png": slider3,
  "/uploads/sliders/slider1.png": slider1,
  "/uploads/sliders/slider2.png": slider2,
  "/uploads/sliders/slider3.png": slider3,
};

const DEFAULT_SLIDES = [
  {
    _id: "6af81a96c8da078613fa503d",
    sortOrder: 0,
    badgeText: "CLINICAL VETERINARY SCIENCE",
    buttonText: "Explore Products",
    title: "Life Science Pharmaceutical",
    subtitle: "Building a healthier tomorrow for livestock, poultry, and companion pets across India.",
    link: "/products",
    imageUrl: "https://res.cloudinary.com/duqwahasz/image/upload/v1795069481/lifescience/sliders/iyeldcpl7lcwpwfhuhf7.jpg",
    fallbackUrl: slider1,
  },
  {
    _id: "6af81a96c8da078613fa503e",
    sortOrder: 1,
    badgeText: "DAIRY & LIVESTOCK",
    buttonText: "View Dairy Range",
    title: "High-Yield Herd Wellness & Dairy Nutrition",
    subtitle: "Precision ionic calcium gels, lactation boosters, and mineral complexes for high-producing dairy animals.",
    link: "/products?animal=Cattle",
    imageUrl: "https://res.cloudinary.com/duqwahasz/image/upload/v1795069418/lifescience/sliders/abvz8nmedyrri0gksr8c.jpg",
    fallbackUrl: slider2,
  },
  {
    _id: "6af81a96c8da078613fa503f",
    sortOrder: 2,
    badgeText: "VITAL CARE & TONICS",
    buttonText: "Discover Tonics",
    title: "Phyto-Herbal Liver & Gut Vitality Tonics",
    subtitle: "Standardized herbal hepatoprotective tonics and micro-encapsulated gut probiotics for complete vital recovery.",
    link: "/products?category=liver-digestive",
    imageUrl: "https://res.cloudinary.com/duqwahasz/image/upload/v1795069538/lifescience/sliders/o2a8goctmeqm4louf4yt.jpg",
    fallbackUrl: slider3,
  },
];

// Module-level persistence: survives all client-side page/route navigations (SPA)
let preservedHeroIndex = null;

function getInitialSlideIndex(maxCount) {
  if (preservedHeroIndex !== null && typeof preservedHeroIndex === "number") {
    if (maxCount > 0) return Math.min(Math.max(0, preservedHeroIndex), maxCount - 1);
    return Math.max(0, preservedHeroIndex);
  }
  try {
    const saved = sessionStorage.getItem("life_science_hero_slide");
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      if (!Number.isNaN(parsed) && parsed >= 0) {
        preservedHeroIndex = parsed;
        if (maxCount > 0) return Math.min(parsed, maxCount - 1);
        return parsed;
      }
    }
  } catch (e) {
    // sessionStorage fallback
  }
  return 0;
}

export default function HeroSlider() {
  // 1. Initial State: Load from localStorage cache if present, else DEFAULT_SLIDES
  const [slides, setSlides] = useState(() => {
    try {
      const cached = localStorage.getItem("vetora_cached_sliders");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s) => ({
            ...s,
            fallbackUrl: localFallbackMap[s.imageUrl] || slider1,
            resolvedUrl: localFallbackMap[s.imageUrl] || resolveImageUrl(s.imageUrl, slider1, 1400),
          }));
        }
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_SLIDES.map((s) => ({
      ...s,
      resolvedUrl: optimizeCloudinaryUrl(s.imageUrl, 1400),
    }));
  });

  // Preserve slide position: restore index from memory or sessionStorage
  const [current, setCurrentState] = useState(() => {
    return getInitialSlideIndex(slides ? slides.length : 0);
  });

  const setCurrent = useCallback((newIndexOrFn) => {
    setCurrentState((prev) => {
      const nextVal = typeof newIndexOrFn === "function" ? newIndexOrFn(prev) : newIndexOrFn;
      preservedHeroIndex = nextVal;
      try {
        sessionStorage.setItem("life_science_hero_slide", String(nextVal));
      } catch (e) {}
      return nextVal;
    });
  }, []);

  const total = slides.length;

  // Track loaded images: initialize with active index so active slide is immediately marked ready
  const initialSlideIdx = getInitialSlideIndex(total);
  const loadedRef = useRef(new Set([initialSlideIdx, 0]));
  const [, setLoadedTick] = useState(0);
  const pendingNextRef = useRef(null);

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const timerRef = useRef(null);

  const markLoaded = useCallback((index) => {
    if (!loadedRef.current.has(index)) {
      loadedRef.current.add(index);
      setLoadedTick((t) => t + 1);
    }
    // If auto-play was waiting for this specific slide to finish loading:
    if (pendingNextRef.current === index) {
      pendingNextRef.current = null;
      setCurrent(index);
    }
  }, [setCurrent]);

  // Preload non-active slide images AFTER page load so initial browser tab spinner stops immediately
  useEffect(() => {
    let cancelled = false;
    let timerId = null;

    const preloadRemainingSlides = () => {
      if (cancelled) return;
      slides.forEach((slide, idx) => {
        if (loadedRef.current.has(idx)) return;
        const url = slide.resolvedUrl || slide.imageUrl;
        if (!url) {
          markLoaded(idx);
          return;
        }

        const img = new Image();
        img.decoding = "async";
        img.src = url;

        if (img.complete && img.naturalWidth > 0) {
          markLoaded(idx);
        } else {
          img.onload = () => markLoaded(idx);
          img.onerror = () => {
            markLoaded(idx);
          };
        }
      });
    };

    const schedulePreload = () => {
      timerId = window.setTimeout(preloadRemainingSlides, 800);
    };

    if (document.readyState === "complete") {
      schedulePreload();
    } else {
      window.addEventListener("load", schedulePreload, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", schedulePreload);
      if (timerId) window.clearTimeout(timerId);
    };
  }, [slides, markLoaded]);

  // 2. Fetch fresh sliders from backend API (Stale-While-Revalidate)
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadBackendSliders() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/sliders`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!res.ok) return;
        const json = await res.json();

        if (json.success && Array.isArray(json.data) && json.data.length > 0 && isMounted) {
          const freshSlides = json.data.map((item) => {
            const fallback = localFallbackMap[item.imageUrl] || slider1;
            const resolved = localFallbackMap[item.imageUrl] || resolveImageUrl(item.imageUrl, fallback, 1400);
            return {
              ...item,
              fallbackUrl: fallback,
              resolvedUrl: resolved,
            };
          });

          setSlides(freshSlides);

          // Update client cache for subsequent instant loads
          try {
            localStorage.setItem("vetora_cached_sliders", JSON.stringify(json.data));
          } catch (e) {}
        }
      } catch (err) {
        // Silently use existing cached/default slides if backend is unreachable
      }
    }

    loadBackendSliders();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // Safe bounds guard: If slide count changes, clamp current slide to valid range
  useEffect(() => {
    if (slides.length > 0) {
      setCurrent((curr) => {
        if (curr >= slides.length) {
          return Math.max(0, slides.length - 1);
        }
        return curr;
      });
    }
  }, [slides.length, setCurrent]);

  // 3. Smart Next Slide: Only advance if the next slide is loaded!
  const goToNext = useCallback(() => {
    if (total <= 1) return;
    const nextIndex = (current + 1) % total;

    // Check if next slide is already loaded in memory
    if (loadedRef.current.has(nextIndex)) {
      pendingNextRef.current = null;
      setCurrent(nextIndex);
    } else {
      // Next image has NOT finished loading yet.
      // Do NOT slide! Wait until img.onload fires for nextIndex
      pendingNextRef.current = nextIndex;

      // Safety timeout: if network is unusually slow, advance after 4.5s max
      setTimeout(() => {
        if (pendingNextRef.current === nextIndex) {
          pendingNextRef.current = null;
          setCurrent(nextIndex);
        }
      }, 4500);
    }
  }, [current, total, setCurrent]);

  // 4. Autoplay with interaction reset (slides continuously, even when hovered)
  const resetAutoplay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (total <= 1) return;
    timerRef.current = setInterval(() => {
      goToNext();
    }, 4500);
  }, [total, goToNext]);

  useEffect(() => {
    resetAutoplay();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetAutoplay]);

  const prev = useCallback(() => {
    pendingNextRef.current = null;
    setCurrent((c) => (c - 1 + total) % total);
    resetAutoplay();
  }, [total, setCurrent, resetAutoplay]);

  const next = useCallback(() => {
    goToNext();
    resetAutoplay();
  }, [goToNext, resetAutoplay]);

  const handleDotClick = useCallback((index) => {
    pendingNextRef.current = null;
    setCurrent(index);
    resetAutoplay();
  }, [setCurrent, resetAutoplay]);

  // Mobile Touch Swipe Handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      // Swiped Left -> Next
      next();
    } else if (diff < -45) {
      // Swiped Right -> Prev
      prev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!total) return null;

  return (
    <section
      className="hero-slider"
      id="top"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="hs-track" style={{ transform: `translateX(-${current * 100}%)` }}>
        {slides.map((slide, i) => {
          const imgSrc = slide.resolvedUrl || slide.imageUrl || slider1;
          const targetLink = slide.link || "/products";
          const btnText = slide.buttonText || "Explore Products";

          return (
            <div className="hs-slide" key={slide._id || slide.id || i}>
              {/* Background Landscape Photo */}
              <div className="hs-bg-wrap">
                <img
                  src={imgSrc}
                  alt={slide.title || `Slide ${i + 1}`}
                  draggable={false}
                  loading={i === current ? "eager" : "lazy"}
                  fetchPriority={i === current ? "high" : "low"}
                  decoding="async"
                  onLoad={() => markLoaded(i)}
                  onError={(e) => {
                    markLoaded(i);
                    // If backend/CDN image fails, gracefully fall back to local bundled image
                    if (slide.fallbackUrl && e.target.src !== slide.fallbackUrl) {
                      e.target.src = slide.fallbackUrl;
                    }
                  }}
                  className="hs-bg-img"
                />
                <div className="hs-gradient-scrim" aria-hidden="true" />
              </div>

              {/* Dynamic Content Overlay (Badge, Title, Subtitle, CTA Button) */}
              <div className="hs-content-layer">
                <div className="container hs-container">
                  <div className="hs-card">
                    {slide.badgeText && (
                      <div className="hs-badge-pill">
                        <span className="hs-badge-dot" aria-hidden="true" />
                        <span>{slide.badgeText}</span>
                      </div>
                    )}

                    {slide.title && (
                      <h1 className="hs-heading">{slide.title}</h1>
                    )}

                    {slide.subtitle && (
                      <p className="hs-subheading">{slide.subtitle}</p>
                    )}

                    {(slide.buttonText || slide.link) && (
                      <div className="hs-btn-row">
                        <Link
                          to={targetLink}
                          className="hs-main-cta"
                          title={btnText}
                        >
                          <span>{btnText}</span>
                          <ArrowRight size={17} strokeWidth={2.6} className="hs-cta-arrow" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {total > 1 && (
        <>
          <button className="hs-btn hs-prev" onClick={prev} aria-label="Previous slide">
            <ChevronLeft size={28} />
          </button>
          <button className="hs-btn hs-next" onClick={next} aria-label="Next slide">
            <ChevronRight size={28} />
          </button>
          <div className="hs-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`hs-dot${i === current ? " active" : ""}`}
                onClick={() => handleDotClick(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
