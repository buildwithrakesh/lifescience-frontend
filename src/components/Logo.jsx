import React from "react";
import { Link } from "react-router-dom";
import desktopLogo from "../assets/vetora-logo.webp";
import mobileLogo from "../assets/vetora-mobile-logo.webp";

export default function Logo({ light = false }) {
  return (
    <Link
      className={`logo logo-brand-link ${light ? "logo-footer" : ""}`}
      to="/"
      aria-label="Life Science Pharmaceutical home"
    >
      <img
        src={desktopLogo}
        alt="Life Science Pharmaceutical"
        className="desktop-logo-img"
        loading={light ? "lazy" : "eager"}
        decoding="async"
      />
      <img
        src={mobileLogo}
        alt="Life Science Pharmaceutical"
        className="mobile-logo-img"
        loading={light ? "lazy" : "eager"}
        decoding="async"
      />
    </Link>
  );
}
