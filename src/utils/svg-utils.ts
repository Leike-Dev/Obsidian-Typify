// ============================================================================
// SVG UTILITIES
// Provides a safe, centralized way to insert trusted static SVG strings
// into the DOM without using innerHTML directly on live elements.
// ============================================================================

/**
 * Safely inserts a trusted static SVG string into a container element.
 *
 * Uses a `<template>` element whose content is an inert DocumentFragment,
 * avoiding the overhead of DOMParser (which creates a full Document per call)
 * and preventing any script execution from the parsed content.
 *
 * IMPORTANT: Only use with trusted, hardcoded SVG constants (e.g. from
 * format-thumbs.ts). Never pass user-generated input to this function.
 *
 * @param container The parent element to receive the SVG nodes.
 * @param svgString A trusted SVG markup string.
 */
export function sanitizeSvg(svgString: string, asIcon: boolean = false): SVGSVGElement | null {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    
    // Agressive sanitization
    const forbiddenTags = ['script', 'foreignobject', 'style', 'iframe', 'object', 'embed'];
    forbiddenTags.forEach(tag => {
        doc.querySelectorAll(tag).forEach(el => el.remove());
    });

    doc.querySelectorAll('*').forEach(el => {
        const attrs = el.attributes;
        for (let i = attrs.length - 1; i >= 0; i--) {
            if (attrs[i]!.name.toLowerCase().startsWith('on')) {
                el.removeAttribute(attrs[i]!.name);
            }
        }
    });

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
