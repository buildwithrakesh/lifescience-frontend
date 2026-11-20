import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Clock, ArrowRight, User, Sparkles, Search } from "lucide-react";
import { animals } from "../data/animals";
import heroImg from "../assets/why-vetora-banner.webp";
import step1Img from "../assets/process/step1-img.webp";
import step2Img from "../assets/process/step2-img.webp";
import step3Img from "../assets/process/step3-img.webp";
import step4Img from "../assets/process/step4-img.webp";
import scientistImg from "../assets/why-vetora-scientist.webp";

export const ARTICLES_DATA = [
  {
    slug: "cattle-health-tips-maximizing-milk-yield",
    title: "Cattle Health Tips: Maximizing Lactation & Preventing Milk Fever",
    species: "Cow",
    date: "Jan 15, 2026",
    readTime: "6 min read",
    author: "Dr. Aniruddh Deshmukh, MVSc",
    image: heroImg,
    excerpt: "Learn the physiological triggers of hypocalcemia (milk fever) in high-yielding dairy crossbreds and how timely ionic calcium gels support transition cow metabolism."
  },
  {
    slug: "poultry-care-guide-summer-heat-stress",
    title: "Poultry Care Guide: Mitigating Summer Heat Stress in Broilers & Layers",
    species: "Cock",
    date: "Jan 22, 2026",
    readTime: "5 min read",
    author: "Life Science Poultry Tech Team",
    image: step1Img,
    excerpt: "Electrolyte balance and vitamin C supplementation strategies to protect flock livability and prevent thin eggshells during intense heat waves."
  },
  {
    slug: "animal-nutrition-basics-trace-minerals",
    title: "Animal Nutrition Basics: The Critical Role of Chelate Trace Minerals",
    species: "Nutrition",
    date: "Feb 02, 2026",
    readTime: "7 min read",
    author: "Dr. Priya Nair, Veterinary Nutritionist",
    image: step2Img,
    excerpt: "Why standard inorganic salts fail to meet modern cattle genetic potential, and how organic amino-acid chelated minerals double bio-absorption."
  },
  {
    slug: "canine-joint-care-senior-dogs",
    title: "Companion Animal Care: Managing Hip Dysplasia & Arthritis in Aging Pets",
    species: "Dog",
    date: "Feb 10, 2026",
    readTime: "4 min read",
    author: "Dr. S. K. Roy, Canine Orthopedic Specialist",
    image: step3Img,
    excerpt: "A practical guide to glucosamine, chondroitin, and MSM formulations for senior Labradors and German Shepherds facing mobility decline."
  },
  {
    slug: "goat-sheep-mineral-management",
    title: "Goat & Sheep Wellness: Preventing Copper & Zinc Deficiencies in Ruminants",
    species: "Goats",
    date: "Feb 18, 2026",
    readTime: "5 min read",
    author: "Life Science Field Veterinarians",
    image: step4Img,
    excerpt: "Understanding the unique sensitivity of sheep to copper toxicity compared to goats, and safely formulating mixed flock mineral supplements."
  },
  {
    slug: "rumen-acidosis-prevention-strategies",
    title: "Subacute Rumen Acidosis (SARA): Early Symptoms & Dietary Buffers",
    species: "Cow",
    date: "Mar 01, 2026",
    readTime: "8 min read",
    author: "Dr. R. P. Yadav, Ruminant Specialist",
    image: scientistImg,
    excerpt: "How sudden changes in concentrate-to-roughage ratios drop rumen pH below 5.5, and the proven role of live yeast cultures and buffers."
  }
];

