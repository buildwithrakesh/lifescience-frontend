import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2, ShieldCheck, Truck, CreditCard,
  Smartphone, Building2, Banknote, ArrowRight, ArrowLeft, Package
} from "lucide-react";
import { useShop } from "../context/ShopContext";
import CartOffersBox from "../components/CartOffersBox";

export default function CheckoutPage({ cart, clearCart, onToast }) {
  const navigate = useNavigate();
  const { appliedOffer, offerDiscount } = useShop();

  // Steps: 1 (Shipping), 2 (Payment), 3 (Confirmation)
  const [step, setStep] = useState(1);

  // Shipping Form State
  const [shippingData, setShippingData] = useState({
    fullName: "Ramesh Kumar",
    mobile: "+91 80947 21000",
    address: "Village Kheri, G.T. Road",
    city: "Karnal",
    state: "Haryana",
    pinCode: "132001"
  });

  // Payment Option State
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [placedSummary, setPlacedSummary] = useState(null);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0) || 1245;
  const discountedSubtotal = Math.max(0, subtotal - offerDiscount);
  const shippingFee = discountedSubtotal > 999 ? 0 : 50;
  const total = discountedSubtotal + shippingFee;

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (!shippingData.fullName || !shippingData.mobile || !shippingData.address || !shippingData.pinCode) {
      alert("Please fill in all mandatory shipping fields.");
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlaceOrder = () => {
    const newOrderId = "VET" + Math.floor(100000000 + Math.random() * 900000000);
    setOrderId(newOrderId);
    setPlacedSummary({
      total,
      discount: offerDiscount,
      offerTitle: appliedOffer?.title || "",
      offerPercent: appliedOffer?.discountPercent || 0,
    });

    // Save order in localStorage so it appears in My Orders dashboard!
    const newOrder = {
      id: newOrderId,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      items: cart.length > 0 ? cart : [
        { name: "Life Science Liv-Pro Liver Support", qty: 2, price: 549, img: "" }
      ],
      subtotal,
      discount: offerDiscount,
      offerTitle: appliedOffer?.title || "",
      offerPercent: appliedOffer?.discountPercent || 0,
      total: total,
      status: "Processing",
      shipping: shippingData,
      paymentMethod: paymentMethod.toUpperCase()
    };

    try {
      const existing = JSON.parse(localStorage.getItem("vetora_user_orders") || "[]");
      localStorage.setItem("vetora_user_orders", JSON.stringify([newOrder, ...existing]));
    } catch (e) {
      // ignore
    }

    if (clearCart) clearCart();
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (onToast) onToast("Order placed successfully!");
  };

  return (
    <div className="page-wrap checkout-page">
      {/* ── Step Progress Indicator ── */}
      <section className="checkout-progress-bar">
        <div className="container">
          <div className="checkout-steps-nav">
            <div className={`step-node ${step >= 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`}>
              <span className="node-num">1</span>
              <span className="node-label">Shipping</span>
            </div>
            <div className={`step-line ${step >= 2 ? "active" : ""}`} />
            <div className={`step-node ${step >= 2 ? "active" : ""} ${step > 2 ? "completed" : ""}`}>
              <span className="node-num">2</span>
              <span className="node-label">Payment</span>
            </div>
            <div className={`step-line ${step >= 3 ? "active" : ""}`} />
            <div className={`step-node ${step === 3 ? "active completed" : ""}`}>
              <span className="node-num">3</span>
              <span className="node-label">Confirmation</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Checkout Steps Body ── */}
      <section className="container checkout-body-section">
        {/* STEP 1: Shipping Address */}
        {step === 1 && (
          <div className="checkout-split-layout">
            <div className="checkout-form-col">
              <div className="checkout-card">
                <h2>Shipping Address</h2>
                <p className="checkout-sub">Enter the address where products should be delivered.</p>

                <form onSubmit={handleShippingSubmit} className="checkout-form">
                  <div className="form-group-row">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        required
                        value={shippingData.fullName}
                        onChange={(e) => setShippingData({ ...shippingData, fullName: e.target.value })}
                        placeholder="e.g. Ramesh Kumar"
                      />
                    </div>
                    <div className="form-group">
                      <label>Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        value={shippingData.mobile}
                        onChange={(e) => setShippingData({ ...shippingData, mobile: e.target.value })}
                        placeholder="e.g. +91 80947 21000"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Street Address / Farm Location *</label>
                    <input
                      type="text"
                      required
                      value={shippingData.address}
                      onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                      placeholder="e.g. Plot 42, Near Cooperative Dairy, Village Kheri"
                    />
                  </div>

                  <div className="form-group-row-3">
                    <div className="form-group">
                      <label>City / Town *</label>
                      <input
                        type="text"
                        required
                        value={shippingData.city}
                        onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                        placeholder="e.g. Karnal"
                      />
                    </div>
                    <div className="form-group">
                      <label>State *</label>
                      <input
                        type="text"
                        required
                        value={shippingData.state}
                        onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
                        placeholder="e.g. Haryana"
                      />
                    </div>
                    <div className="form-group">
                      <label>Pin Code *</label>
                      <input
                        type="text"
                        required
                        value={shippingData.pinCode}
                        onChange={(e) => setShippingData({ ...shippingData, pinCode: e.target.value })}
                        placeholder="e.g. 132001"
                      />
                    </div>
                  </div>

                  <button type="submit" className="button button-lime checkout-submit-btn">
                    Continue to Payment <ArrowRight size={16} />
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar Summary */}
            <div className="checkout-summary-col">
              <div className="order-summary-card">
                <h3>Order Summary</h3>
                <div className="summary-row">
                  <span>Items Total</span>
                  <b>₹{subtotal}</b>
                </div>
                {offerDiscount > 0 && appliedOffer && (
                  <div className="summary-row discount-row">
                    <span>
                      Offer ({appliedOffer.discountPercent}% OFF)
                    </span>
                    <b>-₹{offerDiscount}</b>
                  </div>
                )}
                <div className="summary-row">
                  <span>Delivery Charges</span>
                  <b>{shippingFee === 0 ? "FREE" : `₹${shippingFee}`}</b>
                </div>
                <div className="summary-divider" />
                <div className="summary-row summary-total-row">
                  <span>To Pay</span>
                  <b className="total-amount-val">₹{total}</b>
                </div>
                {offerDiscount > 0 && (
                  <div className="summary-savings-banner">
                    🎉 Saving <b>₹{offerDiscount}</b> with {appliedOffer?.title}
                  </div>
                )}
              </div>

              {/* Direct 1-Click Offer Selector */}
              <div style={{ marginTop: 14 }}>
                <CartOffersBox compact />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Payment Methods */}
        {step === 2 && (
          <div className="checkout-split-layout">
            <div className="checkout-form-col">
              <div className="checkout-card">
                <div className="card-header-with-back">
                  <button type="button" className="back-link-btn" onClick={() => setStep(1)}>
                    <ArrowLeft size={16} /> Edit Address
                  </button>
                  <h2>Select Payment Method</h2>
                </div>
                <p className="checkout-sub">All transactions are encrypted and secured.</p>

                <div className="payment-options-list">
                  {/* Option 1: UPI */}
                  <label className={`payment-option-card ${paymentMethod === "upi" ? "selected" : ""}`}>
                    <div className="option-radio-wrap">
                      <input
                        type="radio"
                        name="payMethod"
                        checked={paymentMethod === "upi"}
                        onChange={() => setPaymentMethod("upi")}
                      />
                      <Smartphone size={20} className="option-icon" />
                      <div className="option-title-wrap">
                        <b>UPI (Google Pay, PhonePe, Paytm, BHIM)</b>
                        <small>Instant & recommended for faster delivery</small>
                      </div>
                    </div>
                    {paymentMethod === "upi" && (
                      <div className="payment-extra-input">
                        <input
                          type="text"
                          placeholder="Enter your UPI ID (e.g. mobile@upi)"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                        />
                      </div>
                    )}
                  </label>

                  {/* Option 2: Cards */}
                  <label className={`payment-option-card ${paymentMethod === "card" ? "selected" : ""}`}>
                    <div className="option-radio-wrap">
                      <input
                        type="radio"
                        name="payMethod"
                        checked={paymentMethod === "card"}
                        onChange={() => setPaymentMethod("card")}
                      />
                      <CreditCard size={20} className="option-icon" />
                      <div className="option-title-wrap">
                        <b>Credit / Debit Card</b>
                        <small>Visa, MasterCard, RuPay, Maestro</small>
                      </div>
                    </div>
                  </label>

                  {/* Option 3: Net Banking */}
                  <label className={`payment-option-card ${paymentMethod === "netbanking" ? "selected" : ""}`}>
                    <div className="option-radio-wrap">
                      <input
                        type="radio"
                        name="payMethod"
                        checked={paymentMethod === "netbanking"}
                        onChange={() => setPaymentMethod("netbanking")}
                      />
                      <Building2 size={20} className="option-icon" />
                      <div className="option-title-wrap">
                        <b>Net Banking</b>
                        <small>All Indian Banks supported</small>
                      </div>
                    </div>
                  </label>

                  {/* Option 4: Cash on Delivery */}
                  <label className={`payment-option-card ${paymentMethod === "cod" ? "selected" : ""}`}>
                    <div className="option-radio-wrap">
                      <input
                        type="radio"
                        name="payMethod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                      />
                      <Banknote size={20} className="option-icon" />
                      <div className="option-title-wrap">
                        <b>Cash on Delivery (COD)</b>
                        <small>Pay in cash upon doorstep delivery</small>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="payment-security-note">
                  <ShieldCheck size={18} />
                  <span>Your payment details are 100% confidential and safe with Life Science.</span>
                </div>

                <button
                  type="button"
                  className="button button-lime checkout-submit-btn"
                  onClick={handlePlaceOrder}
                >
                  Place Order (₹{total}) <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Sidebar Summary */}
            <div className="checkout-summary-col">
              <div className="order-summary-card">
                <h3>Order Summary</h3>
                <div className="summary-row">
                  <span>Shipping to</span>
                  <b>{shippingData.city}, {shippingData.pinCode}</b>
                </div>
                <div className="summary-row">
                  <span>Items Total</span>
                  <b>₹{subtotal}</b>
                </div>
                {offerDiscount > 0 && appliedOffer && (
                  <div className="summary-row discount-row">
                    <span>
                      Offer ({appliedOffer.discountPercent}% OFF)
                    </span>
                    <b>-₹{offerDiscount}</b>
                  </div>
                )}
                <div className="summary-row">
                  <span>Delivery</span>
                  <b>{shippingFee === 0 ? "FREE" : `₹${shippingFee}`}</b>
                </div>
                <div className="summary-divider" />
                <div className="summary-row summary-total-row">
                  <span>Total Payable</span>
                  <b className="total-amount-val">₹{total}</b>
                </div>
                {offerDiscount > 0 && (
                  <div className="summary-savings-banner">
                    🎉 Saving <b>₹{offerDiscount}</b> with {appliedOffer?.title}
                  </div>
                )}
              </div>

              {/* Direct 1-Click Offer Selector */}
              <div style={{ marginTop: 14 }}>
                <CartOffersBox compact />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Order Confirmation (Screen 14) */}
        {step === 3 && (
          <div className="order-confirmation-wrap">
            <div className="confirmation-card">
              <div className="confirmation-success-badge">
                <CheckCircle2 size={54} color="#166534" />
              </div>
              <h1>Order Placed Successfully!</h1>
              <p className="order-ref-num">
                Order ID: <b>#{orderId || "VET205001254"}</b>
              </p>
              <p className="confirmation-sub-text">
                Thank you for your order. We have sent confirmation and dispatch details to your phone <b>{shippingData.mobile}</b>.
              </p>

              <div className="confirmation-info-box">
                <div className="info-block">
                  <span className="info-title">Estimated Delivery:</span>
                  <b className="info-val">2 – 5 Business Days</b>
                </div>
                <div className="info-block">
                  <span className="info-title">Delivery Address:</span>
                  <b className="info-val">{shippingData.fullName}, {shippingData.address}, {shippingData.city} ({shippingData.pinCode})</b>
                </div>
                <div className="info-block">
                  <span className="info-title">Payment Method:</span>
                  <b className="info-val">{paymentMethod.toUpperCase()} (Confirmed)</b>
                </div>
                {placedSummary?.discount > 0 && (
                  <div className="info-block">
                    <span className="info-title">Offer Discount Applied:</span>
                    <b className="info-val" style={{ color: "#15803d" }}>
                      -₹{placedSummary.discount} ({placedSummary.offerTitle} · {placedSummary.offerPercent}% OFF)
                    </b>
                  </div>
                )}
                <div className="info-block">
                  <span className="info-title">Total Amount Paid:</span>
                  <b className="info-val">₹{placedSummary ? placedSummary.total : total}</b>
                </div>
              </div>

              <div className="confirmation-actions">
                <Link to="/account" className="button button-lime">
                  <Package size={16} /> Track Order in Dashboard
                </Link>
                <Link to="/products" className="button button-outline">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
