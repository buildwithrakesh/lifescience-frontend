import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle, Phone, ArrowRight } from "lucide-react";

const FAQ_ITEMS = [
  {
    category: "products",
    q: "Are Life Science Pharmaceutical products manufactured under GMP certified standards?",
    a: "Yes. All Life Science pharmaceuticals, mineral mixtures, and nutritional supplements are synthesized in ISO and WHO-GMP accredited manufacturing facilities adhering to strict pharmacopeial guidelines and batch-testing standards."
  },
  {
    category: "products",
    q: "How does Life Science Calci-Gel differ from standard liquid calcium?",
    a: "Life Science Calci-Gel uses an ionic calcium matrix with added vitamin D3 and phosphorus precursors. Unlike ordinary chalky suspensions, ionic calcium is rapidly absorbed across the rumen mucosa within hours, delivering emergency calcium replenishment without aspiration risk."
  },
  {
    category: "products",
    q: "Can Life Science Liv-Pro be administered along with regular antibiotics?",
    a: "Yes, absolutely. Liv-Pro herbal liver tonic is formulated to support and protect the liver from antibiotic toxicity. In fact, co-administration helps prevent inappetence and promotes faster therapeutic convalescence."
  },
  {
    category: "orders",
    q: "What are the shipping charges and delivery timelines?",
    a: "We offer FREE delivery nationwide on all orders above ₹999. Orders below ₹999 carry a flat ₹50 shipping fee. Delivery generally takes 2 to 5 business days depending on your pin code."
  },
  {
    category: "orders",
    q: "How can I track the live status of my dispatched order?",
    a: "Once dispatched, you receive an SMS and email notification with your tracking link. You can also view live delivery status by visiting the 'My Orders' section in your account dashboard."
  },
  {
    category: "orders",
    q: "What payment methods are supported on Life Science?",
    a: "We support UPI (Google Pay, PhonePe, Paytm, BHIM), all major Credit/Debit Cards (Visa, MasterCard, RuPay), Net Banking across 50+ Indian banks, as well as Cash on Delivery (COD) for supported locations."
  },
  {
    category: "returns",
    q: "What is your return and refund policy?",
    a: "If you receive a damaged, leaked, or incorrect product batch, you can request a replacement or full refund within 7 days of delivery by contacting our care team at Lifesciencepharmaceutical@gmail.com with package photos."
  },
  {
    category: "general",
    q: "Can veterinary doctors and large dairy farms order in bulk?",
    a: "Yes! We offer institutional pricing and bulk pallet supply for commercial dairy farms, veterinary hospitals, and cooperatives. Please contact our institutional desk at +91 80947 21000 or Lifesciencepharmaceutical@gmail.com."
  },
  {
    category: "general",
    q: "Do you offer technical veterinary guidance on dosage?",
    a: "Yes. Our team of experienced veterinary consultants is available on WhatsApp and phone (+91 80947 21000) Monday through Saturday to provide free advice on dosage schedules and herd protocols."
  }
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [openIndices, setOpenIndices] = useState({ 0: true, 1: true });

  const categories = [
    { id: "all", name: "All Questions" },
    { id: "products", name: "Products & Quality" },
    { id: "orders", name: "Orders & Delivery" },
    { id: "returns", name: "Returns & Refunds" },
    { id: "general", name: "General & Distribution" }
  ];

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    if (activeCategory !== "all" && item.category !== activeCategory) {
      return false;
    }
    return true;
  });

  const toggleAccordion = (idx) => {
    setOpenIndices((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="page-wrap faq-page">
      {/* ── Hero Banner ── */}
      <section className="faq-hero-section">
        <div className="container">
          <div className="page-breadcrumbs light">
            <Link to="/">Home</Link>
            <span>/</span>
            <b>Frequently Asked Questions</b>
          </div>
          <div className="faq-hero-content">
            <h1>Frequently Asked Questions</h1>
            <p>Everything you need to know about Life Science veterinary formulations, orders, delivery, and institutional partnerships.</p>
          </div>
        </div>
      </section>

      {/* ── Category Filter Tabs ── */}
      <section className="container faq-tabs-section">
        <div className="faq-tabs-row">
          {categories.map((c) => (
            <button
              key={c.id}
              className={`faq-cat-btn ${activeCategory === c.id ? "active" : ""}`}
              onClick={() => setActiveCategory(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </section>

      {/* ── Accordion List ── */}
      <section className="container faq-accordion-section">
        <div className="faq-accordion-list">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = Boolean(openIndices[idx]);
            return (
              <div className={`faq-item-card ${isOpen ? "open" : ""}`} key={idx}>
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => toggleAccordion(idx)}
                >
                  <span className="faq-q-text">{faq.q}</span>
                  <span className="faq-toggle-icon">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                </button>
                {isOpen && (
                  <div className="faq-answer-pane">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Still Have Questions Support Box ── */}
      <section className="container faq-contact-banner">
        <div className="faq-support-box">
          <div className="support-copy">
            <h3>Still Have Questions?</h3>
            <p>Can't find the answer you're looking for? Reach out to our friendly veterinary care team anytime.</p>
          </div>
          <div className="support-actions">
            <Link to="/contact" className="button button-lime">
              Contact Support <ArrowRight size={15} />
            </Link>
            <a
              href="https://wa.me/918094721000"
              target="_blank"
              rel="noopener noreferrer"
              className="button button-outline"
            >
              <MessageCircle size={16} /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
