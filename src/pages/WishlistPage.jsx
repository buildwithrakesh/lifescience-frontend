import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useShop } from "../context/ShopContext";
import ProductCard from "../components/ProductCard";

export default function WishlistPage({ add }) {
  const { wishlist, moveAllToCart, clearWishlist, removeFromWishlist, addToCart } = useShop();

  return (
    <div className="page-wrap wishlist-page">
      {/* ── Page Hero ── */}
      <section className="wishlist-hero-section">
        <div className="container">
          <div className="page-breadcrumbs light">
            <Link to="/">Home</Link>
            <span>/</span>
            <b>My Wishlist</b>
          </div>
          <div className="wishlist-hero-content">
            <h1>My Wishlist ({wishlist.length} {wishlist.length === 1 ? "Item" : "Items"})</h1>
          </div>
        </div>
      </section>

      {/* ── Main Wishlist Content ── */}
      <section className="container wishlist-main-section">
        {wishlist.length > 0 ? (
          <div className="wishlist-content-wrap">
            {/* Action Bar */}
            <div className="wishlist-top-bar">
              <span className="wishlist-count-badge">
                <Heart size={16} fill="#bd4c4c" color="#bd4c4c" />
                <b>{wishlist.length}</b> {wishlist.length === 1 ? "item saved" : "items saved"}
              </span>
              <div className="wishlist-actions-group">
                <button
                  type="button"
                  className="button button-lime button-sm move-all-btn"
                  onClick={moveAllToCart}
                >
                  <ShoppingCart size={15} /> Move All to Cart
                </button>
                <button
                  type="button"
                  className="button button-outline button-sm clear-wishlist-btn"
                  onClick={clearWishlist}
                >
                  <Trash2 size={14} /> Clear Wishlist
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="product-grid wishlist-grid">
              {wishlist.map((p) => (
                <div className="wishlist-card-wrapper" key={p.id || p.name}>
                  <ProductCard p={p} add={add || addToCart} />
                  <button
                    type="button"
                    className="wishlist-remove-strip-btn"
                    onClick={() => removeFromWishlist(p)}
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="wishlist-empty-card">
            <div className="empty-heart-icon-badge">
              <Heart size={54} color="#8dae94" />
            </div>
            <h2>Your Wishlist is Empty</h2>
            <div className="empty-wishlist-actions">
              <Link to="/products" className="button button-lime">
                Explore All Products <ArrowRight size={16} />
              </Link>
              <Link to="/animals" className="button button-outline">
                Shop by Animal
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
