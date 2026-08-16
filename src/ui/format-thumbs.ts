// ============================================================================
// SVG thumbnails for shape & color-mode card selectors.
// Keep colours neutral — the cards communicate *form*, not colour.
// ============================================================================

/** Pill shape: rounded ends, circle icon placeholder, text bar */
export const THUMB_PILL = `<svg width="88" height="36" viewBox="0 0 88 36" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="6" width="80" height="24" rx="12" class="svg-bg"/>
  <circle cx="20" cy="18" r="6" class="svg-fg"/>
  <rect x="31" y="16" width="34" height="4" rx="2" class="svg-fg"/>
</svg>`;

/** Rectangle shape: moderate corner radius */
export const THUMB_RECT = `<svg width="88" height="36" viewBox="0 0 88 36" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="6" width="80" height="24" rx="5" class="svg-bg"/>
  <rect x="14" y="13" width="10" height="10" rx="2" class="svg-fg"/>
  <rect x="28" y="16" width="34" height="4" rx="2" class="svg-fg"/>
</svg>`;

/** Flat shape: sharp corners, no rounding */
export const THUMB_FLAT = `<svg width="88" height="36" viewBox="0 0 88 36" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="6" width="80" height="24" rx="0" class="svg-bg"/>
  <rect x="14" y="13" width="10" height="10" rx="0" class="svg-fg"/>
  <rect x="28" y="16" width="34" height="4" rx="0" class="svg-fg"/>
</svg>`;

/** Subtle color mode: soft/pastel background with muted icon */
export const THUMB_SOFT = `<svg width="88" height="36" viewBox="0 0 88 36" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="6" width="80" height="24" rx="12" class="svg-bg"/>
  <circle cx="20" cy="18" r="6" class="svg-fg"/>
  <rect x="31" y="16" width="34" height="4" rx="2" class="svg-fg"/>
</svg>`;

/** Solid color mode: vivid/saturated background with light elements */
export const THUMB_SOLID = `<svg width="88" height="36" viewBox="0 0 88 36" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="6" width="80" height="24" rx="12" class="svg-solid-bg"/>
  <circle cx="20" cy="18" r="6" class="svg-solid-fg"/>
  <rect x="31" y="16" width="34" height="4" rx="2" class="svg-solid-fg"/>
</svg>`;

/** Simple/Outline color mode: semi-transparent background, solid border */
export const THUMB_SIMPLE = `<svg width="88" height="36" viewBox="0 0 88 36" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="6" width="80" height="24" rx="12" class="svg-line" stroke-width="1.5"/>
  <circle cx="20" cy="18" r="6" class="svg-fg"/>
  <rect x="31" y="16" width="34" height="4" rx="2" class="svg-fg"/>
</svg>`;
