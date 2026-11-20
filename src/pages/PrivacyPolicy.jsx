import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  Eye,
  Database,
  FileText,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  ShieldAlert,
  Server
} from "lucide-react";

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState("collection");

  const sections = [
    { id: "collection", title: "1. Information We Collect" },
    { id: "usage", title: "2. How We Use Your Information" },
    { id: "payment", title: "3. Payment & Financial Data Security" },
    { id: "sharing", title: "4. Data Sharing & Logistics Partners" },
    { id: "cookies", title: "5. Cookies & Local Browser Storage" },
    { id: "retention", title: "6. Data Retention & Safeguards" },
    { id: "rights", title: "7. Your Privacy Rights & Controls" },
    { id: "minors", title: "8. Policy for Minors" },
    { id: "grievance", title: "9. Grievance Officer & Contact" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 140;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="legal-page-wrap">
      {/* ── Page Hero Header ── */}
      <section className="legal-hero">
        <div className="container legal-hero-inner">
          <div className="page-breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <b>Privacy Policy</b>
          </div>
          <h1>Privacy Policy</h1>
          <div className="legal-meta-row">
            <span><Calendar size={13} /> Last Updated: November 2026</span>
            <span>•</span>
            <span><Clock size={13} /> 5 min read</span>
          </div>
        </div>
      </section>

      <div className="container">
        {/* ── Quick Highlight Cards ── */}
        <div className="legal-highlight-cards">
          <div className="legal-highlight-card">
            <div className="legal-highlight-icon">
              <ShieldCheck size={20} />
            </div>
            <b>100% Confidentiality</b>
            <p>Your herd records, farm location, and order history are kept strictly confidential.</p>
          </div>
          <div className="legal-highlight-card">
            <div className="legal-highlight-icon">
              <Eye size={20} />
            </div>
            <b>Zero Data Selling</b>
            <p>We never sell, rent, or trade your personal or business data to advertisers or third parties.</p>
          </div>
          <div className="legal-highlight-card">
            <div className="legal-highlight-icon">
              <Database size={20} />
            </div>
            <b>Your Full Control</b>
            <p>Easily manage, update, or request permanent deletion of your profile and data at any time.</p>
          </div>
        </div>

        {/* ── Main Two-Column Layout ── */}
        <div className="legal-grid-layout">
          {/* Sticky Sidebar Navigation */}
          <aside className="legal-sidebar-sticky">
            <div className="legal-sidebar-title">Table of Contents</div>
            <ul className="legal-toc-list">
              {sections.map((sec) => (
                <li key={sec.id}>
                  <a
                    href={`#${sec.id}`}
                    className={`legal-toc-link ${activeSection === sec.id ? "active" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const target = document.getElementById(sec.id);
                      if (target) {
                        target.scrollIntoView({ behavior: "smooth" });
                        setActiveSection(sec.id);
                      }
                    }}
                  >
                    <ChevronRight size={13} />
                    <span>{sec.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          {/* Legal Document Content */}
          <main className="legal-content-card">
            {/* Section 1 */}
            <section className="legal-section" id="collection">
              <div className="legal-section-header">
                <span className="legal-section-num">01</span>
                <h2>Information We Collect</h2>
              </div>
              <p>
                When you interact with the Life Science Pharmaceutical digital platform (accessible at lifesciencepharmaceutical.in),
                we collect only the necessary information to provide genuine veterinary pharmaceuticals, livestock nutrition
                consultations, and prompt doorstep delivery.
              </p>
              <ul>
                <li>
                  <strong>Personal & Contact Data:</strong> Your name, phone number, email address, farm/clinic name,
                  and complete postal delivery addresses (including PIN code, landmark, and district).
                </li>
                <li>
                  <strong>Order & Prescription Details:</strong> Products purchased (calcium suspensions, liver tonics, boluses,
                  feed premixes), pack sizes, veterinary doctor notes (if provided), and delivery instructions.
                </li>
                <li>
                  <strong>Technical & Device Information:</strong> Internet Protocol (IP) address, browser version, device operating
                  system, language preferences (e.g., English or Hindi), and push notification tokens (Firebase Cloud Messaging)
                  when alerts are enabled.
                </li>
              </ul>
              <div className="legal-callout-box">
                <strong>Transparent Ingestion:</strong> We do not secretly scrape or collect data from your contacts, camera, or
                private phone storage. All information is provided directly by you during registration, checkout, or contact form submission.
              </div>
            </section>

            {/* Section 2 */}
            <section className="legal-section" id="usage">
              <div className="legal-section-header">
                <span className="legal-section-num">02</span>
                <h2>How We Use Your Information</h2>
              </div>
              <p>
                The information collected is strictly utilized to operate our direct-to-farm supply chain and enhance customer care:
              </p>
              <ol>
                <li><strong>Order Fulfillment:</strong> Packaging, batch assignment, invoicing, and real-time dispatch tracking.</li>
                <li><strong>Customer Support:</strong> Responding to order queries, product guidance, dosage questions, and veterinary advice.</li>
                <li><strong>Push Notifications & Alerts:</strong> Sending timely delivery status notifications, seasonal livestock disease alerts, and exclusive promotional offers (you can opt out anytime in settings).</li>
                <li><strong>Regulatory Compliance:</strong> Maintaining statutory sales ledgers and GST invoicing as required under Indian pharmaceutical laws.</li>
              </ol>
            </section>

            {/* Section 3 */}
            <section className="legal-section" id="payment">
              <div className="legal-section-header">
                <span className="legal-section-num">03</span>
                <h2>Payment & Financial Data Security</h2>
              </div>
              <p>
                We prioritize extreme security for all digital transactions conducted on our storefront:
              </p>
              <ul>
                <li>
                  <strong>No Card Data Stored:</strong> Life Science Pharmaceutical does <em>NOT</em> store your debit card numbers,
                  credit card numbers, CVV codes, UPI PINs, or net banking passwords on our servers.
                </li>
                <li>
                  <strong>Authorized Gateways:</strong> All payments are processed through PCI-DSS Level 1 compliant, RBI-authorized
                  payment aggregators (supporting UPI, RuPay, Visa, MasterCard, and Net Banking across 50+ banks).
                </li>
                <li>
                  <strong>Cash on Delivery (COD):</strong> For offline COD orders, only your delivery address and phone number are
                  shared with the courier delivery executive for verification upon parcel handover.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="legal-section" id="sharing">
              <div className="legal-section-header">
                <span className="legal-section-num">04</span>
                <h2>Data Sharing & Logistics Partners</h2>
              </div>
              <p>
                We do not sell, rent, or monetize your personal or commercial data. We only share essential delivery data with
                trusted logistics and operational partners under binding confidentiality agreements:
              </p>
              <ul>
                <li>
                  <strong>Courier & Freight Partners:</strong> Trusted logistics networks (such as Delhivery, Blue Dart, DTDC,
                  and India Post) receive your name, address, phone number, and package dimensions to ensure fast doorstep delivery.
                </li>
                <li>
                  <strong>Statutory Authorities:</strong> If legally compelled by a court order, authorized government tax office,
                  or law enforcement agency under the Information Technology Act, 2000.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="legal-section" id="cookies">
              <div className="legal-section-header">
                <span className="legal-section-num">05</span>
                <h2>Cookies & Local Browser Storage</h2>
              </div>
              <p>
                Our web application uses essential cookies and local browser storage (HTML5 localStorage) to provide a seamless shopping experience:
              </p>
              <ul>
                <li><strong>Cart Persistence:</strong> Retains products added to your cart so you do not lose your selections when navigating between pages.</li>
                <li><strong>Language Preference:</strong> Stores your selected language (<code>life_science_lang</code>: Hindi or English) to maintain consistent translation without reloading banners.</li>
                <li><strong>Authentication:</strong> Securely stores encrypted JWT tokens when you are logged into your customer or admin account.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="legal-section" id="retention">
              <div className="legal-section-header">
                <span className="legal-section-num">06</span>
                <h2>Data Retention & Safeguards</h2>
              </div>
              <p>
                All account profiles and database backups are hosted in secure, certified cloud infrastructure protected by
                firewalls, automated intrusion detection, and industry-standard salted hashing (bcrypt) for user passwords.
              </p>
              <p>
                We retain your purchase history for as long as your account remains active or as required by Indian commercial
                and tax regulations (ordinarily up to 7 years for GST reconciliation).
              </p>
            </section>

            {/* Section 7 */}
            <section className="legal-section" id="rights">
              <div className="legal-section-header">
                <span className="legal-section-num">07</span>
                <h2>Your Privacy Rights & Controls</h2>
              </div>
              <p>
                As a valued customer, you hold comprehensive rights over your personal data:
              </p>
              <ul>
                <li><strong>Access & Review:</strong> View all saved addresses, active orders, and personal details in your Account page.</li>
                <li><strong>Correction:</strong> Update phone numbers, delivery addresses, and farm details with one click.</li>
                <li><strong>Notification Opt-Out:</strong> Dismiss or revoke push notification permissions anytime directly in your browser settings.</li>
                <li><strong>Account Deletion:</strong> Request full closure and removal of your customer account by emailing our care desk.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section className="legal-section" id="minors">
              <div className="legal-section-header">
                <span className="legal-section-num">08</span>
                <h2>Policy for Minors</h2>
              </div>
              <p>
                Our services and veterinary products are intended for adults, including farmers, dairy professionals, veterinarians,
                and legal pet owners aged 18 and above. We do not knowingly collect personal information from individuals under the age of 18.
              </p>
            </section>

            {/* Section 9 */}
            <section className="legal-section" id="grievance">
              <div className="legal-section-header">
                <span className="legal-section-num">09</span>
                <h2>Grievance Officer & Contact</h2>
              </div>
              <p>
                In compliance with the Information Technology Act, 2000 and the Consumer Protection (E-Commerce) Rules, 2020,
                the details of our designated Grievance Officer are provided below:
              </p>
              <div className="legal-contact-box">
                <span><MapPin size={16} /> <strong>Life Science Pharmaceutical</strong>, 101, Turning Point 1st, Opposite Rosary School, Viman Nagar, Pune, Maharashtra - 411014</span>
                <span><Mail size={16} /> <strong>Email:</strong> Lifesciencepharmaceutical@gmail.com</span>
                <span><Phone size={16} /> <strong>Helpline:</strong> +91 80947 30645 (Mon – Sat, 9:00 AM – 6:00 PM IST)</span>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
