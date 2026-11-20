import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, search } = useLocation();
  const prevKeyRef = useRef("");

  // Exclude in-page tab query params (e.g. ?tab=composition on ProductDetails) so switching tabs never jumps to top
  const params = new URLSearchParams(search);
  params.delete("tab");
  const normalizedSearch = params.toString();
  const scrollKey = `${pathname}?${normalizedSearch}`;

  useEffect(() => {
    if (prevKeyRef.current === scrollKey) return;
    prevKeyRef.current = scrollKey;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [scrollKey]);

  return null;
}
