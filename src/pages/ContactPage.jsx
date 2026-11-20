import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  Send,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { apiFetch } from "../utils/api";

export default function ContactPage({ onToast }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "Product Inquiry",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setErrorMessage("Please fill in your name, contact phone number, and inquiry message.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const result = await apiFetch("/api/contacts", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (result.success) {
        setSubmitted(true);
        if (onToast) {
          onToast("Thank you! Your message has been sent to our veterinary team.");
        }
      } else {
        setErrorMessage(result.message || "Failed to submit message. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting contact inquiry:", err);
      setErrorMessage("Unable to submit right now. Please check your network connection or chat with us on WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-wrap contact-page">
      {/* ── Hero Banner ── */}
      <section className="contact-hero-section">
        <div className="container">
          <div className="page-breadcrumbs light">
            <Link to="/">Home</Link>
            <span>/</span>
            <b>Contact Us</b>
          </div>
          <div className="contact-hero-content">
            <h1>Contact Life Science Pharmaceutical Support</h1>
          </div>
        </div>
      </section>

      {/* ── Main Split Section ── */}
      <section className="container contact-main-section">
        <div className="contact-split-layout">
          {/* Left: Contact Info Cards */}
          <div className="contact-info-col">
            <div className="contact-info-card">
              <h3>Direct Helpline & Office</h3>
              <p className="sub-text">Feel free to call, email or message us directly on WhatsApp.</p>

              <div className="contact-channels-list">
                <div className="channel-item">
                  <div className="channel-content-left">
                    <div className="channel-icon">
                      <Phone size={20} />
                    </div>
                    <div>
                      <b>Toll-Free Helpline</b>
                      <span>+91 80947 21000</span>
                      <small>Mon – Sat, 9:00 AM – 6:00 PM</small>
                    </div>
                  </div>
                  <a href="tel:+918094721000" className="channel-action-btn call-btn">
                    <Phone size={13} /> Call
                  </a>
                </div>

                <div className="channel-item">
                  <div className="channel-content-left">
                    <div className="channel-icon">
                      <Mail size={20} />
                    </div>
                    <div>
                      <b>Customer Support Email</b>
                      <span>Lifesciencepharmaceutical@gmail.com</span>
                      <small>Expect reply within 24 hours</small>
                    </div>
                  </div>
                  <a href="mailto:Lifesciencepharmaceutical@gmail.com" className="channel-action-btn email-btn">
                    <Mail size={13} /> Email
                  </a>
                </div>

                <div className="channel-item">
                  <div className="channel-content-left">
                    <div className="channel-icon">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <b>Registered Company Office</b>
                      <span>101, Turning Point 1st, Opposite Rosary School, Viman Nagar, Pune, Maharashtra-411014</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp Fast CTA */}
              <a
                href="https://wa.me/918094721000?text=Hello%20Life%20Science%20Team%2C%20I%20have%20a%20query%20about%20animal%20care%20products."
                target="_blank"
                rel="noopener noreferrer"
                className="button button-lime whatsapp-connect-btn"
              >
                <MessageCircle size={18} /> Chat Directly on WhatsApp
              </a>
            </div>

            {/* Map Preview Card */}
            <div className="contact-map-card">
              <iframe
                title="Life Science Pharmaceutical Registered Office Location"
                src="https://maps.google.com/maps?q=101+Turning+Point+Viman+Nagar+Pune+Maharashtra+411014&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="220"
                style={{ border: 0, borderRadius: "14px" }}
                allowFullScreen=""
                loading="lazy"
              />
            </div>
          </div>

          {/* Right: Message Form */}
          <div className="contact-form-col">
            <div className="contact-form-card">
              <h2>Send Us a Message</h2>

              {submitted ? (
                <div className="contact-success-state">
                  <CheckCircle2 size={48} color="#166534" />
                  <h3>Message Received!</h3>
                  <p>Our veterinary support team will contact you shortly on <b>{formData.phone}</b>.</p>
                  <button
                    className="button button-outline"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", phone: "", email: "", subject: "Product Inquiry", message: "" });
                    }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-group">
                    <label>Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group-row">
                    <div className="form-group">
                      <label>Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 80947 21000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        placeholder="e.g. ramesh@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Query Subject</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option value="Product Inquiry">Product Inquiry & Dosage Advice</option>
                      <option value="Order Status">Order Tracking & Delivery Status</option>
                      <option value="Bulk Order">Bulk Purchase & Farm Orders</option>
                      <option value="Veterinarian">Veterinarian Clinical Collaboration</option>
                      <option value="Other">General Feedback / Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Your Message *</label>
                    <textarea
                      rows="5"
                      required
                      placeholder="Please share details of your requirement or questions..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  {errorMessage && (
                    <div
                      style={{
                        padding: "10px 14px",
                        marginBottom: "16px",
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        borderRadius: "8px",
                        color: "#b91c1c",
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <AlertCircle size={16} style={{ flexShrink: 0 }} />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="button button-lime contact-submit-btn"
                    disabled={isSubmitting}
                    style={{
                      opacity: isSubmitting ? 0.75 : 1,
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
