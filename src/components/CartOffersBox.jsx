import React from "react";
import { Link } from "react-router-dom";
import { Percent, Check, Tag, X } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { resolveImageUrl } from "../utils/api";

export default function CartOffersBox({ compact = false, onNavigate }) {
  const {
    cart,
    offers,
    appliedOffer,
    applyOffer,
    removeOffer,
    evaluateOfferForCart,
  } = useShop();

  if (!offers || offers.length === 0 || cart.length === 0) return null;

  // Evaluate each offer against current cart and sort eligible offers first
  const evaluatedOffers = offers
    .map((offer) => {
      const evalResult = evaluateOfferForCart(offer, cart);
      return { offer, evalResult };
    })
    .sort((a, b) => Number(b.evalResult.isEligible) - Number(a.evalResult.isEligible));

  const getScopeDesc = (offer, evalResult) => {
    if (offer.scope !== "specific") {
      return evalResult.isEligible
        ? `Valid on all products · Save ₹${evalResult.discountAmount}`
        : "Valid on all products";
    }
    const targetNames = (offer.targetProducts || []).map((t) => t.name).filter(Boolean);
    const label =
      targetNames.length === 1
        ? targetNames[0]
        : targetNames.length > 1
          ? `${targetNames[0]} + ${targetNames.length - 1} more`
          : "selected product";

    if (evalResult.isEligible) {
      return `On ${label} · Save ₹${evalResult.discountAmount}`;
    }
    return `Applicable on ${label}`;
  };

  return (
    <div className={`cart-offers-box ${compact ? "compact" : ""}`}>
      <div className="cart-offers-head">
        <div className="cart-offers-title">
          <Tag size={compact ? 14 : 16} />
          <span>Available Offers ({offers.length})</span>
        </div>
        {appliedOffer && (
          <span className="cart-offers-active-pill">
            <Check size={12} strokeWidth={3} /> {appliedOffer.discountPercent}% OFF Active
          </span>
        )}
      </div>

      <div className="cart-offers-list">
        {evaluatedOffers.map(({ offer, evalResult }) => {
          const isApplied = appliedOffer && String(appliedOffer._id) === String(offer._id);
          const firstTarget = offer.targetProducts?.[0];
          const targetUrl = firstTarget ? `/product/${firstTarget.slug || firstTarget.id}` : "/products";

          return (
            <div
              key={offer._id || offer.title}
              className={`cart-offer-item ${isApplied ? "applied" : ""} ${!evalResult.isEligible ? "ineligible" : ""}`}
            >
              <div className="cart-offer-left">
                {offer.imageUrl ? (
                  <img
                    src={resolveImageUrl(offer.imageUrl, "", 160)}
                    alt={offer.title}
                    className="cart-offer-thumb"
                  />
                ) : (
                  <div className="cart-offer-icon-box">
                    <Percent size={16} />
                  </div>
                )}

                <div className="cart-offer-meta">
                  <div className="cart-offer-name-row">
                    <strong>{offer.title}</strong>
                    <span className="cart-offer-pct-chip">{offer.discountPercent}% OFF</span>
                  </div>
                  <p className="cart-offer-scope">{getScopeDesc(offer, evalResult)}</p>
                </div>
              </div>

              <div className="cart-offer-action">
                {isApplied ? (
                  <div className="cart-offer-applied-group">
                    <span className="cart-offer-applied-badge">
                      <Check size={13} strokeWidth={3} /> Used
                    </span>
                    <button
                      type="button"
                      className="cart-offer-remove-btn"
                      onClick={removeOffer}
                      title="Remove offer"
                      aria-label="Remove active offer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : evalResult.isEligible ? (
                  <button
                    type="button"
                    className="cart-offer-use-btn"
                    onClick={() => applyOffer(offer)}
                  >
                    Use
                  </button>
                ) : (
                  <Link
                    to={targetUrl}
                    className="cart-offer-unlock-link"
                    onClick={() => {
                      if (onNavigate) onNavigate();
                    }}
                  >
                    View Item
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