export default function KnowledgeCentre() {
  const [selectedSpecies, setSelectedSpecies] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredArticles = ARTICLES_DATA.filter((a) => {
    if (selectedSpecies !== "all") {
      const match =
        a.species.toLowerCase() === selectedSpecies.toLowerCase() ||
        ((selectedSpecies.toLowerCase() === "cow" || selectedSpecies.toLowerCase() === "cattle") &&
         (a.species.toLowerCase() === "cow" || a.species.toLowerCase() === "cattle")) ||
        ((selectedSpecies.toLowerCase() === "cock" || selectedSpecies.toLowerCase() === "hen" || selectedSpecies.toLowerCase() === "poultry") &&
         (a.species.toLowerCase() === "cock" || a.species.toLowerCase() === "hen" || a.species.toLowerCase() === "poultry")) ||
        ((selectedSpecies.toLowerCase() === "dog" || selectedSpecies.toLowerCase() === "pets") &&
         (a.species.toLowerCase() === "dog" || a.species.toLowerCase() === "pets")) ||
        ((selectedSpecies.toLowerCase() === "fish" || selectedSpecies.toLowerCase() === "aquaculture") &&
         (a.species.toLowerCase() === "fish" || a.species.toLowerCase() === "aquaculture"));
      if (!match) return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return a.title.toLowerCase().includes(term) || a.excerpt.toLowerCase().includes(term);
    }
    return true;
  });

  return (
    <div className="page-wrap knowledge-centre-page">
      {/* ── Hero Banner (Matching Board Screen 19) ── */}
      <section className="knowledge-hero-section">
        <div className="container">
          <div className="page-breadcrumbs light">
            <Link to="/">Home</Link>
            <span>/</span>
            <b>Knowledge Centre</b>
          </div>
          <div className="knowledge-hero-content">
            <span className="eyebrow light">VETERINARY RESEARCH & GUIDES</span>
            <h1>Knowledge Centre</h1>
            <p>Practical, science-backed veterinary resources designed to help farmers, veterinarians, and pet parents make informed decisions.</p>
          </div>
        </div>
      </section>

      {/* ── Species Avatar Horizontal Strip (Matching Board Screen 19) ── */}
      <section className="container knowledge-species-strip-section">
        <div className="species-avatar-strip">
          <button
            type="button"
            className={`species-avatar-item ${selectedSpecies === "all" ? "active" : ""}`}
            onClick={() => setSelectedSpecies("all")}
          >
            <div className="avatar-circle all-circle">
              <BookOpen size={20} />
            </div>
            <span>All Topics</span>
          </button>
          {animals.map((a) => (
            <button
              key={a.name}
              type="button"
              className={`species-avatar-item ${selectedSpecies === a.name.toLowerCase() ? "active" : ""}`}
              onClick={() => setSelectedSpecies(a.name.toLowerCase())}
            >
              <div className="avatar-circle">
                <img src={a.img} alt={a.name} />
              </div>
              <span>{a.name}</span>
            </button>
          ))}
          <button
            type="button"
            className={`species-avatar-item ${selectedSpecies === "nutrition" ? "active" : ""}`}
            onClick={() => setSelectedSpecies("nutrition")}
          >
            <div className="avatar-circle nutrition-circle">
              <Sparkles size={20} />
            </div>
            <span>Nutrition</span>
          </button>
        </div>
      </section>

      {/* ── Articles Grid ── */}
      <section className="container knowledge-grid-section">
        <div className="section-title">
          <div>
            <span className="eyebrow">RESEARCH ARTICLES & PROTOCOLS</span>
            <h2>{selectedSpecies === "all" ? "Latest Published Articles" : `${selectedSpecies.toUpperCase()} Care Articles`}</h2>
          </div>
          <div className="knowledge-search-mini">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search guides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="articles-grid">
          {filteredArticles.map((art) => (
            <article className="article-card" key={art.slug}>
              <Link to={`/knowledge/${art.slug}`} className="article-media-wrap">
                <img src={art.image} alt={art.title} loading="lazy" />
                <span className="article-species-badge">{art.species}</span>
              </Link>
              <div className="article-body">
                <div className="article-meta-row">
                  <span className="article-date">{art.date}</span>
                  <span className="article-read-time">
                    <Clock size={12} /> {art.readTime}
                  </span>
                </div>
                <h3>
                  <Link to={`/knowledge/${art.slug}`}>{art.title}</Link>
                </h3>
                <p>{art.excerpt}</p>
                <div className="article-footer">
                  <span className="article-author">
                    <User size={13} /> {art.author}
                  </span>
                  <Link to={`/knowledge/${art.slug}`} className="article-link-cta">
                    Read More <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}