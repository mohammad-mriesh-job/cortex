import { useEffect } from 'react';

// Pixels scrolled per key press. Key auto-repeat then gives smooth continuous
// scrolling, matching the browser's native arrow-key feel but a touch faster.
const STEP = 80;

// Elements that consume arrow keys for their own purpose — never hijack those.
const INTERACTIVE_ROLES =
  '[role="listbox"],[role="option"],[role="menu"],[role="menuitem"],' +
  '[role="tablist"],[role="tab"],[role="grid"],[role="slider"],[role="spinbutton"],' +
  '[role="combobox"],[role="radiogroup"],[role="radio"],[role="tree"]';

function isInteractiveTarget(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if ((el as HTMLElement).isContentEditable) return true;
  return !!el.closest(INTERACTIVE_ROLES);
}

/**
 * Scroll the window on ArrowDown/ArrowUp even when focus sits on a button or
 * link (the browser only arrow-scrolls when the body itself is focused). Stays
 * out of the way of text fields, dropdowns, tabs, sliders and other widgets
 * that navigate with arrows.
 */
export function KeyboardScroll() {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
      if (e.defaultPrevented) return;
      if (isInteractiveTarget(document.activeElement)) return;

      e.preventDefault();
      window.scrollBy({ top: e.key === 'ArrowDown' ? STEP : -STEP });
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return null;
}
