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
  <rect x="4" y="8" width="80" height="32" rx="12" class="svg-bg"/>
  <circle cx="26" cy="24" r="8" class="svg-fg" opacity="0.25"/>
  <circle cx="38" cy="24" r="8" class="svg-fg" opacity="0.5"/>
  <circle cx="50" cy="24" r="8" class="svg-fg" opacity="0.75"/>
  <circle cx="62" cy="24" r="8" class="svg-fg" opacity="1"/>
</svg>`;

/** Analogous: adjacent colors on the color wheel */
export const THUMB_ANALOGOUS = `<svg width="88" height="48" viewBox="0 0 88 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="8" width="80" height="32" rx="12" class="svg-bg"></rect>
  <circle cx="38" cy="28.5" r="8" class="svg-fg svg-stroke" opacity="0.3" stroke-width="1.5"></circle>
  <circle cx="50" cy="28.5" r="8" class="svg-fg svg-stroke" opacity="1" stroke-width="1.5"></circle>
  <circle cx="44" cy="19.5" r="8" class="svg-fg svg-stroke" opacity="0.6" stroke-width="1.5"></circle>
</svg>`;

/** Complementary: opposite hues with separator */
export const THUMB_COMPLEMENTARY = `<svg width="88" height="48" viewBox="0 0 88 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="8" width="80" height="32" rx="12" class="svg-bg"/>
  <circle cx="32" cy="24" r="10" class="svg-fg"/>
  <circle cx="56" cy="24" r="10" class="svg-fg" opacity="0.3"/>
</svg>`;

/** Random: scattered colors */
export const THUMB_RANDOM = `<svg width="88" height="48" viewBox="0 0 88 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="8" width="80" height="32" rx="12" class="svg-bg"/>
  <circle cx="26" cy="24" r="8" class="svg-fg" opacity="1"/>
  <circle cx="38" cy="24" r="8" class="svg-fg" opacity="0.3"/>
  <circle cx="62" cy="24" r="8" class="svg-fg" opacity="0.8"/>
  <circle cx="50" cy="24" r="8" class="svg-fg" opacity="0.5"/>
</svg>`;

// ============================================================================
// Favicon Providers
// ============================================================================

export const THUMB_FAVICON_DIRECT = `<svg width="88" height="48" viewBox="0 0 88 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="8" width="80" height="32" rx="12" fill="#F1EFE8"/>
  <circle cx="44" cy="24" r="11" fill="#D3D1C7"/>
  <circle cx="44" cy="24" r="11" fill="none" stroke="#F1EFE8" stroke-width="1"/>
  <ellipse cx="44" cy="24" rx="5" ry="11" fill="none" stroke="#F1EFE8" stroke-width="1"/>
  <line x1="33" y1="24" x2="55" y2="24" stroke="#F1EFE8" stroke-width="1"/>
  <line x1="35" y1="19" x2="53" y2="19" stroke="#F1EFE8" stroke-width="0.8"/>
  <line x1="35" y1="29" x2="53" y2="29" stroke="#F1EFE8" stroke-width="0.8"/>
</svg>`;

export const THUMB_FAVICON_GOOGLE = `<svg width="88" height="48" viewBox="0 0 88 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="8" width="80" height="32" rx="12" fill="#E6F1FB"/>
  <svg x="33" y="13" width="22" height="22" viewBox="0 0 24 24">
    <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="#378ADD"/>
  </svg>
