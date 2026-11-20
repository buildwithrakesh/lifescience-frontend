import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Facebook, Instagram, Youtube, Linkedin, Phone, Mail, MapPin, Sprout, Check } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 4500);
  };

  return (
    <footer className="footer" id="contact">
      <div className="newsletter newsletter-modern">
        {/* Decorative Botanical Leaves — Bottom-Left */}
        <svg className="newsletter-leaf-left" viewBox="0 0 140 120" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="nlLeafBright" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#167c37" />
              <stop offset="100%" stopColor="#8ce03f" />
            </linearGradient>
            <linearGradient id="nlLeafDeep" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#0f5c2a" />
              <stop offset="100%" stopColor="#4caf2f" />
            </linearGradient>
          </defs>
          <path d="M18 118 C6 82 4 44 16 14 C36 42 40 78 24 118 Z" fill="url(#nlLeafBright)" />
          <path d="M26 118 C32 82 54 58 84 52 C74 82 52 106 26 118 Z" fill="url(#nlLeafBright)" opacity="0.92" />
          <path d="M24 118 C48 96 84 90 124 108 C92 122 54 124 24 118 Z" fill="url(#nlLeafDeep)" opacity="0.9" />
          <path d="M18 112 C16 80 14 54 16 26" stroke="#c8f78c" strokeWidth="1.6" strokeLinecap="round" opacity="0.65" />
          <path d="M30 112 C46 90 62 72 76 60" stroke="#c8f78c" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
        </svg>

        {/* Decorative Botanical Leaves — Right Edge */}
        <svg className="newsletter-leaf-right" viewBox="0 0 160 180" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="nlLeafRight1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#45a83a" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#0b4621" stopOpacity="0.22" />
            </linearGradient>
            <linearGradient id="nlLeafRight2" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#5cc944" stopOpacity="0.48" />
              <stop offset="100%" stopColor="#0c4d24" stopOpacity="0.18" />
            </linearGradient>
          </defs>
          <path d="M158 8 C108 16 64 56 54 110 C106 104 148 64 158 8 Z" fill="url(#nlLeafRight1)" />
          <path d="M158 92 C110 88 64 118 42 178 C98 178 144 144 158 92 Z" fill="url(#nlLeafRight2)" />
          <path d="M156 12 C122 44 92 74 62 104" stroke="#8de05b" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
          <path d="M154 98 C118 122 86 146 52 172" stroke="#8de05b" strokeWidth="1.4" strokeLinecap="round" opacity="0.3" />
        </svg>

        <div className="container newsletter-inner">
          <div className="newsletter-copy">
            <span className="newsletter-badge">
              STAY INFORMED <Sprout size={12} strokeWidth={2.4} />
            </span>
            <h2>
              Be the first to <span>know.</span>
            </h2>
            <p>Get product updates, exclusive offers and wellness tips straight to your inbox.</p>
          </div>

          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <div className="newsletter-input-wrap">
              <Mail size={16} className="newsletter-mail-icon" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                aria-label="Enter your email address"
              />
            </div>
            <button type="submit" className="newsletter-submit-btn">
              {subscribed ? (
                <>
                  <Check size={15} strokeWidth={3} /> Subscribed
                </>
              ) : (
                <>
                  Subscribe <ArrowRight size={15} strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      <div className="container footer-main">
        <div className="footer-brand">
          <Logo light/>
          <p>Better Animal Health. <br className="footer-tagline-br"/>Stronger Farms.</p>
          <div className="socials">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook/></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram/></a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><Youtube/></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin/></a>
          </div>
        </div>
        <div className="footer-col">
          <b>Explore</b>
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/animals">Shop by Animal</Link>
          <Link to="/about">About Life Science</Link>
        </div>
        <div className="footer-col">
          <b>Customer Support</b>
          <Link to="/account">Track Order</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/faq">FAQs</Link>
          <Link to="/shipping-and-returns">Shipping & Returns</Link>
        </div>
        <div className="footer-col footer-contact">
          <b>Registered Office & Contact</b>
          <span><Phone size={14}/> +91 80947 21000</span>
          <span><Mail size={14}/> Lifesciencepharmaceutical@gmail.com</span>
          <span style={{ display: "flex", gap: 6, alignItems: "flex-start", lineHeight: 1.4 }}>
            <MapPin size={14} style={{ flexShrink: 0, marginTop: 3 }}/>
            <span>101, Turning Point 1st, Opposite Rosary School, Viman Nagar, Pune, Maharashtra-411014</span>
          </span>
          <small>Monday – Saturday, 9:00 AM – 6:00 PM</small>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <span>© 2026 Life Science Pharmaceutical. All rights reserved.</span>
          <div>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-and-conditions">Terms & Conditions</Link>
            <Link to="/shipping-and-returns">Shipping & Returns</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
