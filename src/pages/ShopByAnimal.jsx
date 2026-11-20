import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Headset, Phone, Mail } from "lucide-react";
import { animals } from "../data/animals";
import { products } from "../data/products";
import ProductCard from "../components/ProductCard";

export default function ShopByAnimal({ add, onToast }) {
  // Sample featured products across animals
  const featured = products.slice(0, 4);

  return (
    <div className="page-wrap shop-by-animal-page">
      {/* ── Page Hero Banner ── */}
      <section className="page-hero">
        <div className="container">
          <div className="page-breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <b>Shop by Animal</b>
          </div>
          <div className="page-hero-content">
            <h1>Shop by Animal</h1>
            <p>Find the right veterinary pharmaceuticals and nutritional essentials for your animals.</p>
          </div>
        </div>
      </section>

      {/* ── Animals Grid ── */}
      <section className="container animal-grid-section">
        <div className="animal-species-grid">
          {animals.map((a) => {
            const count = products.filter(
              (p) =>
                p.category?.toLowerCase().includes(a.name.toLowerCase()) ||
                p.name.toLowerCase().includes(a.name.toLowerCase()) ||
                ((a.name === "Cow" || a.name === "Cattle") && p.category === "cattle-dairy") ||
                (a.name === "Buffalo" && p.category === "cattle-dairy") ||
                ((a.name === "Cock" || a.name === "Hen" || a.name === "Poultry") && p.category === "poultry-pets") ||
                ((a.name === "Dog" || a.name === "Pets") && p.category === "poultry-pets") ||
                ((a.name === "Fish" || a.name === "Aquaculture") && (p.category === "poultry-pets" || p.name.toLowerCase().includes("aqua") || p.name.toLowerCase().includes("fish")))
            ).length || 6;

            return (
              <Link
                to={`/products?animal=${encodeURIComponent(a.name)}`}
                key={a.name}
                className="animal-species-card"
              >
                <div className="animal-species-media">
                  <img src={a.img} alt={a.name} loading="lazy" />
                  <span className="species-badge">{count}+ Products</span>
                </div>
                <div className="animal-species-body">
                  <h3>{a.name}</h3>
                  <p>{a.note || "Targeted veterinary nutrition & care"}</p>
                  <span className="species-cta-link">
                    Explore Range <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Need Help? We're Here for You! Support Banner ── */}
      <section className="container animal-help-banner-section">
        <div className="animal-help-banner-card">
          {/* Decorative Organic Lime/Green Sweeping Waves */}
          <svg
            className="animal-help-banner-bg"
            viewBox="0 0 1200 140"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0,104 C90,136 170,134 290,126 C420,118 520,140 680,140 L0,140 Z"
              fill="url(#ahWaveLeft)"
            />
            <path
              d="M780,140 C860,96 910,30 1005,0 L1200,0 L1200,140 Z"
              fill="url(#ahWaveRightLight)"
            />
            <path
              d="M865,140 C945,100 1020,24 1140,0 L1200,0 L1200,140 Z"
              fill="url(#ahWaveRightMid)"
            />
            <path
              d="M980,140 C1055,112 1125,74 1200,48 L1200,140 Z"
              fill="url(#ahWaveRightDark)"
            />
            <defs>
              <linearGradient id="ahWaveLeft" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#b9e67e" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#daf3b4" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="ahWaveRightLight" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#bce784" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#94d84c" stopOpacity="0.78" />
              </linearGradient>
              <linearGradient id="ahWaveRightMid" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#85ce3e" stopOpacity="0.72" />
                <stop offset="100%" stopColor="#65b828" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="ahWaveRightDark" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#459d1c" stopOpacity="0.88" />
                <stop offset="100%" stopColor="#2e7c12" stopOpacity="0.96" />
              </linearGradient>
            </defs>
          </svg>

          <div className="animal-help-banner-inner">
            {/* Block 1: Support Specialist Intro */}
            <div className="animal-help-intro">
              <div className="animal-help-avatar" aria-hidden="true">
                <Headset size={28} strokeWidth={2.2} />
              </div>
              <div className="animal-help-copy">
                <h2>Need Help? We&apos;re Here for You!</h2>
                <p>
                  Get expert advice or product recommendations from our animal health specialists.
                </p>
              </div>
            </div>

            <span className="animal-help-divider" aria-hidden="true" />

            {/* Block 2: Call Us */}
            <a href="tel:+918094730645" className="animal-help-contact-item">
              <span className="animal-help-icon-circle" aria-hidden="true">
                <Phone size={17} strokeWidth={2.2} />
              </span>
              <div className="animal-help-contact-text">
                <small>Call Us</small>
                <strong>+91 80947 30645</strong>
              </div>
            </a>

            <span className="animal-help-divider" aria-hidden="true" />

            {/* Block 3: Email Us */}
            <a
              href="mailto:Lifesciencepharmaceutical@gmail.com"
              className="animal-help-contact-item animal-help-email-item"
            >
              <span className="animal-help-icon-circle" aria-hidden="true">
                <Mail size={17} strokeWidth={2.2} />
              </span>
              <div className="animal-help-contact-text">
                <small>Email Us</small>
                <strong>Lifesciencepharmaceutical@gmail.com</strong>
              </div>
            </a>

            <span className="animal-help-divider animal-help-divider-cta" aria-hidden="true" />

            {/* Block 4: Contact Us CTA Button */}
            <Link to="/contact" className="animal-help-cta-btn">
              <span>Contact Us</span>
              <ArrowRight size={16} strokeWidth={2.5} className="animal-help-cta-arrow" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Recommended Essentials Strip ── */}
      <section className="container recommended-strip-section">
        <div className="section-title">
          <div>
            <span className="eyebrow">HIGH PERFORMANCE</span>
            <h2>Recommended Across Herds</h2>
            <p>Proven supplements trusted by thousands of progressive farmers.</p>
          </div>
          <Link to="/products" className="text-link">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="product-grid">
          {featured.map((p) => (
            <ProductCard key={p.id} p={p} add={add} />
          ))}
        </div>
      </section>
    </div>
  );
}
