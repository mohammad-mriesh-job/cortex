import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scroll to top on route change, or to the hash target if present. */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname, hash]);

  return null;
}
