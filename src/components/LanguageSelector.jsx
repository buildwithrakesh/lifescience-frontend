import React, { useState, useEffect, useRef } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";

const LANGUAGES = [
  {
    code: "en",
    label: "English",
  },
  {
    code: "hi",
    label: "हिन्दी",
  },
];

export default function LanguageSelector({ isMobileDrawer = false, onSelectCallback }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(() => {
    try {
      const saved = localStorage.getItem("life_science_lang");
      if (saved) return saved;
      if (typeof document !== "undefined" && document.cookie.includes("googtrans=/en/hi")) {
        return "hi";
      }
    } catch (e) {}
    return "en";
  });

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const applyLanguage = (code) => {
    try {
      const cookieVal = code === "en" ? "/en/en" : `/en/${code}`;

      // 1. Set cookies in all variations
      document.cookie = `googtrans=${cookieVal}; path=/;`;

      if (code === "en") {
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "googtrans=none; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "googtrans=/en/en; path=/;";
      }

      // Domain cookies if not localhost
      const hostname = window.location.hostname;
      if (hostname !== "localhost" && hostname !== "127.0.0.1") {
        document.cookie = `googtrans=${cookieVal}; domain=${hostname}; path=/;`;
        const domainParts = hostname.split(".");
        if (domainParts.length > 1) {
          document.cookie = `googtrans=${cookieVal}; domain=.${domainParts.slice(-2).join(".")}; path=/;`;
        }
      }

      localStorage.setItem("life_science_lang", code);
      setCurrentLang(code);
      setIsOpen(false);

      if (onSelectCallback) onSelectCallback();

      // If switching to non-English and Google Translate isn't loaded yet, trigger on-demand loader
      if (code !== "en" && typeof window.loadGoogleTranslate === "function") {
        window.loadGoogleTranslate();
      }

      // 2. Trigger Google Translate select combo directly
      const combo = document.querySelector(".goog-te-combo");
      if (combo) {
        if (code === "en") {
          let targetIndex = 0;
          for (let i = 0; i < combo.options.length; i++) {
            if (combo.options[i].value === "" || combo.options[i].value === "en") {
              targetIndex = i;
              break;
            }
          }
          combo.selectedIndex = targetIndex;
          combo.value = combo.options[targetIndex]?.value || "";
        } else {
          for (let i = 0; i < combo.options.length; i++) {
            if (combo.options[i].value === code || combo.options[i].value.includes(code)) {
              combo.selectedIndex = i;
              combo.value = combo.options[i].value;
              break;
            }
          }
        }

        if (typeof combo.onchange === "function") {
          combo.onchange();
        }
        combo.dispatchEvent(new Event("change", { bubbles: true }));
      }

      // 3. If switching back to English, also attempt restore
      if (code === "en") {
        try {
          const iframes = document.querySelectorAll("iframe.goog-te-banner-frame, iframe");
          iframes.forEach((ifr) => {
            try {
              const doc = ifr.contentDocument || ifr.contentWindow?.document;
              if (doc) {
                const restoreBtn = doc.querySelector("[id*='restore'], button");
                if (restoreBtn) restoreBtn.click();
              }
            } catch (e) {}
          });
        } catch (e) {}
      }

      // 4. Reliable reload fallback: Guarantees complete, clean translation across all components
      setTimeout(() => {
        window.location.reload();
      }, 150);
    } catch (err) {
      console.error("Language switch error:", err);
      window.location.reload();
    }
  };

  const activeLangObj = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  // ── Render Inside Mobile Sidebar Drawer ──
  if (isMobileDrawer) {
    return (
      <div className="sidebar-lang-card notranslate">
        <div className="sidebar-lang-head">
          <Globe size={16} />
          <span>Language / भाषा</span>
        </div>
        <div className="sidebar-lang-options">
          {LANGUAGES.map((l) => {
            const isSelected = l.code === currentLang;
            return (
              <button
                key={l.code}
                type="button"
                className={`sidebar-lang-btn ${isSelected ? "active" : ""}`}
                onClick={() => applyLanguage(l.code)}
              >
                <span className="lang-native-title">{l.label}</span>
                {isSelected && <Check size={16} className="lang-check-icon" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Render Inside Desktop / Mobile Header (Button + Menu Drawer) ──
  return (
    <div className="header-lang-wrapper notranslate" ref={dropdownRef}>
      <button
        type="button"
        className={`header-lang-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Choose Language / भाषा चुनें"
        aria-expanded={isOpen}
        title="Change Language"
      >
        <Globe size={16} className="lang-globe-icon" />
        <span className="lang-code-text">{activeLangObj.label}</span>
        <ChevronDown size={14} className={`lang-chevron ${isOpen ? "open" : ""}`} />
      </button>

      {isOpen && (
        <div className="header-lang-drawer" role="menu">
          <div className="lang-drawer-list">
            {LANGUAGES.map((l) => {
              const isSelected = l.code === currentLang;
              return (
                <button
                  key={l.code}
                  type="button"
                  className={`lang-drawer-item ${isSelected ? "selected" : ""}`}
                  onClick={() => applyLanguage(l.code)}
                  role="menuitem"
                >
                  <span className="lang-item-title">{l.label}</span>
                  {isSelected && (
                    <span className="lang-item-check">
                      <Check size={14} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
