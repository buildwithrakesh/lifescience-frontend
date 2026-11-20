import React from "react";

export default function PartnerBannerSection() {
  // Hidden for client MVP review as requested (not deleted, easy to unhide)
  return null;

  const phoneUrl = "tel:+918094730645";
  const whatsappUrl =
    "https://wa.me/918094730645?text=Hello%20Life%20Science%20Team%2C%20I%20am%20interested%20in%20partnering%20with%20you.";

  return (
    <section className="partner-banner-section" id="partner">
      <div className="partner-banner-container">
        {/* Banner Outer Wrapper (Centered on desktop) */}
        <div className="partner-banner-wrapper">
          {/* Top-Right Celebratory 3 Sparks */}
          <div className="partner-banner-sparks" aria-hidden="true">
            <svg
              className="partner-sparks-svg"
              viewBox="0 0 36 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="4"
                y1="16"
                x2="3"
                y2="4"
                stroke="#b6f34e"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <line
                x1="16"
                y1="22"
                x2="19"
                y2="7"
                stroke="#b6f34e"
                strokeWidth="3.4"
                strokeLinecap="round"
              />
              <line
                x1="26"
                y1="25"
                x2="33"
                y2="18"
                stroke="#b6f34e"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Main Pill Banner (Pure Code with Exact Textures & Design) */}
          <div className="partner-pill-banner">
            {/* Luminous Corner Waves (SVG Textures) */}
            <svg
              className="partner-wave-texture"
              viewBox="0 0 940 120"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="blGlowGrad" x1="0%" y1="100%" x2="45%" y2="0%">
                  <stop offset="0%" stopColor="#2ea65a" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#196a36" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#08341b" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="brGlowGrad" x1="100%" y1="100%" x2="55%" y2="0%">
                  <stop offset="0%" stopColor="#2ea65a" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#196a36" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#08341b" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="curveLine" x1="0%" y1="100%" x2="40%" y2="0%">
                  <stop offset="0%" stopColor="#48d37a" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#176332" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Bottom-left smooth wave curves */}
              <path
                d="M-20 125 C 40 115, 110 92, 175 58 C 225 32, 275 36, 310 52 C 255 85, 160 120, -20 125 Z"
                fill="url(#blGlowGrad)"
              />
              <path
                d="M-10 120 Q 100 88 180 55 T 310 50"
                stroke="url(#curveLine)"
                strokeWidth="1.8"
                fill="none"
              />

              {/* Bottom-right smooth wave curves */}
              <path
                d="M960 125 C 900 115, 830 82, 755 52 C 700 30, 650 38, 615 54 C 675 85, 780 120, 960 125 Z"
                fill="url(#brGlowGrad)"
              />
              <path
                d="M950 120 Q 840 78 745 48 T 615 52"
                stroke="url(#curveLine)"
                strokeWidth="1.8"
                fill="none"
              />
            </svg>

            {/* Left Section: 3D Handshake Badge + Divider + Text */}
            <div className="partner-left-content">
              {/* 3D Glassmorphic Badge */}
              <div className="partner-badge-wrapper">
                <div className="partner-badge-outer-bevel">
                  <div className="partner-badge-lime-disc">
                    {/* Exact Handshake & Rays Vector */}
                    <svg
                      className="partner-handshake-svg"
                      viewBox="0 0 45 45"
                      fill="#08341b"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-label="Partnership Handshake"
                    >
                      <path d="M24 13h1v1h-1zM24 14h1v1h-1zM24 15h1v1h-1zM15 16h2v1h-2zM24 16h1v1h-1zM32 16h2v1h-2zM16 17h2v1h-2zM24 17h1v1h-1zM31 17h2v1h-2zM17 18h2v1h-2zM30 18h2v1h-2zM18 19h1v1h-1zM30 19h2v1h-2zM11 22h1v1h-1zM10 23h3v1h-3zM36 23h3v1h-3zM10 24h5v1h-5zM20 24h3v1h-3zM26 24h4v1h-4zM35 24h4v1h-4zM9 25h2v1h-2zM14 25h2v1h-2zM17 25h19v1h-19zM38 25h2v1h-2zM8 26h2v1h-2zM13 26h6v1h-6zM23 26h2v1h-2zM31 26h5v1h-5zM39 26h1v1h-1zM8 27h2v1h-2zM13 27h2v1h-2zM22 27h2v1h-2zM35 27h1v1h-1zM39 27h2v1h-2zM7 28h2v1h-2zM12 28h2v1h-2zM21 28h2v1h-2zM35 28h2v1h-2zM40 28h2v1h-2zM7 29h2v1h-2zM12 29h2v1h-2zM20 29h2v1h-2zM26 29h1v1h-1zM36 29h1v1h-1zM41 29h1v1h-1zM6 30h2v1h-2zM11 30h2v1h-2zM19 30h2v1h-2zM25 30h4v1h-4zM36 30h2v1h-2zM41 30h2v1h-2zM6 31h1v1h-1zM11 31h1v1h-1zM19 31h2v1h-2zM24 31h2v1h-2zM28 31h2v1h-2zM37 31h1v1h-1zM42 31h1v1h-1zM5 32h2v1h-2zM10 32h2v1h-2zM20 32h4v1h-4zM29 32h2v1h-2zM37 32h2v1h-2zM42 32h2v1h-2zM5 33h3v1h-3zM10 33h1v1h-1zM30 33h2v1h-2zM38 33h1v1h-1zM41 33h2v1h-2zM7 34h4v1h-4zM31 34h2v1h-2zM38 34h4v1h-4zM8 35h4v1h-4zM32 35h2v1h-2zM37 35h4v1h-4zM11 36h2v1h-2zM14 36h4v1h-4zM33 36h2v1h-2zM36 36h2v1h-2zM12 37h3v1h-3zM17 37h2v1h-2zM34 37h3v1h-3zM12 38h2v1h-2zM17 38h3v1h-3zM30 38h1v1h-1zM35 38h1v1h-1zM12 39h2v1h-2zM16 39h1v1h-1zM19 39h2v1h-2zM30 39h2v1h-2zM35 39h2v1h-2zM12 40h2v1h-2zM15 40h2v1h-2zM19 40h3v1h-3zM31 40h2v1h-2zM35 40h1v1h-1zM13 41h3v1h-3zM18 41h2v1h-2zM21 41h2v1h-2zM27 41h2v1h-2zM33 41h2v1h-2zM15 42h1v1h-1zM17 42h2v1h-2zM22 42h2v1h-2zM28 42h2v1h-2zM33 42h1v1h-1zM15 43h3v1h-3zM21 43h6v1h-6zM29 43h5v1h-5zM17 44h1v1h-1zM20 44h1v1h-1zM24 44h4v1h-4zM30 44h2v1h-2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="partner-divider-line" aria-hidden="true" />

              {/* Title & Eyebrow */}
              <div className="partner-typography">
                <span className="partner-eyebrow-text">PARTNER WITH US</span>
                <div className="partner-heading-wrap">
                  <h3 className="partner-main-heading">
                    <span className="partner-heading-white">Become a </span>
                    <span className="partner-highlight-wrap">
                      <span className="partner-heading-lime">Partner</span>
                      {/* Exact Double Brush-stroke Underline under 'Partner' */}
                      <svg
                        className="partner-underline-svg"
                        viewBox="0 0 100 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M2 4.5 C 24 1.5, 68 1.5, 96 5.5"
                          stroke="#b6f34e"
                          strokeWidth="2.8"
                          strokeLinecap="round"
                        />
                        <path
                          d="M16 10 C 38 7.8, 65 7.8, 86 11"
                          stroke="#b6f34e"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </h3>
                </div>
              </div>
            </div>

            {/* Right Section: Call Us & WhatsApp Buttons */}
            <div className="partner-right-actions">
              {/* Call Us Button */}
              <a
                href={phoneUrl}
                className="partner-action-btn partner-btn-call"
                title="Call Life Science Support"
              >
                <svg
                  className="partner-btn-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
                <span className="partner-btn-text">Call Us</span>
                <span className="partner-btn-arrow">→</span>
              </a>

              {/* WhatsApp Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="partner-action-btn partner-btn-whatsapp"
                title="Chat on WhatsApp"
              >
                <svg
                  className="partner-btn-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.275-.1-.476-.15-.676.15-.2.301-.776.979-.952 1.18-.175.2-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.501-1.787-1.677-2.088-.175-.301-.019-.464.132-.614.135-.135.301-.351.451-.527.151-.175.2-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.677-1.632-.927-2.234-.244-.587-.492-.507-.677-.517l-.577-.01c-.2 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.508 0 1.48 1.078 2.909 1.229 3.11.15.2 2.122 3.24 5.14 4.544.718.31 1.278.496 1.716.635.72.229 1.376.197 1.895.12.578-.087 1.78-.727 2.03-1.43.25-.702.25-1.304.176-1.43-.076-.125-.276-.201-.577-.351z" />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.174L2.05 21.95l4.908-1.353A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.61 0-3.11-.47-4.38-1.28l-.31-.2-2.91.8.8-2.83-.2-.33A8.167 8.167 0 013.8 12c0-4.52 3.68-8.2 8.2-8.2s8.2 3.68 8.2 8.2-3.68 8.2-8.2 8.2z"
                  />
                </svg>
                <span className="partner-btn-text">WhatsApp</span>
                <span className="partner-btn-arrow">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
