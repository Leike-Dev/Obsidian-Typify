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

// ============================================================================
// HARMONY TYPE THUMBNAILS (for palette generator cards)
// Fixed colors to visually communicate the harmony concept.
// ============================================================================

/** Shades (Degradê): monochromatic lightness variations */
export const THUMB_SHADES = `<svg width="88" height="48" viewBox="0 0 88 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="8" width="80" height="32" rx="12" fill="#EEEDFE"/>
  <circle cx="26" cy="24" r="8" fill="#CECBF6"/>
  <circle cx="38" cy="24" r="8" fill="#AFA9EC"/>
  <circle cx="50" cy="24" r="8" fill="#7F77DD"/>
  <circle cx="62" cy="24" r="8" fill="#534AB7"/>
</svg>`;

/** Analogous: adjacent colors on the color wheel */
export const THUMB_ANALOGOUS = `<svg width="88" height="48" viewBox="0 0 88 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="8" width="80" height="32" rx="12" fill="#EEEDFE"></rect>
  <circle cx="38" cy="28.5" r="8" fill="#CECBF6" stroke="#EEEDFE" stroke-width="1.5"></circle>
  <circle cx="50" cy="28.5" r="8" fill="#7F77DD" stroke="#EEEDFE" stroke-width="1.5"></circle>
  <circle cx="44" cy="19.5" r="8" fill="#AFA9EC" stroke="#EEEDFE" stroke-width="1.5"></circle>
</svg>`;

/** Complementary: opposite hues with separator */
export const THUMB_COMPLEMENTARY = `<svg width="88" height="48" viewBox="0 0 88 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="8" width="80" height="32" rx="12" fill="#F1EFE8"/>
  <circle cx="32" cy="24" r="10" fill="#AFA9EC"/>
  <circle cx="56" cy="24" r="10" fill="#B4B2A9"/>
  <rect x="42" y="10" width="4" height="28" rx="2" fill="#F1EFE8"/>
</svg>`;

/** Random: scattered colors */
export const THUMB_RANDOM = `<svg width="88" height="48" viewBox="0 0 88 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="8" width="80" height="32" rx="12" fill="#EEEDFE"/>
  <circle cx="26" cy="24" r="8" fill="#534AB7"/>
  <circle cx="38" cy="24" r="8" fill="#CECBF6"/>
  <circle cx="62" cy="24" r="8" fill="#7F77DD"/>
  <circle cx="50" cy="24" r="8" fill="#AFA9EC"/>
</svg>`;

