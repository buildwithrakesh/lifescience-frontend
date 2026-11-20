import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, TrendingUp, Truck, Megaphone, ShieldCheck, ArrowRight, FileCheck } from "lucide-react";
import heroBg from "../assets/why-vetora-banner.webp";

export default function DistributorPage({ onToast }) {
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    phone: "",
    email: "",
    district: "",
    state: "",
    businessType: "Veterinary Retailer",
    experience: "1-3 Years",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.district) {
      alert("Please enter your name, phone, and district.");
      return;
    }
    setSubmitted(true);
    if (onToast) onToast("Partnership request received! Our sales manager will contact you.");
  };

  return (
    <div className="page-wrap distributor-page">
      {/* ── Hero Banner ── */}
      <section className="distributor-hero-section">
        <div className="distributor-hero-bg">
          <img
            src={heroBg}
            alt="Life Science Pharmaceutical Distribution Network"
          />
          <div className="distributor-hero-overlay" />
        </div>
        <div className="container distributor-hero-content">
          <div className="page-breadcrumbs light">
            <Link to="/">Home</Link>
            <span>/</span>
            <b>Become a Distributor</b>
          </div>
          <span className="eyebrow light">GROW WITH INDIA'S FASTEST GROWING VET BRAND</span>
          <h1>Become an Authorized Life Science Distributor</h1>
          <p>Join an elite nationwide network supplying premium veterinary pharmaceuticals and nutritional premixes to progressive dairy farmers and clinicians.</p>
        </div>
      </section>

      {/* ── 4 Key Distributor Benefits (Screen 23) ── */}
      <section className="container distributor-perks-section">
        <div className="distributor-perks-grid">
          <div className="distributor-perk-card">
            <div className="perk-icon-wrap">
              <TrendingUp size={26} />
            </div>
            <h3>High Profit Margins</h3>
            <p>Industry-leading trade margins, seasonal volume discounts, and lucrative early-payment rebates.</p>
          </div>

          <div className="distributor-perk-card">
            <div className="perk-icon-wrap">
              <Megaphone size={26} />
            </div>
            <h3>Marketing & Field Support</h3>
            <p>Doctor brochures, farmer literature, branded clinic posters, and local village camp support.</p>
          </div>

          <div className="distributor-perk-card">
            <div className="perk-icon-wrap">
              <Truck size={26} />
            </div>
            <h3>Reliable Priority Logistics</h3>
            <p>Direct temperature-controlled dispatches from regional hubs with guaranteed transit timelines.</p>
          </div>

          <div className="distributor-perk-card">
            <div className="perk-icon-wrap">
              <ShieldCheck size={26} />
            </div>
            <h3>Territory Exclusivity</h3>
            <p>Protected territorial allocation preventing channel conflict and securing your local market share.</p>
          </div>
        </div>
      </section>

      {/* ── Application Form Section ── */}
      <section className="container distributor-form-section">
        <div className="distributor-form-wrapper">
          <div className="form-intro">
            <h2>Apply for Dealership / Stockist Network</h2>
            <p>Fill out the preliminary questionnaire below. Our institutional sales lead will reach out within 24 hours.</p>
          </div>

          {submitted ? (
            <div className="distributor-success-card">
              <CheckCircle2 size={56} color="#166534" />
              <h3>Partnership Application Submitted!</h3>
              <p>Thank you <b>{formData.name}</b>. Your inquiry for <b>{formData.district}, {formData.state}</b> is registered. Our state commercial manager will call you at <b>{formData.phone}</b>.</p>
              <button
                className="button button-outline"
                onClick={() => setSubmitted(false)}
              >
                Submit Another Application
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="distributor-application-form">
              <div className="form-group-row">
                <div className="form-group">
                  <label>Applicant Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Balwant Patel"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Business / Agency Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Patel Veterinary Agro Agency"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 80947 30645"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. contact@patelvet.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>Target District *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gujarat"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>Business Type</label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  >
                    <option value="Veterinary Retailer">Veterinary Chemist / Retailer</option>
                    <option value="District Stockist">District Wholesale Stockist</option>
                    <option value="Dairy Cooperative">Dairy Cooperative / Farmer FPO</option>
                    <option value="Veterinary Doctor">Veterinary Doctor / Consultant</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Experience in Veterinary Industry</label>
                  <select
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  >
                    <option value="New Entrant">New Entrant (0 - 1 Year)</option>
                    <option value="1-3 Years">1 – 3 Years</option>
                    <option value="3-7 Years">3 – 7 Years</option>
                    <option value="7+ Years">7+ Years Established</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Existing Product Portfolio & Facilities (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="Mention current brands handled, godown space, or specific regions covered..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button type="submit" className="button button-lime app-submit-cta">
                <FileCheck size={18} /> Submit Dealership Application
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
