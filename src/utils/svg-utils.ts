// ============================================================================
// SVG UTILITIES
// Provides a centralized way to parse and normalize trusted SVG strings
// for insertion into the DOM.
//
// WARNING: No sanitization is performed. Only use with trusted SVG content
// (hardcoded constants or files from the plugin's own icons/ folder).
// ============================================================================

/**
 * Parses a trusted SVG string and optionally normalizes it for use as an icon.
 *
 * When `asIcon` is true, the SVG is prepared for consistent icon rendering:
 * - Adds the `svg-icon` class
 * - Generates a `viewBox` from width/height if missing
 * - Removes explicit width/height so CSS controls sizing
 *
 * WARNING: No security sanitization is applied. Only pass trusted SVG content
 * (e.g. hardcoded constants from format-thumbs.ts or files from the plugin's
 * own icons/ folder). Never pass untrusted or user-generated SVG input.
 *
 * @param svgString A trusted SVG markup string.
 * @param asIcon Whether to normalize the SVG for icon usage.
 */
export function sanitizeSvg(svgString: string, asIcon: boolean = false): SVGSVGElement | null {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');

    const svgEl = doc.documentElement;
    if (svgEl && svgEl.tagName.toLowerCase() === 'svg') {
        if (asIcon) {
            svgEl.classList.add('svg-icon');
            
            // If the SVG lacks a viewBox, removing width/height will make it disappear.
            // We must convert explicit dimensions into a viewBox first.
            if (!svgEl.hasAttribute('viewBox')) {
                const w = svgEl.getAttribute('width');
                const h = svgEl.getAttribute('height');
                if (w && h) {
                    const wn = parseFloat(w);
                    const hn = parseFloat(h);
                    if (!isNaN(wn) && !isNaN(hn)) {
                        svgEl.setAttribute('viewBox', `0 0 ${wn} ${hn}`);
                    }
                }
            }

            svgEl.removeAttribute('width');
            svgEl.removeAttribute('height');
        }
        return svgEl as unknown as SVGSVGElement;
    }
    return null;
}

export function insertSvg(container: HTMLElement, svgString: string, asIcon: boolean = false): void {
    const svgEl = sanitizeSvg(svgString, asIcon);
    if (svgEl) {
        container.appendChild(svgEl);
    }
}
