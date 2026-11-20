import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { apiFetch } from "../utils/api";

const ShopContext = createContext(null);

const pickProductImage = (item) => {
  if (!item) return "";
  const candidate = item.img || item.images?.main || item.imageUrl || "";
  if (
    typeof candidate === "string" &&
    (candidate.startsWith("http://") ||
      candidate.startsWith("https://") ||
      candidate.startsWith("/") ||
      candidate.startsWith("data:"))
  ) {
    return candidate;
  }
  return "";
};

const matchLiveCatalogProduct = (item, catalog) => {
  if (!item || !Array.isArray(catalog) || catalog.length === 0) return null;
  const itemId = String(item.id || item._id || "").trim().toLowerCase();
  const baseName = String(item.name || "")
    .replace(/\s*\([^)]*\)\s*$/, "")
    .trim()
    .toLowerCase();
  return (
    catalog.find((p) => {
      const pid = String(p.id || "").trim().toLowerCase();
      const pmid = String(p._id || "").trim().toLowerCase();
      const pname = String(p.name || "").trim().toLowerCase();
      return (
        (itemId && (pid === itemId || pmid === itemId)) ||
        (baseName && pname === baseName)
      );
    }) || null
  );
};

const hydrateItemImage = (item, catalog = []) => {
  if (!item) return item;
  const liveMatch = matchLiveCatalogProduct(item, catalog);
  const existingImg = pickProductImage(item);
  // Prefer existing valid Cloudinary/pack image if already a real http(s) URL; else pull live catalog image
  const liveImg = liveMatch ? pickProductImage(liveMatch) : "";
  const resolved = existingImg || liveImg || item.img || "";
  if (resolved === item.img && resolved) return item;
  return {
    ...item,
    img: resolved,
    imageUrl: resolved,
    images: { ...(item.images || {}), main: resolved },
  };
};

export function evaluateOfferForCart(offer, cart = []) {
  if (!offer || !Array.isArray(cart) || cart.length === 0) {
    return { isEligible: false, eligibleSubtotal: 0, discountAmount: 0, matchedNames: [] };
  }

  const pct = Number(offer.discountPercent) || 0;
  if (pct <= 0) {
    return { isEligible: false, eligibleSubtotal: 0, discountAmount: 0, matchedNames: [] };
  }

  // Scope: All products
  if (offer.scope !== "specific") {
    const eligibleSubtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.qty || 1), 0);
    const discountAmount = Math.round((eligibleSubtotal * pct) / 100);
    return {
      isEligible: eligibleSubtotal > 0 && discountAmount > 0,
      eligibleSubtotal,
      discountAmount,
      matchedNames: cart.map((i) => i.name),
    };
  }

  // Scope: Specific product(s)
  const idSet = new Set(
    (offer.productIds || []).map((x) => String(x || "").trim().toLowerCase()).filter(Boolean)
  );
  const nameSet = new Set();

  if (Array.isArray(offer.targetProducts)) {
    offer.targetProducts.forEach((tp) => {
      if (tp?.id) idSet.add(String(tp.id).trim().toLowerCase());
      if (tp?.slug) idSet.add(String(tp.slug).trim().toLowerCase());
      if (tp?.name) nameSet.add(String(tp.name).trim().toLowerCase());
    });
  }

  let eligibleSubtotal = 0;
  const matchedNames = [];

  cart.forEach((item) => {
    const itemIds = [item.id, item._id, item.slug]
      .filter(Boolean)
      .map((x) => String(x).trim().toLowerCase());
    const itemName = String(item.name || "").trim().toLowerCase();

    const matched =
      itemIds.some((idVal) => idSet.has(idVal)) ||
      (itemName && nameSet.has(itemName));

    if (matched) {
      eligibleSubtotal += (Number(item.price) || 0) * (item.qty || 1);
      matchedNames.push(item.name);
    }
  });

  const discountAmount = Math.round((eligibleSubtotal * pct) / 100);
  return {
    isEligible: eligibleSubtotal > 0 && discountAmount > 0,
    eligibleSubtotal,
    discountAmount,
    matchedNames,
  };
}

// Instant initial snapshot of live offers (overwritten immediately when /api/offers responds)
const DEFAULT_OFFERS = [
  {
    _id: "6afd1faca1ef82245a638852",
    title: "Special Offers for New Customers",
    subtitle: "",
    imageUrl: "https://res.cloudinary.com/duqwahasz/image/upload/v1794977077/lifescience/offers/msg9ephdbg9bmeeflbfu.jpg",
    discountPercent: 15,
    scope: "all",
    productIds: [],
    targetProducts: [],
    isActive: true,
    sortOrder: 0,
  },
  {
    _id: "6afd2c5c2aaf05a6b567f0a6",
    title: "Skin Life Spray Offer",
    subtitle: "",
    imageUrl: "https://res.cloudinary.com/duqwahasz/image/upload/v1794976814/lifescience/offers/t3omjbcfaf9f6a76phx4.jpg",
    discountPercent: 20,
    scope: "specific",
    productIds: ["lifescience-milk-booster", "6af8215dc8da078613fa509c"],
    targetProducts: [
      {
        id: "6af8215dc8da078613fa509c",
        slug: "lifescience-milk-booster",
        name: "Skin Life Spray",
        image: "https://res.cloudinary.com/duqwahasz/image/upload/v1794908325/lifescience/products/udy0zvtjzcmqtgilvnfr.jpg",
        price: 649,
      },
    ],
    isActive: true,
    sortOrder: 1,
  },
];

