import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { ShopProvider, useShop } from "./context/ShopContext";
import { AdminAuthProvider } from "./admin/AdminAuthContext";

// Core & static storefront pages stay eager for zero-flash instant render on hard refresh
import Home from "./pages/Home";
import ShopByAnimal from "./pages/ShopByAnimal";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import DistributorPage from "./pages/DistributorPage";
import KnowledgeCentre from "./pages/KnowledgeCentre";
import ArticlePage from "./pages/ArticlePage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import ShippingReturnsPage from "./pages/ShippingReturnsPage";

// Lazy-loaded Overlays (not needed during initial paint)
const CartDrawer = lazy(() => import("./components/CartDrawer"));
const NotificationPrompt = lazy(() => import("./components/NotificationPrompt"));

// Lazy-loaded Dynamic Commerce Pages (code-split per route)
const AllProducts = lazy(() => import("./pages/AllProducts"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));

// Lazy-loaded Admin Panel Pages (never downloaded by storefront visitors)
const AdminLogin = lazy(() => import("./admin/AdminLogin"));
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard"));
const AdminSliders = lazy(() => import("./admin/AdminSliders"));
const AdminProducts = lazy(() => import("./admin/AdminProducts"));
const AdminFeaturedPosters = lazy(() => import("./admin/AdminFeaturedPosters"));
const AdminOffers = lazy(() => import("./admin/AdminOffers"));
const AdminOrders = lazy(() => import("./admin/AdminOrders"));
const AdminReviews = lazy(() => import("./admin/AdminReviews"));
const AdminNotifications = lazy(() => import("./admin/AdminNotifications"));
const AdminContacts = lazy(() => import("./admin/AdminContacts"));
const AdminRouteGuard = lazy(() => import("./admin/AdminRouteGuard"));

// Clean layout-preserving fallback (no jarring "Loading..." text flash)
function PageLoader() {
  return <div style={{ minHeight: "65vh" }} aria-busy="true" />;
}

