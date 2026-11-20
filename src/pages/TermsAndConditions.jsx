import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  HelpCircle
} from "lucide-react";

export default function TermsAndConditions() {
  const [activeSection, setActiveSection] = useState("acceptance");

  const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms" },
    { id: "disclaimer", title: "2. Veterinary Information Disclaimer" },
    { id: "account", title: "3. Account Registration & Security" },
    { id: "pricing", title: "4. Product Pricing & Invoicing" },
    { id: "orders", title: "5. Order Acceptance & Fulfillment" },
    { id: "shipping", title: "6. Shipping & Doorstep Delivery" },
    { id: "refunds", title: "7. Replacement, Cancellation & Refunds" },
    { id: "ip", title: "8. Intellectual Property & Trademarks" },
    { id: "liability", title: "9. Limitation of Liability" },
    { id: "governing", title: "10. Governing Law & Jurisdiction" }
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
            <b>Terms & Conditions</b>
          </div>
          <h1>Terms & Conditions</h1>
          <div className="legal-meta-row">
            <span><Calendar size={13} /> Effective Date: November 2026</span>
            <span>•</span>
            <span><Clock size={13} /> 6 min read</span>
            <span>•</span>
            <span><ShieldCheck size={13} /> Binding Legal Contract</span>
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
            <b>GMP Standard Quality</b>
            <p>Every product batch is manufactured under strict WHO-GMP and ISO certified production standards.</p>
          </div>
          <div className="legal-highlight-card">
            <div className="legal-highlight-icon">
              <RotateCcw size={20} />
            </div>
            <b>7-Day Replacement</b>
            <p>Hassle-free replacement for any damaged, leaked, or wrong product received during transit.</p>
          </div>
          <div className="legal-highlight-card">
            <div className="legal-highlight-icon">
              <AlertTriangle size={20} />
            </div>
            <b>Veterinary Guidance</b>
            <p>Nutritional guidelines are for support; severe clinical emergencies require a licensed veterinarian.</p>
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
            <section className="legal-section" id="acceptance">
              <div className="legal-section-header">
                <span className="legal-section-num">01</span>
                <h2>Acceptance of Terms</h2>
              </div>
              <p>
                By visiting, browsing, or purchasing products on <strong>lifesciencepharma.in</strong> (referred to as the "Website"
                or "Platform"), you agree to be legally bound by these Terms and Conditions and our Privacy Policy.
              </p>
              <p>
                These terms constitute a legally enforceable electronic contract under the provisions of the Information Technology Act,
                2000 and rules made thereunder. If you do not agree with any part of these terms, please do not use the website or order products.
              </p>
            </section>

            {/* Section 2 */}
            <section className="legal-section" id="disclaimer">
              <div className="legal-section-header">
                <span className="legal-section-num">02</span>
                <h2>Veterinary Information & Usage Disclaimer</h2>
              </div>
              <p>
                Life Science Pharmaceutical formulates veterinary nutritional supplements, ionic calcium suspensions, mineral mixtures,
                and herbal liver tonics intended for livestock, dairy cattle, poultry, companion pets, and aquaculture.
              </p>
              <ul>
                <li>
                  <strong>Informational Guidance:</strong> All content, composition tables, articles in the Knowledge Centre,
                  and recommended dosages published on the website are for educational and advisory guidance only.
                </li>
                <li>
                  <strong>Not a Substitute for In-Person Diagnosis:</strong> Product information is not intended to replace direct
                  examination, diagnosis, or clinical prescription by a registered Veterinary Medical Practitioner (BVSc / MVSc).
                </li>
                <li>
                  <strong>Dosage Protocols:</strong> Always adhere to the recommended species dosage stated on product packaging
                  labels or as advised by your local veterinarian.
                </li>
              </ul>
              <div className="legal-callout-box">
                <strong>Emergency Note:</strong> In critical animal conditions (e.g. acute bloat, severe mastitis, dystocia, or sudden downer cow syndrome),
                immediately contact a local veterinarian for emergency medical intervention.
              </div>
            </section>

            {/* Section 3 */}
            <section className="legal-section" id="account">
              <div className="legal-section-header">
                <span className="legal-section-num">03</span>
                <h2>Account Registration & Security</h2>
              </div>
              <p>
                When creating an account on Life Science, you must provide accurate, current, and complete information, including
                your full name, farm or clinic name, active mobile number, and accurate delivery pin code.
              </p>
              <p>
                You are solely responsible for maintaining the confidentiality of your account password and for all activities that
                occur under your account. Life Science will not be liable for any loss arising from unauthorized use of your credentials.
              </p>
            </section>

            {/* Section 4 */}
            <section className="legal-section" id="pricing">
              <div className="legal-section-header">
                <span className="legal-section-num">04</span>
                <h2>Product Pricing, Tax & Invoicing</h2>
              </div>
              <ul>
                <li>
                  <strong>Currency & Taxes:</strong> All prices displayed on our website are in Indian Rupees (INR ₹) and are inclusive
                  of applicable Goods and Services Tax (GST) under Indian tax laws.
                </li>
                <li>
                  <strong>Price Adjustments:</strong> Life Science reserves the right to modify prices, pack size availability, or
                  promotional offers at any time without prior notice. The price charged will be the price displayed at the moment of checkout.
                </li>
                <li>
                  <strong>Invoicing:</strong> A GST-compliant tax invoice is provided with every dispatch and is also downloadable
                  directly from your account order history.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="legal-section" id="orders">
              <div className="legal-section-header">
                <span className="legal-section-num">05</span>
                <h2>Order Acceptance & Fulfillment</h2>
              </div>
              <p>
                Upon placing an order, you will receive an automated confirmation SMS and email. This confirmation does not constitute final
                acceptance of your order, but an acknowledgment of receipt.
              </p>
              <p>
                We reserve the right to cancel or limit quantities on any order due to product stockout, incorrect pricing displayed by
                technical error, non-serviceable pin codes, or suspected fraudulent activity. In such events, any payment made will be refunded
                in full to the original source.
              </p>
            </section>

            {/* Section 6 */}
            <section className="legal-section" id="shipping">
              <div className="legal-section-header">
                <span className="legal-section-num">06</span>
                <h2>Shipping & Doorstep Delivery</h2>
              </div>
              <ul>
                <li>
                  <strong>Delivery Timelines:</strong> Orders are typically processed and dispatched within 24–48 hours of confirmation.
                  Delivery takes between 2 to 5 business days depending on transit routes and destination pin codes.
                </li>
                <li>
                  <strong>Shipping Charges:</strong> Free delivery is provided across India on all orders exceeding ₹999. Orders below ₹999
                  incur a flat ₹50 shipping fee.
                </li>
                <li>
                  <strong>Package Inspection:</strong> Customers or farm staff are requested to inspect the outer shipping carton upon arrival.
                  If the package is visibly damaged, torn, or leaking, please take photographs and notify the delivery executive immediately.
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="legal-section" id="refunds">
              <div className="legal-section-header">
                <span className="legal-section-num">07</span>
                <h2>Replacement, Cancellation & Refunds</h2>
              </div>
              <p>
                We are committed to delivering intact, unadulterated pharmaceutical-grade animal supplements:
              </p>
              <ul>
                <li>
                  <strong>Cancellation:</strong> You may cancel your order at zero cost before the package has been handed over to our
                  shipping courier by calling our helpline (+91 80947 21000) or via your Account dashboard.
                </li>
                <li>
                  <strong>7-Day Replacement Guarantee:</strong> If you receive a damaged bottle, leaking container, broken seal, or incorrect
                  product variant, you can request a free replacement within 7 days of delivery by emailing photos to Lifesciencepharmaceutical@gmail.com.
                </li>
                <li>
                  <strong>Biological Safety Restocking Rule:</strong> Once an induction seal, inner liner, or bottle cap has been opened
                  or used on animals, the product cannot be returned for biological contamination and biosecurity reasons.
                </li>
                <li>
                  <strong>Refund Processing:</strong> Approved refunds are credited directly back to the original payment source (UPI / Card / Net Banking)
                  within 5 to 7 business days.
                </li>
              </ul>
            </section>

            {/* Section 8 */}
            <section className="legal-section" id="ip">
              <div className="legal-section-header">
                <span className="legal-section-num">08</span>
                <h2>Intellectual Property & Trademarks</h2>
              </div>
              <p>
                All brand logos, trademarks (including <em>Life Science Pharmaceutical</em>, <em>VetCare</em>, <em>Calci-Gel</em>,
                <em>Liv-Pro</em>, <em>Zyme-Digest</em>), packaging artwork, label graphics, product photography, and website code
                are the exclusive intellectual property of Life Science Pharmaceutical.
              </p>
              <p>
                No part of this website may be copied, reproduced, distributed, or mirrored without prior written consent from our management.
              </p>
            </section>

            {/* Section 9 */}
            <section className="legal-section" id="liability">
              <div className="legal-section-header">
                <span className="legal-section-num">09</span>
                <h2>Limitation of Liability</h2>
              </div>
              <p>
                To the maximum extent permitted by applicable Indian law, Life Science Pharmaceutical, its directors, employees, and suppliers
                shall not be liable for any indirect, incidental, or consequential damages resulting from improper storage, misuse of veterinary
                products contrary to label instructions, or delayed transit caused by natural disasters, strikes, or road blockages.
              </p>
              <p>
                In any case, Life Science's total aggregate liability shall not exceed the actual invoice value paid by the customer for the specific
                product in dispute.
              </p>
            </section>

            {/* Section 10 */}
            <section className="legal-section" id="governing">
              <div className="legal-section-header">
                <span className="legal-section-num">10</span>
                <h2>Governing Law & Jurisdiction</h2>
              </div>
              <p>
                These Terms and Conditions shall be governed by and construed in accordance with the laws of the Republic of India.
                Any disputes, claims, or controversies arising out of or related to the use of this website or purchases made hereunder shall
                be subject to the exclusive jurisdiction of the competent courts in <strong>Pune, Maharashtra, India</strong>.
              </p>
              <div className="legal-contact-box">
                <span><MapPin size={16} /> <strong>Corporate Office:</strong> 101, Turning Point 1st, Opposite Rosary School, Viman Nagar, Pune, Maharashtra - 411014</span>
                <span><Mail size={16} /> <strong>Email:</strong> Lifesciencepharmaceutical@gmail.com</span>
                <span><Phone size={16} /> <strong>Helpline:</strong> +91 80947 21000 (Monday – Saturday, 9:00 AM – 6:00 PM IST)</span>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
