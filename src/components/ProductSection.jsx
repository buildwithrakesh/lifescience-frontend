import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { handleAnchor } from "../utils/scroll";

export default function ProductSection({
  title,
  eyebrow,
  sub,
  link = "View all products",
  products = [],
  add,
}) {
  const rowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
  }, [products]);

  const scroll = (direction) => {
    if (!rowRef.current) return;
    const cardWidth = rowRef.current.querySelector(".product-card")?.offsetWidth || 250;
    const amount = direction === "left" ? -(cardWidth * 2 + 32) : (cardWidth * 2 + 32);
    rowRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="container product-carousel-section" id="products">
      <div className="section-title">
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h2>{title}</h2>
          {sub && <p>{sub}</p>}
        </div>
        <div className="title-actions">
          {/* Desktop Carousel Arrows (Left) */}
          <div className="desktop-carousel-nav">
            <button
              className={`carousel-arrow ${!canScrollLeft ? "disabled" : ""}`}
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label={`Scroll ${title} left`}
            >
              <ChevronLeft size={18} strokeWidth={2.5}/>
            </button>
            <button
              className={`carousel-arrow ${!canScrollRight ? "disabled" : ""}`}
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label={`Scroll ${title} right`}
            >
              <ChevronRight size={18} strokeWidth={2.5}/>
            </button>
          </div>

          {/* View All Products Link (Right) */}
          {link && (
            <Link className="text-link" to="/products">
              <span className="desktop-link-text">{link}</span>
              <span className="mobile-link-text">See All</span>
              <ArrowRight size={16}/>
            </Link>
          )}
        </div>
      </div>

      <div className="product-scroll-wrapper">
        <div className="product-scroll-track" ref={rowRef}>
          {products.map((p) => (
            <ProductCard key={p.id || p.name} p={p} add={add} />
          ))}
        </div>
      </div>
    </section>
  );
}