// Unified search redirect: routes any /search?q=... directly to /products?q=...
function SearchRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/products${search || ""}`} replace />;
}

function MainAppLayout({ showToast, toast }) {
  const { cart, addToCart, updateQty, removeFromCart, clearCart } = useShop();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotifPromptOpen, setIsNotifPromptOpen] = useState(false);
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");

  // Defer Firebase push listener until after initial load + idle, and only if notifications are granted
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      Notification.permission !== "granted"
    ) {
      return;
    }

    let cancelled = false;
    let unsubscribe = null;
    let idleId = null;
    let timerId = null;

    const attachListener = async () => {
      if (cancelled) return;
      try {
        const { listenToForegroundMessages } = await import("./firebase/notificationService");
        if (cancelled) return;
        const unsub = await listenToForegroundMessages((payload) => {
          const title = payload.notification?.title || payload.data?.title || "Life Science Alert";
          const body = payload.notification?.body || payload.data?.body || "";
          showToast(`🔔 ${title}: ${body}`);
        });
        if (cancelled && typeof unsub === "function") {
          unsub();
        } else {
          unsubscribe = unsub;
        }
      } catch {
        // Silently ignore if FCM is unsupported
      }
    };

    const scheduleAttach = () => {
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(attachListener, { timeout: 4000 });
      } else {
        timerId = window.setTimeout(attachListener, 2500);
      }
    };

    if (document.readyState === "complete") {
      scheduleAttach();
    } else {
      window.addEventListener("load", scheduleAttach, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", scheduleAttach);
      if (idleId && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timerId) window.clearTimeout(timerId);
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [showToast]);

  useEffect(() => {
    // Realistic e-commerce behavior: Auto prompt for notifications after 2.2s on first visit
    if (isAdminRoute || typeof window === "undefined" || !("Notification" in window)) return;

    if (
      Notification.permission === "granted" ||
      sessionStorage.getItem("life_science_notif_dismissed")
    ) {
      return;
    }

    const timer = setTimeout(() => {
      setIsNotifPromptOpen(true);
    }, 2200);

    return () => clearTimeout(timer);
  }, [isAdminRoute]);

  return (
    <>
      <ScrollToTop />
      {!isAdminRoute && (
        <Header onOpenCart={() => setIsCartOpen(true)} />
      )}

      <main>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Admin Panel Routes ── */}
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route path="/admin" element={<AdminRouteGuard />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="sliders" element={<AdminSliders />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="featured-posters" element={<AdminFeaturedPosters />} />
                <Route path="offers" element={<AdminOffers />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="messages" element={<AdminContacts />} />
                <Route path="notifications" element={<AdminNotifications />} />
                {/* Fallback under /admin */}
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Route>
            </Route>

            {/* ── Customer Storefront Routes ── */}
            {/* 1. Homepage */}
            <Route path="/" element={<Home add={addToCart} onToast={showToast} />} />

            {/* 2. Shop by Animal */}
            <Route path="/animals" element={<ShopByAnimal add={addToCart} onToast={showToast} />} />
            <Route path="/shop-by-animal" element={<ShopByAnimal add={addToCart} onToast={showToast} />} />

            {/* 3. All Products */}
            <Route path="/products" element={<AllProducts add={addToCart} onToast={showToast} />} />

            {/* 4. Product Category */}
            <Route path="/category/:slug" element={<CategoryPage add={addToCart} onToast={showToast} />} />

            {/* 5. Search Results (unified into Products catalog with ?q= query) */}
            <Route path="/search" element={<SearchRedirect />} />

            {/* 6. Product Details */}
            <Route path="/product/:id" element={<ProductDetails add={addToCart} onToast={showToast} />} />

            {/* Wishlist */}
            <Route path="/wishlist" element={<WishlistPage add={addToCart} />} />

            {/* Shopping Cart */}
            <Route
              path="/cart"
              element={
                <CartPage
                  cart={cart}
                  updateQty={updateQty}
                  removeItem={removeFromCart}
                  onToast={showToast}
                />
              }
            />

            {/* Checkout */}
            <Route
              path="/checkout"
              element={
                <CheckoutPage
                  cart={cart}
                  clearCart={clearCart}
                  onToast={showToast}
                />
              }
            />

            {/* Account */}
            <Route path="/account/*" element={<AccountPage onToast={showToast} />} />

            {/* Knowledge Centre */}
            <Route path="/knowledge" element={<KnowledgeCentre />} />
            <Route path="/knowledge/:slug" element={<ArticlePage add={addToCart} />} />
            <Route path="/article/:slug" element={<ArticlePage add={addToCart} />} />

            {/* About */}
            <Route path="/about" element={<AboutPage />} />

            {/* Contact */}
            <Route path="/contact" element={<ContactPage onToast={showToast} />} />

            {/* Distributor */}
            <Route path="/distributor" element={<DistributorPage onToast={showToast} />} />
            <Route path="/partner-with-us" element={<DistributorPage onToast={showToast} />} />

            {/* FAQ */}
            <Route path="/faq" element={<FAQPage />} />

            {/* Legal & Policy Pages */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/shipping-and-returns" element={<ShippingReturnsPage />} />
            <Route path="/shipping-returns" element={<ShippingReturnsPage />} />
            <Route path="/shipping" element={<ShippingReturnsPage />} />
            <Route path="/returns" element={<ShippingReturnsPage />} />

            {/* Fallback route */}
            <Route path="*" element={<Home add={addToCart} onToast={showToast} />} />
          </Routes>
        </Suspense>
      </main>

      {!isAdminRoute && <Footer />}

      {!isAdminRoute && isCartOpen && (
        <Suspense fallback={null}>
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cart={cart}
            updateQty={updateQty}
            removeItem={removeFromCart}
          />
        </Suspense>
      )}

      {toast && (
        <div className="toast">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}

      {/* Real Product Push Notification Permission Modal */}
      {!isAdminRoute && isNotifPromptOpen && (
        <Suspense fallback={null}>
          <NotificationPrompt
            isOpen={isNotifPromptOpen}
            onClose={() => setIsNotifPromptOpen(false)}
          />
        </Suspense>
      )}
    </>
  );
}

export default function App() {
  const [toast, setToast] = useState("");

  const showToast = useCallback((msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2800);
  }, []);

  return (
    <Router>
      <AdminAuthProvider>
        <ShopProvider showToast={showToast}>
          <MainAppLayout showToast={showToast} toast={toast} />
        </ShopProvider>
      </AdminAuthProvider>
    </Router>
  );
}
