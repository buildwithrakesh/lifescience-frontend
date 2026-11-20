import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, ShieldCheck, Award, HeartPulse, CheckCircle2 } from "lucide-react";
import { products } from "../data/products";
import ProductCard from "../components/ProductCard";

export default function CategoryPage({ add, onToast }) {
  const { slug } = useParams();
  const categoryKey = slug || "cattle-dairy";

  const [activeSub, setActiveSub] = useState("all");

  const categoryMeta = {
    "cattle-dairy": {
      title: "Cow & Dairy Healthcare",
      eyebrow: "HERD WELLNESS & LACTATION",
      desc: "Comprehensive nutritional supplements, ionic calcium gels, and lactation tonics engineered for high-yielding cows & dairy herds.",
      bannerImg: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=80",
      benefits: [
        { title: "Better Health", desc: "Immunity & metabolic resilience" },
        { title: "Higher Milk Yield", desc: "Sustained peak lactation" },
        { title: "Improved Productivity", desc: "Faster post-calving recovery" }
      ],
      subcategories: ["All", "Calcium & Energy", "Minerals & Vitamins", "Lactation", "Digestive"]
    },
    "liver-digestive": {
      title: "Liver & Digestive Wellness",
      eyebrow: "METABOLIC & GUT SUPPORT",
      desc: "Herbal hepatoprotective tonics, live probiotic cultures, and enzymatic appetite stimulators for optimal feed conversion.",
      bannerImg: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1400&q=80",
      benefits: [
        { title: "Active Digestion", desc: "Smooth rumen fermentation" },
        { title: "Liver Protection", desc: "Rapid toxin elimination" },
        { title: "Feed Conversion", desc: "Maximum nutrient absorption" }
      ],
      subcategories: ["All", "Liver Tonics", "Digestive Enzymes", "Probiotics", "Appetite"]
    },
    "poultry-pets": {
      title: "Poultry, Pets & Aqua Nutrition",
      eyebrow: "FLOCK & COMPANION VITALITY",
      desc: "Bioavailable electrolytes, stress-relief tonics, joint mobility syrups, and aquatic growth premixes.",
      bannerImg: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1400&q=80",
      benefits: [
        { title: "Reduced Mortality", desc: "Heat-stress & viral defense" },
        { title: "Joint & Coat Care", desc: "Active mobility for pets" },
        { title: "Eggshell Strength", desc: "Fewer breakages in layers" }
      ],
      subcategories: ["All", "Poultry Vitamins", "Pet Nutrition", "Electrolytes", "Aqua"]
    }
  };

  const currentMeta = categoryMeta[categoryKey] || categoryMeta["cattle-dairy"];

  // Filter products by category
  const categoryProducts = products.filter((p) => {
    if (categoryKey === "cattle-dairy") return p.category === "cattle-dairy";
    if (categoryKey === "liver-digestive") return p.category === "liver-digestive";
    if (categoryKey === "poultry-pets") return p.category === "poultry-pets";
    return true;
  });

  return (
    <div className="page-wrap category-page">
      {/* ── Category Banner Header ── */}
      <section className="category-hero-section">
        <div className="category-hero-bg">
          <img src={currentMeta.bannerImg} alt={currentMeta.title} />
          <div className="category-hero-overlay" />
        </div>
        <div className="container category-hero-content">
          <div className="page-breadcrumbs light">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/products">Products</Link>
            <span>/</span>
            <b>{currentMeta.title}</b>
          </div>
          <span className="eyebrow light">{currentMeta.eyebrow}</span>
          <h1>{currentMeta.title}</h1>
          <p>{currentMeta.desc}</p>
        </div>
      </section>

      {/* ── 3 Benefit Badges (Screen 4) ── */}
      <section className="container category-benefits-section">
        <div className="category-benefits-grid">
          {currentMeta.benefits.map((b, i) => (
            <div className="category-benefit-card" key={i}>
              <div className="benefit-icon-badge">
                <CheckCircle2 size={20} />
              </div>
              <div className="benefit-info">
                <h4>{b.title}</h4>
                <p>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Products & Subcategory Filter Tabs ── */}
      <section className="container category-catalog-section">
        <div className="category-filter-bar">
          <span className="subcat-label">Sub Categories:</span>
          <div className="subcat-tabs">
            {currentMeta.subcategories.map((sub) => (
              <button
                key={sub}
                className={`subcat-pill ${activeSub === sub.toLowerCase() ? "active" : ""}`}
                onClick={() => setActiveSub(sub.toLowerCase())}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        <div className="product-grid">
          {categoryProducts.map((p) => (
            <ProductCard key={p.id} p={p} add={add} />
          ))}
        </div>
      </section>
    </div>
  );
}
