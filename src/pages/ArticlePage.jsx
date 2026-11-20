import React from "react";
import { Link, useParams } from "react-router-dom";
import { Clock, User, ArrowLeft, ArrowRight, Share2, CheckCircle2, Bookmark } from "lucide-react";
import { ARTICLES_DATA } from "./KnowledgeCentre";
import { products } from "../data/products";
import ProductCard from "../components/ProductCard";

export default function ArticlePage({ add }) {
  const { slug } = useParams();
  const article = ARTICLES_DATA.find((a) => a.slug === slug) || ARTICLES_DATA[0];

  const suggestedProducts = products.slice(0, 3);

  return (
    <div className="page-wrap article-detail-page">
      {/* ── Breadcrumb Bar ── */}
      <div className="container">
        <div className="page-breadcrumbs">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/knowledge">Knowledge Centre</Link>
          <span>/</span>
          <b>{article.title}</b>
        </div>
      </div>

      {/* ── Article Header ── */}
      <article className="container article-container">
        <header className="article-header">
          <div className="article-tag-row">
            <span className="article-species-pill">{article.species} Care</span>
            <span className="read-time"><Clock size={14} /> {article.readTime}</span>
          </div>
          <h1>{article.title}</h1>
          <div className="article-author-row">
            <div className="author-avatar">
              <User size={18} />
            </div>
            <div>
              <b>{article.author}</b>
              <small>Published on {article.date} • Verified by Life Science Scientific Board</small>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="article-hero-media">
          <img src={article.image} alt={article.title} />
        </div>

        {/* Article Content Layout */}
        <div className="article-content-layout">
          {/* Table of Contents */}
          <aside className="article-toc-card">
            <h4>Table of Contents</h4>
            <ul>
              <li><a href="#intro">1. Introduction & Physiological Context</a></li>
              <li><a href="#clinical-signs">2. Identifying Subclinical Signs Early</a></li>
              <li><a href="#nutritional-strategy">3. Recommended Nutritional Protocol</a></li>
              <li><a href="#monitoring">4. Farm-Level Monitoring & Best Practices</a></li>
              <li><a href="#summary">5. Key Takeaways & Recommendations</a></li>
            </ul>
          </aside>

          {/* Main Prose */}
          <div className="article-prose">
            <section id="intro">
              <h2>1. Introduction & Physiological Context</h2>
              <p>
                Modern high-producing dairy livestock and livestock flocks operate near their peak biological capacity. During critical phases such as transition periods, calving, and intense seasonal fluctuations, physiological demand for bioavailable calcium, energy, and hepatic function spikes exponentially.
              </p>
              <p>
                When dietary assimilation falls short of tissue demand, metabolic complications like subclinical hypocalcemia, ketosis, and fatty liver syndrome develop rapidly, directly suppressing milk yield, fertility, and herd longevity.
              </p>
            </section>

            <section id="clinical-signs">
              <h2>2. Identifying Subclinical Signs Early</h2>
              <p>
                Unlike acute clinical conditions that are obvious to spot, subclinical deficiencies erode farm profitability silently. Common early warnings include:
              </p>
              <ul className="article-bullets">
                <li><b>Delayed rumen motility:</b> Sluggish cud-chewing and reduced daily dry matter intake.</li>
                <li><b>Cold extremities:</b> Ear tip and hock temperature drop prior to clinical hypocalcemia.</li>
                <li><b>Drop in peak lactation:</b> Daily milk production plateauing 10% to 20% below expected potential.</li>
                <li><b>Lethargy & dull coat:</b> Rough coat texture caused by deficient hepatic mineral metabolism.</li>
              </ul>
            </section>

            <div className="article-callout-box">
              <CheckCircle2 size={24} className="callout-icon" />
              <div>
                <b>Clinical Tip from Veterinarians:</b>
                <p>
                  Administering an ionic calcium gel immediately post-calving followed by a second dose 12 hours later provides a sustained circulating blood calcium buffer, virtually eliminating transition cow metabolic crashes.
                </p>
              </div>
            </div>

            <section id="nutritional-strategy">
              <h2>3. Recommended Nutritional Protocol</h2>
              <p>
                To maintain resilience, dairy herds require structured nutritional intervention rather than reactive treatments. Chelate minerals combined with B-complex vitamins and lipotropic liver stimulants ensure that ingested feed is properly metabolized rather than passed unabsorbed.
              </p>
              <p>
                Integrating palatable multi-mineral supplements and herbal liver tonics into the daily ration supports digestive microbes, strengthens rumen wall integrity, and guarantees consistent daily milk synthesis.
              </p>
            </section>

            <section id="summary">
              <h2>5. Key Takeaways & Recommendations</h2>
              <p>
                Proactive herd health management consistently delivers a 4x to 6x return on investment through reduced treatment costs, lower culling rates, and extended productive lactations.
              </p>
            </section>

            <div className="article-share-bar">
              <Link to="/knowledge" className="button button-outline">
                <ArrowLeft size={16} /> Back to Knowledge Centre
              </Link>
            </div>
          </div>
        </div>

        {/* ── Related Recommended Products ── */}
        <section className="article-related-products">
          <div className="section-title">
            <div>
              <span className="eyebrow">TARGETED VETERINARY SOLUTIONS</span>
              <h2>Products Mentioned in This Guide</h2>
            </div>
          </div>
          <div className="product-grid">
            {suggestedProducts.map((p) => (
              <ProductCard key={p.id} p={p} add={add} />
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
