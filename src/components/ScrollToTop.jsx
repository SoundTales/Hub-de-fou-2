import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // Force instant scroll, ignoring CSS scroll-behavior: smooth
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    // Restore smooth scroll after a small delay if needed, or just leave it to CSS
    // But to be safe and ensure next user scroll is smooth if they want:
    setTimeout(() => {
      document.documentElement.style.scrollBehavior = '';
    }, 0);
  }, [pathname]);

  return null;
}
