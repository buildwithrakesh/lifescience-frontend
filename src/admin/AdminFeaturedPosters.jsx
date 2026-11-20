import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Upload,
  Eye,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Search,
  Package,
  CheckCircle2,
  Image as ImageIcon,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE_URL, apiFetch, resolveImageUrl } from "../utils/api";
import { products as localProducts } from "../data/products";

export default function AdminFeaturedPosters() {
  const [posters, setPosters] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPoster, setEditingPoster] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    productId: "",
    productSlug: "",
    productName: "",
    productImage: "",
    productPrice: 0,
    productType: "",
    badgeText: "FEATURED",
    isActive: true,
    sortOrder: 0,
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3200);
  };

  // ── Load All Products for Search & Selection ──
  const loadProducts = async () => {
    try {
      const res = await apiFetch("/api/products?limit=250");
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setAllProducts(res.data);
      } else {
        setAllProducts(localProducts);
      }
    } catch {
      setAllProducts(localProducts);
    }
  };

  // ── Load Featured Posters from Backend ──
  const loadPosters = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await apiFetch("/api/admin/featured-posters");
      if (res.success && Array.isArray(res.data)) {
        setPosters(res.data);
        localStorage.setItem("lifescience_featured_posters", JSON.stringify(res.data));
      }
    } catch (err) {
      // Fallback to public endpoint or cached
      try {
        const pub = await apiFetch("/api/featured-posters");
        if (pub.success && Array.isArray(pub.data)) {
          setPosters(pub.data);
        } else {
          const cached = localStorage.getItem("lifescience_featured_posters");
          if (cached) setPosters(JSON.parse(cached));
        }
      } catch {
        const cached = localStorage.getItem("lifescience_featured_posters");
        if (cached) setPosters(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosters();
    loadProducts();
  }, []);

  // ── File Upload Handler ──
  const handleFileUpload = async (file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      alert("Please upload a valid image file (JPG, PNG, or WebP).");
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("image", file);
      const token = typeof localStorage !== "undefined" ? localStorage.getItem("vetora_admin_token") : null;

      const res = await fetch(`${API_BASE_URL}/api/upload?type=poster`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body,
      });

      const data = await res.json();
      if (data.success && data.data?.url) {
        setFormData((prev) => ({ ...prev, imageUrl: data.data.url }));
        showToast("Poster image uploaded successfully!");
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (err) {
      alert("Failed to upload image: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // ── Open Add Modal ──
  const openAddModal = () => {
    setEditingPoster(null);
    setProductSearch("");
    setFormData({
      title: "",
      subtitle: "",
      imageUrl: "",
      productId: "",
      productSlug: "",
      productName: "",
      productImage: "",
      productPrice: 0,
      productType: "",
      badgeText: "FEATURED",
      isActive: true,
      sortOrder: posters.length,
    });
    setModalOpen(true);
  };

  // ── Open Edit Modal ──
  const openEditModal = (poster) => {
    setEditingPoster(poster);
    setProductSearch("");
    setFormData({
      title: poster.title || "",
      subtitle: poster.subtitle || "",
      imageUrl: poster.imageUrl || "",
      productId: poster.productId || "",
      productSlug: poster.productSlug || poster.productId || "",
      productName: poster.productName || "",
      productImage: poster.productImage || "",
      productPrice: poster.productPrice || 0,
      productType: poster.productType || "",
      badgeText: poster.badgeText || "FEATURED",
      isActive: poster.isActive !== undefined ? poster.isActive : true,
      sortOrder: poster.sortOrder || 0,
    });
    setModalOpen(true);
  };

  // ── Select Target Product ──
  const handleSelectProduct = (product) => {
    setFormData((prev) => ({
      ...prev,
      productId: String(product._id || product.id),
      productSlug: product.id || String(product._id),
      productName: product.name,
      productImage: product.images?.main || product.imageUrl || product.img || "",
      productPrice: product.price || 0,
      productType: product.type || "",
      title: prev.title || product.name,
    }));
    setProductSearch("");
  };

  // ── Clear Selected Product ──
  const handleClearSelectedProduct = () => {
    setFormData((prev) => ({
      ...prev,
      productId: "",
      productSlug: "",
      productName: "",
      productImage: "",
      productPrice: 0,
      productType: "",
    }));
  };

  // ── Save Poster (Create / Update) ──
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      alert("Please upload or enter a poster image URL.");
      return;
    }
    if (!formData.productId) {
      alert("Please search and select a target product for this poster.");
      return;
    }

    try {
      if (editingPoster) {
        // Update
        const res = await apiFetch(`/api/admin/featured-posters/${editingPoster._id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        if (res.success) {
          showToast("Featured poster updated successfully!");
        }
      } else {
        // Create
        const res = await apiFetch("/api/admin/featured-posters", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        if (res.success) {
          showToast("Featured poster added successfully!");
        }
      }

      setModalOpen(false);
      loadPosters();
    } catch (err) {
      alert("Save failed: " + err.message);
    }
  };

  // ── Toggle Active Status ──
  const toggleActive = async (poster) => {
    try {
      const updatedStatus = !poster.isActive;
      const res = await apiFetch(`/api/admin/featured-posters/${poster._id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: updatedStatus }),
      });
      if (res.success) {
        setPosters((prev) =>
          prev.map((p) => (p._id === poster._id ? { ...p, isActive: updatedStatus } : p))
        );
        showToast(`Poster is now ${updatedStatus ? "Active" : "Hidden"}`);
      }
    } catch (err) {
      alert("Failed to toggle status: " + err.message);
    }
  };

  // ── Delete Poster ──
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to remove "${title || "this poster"}"?`)) return;
    try {
      const res = await apiFetch(`/api/admin/featured-posters/${id}`, {
        method: "DELETE",
      });
      if (res.success) {
        setPosters((prev) => prev.filter((p) => p._id !== id));
        showToast("Poster removed successfully!");
      }
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  // ── Move Poster Order (Up / Down) ──
  const moveOrder = async (index, direction) => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= posters.length) return;

    const newPosters = [...posters];
    const [moved] = newPosters.splice(index, 1);
    newPosters.splice(targetIdx, 0, moved);

    // Re-index
    const reordered = newPosters.map((p, idx) => ({
      ...p,
      sortOrder: idx,
    }));
    setPosters(reordered);

    try {
      await apiFetch("/api/admin/featured-posters/reorder", {
        method: "PUT",
        body: JSON.stringify({
          order: reordered.map((p) => ({ id: p._id, sortOrder: p.sortOrder })),
        }),
      });
      showToast("Order updated successfully!");
    } catch (err) {
      console.error("Reorder failed:", err);
    }
  };

  // Filtered Products for Live Search
  const filteredProducts = allProducts.filter((p) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase().trim();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.type?.toLowerCase().includes(q) ||
      (Array.isArray(p.suitableFor) && p.suitableFor.some((a) => a.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="admin-page">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="admin-toast">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-main-title">Featured Posters</h2>
        </div>
        <div className="admin-header-actions">
          <button
            type="button"
            className="admin-btn admin-btn-outline admin-btn-sm"
            onClick={() => {
              loadPosters();
              loadProducts();
            }}
            title="Refresh posters"
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </button>
          <button type="button" onClick={openAddModal} className="admin-btn admin-btn-primary">
            <Plus size={16} />
            <span>Add Featured Poster</span>
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3>Active Showcase Posters ({posters.length})</h3>
            <span style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>
              {posters.filter((p) => p.isActive).length} active on storefront
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--admin-text-muted)" }}>
            <RefreshCw size={24} className="spin" style={{ margin: "0 auto 12px" }} />
            <p>Loading featured posters...</p>
          </div>
        ) : posters.length === 0 ? (
          <div style={{ padding: "56px 24px", textAlign: "center" }}>
            <Sparkles size={42} style={{ color: "var(--admin-primary)", margin: "0 auto 16px", opacity: 0.7 }} />
            <h4 style={{ fontSize: 16, fontWeight: 800, color: "var(--admin-text-main)", marginBottom: 8 }}>
              No Featured Posters Yet
            </h4>
            <p style={{ fontSize: 13, color: "var(--admin-text-muted)", maxWidth: 440, margin: "0 auto 20px" }}>
              Upload your marketing posters or brochures, select target products, and showcase them in a smooth horizontal scroll section on the Home page.
            </p>
            <button type="button" onClick={openAddModal} className="admin-btn admin-btn-primary">
              <Plus size={16} />
              <span>Add Your First Poster</span>
            </button>
          </div>
        ) : (
          <div className="admin-sliders-list">
            {posters.map((poster, index) => {
              const targetUrl = `/product/${poster.productSlug || poster.productId}`;
              return (
                <div className="admin-slider-item" key={poster._id || index}>
                  {/* Order Controls */}
                  <div className="admin-slider-order">
                    <div className="admin-order-badge">#{index + 1}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <button
                        type="button"
                        onClick={() => moveOrder(index, "up")}
                        disabled={index === 0}
                        className="admin-icon-btn"
                        title="Move Up"
                        style={{ opacity: index === 0 ? 0.3 : 1 }}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveOrder(index, "down")}
                        disabled={index === posters.length - 1}
                        className="admin-icon-btn"
                        title="Move Down"
                        style={{ opacity: index === posters.length - 1 ? 0.3 : 1 }}
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Poster Image Thumbnail */}
                  <div
                    className="admin-slider-thumb-wrap"
                    style={{ width: 130, height: 90, borderRadius: 10, overflow: "hidden", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <img
                      src={resolveImageUrl(poster.imageUrl, "", 300)}
                      alt={poster.title || "Poster"}
                      style={{ maxWidth: "100%", maxHeight: "100%", width: "auto", height: "auto", objectFit: "contain" }}
                    />
                  </div>

                  {/* Info & Target Product Link */}
                  <div className="admin-slider-info" style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span className="admin-slider-badge-tag">{poster.badgeText || "FEATURED"}</span>
                      <span style={{ fontSize: 11, color: "var(--admin-text-muted)" }}>Order: {poster.sortOrder}</span>
                    </div>

                    <h3 className="admin-slider-title" style={{ fontSize: 15, margin: "0 0 4px" }}>
                      {poster.title || poster.productName || "Featured Formulation Poster"}
                    </h3>

                    {poster.subtitle && (
                      <p className="admin-slider-sub" style={{ fontSize: 12, margin: "0 0 8px" }}>
                        {poster.subtitle}
                      </p>
                    )}

                    {/* Target Product Pill */}
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "6px 12px",
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        borderRadius: 8,
                        marginTop: 4,
                        maxWidth: "100%",
                      }}
                    >
                      {poster.productImage && (
                        <img
                          src={resolveImageUrl(poster.productImage, "", 80)}
                          alt={poster.productName}
                          style={{ width: 28, height: 28, objectFit: "contain", borderRadius: 4 }}
                        />
                      )}
                      <div style={{ fontSize: 12, minWidth: 0 }}>
                        <span style={{ color: "#166534", fontWeight: 700 }}>Target Product: </span>
                        <strong style={{ color: "#14532d" }}>{poster.productName || poster.productId}</strong>
                        {poster.productPrice ? (
                          <span style={{ color: "#15803d", marginLeft: 6, fontWeight: 700 }}>
                            (₹{poster.productPrice})
                          </span>
                        ) : null}
                      </div>

                      <Link
                        to={targetUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#15803d",
                          marginLeft: 4,
                          textDecoration: "underline",
                        }}
                        title="Preview target product page"
                      >
                        <ExternalLink size={12} /> Test Link
                      </Link>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="admin-slider-actions">
                    <button
                      type="button"
                      onClick={() => toggleActive(poster)}
                      className={`admin-status-badge ${poster.isActive ? "active" : "inactive"}`}
                      style={{ cursor: "pointer", border: "none" }}
                      title="Click to toggle visibility"
                    >
                      {poster.isActive ? "Active on Home" : "Hidden"}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(poster)}
                      className="admin-icon-btn edit-btn"
                      title="Edit Poster"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(poster._id, poster.title)}
                      className="admin-icon-btn delete-btn"
                      title="Delete Poster"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div
            className="admin-modal-card"
            style={{ maxWidth: 680 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h3>{editingPoster ? "Edit Featured Poster" : "Add New Featured Poster"}</h3>
              </div>
              <button
                type="button"
                className="admin-modal-close-icon"
                onClick={() => setModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="admin-modal-body" style={{ maxHeight: "72vh", overflowY: "auto" }}>
                {/* 1. Poster Image Upload */}
                <div className="admin-form-group">
                  <label>
                    Poster Image <span style={{ color: "#dc2626" }}>*</span>
                  </label>

                  {formData.imageUrl ? (
                    <div
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        padding: 12,
                        background: "#f8fafc",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: 12,
                      }}
                    >
                      <img
                        src={resolveImageUrl(formData.imageUrl, "", 300)}
                        alt="Poster Preview"
                        style={{
                          width: 80,
                          height: 100,
                          objectFit: "cover",
                          borderRadius: 8,
                          border: "1px solid #cbd5e1",
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#166534", marginBottom: 4 }}>
                          ✓ Image Ready
                        </div>
                        <input
                          type="text"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          className="admin-input admin-input-sm"
                          placeholder="Image URL"
                          style={{ width: "100%", fontSize: 11 }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: "" })}
                        className="admin-btn admin-btn-outline admin-btn-sm"
                        style={{ color: "#dc2626" }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          padding: "24px 16px",
                          border: "2px dashed #bbf7d0",
                          borderRadius: 12,
                          background: "#f0fdf4",
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            background: "#dcfce7",
                            color: "#166534",
                            display: "grid",
                            placeItems: "center",
                            margin: "0 auto 10px",
                          }}
                        >
                          {uploading ? <RefreshCw size={20} className="spin" /> : <Upload size={20} />}
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 13, color: "#166534", marginBottom: 4 }}>
                          {uploading ? "Uploading to Cloud CDN..." : "Click to Upload Poster File"}
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>
                          Supports JPG, PNG, WebP up to 12MB
                        </div>
                      </div>

                      <div style={{ marginTop: 8 }}>
                        <input
                          type="text"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          className="admin-input admin-input-sm"
                          placeholder="Or paste image URL"
                        />
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFileUpload(e.target.files?.[0])}
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: "none" }}
                  />
                </div>

                {/* 2. Target Product Search & Selection */}
                <div className="admin-form-group">
                  <label>
                    Target Product <span style={{ color: "#dc2626" }}>*</span>
                  </label>

                  {formData.productId ? (
                    /* Selected Product Display Card */
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        background: "#ecfdf5",
                        border: "2px solid #10b981",
                        borderRadius: 12,
                        gap: 12,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 8,
                            background: "#fff",
                            border: "1px solid #d1fae5",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {formData.productImage ? (
                            <img
                              src={resolveImageUrl(formData.productImage, "", 100)}
                              alt={formData.productName}
                              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                            />
                          ) : (
                            <Package size={22} color="#059669" />
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 10, fontWeight: 800, color: "#047857", textTransform: "uppercase" }}>
                            Selected Target
                          </div>
                          <div
                            style={{
                              fontWeight: 800,
                              fontSize: 14,
                              color: "#064e3b",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {formData.productName}
                          </div>
                          <div style={{ fontSize: 12, color: "#059669", fontWeight: 700 }}>
                            ₹{formData.productPrice} {formData.productType ? `• ${formData.productType}` : ""}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleClearSelectedProduct}
                        className="admin-btn admin-btn-outline admin-btn-sm"
                        style={{ color: "#dc2626", borderColor: "#fecaca" }}
                      >
                        Change Product
                      </button>
                    </div>
                  ) : (
                    /* Search & Product Selection Box */
                    <div
                      style={{
                        border: "1.5px solid #cbd5e1",
                        borderRadius: 12,
                        padding: 12,
                        background: "#f8fafc",
                      }}
                    >
                      <div style={{ position: "relative", marginBottom: 10 }}>
                        <Search
                          size={16}
                          style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#64748b" }}
                        />
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="admin-input"
                          placeholder="Search products..."
                          style={{ paddingLeft: 36 }}
                        />
                      </div>

                      <div
                        style={{
                          maxHeight: 220,
                          overflowY: "auto",
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                          paddingRight: 4,
                        }}
                      >
                        {filteredProducts.length === 0 ? (
                          <div style={{ padding: "16px", textAlign: "center", color: "#64748b", fontSize: 12 }}>
                            No products found matching "{productSearch}"
                          </div>
                        ) : (
                          filteredProducts.slice(0, 15).map((p) => {
                            const pImg = p.images?.main || p.imageUrl || p.img;
                            return (
                              <div
                                key={p._id || p.id}
                                onClick={() => handleSelectProduct(p)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "8px 12px",
                                  background: "#ffffff",
                                  border: "1px solid #e2e8f0",
                                  borderRadius: 8,
                                  cursor: "pointer",
                                  transition: "all 0.15s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = "#10b981";
                                  e.currentTarget.style.background = "#f0fdf4";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = "#e2e8f0";
                                  e.currentTarget.style.background = "#ffffff";
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                                  <div
                                    style={{
                                      width: 36,
                                      height: 36,
                                      borderRadius: 6,
                                      background: "#f1f5f9",
                                      overflow: "hidden",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      flexShrink: 0,
                                    }}
                                  >
                                    {pImg ? (
                                      <img
                                        src={resolveImageUrl(pImg, "", 80)}
                                        alt={p.name}
                                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                                      />
                                    ) : (
                                      <Package size={16} color="#94a3b8" />
                                    )}
                                  </div>
                                  <div style={{ minWidth: 0 }}>
                                    <div
                                      style={{
                                        fontSize: 13,
                                        fontWeight: 700,
                                        color: "#1e293b",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {p.name}
                                    </div>
                                    <div style={{ fontSize: 11, color: "#64748b" }}>
                                      {p.type || p.category} • ₹{p.price}
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  className="admin-btn admin-btn-sm admin-btn-primary"
                                  style={{ padding: "4px 10px", fontSize: 11, flexShrink: 0 }}
                                >
                                  Select
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Title & Subtitle (Optional / Custom) */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="admin-form-group">
                    <label>Poster Title (Optional)</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="admin-input"
                      placeholder={formData.productName || "Poster title"}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Badge Tag</label>
                    <input
                      type="text"
                      value={formData.badgeText}
                      onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                      className="admin-input"
                      placeholder="e.g. FEATURED"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Subtitle / Caption (Optional)</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="admin-input"
                    placeholder="Subtitle / caption"
                  />
                </div>

                {/* 4. Display Order & Active Toggle */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "center" }}>
                  <div className="admin-form-group">
                    <label>Display Sort Order</label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) || 0 })}
                      className="admin-input"
                      min={0}
                    />
                  </div>

                  <div className="admin-form-group" style={{ marginTop: 20 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        style={{ width: 18, height: 18, accentColor: "var(--admin-primary)", cursor: "pointer" }}
                      />
                      <span style={{ fontWeight: 700, fontSize: 13 }}>Visible on Home page</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="admin-btn admin-btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  <Check size={16} />
                  <span>{editingPoster ? "Save Changes" : "Create Featured Poster"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
