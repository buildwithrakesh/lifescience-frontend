import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { photo } from "../utils/scroll";
import { useShop } from "../context/ShopContext";

let detailsChunkPrefetched = false;
const prefetchProductDetails = () => {
  if (detailsChunkPrefetched) return;
  detailsChunkPrefetched = true;
  import("../pages/ProductDetails").catch(() => {
    detailsChunkPrefetched = false;
  });
};

export default function ProductCard({ p, add }) {
  const { addToCart, toggleWishlist, isInWishlist } = useShop();
  const isSaved = isInWishlist(p);

  const displayImageUrl = p.img || p.images?.main || p.imageUrl;

  const handleAdd = (e) => {
    e.preventDefault();
    if (add) {
      add(p);
    } else {
      addToCart(p);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(p);
  };

  return (
    <article className="product-card">
      <div className="product-image">
        <button
          type="button"
          className={`save-btn ${isSaved ? "saved" : ""}`}
          onClick={handleSave}
          aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
          title={isSaved ? "Saved in wishlist" : "Add to wishlist"}
        >
          <Heart
            size={17}
            fill={isSaved ? "#bd4c4c" : "none"}
            color={isSaved ? "#bd4c4c" : "currentColor"}
          />
        </button>
        <Link
          to={`/product/${p.id}`}
          state={{ product: p }}
          onMouseEnter={prefetchProductDetails}
          onFocus={prefetchProductDetails}
          className="product-img-link"
          title={`View ${p.name} details`}
        >
          <img
            src={photo(displayImageUrl, 480)}
            alt={p.name}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        </Link>
      </div>
      <div className="product-info">
        <span className="product-type">{p.type}</span>
        <h3>
          <Link
            to={`/product/${p.id}`}
            state={{ product: p }}
            onMouseEnter={prefetchProductDetails}
            onFocus={prefetchProductDetails}
          >
            {p.name}
          </Link>
        </h3>
        <div className="product-bottom">
          <div className="product-price-stack">
            <div className="product-price-line">
              <b className="product-price-curr">₹{p.price}</b>
              <span className="product-price-mrp">₹{p.mrp || Math.round(p.price * 1.25)}</span>
            </div>
            <span className="product-price-discount">20% OFF</span>
          </div>
          <button type="button" className="add-btn" onClick={handleAdd}>
            <ShoppingCart size={15}/> Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}
