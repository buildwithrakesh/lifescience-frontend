import React, { useState, useEffect, useRef } from "react";
import {
  Package,
  Search,
  Filter,
  Check,
  X,
  Edit2,
  Trash2,
  Plus,
  RefreshCw,
  AlertCircle,
  Eye,
  Upload,
  Image as ImageIcon,
  FileText,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Clock,
  ArrowRight,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { API_BASE_URL, apiFetch, resolveImageUrl } from "../utils/api";

// Manufacturer Core Categories
const DEFAULT_CATEGORIES = [
  "Animal Nutrition & Minerals",
  "Milk Production & Udder Care",
  "Reproductive & Pregnancy Care",
  "Digestive & Metabolic Health",
  "Deworming & Parasite Control",
  "Skin & External Care",
];

// Product Form Options
const PRODUCT_FORMS = ["Bolus", "Gel", "Powder", "Liquid", "Spray", "Other"];

// Animal Selection Options
const ANIMAL_OPTIONS = [
  "Cow",
  "Buffalo",
  "Calf",
  "Sheep & Goat",
  "Cock",
  "Dog",
  "Fish",
  "Other",
];

// Measurement units for composition table
const COMPOSITION_UNITS = ["mg", "g", "ml", "IU", "%", "mcg", "q.s."];

// Quick packaging suggestions
const PACKING_PRESETS = [
  "100 ml",
  "250 gm",
  "500 gm",
  "1 Litre",
  "5 Litre",
  "20 Bolus",
  "30 Bolus",
  "1 kg",
];

const INITIAL_FORM_STATE = {
  name: "",
  tagline: "",
  category: "Animal Nutrition & Minerals",
  productForm: "Bolus",
  suitableFor: ["Cow", "Buffalo"],
  price: 0,
  tag: "",
  images: {
    main: "",
    gallery: [],
    poster: "",
  },
  featuresAndBenefits: [""],
  advantages: [""],
  recommendations: [""],
  actions: [""],
  indications: [""],
  compositionTable: [{ ingredient: "", quantity: "", unit: "mg" }],
  dosage: "",
  dosageNotes: "",
  usages: [""],
  packing: ["500 ml", "1 Litre"],
  packSizes: [
    { size: "500 ml", priceMultiplier: 1, price: "", image: "" },
    { size: "1 Litre", priceMultiplier: 1.4, price: "", image: "" },
  ],
  storage: "Store in a cool, dry place away from direct sunlight. Do not freeze.",
  status: "published",
  isFeatured: false,
  displayOrder: 1,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toastMsg, setToastMsg] = useState("");

  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState(null);

  // Form interaction state
  const [customPackingInput, setCustomPackingInput] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [uploadingField, setUploadingField] = useState(null); // 'main' | 'gallery' | 'poster'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Drag and drop state
  const [dragActiveMain, setDragActiveMain] = useState(false);
  const [dragActivePoster, setDragActivePoster] = useState(false);

  // Collapsible section toggles
  const [sectionOpen, setSectionOpen] = useState({
    details: true,
    images: true,
    info: true,
    packing: true,
    settings: true,
  });

  const mainFileInputRef = useRef(null);
  const galleryFileInputRef = useRef(null);
  const posterFileInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const toggleSection = (sec) => {
    setSectionOpen((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Load all products (admin view includes drafts)
  const loadProducts = async () => {
    setLoading(true);
    try {
      const url = `/api/products?limit=200&includeDrafts=true&status=${statusFilter}&category=${categoryFilter}&search=${encodeURIComponent(
        search
      )}`;
      const res = await apiFetch(url);
      if (res.success && Array.isArray(res.data)) {
        setProducts(res.data);
      }
    } catch (err) {
      console.warn("Failed to load products from API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [categoryFilter, statusFilter]);

  // Lock background body scroll to completely prevent scroll propagation when any modal is open
  useEffect(() => {
    const isAnyModalOpen = formOpen || previewOpen || !!deleteConfirmProduct;
    if (isAnyModalOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      return () => {
        document.body.style.overflow = originalOverflow || "";
        document.body.style.touchAction = originalTouchAction || "";
      };
    }
  }, [formOpen, previewOpen, deleteConfirmProduct]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProducts();
  };

  // Extract combined categories
  const allCategories = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...products.map((p) => p.category).filter(Boolean)])
  );

  // Open Form to Add New Product
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormErrors({});
    setFormData({
      ...INITIAL_FORM_STATE,
      displayOrder: products.length + 1,
    });
    setFormOpen(true);
  };

  // Open Form to Edit Existing Product
  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setFormErrors({});

    // Clean arrays so form doesn't crash on null/empty
    const cleanList = (arr) => (Array.isArray(arr) && arr.length > 0 ? arr : [""]);

    // Merge packing labels & packSizes metadata (price, multiplier, image)
    const rawPacking =
      Array.isArray(prod.packing) && prod.packing.length > 0
        ? prod.packing
        : Array.isArray(prod.packSizes) && prod.packSizes.length > 0
        ? prod.packSizes.map((p) => p.size).filter(Boolean)
        : ["500 ml", "1 Litre"];

    const existingPackMap = new Map(
      (Array.isArray(prod.packSizes) ? prod.packSizes : [])
        .filter((p) => p && p.size)
        .map((p) => [String(p.size).trim().toLowerCase(), p])
    );

    const mergedPackSizes = rawPacking.map((label, idx) => {
      const cleanLabel = String(label || "").trim();
      const match = existingPackMap.get(cleanLabel.toLowerCase());
      return {
        size: cleanLabel,
        priceMultiplier:
          match && typeof match.priceMultiplier === "number"
            ? match.priceMultiplier
            : idx === 0
            ? 1
            : Number((1 + idx * 0.4).toFixed(2)),
        price: match && typeof match.price === "number" && match.price > 0 ? match.price : "",
        image: match?.image || "",
      };
    });

    setFormData({
      name: prod.name || "",
      tagline: prod.tagline || "",
      category: prod.category || "Animal Nutrition & Minerals",
      productForm: prod.productForm || prod.formulation || "Bolus",
      suitableFor: Array.isArray(prod.suitableFor) && prod.suitableFor.length
        ? prod.suitableFor
        : Array.isArray(prod.targetAnimals) && prod.targetAnimals.length
        ? prod.targetAnimals
        : ["Cow", "Buffalo"],
      price: prod.price || 0,
      tag: "",
      images: {
        main: prod.images?.main || prod.imageUrl || "",
        gallery: Array.isArray(prod.images?.gallery) ? prod.images.gallery : [],
        poster: prod.images?.poster || "",
      },
      featuresAndBenefits: cleanList(prod.featuresAndBenefits || prod.benefits),
      advantages: cleanList(prod.advantages),
      recommendations: cleanList(prod.recommendations),
      actions: cleanList(prod.actions),
      indications: cleanList(prod.indications),
      compositionTable:
        Array.isArray(prod.compositionTable) && prod.compositionTable.length > 0
          ? prod.compositionTable
          : prod.composition
          ? [{ ingredient: prod.composition, quantity: "Standard", unit: "q.s." }]
          : [{ ingredient: "", quantity: "", unit: "mg" }],
      dosage: prod.dosage || "",
      dosageNotes: prod.dosageNotes || "",
      usages: cleanList(prod.usages),
      packing: rawPacking,
      packSizes: mergedPackSizes,
      storage: prod.storage || "Store in a cool, dry place away from direct sunlight.",
      status: prod.status || (prod.isActive === false ? "draft" : "published"),
      isFeatured: !!prod.isFeatured,
      displayOrder: prod.displayOrder ?? prod.sortOrder ?? 1,
    });
    setFormOpen(true);
  };

  // Upload image to Cloudinary via backend
  const uploadImageFile = async (file) => {
    if (!file) return null;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      alert("Please upload a valid image (JPG, JPEG, PNG, or WebP).");
      return null;
    }

    const body = new FormData();
    body.append("image", file);
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("vetora_admin_token") : null;

    const res = await fetch(`${API_BASE_URL}/api/upload?type=product`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body,
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Upload failed");
    }
    return json.data.url;
  };

  // Handle Main Packaging Image Upload
  const handleMainImageUpload = async (file) => {
    if (!file) return;
    setUploadingField("main");
    try {
      const url = await uploadImageFile(file);
      if (url) {
        setFormData((prev) => ({
          ...prev,
          images: { ...prev.images, main: url },
        }));
        setFormErrors((prev) => ({ ...prev, mainImage: null }));
        showToast("Main packaging image uploaded successfully");
      }
    } catch (err) {
      alert("Failed to upload main image: " + err.message);
    } finally {
      setUploadingField(null);
    }
  };

  // Handle Gallery Images Upload (Multi-select)
  const handleGalleryUpload = async (files) => {
    if (!files || !files.length) return;
    setUploadingField("gallery");
    try {
      const urls = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadImageFile(files[i]);
        if (url) urls.push(url);
      }
      if (urls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: {
            ...prev.images,
            gallery: [...(prev.images.gallery || []), ...urls],
          },
        }));
        showToast(`Uploaded ${urls.length} additional packaging image(s)`);
      }
    } catch (err) {
      alert("Gallery upload failed: " + err.message);
    } finally {
      setUploadingField(null);
    }
  };

  // Remove Gallery Image
  const handleRemoveGalleryImage = (idx) => {
    setFormData((prev) => ({
      ...prev,
      images: {
        ...prev.images,
        gallery: prev.images.gallery.filter((_, i) => i !== idx),
      },
    }));
  };

  // Handle Product Poster Upload
  const handlePosterUpload = async (file) => {
    if (!file) return;
    setUploadingField("poster");
    try {
      const url = await uploadImageFile(file);
      if (url) {
        setFormData((prev) => ({
          ...prev,
          images: { ...prev.images, poster: url },
        }));
        showToast("Product information poster uploaded successfully");
      }
    } catch (err) {
      alert("Poster upload failed: " + err.message);
    } finally {
      setUploadingField(null);
    }
  };

  // Toggle Animal Selection
  const toggleAnimal = (animal) => {
    setFormData((prev) => {
      const current = prev.suitableFor || [];
      const next = current.includes(animal)
        ? current.filter((a) => a !== animal)
        : [...current, animal];
      return { ...prev, suitableFor: next };
    });
  };

  // Bullet Points Builder Helpers
  const handleBulletChange = (field, index, value) => {
    setFormData((prev) => {
      const nextList = [...prev[field]];
      nextList[index] = value;
      return { ...prev, [field]: nextList };
    });
  };

  const handleAddBullet = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const handleRemoveBullet = (field, index) => {
    setFormData((prev) => {
      const current = prev[field];
      if (current.length <= 1) {
        return { ...prev, [field]: [""] };
      }
      return {
        ...prev,
        [field]: current.filter((_, i) => i !== index),
      };
    });
  };

  // Composition Table Helpers
  const handleCompositionChange = (index, key, value) => {
    setFormData((prev) => {
      const updated = [...prev.compositionTable];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, compositionTable: updated };
    });
  };

  const handleAddCompositionRow = () => {
    setFormData((prev) => ({
      ...prev,
      compositionTable: [
        ...prev.compositionTable,
        { ingredient: "", quantity: "", unit: "mg" },
      ],
    }));
  };

  const handleRemoveCompositionRow = (index) => {
    setFormData((prev) => {
      if (prev.compositionTable.length <= 1) {
        return {
          ...prev,
          compositionTable: [{ ingredient: "", quantity: "", unit: "mg" }],
        };
      }
      return {
        ...prev,
        compositionTable: prev.compositionTable.filter((_, i) => i !== index),
      };
    });
  };

  // Packing & Pack-Wise Image Helpers
  const handleAddPackingTag = (val) => {
    const trimmed = (val || customPackingInput).trim();
    if (!trimmed) return;
    if (!formData.packing.includes(trimmed)) {
      setFormData((prev) => {
        const nextIdx = prev.packing.length;
        return {
          ...prev,
          packing: [...prev.packing, trimmed],
          packSizes: [
            ...(prev.packSizes || []),
            {
              size: trimmed,
              priceMultiplier: nextIdx === 0 ? 1 : Number((1 + nextIdx * 0.4).toFixed(2)),
              price: "",
              image: "",
            },
          ],
        };
      });
    }
    setCustomPackingInput("");
  };

  const handleRemovePackingTag = (index) => {
    setFormData((prev) => ({
      ...prev,
      packing: prev.packing.filter((_, i) => i !== index),
      packSizes: (prev.packSizes || []).filter((_, i) => i !== index),
    }));
  };

  const handlePackFieldChange = (index, key, value) => {
    setFormData((prev) => {
      const baseList =
        Array.isArray(prev.packSizes) && prev.packSizes.length === prev.packing.length
          ? [...prev.packSizes]
          : prev.packing.map((size, idx) => ({
              size,
              priceMultiplier: idx === 0 ? 1 : Number((1 + idx * 0.4).toFixed(2)),
              price: "",
              image: "",
            }));
      baseList[index] = { ...baseList[index], [key]: value };
      return { ...prev, packSizes: baseList };
    });
  };

  const handlePackImageUpload = async (index, file) => {
    if (!file) return;
    setUploadingField(`pack-${index}`);
    try {
      const url = await uploadImageFile(file);
      if (url) {
        handlePackFieldChange(index, "image", url);
        showToast(`Pack image for "${formData.packing[index]}" uploaded successfully`);
      }
    } catch (err) {
      alert("Failed to upload pack image: " + err.message);
    } finally {
      setUploadingField(null);
    }
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Product Name is required.";
    }
    if (!formData.category.trim()) {
      errors.category = "Category is required.";
    }
    if (!formData.productForm.trim()) {
      errors.productForm = "Product Form is required.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Clean form payload for API submission
  const preparePayload = (statusOverride) => {
    const cleanArray = (arr) =>
      Array.isArray(arr)
        ? arr.map((item) => (typeof item === "string" ? item.trim() : item)).filter(Boolean)
        : [];

    const cleanComposition = (formData.compositionTable || []).filter(
      (row) => row.ingredient && row.ingredient.trim()
    );

    const cleanPacking = cleanArray(formData.packing);
    const cleanPackSizes = cleanPacking.map((sizeLabel, idx) => {
      const existing =
        (formData.packSizes || []).find(
          (p) => p && String(p.size || "").trim().toLowerCase() === sizeLabel.toLowerCase()
        ) || (formData.packSizes || [])[idx] || {};
      const parsedPrice = Number(existing.price);
      const parsedMult = Number(existing.priceMultiplier);
      return {
        size: sizeLabel,
        priceMultiplier:
          !Number.isNaN(parsedMult) && parsedMult > 0
            ? parsedMult
            : idx === 0
            ? 1
            : Number((1 + idx * 0.4).toFixed(2)),
        ...(!Number.isNaN(parsedPrice) && parsedPrice > 0 ? { price: parsedPrice } : {}),
        image: existing.image ? String(existing.image).trim() : "",
      };
    });

    return {
      ...formData,
      tag: "",
      status: statusOverride || formData.status,
      featuresAndBenefits: cleanArray(formData.featuresAndBenefits),
      advantages: cleanArray(formData.advantages),
      recommendations: cleanArray(formData.recommendations),
      actions: cleanArray(formData.actions),
      indications: cleanArray(formData.indications),
      usages: cleanArray(formData.usages),
      packing: cleanPacking,
      packSizes: cleanPackSizes,
      compositionTable: cleanComposition,
      composition: cleanComposition
        .map((c) => `${c.ingredient} ${c.quantity}${c.unit}`)
        .join(", "),
    };
  };

  // Save / Publish Submit Handler
  const handleSubmitForm = async (targetStatus) => {
    if (!validateForm()) {
      // Open details section if collapsed
      setSectionOpen((prev) => ({ ...prev, details: true }));
      showToast("Please fill in all required fields marked in red.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = preparePayload(targetStatus);
      let res;

      if (editingProduct) {
        res = await apiFetch(`/api/admin/products/${editingProduct.id || editingProduct._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiFetch("/api/admin/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      if (res.success) {
        showToast(
          editingProduct
            ? `Product "${payload.name}" updated successfully!`
            : `Product "${payload.name}" ${
                targetStatus === "draft" ? "saved as Draft" : "published"
              } successfully!`
        );
        setFormOpen(false);
        loadProducts();
      }
    } catch (err) {
      alert("Failed to save product: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Toggle Stock
  const toggleInStock = async (product) => {
    try {
      const nextStock = !product.inStock;
      const res = await apiFetch(`/api/admin/products/${product.id || product._id}`, {
        method: "PUT",
        body: JSON.stringify({ inStock: nextStock }),
      });
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id || p._id === product._id ? { ...p, inStock: nextStock } : p
          )
        );
        showToast(`${product.name} is now ${nextStock ? "In Stock" : "Out of Stock"}`);
      }
    } catch (err) {
      alert("Error updating product: " + err.message);
    }
  };

  // Quick Toggle Published / Draft status
  const toggleStatus = async (product) => {
    try {
      const nextStatus = product.status === "draft" ? "published" : "draft";
      const res = await apiFetch(`/api/admin/products/${product.id || product._id}`, {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus, isActive: nextStatus === "published" }),
      });
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id || p._id === product._id
              ? { ...p, status: nextStatus, isActive: nextStatus === "published" }
              : p
          )
        );
        showToast(
          `Product is now ${nextStatus === "published" ? "Published" : "Moved to Drafts"}`
        );
      }
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  // Delete Product
  const handleDeleteProduct = async () => {
    if (!deleteConfirmProduct) return;
    try {
      const id = deleteConfirmProduct.id || deleteConfirmProduct._id;
      const res = await apiFetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id && p._id !== id));
        showToast(`Product "${deleteConfirmProduct.name}" deleted successfully.`);
        setDeleteConfirmProduct(null);
      }
    } catch (err) {
      alert("Failed to delete product: " + err.message);
    }
  };

  // Open Preview from Form or Table
  const handleOpenPreview = (productData = null) => {
    const dataToPreview = productData || preparePayload();
    setPreviewProduct(dataToPreview);
    setPreviewOpen(true);
  };

  // Stats calculation
  const totalCount = products.length;
  const publishedCount = products.filter((p) => p.status !== "draft" && p.isActive !== false).length;
  const draftCount = products.filter((p) => p.status === "draft" || p.isActive === false).length;

  return (
    <div>
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "#12452c",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <CheckCircle2 size={18} color="#6ca338" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Catalog Header Card */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-page-main-title">Products Catalog</h2>
            <p style={{ color: "var(--admin-text-muted)", fontSize: "13px", margin: "4px 0 0" }}>
              Total <b>{totalCount}</b> products &bull; <b>{publishedCount}</b> Published &bull;{" "}
              <b>{draftCount}</b> Drafts
            </p>
          </div>

          <div className="admin-header-actions" style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={loadProducts}
              className="admin-btn admin-btn-outline admin-btn-sm"
              title="Refresh Catalog"
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="admin-btn admin-btn-primary"
              style={{ fontWeight: 800, padding: "10px 18px" }}
            >
              <Plus size={16} />
              <span>+ Add Product</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="admin-filters-bar">
          <form onSubmit={handleSearchSubmit} className="admin-search-form">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-search-input"
            />
            <button
              type="submit"
              className="admin-btn admin-btn-primary admin-btn-sm"
              aria-label="Search"
            >
              <Search size={14} />
            </button>
          </form>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="admin-select"
          >
            <option value="all">All Categories ({totalCount})</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-select"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published Only ({publishedCount})</option>
            <option value="draft">Drafts Only ({draftCount})</option>
          </select>
        </div>

        {/* Products Table */}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr style={{ background: "#f0f6f2", textAlign: "left", color: "var(--admin-primary)" }}>
                <th style={{ padding: "12px 14px", borderRadius: "8px 0 0 8px" }}>Product</th>
                <th style={{ padding: "12px 14px" }}>Category</th>
                <th style={{ padding: "12px 14px" }}>Form</th>
                <th style={{ padding: "12px 14px" }}>Suitable For</th>
                <th style={{ padding: "12px 14px" }}>Status</th>
                <th style={{ padding: "12px 14px" }}>Stock</th>
                <th style={{ padding: "12px 14px", textAlign: "right", borderRadius: "0 8px 8px 0" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: "30px", textAlign: "center", color: "#667c6d" }}>
                    <RefreshCw size={20} className="spin" style={{ display: "inline-block", marginRight: 8 }} />
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: "30px", textAlign: "center", color: "#667c6d" }}>
                    No products found matching your search or filter.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isDraft = p.status === "draft" || p.isActive === false;
                  const thumb = p.images?.main || p.imageUrl || p.img;
                  const suitableList = p.suitableFor?.length
                    ? p.suitableFor
                    : p.targetAnimals?.length
                    ? p.targetAnimals
                    : [];

                  return (
                    <tr
                      key={p.id || p._id}
                      style={{
                        borderBottom: "1px solid var(--admin-border)",
                        background: isDraft ? "#fafbf9" : "transparent",
                      }}
                    >
                      {/* Product Thumbnail & Title */}
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 8,
                              background: "#f0f4f1",
                              border: "1px solid var(--admin-border)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden",
                              flexShrink: 0,
                            }}
                          >
                            {thumb ? (
                              <img
                                src={resolveImageUrl(thumb, "", 120)}
                                alt={p.name}
                                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                              />
                            ) : (
                              <ImageIcon size={20} color="#94a39b" />
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: "var(--admin-text-main)", fontSize: 14 }}>
                              {p.name}
                            </div>
                            <div style={{ color: "var(--admin-text-muted)", fontSize: 12 }}>
                              {p.tagline || p.type || "Veterinary Formulation"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600 }}>
                        {p.category}
                      </td>

                      {/* Form */}
                      <td style={{ padding: "12px 14px", fontSize: 13 }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            borderRadius: 6,
                            background: "#eaf3ed",
                            color: "var(--admin-primary)",
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        >
                          {p.productForm || p.formulation || "Bolus"}
                        </span>
                      </td>

                      {/* Suitable For */}
                      <td style={{ padding: "12px 14px", fontSize: 12 }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 160 }}>
                          {suitableList.slice(0, 3).map((a) => (
                            <span
                              key={a}
                              style={{
                                padding: "2px 6px",
                                background: "#f2f5f3",
                                borderRadius: 4,
                                color: "#455a4e",
                              }}
                            >
                              {a}
                            </span>
                          ))}
                          {suitableList.length > 3 && (
                            <span style={{ color: "var(--admin-text-muted)" }}>
                              +{suitableList.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "12px 14px" }}>
                        <button
                          type="button"
                          onClick={() => toggleStatus(p)}
                          className={`admin-status-badge ${!isDraft ? "active" : "inactive"}`}
                          style={{
                            cursor: "pointer",
                            border: "none",
                            background: !isDraft ? "#e8f5e9" : "#fff8e1",
                            color: !isDraft ? "#1e874b" : "#b45309",
                          }}
                          title="Click to toggle Published / Draft"
                        >
                          {!isDraft ? <Check size={12} /> : <Clock size={12} />}
                          <span>{!isDraft ? "Published" : "Draft"}</span>
                        </button>
                      </td>

                      {/* Stock Toggle */}
                      <td style={{ padding: "12px 14px" }}>
                        <button
                          type="button"
                          onClick={() => toggleInStock(p)}
                          className={`admin-status-badge ${p.inStock ? "active" : "inactive"}`}
                          style={{ cursor: "pointer", border: "none" }}
                          title="Click to toggle stock status"
                        >
                          {p.inStock ? <Check size={12} /> : <X size={12} />}
                          <span>{p.inStock ? "In Stock" : "Out of Stock"}</span>
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(p)}
                            className="admin-btn admin-btn-outline admin-btn-sm"
                            title="Preview on Storefront"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(p)}
                            className="admin-btn admin-btn-outline admin-btn-sm"
                            title="Edit Product"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmProduct(p)}
                            className="admin-btn admin-btn-outline admin-btn-sm"
                            style={{ color: "#dc2626", borderColor: "#fecaca" }}
                            title="Delete Product"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ADD / EDIT PRODUCT MODAL FORM
      ══════════════════════════════════════════════════════════════════════ */}
      {formOpen && (
        <div
          className="admin-modal-overlay"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
        >
          <div
            className="admin-product-modal"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="admin-product-modal-header">
              <h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>
              <button
                type="button"
                className="admin-modal-close-icon"
                onClick={() => setFormOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: 5 Clean Sections */}
            <div className="admin-product-modal-body">
              {/* ── SECTION 1: Product Details ── */}
              <div className="form-section-card">
                <div
                  className="form-section-title-bar"
                  onClick={() => toggleSection("details")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="form-section-title-wrap">
                    <span className="form-section-num">1</span>
                    <h3 className="form-section-title">Product Details</h3>
                  </div>
                  {sectionOpen.details ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>

                {sectionOpen.details && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div className="form-grid-2">
                      {/* Product Name */}
                      <div className="form-field-group">
                        <label>
                          Product Name <span className="req">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Product name"
                          value={formData.name}
                          onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            if (formErrors.name) setFormErrors({ ...formErrors, name: null });
                          }}
                          className="form-input-text"
                          style={{
                            borderColor: formErrors.name ? "var(--admin-danger)" : undefined,
                          }}
                        />
                        {formErrors.name && (
                          <span style={{ color: "var(--admin-danger)", fontSize: 12 }}>
                            {formErrors.name}
                          </span>
                        )}
                      </div>

                      {/* Product Tagline */}
                      <div className="form-field-group">
                        <label>Product Tagline (Optional)</label>
                        <input
                          type="text"
                          placeholder="Short subtitle or tagline"
                          value={formData.tagline}
                          onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                          className="form-input-text"
                        />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      {/* Category */}
                      <div className="form-field-group">
                        <label>
                          Category <span className="req">*</span>
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => {
                            setFormData({ ...formData, category: e.target.value });
                            if (formErrors.category) setFormErrors({ ...formErrors, category: null });
                          }}
                          className="form-select-input"
                          style={{
                            borderColor: formErrors.category ? "var(--admin-danger)" : undefined,
                          }}
                        >
                          {allCategories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Product Form */}
                      <div className="form-field-group">
                        <label>
                          Product Form <span className="req">*</span>
                        </label>
                        <select
                          value={formData.productForm}
                          onChange={(e) => setFormData({ ...formData, productForm: e.target.value })}
                          className="form-select-input"
                        >
                          {PRODUCT_FORMS.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Suitable For (Animal Selection) */}
                    <div className="form-field-group">
                      <label>Suitable For (Target Animals)</label>
                      <div className="animal-chips-grid">
                        {ANIMAL_OPTIONS.map((animal) => {
                          const active = (formData.suitableFor || []).includes(animal);
                          return (
                            <button
                              key={animal}
                              type="button"
                              onClick={() => toggleAnimal(animal)}
                              className={`animal-chip-btn ${active ? "active" : ""}`}
                            >
                              {active && <Check size={13} />}
                              <span>{animal}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── SECTION 2: Product Images ── */}
              <div className="form-section-card">
                <div
                  className="form-section-title-bar"
                  onClick={() => toggleSection("images")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="form-section-title-wrap">
                    <span className="form-section-num">2</span>
                    <h3 className="form-section-title">Product Images</h3>
                  </div>
                  {sectionOpen.images ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>

                {sectionOpen.images && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* 1. Main Product Image */}
                    <div className="form-field-group">
                      <label>
                        1. Product Image (Main Packaging) <span className="req">*</span>
                      </label>

                      {formData.images.main ? (
                        <div className="image-preview-card" style={{ maxWidth: 360 }}>
                          <img
                            src={resolveImageUrl(formData.images.main, "", 600)}
                            alt="Main product"
                          />
                          <div className="image-preview-actions">
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#12452c" }}>
                              <CheckCircle2 size={14} style={{ display: "inline", marginRight: 4 }} />
                              Primary Packaging Image
                            </span>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                type="button"
                                onClick={() => mainFileInputRef.current?.click()}
                                className="admin-btn admin-btn-outline admin-btn-sm"
                              >
                                Replace
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    images: { ...prev.images, main: "" },
                                  }))
                                }
                                className="admin-btn admin-btn-outline admin-btn-sm"
                                style={{ color: "#dc2626" }}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`image-upload-dropzone ${dragActiveMain ? "drag-active" : ""}`}
                          onClick={() => mainFileInputRef.current?.click()}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragActiveMain(true);
                          }}
                          onDragLeave={() => setDragActiveMain(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragActiveMain(false);
                            if (e.dataTransfer.files?.[0]) {
                              handleMainImageUpload(e.dataTransfer.files[0]);
                            }
                          }}
                        >
                          <div className="image-upload-icon-circle">
                            {uploadingField === "main" ? (
                              <RefreshCw size={20} className="spin" />
                            ) : (
                              <Upload size={20} />
                            )}
                          </div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--admin-primary)" }}>
                            {uploadingField === "main"
                              ? "Uploading to Cloudinary..."
                              : "Click to upload or drag & drop packaging photo"}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>
                            Supports JPG, JPEG, PNG, WebP (Up to 12MB)
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={mainFileInputRef}
                        onChange={(e) => handleMainImageUpload(e.target.files?.[0])}
                        accept="image/jpeg,image/png,image/webp"
                        style={{ display: "none" }}
                      />
                    </div>

                    {/* 2. Additional Packaging Images */}
                    <div className="form-field-group">
                      <label>2. Additional Images (Different Packaging Angles)</label>

                      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 4 }}>
                        <button
                          type="button"
                          onClick={() => galleryFileInputRef.current?.click()}
                          className="admin-btn admin-btn-outline admin-btn-sm"
                          disabled={uploadingField === "gallery"}
                        >
                          {uploadingField === "gallery" ? (
                            <RefreshCw size={14} className="spin" />
                          ) : (
                            <Plus size={14} />
                          )}
                          <span>
                            {uploadingField === "gallery" ? "Uploading..." : "+ Add More Photos"}
                          </span>
                        </button>
                        <span style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>
                          {formData.images.gallery?.length || 0} additional photo(s) added
                        </span>
                      </div>

                      {formData.images.gallery?.length > 0 && (
                        <div className="gallery-previews-grid">
                          {formData.images.gallery.map((imgUrl, idx) => (
                            <div key={idx} className="gallery-preview-item">
                              <img src={resolveImageUrl(imgUrl, "", 300)} alt={`Angle ${idx + 1}`} />
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(idx)}
                                className="gallery-delete-btn"
                                title="Delete image"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <input
                        type="file"
                        ref={galleryFileInputRef}
                        onChange={(e) => handleGalleryUpload(e.target.files)}
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        style={{ display: "none" }}
                      />
                    </div>

                    {/* 3. Product Information Poster */}
                    <div className="form-field-group">
                      <label>3. Product Information Poster (Optional Marketing Brochure)</label>

                      {formData.images.poster ? (
                        <div className="image-preview-card" style={{ maxWidth: 360 }}>
                          <img
                            src={resolveImageUrl(formData.images.poster, "", 600)}
                            alt="Product Poster"
                          />
                          <div className="image-preview-actions">
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#12452c" }}>
                              <FileText size={14} style={{ display: "inline", marginRight: 4 }} />
                              Product Poster Loaded
                            </span>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                type="button"
                                onClick={() => posterFileInputRef.current?.click()}
                                className="admin-btn admin-btn-outline admin-btn-sm"
                              >
                                Replace
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    images: { ...prev.images, poster: "" },
                                  }))
                                }
                                className="admin-btn admin-btn-outline admin-btn-sm"
                                style={{ color: "#dc2626" }}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`image-upload-dropzone ${dragActivePoster ? "drag-active" : ""}`}
                          onClick={() => posterFileInputRef.current?.click()}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragActivePoster(true);
                          }}
                          onDragLeave={() => setDragActivePoster(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragActivePoster(false);
                            if (e.dataTransfer.files?.[0]) {
                              handlePosterUpload(e.dataTransfer.files[0]);
                            }
                          }}
                          style={{ padding: "18px 16px" }}
                        >
                          <div className="image-upload-icon-circle" style={{ width: 38, height: 38 }}>
                            {uploadingField === "poster" ? (
                              <RefreshCw size={18} className="spin" />
                            ) : (
                              <FileText size={18} />
                            )}
                          </div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "var(--admin-primary)" }}>
                            {uploadingField === "poster"
                              ? "Uploading Poster..."
                              : "Click to upload product poster or technical brochure"}
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={posterFileInputRef}
                        onChange={(e) => handlePosterUpload(e.target.files?.[0])}
                        accept="image/jpeg,image/png,image/webp"
                        style={{ display: "none" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ── SECTION 3: Product Information ── */}
              <div className="form-section-card">
                <div
                  className="form-section-title-bar"
                  onClick={() => toggleSection("info")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="form-section-title-wrap">
                    <span className="form-section-num">3</span>
                    <h3 className="form-section-title">Product Information</h3>
                  </div>
                  {sectionOpen.info ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>

                {sectionOpen.info && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {/* A. Features & Benefits */}
                    <div className="form-field-group">
                      <label>A. Features & Benefits</label>
                      <div className="bullet-points-list">
                        {formData.featuresAndBenefits.map((item, idx) => (
                          <div key={idx} className="bullet-point-row">
                            <span className="bullet-point-dot" />
                            <input
                              type="text"
                              placeholder="Feature or benefit point"
                              value={item}
                              onChange={(e) =>
                                handleBulletChange("featuresAndBenefits", idx, e.target.value)
                              }
                              className="form-input-text"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveBullet("featuresAndBenefits", idx)}
                              className="bullet-delete-btn"
                              title="Delete point"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddBullet("featuresAndBenefits")}
                        className="btn-add-item"
                      >
                        <Plus size={13} />
                        <span>Add Bullet Point</span>
                      </button>
                    </div>

                    {/* B. Advantages */}
                    <div className="form-field-group">
                      <label>B. Advantages</label>
                      <div className="bullet-points-list">
                        {formData.advantages.map((item, idx) => (
                          <div key={idx} className="bullet-point-row">
                            <span className="bullet-point-dot" />
                            <input
                              type="text"
                              placeholder="Advantage point"
                              value={item}
                              onChange={(e) => handleBulletChange("advantages", idx, e.target.value)}
                              className="form-input-text"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveBullet("advantages", idx)}
                              className="bullet-delete-btn"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddBullet("advantages")}
                        className="btn-add-item"
                      >
                        <Plus size={13} />
                        <span>Add Advantage Point</span>
                      </button>
                    </div>

                    {/* C. Recommendations */}
                    <div className="form-field-group">
                      <label>C. Recommendations</label>
                      <div className="bullet-points-list">
                        {formData.recommendations.map((item, idx) => (
                          <div key={idx} className="bullet-point-row">
                            <span className="bullet-point-dot" />
                            <input
                              type="text"
                              placeholder="Recommendation point"
                              value={item}
                              onChange={(e) =>
                                handleBulletChange("recommendations", idx, e.target.value)
                              }
                              className="form-input-text"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveBullet("recommendations", idx)}
                              className="bullet-delete-btn"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddBullet("recommendations")}
                        className="btn-add-item"
                      >
                        <Plus size={13} />
                        <span>Add Recommendation Point</span>
                      </button>
                    </div>

                    {/* D. Actions */}
                    <div className="form-field-group">
                      <label>D. Actions (Mechanism of Action)</label>
                      <div className="bullet-points-list">
                        {formData.actions.map((item, idx) => (
                          <div key={idx} className="bullet-point-row">
                            <span className="bullet-point-dot" />
                            <input
                              type="text"
                              placeholder="Action point"
                              value={item}
                              onChange={(e) => handleBulletChange("actions", idx, e.target.value)}
                              className="form-input-text"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveBullet("actions", idx)}
                              className="bullet-delete-btn"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddBullet("actions")}
                        className="btn-add-item"
                      >
                        <Plus size={13} />
                        <span>Add Action Point</span>
                      </button>
                    </div>

                    {/* E. Indications */}
                    <div className="form-field-group">
                      <label>E. Indications</label>
                      <div className="bullet-points-list">
                        {formData.indications.map((item, idx) => (
                          <div key={idx} className="bullet-point-row">
                            <span className="bullet-point-dot" />
                            <input
                              type="text"
                              placeholder="Indication point"
                              value={item}
                              onChange={(e) => handleBulletChange("indications", idx, e.target.value)}
                              className="form-input-text"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveBullet("indications", idx)}
                              className="bullet-delete-btn"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddBullet("indications")}
                        className="btn-add-item"
                      >
                        <Plus size={13} />
                        <span>Add Indication Point</span>
                      </button>
                    </div>

                    {/* F. Composition (Structured Table) */}
                    <div className="form-field-group">
                      <label>F. Composition (Active Ingredients Table)</label>
                      <table className="composition-table-admin">
                        <thead>
                          <tr>
                            <th style={{ width: "50%" }}>Ingredient Name</th>
                            <th style={{ width: "25%" }}>Quantity</th>
                            <th style={{ width: "15%" }}>Unit</th>
                            <th style={{ width: "10%", textAlign: "center" }}>Remove</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.compositionTable.map((row, idx) => (
                            <tr key={idx}>
                              <td>
                                <input
                                  type="text"
                                  placeholder="Ingredient name"
                                  value={row.ingredient}
                                  onChange={(e) =>
                                    handleCompositionChange(idx, "ingredient", e.target.value)
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  placeholder="Quantity"
                                  value={row.quantity}
                                  onChange={(e) =>
                                    handleCompositionChange(idx, "quantity", e.target.value)
                                  }
                                />
                              </td>
                              <td>
                                <select
                                  value={row.unit}
                                  onChange={(e) =>
                                    handleCompositionChange(idx, "unit", e.target.value)
                                  }
                                >
                                  {COMPOSITION_UNITS.map((u) => (
                                    <option key={u} value={u}>
                                      {u}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCompositionRow(idx)}
                                  className="table-row-remove-btn"
                                  title="Delete row"
                                >
                                  <X size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <button
                        type="button"
                        onClick={handleAddCompositionRow}
                        className="btn-add-item"
                      >
                        <Plus size={13} />
                        <span>+ Add Ingredient Row</span>
                      </button>
                    </div>

                    {/* G. Dosage */}
                    <div className="form-grid-2">
                      <div className="form-field-group">
                        <label>G. Dosage Instructions</label>
                        <textarea
                          placeholder="Dosage instructions per animal species"
                          value={formData.dosage}
                          onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                          className="form-textarea"
                          rows={3}
                        />
                      </div>

                      <div className="form-field-group">
                        <label>Dosage Notes (Optional)</label>
                        <textarea
                          placeholder="Additional dosage notes"
                          value={formData.dosageNotes}
                          onChange={(e) =>
                            setFormData({ ...formData, dosageNotes: e.target.value })
                          }
                          className="form-textarea"
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* H. Usages */}
                    <div className="form-field-group">
                      <label>H. Usages</label>
                      <div className="bullet-points-list">
                        {formData.usages.map((item, idx) => (
                          <div key={idx} className="bullet-point-row">
                            <span className="bullet-point-dot" />
                            <input
                              type="text"
                              placeholder="Usage guideline point"
                              value={item}
                              onChange={(e) => handleBulletChange("usages", idx, e.target.value)}
                              className="form-input-text"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveBullet("usages", idx)}
                              className="bullet-delete-btn"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddBullet("usages")}
                        className="btn-add-item"
                      >
                        <Plus size={13} />
                        <span>Add Usage Point</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── SECTION 4: Packing Information ── */}
              <div className="form-section-card">
                <div
                  className="form-section-title-bar"
                  onClick={() => toggleSection("packing")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="form-section-title-wrap">
                    <span className="form-section-num">4</span>
                    <h3 className="form-section-title">Packing Information</h3>
                  </div>
                  {sectionOpen.packing ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>

                {sectionOpen.packing && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Packing Sizes */}
                    <div className="form-field-group">
                      <label>Available Packing Sizes</label>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input
                          type="text"
                          placeholder="e.g. 500 ml, 1 Litre"
                          value={customPackingInput}
                          onChange={(e) => setCustomPackingInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddPackingTag();
                            }
                          }}
                          className="form-input-text"
                          style={{ maxWidth: 280 }}
                        />
                        <button
                          type="button"
                          onClick={() => handleAddPackingTag()}
                          className="admin-btn admin-btn-outline admin-btn-sm"
                        >
                          <Plus size={14} /> Add Pack Size
                        </button>
                      </div>

                      {/* Quick Presets */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                        <span style={{ fontSize: 12, color: "var(--admin-text-muted)", alignSelf: "center" }}>
                          Quick Presets:
                        </span>
                        {PACKING_PRESETS.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleAddPackingTag(preset)}
                            style={{
                              border: "1px dashed #b8d2c0",
                              background: "#f9fcf9",
                              borderRadius: 6,
                              padding: "3px 8px",
                              fontSize: 12,
                              cursor: "pointer",
                              color: "var(--admin-primary)",
                            }}
                          >
                            + {preset}
                          </button>
                        ))}
                      </div>

                      {/* Selected Packing Tags */}
                      <div className="packing-tags-list">
                        {formData.packing.map((p, idx) => (
                          <span key={idx} className="packing-tag-badge">
                            <span>{p}</span>
                            <button
                              type="button"
                              onClick={() => handleRemovePackingTag(idx)}
                              className="packing-tag-remove"
                              title="Remove size"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Pack-Size-Wise Image & Price Configuration */}
                      {formData.packing.length > 0 && (
                        <div
                          style={{
                            marginTop: 14,
                            padding: 14,
                            background: "#f8fbf8",
                            border: "1px solid #d9e7dc",
                            borderRadius: 12,
                          }}
                        >
                          <div style={{ marginBottom: 10 }}>
                            <strong style={{ fontSize: 13.5, color: "#12452c" }}>
                              Pack-Size-Wise Product Images (Optional)
                            </strong>
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                              gap: 12,
                            }}
                          >
                            {formData.packing.map((packLabel, idx) => {
                              const packObj = (formData.packSizes || [])[idx] || {
                                size: packLabel,
                                price: "",
                                image: "",
                              };
                              const isPackUploading = uploadingField === `pack-${idx}`;
                              return (
                                <div
                                  key={`${packLabel}-${idx}`}
                                  style={{
                                    display: "flex",
                                    gap: 10,
                                    alignItems: "flex-start",
                                    padding: 10,
                                    background: "#fff",
                                    border: "1px solid #e1ece3",
                                    borderRadius: 10,
                                  }}
                                >
                                  {/* Pack Thumbnail Preview */}
                                  <div
                                    style={{
                                      width: 68,
                                      height: 68,
                                      flexShrink: 0,
                                      borderRadius: 8,
                                      border: "1px solid #e2e8e4",
                                      background: "#f9fbf9",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      overflow: "hidden",
                                      position: "relative",
                                    }}
                                  >
                                    {packObj.image ? (
                                      <>
                                        <img
                                          src={resolveImageUrl(packObj.image, "", 160)}
                                          alt={packLabel}
                                          style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "contain",
                                            padding: 4,
                                          }}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handlePackFieldChange(idx, "image", "")}
                                          title="Remove pack image"
                                          style={{
                                            position: "absolute",
                                            top: 2,
                                            right: 2,
                                            width: 18,
                                            height: 18,
                                            borderRadius: "50%",
                                            border: "none",
                                            background: "rgba(185, 28, 28, 0.9)",
                                            color: "#fff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                            padding: 0,
                                          }}
                                        >
                                          <X size={11} />
                                        </button>
                                      </>
                                    ) : (
                                      <span
                                        style={{
                                          fontSize: 10,
                                          color: "#7a8d81",
                                          textAlign: "center",
                                          padding: 4,
                                          lineHeight: 1.2,
                                        }}
                                      >
                                        Main img
                                      </span>
                                    )}
                                  </div>

                                  {/* Pack Controls */}
                                  <div
                                    style={{
                                      flex: 1,
                                      minWidth: 0,
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 6,
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 6,
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontSize: 12.5,
                                          fontWeight: 700,
                                          color: "#0f3d26",
                                          background: "#e7f4ec",
                                          padding: "2px 8px",
                                          borderRadius: 6,
                                        }}
                                      >
                                        {packLabel}
                                      </span>

                                      <label
                                        className="admin-btn admin-btn-outline admin-btn-sm"
                                        style={{
                                          padding: "3px 8px",
                                          fontSize: 11.5,
                                          cursor: isPackUploading ? "wait" : "pointer",
                                          margin: 0,
                                        }}
                                      >
                                        <Upload size={12} />
                                        <span>
                                          {isPackUploading
                                            ? "Uploading..."
                                            : packObj.image
                                            ? "Change"
                                            : "Upload"}
                                        </span>
                                        <input
                                          type="file"
                                          accept="image/png,image/jpeg,image/webp"
                                          style={{ display: "none" }}
                                          disabled={isPackUploading}
                                          onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) handlePackImageUpload(idx, f);
                                            e.target.value = "";
                                          }}
                                        />
                                      </label>
                                    </div>

                                    <input
                                      type="text"
                                      placeholder="Or paste pack image URL..."
                                      value={packObj.image || ""}
                                      onChange={(e) =>
                                        handlePackFieldChange(idx, "image", e.target.value)
                                      }
                                      className="form-input-text"
                                      style={{ fontSize: 11.5, padding: "5px 8px" }}
                                    />

                                    <input
                                      type="number"
                                      min="0"
                                      placeholder="Custom ₹ Price (optional)"
                                      value={packObj.price ?? ""}
                                      onChange={(e) =>
                                        handlePackFieldChange(idx, "price", e.target.value)
                                      }
                                      className="form-input-text"
                                      style={{ fontSize: 11.5, padding: "5px 8px" }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Storage Instructions */}
                    <div className="form-field-group">
                      <label>Storage Instructions (Optional)</label>
                      <input
                        type="text"
                        placeholder="Storage instructions"
                        value={formData.storage}
                        onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                        className="form-input-text"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ── SECTION 5: Website Settings ── */}
              <div className="form-section-card">
                <div
                  className="form-section-title-bar"
                  onClick={() => toggleSection("settings")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="form-section-title-wrap">
                    <span className="form-section-num">5</span>
                    <h3 className="form-section-title">Website Settings</h3>
                  </div>
                  {sectionOpen.settings ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>

                {sectionOpen.settings && (
                  <div className="form-grid-3">
                    {/* Status Toggle */}
                    <div className="form-field-group">
                      <label>Product Status</label>
                      <div className="status-pill-toggle">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, status: "published" })}
                          className={`status-pill-option ${
                            formData.status === "published" ? "active-published" : ""
                          }`}
                        >
                          <Check size={14} /> Published
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, status: "draft" })}
                          className={`status-pill-option ${
                            formData.status === "draft" ? "active-draft" : ""
                          }`}
                        >
                          <Clock size={14} /> Draft
                        </button>
                      </div>
                    </div>

                    {/* Featured Toggle */}
                    <div className="form-field-group">
                      <label>Featured Product</label>
                      <label
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 10,
                          cursor: "pointer",
                          marginTop: 6,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.isFeatured}
                          onChange={(e) =>
                            setFormData({ ...formData, isFeatured: e.target.checked })
                          }
                          style={{ width: 18, height: 18, accentColor: "#12452c" }}
                        />
                        <span style={{ fontSize: 13, fontWeight: 700 }}>
                          Highlight as Featured Product
                        </span>
                      </label>
                    </div>

                    {/* Display Order */}
                    <div className="form-field-group">
                      <label>Display Order (Priority)</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.displayOrder}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            displayOrder: parseInt(e.target.value, 10) || 1,
                          })
                        }
                        className="form-input-text"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Sticky Footer */}
            <div className="admin-product-modal-footer">
              <div className="modal-footer-left">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="admin-btn admin-btn-outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenPreview()}
                  className="admin-btn admin-btn-outline"
                  style={{ color: "#12452c" }}
                >
                  <Eye size={15} />
                  <span>Preview Product</span>
                </button>
              </div>

              <div className="modal-footer-right">
                <button
                  type="button"
                  onClick={() => handleSubmitForm("draft")}
                  className="admin-btn admin-btn-outline"
                  style={{ color: "#d97706", borderColor: "#fde68a", background: "#fffbeb" }}
                  disabled={isSubmitting}
                >
                  <Clock size={15} />
                  <span>Save as Draft</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmitForm("published")}
                  className="admin-btn admin-btn-primary"
                  style={{ padding: "10px 22px", fontWeight: 800 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <RefreshCw size={15} className="spin" />
                  ) : (
                    <Check size={15} />
                  )}
                  <span>{editingProduct ? "Update & Publish" : "Publish Product"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          LIVE STOREFRONT PRODUCT PREVIEW MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {previewOpen && previewProduct && (
        <div
          className="admin-modal-overlay"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
        >
          <div
            className="preview-modal-dialog"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="preview-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Eye size={18} />
                <span style={{ fontWeight: 800, fontSize: 16 }}>Storefront Product Preview</span>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    background:
                      previewProduct.status === "draft" ? "#fef3c7" : "#dcfce7",
                    color:
                      previewProduct.status === "draft" ? "#92400e" : "#166534",
                  }}
                >
                  {previewProduct.status === "draft" ? "Draft Mode" : "Published"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="admin-modal-close-icon"
                aria-label="Close Preview"
              >
                <X size={18} />
              </button>
            </div>

            {/* Preview Body */}
            <div className="preview-modal-body">
              <div className="preview-notice-banner">
                <AlertCircle size={18} flexShrink={0} />
                <span>
                  <b>Manufacturer Preview Mode:</b> Only sections with entered information will appear on the customer-facing website. Empty sections are omitted automatically.
                </span>
              </div>

              <div className="preview-product-layout">
                {/* Left Side: Images */}
                <div className="preview-gallery-side">
                  <div className="preview-main-img-box">
                    {previewProduct.images?.main || previewProduct.imageUrl ? (
                      <img
                        src={resolveImageUrl(
                          previewProduct.images?.main || previewProduct.imageUrl,
                          "",
                          600
                        )}
                        alt={previewProduct.name}
                      />
                    ) : (
                      <div style={{ textAlign: "center", color: "#8ca094" }}>
                        <ImageIcon size={48} />
                        <div style={{ fontSize: 13, marginTop: 8 }}>No image uploaded yet</div>
                      </div>
                    )}
                  </div>

                  {/* Additional Gallery Thumbnails */}
                  {previewProduct.images?.gallery?.length > 0 && (
                    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                      {previewProduct.images.gallery.map((gImg, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: 8,
                            border: "1px solid var(--admin-border)",
                            padding: 2,
                            background: "#fff",
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={resolveImageUrl(gImg, "", 160)}
                            alt="Packaging view"
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Trust Badges */}
                  <div
                    style={{
                      background: "#f0f6f2",
                      borderRadius: 10,
                      padding: "10px 14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      fontSize: 12,
                      color: "var(--admin-primary)",
                      fontWeight: 700,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <ShieldCheck size={15} /> 100% Genuine GMP Formulation
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircle2 size={15} /> Veterinary Quality Tested
                    </div>
                  </div>
                </div>

                {/* Right Side: Product Details */}
                <div className="preview-details-side">
                  <div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "var(--admin-accent)",
                      }}
                    >
                      {previewProduct.category}
                    </span>
                    <h1>{previewProduct.name || "Untitled Product"}</h1>
                    {previewProduct.tagline && (
                      <p className="preview-tagline">{previewProduct.tagline}</p>
                    )}
                  </div>

                  {/* Form & Animals Pills */}
                  <div className="preview-meta-row">
                    <span className="preview-meta-pill">
                      Form: {previewProduct.productForm || previewProduct.formulation || "Bolus"}
                    </span>
                    {(previewProduct.suitableFor || previewProduct.targetAnimals || []).map((a) => (
                      <span key={a} className="preview-meta-pill" style={{ background: "#f5f8f5" }}>
                        {a}
                      </span>
                    ))}
                  </div>

                  {/* Pack Sizes */}
                  {previewProduct.packing?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                        Available Pack Sizes:
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {previewProduct.packing.map((p, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: "6px 14px",
                              borderRadius: 8,
                              background: idx === 0 ? "var(--admin-primary)" : "#eaf3ed",
                              color: idx === 0 ? "#fff" : "var(--admin-primary)",
                              fontSize: 12.5,
                              fontWeight: 700,
                            }}
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Features & Benefits */}
                  {previewProduct.featuresAndBenefits?.filter(Boolean).length > 0 && (
                    <div className="preview-info-block">
                      <h4>
                        <CheckCircle2 size={16} /> Features & Benefits
                      </h4>
                      <ul className="preview-bullets">
                        {previewProduct.featuresAndBenefits.filter(Boolean).map((pt, idx) => (
                          <li key={idx}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Advantages */}
                  {previewProduct.advantages?.filter(Boolean).length > 0 && (
                    <div className="preview-info-block">
                      <h4>
                        <Sparkles size={16} /> Clinical Advantages
                      </h4>
                      <ul className="preview-bullets">
                        {previewProduct.advantages.filter(Boolean).map((pt, idx) => (
                          <li key={idx}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Composition Table */}
                  {previewProduct.compositionTable?.filter((r) => r.ingredient?.trim()).length >
                    0 && (
                    <div className="preview-info-block">
                      <h4>
                        <Layers size={16} /> Active Ingredients Composition
                      </h4>
                      <table className="composition-table-admin" style={{ margin: "8px 0 0" }}>
                        <thead>
                          <tr>
                            <th>Ingredient</th>
                            <th>Quantity</th>
                            <th>Unit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewProduct.compositionTable
                            .filter((r) => r.ingredient?.trim())
                            .map((row, idx) => (
                              <tr key={idx}>
                                <td style={{ fontWeight: 700 }}>{row.ingredient}</td>
                                <td>{row.quantity}</td>
                                <td>{row.unit}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Dosage */}
                  {(previewProduct.dosage || previewProduct.dosageNotes) && (
                    <div className="preview-info-block">
                      <h4>
                        <Clock size={16} /> Dosage & Administration Guidelines
                      </h4>
                      {previewProduct.dosage && (
                        <p style={{ margin: "0 0 6px", fontSize: 13.5, lineHeight: 1.5 }}>
                          <b>Recommended Dosage:</b> {previewProduct.dosage}
                        </p>
                      )}
                      {previewProduct.dosageNotes && (
                        <p style={{ margin: 0, fontSize: 13, color: "var(--admin-text-muted)", fontStyle: "italic" }}>
                          <b>Notes:</b> {previewProduct.dosageNotes}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Recommendations */}
                  {previewProduct.recommendations?.filter(Boolean).length > 0 && (
                    <div className="preview-info-block">
                      <h4>
                        <CheckCircle2 size={16} /> Recommendations
                      </h4>
                      <ul className="preview-bullets">
                        {previewProduct.recommendations.filter(Boolean).map((pt, idx) => (
                          <li key={idx}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  {previewProduct.actions?.filter(Boolean).length > 0 && (
                    <div className="preview-info-block">
                      <h4>
                        <CheckCircle2 size={16} /> Actions & Mechanism
                      </h4>
                      <ul className="preview-bullets">
                        {previewProduct.actions.filter(Boolean).map((pt, idx) => (
                          <li key={idx}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Indications */}
                  {previewProduct.indications?.filter(Boolean).length > 0 && (
                    <div className="preview-info-block">
                      <h4>
                        <CheckCircle2 size={16} /> Indications
                      </h4>
                      <ul className="preview-bullets">
                        {previewProduct.indications.filter(Boolean).map((pt, idx) => (
                          <li key={idx}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Usages & Storage */}
                  {(previewProduct.usages?.filter(Boolean).length > 0 || previewProduct.storage) && (
                    <div className="preview-info-block">
                      <h4>
                        <HelpCircle size={16} /> Usages & Storage
                      </h4>
                      {previewProduct.usages?.filter(Boolean).length > 0 && (
                        <ul className="preview-bullets" style={{ marginBottom: 8 }}>
                          {previewProduct.usages.filter(Boolean).map((pt, idx) => (
                            <li key={idx}>{pt}</li>
                          ))}
                        </ul>
                      )}
                      {previewProduct.storage && (
                        <p style={{ margin: 0, fontSize: 13, color: "var(--admin-text-muted)" }}>
                          <b>Storage:</b> {previewProduct.storage}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Product Poster */}
                  {previewProduct.images?.poster && (
                    <div className="preview-info-block">
                      <h4>
                        <FileText size={16} /> Product Information Poster
                      </h4>
                      <div
                        style={{
                          borderRadius: 8,
                          overflow: "hidden",
                          border: "1px solid var(--admin-border)",
                          background: "#fff",
                          marginTop: 6,
                        }}
                      >
                        <img
                          src={resolveImageUrl(previewProduct.images.poster, "", 800)}
                          alt="Product poster"
                          style={{ width: "100%", maxHeight: 420, objectFit: "contain" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Footer */}
            <div
              style={{
                padding: "14px 24px",
                background: "#f7faf8",
                borderTop: "1px solid var(--admin-border)",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="admin-btn admin-btn-primary"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          DELETE CONFIRMATION DIALOG
      ══════════════════════════════════════════════════════════════════════ */}
      {deleteConfirmProduct && (
        <div
          className="admin-modal-overlay"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
        >
          <div
            className="admin-modal-card"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            style={{ maxWidth: 460, padding: 24, textAlign: "center" }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "#fef2f2",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Trash2 size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px", color: "#1c2e22" }}>
              Delete Product?
            </h3>
            <p style={{ fontSize: 13.5, color: "#667c6d", margin: "0 0 20px", lineHeight: 1.5 }}>
              Are you sure you want to permanently delete <b>"{deleteConfirmProduct.name}"</b>?
              This action cannot be undone and will remove it from the catalogue database.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmProduct(null)}
                className="admin-btn admin-btn-outline"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                className="admin-btn admin-btn-primary"
                style={{ background: "#dc2626", borderColor: "#dc2626", flex: 1 }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
