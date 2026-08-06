import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const STORE_KEY = "iaa_scroll_positions";

const DETAIL_ROUTES = [
  /^\/artwork\//,
  /^\/artist\//,
  /^\/gallery\/.+/,
  /^\/order\/success/,
  /^\/order\/failure/,
  /^\/login/,
  /^\/checkout/,
  /^\/sell/,
];

function isDetailPath(pathname) {
  return DETAIL_ROUTES.some((re) => re.test(pathname));
}

function loadStore() {
  try {
    return JSON.parse(sessionStorage.getItem(STORE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveStore(store) {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch { /* private mode */ }
}

/**
 * ScrollManager — restores the previous scroll position when returning to a
 * list/browsing route and scrolls to top when landing on a detail route.
 * Place inside <Router>.
 */
export default function ScrollManager() {
  const { pathname } = useLocation();
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    const prev = prevPathRef.current;
    if (prev !== pathname) {
      const store = loadStore();

      // Persist scroll of the page we're leaving.
      if (prev && !isDetailPath(prev)) {
        store[prev] = window.scrollY;
        saveStore(store);
      }

      // Restore or reset on arrival.
      const wasDetail = isDetailPath(prev);
      const isDetail = isDetailPath(pathname);

      const apply = () => {
        if (isDetail || wasDetail) {
          window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        } else {
          const saved = store[pathname];
          window.scrollTo({ top: saved || 0, left: 0, behavior: "auto" });
        }
      };

      // Two rAFs so the freshly-mounted content has laid out.
      requestAnimationFrame(() => requestAnimationFrame(apply));

      prevPathRef.current = pathname;
    }
  }, [pathname]);

  return null;
}
