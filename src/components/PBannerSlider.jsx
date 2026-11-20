import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Vite glob auto-detects ALL images in src/assets/pbanner/
const pbannerMap = import.meta.glob(
  "../assets/pbanner/*.{png,jpg,jpeg,webp,svg,PNG,JPG,JPEG,WEBP,SVG}",
  { eager: true }
);
const pbannerImages = Object.values(pbannerMap).map(m => m.default || m);

// Module-level persistence: survives all client-side page/route navigations (SPA)
let preservedPBannerIndex = null;

function getInitialPBannerIndex(maxCount) {
  if (preservedPBannerIndex !== null && typeof preservedPBannerIndex === "number") {
    if (maxCount > 0) return Math.min(Math.max(0, preservedPBannerIndex), maxCount - 1);
    return Math.max(0, preservedPBannerIndex);
  }
  try {
    const saved = sessionStorage.getItem("life_science_pbanner_slide");
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      if (!Number.isNaN(parsed) && parsed >= 0) {
        preservedPBannerIndex = parsed;
        if (maxCount > 0) return Math.min(parsed, maxCount - 1);
        return parsed;
      }
    }
  } catch (e) {}
  return 0;
}

export default function PBannerSlider() {
  const total = pbannerImages.length;
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );

  const [current, setCurrentState] = useState(() => getInitialPBannerIndex(total));

  const setCurrent = useCallback((newIndexOrFn) => {
    setCurrentState((prev) => {
      const nextVal = typeof newIndexOrFn === "function" ? newIndexOrFn(prev) : newIndexOrFn;
      preservedPBannerIndex = nextVal;
      try {
        sessionStorage.setItem("life_science_pbanner_slide", String(nextVal));
      } catch (e) {}
      return nextVal;
    });
  }, []);

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // Responsive breakpoint tracking
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Max index: mobile displays 1 at a time, desktop displays 2 at a time
  const maxIndex = isMobile ? Math.max(0, total - 1) : Math.max(0, total - 2);

  // Safe bounds guard: If viewport resize changes maxIndex, clamp current slide
  useEffect(() => {
    setCurrent(c => Math.min(c, maxIndex));
  }, [maxIndex, setCurrent]);

  const prev = useCallback(() => {
    setCurrent(c => {
      if (isMobile) {
        return (c - 1 + total) % total;
      }
      return c <= 0 ? maxIndex : c - 1;
    });
  }, [isMobile, maxIndex, total]);

  const next = useCallback(() => {
    setCurrent(c => {
      if (isMobile) {
        return (c + 1) % total;
      }
      return c >= maxIndex ? 0 : c + 1;
    });
  }, [isMobile, maxIndex, total]);

  // Auto-play interval (3.8s) - slides continuously, even when hovered
  useEffect(() => {
    if (total <= 1) return;
    if (!isMobile && total <= 2) return; // Desktop with 2 images fits both in 1 view, no scroll needed

    const timer = setInterval(() => {
      next();
    }, 3800);

    return () => clearInterval(timer);
  }, [next, total, isMobile]);

  // Mobile Touch Swipe Handlers (Swipe enabled on mobile only)
  const handleTouchStart = (e) => {
    if (!isMobile) return;
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!isMobile) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;
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

  // On desktop: if <= 2 images, show both in 1 row side by side without buttons
  const showDesktopButtons = !isMobile && total > 2;

  return (
    <section className="container pbanner-section" aria-label="Promotional Banners">
      <div
        className="pbanner-wrapper"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Desktop Left Button (Only when total > 2 and NOT mobile) */}
        {showDesktopButtons && (
          <button
            className="pbanner-arrow pbanner-prev"
            onClick={prev}
            aria-label="Previous promotional banners"
          >
            <ChevronLeft size={22} strokeWidth={2.5}/>
          </button>
        )}

        <div className="pbanner-viewport">
          <div
            className={`pbanner-track ${!isMobile && total <= 2 ? "pbanner-desktop-pair" : ""}`}
            style={
              isMobile
                ? { transform: `translateX(-${current * 100}%)` }
                : total > 2
                ? { transform: `translateX(-${current * (50 + 1)}%)` }
                : undefined
            }
          >
            {pbannerImages.map((src, idx) => (
              <div className="pbanner-slide" key={idx}>
                <a href="#products" className="pbanner-link" tabIndex={0}>
                  <img
                    src={src}
                    alt={`Promotional Banner ${idx + 1}`}
                    className="pbanner-img"
                    draggable={false}
                    loading="lazy"
                    decoding="async"
                  />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Right Button (Only when total > 2 and NOT mobile) */}
        {showDesktopButtons && (
          <button
            className="pbanner-arrow pbanner-next"
            onClick={next}
            aria-label="Next promotional banners"
          >
            <ChevronRight size={22} strokeWidth={2.5}/>
          </button>
        )}
      </div>

      {/* Mobile Dynamic Dots (Active indicator) */}
      {isMobile && total > 1 && (
        <div className="pbanner-dots" aria-hidden="true">
          {pbannerImages.map((_, i) => (
            <span
              key={i}
              className={`pbanner-dot ${i === current ? "active" : ""}`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
