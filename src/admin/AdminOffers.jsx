import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Upload,
  Search,
  Check,
  X,
  Tag,
  Percent,
  Package,
  Globe,
  RefreshCw,
} from "lucide-react";
import { apiFetch, resolveImageUrl, API_BASE_URL } from "../utils/api";
import { products as fallbackProducts } from "../data/products";

const PRESET_DISCOUNTS = [5, 10, 15, 20, 25, 30];

export default function AdminOffers() {
  const [offers, setOffers] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const [toast, setToast] = useState("");
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    discountPercent: 10,
    scope: "all", // "all" | "specific"
    selectedProducts: [], // [{ id, slug, name, image, price }]
    isActive: true,
    sortOrder: 0,
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  };

  const syncPublicCache = (list) => {
    try {
      const activeList = (list || []).filter((o) => o.isActive);
      localStorage.setItem("lifescience_active_offers", JSON.stringify(activeList));
    } catch {}
  };

  // Load all offers
  const loadOffers = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/admin/offers");
      if (res.success && Array.isArray(res.data)) {
        setOffers(res.data);
        syncPublicCache(res.data);
      } else {
        const pub = await apiFetch("/api/offers");
        if (pub.success && Array.isArray(pub.data)) {
          setOffers(pub.data);
          syncPublicCache(pub.data);
        }
      }
    } catch {
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  // Load all products for specific-product selector
  const loadProducts = async () => {
    try {
      const res = await apiFetch("/api/products?limit=250");
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const normalized = res.data.map((p) => ({
          id: String(p._id || p.id),
          slug: p.id || String(p._id),
          name: p.name || "",
          type: p.type || p.category || "",
          price: Number(p.price) || 0,
          image: p.images?.main || p.imageUrl || p.img || "",
        }));
        setAllProducts(normalized);
        return;
      }
    } catch {}
    setAllProducts(
      fallbackProducts.map((p) => ({
        id: String(p.id),
        slug: String(p.id),
        name: p.name,
        type: p.type || p.category || "",
        price: Number(p.price) || 0,
        image: p.img || "",
      }))
    );
  };

  useEffect(() => {
    loadOffers();
    loadProducts();
  }, []);

  // Filter products in selector
  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return allProducts;
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [allProducts, productSearch]);

  // Image upload to Cloudinary
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
      const token =
        typeof localStorage !== "undefined" ? localStorage.getItem("vetora_admin_token") : null;

      const res = await fetch(`${API_BASE_URL}/api/upload?type=offer`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body,
      });

      const data = await res.json();
      if (data.success && data.data?.url) {
        setFormData((prev) => ({ ...prev, imageUrl: data.data.url }));
        showToast("Offer banner image uploaded!");
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (err) {
      alert("Failed to upload image: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const openAddModal = () => {
    setEditingOffer(null);
    setProductSearch("");
    setFormData({
      title: "",
      subtitle: "",
      imageUrl: "",
      discountPercent: 10,
      scope: "all",
      selectedProducts: [],
      isActive: true,
      sortOrder: offers.length,
    });
    setModalOpen(true);
  };

  const openEditModal = (offer) => {
    setEditingOffer(offer);
    setProductSearch("");
    setFormData({
      title: offer.title || "",
      subtitle: offer.subtitle || "",
      imageUrl: offer.imageUrl || "",
      discountPercent: Number(offer.discountPercent) || 10,
      scope: offer.scope === "specific" ? "specific" : "all",
      selectedProducts: Array.isArray(offer.targetProducts) ? offer.targetProducts : [],
      isActive: offer.isActive !== undefined ? Boolean(offer.isActive) : true,
      sortOrder: Number(offer.sortOrder) || 0,
    });
    setModalOpen(true);
  };

  const toggleProductSelection = (prod) => {
    setFormData((prev) => {
      const exists = prev.selectedProducts.some(
        (sp) => sp.slug === prod.slug || sp.id === prod.id
      );
      if (exists) {
        return {
          ...prev,
          selectedProducts: prev.selectedProducts.filter(
            (sp) => sp.slug !== prod.slug && sp.id !== prod.id
          ),
        };
      }
      return {
        ...prev,
        selectedProducts: [
          ...prev.selectedProducts,
          {
            id: prod.id,
            slug: prod.slug,
            name: prod.name,
            image: prod.image,
            price: prod.price,
          },
        ],
      };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Please enter an Offer Title.");
      return;
    }
    if (!formData.imageUrl.trim()) {
      alert("Please upload an Offer Banner Image or enter an Image URL.");
      return;
    }
    const pct = Number(formData.discountPercent);
    if (Number.isNaN(pct) || pct < 1 || pct > 95) {
      alert("Discount percentage must be between 1% and 95%.");
      return;
    }
    if (formData.scope === "specific" && formData.selectedProducts.length === 0) {
      alert("Please select at least 1 product for a Specific Product offer.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        imageUrl: formData.imageUrl.trim(),
        discountPercent: pct,
        scope: formData.scope,
        productIds:
          formData.scope === "specific"
            ? formData.selectedProducts.map((p) => p.slug || p.id)
            : [],
        targetProducts: formData.scope === "specific" ? formData.selectedProducts : [],
        isActive: formData.isActive,
        sortOrder: Number(formData.sortOrder) || 0,
      };

      if (editingOffer?._id) {
        const res = await apiFetch(`/api/admin/offers/${editingOffer._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        if (!res.success) throw new Error(res.message || "Update failed");
        showToast("Offer updated successfully!");
      } else {
        const res = await apiFetch("/api/admin/offers", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        if (!res.success) throw new Error(res.message || "Create failed");
        showToast("Offer created & live on website!");
      }

      setModalOpen(false);
      await loadOffers();
    } catch (err) {
      alert("Error saving offer: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (offer) => {
    try {
      const res = await apiFetch(`/api/admin/offers/${offer._id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !offer.isActive }),
      });
      if (res.success) {
        showToast(offer.isActive ? "Offer hidden from storefront" : "Offer is now LIVE!");
        await loadOffers();
      }
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleDelete = async (offer) => {
    if (!window.confirm(`Delete offer "${offer.title}"? This cannot be undone.`)) return;
    try {
      const res = await apiFetch(`/api/admin/offers/${offer._id}`, {
        method: "DELETE",
      });
      if (res.success) {
        showToast("Offer deleted");
        await loadOffers();
      }
    } catch (err) {
      alert("Failed to delete offer: " + err.message);
    }
  };

  const moveOrder = async (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= offers.length) return;
    const reordered = [...offers];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);
    const updated = reordered.map((item, i) => ({ ...item, sortOrder: i }));
    setOffers(updated);
    syncPublicCache(updated);

    try {
      await apiFetch("/api/admin/offers/reorder", {
        method: "PUT",
        body: JSON.stringify({
          items: updated.map((o, i) => ({ id: o._id, sortOrder: i })),
        }),
      });
      showToast("Display order updated");
    } catch {
      loadOffers();
    }
  };

  const activeCount = offers.filter((o) => o.isActive).length;
  const allScopeCount = offers.filter((o) => o.scope !== "specific").length;
  const specificScopeCount = offers.filter((o) => o.scope === "specific").length;

  return (
    <div className="admin-page-content">
      {/* Header */}
      <div className="admin-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: 22 }}>
        <div>
          <h1 className="admin-page-main-title">
            Offers & Discounts
          </h1>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="admin-btn-secondary" onClick={loadOffers}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button type="button" className="admin-btn-primary" onClick={openAddModal}>
            <Plus size={16} /> Add New Offer
          </button>
        </div>
      </div>

      {/* Stats Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 22 }}>
        <div className="admin-card" style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: 12, color: "var(--admin-text-muted)", fontWeight: 600 }}>Total Offers</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>{offers.length}</div>
        </div>
        <div className="admin-card" style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: 12, color: "var(--admin-text-muted)", fontWeight: 600 }}>Active Live</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#15803d", marginTop: 4 }}>{activeCount}</div>
        </div>
        <div className="admin-card" style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: 12, color: "var(--admin-text-muted)", fontWeight: 600 }}>All-Products Offers</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#0369a1", marginTop: 4 }}>{allScopeCount}</div>
        </div>
        <div className="admin-card" style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: 12, color: "var(--admin-text-muted)", fontWeight: 600 }}>Specific-Product Offers</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#7c3aed", marginTop: 4 }}>{specificScopeCount}</div>
        </div>
      </div>

      {/* Offers List */}
      <div className="admin-card" style={{ padding: 20 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px 16px", color: "var(--admin-text-muted)" }}>
            Loading offers...
          </div>
        ) : offers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "52px 20px" }}>
            <div style={{ width: 58, height: 58, borderRadius: "50%", background: "#ecfdf5", color: "#059669", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <Percent size={26} />
            </div>
            <h3 style={{ margin: "0 0 8px", color: "#0f172a" }}>No Offers Created Yet</h3>
            <p style={{ fontSize: 13, color: "var(--admin-text-muted)", maxWidth: 440, margin: "0 auto 20px" }}>
              Add your first promotional offer banner with a % discount for All Products or Specific Products. It will auto-slide on Home & Products pages and appear in Cart with a 1-click "Use" button.
            </p>
            <button type="button" className="admin-btn-primary" onClick={openAddModal}>
              <Plus size={16} /> Create First Offer
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {offers.map((offer, idx) => (
              <div
                key={offer._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: 14,
                  borderRadius: 14,
                  border: "1px solid #e2e8f0",
                  background: offer.isActive ? "#ffffff" : "#f8fafc",
                  opacity: offer.isActive ? 1 : 0.72,
                  flexWrap: "wrap",
                }}
              >
                {/* Reorder & Index */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <button
                    type="button"
                    className="admin-icon-btn"
                    onClick={() => moveOrder(idx, -1)}
                    disabled={idx === 0}
                    title="Move up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b" }}>#{idx + 1}</span>
                  <button
                    type="button"
                    className="admin-icon-btn"
                    onClick={() => moveOrder(idx, 1)}
                    disabled={idx === offers.length - 1}
                    title="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>

                {/* Banner Thumbnail */}
                <div
                  style={{
                    width: 150,
                    height: 86,
                    borderRadius: 10,
                    overflow: "hidden",
                    background: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={resolveImageUrl(offer.imageUrl, "", 400)}
                    alt={offer.title}
                    style={{ maxWidth: "100%", maxHeight: "100%", width: "auto", height: "auto", objectFit: "contain" }}
                  />
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        background: "#0d4a2d",
                        color: "#b6f34e",
                        padding: "3px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      <Percent size={12} strokeWidth={2.6} /> {offer.discountPercent}% OFF
                    </span>

                    {offer.scope === "specific" ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          background: "#ede9fe",
                          color: "#6d28d9",
                          padding: "3px 10px",
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        <Package size={12} /> Specific Products ({offer.targetProducts?.length || 0})
                      </span>
                    ) : (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          background: "#e0f2fe",
                          color: "#0369a1",
                          padding: "3px 10px",
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        <Globe size={12} /> All Products
                      </span>
                    )}

                    <span className={`admin-status-badge ${offer.isActive ? "active" : "inactive"}`}>
                      {offer.isActive ? "Active" : "Hidden"}
                    </span>
                  </div>

                  <h3 style={{ margin: "0 0 3px", fontSize: 15.5, fontWeight: 800, color: "#0f172a" }}>
                    {offer.title}
                  </h3>
                  {offer.subtitle && (
                    <p style={{ margin: "0 0 6px", fontSize: 12.5, color: "#64748b" }}>{offer.subtitle}</p>
                  )}

                  {offer.scope === "specific" && offer.targetProducts?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                      {offer.targetProducts.map((tp) => (
                        <span
                          key={tp.slug || tp.id}
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            background: "#f0fdf4",
                            color: "#166534",
                            border: "1px solid #bbf7d0",
                            padding: "2px 8px",
                            borderRadius: 6,
                          }}
                        >
                          {tp.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    type="button"
                    className="admin-icon-btn"
                    onClick={() => toggleActive(offer)}
                    title={offer.isActive ? "Hide Offer" : "Activate Offer"}
                  >
                    {offer.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    type="button"
                    className="admin-icon-btn"
                    onClick={() => openEditModal(offer)}
                    title="Edit Offer"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    type="button"
                    className="admin-icon-btn danger"
                    onClick={() => handleDelete(offer)}
                    title="Delete Offer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Offer Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div
            className="admin-modal-card"
            style={{ maxWidth: 700 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h2>{editingOffer ? "Edit Offer" : "Create New Offer"}</h2>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="admin-modal-body" style={{ maxHeight: "74vh", overflowY: "auto" }}>
                {/* 1. Banner Image Upload */}
                <div className="admin-form-group">
                  <label>Offer Banner Image *</label>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    style={{
                      border: "2px dashed #cbd5e1",
                      borderRadius: 12,
                      padding: 14,
                      background: "#f8fafc",
                    }}
                  >
                    {formData.imageUrl ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                        <div
                          style={{
                            width: 150,
                            height: 86,
                            borderRadius: 8,
                            overflow: "hidden",
                            background: "#fff",
                            border: "1px solid #cbd5e1",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <img
                            src={resolveImageUrl(formData.imageUrl, "", 400)}
                            alt="Offer banner preview"
                            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#15803d", marginBottom: 6 }}>
                            ✓ Banner Image Ready
                          </div>
                          <input
                            type="text"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            placeholder="Image URL"
                            style={{ width: "100%", fontSize: 12, marginBottom: 8 }}
                          />
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              type="button"
                              className="admin-btn-secondary"
                              style={{ padding: "5px 10px", fontSize: 12 }}
                              onClick={() => fileInputRef.current?.click()}
                            >
                              Replace Image
                            </button>
                            <button
                              type="button"
                              className="admin-btn-secondary"
                              style={{ padding: "5px 10px", fontSize: 12, color: "#dc2626" }}
                              onClick={() => setFormData({ ...formData, imageUrl: "" })}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: "center", padding: "14px 8px" }}>
                        <button
                          type="button"
                          className="admin-btn-secondary"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                        >
                          <Upload size={15} />
                          {uploading ? "Uploading to Cloudinary..." : "Upload Offer Banner Image"}
                        </button>
                        <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 8 }}>
                          JPG, PNG, WebP banner
                        </div>
                        <input
                          type="text"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          placeholder="Or paste image URL"
                          style={{ width: "100%", marginTop: 10, fontSize: 12 }}
                        />
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                        e.target.value = "";
                      }}
                    />
                  </div>
                </div>

                {/* 2. Title & Subtitle */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="admin-form-group">
                    <label>Offer Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Offer title"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Short Subtitle (Optional)</label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="Short subtitle"
                    />
                  </div>
                </div>

                {/* 3. Discount Percentage */}
                <div className="admin-form-group">
                  <label>Discount Percentage (% OFF) *</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ position: "relative", width: 130 }}>
                      <input
                        type="number"
                        min={1}
                        max={95}
                        required
                        value={formData.discountPercent}
                        onChange={(e) =>
                          setFormData({ ...formData, discountPercent: e.target.value })
                        }
                        style={{ paddingRight: 30, fontWeight: 800, fontSize: 16 }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          right: 12,
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontWeight: 800,
                          color: "#0d4a2d",
                        }}
                      >
                        %
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {PRESET_DISCOUNTS.map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setFormData({ ...formData, discountPercent: val })}
                          style={{
                            padding: "6px 11px",
                            borderRadius: 999,
                            border:
                              Number(formData.discountPercent) === val
                                ? "1.5px solid #0d4a2d"
                                : "1px solid #cbd5e1",
                            background:
                              Number(formData.discountPercent) === val ? "#0d4a2d" : "#fff",
                            color:
                              Number(formData.discountPercent) === val ? "#b6f34e" : "#334155",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {val}% OFF
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Offer Scope (All Products vs Specific Products) */}
                <div className="admin-form-group">
                  <label>Apply Offer On *</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, scope: "all" })}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "12px 14px",
                        borderRadius: 12,
                        border:
                          formData.scope === "all" ? "2px solid #0d4a2d" : "1px solid #cbd5e1",
                        background: formData.scope === "all" ? "#ecfdf5" : "#fff",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <Globe size={20} color={formData.scope === "all" ? "#0d4a2d" : "#64748b"} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13.5, color: "#0f172a" }}>
                          All Products
                        </div>
                        <div style={{ fontSize: 11.5, color: "#64748b" }}>
                          Applies to entire cart subtotal
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, scope: "specific" })}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "12px 14px",
                        borderRadius: 12,
                        border:
                          formData.scope === "specific" ? "2px solid #0d4a2d" : "1px solid #cbd5e1",
                        background: formData.scope === "specific" ? "#ecfdf5" : "#fff",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <Package
                        size={20}
                        color={formData.scope === "specific" ? "#0d4a2d" : "#64748b"}
                      />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13.5, color: "#0f172a" }}>
                          Specific Product(s)
                        </div>
                        <div style={{ fontSize: 11.5, color: "#64748b" }}>
                          Select 1 or more target products
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 5. Specific Product Picker */}
                {formData.scope === "specific" && (
                  <div className="admin-form-group">
                    <label>
                      Select Target Product(s) * ({formData.selectedProducts.length} selected)
                    </label>

                    {/* Selected Chips */}
                    {formData.selectedProducts.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                        {formData.selectedProducts.map((sp) => (
                          <span
                            key={sp.slug || sp.id}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              background: "#dcfce7",
                              color: "#14532d",
                              border: "1px solid #86efac",
                              borderRadius: 999,
                              padding: "4px 10px",
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {sp.name}
                            <button
                              type="button"
                              onClick={() => toggleProductSelection(sp)}
                              style={{
                                border: "none",
                                background: "transparent",
                                color: "#14532d",
                                cursor: "pointer",
                                padding: 0,
                                display: "inline-flex",
                              }}
                              aria-label={`Remove ${sp.name}`}
                            >
                              <X size={13} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Search Box */}
                    <div style={{ position: "relative", marginBottom: 8 }}>
                      <Search
                        size={15}
                        style={{
                          position: "absolute",
                          left: 11,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#94a3b8",
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        style={{ paddingLeft: 34, width: "100%" }}
                      />
                    </div>

                    {/* Product Selection List */}
                    <div
                      style={{
                        maxHeight: 210,
                        overflowY: "auto",
                        border: "1px solid #e2e8f0",
                        borderRadius: 10,
                        padding: 6,
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        background: "#f8fafc",
                      }}
                    >
                      {filteredProducts.map((p) => {
                        const isSelected = formData.selectedProducts.some(
                          (sp) => sp.slug === p.slug || sp.id === p.id
                        );
                        return (
                          <button
                            key={p.slug || p.id}
                            type="button"
                            onClick={() => toggleProductSelection(p)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "8px 10px",
                              borderRadius: 8,
                              border: isSelected ? "1.5px solid #10b981" : "1px solid #e2e8f0",
                              background: isSelected ? "#ecfdf5" : "#fff",
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                              <div
                                style={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: 6,
                                  background: "#f1f5f9",
                                  overflow: "hidden",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                {p.image ? (
                                  <img
                                    src={resolveImageUrl(p.image, "", 80)}
                                    alt={p.name}
                                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                                  />
                                ) : (
                                  <Tag size={14} color="#94a3b8" />
                                )}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                                  {p.name}
                                </div>
                                <div style={{ fontSize: 11, color: "#64748b" }}>
                                  {p.type} · ₹{p.price}
                                </div>
                              </div>
                            </div>

                            <span
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: 6,
                                background: isSelected ? "#10b981" : "#f1f5f9",
                                color: isSelected ? "#fff" : "#94a3b8",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {isSelected && <Check size={14} strokeWidth={3} />}
                            </span>
                          </button>
                        );
                      })}
                      {filteredProducts.length === 0 && (
                        <div style={{ textAlign: "center", padding: 16, fontSize: 12, color: "#64748b" }}>
                          No products match "{productSearch}"
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 6. Active & Sort Order */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", paddingTop: 6 }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      style={{ width: 18, height: 18, accentColor: "var(--admin-primary)", cursor: "pointer" }}
                    />
                    <span style={{ fontWeight: 700, fontSize: 13 }}>
                      Active (Visible on Home, Products & Cart)
                    </span>
                  </label>

                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <label style={{ margin: 0, fontSize: 12.5 }}>Sort Order:</label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                      style={{ width: 70 }}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary" disabled={saving || uploading}>
                  {saving ? "Saving..." : editingOffer ? "Update Offer" : "Save & Publish Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "#0d4a2d",
            color: "#fff",
            padding: "12px 18px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 700,
            boxShadow: "0 10px 28px rgba(0,0,0,0.2)",
            zIndex: 9999,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
