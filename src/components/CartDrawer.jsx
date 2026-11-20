import React from "react";
import { useNavigate } from "react-router-dom";
import { Truck, ShieldCheck, ShoppingCart, X, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { photo } from "../utils/scroll";
import { useShop } from "../context/ShopContext";
import CartOffersBox from "./CartOffersBox";

export default function CartDrawer({ isOpen, onClose, cart, updateQty, removeItem }) {
  const navigate = useNavigate();
  const { appliedOffer, offerDiscount } = useShop();

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const netSubtotal = Math.max(0, subtotal - offerDiscount);
  const freeThreshold = 999;
  const diff = freeThreshold - netSubtotal;
  const progress = Math.min(100, Math.round((netSubtotal / freeThreshold) * 100));

  const handleCheckoutClick = () => {
    onClose();
    navigate("/checkout");
  };

  const handleViewCartClick = () => {
    onClose();
    navigate("/cart");
  };

  return (
    <>
      <div className="cart-backdrop" onClick={onClose} />
      <aside className="cart-drawer" role="dialog" aria-label="Shopping Cart">
        <div className="cart-head">
          <h3>Shopping Cart ({cart.reduce((n, i) => n + i.qty, 0)})</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        <div className="cart-shipping-box">
          <div className="cart-shipping-text">
            <Truck size={15} />
            {diff <= 0 ? (
              <span>🎉 You've unlocked <b>FREE Shipping</b>!</span>
            ) : (
              <span>Add <b>₹{diff}</b> more for <b>FREE Shipping</b></span>
            )}
          </div>
          <div className="cart-bar">
            <div className="cart-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <ShoppingCart size={46} strokeWidth={1.5} />
            <h4>Your cart is empty</h4>
            <p>Explore our healthcare products to get started.</p>
            <button
              className="button button-green"
              onClick={() => {
                onClose();
                navigate("/products");
              }}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item.name}>
                  <img
                    src={photo(item.img || item.images?.main || item.imageUrl, 200)}
                    alt={item.name}
                    style={{ objectFit: "contain", background: "#fff" }}
                  />
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <span>{item.type}</span>
                    <div className="cart-qty">
                      <button
                        onClick={() => updateQty(item.name, -1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span>{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.name, 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-right">
                    <b>₹{item.price * item.qty}</b>
                    <button
                      className="cart-remove-btn"
                      onClick={() => removeItem(item.name)}
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Direct 1-Click Offers inside Cart Drawer */}
              <div className="cart-drawer-offers-wrap">
                <CartOffersBox compact onNavigate={onClose} />
              </div>
            </div>

            <div className="cart-foot">
              <div className="cart-total-row">
                <span>Subtotal</span>
                <b>₹{subtotal}</b>
              </div>
              {offerDiscount > 0 && appliedOffer && (
                <div className="cart-total-row cart-discount-row">
                  <span>
                    Offer ({appliedOffer.discountPercent}% OFF)
                  </span>
                  <b>-₹{offerDiscount}</b>
                </div>
              )}
              <div className="cart-foot-btns">
                <button className="cart-checkout-btn" onClick={handleCheckoutClick}>
                  Checkout · ₹{netSubtotal} <ArrowRight size={16} />
                </button>
                <button className="cart-view-cart-btn" onClick={handleViewCartClick}>
                  View Full Cart
                </button>
              </div>
              <div className="cart-badge-row">
                <span>
                  <ShieldCheck size={13} /> 100% Secure Checkout
                </span>
                <span>
                  <Truck size={13} /> Pan-India Delivery
                </span>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