</svg>`;

export const THUMB_FAVICON_DUCKDUCKGO = `<svg width="88" height="48" viewBox="0 0 88 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="8" width="80" height="32" rx="12" fill="#EEEDFE"/>
  <svg x="33" y="13" width="22" height="22" viewBox="8 8 32 32">
    <circle cx="24" cy="24" r="16" fill="#AFA9EC"/>
    <path fill="#FFFFFF" d="M26,16.2c-0.6-0.6-1.5-0.9-2.5-1.1c-0.4-0.5-1-1-1.9-1.5c-1.6-0.8-3.5-1.2-5.3-0.9h-0.4 c-0.1,0-0.2,0.1-0.4,0.1c0.2,0,1,0.4,1.6,0.6c-0.3,0.2-0.8,0.2-1.1,0.4c0,0,0,0-0.1,0L15.7,14c-0.1,0.2-0.2,0.4-0.2,0.5 c1.3-0.1,3.2,0,4.6,0.4C19,15,18,15.3,17.3,15.7c-0.5,0.3-1,0.6-1.3,1.1c-1.2,1.3-1.7,3.5-1.3,5.9c0.5,2.7,2.4,11.4,3.4,16.3 l0.3,1.6c0,0,3.5,0.4,5.6,0.4c1.2,0,3.2,0.3,3.7-0.2c-0.1,0-0.6-0.6-0.8-1.1c-0.5-1-1-1.9-1.4-2.6c-1.2-2.5-2.5-5.9-1.9-8.1 c0.1-0.4,0.1-2.1,0.4-2.3c2.6-1.7,2.4-0.1,3.5-0.8c0.5-0.4,1-0.9,1.2-1.5C29.4,22.1,27.8,18,26,16.2z"/>
    <path fill="#534AB7" d="M19,21.1c-0.6,0-1.2,0.5-1.2,1.2c0,0.6,0.5,1.2,1.2,1.2c0.6,0,1.2-0.5,1.2-1.2 C20.1,21.7,19.6,21.1,19,21.1z M19.5,22.2c-0.2,0-0.3-0.1-0.3-0.3c0-0.2,0.1-0.3,0.3-0.3s0.3,0.1,0.3,0.3 C19.8,22.1,19.6,22.2,19.5,22.2z M26.8,20.6c-0.6,0-1,0.5-1,1c0,0.6,0.5,1,1,1c0.6,0,1-0.5,1-1S27.3,20.6,26.8,20.6z M27.2,21.5 c-0.1,0-0.3-0.1-0.3-0.3c0-0.1,0.1-0.3,0.3-0.3c0.1,0,0.3,0.1,0.3,0.3S27.4,21.5,27.2,21.5z M19.3,18.9c0,0-0.9-0.4-1.7,0.1 c-0.9,0.5-0.8,1.1-0.8,1.1s-0.5-1,0.8-1.5C18.7,18.1,19.3,18.9,19.3,18.9 M27.4,18.8c0,0-0.6-0.4-1.1-0.4c-1,0-1.3,0.5-1.3,0.5 s0.2-1.1,1.5-0.9C27.1,18.2,27.4,18.8,27.4,18.8"/>
    <path fill="#CECBF6" d="M23.3,35.7c0,0-4.3-2.3-4.4-1.4c-0.1,0.9,0,4.7,0.5,5s4.1-1.9,4.1-1.9L23.3,35.7z M25,35.6 c0,0,2.9-2.2,3.6-2.1c0.6,0.1,0.8,4.7,0.2,4.9c-0.6,0.2-3.9-1.2-3.9-1.2L25,35.6z"/>
    <path fill="#534AB7" d="M22.5,35.7c0,1.5-0.2,2.1,0.4,2.3c0.6,0.1,1.9,0,2.3-0.3c0.4-0.3,0.1-2.2-0.1-2.6 C25,34.8,22.5,35.1,22.5,35.7"/>
    <path fill="#7F77DD" d="M22.3,26.8c0.1-0.7,2-2.1,3.3-2.2c1.3-0.1,1.7-0.1,2.8-0.3c1.1-0.3,3.9-1,4.7-1.3 c0.8-0.4,4.1,0.2,1.8,1.5c-1,0.6-3.7,1.6-5.7,2.2c-1.9,0.6-3.1-0.6-3.8,0.4c-0.5,0.8-0.1,1.8,2.2,2c3.1,0.3,6.2-1.4,6.5-0.5 c0.3,0.9-2.7,2-4.6,2.1c-1.8,0-5.6-1.2-6.1-1.6C22.9,28.7,22.2,27.8,22.3,26.8"/>
  </svg>
</svg>`;

