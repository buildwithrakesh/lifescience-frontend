import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { resolveImageUrl } from "../utils/api";

export default function OffersCarousel({ compact = false, inline = false }) {
  const { offers, appliedOfferId, applyOffer } = useShop();
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 760 : false
  );
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const total = offers.length;

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 760);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Inline (Products hero): always 1 slide per view
  // Desktop (Home): 1 row, 2 columns -> slide one-by-one when > 2 offers
  // Mobile: 1 column -> slide one-by-one when > 1 offer
  const isSingleView = inline || isMobile;
  const visibleCount = isSingleView ? 1 : 2;
  const maxIndex = Math.max(0, total - visibleCount);

  useEffect(() => {
    setCurrent((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  const next = useCallback(() => {
    if (maxIndex <= 0) return;
    setCurrent((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prev = useCallback(() => {
    if (maxIndex <= 0) return;
    setCurrent((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Auto-slide one by one, right to left
  useEffect(() => {
    if (maxIndex <= 0 || isPaused) return;
    const timer = setInterval(() => {
      next();
    }, 3600);
    return () => clearInterval(timer);
  }, [maxIndex, isPaused, next]);

  // Mobile swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (diff > 40) next();
      else if (diff < -40) prev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
    setIsPaused(false);
  };

  if (!offers || total === 0) return null;

  const getOfferTargetUrl = (offer) => {
    if (
      offer.scope === "specific" &&
      Array.isArray(offer.targetProducts) &&
      offer.targetProducts.length === 1
    ) {
      const tp = offer.targetProducts[0];
      return `/product/${tp.slug || tp.id}`;
    }
    return "/products";
  };

  // Right-to-left one-by-one transform
  const trackTransform = isSingleView
    ? `translateX(-${current * 100}%)`
    : `translateX(calc(-${current} * (50% + 8px)))`;

  const dotCount = maxIndex + 1;

  const Wrapper = inline ? "div" : "section";
  const wrapperClass = inline
    ? "offers-inline-wrap"
    : `container offers-carousel-section ${compact ? "offers-carousel-compact" : ""}`;

  return (
    <Wrapper className={wrapperClass} aria-label="Special Offers">
      <div
        className="offers-slider-viewport"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`offers-slider-track ${inline ? "offers-track-inline" : ""} ${!isSingleView && total === 1 ? "offers-track-single" : ""}`}
          style={{ transform: trackTransform }}
        >
          {offers.map((offer) => {
            const isUsed = appliedOfferId && String(appliedOfferId) === String(offer._id);

            return (
              <div className="offers-slide" key={offer._id || offer.title}>
                {inline ? (
                  <div className={`offers-inline-card ${isUsed ? "is-used" : ""}`}>
                    {/* Clean Admin Offer Image Untouched */}
                    <Link
                      to={getOfferTargetUrl(offer)}
                      className="offers-inline-img-link"
                      title={offer.title || "View Offer"}
                    >
                      <img
                        src={resolveImageUrl(offer.imageUrl, "", 900)}
                        alt={offer.title || "Special Offer"}
                        className="offers-inline-img"
                        loading="eager"
                        decoding="async"
                        draggable={false}
                      />
                    </Link>

                    {/* Glossy Dark-Emerald Pill CTA Button */}
                    <button
                      type="button"
                      className={`offers-hero-pill-btn ${isUsed ? "used" : ""}`}
                      onClick={() => applyOffer(offer, { allowPreselect: true })}
                      aria-pressed={Boolean(isUsed)}
                      aria-label={isUsed ? `Offer ${offer.title} active` : `Use offer ${offer.title}`}
                    >
                      {isUsed ? (
                        <>
                          <Check size={15} strokeWidth={3} />
                          <span>Used</span>
                        </>
                      ) : (
                        <>
                          <span>Use Offer</span>
                          <ArrowRight size={15} strokeWidth={2.5} className="offers-hero-pill-arrow" />
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className={`offers-row-card ${isUsed ? "is-used" : ""}`}>
                    {/* Clean Offer Image Only (Zero overlay text or badges) */}
                    <Link
                      to={getOfferTargetUrl(offer)}
                      className="offers-img-link"
                      title={offer.title || "View Offer"}
                    >
                      <img
                        src={resolveImageUrl(offer.imageUrl, "", 900)}
                        alt={offer.title || "Special Offer"}
                        className="offers-clean-img"
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                      />
                    </Link>

                    {/* "Use" Button right next to the Offer Image */}
                    <button
                      type="button"
                      className={`offers-use-side-btn ${isUsed ? "used" : ""}`}
                      onClick={() => applyOffer(offer, { allowPreselect: true })}
                      aria-pressed={Boolean(isUsed)}
                      aria-label={isUsed ? `Offer ${offer.title} active` : `Use offer ${offer.title}`}
                    >
                      {isUsed ? (
                        <>
                          <span className="offers-use-icon-circle used">
                            <Check size={15} strokeWidth={3} />
                          </span>
                          <span className="offers-use-label">Used</span>
                        </>
                      ) : (
                        <>
                          <span className="offers-use-label">Use</span>
                          <span className="offers-use-icon-circle">
                            <ArrowRight size={14} strokeWidth={2.6} />
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Indicator Dots Below */}
      {dotCount > 1 && (
        <div className="offers-slider-dots" role="tablist" aria-label="Offer slides">
          {Array.from({ length: dotCount }).map((_, idx) => (
            <button
              type="button"
              key={idx}
              className={`offers-dot ${idx === current ? "active" : ""}`}
              onClick={() => setCurrent(idx)}
              aria-label={`Show offer slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </Wrapper>
  );
}
