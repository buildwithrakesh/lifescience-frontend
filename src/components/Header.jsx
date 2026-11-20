import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Truck, ShieldCheck, Menu, X, ChevronDown, ArrowRight,
  Search, UserRound, Heart, ShoppingCart
} from "lucide-react";
import Logo from "./Logo";
import LanguageSelector from "./LanguageSelector";
import { animals } from "../data/animals";
import { useShop } from "../context/ShopContext";

export default function Header({ cartCount: propCartCount, onOpenCart }) {
  const location = useLocation();
  const isProductsPage = location.pathname === "/products";

  const shop = useShop();
  const shopCartCount = shop ? shop.cartCount : (propCartCount || 0);
  const shopWishlistCount = shop ? shop.wishlistCount : 0;

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("");
  const [mobileSubOpen, setMobileSubOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isHeaderFixed, setIsHeaderFixed] = useState(false);
  const navigate = useNavigate();

  // Switch header to position:fixed once scrolled past the 31px topbar.
  // Prevents Chromium's sticky+scroll-padding-top bug where typing in the header search bar scrolls the page up on each keystroke.
  useEffect(() => {
    const onScroll = () => {
      const topbarHeight = window.innerWidth <= 760 ? 28 : 31;
      setIsHeaderFixed(window.scrollY >= topbarHeight);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent background scrolling when sidebar is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  const handleSearchBtnClick = (e) => {
    if (window.innerWidth <= 760) {
      e.preventDefault();
      navigate("/products");
      setMenuOpen(false);
      return;
    }
    const q = searchQuery.trim();
    if (q) {
      navigate(`/products?q=${encodeURIComponent(q)}`);
      setSearchQuery("");
      setMenuOpen(false);
    } else if (!isProductsPage) {
      navigate("/products");
      setMenuOpen(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/products?q=${encodeURIComponent(q)}`);
      setSearchQuery("");
      setMenuOpen(false);
    } else {
      navigate("/products");
      setMenuOpen(false);
    }
  };

  const handleAnimalClick = (animalName) => {
    setActiveMenu("");
    setMenuOpen(false);
    setMobileSubOpen(false);
    navigate(`/products?animal=${encodeURIComponent(animalName)}`);
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          <div className="topbar-track">
            <span><Truck size={14}/> Free Shipping on Orders Above ₹999*</span>
            <span className="top-trust"><ShieldCheck size={14}/> Trusted by Farmers & Veterinarians</span>
            <span className="top-links">
              <Link to="/account">Track Order</Link>
              <i/>
              <Link to="/faq">Help & FAQs</Link>
              <i/>
              <Link to="/contact">Contact Us</Link>
            </span>
          </div>
          <div className="topbar-track topbar-track-clone" aria-hidden="true">
            <span><Truck size={14}/> Free Shipping on Orders Above ₹999*</span>
            <span className="top-trust"><ShieldCheck size={14}/> Trusted by Farmers & Veterinarians</span>
            <span className="top-links">
              <Link to="/account">Track Order</Link>
              <i/>
              <Link to="/faq">Help & FAQs</Link>
              <i/>
              <Link to="/contact">Contact Us</Link>
            </span>
          </div>
        </div>
      </div>

      <div className="header-slot">
        <header className={`header ${isHeaderFixed ? "header-fixed" : ""}`} id="top">
        <div className="nav-wrap">
          <button
            className="mobile-menu icon-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
          >
            <Menu size={22} />
          </button>
          <Logo/>

          {/* Desktop Navigation */}
          <nav className="nav desktop-nav">
            <Link to="/">Home</Link>
            <Link to="/products">Products</Link>

            <div
              className="nav-drop"
              onMouseEnter={() => setActiveMenu("animals")}
              onMouseLeave={() => setActiveMenu("")}
            >
              <div className="nav-drop-head">
                <Link to="/animals">
                  Shop by Animal
                </Link>
                <ChevronDown size={14} />
              </div>

              {/* Desktop Mega Dropdown */}
              {activeMenu === "animals" && (
                <div className="mega-menu animal-mega desktop-mega">
                  <div className="animal-mega-header">
                    <span>FILTER BY SPECIES</span>
                  </div>
                  <div className="animal-mega-list">
                    {animals.map((a) => (
                      <button
                        type="button"
                        key={a.name}
                        className="animal-mega-item"
                        onClick={() => handleAnimalClick(a.name)}
                      >
                        <span className="animal-mega-name">{a.name}</span>
                      </button>
                    ))}
                  </div>
                  <Link
                    to="/animals"
                    className="animal-mega-all"
                    onClick={() => setActiveMenu("")}
                  >
                    <span>View All Species</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              )}
            </div>

            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </nav>

          <div className="nav-actions">
            <form
              className={`searchbox ${isProductsPage ? "hide-on-products-mobile" : ""}`}
              onSubmit={handleSearchSubmit}
            >
              <input
                placeholder="Search products..."
                aria-label="Search products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                onClick={handleSearchBtnClick}
                aria-label="Search"
              >
                <Search size={17}/>
              </button>
            </form>

            <LanguageSelector />

            <Link className="icon-btn account-icon" to="/account" aria-label="My Account" title="My Account">
              <UserRound/>
            </Link>
            <Link className="icon-btn wishlist-icon" to="/wishlist" aria-label="Wishlist" title="My Wishlist">
              <Heart/>
              {shopWishlistCount > 0 && <em>{shopWishlistCount}</em>}
            </Link>
            <button className="icon-btn cart-icon" onClick={onOpenCart} aria-label="Cart Drawer" title="Cart">
              <ShoppingCart/>
              {shopCartCount > 0 && <em>{shopCartCount}</em>}
            </button>
          </div>
        </div>
        </header>
      </div>

      {/* ── HALF-WIDTH SLIDING SIDEBAR DRAWER & BACKDROP ── */}
      {menuOpen && (
        <div
          className="site-sidebar-backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        >
          <aside
            className="site-sidebar-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sidebar Header with Brand Logo & Close Button */}
            <div className="site-sidebar-header">
              <div
                className="site-sidebar-brand"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/");
                }}
              >
                <Logo />
              </div>
              <button
                type="button"
                className="site-sidebar-close-btn"
                onClick={() => setMenuOpen(false)}
                aria-label="Close navigation sidebar"
              >
                <X size={20} />
              </button>
            </div>

            {/* In-sidebar Search Box */}
            <div className="site-sidebar-search">
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  placeholder="Search animal tonics, bolus..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" aria-label="Search">
                  <Search size={16} />
                </button>
              </form>
            </div>

            {/* Sidebar Scrollable Body */}
            <div className="site-sidebar-body">
              <nav className="site-sidebar-nav">
                <Link to="/" className="site-sidebar-link" onClick={() => setMenuOpen(false)}>
                  <span>Home</span>
                  <ArrowRight size={14} className="sidebar-link-arrow" />
                </Link>

                <Link to="/products" className="site-sidebar-link" onClick={() => setMenuOpen(false)}>
                  <span>All Products</span>
                  <ArrowRight size={14} className="sidebar-link-arrow" />
                </Link>

                {/* Shop by Animal Accordion */}
                <div className="site-sidebar-accordion-wrap">
                  <div
                    className="site-sidebar-accordion-head"
                    onClick={() => setMobileSubOpen(!mobileSubOpen)}
                  >
                    <span>Shop by Animal</span>
                    <ChevronDown size={16} className={`accordion-chevron ${mobileSubOpen ? "open" : ""}`} />
                  </div>

                  {mobileSubOpen && (
                    <div className="site-sidebar-sublist">
                      {animals.map((a) => (
                        <button
                          key={a.name}
                          type="button"
                          className="site-sidebar-subitem"
                          onClick={() => handleAnimalClick(a.name)}
                        >
                          <span>{a.name}</span>
                        </button>
                      ))}
                      <Link
                        to="/animals"
                        className="site-sidebar-subitem all-species-link"
                        onClick={() => { setMenuOpen(false); setMobileSubOpen(false); }}
                      >
                        <b>View All Species →</b>
                      </Link>
                    </div>
                  )}
                </div>

                <Link to="/about" className="site-sidebar-link" onClick={() => setMenuOpen(false)}>
                  <span>About Life Science</span>
                  <ArrowRight size={14} className="sidebar-link-arrow" />
                </Link>

                <Link to="/contact" className="site-sidebar-link" onClick={() => setMenuOpen(false)}>
                  <span>Contact Us</span>
                  <ArrowRight size={14} className="sidebar-link-arrow" />
                </Link>

                <Link to="/faq" className="site-sidebar-link" onClick={() => setMenuOpen(false)}>
                  <span>Help & FAQs</span>
                  <ArrowRight size={14} className="sidebar-link-arrow" />
                </Link>
              </nav>

              {/* Mobile Drawer Language Switcher */}
              <div className="site-sidebar-lang-section">
                <LanguageSelector isMobileDrawer={true} onSelectCallback={() => setMenuOpen(false)} />
              </div>

              {/* Quick Customer Actions */}
              <div className="site-sidebar-actions-section">
                <span className="sidebar-section-title">QUICK ACCESS</span>
                <div className="site-sidebar-action-cards">
                  <Link
                    to="/account"
                    className="sidebar-action-card"
                    onClick={() => setMenuOpen(false)}
                  >
                    <div className="action-card-left">
                      <UserRound size={17} />
                      <div>
                        <b>My Account</b>
                        <small>Track orders & dispatches</small>
                      </div>
                    </div>
                    <ArrowRight size={14} />
                  </Link>

                  <Link
                    to="/wishlist"
                    className="sidebar-action-card"
                    onClick={() => setMenuOpen(false)}
                  >
                    <div className="action-card-left">
                      <Heart size={17} />
                      <div>
                        <b>Wishlist</b>
                        <small>{shopWishlistCount} saved item{shopWishlistCount === 1 ? "" : "s"}</small>
                      </div>
                    </div>
                    <ArrowRight size={14} />
                  </Link>

                  <button
                    type="button"
                    className="sidebar-action-card"
                    onClick={() => { setMenuOpen(false); if (onOpenCart) onOpenCart(); }}
                  >
                    <div className="action-card-left">
                      <ShoppingCart size={17} />
                      <div>
                        <b>Shopping Cart</b>
                        <small>{shopCartCount} item{shopCartCount === 1 ? "" : "s"} in cart</small>
                      </div>
                    </div>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
