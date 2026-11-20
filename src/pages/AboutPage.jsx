import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck, CheckCircle2, Award, HeartHandshake,
  Microscope, Users, ArrowRight, Sparkles, TrendingUp,
  Droplets, Leaf, Building2, Phone, BadgeCheck
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="page-wrap about-page-clean">
      <div className="about-editorial-container">
        {/* ── Breadcrumbs & Page Header (Clean, no dark hero banner) ── */}
        <header className="about-page-header">
          <div className="page-breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <b>About Us</b>
          </div>
          <h1>About Life Science Pharmaceutical</h1>
          <p className="about-lead-subtitle">
            Science-driven veterinary pharmaceuticals, bioavailable mineral complexes, and clinical herd nutrition engineered for India's livestock, poultry, and animal healthcare sector.
          </p>

          {/* Inline credibility tags */}
          <div className="about-highlights-inline">
            <span className="about-highlight-pill">
              <ShieldCheck size={16} /> WHO-GMP & ISO 9001 Partner Units
            </span>
            <span className="about-highlight-pill">
              <Microscope size={16} /> Bioavailable Glycinate Chelation
            </span>
            <span className="about-highlight-pill">
              <Leaf size={16} /> Zero Hormones & Prohibited Additives
            </span>
            <span className="about-highlight-pill">
              <TrendingUp size={16} /> Indian Climate Tested (Up to 48°C)
            </span>
          </div>
        </header>

        {/* ── Editorial Longform Narrative ── */}
        <article className="about-editorial-body">
          {/* Section 1: Who We Are */}
          <section>
            <h2>Who We Are</h2>
            <p>
              Life Science Pharmaceutical is an Indian veterinary healthcare and clinical nutrition company dedicated to advancing livestock productivity, animal wellness, and rural farm prosperity. We research, develop, and distribute targeted therapeutic formulations, chelated mineral complexes, ionic calcium gels, and standardized herbal hepatoprotective tonics.
            </p>
            <p>
              Founded by veterinary researchers and agricultural nutritionists, Life Science Pharmaceutical operates with a straightforward premise: <b>livestock health is the foundation of farm livelihood</b>. We combine laboratory-grade pharmacopeial standards with deep, ground-level understanding of Indian dairy management, regional fodder deficiencies, and climate extremes.
            </p>
          </section>

          <hr className="about-divider" />

          {/* Section 2: What We Do & How We Formulate */}
          <section>
            <h2>What We Do & How We Formulate</h2>
            <p>
              We bridge the gap between advanced veterinary pharmacology and day-to-day farm practicalities. Unlike mass-market commercial feed supplements that rely on insoluble chalk powders and unabsorbed fillers, every Life Science formulation is engineered to resolve a specific clinical or metabolic challenge faced by farmers and veterinarians.
            </p>
            <p>
              Our research team focuses on high bioavailability—ensuring that the active minerals, vitamins, and phytogenic compounds survive the complex bovine rumen environment and absorb rapidly into the bloodstream where they provide immediate clinical benefit.
            </p>

            <div className="about-callout">
              <b>Our Formulation Standard:</b> A supplement is only as good as what the animal can absorb. We engineer products that deliver visible, measurable improvements in milk yield, conception rates, and herd vigor within days of administration.
            </div>
          </section>

          <hr className="about-divider" />

          {/* Section 3: Our Driving Purpose */}
          <section>
            <h2>Our Core Purpose & Farm Philosophy</h2>
            <p>
              In rural and peri-urban India, dairy cattle and livestock are not just business assets; they represent the hard-earned savings, daily milk income, and economic security of farm families. When a high-yielding cow or buffalo suffers from milk fever, acute mastitis, ketosis, or repeat breeding, the financial impact on the household is immediate and severe.
            </p>
            <p>
              For decades, farmers have been trapped in a costly cycle of reactive emergency treatments, blind antibiotic overuse, and recurring veterinary visits. Life Science Pharmaceutical was founded to replace this cycle with <b>proactive, science-backed nutritional therapy</b>. By reinforcing immune function and balancing metabolic energy, we help farmers prevent disease before it starts—safeguarding both animal welfare and family livelihoods.
            </p>
          </section>

          <hr className="about-divider" />

          {/* Section 4: Target Sectors We Cater To */}
          <section>
            <h2>Species & Sectors We Support</h2>
            <p>
              Different species have fundamentally different digestive systems, metabolic rates, and nutrient absorption pathways. We formulate specialized solutions across six core livestock sectors:
            </p>

            <ul className="about-editorial-list">
              <li>
                <strong>Commercial Dairy Herds & Smallholder Farmers:</strong> Specialized ionic calcium gels for milk fever prevention in newly calved cows, lactation boosters for peak milk yields, chelated fertility minerals for timely conception, and udder hygiene solutions.
              </li>
              <li>
                <strong>Commercial Poultry & Layer Integrations:</strong> Bioavailable calcium-phosphorus solutions for strong eggshells, water-soluble electrolytes for summer heat stress, and natural liver protectors for uniform broiler growth.
              </li>
              <li>
                <strong>Sheep & Goat (Small Ruminant) Keepers:</strong> Copper-safe trace mineral blends, anti-parasitic recovery tonics, and lamb/kid immunity boosters suited for grazing and stall-fed systems.
              </li>
              <li>
                <strong>Practicing Field Veterinarians & Clinicians:</strong> Certified-assay clinical formulations, transparent active ingredient concentrations, and dependable therapeutic performance for field practice.
              </li>
              <li>
                <strong>Companion Pets (Dogs & Cats):</strong> Joint support glucosamine complexes, skin and coat omega oils, and gentle digestive aids formulated for companion animal longevity.
              </li>
              <li>
                <strong>Freshwater Aquaculture & Fisheries:</strong> Water conditioning bio-cultures and chelated growth premixes designed to maintain pond ecology and improve harvest survival rates.
              </li>
            </ul>
          </section>

          <hr className="about-divider" />

          {/* Section 5: Formulation Standards & Product Science */}
          <section>
            <h2>Our Formulation Standards & Product Science</h2>
            <p>
              Behind every Life Science formulation is rigorous laboratory research and real-world field validation. Here are the core scientific pillars that set our formulations apart:
            </p>

            <div className="about-science-block">
              <h3>1. Ionic Calcium Delivery (Rapid Rumen Absorption)</h3>
              <p>
                Conventional calcium drenches frequently use insoluble calcium carbonate suspensions that pass unabsorbed through the rumen or risk pulmonary aspiration. Life Science Calci-Gel utilizes ionic calcium chloride and calcium propionate with vitamin D3 precursors, absorbing directly through the rumen wall within 15–30 minutes to protect cows during critical post-calving paralysis.
              </p>
            </div>

            <div className="about-science-block">
              <h3>2. Standardized Phytogenic Hepatoprotection</h3>
              <p>
                Antibiotic regimens and mycotoxins in feed strain liver function, causing sudden drops in appetite and milk output. Our Liv-Pro formulations combine standardized botanical extracts of <i>Andrographis paniculata</i>, <i>Boerhavia diffusa</i>, and <i>Phyllanthus niruri</i> to regenerate hepatocytes, stimulate bile flow, and restore hearty feed intake.
              </p>
            </div>

            <div className="about-science-block">
              <h3>3. Organic Glycinate Trace Mineral Chelation</h3>
              <p>
                Inorganic mineral salts (oxides and sulfates) bind with dietary antagonists in the rumen, causing up to 80% to be excreted in dung. Life Science uses true amino acid chelates (glycinates and methionates) that remain neutral through the rumen and absorb efficiently across the intestinal lining, directly boosting conception rates and udder immunity.
              </p>
            </div>

            <div className="about-science-block">
              <h3>4. Glucogenic Energy for Transition Cows</h3>
              <p>
                Immediately after calving, the heavy energy demands of lactation outpace feed intake, triggering negative energy balance and subclinical ketosis. Our energy supplements provide rapid glucogenic precursors (propylene glycol, niacinamide, cobalt) that enter the Krebs cycle immediately without inducing rumen acidosis.
              </p>
            </div>

            <div className="about-science-block">
              <h3>5. Climate & Heat Stability Testing (Tested to 48°C)</h3>
              <p>
                Rural warehousing and long-distance transport in peak Indian summers can degrade liquid vitamins and destabilize suspensions. Every Life Science production batch undergoes real-time and accelerated stability testing in thermal chambers to guarantee zero phase separation, uniform dispersion, and 100% label potency through the expiry date.
              </p>
            </div>
          </section>

          <hr className="about-divider" />

          {/* Section 6: Quality Principles & Manufacturing Guarantees */}
          <section>
            <h2>Quality Principles & Ethical Guarantees</h2>
            <p>
              We believe Indian livestock farmers deserve the same precision, hygiene, and analytical validation expected in human pharmaceutical manufacturing.
            </p>

            <ul className="about-editorial-list">
              <li>
                <strong>WHO-GMP Partner Manufacturing Units:</strong> Produced in clean-room environments with positive-pressure HEPA filtration, automated bottle filling, and inductive foil sealing.
              </li>
              <li>
                <strong>Zero Hormones or Prohibited Stimulants:</strong> We strictly prohibit synthetic hormones (including oxytocin mimics). All milk yield improvements are achieved naturally through metabolic nutrition.
              </li>
              <li>
                <strong>Batch-Wise Analytical Testing:</strong> Every production batch is laboratory-assayed for active compound potency and microbiological safety before dispatch.
              </li>
              <li>
                <strong>Direct Veterinary Guidance:</strong> Our in-house technical team is available 6 days a week via phone and WhatsApp to advise farmers, clinics, and distributors on dosage protocols.
              </li>
            </ul>
          </section>

          <hr className="about-divider" />

          {/* Section 7: Company Registered Address & Corporate Details */}
          <section style={{
            background: "#f7faf7",
            border: "1.5px solid #dbe8dd",
            borderRadius: "16px",
            padding: "24px 28px",
            margin: "32px 0 16px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#12452c", marginBottom: 8 }}>
              <Building2 size={22} />
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>Corporate & Registered Office</h3>
            </div>
            <p style={{ margin: "6px 0", fontSize: "15px", fontWeight: 700, color: "#1c2e22" }}>
              Life Science Pharmaceutical
            </p>
            <p style={{ margin: "4px 0 12px", fontSize: "14px", color: "#4b6352", lineHeight: 1.6 }}>
              101, Turning Point 1st, Opposite Rosary School,<br />
              Viman Nagar, Pune, Maharashtra - 411014
            </p>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: "13.5px", color: "#12452c", fontWeight: 600 }}>
              <span>📞 +91 80947 21000</span>
              <span>✉️ Lifesciencepharmaceutical@gmail.com</span>
              <span>🌐 Pune, Maharashtra, India</span>
            </div>
          </section>

          <hr className="about-divider" />

          {/* Section 8: Clean Editorial Footer / Next Steps */}
          <section className="about-editorial-footer">
            <div>
              <h3>Looking for Product Formulations or Dosage Guidance?</h3>
              <p>
                Browse our complete catalog of veterinary solutions or connect directly with our technical support desk.
              </p>
            </div>
            <div className="about-footer-actions">
              <Link to="/products" className="button button-lime">
                View Products Catalog <ArrowRight size={16} />
              </Link>
              <Link to="/contact" className="button button-secondary">
                <Phone size={16} /> Contact Veterinary Desk
              </Link>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
