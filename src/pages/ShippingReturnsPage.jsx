import React from "react";
import { Link } from "react-router-dom";

export default function ShippingReturnsPage() {
  return (
    <div className="simple-doc-page">
      <div className="simple-doc-container">
        {/* Breadcrumbs */}
        <div className="page-breadcrumbs">
          <Link to="/">Home</Link>
          <span>/</span>
          <b>Shipping & Returns</b>
        </div>

        {/* Page Header */}
        <header className="simple-doc-header">
          <h1>Shipping & Returns Policy</h1>
          <span className="simple-doc-date">Effective Date: November 2026</span>
        </header>

        {/* Document Content - Clean text lines only, no extra boxes */}
        <main className="simple-doc-content">
          <h2>1. Shipping & Delivery</h2>
          <p>
            Life Science Pharmaceutical delivers authentic veterinary formulations, mineral mixtures, and animal health
            supplements directly to farms, clinics, and animal caretakers across India.
          </p>
          <ul>
            <li><strong>Processing Time:</strong> Orders are verified, packed, and dispatched from our facility within 24 to 48 business hours.</li>
            <li><strong>Delivery Timeline:</strong> Standard delivery takes between 2 to 5 business days, depending on your state and postal pin code.</li>
            <li><strong>Shipping Rates:</strong> Free shipping is provided across India on all orders of ₹999 and above. Orders below ₹999 are charged a flat shipping fee of ₹50.</li>
            <li><strong>Tracking Information:</strong> Once dispatched, tracking details and live courier links are sent via SMS and email.</li>
          </ul>

          <h2>2. Replacement Conditions (Damaged, Leaked, or Wrong Item)</h2>
          <p>
            A product is eligible for replacement <strong>ONLY</strong> under the following specific conditions:
          </p>
          <ul>
            <li><strong>Transit Damage:</strong> The packaging container or bottle was physically damaged, broken, or crushed during courier transit.</li>
            <li><strong>Leakage:</strong> The product liquid, tonic, or gel has visibly leaked from the container upon arrival.</li>
            <li><strong>Incorrect Item:</strong> The product delivered does not match your confirmed order (e.g., incorrect formulation or wrong pack size delivered).</li>
          </ul>
          <p>
            In any of the above situations, we will gladly arrange a free replacement of the affected product.
          </p>

          <h2>3. Strict Policy for Opened Products (No Return & No Replacement)</h2>
          <p>
            <strong>Neither returns nor replacements will be accepted once the product packaging has been opened.</strong>
          </p>
          <p>
            If you have opened the container, broken the induction safety seal, or unsealed the bottle cap liner,
            the product <strong>CANNOT</strong> be returned and <strong>CANNOT</strong> be replaced under any circumstances.
          </p>
          <p>
            This strict policy is enforced to comply with veterinary biological safety, pharmaceutical storage standards,
            and to prevent contamination of feed and medicinal supplements across farms and animal herds.
          </p>

          <h2>4. How to Request an Eligible Replacement</h2>
          <p>
            If your package arrived damaged, leaking, or with the wrong item:
          </p>
          <ol>
            <li>Inspect the package immediately upon delivery.</li>
            <li>Take clear photographs of the damaged or leaked container, showing the bottle label and the outer shipping label.</li>
            <li>Contact our customer support team within 48 hours of delivery at <strong>Lifesciencepharmaceutical@gmail.com</strong> or call/WhatsApp <strong>+91 80947 30645</strong>.</li>
            <li>Provide your Order ID and attach the photos.</li>
          </ol>
          <p>
            Once verified by our support desk, a fresh replacement unit will be dispatched to your delivery address at no extra charge.
          </p>

          <h2>5. Order Cancellation</h2>
          <p>
            Orders can be cancelled free of charge at any time before the parcel has been dispatched to the courier partner.
            Once an order is in transit with the logistics provider, it cannot be cancelled.
          </p>

          <h2>6. Contact & Support</h2>
          <p>
            For any queries regarding shipping status or eligible replacements, reach out to our care desk:
          </p>
          <p>
            <strong>Life Science Pharmaceutical</strong><br />
            101, Turning Point 1st, Opposite Rosary School, Viman Nagar, Pune, Maharashtra - 411014<br />
            Phone: +91 80947 30645 (Monday – Saturday, 9:00 AM – 6:00 PM IST)<br />
            Email: Lifesciencepharmaceutical@gmail.com
          </p>
        </main>
      </div>
    </div>
  );
}
