import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, ShoppingBag } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { photo } from "../utils/scroll";
import CartOffersBox from "../components/CartOffersBox";

export default function CartPage({ cart, updateQty, removeItem }) {
  const navigate = useNavigate();
  const { appliedOffer, offerDiscount } = useShop();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountedSubtotal = Math.max(0, subtotal - offerDiscount);
  const shippingFee = discountedSubtotal > 999 || subtotal === 0 ? 0 : 50;
  const total = discountedSubtotal + shippingFee;

  return (
    <div className="page-wrap cart-page">
      {/* ── Breadcrumb Bar ── */}
      <div className="container">
        <div className="page-breadcrumbs">
          <Link to="/">Home</Link>
          <span>/</span>
          <b>Shopping Cart</b>
        </div>
      </div>

      <section className="container cart-main-section">
        <div className="cart-page-header">
          <h1>
            Your Cart{" "}
            <span className="cart-count-pill">
              ({cart.length} {cart.length === 1 ? "item" : "items"})
            </span>
          </h1>
          <Link to="/products" className="text-link">
            Continue Shopping <ArrowRight size={14} />
          </Link>
        </div>

        {cart.length > 0 ? (
          <div className="cart-page-layout">
            {/* Left: Cart Items List + Available Offers */}
            <div className="cart-items-column">
              <div className="cart-items-table-header">
                <span className="col-prod">Product</span>
                <span className="col-price">Price</span>
                <span className="col-qty">Quantity</span>
                <span className="col-subtotal">Subtotal</span>
                <span className="col-act" />
              </div>

              <div className="cart-items-list">
                {cart.map((item) => (
                  <div className="cart-item-row" key={item.name}>
                    <div className="cart-item-prod">
                      <div className="cart-item-img">
                        <img
                          src={photo(item.img || item.images?.main || item.imageUrl, 200)}
                          alt={item.name}
                          style={{ objectFit: "contain", background: "#fff" }}
                        />
                      </div>
                      <div className="cart-item-details">
                        <h4>{item.name}</h4>
                        <span className="cart-item-category">
                          {item.type || "Veterinary Supplement"}
                        </span>
                      </div>
                    </div>

                    <div className="cart-item-price">₹{item.price}</div>

                    <div className="cart-item-qty">
                      <div className="qty-counter mini">
                        <button
                          type="button"
                          onClick={() => updateQty(item.name, -1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span>{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.name, 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="cart-item-subtotal">₹{item.price * item.qty}</div>

                    <div className="cart-item-remove">
                      <button
                        className="remove-btn"
                        onClick={() => removeItem(item.name)}
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Direct 1-Click Offers Selector (No Coupon Typing!) */}
              <CartOffersBox />
            </div>

            {/* Right: Order Summary Box */}
            <div className="cart-summary-column">
              <div className="order-summary-card">
                <h3>Order Summary</h3>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <b>₹{subtotal}</b>
                </div>
                {offerDiscount > 0 && appliedOffer && (
                  <div className="summary-row discount-row">
                    <span>
                      Offer ({appliedOffer.title} · {appliedOffer.discountPercent}% OFF)
                    </span>
                    <b>-₹{offerDiscount}</b>
                  </div>
                )}
                <div className="summary-row">
                  <span>Shipping</span>
                  <b>
                    {shippingFee === 0 ? (
                      <span className="free-shipping">FREE</span>
                    ) : (
                      `₹${shippingFee}`
                    )}
                  </b>
                </div>
                {discountedSubtotal <= 999 && subtotal > 0 && (
                  <small className="shipping-threshold-hint">
                    Add ₹{999 - discountedSubtotal} more for FREE shipping!
                  </small>
                )}
                <div className="summary-divider" />
                <div className="summary-row summary-total-row">
                  <span>Total Amount</span>
                  <b className="total-amount-val">₹{total}</b>
                </div>

                {offerDiscount > 0 && (
                  <div className="summary-savings-banner">
                    🎉 You are saving <b>₹{offerDiscount}</b> on this order!
                  </div>
                )}

                <button
                  type="button"
                  className="button button-lime checkout-cta-btn"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout <ArrowRight size={16} />
                </button>

                <div className="summary-trust-perks">
                  <div className="perk-item">
                    <ShieldCheck size={16} />
                    <span>Safe & Secure 256-Bit Encrypted Payments</span>
                  </div>
                  <div className="perk-item">
                    <ShoppingBag size={16} />
                    <span>Direct Factory Dispatched Batch</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="cart-empty-state">
            <div className="empty-cart-icon">
              <ShoppingBag size={48} />
            </div>
            <h3>Your Shopping Cart is Empty</h3>
            <p>Looks like you haven't added any veterinary healthcare products yet.</p>
            <Link to="/products" className="button button-lime">
              Start Shopping <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