export function ShopProvider({ children, showToast }) {
  // Cart State (loaded from localStorage)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("vetora_cart_items");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Wishlist State (loaded from localStorage)
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("vetora_wishlist_items");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Active Offers State (loaded from cache -> live snapshot -> live API)
  const [offers, setOffers] = useState(() => {
    try {
      const cached = localStorage.getItem("lifescience_active_offers");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((o) => o.isActive !== false);
        }
      }
    } catch (e) {}
    return DEFAULT_OFFERS;
  });

  // Selected Active Offer ID for user's cart
  const [appliedOfferId, setAppliedOfferId] = useState(() => {
    try {
      return localStorage.getItem("vetora_applied_offer_id") || null;
    } catch (e) {
      return null;
    }
  });

  const refreshOffers = useCallback(async () => {
    try {
      const res = await apiFetch("/api/offers");
      if (res.success && Array.isArray(res.data)) {
        setOffers(res.data);
        try {
          localStorage.setItem("lifescience_active_offers", JSON.stringify(res.data));
        } catch (e) {}
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    refreshOffers();
  }, [refreshOffers]);

  // Self-heal any saved cart/wishlist items that lack a valid live image URL (e.g. old localStorage entries)
  useEffect(() => {
    const needsHeal = (list) =>
      Array.isArray(list) &&
      list.some((item) => {
        const img = pickProductImage(item);
        return !img || !img.includes("cloudinary.com");
      });

    if (!needsHeal(cart) && !needsHeal(wishlist)) return;

    const applyCatalog = (catalog) => {
      if (!Array.isArray(catalog) || catalog.length === 0) return;
      const heal = (item) => {
        const cur = pickProductImage(item);
        if (cur && cur.includes("cloudinary.com")) return item;
        const liveMatch = matchLiveCatalogProduct(item, catalog);
        const liveImg = liveMatch ? pickProductImage(liveMatch) : "";
        if (!liveImg) return hydrateItemImage(item, catalog);
        return {
          ...item,
          img: liveImg,
          imageUrl: liveImg,
          images: { ...(item.images || {}), main: liveImg },
        };
      };
      setCart((prev) => prev.map(heal));
      setWishlist((prev) => prev.map(heal));
    };

    try {
      const cached = localStorage.getItem("lifescience_cached_products");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          applyCatalog(parsed);
          return;
        }
      }
    } catch {}

    apiFetch("/api/products?limit=200")
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          applyCatalog(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Save cart changes
  useEffect(() => {
    try {
      localStorage.setItem("vetora_cart_items", JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  // Save wishlist changes
  useEffect(() => {
    try {
      localStorage.setItem("vetora_wishlist_items", JSON.stringify(wishlist));
    } catch (e) {}
  }, [wishlist]);

  // Save appliedOfferId changes
  useEffect(() => {
    try {
      if (appliedOfferId) {
        localStorage.setItem("vetora_applied_offer_id", appliedOfferId);
      } else {
        localStorage.removeItem("vetora_applied_offer_id");
      }
    } catch (e) {}
  }, [appliedOfferId]);

  // Cart operations
  const addToCart = (product, quantity = 1, packSize = null) => {
    const resolvedImg =
      pickProductImage(product) || product.images?.main || product.imageUrl || product.img || "";
    const normalizedProduct = {
      ...product,
      img: resolvedImg,
      imageUrl: resolvedImg,
      images: { ...(product.images || {}), main: resolvedImg },
    };

    setCart((prev) => {
      const found = prev.find((x) => x.name === normalizedProduct.name);
      if (found) {
        return prev.map((x) =>
          x.name === normalizedProduct.name
            ? {
                ...x,
                img: pickProductImage(x) || resolvedImg,
                imageUrl: pickProductImage(x) || resolvedImg,
                qty: x.qty + quantity,
              }
            : x
        );
      }
      return [
        ...prev,
        {
          ...normalizedProduct,
          selectedPack: packSize,
          qty: quantity,
        },
      ];
    });
    if (showToast) showToast(`${normalizedProduct.name} added to cart`);
  };

  const updateQty = (name, delta) => {
    setCart((prev) =>
      prev
        .map((x) => {
          if (x.name === name) {
            const nextQty = x.qty + delta;
            return nextQty > 0 ? { ...x, qty: nextQty } : null;
          }
          return x;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (name) => {
    setCart((prev) => prev.filter((x) => x.name !== name));
    if (showToast) showToast("Item removed from cart");
  };

  const clearCart = () => {
    setCart([]);
    setAppliedOfferId(null);
  };

  // Offer selection actions
  const applyOffer = (offer, options = {}) => {
    if (!offer || !offer._id) return;
    const { allowPreselect = false } = options;

    // Toggle off if already selected via banner button
    if (allowPreselect && String(appliedOfferId) === String(offer._id)) {
      setAppliedOfferId(null);
      if (showToast) showToast("Offer removed");
      return;
    }

    const check = evaluateOfferForCart(offer, cart);
    if (!check.isEligible) {
      if (allowPreselect) {
        setAppliedOfferId(offer._id);
        const scopeHint =
          offer.scope === "specific" && offer.targetProducts?.[0]?.name
            ? `Applies automatically when you add ${offer.targetProducts[0].name} to cart.`
            : "Add products to cart to enjoy this discount.";
        if (showToast) {
          showToast(`🎉 "${offer.title}" (${offer.discountPercent}% OFF) activated! ${scopeHint}`);
        }
        return;
      }
      if (showToast) showToast("Add the eligible product to your cart to use this offer.");
      return;
    }

    setAppliedOfferId(offer._id);
    if (showToast) {
      showToast(`🎉 "${offer.title}" (${offer.discountPercent}% OFF) activated! You save ₹${check.discountAmount}`);
    }
  };

  const removeOffer = () => {
    setAppliedOfferId(null);
    if (showToast) showToast("Offer removed");
  };

  // Evaluate currently active offer against current cart
  const { appliedOffer, offerDiscount, appliedOfferMeta } = useMemo(() => {
    if (!appliedOfferId || offers.length === 0 || cart.length === 0) {
      return { appliedOffer: null, offerDiscount: 0, appliedOfferMeta: null };
    }
    const found = offers.find((o) => String(o._id) === String(appliedOfferId));
    if (!found) {
      return { appliedOffer: null, offerDiscount: 0, appliedOfferMeta: null };
    }
    const evalResult = evaluateOfferForCart(found, cart);
    if (!evalResult.isEligible) {
      return { appliedOffer: null, offerDiscount: 0, appliedOfferMeta: null };
    }
    return {
      appliedOffer: found,
      offerDiscount: evalResult.discountAmount,
      appliedOfferMeta: evalResult,
    };
  }, [appliedOfferId, offers, cart]);

  // Wishlist operations
  const isInWishlist = (product) => {
    if (!product) return false;
    const id = product.id || product;
    const name = product.name || product;
    return wishlist.some((p) => p.id === id || p.name === name);
  };

  const toggleWishlist = (product) => {
    if (!product) return;
    const exists = isInWishlist(product);
    if (exists) {
      setWishlist((prev) =>
        prev.filter((p) => p.id !== product.id && p.name !== product.name)
      );
      if (showToast) showToast(`${product.name} removed from wishlist`);
    } else {
      setWishlist((prev) => [...prev, product]);
      if (showToast) showToast(`${product.name} saved to wishlist`);
    }
  };

  const removeFromWishlist = (product) => {
    const id = product.id || product;
    const name = product.name || product;
    setWishlist((prev) => prev.filter((p) => p.id !== id && p.name !== name));
    if (showToast) showToast("Item removed from wishlist");
  };

  const moveAllToCart = () => {
    if (wishlist.length === 0) return;
    setCart((prev) => {
      let nextCart = [...prev];
      wishlist.forEach((p) => {
        const found = nextCart.find((x) => x.name === p.name);
        if (found) {
          nextCart = nextCart.map((x) =>
            x.name === p.name ? { ...x, qty: x.qty + 1 } : x
          );
        } else {
          nextCart.push({ ...p, qty: 1 });
        }
      });
      return nextCart;
    });
    setWishlist([]);
    if (showToast) showToast("All wishlist items moved to cart!");
  };

  const clearWishlist = () => {
    setWishlist([]);
    if (showToast) showToast("Wishlist cleared");
  };

  const cartCount = cart.reduce((n, p) => n + (p.qty || 1), 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.qty || 1), 0);
  const wishlistCount = wishlist.length;

  return (
    <ShopContext.Provider
      value={{
        cart,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        wishlist,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        moveAllToCart,
        clearWishlist,
        wishlistCount,
        offers,
        refreshOffers,
        appliedOffer,
        appliedOfferId,
        appliedOfferMeta,
        offerDiscount,
        applyOffer,
        removeOffer,
        evaluateOfferForCart,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
}
