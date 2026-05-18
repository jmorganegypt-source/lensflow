import { useEffect } from "react";

/**
 * Sets document.title for the current page and restores the previous title on unmount.
 * Use to give each marketing route a distinct browser-tab label.
 */
export default function useDocTitle(title) {
  useEffect(() => {
    if (!title) return;
    const prev = document.title;
    document.title = title;
    return () => { document.title = prev; };
  }, [title]);
}
