import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

/**
 * After a page change inside the app, focus moves to the page's h1, so keyboard and screen
 * reader users start at the new content. A page that is loaded directly keeps the browser's
 * own start, so the skip link stays the first focus stop.
 */
export function useFocusHeadingOnNavigate() {
  const location = useLocation();
  const firstKey = useRef(location.key);

  useEffect(() => {
    // Compare keys instead of counting renders: StrictMode runs effects twice in development.
    if (location.key === firstKey.current) return;
    document.querySelector<HTMLElement>("main h1")?.focus();
  }, [location.key]);
}
