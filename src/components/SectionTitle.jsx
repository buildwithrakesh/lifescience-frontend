import React from "react";
import { ArrowRight } from "lucide-react";
import { handleAnchor } from "../utils/scroll";

export default function SectionTitle({ eyebrow, title, sub, link }) {
  return (
    <div className="section-title">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
      {link && (
        <a className="text-link" href="#products" onClick={handleAnchor}>
          <span className="desktop-link-text">{link}</span>
          <span className="mobile-link-text">See All</span>
          <ArrowRight size={16}/>
        </a>
      )}
    </div>
  );
}
