import React, { useState, useRef } from "react";
import {
  FlaskConical, Cog, Package, ShieldCheck,
  ChevronLeft, ChevronRight, Play, ArrowRight
} from "lucide-react";
import { handleAnchor } from "../utils/scroll";

import step1Img from "../assets/process/step1-img.webp";
import step2Img from "../assets/process/step2-img.webp";
import step3Img from "../assets/process/step3-img.webp";
import step4Img from "../assets/process/step4-img.webp";

export const processSteps = [
  {
    id: "step-1",
    num: "01",
    title: "Quality Evaluation",
    sub: "Trusted testing for superior quality.",
    desc: "Rigorous laboratory testing, raw material validation, and batch analysis conducted under strict quality protocols.",
    Icon: FlaskConical,
    img: step1Img
  },
  {
    id: "step-2",
    num: "02",
    title: "Quality Production",
    sub: "Advanced manufacturing for consistent quality.",
    desc: "Precision manufacturing adhering to international GMP standards, controlled environments, and modern formulation equipment.",
    Icon: Cog,
    img: step2Img
  },
  {
    id: "step-3",
    num: "03",
    title: "Product Packaging",
    sub: "Safe & secure packaging for freshness.",
    desc: "Tamper-evident seals, moisture-barrier multi-layer containers, and light-protective materials preserving vital nutrients.",
    Icon: Package,
    img: step3Img
  },
  {
    id: "step-4",
    num: "04",
    title: "Care That Reaches You",
    sub: "Reliable delivery for healthier animals.",
    desc: "Temperature-managed pan-India supply chain delivering directly to dairy farms, veterinary clinics, and pet owners.",
    Icon: ShieldCheck,
    img: step4Img
  }
];

