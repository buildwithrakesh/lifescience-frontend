import React, { useState, useEffect, useRef } from "react";
import { Star, CheckCircle, ThumbsUp, ChevronLeft, ChevronRight, Send, MessageSquarePlus, X, Clock } from "lucide-react";
import { API_BASE_URL } from "../utils/api";

const INITIAL_REVIEWS = [
  {
    id: "rev-1",
    name: "Ramesh Kumar",
    location: "Karnal, Haryana",
    product: "Life Science Milk Booster & Calci-Gel",
    rating: 5,
    date: "3 days ago",
    title: "Noticeable increase in milk yield",
    comment: "Saw a steady 2L/day increase per cow within 2 weeks of using Calci-Gel. Post-calving recovery was smooth and cattle energy is noticeably better.",
    verified: true,
    helpful: 48
  },
  {
    id: "rev-2",
    name: "Dr. Aniruddh Deshmukh",
    location: "Kolhapur, Maharashtra",
    product: "Life Science Liv-Pro Herbal",
    rating: 5,
    date: "1 week ago",
    title: "Effective for acute liver recovery",
    comment: "Consistent bioavailability and rapid clinical turnaround in livestock experiencing loss of appetite and sluggish digestion. High pharmaceutical standards.",
    verified: true,
    helpful: 62
  },
  {
    id: "rev-3",
    name: "Sunder Singh",
    location: "Namakkal, Tamil Nadu",
    product: "Life Science Poultry Multivitamin",
    rating: 5,
    date: "2 weeks ago",
    title: "Reduced summer heat stress in flock",
    comment: "Flock mortality dropped significantly during hot days. Eggshell firmness in our layer batch improved noticeably with fewer breakages.",
    verified: true,
    helpful: 31
  },
  {
    id: "rev-4",
    name: "Priya Sharma",
    location: "Bengaluru, Karnataka",
    product: "Life Science Pet Joint Care",
    rating: 5,
    date: "3 weeks ago",
    title: "Bruno's mobility is completely back!",
    comment: "My 9-year-old Labrador had severe joint stiffness and avoided stairs. After 3 weeks of Arthro-Pet syrup, he is active, walking comfortably, and happy again.",
    verified: true,
    helpful: 19
  },
  {
    id: "rev-5",
    name: "Balwant Patel",
    location: "Anand, Gujarat",
    product: "Life Science Mineral Mixture",
    rating: 5,
    date: "1 month ago",
    title: "High quality mineral mix for cattle & goats",
    comment: "Animals consume it without hesitation. Coat shine improved and young calves are gaining weight steadily. Prompt, secure delivery.",
    verified: true,
    helpful: 27
  },
  {
    id: "rev-6",
    name: "Vikas Yadav",
    location: "Meerut, UP",
    product: "Life Science Ionic Calcium Gel",
    rating: 5,
    date: "1 month ago",
    title: "Best post-calving energy gel",
    comment: "Restores ionic calcium within hours and prevents milk fever. A must-have supplement for commercial dairy herds.",
    verified: true,
    helpful: 35
  }
];

