import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight, ArrowRight, ShieldCheck, Microscope, Award,
  Truck, Headset, Leaf, CheckCircle2, PawPrint, Handshake
} from "lucide-react";
import HeroSlider from "../components/HeroSlider";
import ProductSection from "../components/ProductSection";
import FeaturedPostersSection from "../components/FeaturedPostersSection";
import OffersCarousel from "../components/OffersCarousel";
import PBannerSlider from "../components/PBannerSlider";
import ProcessSection from "../components/ProcessSection";
import PartnerBannerSection from "../components/PartnerBannerSection";
import { animals } from "../data/animals";
import { products as initialProducts } from "../data/products";
import { apiFetch } from "../utils/api";
import { handleAnchor, photo } from "../utils/scroll";
import whyScientistImg from "../assets/why-vetora-scientist.webp";
import whyVetoraBanner from "../assets/why-vetora-banner.webp";

function AnimalSection() {
  const listRef = useRef(null);
  const [activeDot, setActiveDot] = useState(0);

  const handleScroll = () => {
    if (!listRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = listRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) return;
    const progress = scrollLeft / maxScroll;
    const dot = progress < 0.33 ? 0 : progress < 0.67 ? 1 : 2;
    setActiveDot(dot);
  };

  const scrollRight = () => {
    if (!listRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = listRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (scrollLeft >= maxScroll - 5) {
      listRef.current.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      listRef.current.scrollBy({ left: 180, behavior: "smooth" });
    }
  };

  const scrollToDot = (idx) => {
    if (!listRef.current) return;
    const { scrollWidth, clientWidth } = listRef.current;
    const maxScroll = scrollWidth - clientWidth;
    listRef.current.scrollTo({ left: (maxScroll / 2) * idx, behavior: "smooth" });
  };

  return (
    <section className="animal-band container" id="animals">
      <div className="animal-intro">
        <h2>Shop by<br/>Animal</h2>
        <Link className="small-link" to="/products">
          Explore all animals <ArrowRight size={14}/>
        </Link>
      </div>
      <div className="animal-list-wrap">
        <div className="animal-list" ref={listRef} onScroll={handleScroll}>
          {animals.map(a => (
            <Link
              className="animal-card"
              to={`/products?animal=${encodeURIComponent(a.name)}`}
              key={a.name}
              title={`View ${a.name} Products`}
            >
              <div className="animal-thumb">
                <img src={a.local ? a.img : photo(a.img, 380)} alt={a.name} loading="lazy" decoding="async"/>
              </div>
              <span className="animal-name">{a.name}</span>
            </Link>
          ))}
        </div>
        <button className="mobile-next-btn" onClick={scrollRight} aria-label="Next categories">
          <ChevronRight size={18} strokeWidth={2.5}/>
        </button>
      </div>
      <div className="mobile-dots">
        {[0, 1, 2].map(i => (
          <i
            key={i}
            className={activeDot === i ? "active" : ""}
            onClick={() => scrollToDot(i)}
          />
        ))}
      </div>
    </section>
  );
}

function WhySection() {
  const points = [
    { Icon: ShieldCheck, title: "Premium Quality Products", sub: "International Standards" },
    { Icon: Microscope, title: "Advanced Research & Development", sub: "Innovative Care" },
    { Icon: Award, title: "Stringent Quality Control", sub: "Reliable Safety" },
    { Icon: PawPrint, title: "Animal Welfare First", sub: "Healthier Animals" },
    { Icon: Handshake, title: "Dedicated Customer Support", sub: "Always Here" }
  ];

  return (
    <section className="why-section" id="about">
      {/* ── Desktop View ── */}
      <div className="why-desktop-wrap">
        <div className="why-left">
          <div className="why-scientist-bg" style={{ backgroundImage: `url(${whyScientistImg})` }}/>
          <div className="why-left-overlay"/>
          <div className="why-left-content">
            <h2>Why Choose<br/>Life Science?</h2>
            <p>Trusted partner for<br/>animal healthcare</p>
            <a className="why-learn-btn" href="#about" onClick={handleAnchor}>
              Learn More <ArrowRight size={14}/>
            </a>
          </div>
        </div>
        <div className="why-right">
          <div className="why-features-grid">
            {points.map(pt => (
              <div className="why-feature-col" key={pt.title}>
                <div className="why-feature-icon">
                  <pt.Icon size={32} strokeWidth={2.2}/>
                </div>
                <b className="why-feature-title">{pt.title}</b>
                <span className="why-feature-caret">▾</span>
                <small className="why-feature-sub">{pt.sub}</small>
              </div>
            ))}
          </div>
          <div className="why-corner-wave"/>
        </div>
      </div>

      {/* ── Mobile View (Image 1 Layout) ── */}
      <div className="why-mobile-wrap container">
        <a className="why-mobile-banner-card" href="#about" onClick={handleAnchor}>
          <img
            src={whyVetoraBanner}
            alt="Why Choose Life Science Pharmaceutical? Trusted partner for animal healthcare"
            className="why-mobile-banner-img"
            loading="lazy"
            decoding="async"
          />
        </a>
        <div className="why-mobile-cards">
          <div className="why-mobile-row why-mobile-row-3">
            {points.slice(0, 3).map(pt => (
              <div className="why-mobile-card" key={pt.title}>
                <div className="why-mobile-card-icon">
                  <pt.Icon size={26} strokeWidth={2.2}/>
                </div>
                <b className="why-mobile-card-title">{pt.title}</b>
                <span className="why-mobile-card-line" />
                <small className="why-mobile-card-sub">{pt.sub}</small>
              </div>
            ))}
          </div>
          <div className="why-mobile-row why-mobile-row-2">
            {points.slice(3, 5).map(pt => (
              <div className="why-mobile-card" key={pt.title}>
                <div className="why-mobile-card-icon">
                  <pt.Icon size={28} strokeWidth={2.2}/>
                </div>
                <b className="why-mobile-card-title">{pt.title}</b>
                <span className="why-mobile-card-line" />
                <small className="why-mobile-card-sub">{pt.sub}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home({ add, onToast }) {
  const [productList, setProductList] = useState(() => {
    try {
      const cached = localStorage.getItem("lifescience_cached_products");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialProducts;
  });

  useEffect(() => {
    let isMounted = true;
    apiFetch("/api/products?limit=200")
      .then((res) => {
        if (isMounted && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const apiProducts = [...res.data]
            .sort(
              (a, b) =>
                (a.sortOrder ?? a.displayOrder ?? 999) -
                (b.sortOrder ?? b.displayOrder ?? 999)
            )
            .map((p) => ({
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

  const dairyProducts = productList.filter(
    (p) =>
      p.category === "cattle-dairy" ||
      p.category === "Animal Nutrition & Minerals" ||
      p.category === "Milk Production & Udder Care" ||
      p.category === "Reproductive & Pregnancy Care"
  );
  const digestiveProducts = productList.filter(
    (p) =>
      p.category === "liver-digestive" ||
      p.category === "Digestive & Metabolic Health" ||
      p.category === "Deworming & Parasite Control"
  );
  const poultryPetProducts = productList.filter(
    (p) =>
      p.category === "poultry-pets" ||
      p.category === "Skin & External Care" ||
      (![
        "cattle-dairy",
        "liver-digestive",
        "Animal Nutrition & Minerals",
        "Milk Production & Udder Care",
        "Reproductive & Pregnancy Care",
        "Digestive & Metabolic Health",
        "Deworming & Parasite Control",
      ].includes(p.category))
  );

  return (
    <>
      <HeroSlider/>
      <AnimalSection/>

      {/* ── Auto-Sliding Special Offers Carousel ── */}
      <OffersCarousel />

      {/* ── Featured Products Poster Showcase (Custom Horizontally Scrollable Section) ── */}
      <FeaturedPostersSection />

      {/* ── Section 1: Cow & Dairy Essentials ── */}
      <ProductSection
        title="Cow & Dairy Essentials"
        products={dairyProducts}
        add={add}
      />

      {/* ── Promotional Banner Slider (Placed between product sections) ── */}
      <PBannerSlider/>

      {/* ── Section 2: Digestion, Liver & Vital Tonics ── */}
      <ProductSection
        title="Digestion, Liver & Vital Tonics"
        products={digestiveProducts}
        add={add}
      />

      {/* ── Section 3: Poultry, Pets & Specialized Care ── */}
      <ProductSection
        title="Poultry, Pets & Specialized Care"
        products={poultryPetProducts}
        add={add}
      />

      <WhySection/>
      <ProcessSection/>
      <PartnerBannerSection/>
    </>
  );
}