export default function ProcessSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const currentStep = processSteps[activeStep];

  const nextStep = () => {
    setActiveStep((prev) => (prev + 1) % processSteps.length);
  };

  const prevStep = () => {
    setActiveStep((prev) => (prev - 1 + processSteps.length) % processSteps.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextStep();
      } else {
        prevStep();
      }
    }
  };

  // On mobile: the 3 secondary cards show the OTHER steps (matching Image 1 layout)
  const secondarySteps = processSteps.filter((_, idx) => idx !== activeStep);

  return (
    <section className="process-new-section" id="process">
      {/* ── Subdued decorative background paw print watermarks ── */}
      <div className="process-bg-paws" aria-hidden="true">
        <span className="paw-mark paw-1">🐾</span>
        <span className="paw-mark paw-2">🐾</span>
        <span className="paw-mark paw-3">🐾</span>
      </div>
      <div className="process-bg-wave" aria-hidden="true" />

      <div className="container">
        {/* ════════════════════════════════════════════
            DESKTOP SPLIT WRAPPER (Intro on Left, 4 Cards on Right)
            Matches Desktop Image 2 Reference
            ════════════════════════════════════════════ */}
        <div className="process-desktop-split">
          {/* ── Section Header (Intro Left on Desktop) ── */}
          <div className="process-intro">
            <h2 className="process-headline">
              Care is a process.<br />
              <em>We respect every step.</em>
            </h2>

            <p className="process-subhead">
              From rigorous quality checks to reliable delivery, Life Science ensures
              uncompromising care at every stage.
            </p>

            <a href="#about" onClick={handleAnchor} className="process-cta-btn">
              Learn more about our approach <ArrowRight size={15} />
            </a>
          </div>

          {/* ── Desktop 4-Card Carousel/Grid on Right ── */}
          <div className="process-desktop-layout">
            <div className="process-desktop-nav">
              <button
                className="process-round-arrow"
                onClick={prevStep}
                aria-label="Previous step"
              >
                <ChevronLeft size={18} strokeWidth={2.4} />
              </button>
              <button
                className="process-round-arrow active"
                onClick={nextStep}
                aria-label="Next step"
              >
                <ChevronRight size={18} strokeWidth={2.4} />
              </button>
            </div>

            <div className="process-desktop-grid">
              {processSteps.map((step, idx) => {
                const StepIcon = step.Icon;
                const isSelected = idx === activeStep;
                return (
                  <article
                    key={step.id}
                    className={`process-card-desktop ${isSelected ? "selected" : ""}`}
                    onClick={() => setActiveStep(idx)}
                  >
                    <div className="process-card-media">
                      <img
                        src={step.img}
                        alt={step.title}
                        loading="lazy"
                        decoding="async"
                      />
                      <button
                        className="process-play-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveStep(idx);
                          setIsPlayingVideo(true);
                        }}
                        aria-label={`Play preview for ${step.title}`}
                      >
                        <Play size={16} fill="#0d4a2d" />
                      </button>
                    </div>

                    <div className="process-card-body">
                      <div className="process-step-icon">
                        <StepIcon size={24} strokeWidth={2.2} />
                      </div>
                      <h3 className="process-step-title">{step.title}</h3>
                      <p className="process-step-sub">{step.sub}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════
            MOBILE LAYOUT (Image 1: Featured + 3 Cards)
            ════════════════════════════════════════════ */}
        <div className="process-mobile-layout">
          {/* Main Featured Active Card */}
          <div
            className="process-mobile-featured-wrapper"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <button
              className="process-mobile-nav-arrow arrow-left"
              onClick={prevStep}
              aria-label="Previous step"
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>

            <article className="process-featured-card">
              <div className="process-featured-media">
                <img
                  src={currentStep.img}
                  alt={currentStep.title}
                  loading="lazy"
                  decoding="async"
                />
                <button
                  className="process-play-btn-large"
                  onClick={() => setIsPlayingVideo(true)}
                  aria-label="Play step video"
                >
                  <Play size={18} fill="#0d4a2d" />
                </button>
              </div>

              <div className="process-featured-body">
                <div className="process-featured-icon">
                  <currentStep.Icon size={28} strokeWidth={2.2} />
                </div>
                <h3 className="process-featured-title">{currentStep.title}</h3>
                <p className="process-featured-sub">{currentStep.sub}</p>
              </div>
            </article>

            <button
              className="process-mobile-nav-arrow arrow-right"
              onClick={nextStep}
              aria-label="Next step"
            >
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="process-dots-indicator">
            {processSteps.map((_, i) => (
              <button
                key={i}
                className={`process-dot ${i === activeStep ? "active" : ""}`}
                onClick={() => setActiveStep(i)}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          {/* Bottom 3 Preview Cards Row (Clean, Not Messy) */}
          <div className="process-mobile-bottom-row">
            {secondarySteps.map((step) => {
              const StepIcon = step.Icon;
              const originalIndex = processSteps.findIndex((s) => s.id === step.id);
              return (
                <div
                  key={step.id}
                  className="process-mobile-subcard"
                  onClick={() => setActiveStep(originalIndex)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="process-subcard-icon">
                    <StepIcon size={26} strokeWidth={2.2} />
                  </div>
                  <b className="process-subcard-title">{step.title}</b>
                  <span className="process-subcard-sub">{step.sub}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Optional Video/Step Modal ── */}
      {isPlayingVideo && (
        <div className="process-modal-backdrop" onClick={() => setIsPlayingVideo(false)}>
          <div className="process-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="process-modal-header">
              <div className="process-modal-tag">STEP {currentStep.num}</div>
              <h3>{currentStep.title}</h3>
              <button
                className="process-modal-close"
                onClick={() => setIsPlayingVideo(false)}
              >
                ✕
              </button>
            </div>
            <div className="process-modal-media">
              <img src={currentStep.img} alt={currentStep.title} />
              <div className="process-modal-play-overlay">
                <div className="pulse-ring" />
                <Play size={36} fill="#fff" />
              </div>
            </div>
            <p className="process-modal-desc">{currentStep.desc}</p>
            <div className="process-modal-foot">
              <button
                className="button button-green"
                onClick={() => setIsPlayingVideo(false)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