export default function ReviewSection({ onToast }) {
  const [reviews, setReviews] = useState(() => {
    try {
      const cached = localStorage.getItem("life_science_approved_reviews");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_REVIEWS;
  });

  const scrollTrackRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const [mobileFormOpen, setMobileFormOpen] = useState(false);
  const [helpfulClicked, setHelpfulClicked] = useState({});

  // Simple Form State
  const [authorName, setAuthorName] = useState("");
  const [location, setLocation] = useState("");
  const [productName, setProductName] = useState("Life Science Milk Booster");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState("");

  // Fetch approved reviews from backend (Strict moderation: only approved reviews shown publicly)
  useEffect(() => {
    let isMounted = true;
    async function loadApprovedReviews() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/reviews`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0 && isMounted) {
          setReviews(json.data);
          try {
            localStorage.setItem("life_science_approved_reviews", JSON.stringify(json.data));
          } catch (e) {}
        }
      } catch (err) {
        console.warn("Could not fetch approved reviews:", err);
      }
    }
    loadApprovedReviews();
    return () => {
      isMounted = false;
    };
  }, []);

  const scrollReviews = (direction) => {
    if (!scrollTrackRef.current) return;
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 760;
    const scrollAmount = isMobile ? scrollTrackRef.current.clientWidth * 0.84 : 330;
    scrollTrackRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        scrollReviews("right");
      } else {
        scrollReviews("left");
      }
    }
  };

  const handleHelpful = (id) => {
    if (helpfulClicked[id]) return;
    setHelpfulClicked((prev) => ({ ...prev, [id]: true }));
    setReviews((prev) =>
      prev.map((r) => (r.id === id || r._id === id ? { ...r, helpful: (r.helpful || 0) + 1 } : r))
    );
    fetch(`${API_BASE_URL}/api/reviews/${id}/helpful`, { method: "PATCH" }).catch(() => {});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authorName.trim() || !reviewText.trim()) {
      setFormError("Please enter your name and feedback.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    setSubmitSuccessMsg("");

    const newRev = {
      name: authorName.trim(),
      location: location.trim() || "India",
      product: productName.trim() || "Life Science Veterinary Product",
      rating: rating,
      title: reviewTitle.trim() || "Verified Customer Review",
      comment: reviewText.trim(),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRev),
      });
      const data = await res.json();

      if (data.success) {
        setSubmitSuccessMsg("✓ Thank you! Your review has been submitted for verification. It will appear on the storefront once verified by our team.");
        if (onToast) {
          onToast(`Thank you, ${newRev.name}! Review submitted for admin verification.`);
        }

        // Reset Form
        setAuthorName("");
        setLocation("");
        setReviewTitle("");
        setReviewText("");
        setFormError("");
        setMobileFormOpen(false);
      } else {
        setFormError(data.message || "Failed to submit review.");
      }
    } catch (err) {
      setFormError("Network error submitting review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="reviews-section" id="reviews">
      <div className="container">
        {/* ════════════════════════════════════════════════════════════
            SPLIT LAYOUT: LEFT = SUBMIT FORM | RIGHT = SCROLLABLE REVIEWS
            ════════════════════════════════════════════════════════════ */}
        <div className="reviews-split-layout">
          {/* ── LEFT COLUMN: REVIEW SUBMIT FORM (Desktop Always Visible, Mobile Toggleable) ── */}
          <div className="reviews-form-column">
            {/* Mobile Toggle Trigger */}
            <div className="reviews-mobile-toggle-bar">
              <div>
                <span className="reviews-eyebrow">CUSTOMER REVIEWS</span>
                <h2 className="reviews-title">What Customers Say</h2>
              </div>
              <button
                type="button"
                className="reviews-mobile-toggle-btn"
                onClick={() => setMobileFormOpen(!mobileFormOpen)}
              >
                {mobileFormOpen ? <X size={15} /> : <MessageSquarePlus size={15} />}
                <span>{mobileFormOpen ? "Close Form" : "Write Review"}</span>
              </button>
            </div>

            <div className={`reviews-form-card ${mobileFormOpen ? "mobile-open" : ""}`}>
              <div className="reviews-form-head">
                <div>
                  <span className="reviews-form-tag">SUBMIT FEEDBACK</span>
                  <h3 className="reviews-form-title">Write a Review</h3>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="reviews-simple-form">
                {/* Rating Stars */}
                <div className="form-group-clean">
                  <label className="clean-label">Rating *</label>
                  <div className="clean-star-picker">
                    {[1, 2, 3, 4, 5].map((starVal) => {
                      const isFilled = (hoverRating || rating) >= starVal;
                      return (
                        <button
                          type="button"
                          key={starVal}
                          className="clean-star-btn"
                          onMouseEnter={() => setHoverRating(starVal)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(starVal)}
                          aria-label={`${starVal} stars`}
                        >
                          <Star
                            size={20}
                            fill={isFilled ? "#f59e0b" : "none"}
                            stroke="#f59e0b"
                            strokeWidth={2}
                          />
                        </button>
                      );
                    })}
                    <span className="clean-star-hint">
                      {rating === 5 && "5 - Excellent"}
                      {rating === 4 && "4 - Good"}
                      {rating === 3 && "3 - Average"}
                      {rating === 2 && "2 - Poor"}
                      {rating === 1 && "1 - Terrible"}
                    </span>
                  </div>
                </div>

                {/* Name & Location */}
                <div className="form-row-2col">
                  <div className="form-group-clean">
                    <label className="clean-label">Your Name *</label>
                    <input
                      type="text"
                      className="clean-input"
                      placeholder="e.g. Ramesh Patel"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group-clean">
                    <label className="clean-label">City, State</label>
                    <input
                      type="text"
                      className="clean-input"
                      placeholder="e.g. Karnal, Haryana"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                {/* Product & Headline */}
                <div className="form-row-2col">
                  <div className="form-group-clean">
                    <label className="clean-label">Product Used</label>
                    <input
                      type="text"
                      className="clean-input"
                      placeholder="e.g. Life Science Milk Booster"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                    />
                  </div>

                  <div className="form-group-clean">
                    <label className="clean-label">Review Headline</label>
                    <input
                      type="text"
                      className="clean-input"
                      placeholder="e.g. Highly effective"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                    />
                  </div>
                </div>

                {/* Comments */}
                <div className="form-group-clean">
                  <label className="clean-label">Your Feedback *</label>
                  <textarea
                    rows={3}
                    className="clean-textarea"
                    placeholder="Share your experience with this product..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                  />
                </div>

                {formError && <p className="clean-error">{formError}</p>}

                {submitSuccessMsg && (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: "#ecfdf5",
                      border: "1px solid #a7f3d0",
                      color: "#065f46",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                      lineHeight: 1.45,
                    }}
                  >
                    <Clock size={16} style={{ flexShrink: 0, marginTop: 2, color: "#059669" }} />
                    <span>{submitSuccessMsg}</span>
                  </div>
                )}

                <button type="submit" disabled={isSubmitting} className="button button-green clean-submit-btn">
                  <Send size={14} /> {isSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          </div>

          {/* ── RIGHT COLUMN: REVIEWS TRACK + SCROLL BUTTONS ── */}
          <div className="reviews-carousel-column">
            {/* Top Bar with Overall Score & Scroll Navigation Buttons */}
            <div className="reviews-carousel-topbar">
              <div className="reviews-score-summary">
                <span className="score-big">4.9</span>
                <div>
                  <div className="stars-row-gold">
                    {"★★★★★".split("").map((s, i) => (
                      <span key={i}>{s}</span>
                    ))}
                  </div>
                  <span className="score-label">Based on 2,800+ verified reviews</span>
                </div>
              </div>

              {/* Scrollable Navigation Buttons (< and >) */}
              <div className="reviews-scroll-nav">
                <button
                  type="button"
                  className="review-arrow-btn"
                  onClick={() => scrollReviews("left")}
                  aria-label="Scroll reviews left"
                >
                  <ChevronLeft size={18} strokeWidth={2.4} />
                </button>
                <button
                  type="button"
                  className="review-arrow-btn"
                  onClick={() => scrollReviews("right")}
                  aria-label="Scroll reviews right"
                >
                  <ChevronRight size={18} strokeWidth={2.4} />
                </button>
              </div>
            </div>

            {/* Scrollable Cards Track with Native & Touch Swipe Support */}
            <div
              className="reviews-scroll-track"
              ref={scrollTrackRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {reviews.map((rev) => (
                <article key={rev.id} className="review-carousel-card">
                  <div className="rev-card-header">
                    <div className="rev-stars-gold">
                      {"★".repeat(rev.rating)}
                    </div>
                    <span className="rev-date">{rev.date}</span>
                  </div>

                  {rev.title && <h4 className="rev-headline">{rev.title}</h4>}

                  <p className="rev-body">"{rev.comment}"</p>

                  <div className="rev-footer">
                    <div className="rev-author">
                      <div className="rev-name-row">
                        <b>{rev.name}</b>
                        {rev.verified && (
                          <span className="rev-verified-pill" title="Verified Customer">
                            <CheckCircle size={11} /> Verified
                          </span>
                        )}
                      </div>
                      {rev.location && <span className="rev-location">{rev.location}</span>}
                      {rev.product && <span className="rev-product-badge">{rev.product}</span>}
                    </div>

                    <button
                      className={`rev-helpful-action ${helpfulClicked[rev.id] ? "active" : ""}`}
                      onClick={() => handleHelpful(rev.id)}
                      title="Helpful vote"
                    >
                      <ThumbsUp size={12} />
                      <span>{rev.helpful}</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
